from datetime import datetime, timezone
from fastapi import HTTPException


projects = {}


def get_timestamp():
    return datetime.now(timezone.utc).isoformat()


def _status_label(status):
    return str(status or "created").replace("_", " ").title()


def _format_month_year(timestamp):
    if not timestamp:
        return None

    try:
        return datetime.fromisoformat(timestamp.replace("Z", "+00:00")).strftime("%b %Y")
    except ValueError:
        return timestamp


def _money(value):
    if value in (None, ""):
        return None

    try:
        return f"${float(value):,.0f}"
    except (TypeError, ValueError):
        return str(value)


def _project_title(project):
    if project.get("title"):
        return project["title"]

    room_type = project.get("room_type") or project.get("preferences", {}).get("room_type")
    if room_type:
        return f"{str(room_type).replace('_', ' ').title()} Renovation"

    return f"Project {project['project_id']}"


def _budget_display(project):
    ai_budget = project.get("ai_budget") or {}
    if ai_budget.get("estimated_total") is not None:
        return _money(ai_budget["estimated_total"])

    preferences = project.get("preferences", {})
    return _money(preferences.get("budget"))


def apply_frontend_aliases(project):
    """Expose DBML-style aliases used by the current frontend screens.

    The canonical backend fields stay in place; these extra keys keep the
    latest frontend branch from needing a mapper just to render project history.
    """
    completion_percent = calculate_completion_percent(project)
    project["completion_percent"] = completion_percent
    project["proj_id"] = project["project_id"]
    project["proj_title"] = _project_title(project)
    project["proj_status"] = _status_label(project.get("status"))
    project["proj_updatedAt"] = _format_month_year(project.get("updated_at"))
    project["proj_createdAt"] = project.get("created_at")
    project["proj_completionPercent"] = completion_percent
    project["proj_budgetMaxOverride"] = _budget_display(project)
    project["proj_budgetMinOverride"] = None
    project["proj_budgetNotes"] = project.get("preferences", {}).get("budget")
    project["proj_timeline"] = project.get("preferences", {}).get("timeline")
    project["proj_scope"] = project.get("preferences", {}).get("scope")
    project["proj_goal"] = project.get("preferences", {}).get("goal")
    project["proj_matchPercent"] = (
        project.get("selected_direction", {}) or {}
    ).get("match_percent")
    return project


def calculate_completion_percent(project):
    materials = project.get("materials", [])
    if not materials:
        return 0

    confirmed = sum(1 for item in materials if item["status"] == "confirmed")
    return round((confirmed / len(materials)) * 100)


def build_project_summary(project):
    summary = {
        "project_id": project["project_id"],
        "status": project["status"],
        "room_type": project.get("room_type"),
        "created_at": project["created_at"],
        "updated_at": project["updated_at"],
        "completion_percent": calculate_completion_percent(project),
        "selected_direction": project.get("selected_direction"),
    }

    apply_frontend_aliases(project)
    summary.update({
        "proj_id": project["proj_id"],
        "proj_title": project["proj_title"],
        "proj_status": project["proj_status"],
        "proj_updatedAt": project["proj_updatedAt"],
        "proj_createdAt": project["proj_createdAt"],
        "proj_completionPercent": project["proj_completionPercent"],
        "proj_budgetMaxOverride": project["proj_budgetMaxOverride"],
        "proj_budgetMinOverride": project["proj_budgetMinOverride"],
        "proj_budgetNotes": project["proj_budgetNotes"],
        "proj_timeline": project["proj_timeline"],
        "proj_scope": project["proj_scope"],
        "proj_goal": project["proj_goal"],
        "proj_matchPercent": project["proj_matchPercent"],
        "firm_id": project.get("firm_id"),
    })
    return summary


def list_projects():
    return {
        "projects": [
            build_project_summary(project)
            for project in projects.values()
        ]
    }


def get_recent_projects():
    recent_projects = sorted(
        projects.values(),
        key=lambda project: project["created_at"],
        reverse=True
    )

    return {
        "projects": [
            build_project_summary(project)
            for project in recent_projects[:5]
        ]
    }


