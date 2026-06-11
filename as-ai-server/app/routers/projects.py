from fastapi import APIRouter

from app.schemas.project import ProjectCreate, ChatMessage, PreferenceUpdate, ImageCreate
from app.services import project_service


router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("")
def list_projects():
    return project_service.list_projects()


@router.get("/recent")
def get_recent_projects(limit: int):
    return project_service.get_recent_projects()


@router.post("")
def create_project(project: ProjectCreate):
    return project_service.create_project(project)


@router.get("/{project_id}")
def get_project(project_id: int):
    return project_service.get_project(project_id)


@router.put("/{project_id}")
def update_project(project_id: int, project: ProjectCreate):
    return project_service.update_project(project_id, project)


@router.delete("/{project_id}")
def delete_project(project_id: int):
    return project_service.delete_project(project_id)


@router.post("/{project_id}/messages")
def add_chat_message(project_id: int, chat: ChatMessage):
    return project_service.add_chat_message(project_id, chat)


@router.get("/{project_id}/messages")
def get_chat_messages(project_id: int):
    return project_service.get_chat_messages(project_id)


@router.get("/{project_id}/conversation")
def get_conversation(project_id: int):
    return project_service.get_conversation(project_id)


@router.post("/{project_id}/preferences")
def update_preferences(project_id: int, preferences: PreferenceUpdate):
    return project_service.update_preferences(project_id, preferences)


@router.post("/{project_id}/images")
def add_image(project_id: int, image: ImageCreate):
    return project_service.add_image(project_id, image)


@router.get("/{project_id}/images")
def get_images(project_id: int):
    return project_service.get_images(project_id)