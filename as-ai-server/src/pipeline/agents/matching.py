"""
AGENT 3 — Preset Matching.

Scores all 6 bathroom directions against the client profile and returns them
ranked best-first, each with a quick estimated cost range.

(Agent 2, Memory Lookup, is excluded from the MVP per the MVP Definition —
no embeddings/pgvector yet. It would slot in right before this stage to bias
scores toward a returning client's past picks. Left as a documented no-op.)
"""

from __future__ import annotations

from ..models import ClientProfile, DesignDirection
from ..presets import DIRECTIONS, BUDGET_CEILINGS


def _score(profile_styles: dict[str, float], direction_tags: list[str]) -> float:
    """Weighted overlap between what the client wants and what the style is."""
    if not profile_styles:
        return 0.5  # no signal -> neutral
    hit = sum(profile_styles.get(tag, 0.0) for tag in direction_tags)
    possible = sum(profile_styles.values())
    return round(min(hit / possible, 1.0), 2) if possible else 0.5


def match_directions(profile: ClientProfile) -> list[DesignDirection]:
    """Return the 6 directions ranked by fit to the client profile."""
    ceiling = BUDGET_CEILINGS.get(profile.budget_band, BUDGET_CEILINGS["medium"])
    results: list[DesignDirection] = []

    for d in DIRECTIONS:
        score = _score(profile.styles, d["style_tags"])
        # Quick range: cheaper, more-functional looks sit lower in the band;
        # luxe-leaning looks sit higher. Real numbers come from assembly later.
        luxe_pull = 0.15 if "luxe" in d["style_tags"] else 0.0
        low = round(ceiling * (0.45 + luxe_pull), -1)
        high = round(ceiling * (0.85 + luxe_pull), -1)
        results.append(DesignDirection(
            key=d["key"], name=d["name"], blurb=d["blurb"],
            style_tags=d["style_tags"], match_score=score,
            est_low=low, est_high=high,
        ))

    results.sort(key=lambda x: x.match_score, reverse=True)
    return results