def create_project(project):
    project_id = len(projects) + 1
    now = get_timestamp()
    project_data = project.model_dump(exclude_none=True)
    style_tags = project_data.get("style_tags") or project_data.get("style_chips") or []
    priorities = project_data.get("priorities") or []
    room_type = project_data.get("room_type")

    projects[project_id] = {
        "project_id": project_id,
        "status": "created",
        "firm_id": project.firm_id,
        "title": project_data.get("title"),
        "room_type": room_type,
        "created_at": now,
        "updated_at": now,
        "project": project,
        "chat_messages": [
            {
                "sender": "user",
                "message": project_data["chat_text"],
                "timestamp": now,
            }
        ] if project_data.get("chat_text") else [],
        "preferences": {
            "budget": project_data.get("budget"),
            "room_type": room_type,
            "timeline": project_data.get("timeline"),
            "timeline_weeks": project_data.get("timeline_weeks"),
            "scope": priorities[0] if priorities else None,
            "priorities": priorities,
            "style_tags": style_tags,
            "style_chips": project_data.get("style_chips") or style_tags,
            "goal": priorities[0] if priorities else None,
            "mood": style_tags[0] if style_tags else None,
            "room_sqft": project_data.get("room_sqft"),
            "budget_band": project_data.get("budget_band"),
            "direction_key": None,
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
        "handoff": None
    }

    return apply_frontend_aliases(projects[project_id])


def get_project(project_id: int):
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")

    return apply_frontend_aliases(projects[project_id])


def update_project(project_id: int, project):
    existing_project = get_project(project_id)
    project_data = project.model_dump(exclude_none=True)

    existing_project["project"] = project
    if project_data.get("title"):
        existing_project["title"] = project_data["title"]

    if project_data.get("room_type"):
        existing_project["room_type"] = project_data["room_type"]

    existing_project["status"] = "updated"
    existing_project["updated_at"] = get_timestamp()

    return apply_frontend_aliases(existing_project)


def delete_project(project_id: int):
    get_project(project_id)
    deleted_project = projects.pop(project_id)

    return {
        "status": "deleted",
        "deleted_project": deleted_project
    }


def add_chat_message(project_id: int, chat):
    project = get_project(project_id)

    if chat.timestamp is None:
        chat.timestamp = get_timestamp()

    project["chat_messages"].append(chat)
    project["updated_at"] = get_timestamp()

    return {
        "status": "message added",
        "project_id": project_id,
        "chat_messages": project["chat_messages"]
    }


def get_chat_messages(project_id: int):
    project = get_project(project_id)

    return {
        "project_id": project_id,
        "chat_messages": project["chat_messages"]
    }


def get_conversation(project_id: int):
    project = get_project(project_id)

    return {
        "project_id": project_id,
        "conversation": project["chat_messages"]
    }


def update_preferences(project_id: int, preferences):
    project = get_project(project_id)

    update_data = preferences.model_dump(exclude_none=True)
    if update_data.get("style_chips") and not update_data.get("style_tags"):
        update_data["style_tags"] = update_data["style_chips"]

    for key, value in update_data.items():
        project["preferences"][key] = value

        if key == "room_type":
            project["room_type"] = value
        elif key == "direction_key":
            project["selected_direction"] = {
                "pipeline_direction_key": value,
                "title": value.replace("_", " ").replace("-", " ").title(),
            }

    project["status"] = "intake_updated"
    project["updated_at"] = get_timestamp()

    return {
        "status": "preferences updated",
        "project_id": project_id,
        "preferences": project["preferences"],
        "project": apply_frontend_aliases(project),
    }


def add_image(project_id: int, image):
    project = get_project(project_id)

    image_id = len(project["images"]) + 1

    image_record = {
        "image_id": image_id,
        "filename": image.filename,
        "image_url": image.image_url,
        "uploaded_at": get_timestamp()
    }

    project["images"].append(image_record)
    project["updated_at"] = get_timestamp()

    return {
        "status": "image added",
        "project_id": project_id,
        "image": image_record
    }


def get_images(project_id: int):
    project = get_project(project_id)

    return {
        "project_id": project_id,
        "images": project["images"]
    }
