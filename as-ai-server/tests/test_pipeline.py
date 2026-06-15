"""
Core pipeline tests. These run fully offline (no API key) against the
deterministic fallback, so CI is stable and fast.
"""

from __future__ import annotations

from pipeline import ClientBrief, run_intake, run_for_direction, run_pipeline
from pipeline.presets import DIRECTIONS, BUDGET_CEILINGS


def _brief(**overrides) -> ClientBrief:
    base = dict(
        firm_id="firm_test",
        project_id="proj_test",
        room_sqft=45,
        budget_band="medium",
        priorities=["more storage"],
        style_chips=["warm", "minimal"],
        chat_text="calm spa-like bathroom, natural wood, walk-in shower, timeless",
    )
    base.update(overrides)
    return ClientBrief(**base)


def test_intent_extraction_offline_produces_styles():
    profile, _ = run_intake(_brief())
    assert profile.extraction_source == "rule_based"
    assert profile.styles, "expected some style weights"
    # Strongest style should be normalized to 1.0.
    assert max(profile.styles.values()) == 1.0
    assert "more storage" in profile.functions


def test_matching_returns_six_ranked_directions():
    profile, directions = run_intake(_brief())
    assert len(directions) == len(DIRECTIONS) == 6
    scores = [d.match_score for d in directions]
    assert scores == sorted(scores, reverse=True), "directions must be ranked best-first"
    assert all(0.0 <= d.match_score <= 1.0 for d in directions)


def test_assembly_specs_every_category_with_quantities():
    profile, directions = run_intake(_brief())
    deliverable = run_for_direction(_brief(), profile, directions[0])
    items = deliverable.package.line_items
    assert len(items) == 9, "one line item per catalog category"
    # Tile quantities scale with room size; fixtures are single units.
    floor = next(i for i in items if i.category == "floor_tile")
    assert floor.quantity > 1
    faucet = next(i for i in items if i.category == "faucet")
    assert faucet.quantity == 1.0


def test_budget_within_for_medium_band():
    _, _, deliverable = run_pipeline(_brief(budget_band="medium"))
    b = deliverable.budget
    assert b.status == "within"
    assert b.estimated_total <= BUDGET_CEILINGS["medium"]


def test_budget_over_triggers_swaps_for_low_band_premium_taste():
    # Low budget but luxe/premium-leaning taste should blow the ceiling and
    # produce cost-reduction swaps.
    brief = _brief(
        budget_band="low",
        style_chips=["luxe", "premium"],
        chat_text="high-end luxury spa, marble, brass, top of the line everything",
    )
    _, _, deliverable = run_pipeline(brief, chosen_direction_key="organic_spa")
    b = deliverable.budget
    if b.status == "over":
        assert b.overage > 0
        assert b.suggested_swaps, "over-budget package should suggest swaps"
        assert b.adjusted_total <= b.estimated_total


def test_deliverable_has_markdown_and_round_trips_to_dict():
    _, _, deliverable = run_pipeline(_brief())
    assert deliverable.markdown.startswith("# Renovation Brief")
    d = deliverable.to_dict()
    assert d["project_id"] == "proj_test"
    assert d["firm_id"] == "firm_test"
    assert "package" in d and "budget" in d


def test_room_size_changes_tile_quantity_no_shared_state():
    """Guards against the old module-global room_sqft race condition."""
    profile, directions = run_intake(_brief(room_sqft=30))
    small = run_for_direction(_brief(room_sqft=30), profile, directions[0])
    large = run_for_direction(_brief(room_sqft=80), profile, directions[0])
    small_floor = next(i for i in small.package.line_items if i.category == "floor_tile")
    large_floor = next(i for i in large.package.line_items if i.category == "floor_tile")
    assert large_floor.quantity > small_floor.quantity
