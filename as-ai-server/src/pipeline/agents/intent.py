"""
AGENT 1 — Intent Extraction.

Turns a messy ClientBrief (chat text + chips + budget) into a structured
ClientProfile. This is the Week 3 deliverable and the heart of the pipeline.

Strategy:
  - If ANTHROPIC_API_KEY is set, call Claude and ask for strict JSON.
  - Otherwise fall back to a deterministic keyword extractor so the pipeline
    is always runnable (demos, CI, local dev with no key/credits).

The two paths return the *same* ClientProfile shape, so nothing downstream
cares which one ran. The `extraction_source` field records which was used.
"""

from __future__ import annotations

import json
import os
import re

from ..models import ClientBrief, ClientProfile

# Model for intent extraction. Defaults to Haiku: this is a cheap, high-volume
# structured-extraction task, so the fast/inexpensive model is the right call.
# Override with ALIGNSPACE_INTENT_MODEL (e.g. claude-sonnet-4-6) if you want more.
INTENT_MODEL = os.environ.get("ALIGNSPACE_INTENT_MODEL", "claude-haiku-4-5-20251001")

# Style vocabulary the rest of the pipeline understands.
STYLE_VOCAB = [
    "modern", "minimal", "warm", "natural", "calm", "luxe",
    "classic", "clean", "cool", "light", "contemporary", "functional",
]

# Keyword -> style weights, used by the offline fallback extractor.
_STYLE_KEYWORDS = {
    "modern": "modern", "contemporary": "contemporary", "sleek": "modern",
    "minimal": "minimal", "minimalist": "minimal", "simple": "minimal", "clean": "clean",
    "warm": "warm", "cozy": "warm", "inviting": "warm",
    "natural": "natural", "wood": "natural", "stone": "natural", "organic": "natural",
    "calm": "calm", "spa": "calm", "relaxing": "calm", "serene": "calm", "peaceful": "calm",
    "luxury": "luxe", "luxe": "luxe", "high-end": "luxe", "premium": "luxe", "elegant": "luxe",
    "classic": "classic", "traditional": "classic", "timeless": "classic",
    "bright": "light", "airy": "light", "white": "light",
    "scandi": "minimal", "japandi": "natural", "industrial": "cool",
}

# Functional needs the assembly stage can act on. Keys are matched as whole
# words, so "bath" alone would still fire on "primary bath" but never inside
# "bathroom"; we key on tub words only to avoid that ambiguity. Likewise
# "easy to clean" is spelled out so style talk ("clean lines") doesn't
# register a maintenance requirement.
_FUNCTION_KEYWORDS = {
    "storage": "more storage", "cabinet": "more storage", "shelf": "more storage",
    "double": "double vanity", "two sink": "double vanity",
    "shower": "walk-in shower", "rain": "rain shower",
    "tub": "bathtub", "bathtub": "bathtub", "soaking": "bathtub",
    "accessible": "accessibility", "grab bar": "accessibility",
    "easy to clean": "easy to clean", "low maintenance": "easy to clean",
}

# Dislikes: the phrase after an explicit negation lead-in. Word-bounded so
# "cannot" never triggers, and bare "not" is deliberately excluded — "money is
# not really an issue" is emphasis, not a dislike.
_AVOID_RE = re.compile(
    r"\b(?:avoid|hate|without|no|(?:don'?t|do not|doesn'?t|does not)\s+(?:want|like))\s+"
    r"([a-z][a-z0-9' -]{2,40})"
)


def _has_word(kw: str, text: str) -> bool:
    """Whole-word/phrase match: 'bath' must not fire inside 'bathroom'."""
    return re.search(rf"\b{re.escape(kw)}\b", text) is not None


def _normalize(weights: dict[str, float]) -> dict[str, float]:
    """Scale style weights so the strongest signal sits at 1.0."""
    if not weights:
        return {}
    top = max(weights.values())
    return {k: round(v / top, 2) for k, v in sorted(weights.items(), key=lambda x: -x[1])}


def _rule_based(brief: ClientBrief) -> ClientProfile:
    """Deterministic fallback extractor — no LLM required."""
    text = f"{brief.chat_text} {' '.join(brief.style_chips)} {' '.join(brief.priorities)}".lower()

    styles: dict[str, float] = {}
    # Chips are explicit, so they count double.
    for chip in brief.style_chips:
        s = _STYLE_KEYWORDS.get(chip.lower().strip())
        if s:
            styles[s] = styles.get(s, 0) + 2.0
    # Free text keywords count single.
    for kw, style in _STYLE_KEYWORDS.items():
        if _has_word(kw, text):
            styles[style] = styles.get(style, 0) + 1.0

    functions: list[str] = []
    for kw, fn in _FUNCTION_KEYWORDS.items():
        if _has_word(kw, text) and fn not in functions:
            functions.append(fn)
    for p in brief.priorities:
        if p and p not in functions:
            functions.append(p)

    avoid: list[str] = []
    for m in _AVOID_RE.finditer(text):
        phrase = m.group(1).strip()
        if phrase and phrase not in avoid:
            avoid.append(phrase)

    return ClientProfile(
        styles=_normalize(styles),
        functions=functions,
        must_haves=list(brief.priorities),
        avoid=avoid,
        budget_band=brief.budget_band,
        extraction_source="rule_based",
        notes="Extracted with offline keyword model (no Claude key present).",
    )


_SYSTEM_PROMPT = (
    "You extract structured interior-design intent for a bathroom renovation. "
    "Return ONLY valid JSON, no prose, no markdown fences. Schema:\n"
    '{"styles": {"<style>": <0..1 float>}, "functions": ["..."], '
    '"must_haves": ["..."], "avoid": ["..."]}\n'
    f"Use only these style words: {', '.join(STYLE_VOCAB)}. "
    "Weights are relative importance, strongest = 1.0."
)


def _claude(brief: ClientBrief) -> ClientProfile:
    """LLM path — used only when ANTHROPIC_API_KEY is set."""
    import anthropic  # imported lazily so the package has no hard dependency

    client = anthropic.Anthropic()
    user = (
        f"Room: {brief.room_type}\nBudget band: {brief.budget_band}\n"
        f"Style chips: {', '.join(brief.style_chips) or 'none'}\n"
        f"Priorities: {', '.join(brief.priorities) or 'none'}\n"
        f'Client said: "{brief.chat_text}"'
    )
    msg = client.messages.create(
        model=INTENT_MODEL,
        max_tokens=600,
        system=_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user}],
    )
    raw = "".join(b.text for b in msg.content if getattr(b, "type", "") == "text").strip()
    raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    data = json.loads(raw)

    return ClientProfile(
        styles=_normalize({k: float(v) for k, v in data.get("styles", {}).items()}),
        functions=list(data.get("functions", [])),
        must_haves=list(data.get("must_haves", brief.priorities)),
        avoid=list(data.get("avoid", [])),
        budget_band=brief.budget_band,
        extraction_source="claude",
        notes="Extracted with Claude API.",
    )


def extract_intent(brief: ClientBrief) -> ClientProfile:
    """Public entry point. Tries Claude, falls back to rules on any failure."""
    if os.environ.get("ANTHROPIC_API_KEY"):
        try:
            return _claude(brief)
        except Exception as e:  # network down, bad JSON, no credits, etc.
            profile = _rule_based(brief)
            profile.notes = f"Claude call failed ({type(e).__name__}); used offline fallback."
            return profile
    return _rule_based(brief)
