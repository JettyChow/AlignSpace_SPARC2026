from typing import Any

from fastapi import APIRouter

from app.services import pipeline_service


router = APIRouter(tags=["AI Pipeline Proxy"])


@router.get("/presets/directions")
def get_preset_directions():
    return pipeline_service.proxy_pipeline_get("/presets/directions")


@router.post("/intake")
def intake_proxy(payload: dict[str, Any]):
    return pipeline_service.proxy_pipeline_post("/intake", payload)


@router.post("/assemble")
def assemble_proxy(payload: dict[str, Any]):
    return pipeline_service.proxy_pipeline_post("/assemble", payload)


@router.post("/pipeline/run")
def pipeline_run_proxy(payload: dict[str, Any]):
    return pipeline_service.proxy_pipeline_post("/pipeline/run", payload)
