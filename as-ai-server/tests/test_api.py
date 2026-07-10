"""
API-level tests for the FastAPI service. Uses Starlette's TestClient, runs
offline. Verifies the HTTP contract the backend (Engineer 2) codes against.
"""

from __future__ import annotations

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


SAMPLE_BRIEF = {
    "firm_id": "firm_test",
    "project_id": "proj_test",
    "room_sqft": 45,
    "budget_band": "medium",
    "priorities": ["more storage"],
    "style_chips": ["warm", "minimal"],
    "chat_text": "calm spa-like bathroom, natural wood, walk-in shower, timeless",
}


def test_health_ok():
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["intent_source"] in ("claude", "offline_fallback")


def test_list_directions():
    r = client.get("/presets/directions")
    assert r.status_code == 200
    assert len(r.json()["directions"]) == 6


def test_intake_returns_profile_and_six_directions():
    r = client.post("/intake", json=SAMPLE_BRIEF)
    assert r.status_code == 200
    body = r.json()
    assert "profile" in body
    assert len(body["directions"]) == 6
    # ranked best-first
    scores = [d["match_score"] for d in body["directions"]]
    assert scores == sorted(scores, reverse=True)


def test_assemble_builds_deliverable():
    # Pick whatever the top direction is from intake, then assemble it.
    intake = client.post("/intake", json=SAMPLE_BRIEF).json()
    top_key = intake["directions"][0]["key"]
    r = client.post("/assemble", json={"brief": SAMPLE_BRIEF, "direction_key": top_key})
    assert r.status_code == 200
    body = r.json()
    assert body["chosen_direction"]["key"] == top_key
    assert body["package"]["line_items"]
    assert body["markdown"].startswith("# Renovation Brief")


def test_assemble_rejects_unknown_direction():
    r = client.post("/assemble", json={"brief": SAMPLE_BRIEF, "direction_key": "not_a_real_key"})
    assert r.status_code == 422


def test_pipeline_run_end_to_end():
    r = client.post("/pipeline/run", json={"brief": SAMPLE_BRIEF})
    assert r.status_code == 200
    body = r.json()
    assert "profile" in body and "directions" in body and "deliverable" in body
    assert body["deliverable"]["budget"]["status"] in ("within", "over")


def test_brief_validation_rejects_bad_sqft():
    bad = dict(SAMPLE_BRIEF, room_sqft=0)
    r = client.post("/intake", json=bad)
    assert r.status_code == 422  # room_sqft must be > 0
