import json
from typing import Any

from fastapi.encoders import jsonable_encoder
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.database import SessionLocal


_schema_ready = False
_db_available: bool | None = None


def _payload_to_dict(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        return json.loads(value)
    return dict(value or {})


def _params(project: dict[str, Any]) -> dict[str, Any]:
    return {
        "project_id": project["project_id"],
        "firm_id": str(project.get("firm_id") or "firm_default"),
        "clerk_user_id": project.get("clerk_user_id"),
        "title": project.get("title") or project.get("proj_title"),
        "room_type": project.get("room_type"),
        "status": project.get("status") or "created",
        "created_at": project.get("created_at"),
        "updated_at": project.get("updated_at"),
        "payload": json.dumps(jsonable_encoder(project)),
    }


def _ensure_schema(session) -> None:
    global _schema_ready
    if _schema_ready:
        return

    session.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS backend_project_state (
                project_id SERIAL PRIMARY KEY,
                firm_id TEXT NOT NULL DEFAULT 'firm_default',
                clerk_user_id TEXT,
                title TEXT,
                room_type TEXT,
                status TEXT NOT NULL DEFAULT 'created',
                created_at TIMESTAMPTZ,
                updated_at TIMESTAMPTZ,
                payload JSONB NOT NULL DEFAULT '{}'::jsonb
            )
            """
        )
    )
    session.execute(
        text(
            """
            CREATE INDEX IF NOT EXISTS idx_backend_project_state_clerk_user_id
            ON backend_project_state (clerk_user_id)
            """
        )
    )
    session.commit()
    _schema_ready = True


def is_available() -> bool:
    global _db_available
    if _db_available is False:
        return False

    try:
        with SessionLocal() as session:
            _ensure_schema(session)
        _db_available = True
        return True
    except SQLAlchemyError:
        _db_available = False
        return False


def reset_availability_cache() -> None:
    global _schema_ready, _db_available
    _schema_ready = False
    _db_available = None


def create_project_id() -> int | None:
    if not is_available():
        return None

    try:
        with SessionLocal() as session:
            row = session.execute(
                text(
                    """
                    INSERT INTO backend_project_state (payload)
                    VALUES ('{}'::jsonb)
                    RETURNING project_id
                    """
                )
            ).first()
            session.commit()
            return int(row.project_id)
    except SQLAlchemyError:
        return None


def save_project(project: dict[str, Any]) -> bool:
    if not is_available():
        return False

    try:
        with SessionLocal() as session:
            session.execute(
                text(
                    """
                    INSERT INTO backend_project_state (
                        project_id, firm_id, clerk_user_id, title, room_type,
                        status, created_at, updated_at, payload
                    )
                    VALUES (
                        :project_id, :firm_id, :clerk_user_id, :title, :room_type,
                        :status, CAST(:created_at AS timestamptz),
                        CAST(:updated_at AS timestamptz), CAST(:payload AS jsonb)
                    )
                    ON CONFLICT (project_id) DO UPDATE SET
                        firm_id = EXCLUDED.firm_id,
                        clerk_user_id = EXCLUDED.clerk_user_id,
                        title = EXCLUDED.title,
                        room_type = EXCLUDED.room_type,
                        status = EXCLUDED.status,
                        created_at = EXCLUDED.created_at,
                        updated_at = EXCLUDED.updated_at,
                        payload = EXCLUDED.payload
                    """
                ),
                _params(project),
            )
            session.commit()
            return True
    except SQLAlchemyError:
        return False


def get_project(project_id: int) -> dict[str, Any] | None:
    if not is_available():
        return None

    try:
        with SessionLocal() as session:
            row = session.execute(
                text(
                    """
                    SELECT payload
                    FROM backend_project_state
                    WHERE project_id = :project_id
                    """
                ),
                {"project_id": project_id},
            ).first()
            if not row:
                return None
            project = _payload_to_dict(row.payload)
            return project or None
    except (SQLAlchemyError, ValueError, TypeError):
        return None


def list_projects(clerk_user_id: str | None = None, limit: int | None = None) -> list[dict[str, Any]] | None:
    if not is_available():
        return None

    filters = ""
    params: dict[str, Any] = {}
    if clerk_user_id:
        filters = "WHERE clerk_user_id IS NULL OR clerk_user_id = :clerk_user_id"
        params["clerk_user_id"] = clerk_user_id

    limit_sql = ""
    if limit:
        limit_sql = "LIMIT :limit"
        params["limit"] = limit

    try:
        with SessionLocal() as session:
            rows = session.execute(
                text(
                    f"""
                    SELECT payload
                    FROM backend_project_state
                    {filters}
                    ORDER BY COALESCE(updated_at, created_at) DESC, project_id DESC
                    {limit_sql}
                    """
                ),
                params,
            ).all()
            projects = []
            for row in rows:
                project = _payload_to_dict(row.payload)
                if project:
                    projects.append(project)
            return projects
    except (SQLAlchemyError, ValueError, TypeError):
        return None


def delete_project(project_id: int) -> bool:
    if not is_available():
        return False

    try:
        with SessionLocal() as session:
            result = session.execute(
                text("DELETE FROM backend_project_state WHERE project_id = :project_id"),
                {"project_id": project_id},
            )
            session.commit()
            return result.rowcount > 0
    except SQLAlchemyError:
        return False
