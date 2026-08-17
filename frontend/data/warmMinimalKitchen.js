// AlignSpace Kitchen MVP Dataset — demo-only frontend fixture.
//
// as-ai-server's AI pipeline is bathroom-only today (ClientBrief.room_type
// defaults to "bathroom", the CATALOG in src/pipeline/presets.py has no
// kitchen categories — see CLAUDE.md). Reshaping that is a backend change;
// for the kitchen demo we were asked to fake it frontend-only instead, so
// this file stands in for a real /assemble response.
//
// Every id/name/price/description below is transcribed 1:1 from the team's
// "AlignSpace Kitchen MVP Dataset" (FIRMS/ROOM_TYPES/BUDGETS/STYLES/IMAGES/
// PRESETS/MATERIALS/ITEMS/PRESET_ITEMS) — nothing here is invented. Images
// are the real files supplied for the dataset's IMAGE_CHECKLIST, copied into
// public/assets/kitchen/ (inspiration-{img_id}.jpg, items/{item_id}.jpg).
//
// Shaped to match lib/deliverable.js's normalized `deliverable` contract
// (chosen_direction / package.line_items / budget), so it plugs directly
// into PackageScreen / FFEScreen / BudgetScreen / SummaryScreen unchanged.

export const ROOM_TYPE = 'kitchen';
export const STYLE_NAME = 'Warm Minimal';

// BUDGETS bud_id=1: roomType Kitchen, medium band, $10,000–$20,000.
export const BUDGET_BAND = 'medium';
export const BAND_FLOOR = 10000;
export const BAND_CEILING = 20000;

// IMAGES (img_id 1-6), all tagged to STYLES.sty_id=1 "Warm Minimal" via
// IMAGES_STYLES. These are the "6 directions" for the demo — one style,
// six real inspiration photos — not six different item packages.
export const INSPIRATIONS = [
  {
    img_id: 1, key: 'warm_minimal_01', name: 'Warm Minimal · Bright Oak',
    blurb: 'Light wood cabinetry, warm neutral stone, bright atmosphere.',
    imageUrl: '/assets/kitchen/inspiration-1.jpg',
  },
  {
    img_id: 2, key: 'warm_minimal_02', name: 'Warm Minimal · Island',
    blurb: 'Warm wood kitchen with a large island and minimal cabinetry.',
    imageUrl: '/assets/kitchen/inspiration-2.jpg',
  },
  {
    img_id: 3, key: 'warm_minimal_03', name: 'Warm Minimal · White Oak',
    blurb: 'White oak cabinetry with warm stone and a neutral palette.',
    imageUrl: '/assets/kitchen/inspiration-3.jpg',
  },
  {
    img_id: 4, key: 'warm_minimal_04', name: 'Warm Minimal · Deep Wood',
    blurb: 'Darker warm wood with cream stone and minimal details.',
    imageUrl: '/assets/kitchen/inspiration-4.jpg',
  },
  {
    img_id: 5, key: 'warm_minimal_05', name: 'Warm Minimal · Soft Light',
    blurb: 'Natural materials with soft, warm lighting.',
    imageUrl: '/assets/kitchen/inspiration-5.jpg',
  },
  {
    img_id: 6, key: 'warm_minimal_06', name: 'Warm Minimal · Refined',
    blurb: 'Refined minimal kitchen with wood, stone and simple fixtures.',
    imageUrl: '/assets/kitchen/inspiration-6.jpg',
  },
];

