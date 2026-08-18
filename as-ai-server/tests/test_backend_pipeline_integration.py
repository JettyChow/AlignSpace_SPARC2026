from __future__ import annotations

from decimal import Decimal

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.database import get_db
from app.main import app
from app.services import auth_service, catalog_service, pipeline_service, project_service, project_store


@pytest.fixture(autouse=True)
def clear_projects(monkeypatch):
    project_service.projects.clear()
    monkeypatch.setattr(project_store, "create_project_id", lambda project_data=None, current_user=None: None)
    monkeypatch.setattr(project_store, "save_project", lambda project: False)
    monkeypatch.setattr(project_store, "get_project", lambda project_id: None)
    monkeypatch.setattr(project_store, "list_projects", lambda clerk_user_id=None, limit=None: None)
    monkeypatch.setattr(project_store, "delete_project", lambda project_id: False)


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


def _clerk_claims(**claims):
    return {
        "sub": "user_clerk_123",
        "email": "adam@example.com",
        "first_name": "Adam",
        "last_name": "Tschida",
        "name": "Adam Tschida",
        **claims,
    }


def _fake_clerk_header():
    return {"Authorization": "Bearer fake-clerk-jwt"}


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


def test_project_create_accepts_frontend_brief_shape_and_returns_aliases(client):
    response = client.post(
        "/projects",
        json={
            "title": "Home office",
            "room_type": "home_office",
            "budget_band": "medium",
            "priorities": ["Better functionality"],
            "style_chips": ["Warm minimal"],
            "chat_text": "I want a calm office with better storage.",
        },
    )

    assert response.status_code == 200
    project = response.json()
    assert project["project_id"] == 1
    assert project["proj_id"] == 1
    assert project["proj_title"] == "Home office"
    assert project["proj_status"] == "Created"
    assert project["preferences"]["room_type"] == "home_office"
    assert project["preferences"]["style_tags"] == ["Warm minimal"]
    assert project["chat_messages"][0]["message"] == "I want a calm office with better storage."

    projects = client.get("/projects").json()["projects"]
    assert projects[0]["proj_title"] == "Home office"
    assert projects[0]["proj_completionPercent"] == 0


