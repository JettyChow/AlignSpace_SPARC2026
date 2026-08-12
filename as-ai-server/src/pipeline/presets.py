"""
AlignSpace — Seed preset library (bathroom MVP).

In production this lives in the per-firm `presets` table (scoped by firm_id).
For the MVP demo it's an in-memory seed so the pipeline is fully runnable.

Two pieces:
  1. DIRECTIONS  — the 6 high-level renovation styles the client chooses from.
  2. CATALOG     — concrete products per category, in 3 price tiers, each tagged
                   with style words so the assembly agent can match them to a
                   direction + client profile.

Design note (from the team's intake discussion): we do NOT commit the client to
a single total cost. We price by *unit*, derive quantities from room size, and
let the designer finalize. "Most looks are achievable at different budgets, just
with cheaper materials of a similar look."
"""

# --- The 6 bathroom directions shown to the client (MVP Definition, Step 4) ---
DIRECTIONS = [
    {
        "key": "warm_modern",
        "name": "Warm Modern",
        "blurb": "Clean lines softened with warm wood and matte-black accents.",
        "style_tags": ["modern", "warm", "contemporary", "clean"],
    },
    {
        "key": "japandi",
        "name": "Japandi",
        "blurb": "Japanese minimalism meets Scandinavian warmth; natural, calm, uncluttered.",
        "style_tags": ["minimal", "warm", "natural", "calm"],
    },
    {
        "key": "contemporary_minimal",
        "name": "Contemporary Minimal",
        "blurb": "Crisp, monochrome, sleek surfaces with nothing extra.",
        "style_tags": ["modern", "minimal", "cool", "clean"],
    },
    {
        "key": "organic_spa",
        "name": "Organic Spa",
        "blurb": "Stone, greenery and soft texture for a restful, spa-like retreat.",
        "style_tags": ["natural", "calm", "warm", "luxe"],
    },
    {
        "key": "scandinavian",
        "name": "Scandinavian",
        "blurb": "Light woods, white walls, airy and highly functional.",
        "style_tags": ["minimal", "light", "warm", "functional"],
    },
    {
        "key": "transitional",
        "name": "Transitional",
        "blurb": "A timeless blend of traditional detailing and modern simplicity.",
        "style_tags": ["classic", "warm", "balanced", "clean"],
    },
]

