from fastapi import APIRouter

from app.services import designer_service


router = APIRouter(prefix="/designer", tags=["Designer"])


@router.get("/projects")
def list_designer_projects():
    return designer_service.list_designer_projects()


@router.get("/projects/{project_id}")
def get_designer_project(project_id: int):
    return designer_service.get_designer_project(project_id)