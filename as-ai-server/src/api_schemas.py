"""
HTTP request/response schemas for the AI pipeline service.

These Pydantic models are the contract the backend (Engineer 2) codes against.
They sit at the API boundary; internally the pipeline uses plain dataclasses
(see pipeline/models.py). We convert at the edges so the core pipeline stays
dependency-free and unit-testable without FastAPI.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from pipeline import ClientBrief


# --- Requests ---------------------------------------------------------------

class BriefRequest(BaseModel):
    """Raw client input the frontend collects and the backend forwards to us."""
    firm_id: str = Field(..., description="Multi-tenancy key; scopes everything.")
    project_id: str
    room_type: str = "bathroom"
    room_sqft: float = Field(40.0, gt=0, description="Drives material quantities.")
    budget_band: str = Field("medium", description='"low" | "medium" | "high"')
    timeline_weeks: Optional[int] = None
    priorities: list[str] = Field(default_factory=list)
    style_chips: list[str] = Field(default_factory=list)
    chat_text: str = ""

    def to_brief(self) -> ClientBrief:
        """Convert the wire model into the internal pipeline dataclass."""
        return ClientBrief(
            firm_id=self.firm_id,
            project_id=self.project_id,
            room_type=self.room_type,
            room_sqft=self.room_sqft,
            budget_band=self.budget_band,
            timeline_weeks=self.timeline_weeks,
            priorities=self.priorities,
            style_chips=self.style_chips,
            chat_text=self.chat_text,
        )


class AssembleRequest(BaseModel):
    """
    Phase B input: the original brief plus the direction the client tapped.
    `direction_key` is one of the keys returned by /intake (e.g. "japandi").
    """
    brief: BriefRequest
    direction_key: str


class PipelineRequest(BaseModel):
    """Convenience: run the whole arc. Optionally pin a direction; else top match."""
    brief: BriefRequest
    direction_key: Optional[str] = None


# --- Responses are returned as plain dicts (dataclass -> asdict) so we don't
#     have to mirror every internal model in Pydantic. FastAPI serializes them
#     directly. See main.py for the response_model=None routes.
