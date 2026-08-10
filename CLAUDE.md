# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

AlignSpace is a two-service app for turning a client's messy renovation brief into a structured, priced, designer-ready material package:

- **`frontend/`** — Next.js 14 (App Router) client app, mobile-phone-frame UI, for clients and designers.
- **`as-ai-server/`** — FastAPI service that is the "brain": a 5-agent pipeline that turns a `ClientBrief` into a `RenovationPackage`.

The two are independent deployables (see `app.yaml` — DigitalOcean App Platform, two services) that talk over plain HTTP/JSON. There is no shared code between them; the JSON contract is documented in both `frontend/services/pipeline.service.js` and `as-ai-server/src/api_schemas.py` and must be kept in sync by hand.

## Commands

### Frontend (`frontend/`)
```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint      # required by CI
```
No frontend test suite currently exists.

### AI pipeline backend (`as-ai-server/`)
```bash
cd as-ai-server
pip install -r requirements.txt   # or the lighter: fastapi uvicorn pydantic anthropic pytest httpx

python demo.py                                          # run the whole pipeline offline, end to end
pytest                                                   # run the full suite (pythonpath=src, see pytest.ini)
pytest tests/test_pipeline.py::test_name                 # run a single test
uvicorn main:app --app-dir src --reload --port 8000       # run the API; docs at /docs
ruff check .                                             # lint, required by CI
```

Intent extraction (`src/pipeline/agents/intent.py`) uses Claude when `ANTHROPIC_API_KEY` is set in the environment, and a deterministic keyword-based offline fallback otherwise. **Tests never call the live API** — `tests/conftest.py` has an autouse fixture that strips `ANTHROPIC_API_KEY` for every test, so the suite is hermetic and identical in CI and locally. Validate the Claude path by hand with `python demo.py` after exporting the key.

`GET /health` reports which path is active: `"intent_source": "claude"` vs `"offline_fallback"`.

### CI (`.github/workflows/CI-CD.yaml`)
On every PR/push to `main`: backend `ruff check` + `pytest`, then frontend `npm run lint`. On push to `main` only: build the Next.js standalone bundle and rsync-deploy it plus the backend to the Droplet (`alembic upgrade head`, restart `designos-api`/`designos-worker`/`designos-web` via systemd).

## Architecture

### `as-ai-server` — the 5-agent pipeline

A `ClientBrief` (chat text + style chips + budget band + room sqft) flows through agents in `src/pipeline/agents/` in sequence, orchestrated by `src/pipeline/pipeline.py`:

```
ClientBrief
   │
   ▼
[1] intent.py     → ClientProfile   (Claude, or offline keyword fallback)
   ▼
[3] matching.py   → 6 ranked DesignDirections (Japandi, Organic Spa, ...)
   ▼  ← client picks one direction in the UI
[4] assembly.py   → MaterialPackage (a product per category, qty from room size, confidence + flags)
   ▼
[5] budget.py     → BudgetReport (within/over + cheaper swaps)
   ▼
[6] document.py   → RenovationPackage (scope + selection sheet + budget summary, markdown/JSON)
```

Agent 2 ("Memory Lookup" — embeddings/pgvector) is intentionally out of MVP scope; it's a documented no-op slot before matching, left for later without touching other agents.

Each stage in `pipeline.py` fires through an optional `on_stage(stage, message)` callback — the hook meant to wire to Redis pub/sub for Socket.io stage updates on the designer dashboard (not yet wired up; currently a no-op / print).

The flow is **two-phase**, matching the product UX:
- **Phase A** (`run_intake`, `POST /intake`) runs agents 1+3 → returns the profile + 6 direction cards.
- **Phase B** (`run_for_direction`, `POST /assemble`) runs agents 4→5→6 on the direction the client tapped.
- `POST /pipeline/run` runs the whole arc in one call (auto-picks the top direction if none given) — used by `demo.py` and integration tests.

Each agent is a **pure, testable function** by design (see comment at top of `pipeline.py`): the repo is deliberately leaner than the target architecture (`Architecture.md`, if present, describes a LangGraph + Celery + Redis + pgvector stack) — `requirements.txt` has no `langgraph`/`celery`/`redis`/`pgvector` yet. Promoting a node to a LangGraph graph node later is meant to be a registration change, not a rewrite.

