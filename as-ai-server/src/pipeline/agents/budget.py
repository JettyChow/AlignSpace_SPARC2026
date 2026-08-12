"""
AGENT 5 — Budget + Alternatives.

Compare the assembled package against the budget band's ceiling. If it's over,
suggest swapping the most expensive items down one tier (same look, cheaper
material) until it fits — mirroring how a designer trims a quote.
"""

from __future__ import annotations

from ..models import MaterialPackage, ClientProfile, BudgetReport, Swap
from ..presets import CATALOG, BUDGET_CEILINGS

_TIER_DOWN = {"premium": "standard", "standard": "budget"}


def _cheaper_option(category: str, current_tier: str):
    target = _TIER_DOWN.get(current_tier)
    if not target:
        return None
    for opt in CATALOG[category]["options"]:
        if opt["tier"] == target:
            return opt
    return None


def validate_budget(package: MaterialPackage, profile: ClientProfile) -> BudgetReport:
    ceiling = BUDGET_CEILINGS.get(profile.budget_band, BUDGET_CEILINGS["medium"])
    total = package.estimated_total

    report = BudgetReport(
        budget_band=profile.budget_band, band_ceiling=ceiling,
        estimated_total=total,
        status="within" if total <= ceiling else "over",
        adjusted_total=total,
    )

    if report.status == "within":
        return report

    report.overage = round(total - ceiling, 2)

    # Greedily swap the priciest lines down a tier until we fit. Gentlest-first:
    # each pass takes a line down at most one tier, and a second pass (e.g.
    # standard -> budget) only starts if the package still doesn't fit.
    lines = [
        {"category": i.category, "name": i.product_name, "tier": i.tier,
         "quantity": i.quantity, "subtotal": i.subtotal}
        for i in package.line_items
    ]
    running = total
    stepped = True
    while running > ceiling and stepped:
        stepped = False
        for line in sorted(lines, key=lambda ln: ln["subtotal"], reverse=True):
            if running <= ceiling:
                break
            cheaper = _cheaper_option(line["category"], line["tier"])
            if not cheaper:
                continue
            new_subtotal = round(cheaper["unit_price"] * line["quantity"], 2)
            savings = round(line["subtotal"] - new_subtotal, 2)
            if savings <= 0:
                continue
            report.suggested_swaps.append(Swap(
                category=line["category"], from_product=line["name"],
                to_product=cheaper["name"], savings=savings,
            ))
            line.update(name=cheaper["name"], tier=cheaper["tier"], subtotal=new_subtotal)
            running -= savings
            stepped = True

    report.adjusted_total = round(running, 2)
    report.fits_after_swaps = running <= ceiling
    return report
