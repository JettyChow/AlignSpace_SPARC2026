"""
AGENT 4 — Selection Assembly.

Given a chosen direction + the client profile, build a complete material
package: pick a concrete product for every category, compute quantities from
room size, price it, and attach a confidence score. Picks that need a human
eye get flagged for the designer (the "human-reviewed AI" principle).

How a product is chosen
-----------------------
Each product is tagged with style words. We score a product by the client's
*weighted* affinity for those tags (a style they care about a lot counts more
than one they barely mentioned), then anchor to the budget band's tier: on a
"medium" budget we default to standard-tier unless a product's style fit is
strong enough to justify moving a tier. This stops weak, generic tags (like
"clean") from quietly dragging every pick down to the cheapest option.

room_sqft is passed in explicitly (not held in module state) so the function is
pure and safe to call concurrently from the FastAPI server.
"""

from __future__ import annotations

from ..models import ClientProfile, DesignDirection, LineItem, MaterialPackage
from ..presets import CATALOG, BAND_TIER, TILE_WASTE, WALL_AREA_FACTOR

DEFAULT_ROOM_SQFT = 40.0

# How hard the budget band pulls picks toward its tier. Higher = the band's tier
# is a stronger default; a pricier/cheaper product only wins if its style fit
# beats the tier-appropriate one by more than this per tier-step.
TIER_ANCHOR = 0.40

# Below this weighted style affinity, the catalog just doesn't have a good match
# for this client -> flag for the designer.
WEAK_MATCH_THRESHOLD = 0.20

# Direction tags are an explicit client choice, so they count strongly when
# scoring products (merged into the style weights at this strength).
DIRECTION_TAG_WEIGHT = 0.9

_TIER_RANK = {"budget": 0, "standard": 1, "premium": 2}


def _quantity(category: str, room_sqft: float) -> float:
    """Derive how much of each item the room needs."""
    if category == "floor_tile":
        return round(room_sqft * TILE_WASTE, 1)
    if category == "wall_tile":
        return round(room_sqft * WALL_AREA_FACTOR * TILE_WASTE, 1)
    return 1.0  # everything else is a single fixture/job


def _style_weights(direction: DesignDirection, profile: ClientProfile) -> dict[str, float]:
    """Merge the client's weighted styles with the chosen direction's tags."""
    weights = dict(profile.styles)
    for tag in direction.style_tags:
        weights[tag] = max(weights.get(tag, 0.0), DIRECTION_TAG_WEIGHT)
    return weights


def _affinity(option: dict, style_weights: dict[str, float]) -> float:
    """Average of the client's weight for each of the product's style tags (0..1)."""
    tags = option["tags"]
    if not tags:
        return 0.0
    return sum(style_weights.get(t, 0.0) for t in tags) / len(tags)


def _pick_option(category: str, style_weights: dict[str, float], preferred_tier: str) -> tuple[dict, float]:
    """
    Choose the best product in a category.

    Selection score = style affinity - TIER_ANCHOR * (tiers away from the band).
    Returns (option, style_affinity) — note we return the *affinity*, not the
    tier-penalised score, so confidence reflects style fit, not the penalty.
    """
    pref = _TIER_RANK[preferred_tier]
    best, best_pick_score, best_affinity = None, -99.0, 0.0

    for opt in CATALOG[category]["options"]:
        affinity = _affinity(opt, style_weights)
        pick_score = affinity - TIER_ANCHOR * abs(_TIER_RANK[opt["tier"]] - pref)
        if pick_score > best_pick_score:
            best, best_pick_score, best_affinity = opt, pick_score, affinity

    return best, round(best_affinity, 2)


def _confidence(affinity: float, tier: str, preferred_tier: str) -> float:
    """
    Readable 0..1 confidence. Baseline reflects tier-appropriateness (are we on
    the band's tier?), plus up to +0.45 for style fit.
    """
    on_tier = _TIER_RANK[tier] == _TIER_RANK[preferred_tier]
    baseline = 0.55 if on_tier else 0.4
    return round(min(1.0, baseline + 0.45 * affinity), 2)


def assemble_package(
    direction: DesignDirection,
    profile: ClientProfile,
    room_sqft: float = DEFAULT_ROOM_SQFT,
) -> MaterialPackage:
    style_weights = _style_weights(direction, profile)
    preferred_tier = BAND_TIER.get(profile.budget_band, "standard")
    room_sqft = max(float(room_sqft), 1.0)

    items: list[LineItem] = []
    for category, spec in CATALOG.items():
        opt, affinity = _pick_option(category, style_weights, preferred_tier)
        qty = _quantity(category, room_sqft)
        subtotal = round(opt["unit_price"] * qty, 2)
        confidence = _confidence(affinity, opt["tier"], preferred_tier)

        # Flag only genuine concerns: a weak style match, or a pricier-than-band
        # pick (a cost surprise the designer should confirm). A cheaper-than-band
        # pick saves money and isn't flagged.
        flagged, reason = False, None
        if affinity < WEAK_MATCH_THRESHOLD:
            flagged = True
            reason = f"Limited style match for {category} in the catalog; designer to confirm."
        elif _TIER_RANK[opt["tier"]] > _TIER_RANK[preferred_tier]:
            flagged = True
            reason = (f"{opt['tier'].title()} pick above the '{profile.budget_band}' "
                      f"budget tier — confirm the cost with the client.")

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
