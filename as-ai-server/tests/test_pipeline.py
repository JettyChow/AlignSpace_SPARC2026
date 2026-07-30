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


def test_budget_over_triggers_swaps_and_fits_after():
    # A luxe-leaning direction (Organic Spa) in a generous room on a medium
    # budget legitimately pulls several picks to premium and exceeds the ceiling.
    # That must trigger cost-reduction swaps that bring the total back under.
    brief = _brief(
        room_sqft=100,
        budget_band="medium",
        style_chips=["warm", "natural"],
        chat_text="warm natural spa, generous primary bath, wood and stone, walk-in rain shower",
    )
    _, _, deliverable = run_pipeline(brief, chosen_direction_key="organic_spa")
    b = deliverable.budget
    assert b.status == "over", "this scenario is designed to exceed the ceiling"
    assert b.overage > 0
    assert b.suggested_swaps, "over-budget package must suggest swaps"
    assert b.adjusted_total < b.estimated_total, "swaps must reduce the total"
    assert b.adjusted_total <= b.band_ceiling, "swaps should bring it under the ceiling"


def test_over_budget_flags_are_cost_warnings():
    # When picks land above the budget tier, each such line should be flagged
    # with a cost-confirmation reason (not generic noise).
    brief = _brief(
        room_sqft=100,
        budget_band="medium",
        style_chips=["warm", "natural"],
        chat_text="warm natural spa, generous primary bath, wood and stone, walk-in rain shower",
    )
    _, _, deliverable = run_pipeline(brief, chosen_direction_key="organic_spa")
    premium_lines = [i for i in deliverable.package.line_items if i.tier == "premium"]
    assert premium_lines, "expected some premium picks in this scenario"
    for line in premium_lines:
        assert line.flagged and "budget tier" in (line.flag_reason or "")


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


# --- Regression guards for the Claude-profile tier/score bug -----------------

def _claude_like_profile():
    """Mimics a rich profile from Claude intent extraction (many weighted styles)."""
    from pipeline import DesignDirection
    from pipeline.agents.assembly import assemble_package
    from pipeline.agents.matching import match_directions
    from pipeline.models import ClientProfile
    profile = ClientProfile(
        styles={"warm": 1.0, "calm": 1.0, "minimal": 0.94, "natural": 0.94,
                "functional": 0.89, "clean": 0.83, "light": 0.78, "classic": 0.72},
        functions=["storage", "walk-in shower", "easy cleaning"],
        budget_band="medium", extraction_source="claude",
    )
    return profile, match_directions, assemble_package


def test_rich_profile_is_not_score_diluted():
    """A detailed (many-style) profile should still score its best fit highly."""
    profile, match_directions, _ = _claude_like_profile()
    directions = match_directions(profile)
    assert directions[0].match_score >= 0.85, "best direction should score high, not be diluted"


def test_medium_budget_picks_standard_not_all_budget():
    """The core bug: a medium budget must not collapse to all-budget-tier picks."""
    profile, match_directions, assemble_package = _claude_like_profile()
    top = match_directions(profile)[0]
    pkg = assemble_package(top, profile, room_sqft=45)
    tiers = [i.tier for i in pkg.line_items]
    assert tiers.count("budget") <= 1, f"expected mostly standard tier, got {tiers}"
    # And we shouldn't be flagging nearly everything anymore.
    assert sum(1 for i in pkg.line_items if i.flagged) <= 2
