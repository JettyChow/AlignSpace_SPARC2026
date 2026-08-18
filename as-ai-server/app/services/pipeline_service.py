import os
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException

from app.services import project_service
from app.services.project_store import _money_number


load_dotenv()

SOCKET_EVENTS = [
    "preferences_complete",
    "matching_styles",
    "directions_ready"
]

AI_PIPELINE_URL = os.getenv("AI_PIPELINE_URL", "http://localhost:8000").rstrip("/")
AI_PIPELINE_TIMEOUT_SECONDS = float(os.getenv("AI_PIPELINE_TIMEOUT_SECONDS", "20"))


def _pipeline_request(path: str, payload: dict[str, Any]) -> dict[str, Any]:
    """Call the separately deployed AI pipeline and normalize upstream failures."""
    try:
        response = httpx.post(
            f"{AI_PIPELINE_URL}{path}", json=payload, timeout=AI_PIPELINE_TIMEOUT_SECONDS
        )
        response.raise_for_status()
        return response.json()
    except httpx.ConnectError as exc:
        raise HTTPException(
            status_code=503,
            detail="AI pipeline is unavailable. Start it or set AI_PIPELINE_URL.",
        ) from exc
    except httpx.TimeoutException as exc:
        raise HTTPException(status_code=504, detail="AI pipeline request timed out.") from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail="AI pipeline request failed.") from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI pipeline returned {exc.response.status_code} for {path}: "
                   f"{exc.response.text[:300]}",
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI pipeline returned a non-JSON {response.status_code} response "
                   f"for {path} — check AI_PIPELINE_URL points at the pipeline service.",
        ) from exc


def _pipeline_get(path: str) -> dict[str, Any]:
    """GET helper for lightweight AI pipeline proxy endpoints."""
    try:
        response = httpx.get(
            f"{AI_PIPELINE_URL}{path}", timeout=AI_PIPELINE_TIMEOUT_SECONDS
        )
        response.raise_for_status()
        return response.json()
    except httpx.ConnectError as exc:
        raise HTTPException(
            status_code=503,
            detail="AI pipeline is unavailable. Start it or set AI_PIPELINE_URL.",
        ) from exc
    except httpx.TimeoutException as exc:
        raise HTTPException(status_code=504, detail="AI pipeline request timed out.") from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail="AI pipeline request failed.") from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI pipeline returned {exc.response.status_code} for {path}: "
                   f"{exc.response.text[:300]}",
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI pipeline returned a non-JSON {response.status_code} response "
                   f"for {path} — check AI_PIPELINE_URL points at the pipeline service.",
        ) from exc


def proxy_pipeline_get(path: str) -> dict[str, Any]:
    return _pipeline_get(path)


def proxy_pipeline_post(path: str, payload: dict[str, Any]) -> dict[str, Any]:
    return _pipeline_request(path, payload)


def _budget_band(value: Any) -> str:
    value = str(value or "medium").strip().lower()
    return value if value in {"low", "medium", "high"} else "medium"


def _band_from_budget_max(budget_max: float) -> str:
    """Same buckets as the frontend's bandFromBudget (IntakeScreen.jsx)."""
    if budget_max <= 50_000:
        return "low"
    if budget_max <= 100_000:
        return "medium"
    return "high"


def _build_brief(project: dict[str, Any]) -> dict[str, Any]:
    preferences = project["preferences"]
    messages = project.get("chat_messages", [])

    # Prefer the numeric field; fall back to parsing the legacy free-text
    # `budget` string ("$50,000") so older payloads still carry a figure.
    budget_max = preferences.get("budget_max") or _money_number(preferences.get("budget"))

    # When a real figure exists, derive the band from it (same buckets the
    # frontend uses) instead of trusting a stored band that may predate a
    # budget correction — the band drives product-tier selection while the
    # figure drives the ceiling, so they must not disagree.
    if budget_max:
        budget_band = _band_from_budget_max(budget_max)
    else:
        budget_band = _budget_band(preferences.get("budget_band") or preferences.get("budget"))

    # The stored priorities list, not the scope/goal aliases — create_project
    # sets both aliases to priorities[0], which duplicated the first priority
    # and dropped the rest.
    priorities = list(preferences.get("priorities") or [])
    if not priorities:
        priorities = [v for v in dict.fromkeys(
            (preferences.get("scope"), preferences.get("goal"))) if v]

    return {
        "firm_id": project.get("firm_id", "firm_default"),
        "project_id": str(project["project_id"]),
        "room_type": preferences.get("room_type") or project.get("room_type") or "bathroom",
        "room_sqft": preferences.get("room_sqft") or 40,
        "budget_band": budget_band,
        "budget_max": budget_max,
        "timeline_weeks": preferences.get("timeline_weeks"),
        "priorities": priorities,
        "style_chips": preferences.get("style_tags") or [],
        "chat_text": "\n".join(
            message.get("message") if isinstance(message, dict) else message.message
            for message in messages
        ),
    }


