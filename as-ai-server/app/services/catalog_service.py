from decimal import Decimal
from typing import Any

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from fastapi import HTTPException


def _json_value(value: Any) -> Any:
    if isinstance(value, Decimal):
        return float(value)
    return value


def _money_source(row: dict[str, Any]) -> Any:
    return row.get("presetItem_unitCost") if row.get("presetItem_unitCost") is not None else row.get("item_cost")


def _format_preset_item(row: dict[str, Any]) -> dict[str, Any]:
    price = _json_value(_money_source(row))
    image_url = row.get("item_imageUrl")

    return {
        "preset_item_id": row.get("presetItem_id"),
        "preset_id": row.get("preset_id"),
        "item_id": row.get("item_id"),
        "product_name": row.get("item_name"),
        "price": price,
        "image_url": image_url,
        "category": row.get("item_category"),
        "brand": row.get("item_brand"),
        "model": row.get("item_model"),
        "set": row.get("item_set"),
        "quantity": row.get("presetItem_quantity"),
        "notes": row.get("presetItem_notes"),
        "is_required": row.get("presetItem_isRequired"),
        "rank": row.get("presetItem_rank"),
        # DBML-style aliases for screens that mirror the database columns.
        "presetItem_id": row.get("presetItem_id"),
        "presetItem_quantity": row.get("presetItem_quantity"),
        "presetItem_unitCost": _json_value(row.get("presetItem_unitCost")),
        "presetItem_notes": row.get("presetItem_notes"),
        "presetItem_isRequired": row.get("presetItem_isRequired"),
        "presetItem_rank": row.get("presetItem_rank"),
        "item_name": row.get("item_name"),
        "item_brand": row.get("item_brand"),
        "item_category": row.get("item_category"),
        "item_model": row.get("item_model"),
        "item_cost": _json_value(row.get("item_cost")),
        "item_set": row.get("item_set"),
        "item_imageUrl": image_url,
    }


def get_preset_items(preset_id: int, db: Session) -> dict[str, Any]:
    try:
        rows = db.execute(
            text(
                """
                SELECT
                    pi."presetItem_id",
                    pi.preset_id,
                    pi.item_id,
                    pi."presetItem_quantity",
                    pi."presetItem_unitCost",
                    pi."presetItem_notes",
                    pi."presetItem_isRequired",
                    pi."presetItem_rank",
                    i.item_name,
                    i.item_brand,
                    i.item_category,
                    i.item_model,
                    i.item_cost,
                    i.item_set,
                    i."item_imageUrl"
                FROM preset_items pi
                JOIN items i ON i.item_id = pi.item_id
                WHERE pi.preset_id = :preset_id
                ORDER BY
                    pi."presetItem_rank" NULLS LAST,
                    pi."presetItem_id"
                """
            ),
            {"preset_id": preset_id},
        ).mappings().all()
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail="Catalog database query failed.") from exc

    return {
        "preset_id": preset_id,
        "items": [_format_preset_item(dict(row)) for row in rows],
    }
