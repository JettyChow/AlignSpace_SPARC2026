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

# Functional needs the assembly stage can act on.
_FUNCTION_KEYWORDS = {
    "storage": "more storage", "cabinet": "more storage", "shelf": "more storage",
    "double": "double vanity", "two sink": "double vanity",
    "shower": "walk-in shower", "rain": "rain shower",
    "tub": "bathtub", "bath": "bathtub",
    "accessible": "accessibility", "grab bar": "accessibility",
    "clean": "easy to clean", "low maintenance": "easy to clean",
}


# Dollar amounts in free text, e.g. "$50k", "under $50,000", "50k budget",
# "about 120 grand". Used by the offline fallback and as a backstop when the
# form didn't capture a numeric budget.
_MONEY_RE = re.compile(
    r"\$\s*(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s*(k|m|grand)?"
    r"|(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s*(k|m|grand)\b",
    re.IGNORECASE,
)

_MULT = {"k": 1_000, "grand": 1_000, "m": 1_000_000}


def parse_budget_max(text: str) -> float | None:
    """
    Pull the client's stated budget (USD) out of free text, if any.

    Takes the largest amount mentioned — "somewhere between $30k and $50k"
    reads as a $50k ceiling. Amounts under $1,000 are ignored as noise
    (quantities, "$40/sqft" unit prices, etc.).
    """
    best = None
    for m in _MONEY_RE.finditer(text or ""):
        num = m.group(1) or m.group(3)
        suffix = (m.group(2) or m.group(4) or "").lower()
        value = float(num.replace(",", "")) * _MULT.get(suffix, 1)
        if value >= 1_000 and (best is None or value > best):
            best = value
    return best


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
        if kw in text:
            styles[style] = styles.get(style, 0) + 1.0

    functions: list[str] = []
    for kw, fn in _FUNCTION_KEYWORDS.items():
        if kw in text and fn not in functions:
            functions.append(fn)
    for p in brief.priorities:
        if p and p not in functions:
            functions.append(p)

    avoid: list[str] = []
    for marker in ("no ", "not ", "avoid ", "hate ", "don't want "):
        idx = text.find(marker)
        if idx != -1:
            avoid.append(text[idx:idx + 40].strip())

    return ClientProfile(
        styles=_normalize(styles),
        functions=functions,
        must_haves=list(brief.priorities),
        avoid=avoid,
        budget_band=brief.budget_band,
        budget_max=brief.budget_max or parse_budget_max(text),
        extraction_source="rule_based",
        notes="Extracted with offline keyword model (no Claude key present).",
    )


_SYSTEM_PROMPT = (
    "You extract structured interior-design intent for a bathroom renovation. "
    "Return ONLY valid JSON, no prose, no markdown fences. Schema:\n"
    '{"styles": {"<style>": <0..1 float>}, "functions": ["..."], '
    '"must_haves": ["..."], "avoid": ["..."], "budget_max": <USD number or null>}\n'
    f"Use only these style words: {', '.join(STYLE_VOCAB)}. "
    "Weights are relative importance, strongest = 1.0. "
    "budget_max is the client's stated total project budget in USD "
    "('under $50k' -> 50000); null if they never gave a figure."
)


def _as_float(value) -> float | None:
    """Coerce the model's budget_max to a positive float, else None."""
    try:
        f = float(value)
        return f if f > 0 else None
    except (TypeError, ValueError):
        return None


def _claude(brief: ClientBrief) -> ClientProfile:
    """LLM path — used only when ANTHROPIC_API_KEY is set."""
    import anthropic  # imported lazily so the package has no hard dependency

    client = anthropic.Anthropic()
    user = (
        f"Room: {brief.room_type}\nBudget band: {brief.budget_band}\n"
        + (f"Stated budget: ${brief.budget_max:,.0f}\n" if brief.budget_max else "")
        + f"Style chips: {', '.join(brief.style_chips) or 'none'}\n"
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
        # Form input is authoritative; the model's read of the chat fills in
        # when the form didn't capture a number; regex is the last resort.
        budget_max=brief.budget_max
        or _as_float(data.get("budget_max"))
        or parse_budget_max(brief.chat_text),
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