def _directions_for_backend(directions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "direction_id": index,
            "pipeline_direction_key": direction["key"],
            "title": direction["name"],
            "blurb": direction["blurb"],
            "cost_range": f"${direction['est_low']:,.0f}-${direction['est_high']:,.0f}",
            "match_percent": round(direction["match_score"] * 100),
            "tags": direction["style_tags"],
        }
        for index, direction in enumerate(directions, start=1)
    ]


def _materials_for_backend(line_items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "material_id": index,
            "name": item["product_name"],
            "category": item["category"],
            "price": item["subtotal"],
            "status": "tbd",
            "tier": item["tier"],
            "quantity": item["quantity"],
            "unit": item["unit"],
            "confidence": item["confidence"],
            "flagged": item["flagged"],
            "flag_reason": item["flag_reason"],
        }
        for index, item in enumerate(line_items, start=1)
    ]


def _alternatives_for_backend(swaps: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "material_id": index,
            "name": swap["to_product"],
            "category": swap["category"],
            "price": swap["savings"],
            "status": "alternative",
            "replaces": swap["from_product"],
            "savings": swap["savings"],
        }
        for index, swap in enumerate(swaps, start=1)
    ]


def generate_project(project_id: int):
    project = project_service.get_project(project_id)

    project["status"] = "processing"

    project["generation_status"] = {
        "status": "processing",
        "current_step": "matching_styles",
        "progress_percent": 50,
        "events": SOCKET_EVENTS[:2]
    }

    brief = _build_brief(project)
    intake = _pipeline_request("/intake", brief)
    if not isinstance(intake.get("directions"), list) or not isinstance(intake.get("profile"), dict):
        raise HTTPException(status_code=502, detail="AI pipeline intake response is incomplete.")

    try:
        directions = _directions_for_backend(intake["directions"])
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="AI pipeline intake response is invalid.") from exc

    project["ai_brief"] = brief
    project["ai_profile"] = intake["profile"]
    project["directions"] = directions
    project["materials"] = []
    project["alternatives"] = []

    project["generation_status"] = {
        "status": "complete",
        "current_step": "directions_ready",
        "progress_percent": 100,
        "events": SOCKET_EVENTS
    }

    project["status"] = "directions_ready"
    project["updated_at"] = project_service.get_timestamp()
    project_service.save_project(project)

    return {
        "status": "generation complete",
        "project_id": project_id,
        "directions": project["directions"],
        "profile": project["ai_profile"],
    }


def assemble_project_direction(project_id: int, direction: dict[str, Any]) -> dict[str, Any]:
    project = project_service.get_project(project_id)
    if not project.get("ai_brief"):
        raise HTTPException(status_code=400, detail="Generate directions before selecting one.")

    # Rebuild from current preferences instead of replaying the snapshot
    # frozen at /generate time — otherwise a budget (or any preference)
    # corrected after generation never reaches the budget agent.
    brief = _build_brief(project)
    project["ai_brief"] = brief

    deliverable = _pipeline_request(
        "/assemble",
        {"brief": brief, "direction_key": direction["pipeline_direction_key"]},
    )
    package = deliverable.get("package")
    budget = deliverable.get("budget")
    if not isinstance(package, dict) or not isinstance(budget, dict):
        raise HTTPException(status_code=502, detail="AI pipeline assembly response is incomplete.")

    try:
        materials = _materials_for_backend(package.get("line_items", []))
        alternatives = _alternatives_for_backend(budget.get("suggested_swaps", []))
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="AI pipeline assembly response is invalid.") from exc

    project["selected_direction"] = direction
    project["materials"] = materials
    project["alternatives"] = alternatives
    project["ai_budget"] = budget
    project["ai_deliverable"] = deliverable
    project["status"] = "direction_selected"
    project["updated_at"] = project_service.get_timestamp()
    project_service.save_project(project)
    return deliverable


def get_project_status(project_id: int):
    project = project_service.get_project(project_id)

    return {
        "project_id": project_id,
        "status": project.get("status"),
        "generation_status": project.get(
            "generation_status",
            {
                "status": "not_started",
                "current_step": None,
                "progress_percent": 0,
                "events": []
            }
        )
    }
