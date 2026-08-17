// Decorative + grouping metadata for real MaterialPackage line_item
// categories. Two sources feed this: the AI pipeline's bathroom CATALOG
// (as-ai-server/src/pipeline/presets.py — floor_tile, wall_tile, vanity,
// faucet, mirror, lighting, toilet, shower_set, paint) and the kitchen demo
// fixture (data/warmMinimalKitchen.js — cabinet, countertop, backsplash,
// hardware, pendant, sink; it reuses this map's "paint"/"faucet" entries).
//
// Neither LineItem shape carries a tone/icon field of its own, so this is
// purely cosmetic chrome layered on top of real product_name/unit_price/
// category data — same pattern DiscoveryScreen.jsx uses (TONE_BY_KEY) for
// directions, now superseded there by real per-direction images where set.

export const CATEGORY_META = {
  // Bathroom (as-ai-server pipeline)
  floor_tile: { label: 'Floor tile', icon: 'tile', tone: 'stone', group: 'materials' },
  wall_tile: { label: 'Wall tile', icon: 'grid', tone: 'travertine', group: 'materials' },
  paint: { label: 'Paint', icon: 'palette', tone: 'warmwhite', group: 'materials' },
  vanity: { label: 'Vanity', icon: 'vanity', tone: 'oak', group: 'fixtures' },
  faucet: { label: 'Faucet', icon: 'faucet', tone: 'sand', group: 'fixtures' },
  mirror: { label: 'Mirror', icon: 'hexagon', tone: 'charcoal', group: 'fixtures' },
  toilet: { label: 'Toilet', icon: 'bath', tone: 'linen', group: 'fixtures' },
  shower_set: { label: 'Shower set', icon: 'bath', tone: 'stone', group: 'fixtures' },
  lighting: { label: 'Lighting', icon: 'light', tone: 'warmwhite', group: 'lighting' },
  // Kitchen (data/warmMinimalKitchen.js demo fixture)
  cabinet: { label: 'Cabinet', icon: 'layers', tone: 'oak', group: 'materials' },
  countertop: { label: 'Countertop', icon: 'tile', tone: 'travertine', group: 'materials' },
  backsplash: { label: 'Backsplash', icon: 'grid', tone: 'travertine', group: 'materials' },
  hardware: { label: 'Cabinet Hardware', icon: 'boxes', tone: 'stone', group: 'fixtures' },
  pendant: { label: 'Pendant Lighting', icon: 'light', tone: 'warmwhite', group: 'lighting' },
  sink: { label: 'Sink', icon: 'bath', tone: 'charcoal', group: 'fixtures' },
};

const FALLBACK_META = { label: 'Item', icon: 'boxes', tone: 'sand', group: 'materials' };

// Category names are pipeline-driven, not a closed frontend enum — fall back
// gracefully for any category the catalog adds later instead of crashing.
export function categoryMeta(category) {
  return CATEGORY_META[category] || { ...FALLBACK_META, label: humanizeCategory(category) };
}

function humanizeCategory(category) {
  if (!category) return FALLBACK_META.label;
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const GROUPS = ['materials', 'fixtures', 'lighting'];
export const GROUP_LABELS = { materials: 'Materials', fixtures: 'Fixtures', lighting: 'Lighting' };
export const GROUP_ICONS = { materials: 'layers', fixtures: 'faucet', lighting: 'light' };

// Group a MaterialPackage's real line_items by the broad UI bucket above.
export function groupLineItems(lineItems = []) {
  return GROUPS.map((group) => ({
    id: group,
    label: GROUP_LABELS[group],
    icon: GROUP_ICONS[group],
    items: lineItems.filter((li) => categoryMeta(li.category).group === group),
  })).filter((g) => g.items.length > 0);
}

// "$220" for flat items, "$9/sqft" for tile priced per square foot.
export function formatUnitPrice(item) {
  if (!item) return '';
  return item.unit === 'sqft' ? `$${item.unit_price}/sqft` : `$${item.unit_price.toLocaleString()}`;
}

// "18 sqft" / "2x" / null (omit for plain single-quantity fixtures).
export function formatQuantity(item) {
  if (!item) return null;
  if (item.unit === 'sqft') return `${item.quantity} sqft`;
  return item.quantity > 1 ? `${item.quantity}x` : null;
}

export function tierLabel(tier) {
  if (!tier) return '';
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}
