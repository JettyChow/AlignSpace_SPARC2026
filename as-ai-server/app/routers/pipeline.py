from fastapi import APIRouter

from app.services import pipeline_service


router = APIRouter(prefix="/projects", tags=["Pipeline"])


@router.post("/{project_id}/generate")
def generate_project(project_id: int):
    return pipeline_service.generate_project(project_id)


@router.get("/{project_id}/status")
def get_project_status(project_id: int):
    return pipeline_service.get_project_status(project_id)