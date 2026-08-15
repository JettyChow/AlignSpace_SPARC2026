// Real content sourced directly from "alignspace dataset.xlsx" (repo root) —
// the "Warm Minimal Kitchen" preset (preset_id=1), read via openpyxl against
// the PRESETS / PRESET_ITEMS / ITEMS / ITEMS_MATERIALS / MATERIALS / BUDGETS
// sheets. Field names mirror the DB schema (as-ai-server/src/app/models.py)
// so this is a documented drop-in target for a real API response later —
// once the backend actually connects the pipeline to that schema (not done
// yet — see CLAUDE.md), this file can be deleted and replaced with a fetch.
//
// No image data exists anywhere in the source (every img_url/item_imageUrl
// cell in the xlsx is empty) — `tone`/`icon` below are decorative UI-only
// placeholders (see components/PhotoTile.jsx), same as the mocks this file
// replaces. `desc` is a short human-readable line built from the real
// mat_finish/mat_color columns, not invented copy.

export const preset = {
  preset_id: 1,
  preset_name: 'Warm Minimal Kitchen',
  preset_estimatedTotal: 11350,
  roomType_name: 'Kitchen',
  sty_name: 'Warm Minimal',
};

export const budget = {
  bud_id: 1,
  bud_label: 'medium',
  bud_minAmount: 10000,
  bud_maxAmount: 20000,
};

// One entry per real PRESET_ITEMS category. `group` is the broad UI grouping
// (Materials/Fixtures/Lighting) that PackageScreen's confirm button and
// FFEScreen's sections use. `primary` = the "A" set item actually in the
// preset; `alt` = the real "B" set swap-to item (via ITEMS_MATERIALS).
export const CATEGORY_ITEMS = [
  {
    item_category: 'cabinet',
    group: 'materials',
    label: 'Cabinet',
    icon: 'layers',
    primary: {
      item_id: 1, item_name: 'White Oak Cabinet Door', item_brand: 'Arbor Home',
      item_model: 'AR-C101', item_cost: 3500,
      mat_name: 'Natural White Oak', mat_finish: 'matte',
      desc: 'Light warm oak, matte finish.', tone: 'oak', pos: '20% 60%',
    },
    alt: {
      item_id: 2, item_name: 'Walnut Cabinet Door', item_brand: 'Forma Living',
      item_model: 'FO-C201', item_cost: 4200,
      mat_name: 'Natural Walnut', mat_finish: 'matte',
      desc: 'Warm brown walnut, matte finish.', tone: 'clay', pos: '30% 50%',
    },
  },
  {
    item_category: 'countertop',
    group: 'materials',
    label: 'Countertop',
    icon: 'tile',
    primary: {
      item_id: 3, item_name: 'Travertine Countertop', item_brand: 'StoneLab',
      item_model: 'SL-T110', item_cost: 3800,
      mat_name: 'Ivory Travertine', mat_finish: 'honed',
      desc: 'Warm ivory travertine, honed finish.', tone: 'travertine', pos: '55% 40%',
    },
    alt: {
      item_id: 4, item_name: 'Warm Marble Countertop', item_brand: 'Atelier Stone',
      item_model: 'AS-M210', item_cost: 5200,
      mat_name: 'Warm Marble', mat_finish: 'polished',
      desc: 'Ivory marble with beige veining, polished.', tone: 'warmwhite', pos: '48% 34%',
    },
  },
  {
    item_category: 'backsplash',
    group: 'materials',
    label: 'Backsplash',
    icon: 'grid',
    primary: {
      item_id: 5, item_name: 'Travertine Backsplash', item_brand: 'StoneLab',
      item_model: 'SL-T120', item_cost: 1800,
      mat_name: 'Ivory Travertine', mat_finish: 'honed',
      desc: 'Matching travertine, honed finish.', tone: 'travertine', pos: '30% 24%',
    },
    alt: {
      item_id: 6, item_name: 'Warm Marble Backsplash', item_brand: 'Atelier Stone',
      item_model: 'AS-M220', item_cost: 2600,
      mat_name: 'Warm Marble', mat_finish: 'polished',
      desc: 'Matching marble, polished finish.', tone: 'warmwhite', pos: '25% 30%',
    },
  },
  {
    item_category: 'paint',
    group: 'materials',
    label: 'Paint',
    icon: 'palette',
    primary: {
      item_id: 7, item_name: 'Warm White Wall Paint', item_brand: 'Aura Paint',
      item_model: 'AU-W101', item_cost: 400,
      mat_name: 'Warm White', mat_finish: 'matte',
      desc: 'Warm white, matte interior paint.', tone: 'warmwhite', pos: '8% 56%',
    },
    alt: {
      item_id: 8, item_name: 'Soft Greige Wall Paint', item_brand: 'Aura Paint',
      item_model: 'AU-G201', item_cost: 450,
      mat_name: 'Soft Greige', mat_finish: 'matte',
      desc: 'Light warm greige, matte finish.', tone: 'stone', pos: '12% 48%',
    },
  },
  {
    item_category: 'faucet',
    group: 'fixtures',
    label: 'Faucet',
    icon: 'faucet',
    primary: {
      item_id: 9, item_name: 'Brushed Nickel Faucet', item_brand: 'AquaForm',
      item_model: 'AF-F110', item_cost: 420,
      mat_name: 'Brushed Nickel', mat_finish: 'brushed',
      desc: 'Soft silver, brushed nickel finish.', tone: 'stone', pos: '55% 62%',
    },
    alt: {
      item_id: 10, item_name: 'Champagne Brass Faucet', item_brand: 'Forma Living',
      item_model: 'FO-F210', item_cost: 650,
      mat_name: 'Champagne Brass', mat_finish: 'brushed',
      desc: 'Champagne gold, brushed brass finish.', tone: 'sand', pos: '50% 55%',
    },
  },
  {
    item_category: 'hardware',
    group: 'fixtures',
    label: 'Cabinet hardware',
    icon: 'boxes',
    primary: {
      item_id: 11, item_name: 'Nickel Cabinet Pull', item_brand: 'Forma Hardware',
      item_model: 'FH-H110', item_cost: 280,
      mat_name: 'Brushed Nickel', mat_finish: 'brushed',
      desc: 'Soft silver, brushed nickel finish.', tone: 'stone', pos: '40% 86%',
    },
    alt: {
      item_id: 12, item_name: 'Brass Cabinet Pull', item_brand: 'Atelier Hardware',
      item_model: 'AH-H210', item_cost: 420,
      mat_name: 'Champagne Brass', mat_finish: 'brushed',
      desc: 'Champagne gold, brushed brass finish.', tone: 'sand', pos: '44% 80%',
    },
  },
  {
    item_category: 'sink',
    group: 'fixtures',
    label: 'Sink',
    icon: 'bath',
    primary: {
      item_id: 15, item_name: 'Stainless Undermount Sink', item_brand: 'AquaForm',
      item_model: 'AF-S110', item_cost: 600,
      mat_name: 'Stainless Steel', mat_finish: 'brushed',
      desc: 'Silver stainless steel, brushed finish.', tone: 'stone', pos: '50% 30%',
    },
    alt: {
      item_id: 16, item_name: 'Workstation Undermount Sink', item_brand: 'Forma Living',
      item_model: 'FO-S210', item_cost: 850,
      mat_name: 'Stainless Steel', mat_finish: 'brushed',
      desc: 'Workstation-style, brushed stainless steel.', tone: 'charcoal', pos: '45% 35%',
    },
  },
  {
    item_category: 'lighting',
    group: 'lighting',
    label: 'Pendant lighting',
    icon: 'light',
    primary: {
      item_id: 13, item_name: 'Nickel Glass Pendant', item_brand: 'Lumi Studio',
      item_model: 'LS-P110', item_cost: 550, item_isRequired: false,
      mat_name: 'Brushed Nickel', mat_finish: 'brushed',
      desc: 'Nickel and clear glass pendant.', tone: 'warmwhite', pos: '78% 32%',
    },
    alt: {
      item_id: 14, item_name: 'Brass Glass Pendant', item_brand: 'Lumi Studio',
      item_model: 'LS-P210', item_cost: 750,
      mat_name: 'Champagne Brass', mat_finish: 'brushed',
      desc: 'Brass and clear glass pendant.', tone: 'sand', pos: '72% 40%',
    },
  },
];

