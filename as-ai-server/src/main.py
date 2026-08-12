"""
AlignSpace — AI Pipeline service (FastAPI).

This is the HTTP surface for Engineer 3's pipeline. The backend (Engineer 2)
calls these routes; the pipeline runs the 5 MVP agents and returns structured,
designer-ready JSON.

Routes
------
GET  /health              liveness probe (required by app.yaml health_check)
GET  /presets/directions  the 6 bathroom directions (renderable before intake)
POST /intake              Phase A: intent extraction + 6 ranked directions
POST /assemble            Phase B: build + budget-check + document one direction
POST /pipeline/run        whole arc end to end (auto-picks top direction if none)

Run locally
-----------
    uvicorn main:app --app-dir src --reload --port 8000

Intent extraction uses Claude when ANTHROPIC_API_KEY is set, and a deterministic
offline fallback otherwise — so this service runs in CI and on a laptop with no
key, and "lights up" the moment a key is present.
"""

from __future__ import annotations

import os
from dataclasses import asdict

from fastapi import FastAPI, HTTPException

from api_schemas import BriefRequest, AssembleRequest, PipelineRequest
from pipeline import run_intake, run_for_direction
from pipeline.agents import match_directions
from pipeline.presets import DIRECTIONS

app = FastAPI(
    title="AlignSpace AI Pipeline",
    version="0.1.0",
    description="Turns a messy client brief into a structured renovation package.",
)


@app.get("/health")
def health() -> dict:
    """Liveness probe. app.yaml points the backend health_check here."""
    return {
        "status": "ok",
        "service": "ai-pipeline",
        "intent_source": "claude" if os.environ.get("ANTHROPIC_API_KEY") else "offline_fallback",
    }


@app.get("/presets/directions")
def list_directions() -> dict:
    """The 6 design directions. Frontend can render these before any intake."""
    return {"directions": DIRECTIONS}


@app.post("/intake")
def intake(req: BriefRequest) -> dict:
    """
    Phase A. Extract intent and rank the 6 directions.

    Returns the structured profile plus the 6 cards the client chooses from.
    """
    brief = req.to_brief()
    profile, directions = run_intake(brief)
    return {
        "profile": asdict(profile),
        "directions": [asdict(d) for d in directions],
    }


@app.post("/assemble")
def assemble(req: AssembleRequest) -> dict:
    """
    Phase B. The client picked a direction; build the priced material package,
    run the budget check, and generate the deliverable.

    When the caller passes back the profile from /intake we reuse it — no
    second Claude call, and assembly stays consistent with the directions the
    client was actually shown. Without it we re-extract from the brief.
    """
    brief = req.brief.to_brief()
    if req.profile is not None:
        profile = req.profile.to_profile()
        directions = match_directions(profile)
    else:
        profile, directions = run_intake(brief)

    chosen = next((d for d in directions if d.key == req.direction_key), None)
    if chosen is None:
        valid = ", ".join(d.key for d in directions)
        raise HTTPException(
            status_code=422,
            detail=f"Unknown direction_key '{req.direction_key}'. Valid keys: {valid}",
        )

    deliverable = run_for_direction(brief, profile, chosen)
    return deliverable.to_dict()


@app.post("/pipeline/run")
def pipeline_run(req: PipelineRequest) -> dict:
    """
    Whole arc in one call (handy for the demo and integration tests).
    If no direction_key is given, auto-selects the top-ranked direction.
    """
    brief = req.brief.to_brief()
    profile, directions = run_intake(brief)

    chosen = directions[0]
    if req.direction_key:
        match = next((d for d in directions if d.key == req.direction_key), None)
        if match is None:
            valid = ", ".join(d.key for d in directions)
            raise HTTPException(
                status_code=422,
                detail=f"Unknown direction_key '{req.direction_key}'. Valid keys: {valid}",
            )
        chosen = match

    deliverable = run_for_direction(brief, profile, chosen)
    return {
        "profile": asdict(profile),
        "directions": [asdict(d) for d in directions],
        "deliverable": deliverable.to_dict(),
    }
