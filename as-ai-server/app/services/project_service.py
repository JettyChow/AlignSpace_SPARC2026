from datetime import datetime, timezone
from io import BytesIO
from textwrap import wrap

from fastapi import HTTPException
from fastapi.responses import Response

from app.services import auth_service, project_store


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


def _current_user(request=None):
    return auth_service.current_user_from_request(request)


def _memory_projects_for_user(current_user):
    return [
        project
        for project in projects.values()
        if _project_belongs_to_user(project, current_user)
    ]


def save_project(project):
    """Persist a project after services mutate the existing API shape."""
    projects[project["project_id"]] = project
    project_store.save_project(project)
    return project


def _project_belongs_to_user(project, current_user):
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        return True

    owner = project.get("clerk_user_id")
    return owner in (None, clerk_user_id)


def _project_title(project):
    if project.get("title"):
        return project["title"]

    room_type = project.get("room_type") or project.get("preferences", {}).get("room_type")
    if room_type:
        return f"{str(room_type).replace('_', ' ').title()} Renovation"

    return f"Project {project['project_id']}"


def _budget_display(project):
    # The client's stated budget (budget_max) is the honest value for a field
    # named budgetMaxOverride; the AI's estimated_total is a materials output,
    # kept only as a fallback for projects that never stated a figure.
    preferences = project.get("preferences", {})
    if preferences.get("budget_max"):
        return _money(preferences["budget_max"])

    ai_budget = project.get("ai_budget") or {}
    if ai_budget.get("estimated_total") is not None:
        return _money(ai_budget["estimated_total"])

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
    project["user_id_client"] = project.get("user_id_client")
    project["clerk_user_id"] = project.get("clerk_user_id")
    project["client"] = project.get("client")
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


def list_projects(request=None):
    current_user = _current_user(request)
    stored_projects = project_store.list_projects(current_user.get("clerk_user_id"))
    source_projects = stored_projects if stored_projects is not None else _memory_projects_for_user(current_user)

    return {
        "projects": [
            build_project_summary(project)
            for project in source_projects
        ]
    }


def get_recent_projects(limit=5):
    stored_projects = project_store.list_projects(limit=limit)
    if stored_projects is not None:
        recent_projects = stored_projects
    else:
        recent_projects = sorted(
            projects.values(),
            key=lambda project: project["created_at"],
            reverse=True
        )[:limit]

    return {
        "projects": [
            build_project_summary(project)
            for project in recent_projects
        ]
    }