export const GROUPS = ['materials', 'fixtures', 'lighting'];
export const GROUP_LABELS = { materials: 'Materials', fixtures: 'Fixtures', lighting: 'Lighting' };
export const GROUP_ICONS = { materials: 'layers', fixtures: 'faucet', lighting: 'light' };

export function itemsInGroup(group) {
  return CATEGORY_ITEMS.filter((c) => c.group === group);
}

// Sum of the 8 real primary picks — matches preset.preset_estimatedTotal
// exactly ($11,350), a real internal-consistency check the old mocks lacked.
export const primaryTotal = CATEGORY_ITEMS.reduce((sum, c) => sum + c.primary.item_cost, 0);

export function allocationByGroup() {
  return GROUPS.map((g) => ({
    group: g,
    label: GROUP_LABELS[g],
    total: itemsInGroup(g).reduce((sum, c) => sum + c.primary.item_cost, 0),
  }));
}

// The single alternate swap with the largest real cost delta — used for the
// Budget Review "smart swap" callout. Every real alternate in this dataset
// costs more than its primary (there's no downgrade-to-save option here),
// so this is framed as an optional upgrade, not an invented savings claim.
export function biggestSwapDelta() {
  return CATEGORY_ITEMS.reduce((best, c) => {
    const delta = c.alt.item_cost - c.primary.item_cost;
    return !best || delta > best.delta ? { category: c, delta } : best;
  }, null);
}
