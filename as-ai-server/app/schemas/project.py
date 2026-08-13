from pydantic import BaseModel, Field
from typing import List, Optional


class ProjectCreate(BaseModel):
    firm_id: str = "firm_default"
    title: Optional[str] = None
    room_type: Optional[str] = None
    room_sqft: Optional[float] = Field(default=None, gt=0)
    budget: Optional[str] = None
    budget_band: Optional[str] = None
    timeline: Optional[str] = None
    timeline_weeks: Optional[int] = None
    priorities: Optional[List[str]] = []
    style_chips: Optional[List[str]] = []
    style_tags: Optional[List[str]] = []
    chat_text: Optional[str] = None


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
    room_sqft: Optional[float] = Field(default=None, gt=0)
    budget_band: Optional[str] = None
    priorities: Optional[List[str]] = []
    style_chips: Optional[List[str]] = []
    direction_key: Optional[str] = None


class ImageCreate(BaseModel):
    filename: str
    image_url: str
