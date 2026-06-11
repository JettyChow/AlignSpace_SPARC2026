from pydantic import BaseModel
from typing import List, Optional


class ProjectCreate(BaseModel):
    pass


class ChatMessage(BaseModel):
    sender: str = "user"
    message: str
    timestamp: Optional[str] = None


class PreferenceUpdate(BaseModel):
    budget: Optional[str] = None
    room_type: Optional[str] = None
    timeline: Optional[str] = None
    scope: Optional[str] = None
    style_tags: Optional[List[str]] = []
    goal: Optional[str] = None
    mood: Optional[str] = None


class ImageCreate(BaseModel):
    filename: str
    image_url: str