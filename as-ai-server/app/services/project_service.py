from datetime import datetime, timezone
from fastapi import HTTPException


projects = {}


def get_timestamp():
    return datetime.now(timezone.utc).isoformat()


def calculate_completion_percent(project):
    materials = project.get("materials", [])
    if not materials:
        return 0

    confirmed = sum(1 for item in materials if item["status"] == "confirmed")
    return round((confirmed / len(materials)) * 100)


def build_project_summary(project):
    return {
        "project_id": project["project_id"],
        "status": project["status"],
        "room_type": project.get("room_type"),
        "created_at": project["created_at"],
        "updated_at": project["updated_at"],
        "completion_percent": calculate_completion_percent(project),
        "selected_direction": project.get("selected_direction"),
    }


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

    projects[project_id] = {
        "project_id": project_id,
        "status": "created",
        "room_type": None,
        "created_at": now,
        "updated_at": now,
        "project": project,
        "chat_messages": [],
        "preferences": {
            "budget": None,
            "room_type": None,
            "timeline": None,
            "scope": None,
            "style_tags": [],
            "goal": None,
            "mood": None
        },
        "images": [],
        "directions": [],
        "selected_direction": None,
        "materials": [],
        "alternatives": [],
        "budget": None,
        "handoff": None
    }

    return projects[project_id]


def get_project(project_id: int):
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")

    return projects[project_id]


def update_project(project_id: int, project):
    existing_project = get_project(project_id)

    existing_project["project"] = project
    existing_project["status"] = "updated"
    existing_project["updated_at"] = get_timestamp()

    return existing_project


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

    for key, value in update_data.items():
        project["preferences"][key] = value

        if key == "room_type":
            project["room_type"] = value

    project["status"] = "intake_updated"
    project["updated_at"] = get_timestamp()

    return {
        "status": "preferences updated",
        "project_id": project_id,
        "preferences": project["preferences"]
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