def create_project(project, request=None):
    now = get_timestamp()
    current_user = _current_user(request)
    project_data = project.model_dump(exclude_none=True)
    project_id = project_store.create_project_id(project_data, current_user) or (max(projects.keys(), default=0) + 1)
    style_tags = project_data.get("style_tags") or project_data.get("style_chips") or []
    priorities = project_data.get("priorities") or []
    room_type = project_data.get("room_type")

    projects[project_id] = {
        "project_id": project_id,
        "status": "created",
        "firm_id": project.firm_id,
        "user_id_client": current_user.get("user_id"),
        "clerk_user_id": current_user.get("clerk_user_id"),
        "client": {
            "user_id": current_user.get("user_id"),
            "clerk_user_id": current_user.get("clerk_user_id"),
            "user_firstName": current_user.get("first_name"),
            "user_lastName": current_user.get("last_name"),
            "user_email": current_user.get("email"),
            "display_name": current_user.get("display_name"),
        },
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
            "budget_max": project_data.get("budget_max"),
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

    save_project(projects[project_id])
    return apply_frontend_aliases(projects[project_id])


def get_project(project_id: int, request=None):
    stored_project = project_store.get_project(project_id)
    if stored_project is not None:
        projects[project_id] = stored_project

    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")

    project = projects[project_id]
    current_user = _current_user(request)
    if not _project_belongs_to_user(project, current_user):
        raise HTTPException(status_code=403, detail="You do not have access to this project.")

    return apply_frontend_aliases(project)


def update_project(project_id: int, project, request=None):
    existing_project = get_project(project_id, request)
    project_data = project.model_dump(exclude_unset=True)

    existing_project["project"] = project
    if project_data.get("title"):
        existing_project["title"] = project_data["title"]

    if project_data.get("room_type"):
        existing_project["room_type"] = project_data["room_type"]

    # PUT binds the full ProjectCreate schema; previously everything except
    # title/room_type was validated, 200'd, and dropped. Merge the intake
    # fields into preferences (the only place _build_brief reads).
    for key in ("budget", "budget_band", "budget_max", "room_sqft",
                "timeline", "timeline_weeks", "priorities",
                "style_chips", "style_tags"):
        if key in project_data:
            existing_project["preferences"][key] = project_data[key]

    existing_project["status"] = "updated"
    existing_project["updated_at"] = get_timestamp()

    save_project(existing_project)
    return apply_frontend_aliases(existing_project)


def delete_project(project_id: int, request=None):
    get_project(project_id, request)
    deleted_project = projects.pop(project_id)
    project_store.delete_project(project_id)

    return {
        "status": "deleted",
        "deleted_project": deleted_project
    }


def add_chat_message(project_id: int, chat, request=None):
    project = get_project(project_id, request)
    current_user = _current_user(request)

    if chat.timestamp is None:
        chat.timestamp = get_timestamp()

    message_record = chat.model_dump()
    message_record["user_id_sender"] = current_user.get("user_id")
    message_record["clerk_user_id"] = current_user.get("clerk_user_id")
    project["chat_messages"].append(message_record)
    project["updated_at"] = get_timestamp()
    save_project(project)

    return {
        "status": "message added",
        "project_id": project_id,
        "chat_messages": project["chat_messages"]
    }


def get_chat_messages(project_id: int, request=None):
    project = get_project(project_id, request)

    return {
        "project_id": project_id,
        "chat_messages": project["chat_messages"]
    }


def get_conversation(project_id: int, request=None):
    project = get_project(project_id, request)

    return {
        "project_id": project_id,
        "conversation": project["chat_messages"]
    }


def update_preferences(project_id: int, preferences, request=None):
    project = get_project(project_id, request)

    # exclude_unset (not exclude_none): fields the caller didn't send must not
    # appear at all — with exclude_none the list fields' [] defaults survived
    # and wiped stored style_tags/style_chips/priorities on every partial
    # update. An explicitly sent null now comes through as None and clears the
    # field (the only way to reset a mistyped budget_max, since gt=0 rejects 0).
    update_data = preferences.model_dump(exclude_unset=True)
    if update_data.get("style_chips") and not update_data.get("style_tags"):
        update_data["style_tags"] = update_data["style_chips"]

    for key, value in update_data.items():
        project["preferences"][key] = value

        if key == "room_type" and value:
            project["room_type"] = value
        elif key == "direction_key" and value:
            project["selected_direction"] = {
                "pipeline_direction_key": value,
                "title": value.replace("_", " ").replace("-", " ").title(),
            }

    project["status"] = "intake_updated"
    project["updated_at"] = get_timestamp()
    save_project(project)

    return {
        "status": "preferences updated",
        "project_id": project_id,
        "preferences": project["preferences"],
        "project": apply_frontend_aliases(project),
    }


def add_image(project_id: int, image, request=None):
    project = get_project(project_id, request)
    current_user = _current_user(request)

    image_id = len(project["images"]) + 1

    image_record = {
        "image_id": image_id,
        "filename": image.filename,
        "image_url": image.image_url,
        "uploaded_by": current_user.get("user_id"),
        "clerk_user_id": current_user.get("clerk_user_id"),
        "uploaded_at": get_timestamp()
    }

    project["images"].append(image_record)
    project["updated_at"] = get_timestamp()
    save_project(project)

    return {
        "status": "image added",
        "project_id": project_id,
        "image": image_record
    }


def get_images(project_id: int, request=None):
    project = get_project(project_id, request)

    return {
        "project_id": project_id,
        "images": project["images"]
    }


def _pdf_escape(text):
    return str(text).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _brief_lines(project):
    preferences = project.get("preferences", {})
    selected_direction = project.get("selected_direction") or {}
    budget = project.get("ai_budget") or project.get("budget") or {}
    materials = project.get("materials", [])
    ai_deliverable = project.get("ai_deliverable") or {}

    lines = [
        "AlignSpace Project Brief",
        "",
        f"Project: {_project_title(project)}",
        f"Status: {_status_label(project.get('status'))}",
        f"Room type: {project.get('room_type') or preferences.get('room_type') or 'Not specified'}",
        f"Goal: {preferences.get('goal') or preferences.get('scope') or 'Not specified'}",
        f"Style: {', '.join(preferences.get('style_tags') or preferences.get('style_chips') or []) or 'Not specified'}",
        f"Budget band: {preferences.get('budget_band') or 'Not specified'}",
        f"Selected direction: {selected_direction.get('title') or selected_direction.get('pipeline_direction_key') or 'Not selected'}",
    ]

    if budget:
        estimated_total = budget.get("estimated_total") if isinstance(budget, dict) else None
        if estimated_total is not None:
            lines.append(f"Estimated total: {_money(estimated_total)}")

    if materials:
        lines.extend(["", "Materials:"])
        for material in materials[:20]:
            lines.append(
                f"- {material.get('name')} ({material.get('category')}) {_money(material.get('price')) or ''}".strip()
            )

    if ai_deliverable.get("document_markdown"):
        lines.extend(["", "AI brief:", ai_deliverable["document_markdown"][:1200]])

    return lines


def _make_simple_pdf(lines):
    wrapped_lines = []
    for line in lines:
        wrapped = wrap(str(line), width=88) or [""]
        wrapped_lines.extend(wrapped)

    content_lines = ["BT", "/F1 11 Tf", "50 760 Td", "14 TL"]
    for line in wrapped_lines[:48]:
        content_lines.append(f"({_pdf_escape(line)}) Tj")
        content_lines.append("T*")
    content_lines.append("ET")
    content = "\n".join(content_lines).encode("latin-1", errors="replace")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(content)).encode("ascii") + b" >>\nstream\n" + content + b"\nendstream",
    ]

    pdf = BytesIO()
    pdf.write(b"%PDF-1.4\n")
    offsets = []
    for index, obj in enumerate(objects, start=1):
        offsets.append(pdf.tell())
        pdf.write(f"{index} 0 obj\n".encode("ascii"))
        pdf.write(obj)
        pdf.write(b"\nendobj\n")

    xref_start = pdf.tell()
    pdf.write(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    pdf.write(b"0000000000 65535 f \n")
    for offset in offsets:
        pdf.write(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.write(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF\n".encode("ascii")
    )
    return pdf.getvalue()


def download_project_brief_pdf(project_id: int, request=None):
    project = get_project(project_id, request)
    pdf_bytes = _make_simple_pdf(_brief_lines(project))
    filename = f"alignspace-project-{project_id}-brief.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
