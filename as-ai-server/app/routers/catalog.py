from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import catalog_service


router = APIRouter(prefix="/presets", tags=["Catalog"])


@router.get("/{preset_id}/items")
def get_preset_items(preset_id: int, db: Session = Depends(get_db)):
    return catalog_service.get_preset_items(preset_id, db)
