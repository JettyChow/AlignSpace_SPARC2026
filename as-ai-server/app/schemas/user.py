from pydantic import BaseModel
from typing import Optional


class UserResponse(BaseModel):
    user_id: str
    clerk_user_id: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    display_name: Optional[str] = None
    role: Optional[str] = None
    firm_id: Optional[str] = None


class RoleUpdate(BaseModel):
    role: str
