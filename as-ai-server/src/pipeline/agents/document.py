"""
AGENT 6 — Document Generation.

Assemble everything into the final RenovationPackage handed to the designer:
a scope summary, the priced selection sheet, the budget verdict, and a
human-readable Markdown rendering (the thing a PDF step would print).

In production this is where ReportLab renders a PDF; for the MVP we emit clean
Markdown so the output is reviewable with zero extra dependencies.
"""

from __future__ import annotations

from ..models import (
    ClientProfile, DesignDirection, MaterialPackage,
    BudgetReport, RenovationPackage,
)


def _scope_summary(profile: ClientProfile, direction: DesignDirection) -> str:
    funcs = ", ".join(profile.functions) if profile.functions else "general refresh"
    top_styles = ", ".join(list(profile.styles.keys())[:3]) or "unspecified"
    return (
        f"Full bathroom renovation in a {direction.name} direction. "
        f"Client leans {top_styles}. Functional priorities: {funcs}. "
        f"Budget band: {profile.budget_band}. All selections below are "
        f"starting points for the designer to confirm and quote."
    )


def _render_markdown(pkg: RenovationPackage) -> str:
    p, d, m, b = pkg.profile, pkg.chosen_direction, pkg.package, pkg.budget
    lines: list[str] = []
    lines.append(f"# Renovation Brief — Project {pkg.project_id}")
    lines.append("")
    lines.append(f"**Direction:** {d.name} — {d.blurb}")
    lines.append(f"**Style fit:** {int(d.match_score * 100)}%  ")
    lines.append(f"**Intent source:** {p.extraction_source}")
    lines.append("")
    lines.append("## Scope")
    lines.append(pkg.scope_summary)
    lines.append("")
    lines.append("## Selection Sheet")
    lines.append("| Item | Product | Tier | Qty | Unit $ | Subtotal | Conf. | Review |")
    lines.append("|---|---|---|---:|---:|---:|---:|:--:|")
    for i in m.line_items:
        flag = "⚠️" if i.flagged else ""
        cat = i.category.replace("_", " ").title()
        lines.append(
            f"| {cat} | {i.product_name} | {i.tier} | "
            f"{i.quantity:g} {i.unit} | ${i.unit_price:,.0f} | "
            f"${i.subtotal:,.0f} | {int(i.confidence*100)}% | {flag} |"
        )
    lines.append(f"| | | | | | **${m.estimated_total:,.0f}** | | |")
    lines.append("")
    lines.append("## Budget")
    if b.ceiling_source == "client_budget":
        lines.append(
            f"- Client budget: **${b.client_budget_max:,.0f}** "
            f"(materials allowance: **${b.band_ceiling:,.0f}**)"
        )
    else:
        lines.append(f"- Band ceiling ({b.budget_band}): **${b.band_ceiling:,.0f}**")
    lines.append(f"- Estimated total: **${b.estimated_total:,.0f}** — _{b.status}_")
    if b.status == "over":
        lines.append(f"- Over by: **${b.overage:,.0f}**")
        if b.suggested_swaps:
            lines.append("- Suggested swaps to fit budget:")
            for s in b.suggested_swaps:
                lines.append(
                    f"  - {s.category.replace('_',' ').title()}: "
                    f"{s.from_product} → {s.to_product} "
                    f"(save ${s.savings:,.0f})"
                )
            lines.append(f"- Adjusted total after swaps: **${b.adjusted_total:,.0f}**")
    flagged = [i for i in m.line_items if i.flagged]
    if flagged:
        lines.append("")
        lines.append("## Flagged for designer review")
        for i in flagged:
            lines.append(f"- **{i.category.replace('_',' ').title()}** — {i.flag_reason}")
    lines.append("")
    lines.append("_Estimates are materials-only ranges, not a final quote. "
                 "Designer confirms quantities, labor, and final pricing._")
    return "\n".join(lines)


def generate_deliverable(
    project_id: str, firm_id: str, profile: ClientProfile,
    direction: DesignDirection, package: MaterialPackage, budget: BudgetReport,
) -> RenovationPackage:
    scope = _scope_summary(profile, direction)
    pkg = RenovationPackage(
        project_id=project_id, firm_id=firm_id, profile=profile,
        chosen_direction=direction, package=package, budget=budget,
        scope_summary=scope, markdown="",
    )
    pkg.markdown = _render_markdown(pkg)
    return pkg
