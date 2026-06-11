from fastapi import APIRouter

from app.schemas.design import DirectionSelection, MaterialUpdate, HandoffRequest
from app.services import design_service


router = APIRouter(prefix="/projects", tags=["Design"])


@router.get("/{project_id}/directions")
def get_directions(project_id: int):
    return design_service.get_directions(project_id)


@router.get("/{project_id}/directions/{direction_id}")
def get_direction_detail(project_id: int, direction_id: int):
    return design_service.get_direction_detail(project_id, direction_id)


@router.post("/{project_id}/directions/select")
def select_direction(project_id: int, selection: DirectionSelection):
    return design_service.select_direction(
        project_id=project_id,
        direction_id=selection.direction_id
    )


@router.post("/{project_id}/directions/shuffle")
def shuffle_directions(project_id: int):
    return design_service.shuffle_directions(project_id)


@router.get("/{project_id}/alternatives")
def get_alternatives(project_id: int):
    return design_service.get_alternatives(project_id)


@router.get("/{project_id}/materials")
def get_materials(project_id: int):
    return design_service.get_materials(project_id)


@router.patch("/{project_id}/materials/{material_id}")
def update_material(project_id: int, material_id: int, update: MaterialUpdate):
    return design_service.update_material(
        project_id=project_id,
        material_id=material_id,
        status=update.status
    )


@router.get("/{project_id}/tracker")
def get_tracker(project_id: int):
    return design_service.get_tracker(project_id)


@router.get("/{project_id}/budget")
def get_budget(project_id: int):
    return design_service.get_budget(project_id)


@router.post("/{project_id}/budget/recalculate")
def recalculate_budget(project_id: int):
    return design_service.recalculate_budget(project_id)


@router.get("/{project_id}/summary")
def get_summary(project_id: int):
    return design_service.get_summary(project_id)


@router.post("/{project_id}/handoff")
def handoff_to_designer(project_id: int, handoff_request: HandoffRequest):
    return design_service.handoff_to_designer(project_id, handoff_request)