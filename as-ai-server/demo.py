"""
End-to-end demo of the AlignSpace AI pipeline (no server needed).

    python demo.py

Works offline (deterministic fallback). If ANTHROPIC_API_KEY is set, intent
extraction uses Claude automatically. Writes sample_deliverable.md/.json.
"""

import json
import os
import sys

# Make the pipeline importable whether you run this from as-ai-server/ or elsewhere.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from pipeline import ClientBrief, run_intake, run_for_direction  # noqa: E402


def stage_printer(stage: str, message: str) -> None:
    """Stand-in for the Redis -> Socket.io progress events the dashboard shows."""
    print(f"  [{stage:8}] {message}")


def main() -> None:
    brief = ClientBrief(
        firm_id="firm_demo",
        project_id="proj_001",
        room_type="bathroom",
        room_sqft=45,
        budget_band="medium",
        timeline_weeks=6,
        priorities=["more storage", "easy to clean"],
        style_chips=["warm", "minimal"],
        chat_text=(
            "I want a calm, spa-like bathroom. Natural wood tones, nothing too "
            "flashy. I'd love more storage and a walk-in shower. Keep it timeless."
        ),
    )

    print("=" * 64)
    print("ALIGNSPACE PIPELINE DEMO  ·  bathroom MVP")
    print("=" * 64)
    src = "Claude API" if os.environ.get("ANTHROPIC_API_KEY") else "offline fallback"
    print(f"Intent source: {src}\n")

    print("PHASE A — intake")
    profile, directions = run_intake(brief, on_stage=stage_printer)

    print("\nExtracted profile:")
    print(f"  styles    : {profile.styles}")
    print(f"  functions : {profile.functions}")
    print(f"  source    : {profile.extraction_source}")

    print("\n6 design directions (ranked):")
    for i, d in enumerate(directions, 1):
        print(f"  {i}. {d.name:22} fit={int(d.match_score*100):>3}%  "
              f"~${d.est_low:,.0f}-${d.est_high:,.0f}")

    chosen = directions[0]
    print(f"\nPHASE B — client picks: {chosen.name}")
    deliverable = run_for_direction(brief, profile, chosen, on_stage=stage_printer)

    print("\n" + "=" * 64)
    print("FINAL DELIVERABLE (markdown)")
    print("=" * 64)
    print(deliverable.markdown)

    out_dir = os.environ.get("OUT_DIR", ".")
    with open(os.path.join(out_dir, "sample_deliverable.md"), "w") as f:
        f.write(deliverable.markdown)
    with open(os.path.join(out_dir, "sample_deliverable.json"), "w") as f:
        json.dump(deliverable.to_dict(), f, indent=2)
    print(f"\nSaved sample_deliverable.md and sample_deliverable.json to {out_dir}")


if __name__ == "__main__":
    main()
