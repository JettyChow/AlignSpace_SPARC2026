from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import pipeline_service, project_service


@pytest.fixture(autouse=True)
def clear_projects():
    project_service.projects.clear()


@pytest.fixture
def client():
    return TestClient(app)


def _intake_response():
    return {
        "profile": {"styles": {"warm": 1.0}, "functions": [], "must_haves": [], "avoid": [], "budget_band": "medium", "extraction_source": "rule_based", "notes": ""},
        "directions": [{"key": "japandi", "name": "Japandi", "blurb": "Warm and calm", "style_tags": ["warm"], "match_score": 0.9, "est_low": 1000, "est_high": 2000}],
    }


def _assembly_response():
    return {
        "package": {"line_items": [{"product_name": "Oak vanity", "category": "vanity", "subtotal": 1200, "tier": "standard", "quantity": 1, "unit": "each", "confidence": 0.9, "flagged": False, "flag_reason": None}]},
        "budget": {"budget_band": "medium", "band_ceiling": 10000, "estimated_total": 1200, "status": "within", "overage": 0, "suggested_swaps": [], "adjusted_total": 1200},
    }


def test_generate_then_select_uses_two_phase_ai_contract(client, monkeypatch):
    calls = []

    def fake_pipeline(path, payload):
        calls.append((path, payload))
        return _intake_response() if path == "/intake" else _assembly_response()

    monkeypatch.setattr(pipeline_service, "_pipeline_request", fake_pipeline)
    project = client.post("/projects", json={"firm_id": "firm_1"}).json()
    client.post(f"/projects/{project['project_id']}/preferences", json={"room_sqft": 55, "style_tags": ["warm"]})
    client.post(f"/projects/{project['project_id']}/messages", json={"message": "Calm spa bathroom"})

    generated = client.post(f"/projects/{project['project_id']}/generate")
    assert generated.status_code == 200
    direction = generated.json()["directions"][0]
    assert direction["pipeline_direction_key"] == "japandi"
    assert calls[0][0] == "/intake"
    assert calls[0][1]["firm_id"] == "firm_1"
    assert calls[0][1]["chat_text"] == "Calm spa bathroom"

    selected = client.post(f"/projects/{project['project_id']}/directions/select", json={"direction_id": 1})
    assert selected.status_code == 200
    assert calls[1][0] == "/assemble"
    assert calls[1][1]["direction_key"] == "japandi"
    assert selected.json()["materials"][0]["name"] == "Oak vanity"


def test_generate_reports_unavailable_ai_pipeline(client, monkeypatch):
    def unavailable(path, payload):
        raise pipeline_service.HTTPException(status_code=503, detail="AI pipeline is unavailable.")

    monkeypatch.setattr(pipeline_service, "_pipeline_request", unavailable)
    project = client.post("/projects", json={}).json()
    response = client.post(f"/projects/{project['project_id']}/generate")
    assert response.status_code == 503
