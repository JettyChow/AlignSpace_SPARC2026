"""
AlignSpace — Pipeline data contracts.

These are the shared data structures that flow between the agents in the
AI pipeline. They are the "contract" every other engineer codes against:

  - Engineer 2 (Backend) builds the ClientBrief from chat + chips and reads
    back the RenovationPackage to expose via the API.
  - Engineer 4 (Infra/Data) maps these shapes onto the PostgreSQL tables.

Implemented with stdlib dataclasses so the whole pipeline runs with zero
external dependencies. They map 1:1 onto Pydantic models when wired into
FastAPI (just swap `@dataclass` for `class X(BaseModel)`).
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Optional


# ---------------------------------------------------------------------------
# INPUT  — what the frontend/backend hands the pipeline
# ---------------------------------------------------------------------------

@dataclass
class ClientBrief:
    """Raw, merged client input. The single source of truth entering the pipeline."""
    firm_id: str                       # multi-tenancy key — scopes everything
    project_id: str
    room_type: str = "bathroom"        # MVP supports bathroom only
    room_sqft: float = 40.0            # structured input → drives cost estimates
    budget_band: str = "medium"        # "low" | "medium" | "high" | "luxury"
    timeline_weeks: Optional[int] = None
    priorities: list[str] = field(default_factory=list)   # e.g. "more storage"
    style_chips: list[str] = field(default_factory=list)  # e.g. "modern", "warm"
    chat_text: str = ""                # free-form natural language from the client


# ---------------------------------------------------------------------------
# AGENT 1 OUTPUT  — structured intent
# ---------------------------------------------------------------------------

@dataclass
class ClientProfile:
    """Structured design intent extracted from the messy brief (Agent 1 output)."""
    styles: dict[str, float] = field(default_factory=dict)  # style -> 0..1 weight
    functions: list[str] = field(default_factory=list)      # functional needs
    must_haves: list[str] = field(default_factory=list)
    avoid: list[str] = field(default_factory=list)
    budget_band: str = "medium"
    extraction_source: str = "rule_based"  # "claude" or "rule_based" (fallback)
    notes: str = ""


# ---------------------------------------------------------------------------
# AGENT 3 OUTPUT  — ranked design directions
# ---------------------------------------------------------------------------

@dataclass
class DesignDirection:
    """One renovation direction the client can pick (Agent 3 output)."""
    key: str
    name: str
    blurb: str
    style_tags: list[str]
    match_score: float = 0.0       # how well it fits the client profile (0..1)
    est_low: float = 0.0           # estimated materials cost range (USD)
    est_high: float = 0.0


# ---------------------------------------------------------------------------
# AGENT 4 OUTPUT  — assembled material package
# ---------------------------------------------------------------------------

@dataclass
class LineItem:
    """A single specced product line in a material package."""
    category: str          # vanity, floor_tile, faucet, ...
    product_name: str
    tier: str              # budget | standard | premium
    unit: str              # "each" | "sqft"
    unit_price: float
    quantity: float
    subtotal: float
    confidence: float      # 0..1 — how sure the agent is about this pick
    flagged: bool = False  # True -> surfaced for designer review
    flag_reason: Optional[str] = None


@dataclass
class MaterialPackage:
    """Full spec for one direction (Agent 4 output)."""
    direction_key: str
    direction_name: str
    line_items: list[LineItem] = field(default_factory=list)
    estimated_total: float = 0.0


# ---------------------------------------------------------------------------
# AGENT 5 OUTPUT  — budget verdict
# ---------------------------------------------------------------------------

@dataclass
class Swap:
    category: str
    from_product: str
    to_product: str
    savings: float


@dataclass
class BudgetReport:
    """Budget check + cost-reduction suggestions (Agent 5 output)."""
    budget_band: str
    band_ceiling: float
    estimated_total: float
    status: str                       # "within" | "over"
    overage: float = 0.0
    suggested_swaps: list[Swap] = field(default_factory=list)
    adjusted_total: float = 0.0       # total after applying suggested swaps
    fits_after_swaps: bool = True     # False -> still over ceiling with every swap applied


# ---------------------------------------------------------------------------
# AGENT 6 OUTPUT  — the deliverable handed to the designer
# ---------------------------------------------------------------------------

@dataclass
class RenovationPackage:
    """Final structured deliverable (Agent 6 output)."""
    project_id: str
    firm_id: str
    profile: ClientProfile
    chosen_direction: DesignDirection
    package: MaterialPackage
    budget: BudgetReport
    scope_summary: str
    markdown: str          # human-readable rendering for PDF / preview

    def to_dict(self) -> dict:
        return asdict(self)