// ITEMS + ITEMS_MATERIALS + PRESET_ITEMS (preset_id=1 "Warm Minimal
// Kitchen"): 8 categories, Set A = the preset's default pick (isRequired),
// Set B = the real paired alternate. Every Set B option costs *more* than
// its Set A pair in this dataset — these are upgrade choices, not budget
// swaps (unlike the AI pipeline's budget.py, which only suggests swaps that
// cost less — see budget field below).
export const CATEGORIES = [
  {
    category: 'cabinet', label: 'Cabinet',
    primary: {
      item_id: 1, product_name: 'White Oak Cabinet Door', brand: 'Arbor Home', model: 'AR-C101',
      unit_price: 3500, mat_name: 'Natural White Oak', mat_finish: 'matte',
      imageUrl: '/assets/kitchen/items/1.jpg',
    },
    alternate: {
      item_id: 2, product_name: 'Walnut Cabinet Door', brand: 'Forma Living', model: 'FO-C201',
      unit_price: 4200, mat_name: 'Natural Walnut', mat_finish: 'matte',
      imageUrl: '/assets/kitchen/items/2.jpg',
    },
  },
  {
    category: 'countertop', label: 'Countertop',
    primary: {
      item_id: 3, product_name: 'Travertine Countertop', brand: 'StoneLab', model: 'SL-T110',
      unit_price: 3800, mat_name: 'Ivory Travertine', mat_finish: 'honed',
      imageUrl: '/assets/kitchen/items/3.jpg',
    },
    alternate: {
      item_id: 4, product_name: 'Warm Marble Countertop', brand: 'Atelier Stone', model: 'AS-M210',
      unit_price: 5200, mat_name: 'Warm Marble', mat_finish: 'polished',
      imageUrl: '/assets/kitchen/items/4.jpg',
    },
  },
  {
    category: 'backsplash', label: 'Backsplash',
    primary: {
      item_id: 5, product_name: 'Travertine Backsplash', brand: 'StoneLab', model: 'SL-T120',
      unit_price: 1800, mat_name: 'Ivory Travertine', mat_finish: 'honed',
      imageUrl: '/assets/kitchen/items/5.jpg',
    },
    alternate: {
      item_id: 6, product_name: 'Warm Marble Backsplash', brand: 'Atelier Stone', model: 'AS-M220',
      unit_price: 2600, mat_name: 'Warm Marble', mat_finish: 'polished',
      imageUrl: '/assets/kitchen/items/6.jpg',
    },
  },
  {
    category: 'paint', label: 'Paint',
    primary: {
      item_id: 7, product_name: 'Warm White Wall Paint', brand: 'Aura Paint', model: 'AU-W101',
      unit_price: 400, mat_name: 'Warm White', mat_finish: 'matte',
      imageUrl: '/assets/kitchen/items/7.jpg',
    },
    alternate: {
      item_id: 8, product_name: 'Soft Greige Wall Paint', brand: 'Aura Paint', model: 'AU-G201',
      unit_price: 450, mat_name: 'Soft Greige', mat_finish: 'matte',
      imageUrl: '/assets/kitchen/items/8.jpg',
    },
  },
  {
    category: 'faucet', label: 'Faucet',
    primary: {
      item_id: 9, product_name: 'Brushed Nickel Faucet', brand: 'AquaForm', model: 'AF-F110',
      unit_price: 420, mat_name: 'Brushed Nickel', mat_finish: 'brushed',
      imageUrl: '/assets/kitchen/items/9.jpg',
    },
    alternate: {
      item_id: 10, product_name: 'Champagne Brass Faucet', brand: 'Forma Living', model: 'FO-F210',
      unit_price: 650, mat_name: 'Champagne Brass', mat_finish: 'brushed',
      imageUrl: '/assets/kitchen/items/10.jpg',
    },
  },
  {
    category: 'hardware', label: 'Cabinet Hardware',
    primary: {
      item_id: 11, product_name: 'Nickel Cabinet Pull', brand: 'Forma Hardware', model: 'FH-H110',
      unit_price: 280, mat_name: 'Brushed Nickel', mat_finish: 'brushed',
      imageUrl: '/assets/kitchen/items/11.jpg',
    },
    alternate: {
      item_id: 12, product_name: 'Brass Cabinet Pull', brand: 'Atelier Hardware', model: 'AH-H210',
      unit_price: 420, mat_name: 'Champagne Brass', mat_finish: 'brushed',
      imageUrl: '/assets/kitchen/items/12.jpg',
    },
  },
  {
    category: 'pendant', label: 'Pendant Lighting',
    primary: {
      item_id: 13, product_name: 'Nickel Glass Pendant', brand: 'Lumi Studio', model: 'LS-P110',
      unit_price: 550, mat_name: 'Brushed Nickel + Clear Glass', mat_finish: 'brushed',
      imageUrl: '/assets/kitchen/items/13.jpg',
    },
    alternate: {
      item_id: 14, product_name: 'Brass Glass Pendant', brand: 'Lumi Studio', model: 'LS-P210',
      unit_price: 750, mat_name: 'Champagne Brass + Clear Glass', mat_finish: 'brushed',
      imageUrl: '/assets/kitchen/items/14.jpg',
    },
  },
  {
    category: 'sink', label: 'Sink',
    primary: {
      item_id: 15, product_name: 'Stainless Undermount Sink', brand: 'AquaForm', model: 'AF-S110',
      unit_price: 600, mat_name: 'Stainless Steel', mat_finish: 'brushed',
      imageUrl: '/assets/kitchen/items/15.jpg',
    },
    alternate: {
      item_id: 16, product_name: 'Workstation Undermount Sink', brand: 'Forma Living', model: 'FO-S210',
      unit_price: 850, mat_name: 'Stainless Steel', mat_finish: 'brushed',
      imageUrl: '/assets/kitchen/items/16.jpg',
    },
  },
];

