from pydantic import BaseModel
from typing import List, Optional


class Direction(BaseModel):
    direction_id: int
    title: str
    image: Optional[str] = None
    cost_range: str
    tags: List[str] = []


class DirectionSelection(BaseModel):
    direction_id: int


class Material(BaseModel):
    material_id: int
    name: str
    category: str
    price: int
    status: str = "tbd"


class MaterialUpdate(BaseModel):
    status: str


class HandoffRequest(BaseModel):
    designer_id: Optional[int] = None
    designer_name: Optional[str] = None
    notes: Optional[str] = None