# --- Tiered product catalog -------------------------------------------------
# unit: "sqft" items are priced per square foot; "each" items are flat.
# tags: used by the assembly agent to score fit against the direction/profile.
CATALOG = {
    "floor_tile": {
        "unit": "sqft",
        "options": [
            {"name": "Matte porcelain, greige", "tier": "budget",   "unit_price": 4.0,  "tags": ["warm", "clean", "functional"]},
            {"name": "Wood-look plank tile",     "tier": "standard", "unit_price": 9.0,  "tags": ["warm", "natural", "modern"]},
            {"name": "Honed stone-look slab",    "tier": "premium",  "unit_price": 18.0, "tags": ["luxe", "natural", "calm"]},
        ],
    },
    "wall_tile": {
        "unit": "sqft",
        "options": [
            {"name": "White ceramic subway",     "tier": "budget",   "unit_price": 5.0,  "tags": ["clean", "light", "classic"]},
            {"name": "Large-format matte tile",  "tier": "standard", "unit_price": 11.0, "tags": ["modern", "minimal", "clean"]},
            {"name": "Zellige handmade tile",    "tier": "premium",  "unit_price": 22.0, "tags": ["warm", "natural", "luxe"]},
        ],
    },
    "vanity": {
        "unit": "each",
        "options": [
            {"name": "Flat-pack 30in vanity",       "tier": "budget",   "unit_price": 350.0,  "tags": ["clean", "functional", "minimal"]},
            {"name": "Oak floating vanity",          "tier": "standard", "unit_price": 850.0,  "tags": ["warm", "natural", "modern"]},
            {"name": "Solid walnut + stone-top vanity","tier": "premium","unit_price": 1900.0, "tags": ["luxe", "warm", "natural"]},
        ],
    },
    "faucet": {
        "unit": "each",
        "options": [
            {"name": "Chrome single-handle",     "tier": "budget",   "unit_price": 90.0,  "tags": ["clean", "cool", "functional"]},
            {"name": "Matte black faucet",       "tier": "standard", "unit_price": 220.0, "tags": ["modern", "contemporary", "clean"]},
            {"name": "Brushed brass faucet",     "tier": "premium",  "unit_price": 480.0, "tags": ["warm", "luxe", "classic"]},
        ],
    },
    "mirror": {
        "unit": "each",
        "options": [
            {"name": "Frameless rectangular",    "tier": "budget",   "unit_price": 80.0,  "tags": ["minimal", "clean", "cool"]},
            {"name": "Round black-frame mirror", "tier": "standard", "unit_price": 190.0, "tags": ["modern", "warm", "contemporary"]},
            {"name": "Backlit LED smart mirror", "tier": "premium",  "unit_price": 420.0, "tags": ["luxe", "modern", "clean"]},
        ],
    },
    "lighting": {
        "unit": "each",
        "options": [
            {"name": "LED vanity bar",           "tier": "budget",   "unit_price": 70.0,  "tags": ["clean", "functional", "cool"]},
            {"name": "Warm sconce pair",         "tier": "standard", "unit_price": 180.0, "tags": ["warm", "classic", "calm"]},
            {"name": "Dimmable layered lighting","tier": "premium",  "unit_price": 390.0, "tags": ["luxe", "calm", "modern"]},
        ],
    },
    "toilet": {
        "unit": "each",
        "options": [
            {"name": "Two-piece standard",       "tier": "budget",   "unit_price": 180.0, "tags": ["functional", "clean"]},
            {"name": "One-piece skirted",        "tier": "standard", "unit_price": 380.0, "tags": ["modern", "clean", "minimal"]},
            {"name": "Wall-hung smart toilet",   "tier": "premium",  "unit_price": 750.0, "tags": ["luxe", "modern", "minimal"]},
        ],
    },
    "shower_set": {
        "unit": "each",
        "options": [
            {"name": "Chrome shower + glass panel","tier": "budget", "unit_price": 200.0, "tags": ["clean", "functional", "cool"]},
            {"name": "Matte rain shower set",      "tier": "standard","unit_price": 520.0, "tags": ["modern", "calm", "clean"]},
            {"name": "Thermostatic spa system",    "tier": "premium", "unit_price": 1100.0,"tags": ["luxe", "calm", "natural"]},
        ],
    },
    "paint": {
        "unit": "each",
        "options": [
            {"name": "Standard bathroom paint",  "tier": "budget",   "unit_price": 120.0, "tags": ["clean", "functional"]},
            {"name": "Low-sheen designer paint", "tier": "standard", "unit_price": 220.0, "tags": ["warm", "calm", "modern"]},
            {"name": "Limewash specialty finish","tier": "premium",  "unit_price": 360.0, "tags": ["natural", "warm", "luxe"]},
        ],
    },
}

# Materials-only budget ceilings per band (USD) for a small bathroom.
# Ranges, not quotes — the designer sets the real number (per team discussion).
# Tuned so the bands are meaningful: a roomy bath or off-tier picks can exceed
# the ceiling and trip the budget agent's swap suggestions.
# Bands must stay in sync with the DB `budgets.bud_label` values
# (low, medium, high, luxury) and the API schema's Band literal.
BUDGET_CEILINGS = {"low": 2200.0, "medium": 4500.0, "high": 8500.0, "luxury": 15000.0}

# Which tier each band prefers by default.
BAND_TIER = {"low": "budget", "medium": "standard", "high": "premium", "luxury": "premium"}

# Tile waste factor + a rough wall-area multiplier off floor sqft.
TILE_WASTE = 1.10
WALL_AREA_FACTOR = 1.20
