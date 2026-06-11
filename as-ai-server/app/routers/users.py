from fastapi import APIRouter

from app.schemas.user import RoleUpdate
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
def get_current_user():
    return user_service.get_current_user()

@router.patch("/me/role")
def update_user_role(role_update: RoleUpdate):
    return user_service.update_user_role(role_update.role)