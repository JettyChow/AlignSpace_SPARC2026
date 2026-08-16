from fastapi import APIRouter, Request

from app.schemas.project import ProjectCreate, ChatMessage, PreferenceUpdate, ImageCreate
from app.services import project_service


router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("")
def list_projects(request: Request):
    return project_service.list_projects(request)


@router.get("/recent")
def get_recent_projects(limit: int):
    return project_service.get_recent_projects()


@router.post("")
def create_project(project: ProjectCreate, request: Request):
    return project_service.create_project(project, request)


@router.get("/{project_id}")
def get_project(project_id: int, request: Request):
    return project_service.get_project(project_id, request)


@router.put("/{project_id}")
def update_project(project_id: int, project: ProjectCreate, request: Request):
    return project_service.update_project(project_id, project, request)


@router.delete("/{project_id}")
def delete_project(project_id: int, request: Request):
    return project_service.delete_project(project_id, request)


@router.post("/{project_id}/messages")
def add_chat_message(project_id: int, chat: ChatMessage, request: Request):
    return project_service.add_chat_message(project_id, chat, request)


@router.get("/{project_id}/messages")
def get_chat_messages(project_id: int, request: Request):
    return project_service.get_chat_messages(project_id, request)


@router.get("/{project_id}/conversation")
def get_conversation(project_id: int, request: Request):
    return project_service.get_conversation(project_id, request)


@router.post("/{project_id}/preferences")
def update_preferences(project_id: int, preferences: PreferenceUpdate, request: Request):
    return project_service.update_preferences(project_id, preferences, request)


@router.post("/{project_id}/images")
def add_image(project_id: int, image: ImageCreate, request: Request):
    return project_service.add_image(project_id, image, request)


@router.get("/{project_id}/images")
def get_images(project_id: int, request: Request):
    return project_service.get_images(project_id, request)


@router.get("/{project_id}/brief.pdf")
def download_project_brief_pdf(project_id: int, request: Request):
    return project_service.download_project_brief_pdf(project_id, request)


@router.get("/{project_id}/brief/download")
def download_project_brief(project_id: int, request: Request):
    return project_service.download_project_brief_pdf(project_id, request)
