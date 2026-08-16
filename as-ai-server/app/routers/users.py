from fastapi import APIRouter, Request

from app.schemas.user import RoleUpdate
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
def get_current_user(request: Request):
    return user_service.get_current_user(request)

@router.patch("/me/role")
def update_user_role(role_update: RoleUpdate, request: Request):
    return user_service.update_user_role(role_update.role, request)
