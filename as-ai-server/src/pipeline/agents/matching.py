"""
AGENT 3 — Preset Matching.

Scores all 6 bathroom directions against the client profile and returns them
ranked best-first, each with a quick estimated cost range.

Scoring note: we average the client's affinity across *the direction's own
style tags*, rather than dividing by the sum of all the client's style weights.
That keeps scores stable no matter how many styles intent extraction returns —
a richer profile (e.g. Claude returning 8 styles) shouldn't deflate every score
just because the denominator grew.

(Agent 2, Memory Lookup, is excluded from the MVP per the MVP Definition —
no embeddings/pgvector yet. It would slot in right before this stage to bias
scores toward a returning client's past picks. Left as a documented no-op.)
"""

from __future__ import annotations

from ..models import ClientProfile, DesignDirection
from ..presets import DIRECTIONS
from .budget import materials_ceiling


def _score(profile_styles: dict[str, float], direction_tags: list[str]) -> float:
    """
    How well the client's preferences line up with what this direction is about.

    For each style word the direction is defined by, look up how much the client
    wants it (0 if not mentioned) and average. Result is 0..1 and independent of
    how many *other* styles the client happens to have signalled.
    """
    if not profile_styles or not direction_tags:
        return 0.5  # no signal -> neutral
    score = sum(profile_styles.get(tag, 0.0) for tag in direction_tags) / len(direction_tags)
    return round(min(score, 1.0), 2)


def match_directions(profile: ClientProfile) -> list[DesignDirection]:
    """Return the 6 directions ranked by fit to the client profile."""
    ceiling, _ = materials_ceiling(profile)
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
