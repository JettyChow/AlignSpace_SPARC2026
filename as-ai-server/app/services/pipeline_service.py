import copy

from app.services import project_service
from app.mock_data.directions import DEFAULT_DIRECTIONS
from app.mock_data.materials import DEFAULT_MATERIALS
from app.mock_data.alternatives import DEFAULT_ALTERNATIVES


SOCKET_EVENTS = [
    "preferences_complete",
    "matching_styles",
    "directions_ready"
]


def generate_project(project_id: int):
    project = project_service.get_project(project_id)

    project["status"] = "processing"

    project["generation_status"] = {
        "status": "processing",
        "current_step": "matching_styles",
        "progress_percent": 50,
        "events": SOCKET_EVENTS[:2]
    }

    # Temporary mock AI output.
    # Later this will be replaced by Engineer 3 pipeline results.
    project["directions"] = copy.deepcopy(DEFAULT_DIRECTIONS)
    project["materials"] = copy.deepcopy(DEFAULT_MATERIALS)
    project["alternatives"] = copy.deepcopy(DEFAULT_ALTERNATIVES)

    project["generation_status"] = {
        "status": "complete",
        "current_step": "directions_ready",
        "progress_percent": 100,
        "events": SOCKET_EVENTS
    }

    project["status"] = "directions_ready"
    project["updated_at"] = project_service.get_timestamp()

    return {
        "status": "generation complete",
        "project_id": project_id,
        "directions": project["directions"],
        "materials": project["materials"],
        "alternatives": project["alternatives"]
    }


def get_project_status(project_id: int):
    project = project_service.get_project(project_id)

    return {
        "project_id": project_id,
        "status": project.get("status"),
        "generation_status": project.get(
            "generation_status",
            {
                "status": "not_started",
                "current_step": None,
                "progress_percent": 0,
                "events": []
            }
        )
    }