"""
AGENT 4 — Selection Assembly.

Given a chosen direction + the client profile, build a complete material
package: pick a concrete product for every category, compute quantities from
room size, price it, and attach a confidence score. Low-confidence picks get
flagged for the designer to review (the "human-reviewed AI" principle).

Note: room_sqft is passed in explicitly (not held in module state) so the
function is pure and safe to call concurrently from the FastAPI server.
"""

from __future__ import annotations

from ..models import ClientProfile, DesignDirection, LineItem, MaterialPackage
from ..presets import CATALOG, BAND_TIER, TILE_WASTE, WALL_AREA_FACTOR

CONFIDENCE_FLAG_THRESHOLD = 0.45  # below this, ask a human
DEFAULT_ROOM_SQFT = 40.0


def _quantity(category: str, room_sqft: float) -> float:
    """Derive how much of each item the room needs."""
    if category == "floor_tile":
        return round(room_sqft * TILE_WASTE, 1)
    if category == "wall_tile":
        return round(room_sqft * WALL_AREA_FACTOR * TILE_WASTE, 1)
    return 1.0  # everything else is a single fixture/job


def _pick_option(category: str, want_tags: set[str], preferred_tier: str) -> tuple[dict, float]:
    """
    Choose the best product in a category.

    Score = style-tag overlap with the direction/profile, with a penalty for
    drifting away from the budget band's preferred tier. Returns (option, confidence).
    """
    spec = CATALOG[category]
    tier_rank = {"budget": 0, "standard": 1, "premium": 2}
    pref = tier_rank[preferred_tier]

    best, best_score = None, -1.0
    for opt in spec["options"]:
        overlap = len(want_tags & set(opt["tags"]))
        tag_score = overlap / max(len(opt["tags"]), 1)
        tier_penalty = 0.18 * abs(tier_rank[opt["tier"]] - pref)
        score = tag_score - tier_penalty
        if score > best_score:
            best, best_score = opt, score

    # Squash to a readable 0..1 confidence.
    confidence = round(max(0.0, min(1.0, 0.5 + best_score)), 2)
    return best, confidence


def assemble_package(
    direction: DesignDirection,
    profile: ClientProfile,
    room_sqft: float = DEFAULT_ROOM_SQFT,
) -> MaterialPackage:
    want_tags = set(direction.style_tags) | set(profile.styles.keys())
    preferred_tier = BAND_TIER.get(profile.budget_band, "standard")
    room_sqft = max(float(room_sqft), 1.0)

    items: list[LineItem] = []
    for category, spec in CATALOG.items():
        opt, confidence = _pick_option(category, want_tags, preferred_tier)
        qty = _quantity(category, room_sqft)
        subtotal = round(opt["unit_price"] * qty, 2)

        flagged = confidence < CONFIDENCE_FLAG_THRESHOLD
        reason = None
        if flagged:
            reason = f"Weak style match for {category}; confirm with client."
        elif opt["tier"] != preferred_tier:
            flagged = True
            reason = (f"{opt['tier'].title()} pick in a '{profile.budget_band}' "
                      f"budget — verify the client is OK with the cost.")

        items.append(LineItem(
            category=category, product_name=opt["name"], tier=opt["tier"],
            unit=spec["unit"], unit_price=opt["unit_price"], quantity=qty,
            subtotal=subtotal, confidence=confidence,
            flagged=flagged, flag_reason=reason,
        ))

    total = round(sum(i.subtotal for i in items), 2)
    return MaterialPackage(
        direction_key=direction.key, direction_name=direction.name,
        line_items=items, estimated_total=total,
    )
