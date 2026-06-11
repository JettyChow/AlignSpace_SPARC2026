from fastapi import HTTPException

from app.services import project_service


VALID_MATERIAL_STATUSES = ["confirmed", "tbd", "saved_for_later", "swapped"]


def get_directions(project_id: int):
    project = project_service.get_project(project_id)

    return {
        "project_id": project_id,
        "directions": project.get("directions", [])
    }


def get_direction_detail(project_id: int, direction_id: int):
    project = project_service.get_project(project_id)

    for direction in project.get("directions", []):
        if direction["direction_id"] == direction_id:
            return {
                "project_id": project_id,
                "direction": direction,
                "materials": project.get("materials", []),
                "alternatives": project.get("alternatives", [])
            }

    raise HTTPException(status_code=404, detail="Direction not found")


def select_direction(project_id: int, direction_id: int):
    project = project_service.get_project(project_id)

    for direction in project.get("directions", []):
        if direction["direction_id"] == direction_id:
            project["selected_direction"] = direction
            project["status"] = "direction_selected"
            project["updated_at"] = project_service.get_timestamp()

            return {
                "status": "direction selected",
                "project_id": project_id,
                "selected_direction": direction
            }

    raise HTTPException(status_code=404, detail="Direction not found")


def shuffle_directions(project_id: int):
    project = project_service.get_project(project_id)

    directions = project.get("directions", [])

    if not directions:
        raise HTTPException(
            status_code=400,
            detail="No directions available. Generate directions first."
        )

    directions.reverse()
    project["directions"] = directions
    project["updated_at"] = project_service.get_timestamp()

    return {
        "status": "directions shuffled",
        "project_id": project_id,
        "directions": directions
    }


def get_alternatives(project_id: int):
    project = project_service.get_project(project_id)

    return {
        "project_id": project_id,
        "alternatives": project.get("alternatives", [])
    }


def get_materials(project_id: int):
    project = project_service.get_project(project_id)

    return {
        "project_id": project_id,
        "materials": project.get("materials", [])
    }


def update_material(project_id: int, material_id: int, status: str):
    project = project_service.get_project(project_id)

    if status not in VALID_MATERIAL_STATUSES:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid material status",
                "valid_statuses": VALID_MATERIAL_STATUSES
            }
        )

    materials = project.get("materials", [])

    if not materials:
        raise HTTPException(
            status_code=400,
            detail="No materials available. Generate project first."
        )

    for material in materials:
        if material["material_id"] == material_id:
            material["status"] = status
            project["updated_at"] = project_service.get_timestamp()

            return {
                "status": "material updated",
                "project_id": project_id,
                "material": material
            }

    raise HTTPException(status_code=404, detail="Material not found")


def get_tracker(project_id: int):
    project = project_service.get_project(project_id)
    materials = project.get("materials", [])

    confirmed = sum(1 for item in materials if item["status"] == "confirmed")
    tbd = sum(1 for item in materials if item["status"] == "tbd")
    saved_for_later = sum(1 for item in materials if item["status"] == "saved_for_later")
    swapped = sum(1 for item in materials if item["status"] == "swapped")

    total = len(materials)
    completion_percent = round((confirmed / total) * 100) if total > 0 else 0

    return {
        "project_id": project_id,
        "confirmed": confirmed,
        "tbd": tbd,
        "saved_for_later": saved_for_later,
        "swapped": swapped,
        "completionPercent": completion_percent
    }


def get_budget(project_id: int):
    project = project_service.get_project(project_id)
    materials = project.get("materials", [])

    estimate = sum(
        item["price"]
        for item in materials
        if item["status"] in ["confirmed", "tbd", "saved_for_later"]
    )

    budget_fit = "within"
    warnings = []

    preferences = project.get("preferences", {})
    budget = preferences.get("budget")

    if budget:
        try:
            budget_number = int(str(budget).replace("$", "").replace(",", ""))
            if estimate > budget_number:
                budget_fit = "over"
                warnings.append("Estimated total exceeds stated budget.")
        except ValueError:
            warnings.append("Budget could not be parsed as a number.")

    return {
        "project_id": project_id,
        "estimate": estimate,
        "budgetFit": budget_fit,
        "warnings": warnings
    }


def recalculate_budget(project_id: int):
    project = project_service.get_project(project_id)

    budget = get_budget(project_id)
    project["budget"] = budget
    project["updated_at"] = project_service.get_timestamp()

    return {
        "status": "budget recalculated",
        "project_id": project_id,
        "budget": budget
    }


def get_summary(project_id: int):
    project = project_service.get_project(project_id)

    tracker = get_tracker(project_id)
    budget = get_budget(project_id)

    return {
        "project_id": project_id,
        "status": project["status"],
        "room_type": project.get("room_type"),
        "created_at": project["created_at"],
        "preferences": project["preferences"],
        "selected_direction": project.get("selected_direction"),
        "materials": project.get("materials", []),
        "tracker": tracker,
        "budget": budget,
        "images": project.get("images", []),
        "handoff": project.get("handoff")
    }


def handoff_to_designer(project_id: int, handoff_request):
    project = project_service.get_project(project_id)

    handoff = {
        "designer_id": handoff_request.designer_id,
        "notes": handoff_request.notes,
        "handoff_at": project_service.get_timestamp(),
        "status": "sent_to_designer"
    }

    project["handoff"] = handoff
    project["status"] = "sent_to_designer"
    project["updated_at"] = project_service.get_timestamp()

    return {
        "status": "sent_to_designer",
        "project_id": project_id,
        "handoff": handoff
    }