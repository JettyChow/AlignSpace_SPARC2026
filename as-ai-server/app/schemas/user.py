from pydantic import BaseModel
from typing import Optional


class UserResponse(BaseModel):
    user_id: str
    role: Optional[str] = None
    firm_id: Optional[str] = None


class RoleUpdate(BaseModel):
    role: str