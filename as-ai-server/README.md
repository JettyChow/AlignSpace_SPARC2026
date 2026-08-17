# AlignSpace — AI Pipeline service (`as-ai-server`)

**Owner:** Engineer 3 (AI & Agentic Pipeline)

This service takes a client's messy renovation input (chat + preference chips +
budget + room size) and turns it into a **structured, priced, designer-ready
renovation brief**. It's the "brain" of AlignSpace.

It runs **fully offline today** — no API key, no Postgres, no Redis, no Celery
needed to see the whole flow work — and lights up Claude automatically the
moment an API key is present.

---

## Quick start

```bash
cd as-ai-server
pip install -r requirements.txt

# 1) See the whole pipeline run end-to-end (no key needed):
python demo.py

# 2) Run the test suite (what CI runs):
pytest

# 3) Run the API service:
uvicorn main:app --app-dir src --reload --port 8000
#   then open http://localhost:8000/docs  (interactive Swagger UI)
```

### Main backend integration

The prototype backend (`app/main.py`) calls this service in two phases: its
`POST /projects/{project_id}/generate` route forwards the stored intake to
`POST /intake`, and `POST /projects/{project_id}/directions/select` forwards
the selected pipeline direction to `POST /assemble`. Run the two processes on
different ports and set the backend's pipeline URL when it is not the default:

```bash
# terminal 1: AI pipeline
uvicorn main:app --app-dir src --reload --port 8000

# terminal 2: main backend (from as-ai-server)
AI_PIPELINE_URL=http://localhost:8000 uvicorn app.main:app --reload --port 8001
```

`AI_PIPELINE_TIMEOUT_SECONDS` defaults to `20`. An unavailable service returns
`503`, a timeout `504`, and an invalid upstream response `502` from the backend.

For local frontend development, the backend allows CORS from
`http://localhost:3000` and `http://127.0.0.1:3000` by default. Override with:

```bash
BACKEND_CORS_ORIGINS=http://localhost:3000 uvicorn app.main:app --reload --port 8001
```

The main backend also exposes lightweight compatibility proxy routes for the
current frontend branch if it points its AI client at the backend:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
NEXT_PUBLIC_API_URL=http://localhost:8001
```

Those proxy routes are:

- `GET /presets/directions`
- `POST /intake`
- `POST /assemble`
- `POST /pipeline/run`

They forward to the AI pipeline configured by `AI_PIPELINE_URL`.

### Current frontend compatibility notes

The frontend can send Clerk session tokens to the main backend with:

```http
Authorization: Bearer <clerk_jwt>
```

For Clerk-enabled frontend requests, the backend uses the verified Clerk token
claims to populate `GET /users/me` and to attach `clerk_user_id`/client metadata
to created projects, messages, and image metadata.

When a token is present, the backend verifies its signature against Clerk's JWKS
before trusting any claims. Configure Clerk verification with:

```bash
CLERK_ISSUER=https://your-clerk-instance.clerk.accounts.dev
# Optional if you want to override the derived JWKS URL:
CLERK_JWKS_URL=https://your-clerk-instance.clerk.accounts.dev/.well-known/jwks.json
# Optional if your Clerk JWT template uses an audience:
CLERK_AUDIENCE=your-audience
```

If no `Authorization` header is sent, the backend keeps using the local mock user
so unauthenticated local demos still run. If a token is sent and Clerk is not
configured, the request is rejected with a configuration error instead of falling
back to an unverified token.

Useful backend endpoints for the latest frontend branch:

- `GET /users/me`
- `PATCH /users/me/role`
- `GET /projects`
- `POST /projects`
- `GET /projects/{project_id}`
- `POST /projects/{project_id}/messages`
- `GET /projects/{project_id}/messages`
- `POST /projects/{project_id}/images`
- `GET /projects/{project_id}/images`
- `GET /projects/{project_id}/brief.pdf`
- `GET /projects/{project_id}/brief/download`
- `GET /presets/{preset_id}/items`

`GET /presets/{preset_id}/items` is the backend database-facing catalog route
for frontend screens that need the material/product items attached to a preset.
It reads `preset_items` joined to `items` from Postgres and returns both
frontend-friendly fields (`item_id`, `product_name`, `price`, `image_url`) and
the original DBML-style aliases (`presetItem_*`, `item_*`) for compatibility.

### Turning on Claude

Intent extraction uses a deterministic keyword fallback by default so demos and
CI never break. To use the real model, set your key (don't commit it):

```bash
cp .env.example .env        # then paste your key into .env
export ANTHROPIC_API_KEY=sk-ant-...    # or load the .env in your shell
python demo.py              # now intent extraction routes through Claude
```

`GET /health` reports which path is active (`"intent_source": "claude"` vs
`"offline_fallback"`).

---

## How the pipeline works

Input is a `ClientBrief`. It flows through 5 agents and comes out as a
`RenovationPackage`:

```
ClientBrief  (chat text + chips + budget band + room sqft)
   │
   ▼
[1] Intent Extraction   →  ClientProfile        (Claude, or offline fallback)
   │                        styles{}, functions[], must_haves[]
   ▼
[3] Preset Matching     →  6 ranked directions  (Japandi, Organic Spa, ...)
   │
   ▼   ← client picks one direction in the UI
[4] Selection Assembly  →  MaterialPackage      (a product per category,
   │                        quantities from room size, confidence + flags)
   ▼
[5] Budget Validation   →  BudgetReport         (within/over + cheaper swaps)
   │
   ▼
