"""
AlignSpace — Pipeline orchestrator.

Wires the 5 MVP agents into the sequence the architecture describes:

    intent  ->  match  ->  [user picks a direction]  ->  assemble  ->  budget  ->  document

Each stage emits a progress event via an optional `on_stage` callback. In
production that callback publishes to Redis pub/sub, which Socket.io relays to
the designer dashboard ("Extracting intent...", "Matching presets...", etc.).
Here it just prints, so the same code drives the demo and the real app.

The flow is intentionally two-phase to match the product:
  Phase A (run_intake)        -> show the client 6 directions to choose from.
  Phase B (run_for_direction) -> after they pick, build + price + document it.

Each function below is a pure, testable node. Swapping this sequential runner
for a LangGraph StateGraph later means registering these same functions as
nodes — no rewrite of the agents themselves.
"""

from __future__ import annotations

from typing import Callable, Optional

from .models import ClientBrief, ClientProfile, DesignDirection, RenovationPackage
from . import agents

StageHook = Optional[Callable[[str, str], None]]


def _emit(hook: StageHook, stage: str, message: str) -> None:
    if hook:
        hook(stage, message)


def run_intake(brief: ClientBrief, on_stage: StageHook = None):
    """Phase A: extract intent and rank the 6 directions."""
    _emit(on_stage, "intent", "Extracting design intent...")
    profile = agents.extract_intent(brief)

    _emit(on_stage, "matching", "Matching style directions...")
    directions = agents.match_directions(profile)

    return profile, directions


def run_for_direction(
    brief: ClientBrief,
    profile: ClientProfile,
    direction: DesignDirection,
    on_stage: StageHook = None,
) -> RenovationPackage:
    """Phase B: build, budget-check, and document one chosen direction."""
    _emit(on_stage, "assembly", f"Assembling materials for {direction.name}...")
    package = agents.assemble_package(direction, profile, brief.room_sqft)

    _emit(on_stage, "budget", "Validating budget...")
    budget = agents.validate_budget(package, profile)

    _emit(on_stage, "document", "Generating deliverable...")
    deliverable = agents.generate_deliverable(
        brief.project_id, brief.firm_id, profile, direction, package, budget,
    )

    _emit(on_stage, "done", "Pipeline complete.")
    return deliverable


def run_pipeline(
    brief: ClientBrief,
    chosen_direction_key: Optional[str] = None,
    on_stage: StageHook = None,
):
    """
    Convenience runner for demos / tests: runs the whole arc end to end.
    If no direction is chosen, it auto-selects the top-ranked one.

    Returns (profile, directions, deliverable).
    """
    profile, directions = run_intake(brief, on_stage)

    chosen = directions[0]
    if chosen_direction_key:
        chosen = next((d for d in directions if d.key == chosen_direction_key), directions[0])

    deliverable = run_for_direction(brief, profile, chosen, on_stage)
    return profile, directions, deliverable
