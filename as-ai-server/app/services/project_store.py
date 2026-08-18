import json
from typing import Any

from fastapi.encoders import jsonable_encoder
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.database import SessionLocal


PROJECT_PAYLOAD_MARKER = "backend_project_payload"
_db_available: bool | None = None


def _payload_to_dict(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        return json.loads(value)
    return dict(value or {})


def _money_number(value: Any) -> float | None:
    if value in (None, ""):
        return None
    try:
        return float(str(value).replace("$", "").replace(",", ""))
    except (TypeError, ValueError):
        return None


def _timestamp(value: Any) -> str | None:
    return str(value) if value else None


def _project_title(project: dict[str, Any]) -> str:
    if project.get("title"):
        return str(project["title"])
    if project.get("proj_title"):
        return str(project["proj_title"])
    room_type = project.get("room_type") or project.get("preferences", {}).get("room_type")
    if room_type:
        return str(room_type).replace("_", " ").title()
    return f"Project {project['project_id']}"


def _project_params(project: dict[str, Any]) -> dict[str, Any]:
    preferences = project.get("preferences") or {}
    budget = project.get("ai_budget") or project.get("budget") or {}
    budget_total = budget.get("estimated_total") if isinstance(budget, dict) else None
    # Client's stated budget first — the column is named budgetMaxOverride,
    # so the AI's materials estimate is only a fallback, never an override
    # of a figure the client actually gave.
    budget_override = (
        preferences.get("budget_max")
        or (budget_total if budget_total is not None else None)
        or _money_number(preferences.get("budget"))
    )

    selected_direction = project.get("selected_direction") or {}
    return {
        "proj_id": project["project_id"],
        "firm_id": int(project.get("db_firm_id") or project.get("firm_id_db") or 1),
        "user_id_client": int(project.get("db_user_id_client") or project.get("user_id_client_db") or 1),
        "proj_budgetMaxOverride": budget_override,
        "proj_budgetNotes": preferences.get("budget"),
        "proj_title": _project_title(project),
        "proj_status": str(project.get("status") or "created"),
        "proj_timeline": preferences.get("timeline"),
        "proj_scope": preferences.get("scope"),
        "proj_goal": preferences.get("goal"),
        "proj_matchPercent": selected_direction.get("match_percent") or project.get("proj_matchPercent") or 0,
        "proj_completionPercent": project.get("completion_percent") or project.get("proj_completionPercent") or 0,
        "proj_createdAt": _timestamp(project.get("created_at") or project.get("proj_createdAt")),
        "proj_updatedAt": _timestamp(project.get("updated_at")),
    }


def _project_payload(project: dict[str, Any]) -> str:
    return json.dumps(jsonable_encoder(project))


def _firm_id(session, firm_value: Any) -> int:
    if isinstance(firm_value, int):
        return firm_value

    firm_name = str(firm_value or "firm_default")
    existing = session.execute(
        text("SELECT firm_id FROM firms WHERE firm_name = :firm_name"),
        {"firm_name": firm_name},
    ).first()
    if existing:
        return int(existing.firm_id)

    row = session.execute(
        text(
            """
            INSERT INTO firms (firm_name)
            VALUES (:firm_name)
            RETURNING firm_id
            """
        ),
        {"firm_name": firm_name},
    ).first()
    return int(row.firm_id)


def _email_for_user(current_user: dict[str, Any] | None) -> str:
    current_user = current_user or {}
    email = current_user.get("email")
    if email:
        return str(email)

    clerk_user_id = current_user.get("clerk_user_id")
    if clerk_user_id:
        return f"{clerk_user_id}@clerk.alignspace.local"

    return "local-mock-user@alignspace.local"


def _user_id(session, current_user: dict[str, Any] | None) -> int:
    current_user = current_user or {}
    email = _email_for_user(current_user)
    first_name = current_user.get("first_name")
    last_name = current_user.get("last_name")
    display_name = current_user.get("display_name")
    if display_name and not (first_name or last_name):
        parts = str(display_name).split(" ", 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else None

    existing = session.execute(
        text("SELECT user_id FROM users WHERE user_email = :email"),
        {"email": email},
    ).first()
    if existing:
        session.execute(
            text(
                """
                UPDATE users
                SET user_firstName = COALESCE(:first_name, user_firstName),
                    user_lastName = COALESCE(:last_name, user_lastName),
                    user_updatedAt = now()
                WHERE user_id = :user_id
                """
            ),
            {
                "user_id": existing.user_id,
                "first_name": first_name,
                "last_name": last_name,
            },
        )
        return int(existing.user_id)

    row = session.execute(
        text(
            """
            INSERT INTO users (user_firstName, user_lastName, user_email)
            VALUES (:first_name, :last_name, :email)
            RETURNING user_id
            """
        ),
        {"first_name": first_name, "last_name": last_name, "email": email},
    ).first()
    return int(row.user_id)


def is_available() -> bool:
    global _db_available
    if _db_available is not None:
        return _db_available

    try:
        with SessionLocal() as session:
            session.execute(text("SELECT 1"))
        _db_available = True
        return True
    except SQLAlchemyError:
        _db_available = False
        return False


def reset_availability_cache() -> None:
    global _db_available
    _db_available = None


def create_project_id(project_data: dict[str, Any] | None = None, current_user: dict[str, Any] | None = None) -> int | None:
    if not is_available():
        return None

    project_data = project_data or {}
    try:
        with SessionLocal() as session:
            firm_id = _firm_id(session, project_data.get("firm_id") or (current_user or {}).get("firm_id"))
            user_id = _user_id(session, current_user)
            row = session.execute(
                text(
                    """
                    INSERT INTO projects (
                        firm_id, user_id_client, proj_title, proj_status,
                        proj_budgetMaxOverride, proj_budgetNotes, proj_timeline,
                        proj_scope, proj_goal, proj_matchPercent, proj_completionPercent
                    )
                    VALUES (
                        :firm_id, :user_id_client, :proj_title, 'created',
                        :proj_budgetMaxOverride, :proj_budgetNotes, :proj_timeline,
                        :proj_scope, :proj_goal, 0, 0
                    )
                    RETURNING proj_id
                    """
                ),
                {
                    "firm_id": firm_id,
                    "user_id_client": user_id,
                    "proj_title": project_data.get("title") or "Untitled Project",
                    "proj_budgetMaxOverride": project_data.get("budget_max")
                    or _money_number(project_data.get("budget")),
                    "proj_budgetNotes": project_data.get("budget"),
                    "proj_timeline": project_data.get("timeline"),
                    "proj_scope": (project_data.get("priorities") or [None])[0],
                    "proj_goal": (project_data.get("priorities") or [None])[0],
                },
            ).first()
            session.commit()
            return int(row.proj_id)
    except (SQLAlchemyError, TypeError, ValueError):
        return None


def save_project(project: dict[str, Any]) -> bool:
    if not is_available():
        return False

    try:
        with SessionLocal() as session:
            existing = session.execute(
                text("SELECT proj_id, firm_id, user_id_client FROM projects WHERE proj_id = :proj_id"),
                {"proj_id": project["project_id"]},
            ).first()
            if existing:
                project.setdefault("db_firm_id", existing.firm_id)
                project.setdefault("db_user_id_client", existing.user_id_client)
            else:
                project["db_firm_id"] = _firm_id(session, project.get("firm_id"))
                project["db_user_id_client"] = _user_id(session, project.get("client") or {})

            params = _project_params(project)
            if existing:
                session.execute(
                    text(
                        """
                        UPDATE projects
                        SET firm_id = :firm_id,
                            user_id_client = :user_id_client,
                            proj_budgetMaxOverride = :proj_budgetMaxOverride,
                            proj_budgetNotes = :proj_budgetNotes,
                            proj_title = :proj_title,
                            proj_status = :proj_status,
                            proj_timeline = :proj_timeline,
                            proj_scope = :proj_scope,
                            proj_goal = :proj_goal,
                            proj_matchPercent = :proj_matchPercent,
                            proj_completionPercent = :proj_completionPercent,
                            proj_updatedAt = CAST(:proj_updatedAt AS timestamp)
                        WHERE proj_id = :proj_id
                        """
                    ),
                    params,
                )
            else:
                session.execute(
                    text(
                        """
                        INSERT INTO projects (
                            proj_id, firm_id, user_id_client, proj_budgetMaxOverride,
                            proj_budgetNotes, proj_title, proj_status, proj_timeline,
                            proj_scope, proj_goal, proj_matchPercent,
                            proj_completionPercent, proj_createdAt, proj_updatedAt
                        )
                        VALUES (
                            :proj_id, :firm_id, :user_id_client, :proj_budgetMaxOverride,
                            :proj_budgetNotes, :proj_title, :proj_status, :proj_timeline,
                            :proj_scope, :proj_goal, :proj_matchPercent,
                            :proj_completionPercent, CAST(:proj_createdAt AS timestamp),
                            CAST(:proj_updatedAt AS timestamp)
                        )
                        """
                    ),
                    params,
                )

            session.execute(
                text(
                    """
                    DELETE FROM messages
                    WHERE proj_id = :proj_id
                      AND mess_senderType = 'system'
                      AND mess_messageType = 'system'
                      AND mess_body = :marker
                    """
                ),
                {"proj_id": project["project_id"], "marker": PROJECT_PAYLOAD_MARKER},
            )
            session.execute(
                text(
                    """
                    INSERT INTO messages (
                        proj_id, user_id_sender, mess_senderType, mess_messageType,
                        mess_body, mess_metadata
                    )
                    VALUES (
                        :proj_id, NULL, 'system', 'system',
                        :marker, CAST(:payload AS json)
                    )
                    """
                ),
                {
                    "proj_id": project["project_id"],
                    "marker": PROJECT_PAYLOAD_MARKER,
                    "payload": _project_payload(project),
                },
            )
            session.commit()
            return True
    except (SQLAlchemyError, TypeError, ValueError):
        return False


def _fallback_project_from_row(row) -> dict[str, Any]:
    created_at = row.proj_createdAt.isoformat() if row.proj_createdAt else None
    updated_at = row.proj_updatedAt.isoformat() if row.proj_updatedAt else created_at
    return {
        "project_id": row.proj_id,
        "status": row.proj_status,
        "firm_id": row.firm_id,
        "user_id_client": row.user_id_client,
        "title": row.proj_title,
        "room_type": None,
        "created_at": created_at,
        "updated_at": updated_at,
        "project": {},
        "chat_messages": [],
        "preferences": {
            "budget": row.proj_budgetNotes,
            "timeline": row.proj_timeline,
            "scope": row.proj_scope,
            "goal": row.proj_goal,
            "style_tags": [],
            "style_chips": [],
        },
        "images": [],
        "directions": [],
        "selected_direction": None,
        "materials": [],
        "alternatives": [],
        "budget": None,
        "ai_brief": None,
        "ai_profile": None,
        "ai_budget": None,
        "ai_deliverable": None,
        "handoff": None,
    }


def get_project(project_id: int) -> dict[str, Any] | None:
    if not is_available():
        return None

    try:
        with SessionLocal() as session:
            row = session.execute(
                text(
                    """
                    SELECT p.*, m.mess_metadata
                    FROM projects p
                    LEFT JOIN LATERAL (
                        SELECT mess_metadata
                        FROM messages
                        WHERE proj_id = p.proj_id
                          AND mess_senderType = 'system'
                          AND mess_messageType = 'system'
                          AND mess_body = :marker
                        ORDER BY mess_createdAt DESC, mess_id DESC
                        LIMIT 1
                    ) m ON true
                    WHERE p.proj_id = :project_id
                    """
                ),
                {"project_id": project_id, "marker": PROJECT_PAYLOAD_MARKER},
            ).first()
            if not row:
                return None
            payload = _payload_to_dict(row.mess_metadata) if row.mess_metadata else None
            return payload or _fallback_project_from_row(row)
    except (SQLAlchemyError, ValueError, TypeError):
        return None


def list_projects(clerk_user_id: str | None = None, limit: int | None = None) -> list[dict[str, Any]] | None:
    if not is_available():
        return None

    limit_sql = ""
    params: dict[str, Any] = {"marker": PROJECT_PAYLOAD_MARKER}
    if limit:
        limit_sql = "LIMIT :limit"
        params["limit"] = limit

    try:
        with SessionLocal() as session:
            rows = session.execute(
                text(
                    f"""
                    SELECT p.*, m.mess_metadata
                    FROM projects p
                    LEFT JOIN LATERAL (
                        SELECT mess_metadata
                        FROM messages
                        WHERE proj_id = p.proj_id
                          AND mess_senderType = 'system'
                          AND mess_messageType = 'system'
                          AND mess_body = :marker
                        ORDER BY mess_createdAt DESC, mess_id DESC
                        LIMIT 1
                    ) m ON true
                    ORDER BY COALESCE(p.proj_updatedAt, p.proj_createdAt) DESC, p.proj_id DESC
                    {limit_sql}
                    """
                ),
                params,
            ).all()
            projects = []
            for row in rows:
                project = _payload_to_dict(row.mess_metadata) if row.mess_metadata else _fallback_project_from_row(row)
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
            session.execute(text("DELETE FROM messages WHERE proj_id = :project_id"), {"project_id": project_id})
            result = session.execute(text("DELETE FROM projects WHERE proj_id = :project_id"), {"project_id": project_id})
            session.commit()
            return result.rowcount > 0
    except SQLAlchemyError:
        return False