[6] Document Generation →  RenovationPackage     (scope + selection sheet +
                            budget summary, as markdown/JSON)
```

The flow is **two-phase**, matching the product:
- **Phase A (`/intake`)** runs agents 1 + 3 → shows the client 6 directions.
- **Phase B (`/assemble`)** runs agents 4 → 5 → 6 on the direction they tapped.

> Agent 2, *Memory Lookup* (embeddings/pgvector), is intentionally **out of MVP
> scope** per the MVP Definition. It's left as a documented no-op slot right
> before Preset Matching so it can be added later without touching other agents.

Each stage fires a progress event through an `on_stage(stage, message)`
callback — that's the hook the backend wires to Redis pub/sub so the designer
dashboard can show "Extracting intent… / Matching presets…" live over Socket.io.

---

## API (the contract for the backend)

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness probe (app.yaml points here). Reports intent source. |
| `GET` | `/presets/directions` | The 6 directions, renderable before any intake. |
| `POST` | `/intake` | **Phase A** — returns `{profile, directions[6]}`. |
| `POST` | `/assemble` | **Phase B** — body `{brief, direction_key}` → full deliverable. |
| `POST` | `/pipeline/run` | Whole arc in one call (auto-picks top direction if none). |

Example:

```bash
curl -X POST http://localhost:8000/intake -H "Content-Type: application/json" -d '{
  "firm_id": "firm_demo",
  "project_id": "proj_001",
  "room_sqft": 45,
  "budget_band": "medium",
  "priorities": ["more storage"],
  "style_chips": ["warm", "minimal"],
  "chat_text": "calm spa-like bathroom, natural wood, walk-in shower, timeless"
}'
```

Request/response shapes live in `src/api_schemas.py` (wire models) and
`src/pipeline/models.py` (internal contracts). Full interactive docs at `/docs`.

---

## How it plugs into everyone else's work

| Boundary | Contract |
|---|---|
| **Backend (Eng 2)** | Builds `ClientBrief` from chat + chips, calls `/intake` then `/assemble`. All shapes in `models.py` / `api_schemas.py`. |
| **Frontend (Eng 1)** | Renders the 6 `DesignDirection` cards, then the selection sheet + budget panel from the deliverable JSON. |
| **Infra/Data (Eng 4)** | Maps `models.py` dataclasses → Postgres tables (shapes line up 1:1). |
| **Real-time (Eng 1+4)** | Subscribes to the `on_stage` events for Socket.io stage updates. |

---

## Architecture note for the team: lean now, LangGraph-ready later

`Architecture.md` describes a full LangGraph + Celery + Redis + pgvector +
OpenAI-embeddings stack. That's the **target**. I built the MVP leaner first,
for two reasons:

1. The repo's own `requirements.txt` is already lean — `anthropic`, `fastapi`,
   `chromadb`; **no** `langgraph`, `celery`, `redis`, or `pgvector` yet.
2. The MVP Definition explicitly **cuts** memory lookup, embeddings, vision, and
   the multi-loop optimizer.

So this is a clean sequential runner where **each agent is a pure, testable
node**. Promoting it to LangGraph later just means registering these same
functions as graph nodes; wrapping Phase B in a Celery task is a few lines. The
agent logic doesn't change either way. **Worth a 5-minute team decision: confirm
we're MVP-lean before anyone stands up the heavier infra.**

---

## File map

```
as-ai-server/
  Dockerfile               # used by app.yaml; serves uvicorn on :8000
  requirements.txt         # (unchanged from the repo)
  pytest.ini               # puts src/ on the path for tests
  demo.py                  # runnable end-to-end example (offline-friendly)
  .env.example             # documents ANTHROPIC_API_KEY (never commit the real one)
  src/
    main.py                # FastAPI app: /health + pipeline routes
    api_schemas.py         # Pydantic wire models (the HTTP contract)
    pipeline/
      models.py            # shared data contracts (the API everyone codes to)
      presets.py           # 6 directions + tiered material catalog (seed data)
      pipeline.py          # orchestrator + stage events (LangGraph-ready)
      agents/
        intent.py          # [1] Claude intent extraction + offline fallback
        matching.py        # [3] rank the 6 directions
        assembly.py        # [4] build package, confidence scoring, flagging
        budget.py          # [5] budget check + cheaper-swap alternatives
        document.py        # [6] assemble the deliverable (markdown/JSON)
  tests/
    test_pipeline.py       # core logic (offline)
    test_api.py            # HTTP contract via TestClient
  sample_deliverable.md            # example output: within budget (Japandi)
  sample_deliverable_over_budget.md# example output: over budget + swaps
```

---

## Status vs. schedule

Covers the Engineer 3 line through **Week 3**: agent schemas + pipeline
contracts (Wk1), a working mock pipeline (Wk2), and the **intent extraction
agent** (Wk3) — plus working first passes at matching, assembly, budget, and
document so the full intake flow runs end to end, now exposed as a FastAPI
service with tests and a Dockerfile that fit the repo.

**Next:** wire `on_stage` to real Redis pub/sub once Eng 4's Redis is up;
replace the seed catalog with Laura's real per-firm material list; (post-MVP)
add the memory-lookup agent.

### Pricing caveat
All cost numbers are **materials-only illustrative ranges, not quotes**. The
unit-price-driven approach (price per item, quantities from room size, designer
sets the final number) follows the team's intake discussion. Seed catalog prices
are placeholders to be swapped for the real material list.