def test_preferences_accept_frontend_direction_key(client):
    project = client.post("/projects", json={"title": "Kitchen"}).json()

    response = client.post(
        f"/projects/{project['project_id']}/preferences",
        json={"direction_key": "warm_minimal", "style_chips": ["Warm minimal"]},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["preferences"]["direction_key"] == "warm_minimal"
    assert body["preferences"]["style_tags"] == ["Warm minimal"]
    assert body["project"]["selected_direction"]["pipeline_direction_key"] == "warm_minimal"


def test_backend_can_proxy_pipeline_intake_for_frontend(client, monkeypatch):
    calls = []

    def fake_pipeline(path, payload):
        calls.append((path, payload))
        return _intake_response()

    monkeypatch.setattr(pipeline_service, "_pipeline_request", fake_pipeline)

    response = client.post(
        "/intake",
        json={
            "firm_id": "firm_1",
            "project_id": "1",
            "room_type": "bathroom",
            "budget_band": "medium",
            "style_chips": ["warm"],
            "chat_text": "spa bathroom",
        },
    )

    assert response.status_code == 200
    assert response.json()["directions"][0]["key"] == "japandi"
    assert calls == [
        (
            "/intake",
            {
                "firm_id": "firm_1",
                "project_id": "1",
                "room_type": "bathroom",
                "budget_band": "medium",
                "style_chips": ["warm"],
                "chat_text": "spa bathroom",
            },
        )
    ]


def test_users_me_uses_clerk_token_claims_when_present(client, monkeypatch):
    monkeypatch.setattr(auth_service, "verify_clerk_token", lambda token: _clerk_claims())

    response = client.get("/users/me", headers=_fake_clerk_header())

    assert response.status_code == 200
    body = response.json()
    assert body["user_id"] == "user_clerk_123"
    assert body["clerk_user_id"] == "user_clerk_123"
    assert body["email"] == "adam@example.com"
    assert body["display_name"] == "Adam Tschida"
    assert body["auth_source"] == "clerk_jwt"


def test_invalid_clerk_token_is_rejected(client, monkeypatch):
    def invalid_token(token):
        raise HTTPException(status_code=401, detail="Invalid Clerk token.")

    monkeypatch.setattr(auth_service, "verify_clerk_token", invalid_token)

    response = client.get("/users/me", headers=_fake_clerk_header())

    assert response.status_code == 401


def test_project_created_with_clerk_token_includes_client_metadata(client, monkeypatch):
    monkeypatch.setattr(auth_service, "verify_clerk_token", lambda token: _clerk_claims())

    response = client.post(
        "/projects",
        json={"title": "Home Office", "room_type": "home_office"},
        headers=_fake_clerk_header(),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["clerk_user_id"] == "user_clerk_123"
    assert body["client"]["display_name"] == "Adam Tschida"
    assert body["proj_title"] == "Home Office"


def test_project_apis_persist_through_project_store(client, monkeypatch):
    stored_projects = {}

    def save_project(project):
        stored_projects[project["project_id"]] = project.copy()
        return True

    monkeypatch.setattr(project_store, "create_project_id", lambda project_data=None, current_user=None: 42)
    monkeypatch.setattr(project_store, "save_project", save_project)
    monkeypatch.setattr(project_store, "get_project", lambda project_id: stored_projects.get(project_id))
    monkeypatch.setattr(project_store, "list_projects", lambda clerk_user_id=None, limit=None: list(stored_projects.values()))

    created = client.post("/projects", json={"title": "Persisted Office"}).json()
    assert created["project_id"] == 42
    assert stored_projects[42]["title"] == "Persisted Office"

    project_service.projects.clear()

    fetched = client.get("/projects/42")
    assert fetched.status_code == 200
    assert fetched.json()["proj_title"] == "Persisted Office"

    projects = client.get("/projects").json()["projects"]
    assert projects[0]["proj_id"] == 42


def test_project_brief_pdf_download_returns_pdf(client):
    project = client.post(
        "/projects",
        json={"title": "Home Office", "room_type": "home_office", "style_chips": ["Warm minimal"]},
    ).json()

    response = client.get(f"/projects/{project['project_id']}/brief.pdf")

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")


def test_preset_items_endpoint_returns_catalog_items(client, monkeypatch):
    def fake_get_db():
        yield object()

    def fake_get_preset_items(preset_id, db):
        return {
            "preset_id": preset_id,
            "items": [
                {
                    "item_id": 12,
                    "product_name": "Matte black faucet",
                    "price": 149.99,
                    "image_url": "https://example.com/faucet.jpg",
                }
            ],
        }

    app.dependency_overrides[get_db] = fake_get_db
    monkeypatch.setattr(catalog_service, "get_preset_items", fake_get_preset_items)

    try:
        response = client.get("/presets/7/items")
    finally:
        app.dependency_overrides.pop(get_db, None)

    assert response.status_code == 200
    body = response.json()
    assert body["preset_id"] == 7
    assert body["items"][0]["product_name"] == "Matte black faucet"


def test_catalog_service_maps_preset_items_from_database_rows():
    class FakeResult:
        def mappings(self):
            return self

        def all(self):
            return [
                {
                    "presetItem_id": 44,
                    "preset_id": 9,
                    "item_id": 12,
                    "presetItem_quantity": 2,
                    "presetItem_unitCost": Decimal("149.99"),
                    "presetItem_notes": "Client approved",
                    "presetItem_isRequired": True,
                    "presetItem_rank": 1,
                    "item_name": "Matte black faucet",
                    "item_brand": "Delta",
                    "item_category": "Plumbing",
                    "item_model": "Trinsic",
                    "item_cost": Decimal("169.00"),
                    "item_set": "bathroom",
                    "item_imageUrl": "https://example.com/faucet.jpg",
                }
            ]

    class FakeDB:
        def __init__(self):
            self.params = None

        def execute(self, statement, params):
            self.params = params
            assert "FROM preset_items" in str(statement)
            assert "JOIN items" in str(statement)
            return FakeResult()

    db = FakeDB()

    body = catalog_service.get_preset_items(9, db)

    assert db.params == {"preset_id": 9}
    assert body["preset_id"] == 9
    item = body["items"][0]
    assert item["preset_item_id"] == 44
    assert item["item_id"] == 12
    assert item["product_name"] == "Matte black faucet"
    assert item["price"] == 149.99
    assert item["image_url"] == "https://example.com/faucet.jpg"
    assert item["item_cost"] == 169.0