Data contracts:
- `src/pipeline/models.py` — internal dataclasses (`ClientBrief`, `ClientProfile`, `DesignDirection`, `MaterialPackage`, `BudgetReport`, `RenovationPackage`). This is the shape everyone (backend, frontend, DB) codes against.
- `src/api_schemas.py` — Pydantic wire models (`BriefRequest`, `AssembleRequest`, `PipelineRequest`) that convert to/from the internal dataclasses via `.to_brief()`.
- `src/pipeline/presets.py` — seed data: the 6 design directions and a tiered material catalog (placeholder prices; swap for the real per-firm material list later).

Persistence (`src/app/`) is SQLAlchemy models (`app/models.py`) mirroring a DBML schema, managed via Alembic (`alembic.ini`, `src/migrations/`) — never call `Base.metadata.create_all()` directly. `DATABASE_URL` env var configures the connection (`app/database.py`); the ORM layer exists but is not yet wired into the pipeline/API routes (the pipeline currently runs stateless, in-memory per-request).

### `frontend` — Next.js App Router

**Route/screen split**: `app/**/page.jsx` files are thin — they wire up `useNavigation()` (router push/back) and `useAppStore()` (global state) then render the actual UI from `screens/**/*Screen.jsx`. Screens are plain presentational-plus-logic components that take callback props (`onBack`, `onComplete`, ...) rather than reading the router/store directly — keep that separation when adding screens.

Route groups: `app/(public)/` = login/role/signup (unauthenticated), `app/(protected)/` = everything else. `app/(protected)/layout.jsx` currently passes children through — it has a commented-out Clerk auth guard block ready to be enabled (`npm install @clerk/nextjs`, wrap `RootLayout` in `<ClerkProvider>`, uncomment).

Screen directories under `screens/` are organized by product phase, not by role:
- `auth/` — login, role select, signup
- `flow/` — client intake flow (entry → intake → processing)
- `explore/` — direction discovery/focus/package selection
- `decide/` — budget, FFE, summary, handoff
- `designer/` — designer-side projects/materials views
- `support/` — history, notifications, profile

**State**: `store/useAppStore.js` is a single Zustand store (persisted to localStorage as `alignspace-store`) holding the whole client flow: role, project, `firmId`/`projectId`, direction selection, confirmed categories, intake answers/brief, and the AI pipeline results (`profile`, `directions`, `deliverable`). `firmId`/`projectId` are currently **client-minted temp IDs** (search `TEMP-ID`) because auth (`services/auth.service.js`) and project creation (`services/project.service.js`) are still unimplemented stubs — replace this the moment those land.

**Services** (`frontend/services/`) are the API boundary:
- `apiClient.js` — shared `fetch` wrapper (`apiRequest`, `jsonBody`, `ApiError`) pointed at `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`, i.e. the AI pipeline server).
- `pipeline.service.js` — calls `as-ai-server`'s `/presets/directions`, `/intake`, `/assemble`, `/pipeline/run`; mirrors `main.py` routes and `api_schemas.py` shapes exactly — update both sides together.
- `auth.service.js`, `project.service.js`, `chat.service.js`, `material.service.js` — stubs (`throw new Error('Not implemented')`) marking future integration points with a main backend that doesn't exist yet in this repo.

**UI shell**: `components/AppShell.jsx` wraps every protected screen in a `PhoneFrame` (mobile-frame chrome) plus `ScreenNav`. `components/frame/` holds `DarkScene`/`LightScene` backgrounds and `AppBar`. Shared primitives (`Buttons`, `Chip`, `Field`, `GlassPanel`, `PhotoTile`, `StatusPill`, `Icon`, `Logo`, `FloralDivider`) are re-exported from `components/index.js` — import from there rather than deep paths.

Path alias: `@/*` maps to `frontend/` root (see `jsconfig.json`). Next config sets `output: "standalone"` (CI copies `.next/static` and `public/` into the standalone bundle before deploying — see the workflow).

## Cross-service contract notes

- Backend routes and frontend `pipeline.service.js` must stay in lockstep; when changing one, grep the other before considering the change done.
- `src/pipeline/models.py` dataclasses are meant to map 1:1 onto the Postgres tables in `src/app/models.py` (per `as-ai-server/README.md`'s stated boundary with infra/data) — check both when changing a pipeline data shape.
- Pricing in `presets.py` is explicitly placeholder/illustrative, not real quotes — don't treat it as authoritative when working on budget logic.