function buildLineItems() {
  return CATEGORIES.map((c) => ({
    category: c.category,
    product_name: c.primary.product_name,
    tier: 'standard',
    unit: 'each',
    unit_price: c.primary.unit_price,
    quantity: 1,
    subtotal: c.primary.unit_price,
    confidence: 1,
    flagged: false,
    flag_reason: null,
    imageUrl: c.primary.imageUrl,
    // Real paired Set B choice (not a budget swap — see PRESET_ITEMS note
    // above). Optional field the real pipeline never sets; PackageScreen
    // prefers it over budget.suggested_swaps when present.
    alternate: {
      product_name: c.alternate.product_name,
      unit_price: c.alternate.unit_price,
      imageUrl: c.alternate.imageUrl,
    },
  }));
}

const LINE_ITEMS = buildLineItems();

// PRESETS.preset_estimatedTotal = $11,350 — matches the sum of the 8 Set A
// picks above exactly (internal consistency check the dataset itself notes).
const ESTIMATED_TOTAL = LINE_ITEMS.reduce((sum, li) => sum + li.subtotal, 0);

export function buildDemoDeliverable(directionKey) {
  const inspiration = INSPIRATIONS.find((i) => i.key === directionKey) || INSPIRATIONS[0];
  return {
    project_id: 'demo-kitchen',
    room_type: ROOM_TYPE,
    chosen_direction: {
      key: inspiration.key,
      name: inspiration.name,
      blurb: inspiration.blurb,
      style_tags: ['warm', 'minimal', 'natural'],
      match_score: 1,
      imageUrl: inspiration.imageUrl,
    },
    package: {
      direction_key: inspiration.key,
      direction_name: inspiration.name,
      line_items: LINE_ITEMS,
      estimated_total: ESTIMATED_TOTAL,
    },
    budget: {
      budget_band: BUDGET_BAND,
      band_ceiling: BAND_CEILING,
      estimated_total: ESTIMATED_TOTAL,
      status: ESTIMATED_TOTAL <= BAND_CEILING ? 'within' : 'over',
      overage: Math.max(0, ESTIMATED_TOTAL - BAND_CEILING),
      suggested_swaps: [], // every real Set B option here costs more, not less
      adjusted_total: ESTIMATED_TOTAL,
    },
  };
}
