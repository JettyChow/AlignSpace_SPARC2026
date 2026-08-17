// Normalizes the two different shapes `/directions/select` (main backend,
// app/services/design_service.py) and `/assemble` (as-ai-server pipeline,
// src/pipeline/models.py RenovationPackage.to_dict()) can return, so every
// screen downstream of the store's `deliverable` can rely on one shape:
//
//   { chosen_direction: {key, name, blurb, style_tags, match_score},
//     package: {line_items: [{category, product_name, tier, unit,
//               unit_price, quantity, subtotal, confidence, flagged,
//               flag_reason}], estimated_total},
//     budget: {budget_band, band_ceiling, estimated_total, status,
//              overage, suggested_swaps, adjusted_total} }
//
// See app/(protected)/discovery/page.jsx, which calls this on whichever
// response comes back before storing it via setDeliverable().
export function normalizeDeliverable(raw) {
  if (!raw) return null;

  // Already the pipeline's native shape (direct /assemble, or main-backend
  // fallback to the pipeline call in discovery/page.jsx).
  if (raw.package?.line_items) return raw;

  // Main backend's /projects/{id}/directions/select shape (design_service.
  // select_direction) — remap its `materials`/`selected_direction` fields
  // onto the same contract. `budget` is passed through unchanged: the main
  // backend stores the pipeline's raw BudgetReport dict as-is (see
  // app/services/pipeline_service.py's assemble_project_direction).
  const direction = raw.selected_direction || {};
  const lineItems = (raw.materials || []).map((material) => ({
    category: material.category,
    product_name: material.name,
    tier: material.tier,
    unit: material.unit,
    unit_price:
      material.unit === 'sqft' && material.quantity
        ? Math.round((material.price / material.quantity) * 100) / 100
        : material.price,
    quantity: material.quantity,
    subtotal: material.price,
    confidence: material.confidence,
    flagged: material.flagged,
    flag_reason: material.flag_reason,
  }));
  const estimatedTotal = lineItems.reduce((sum, li) => sum + (li.subtotal || 0), 0);

  return {
    project_id: raw.project_id,
    chosen_direction: {
      key: direction.pipeline_direction_key,
      name: direction.title,
      blurb: direction.blurb,
      style_tags: direction.tags || [],
      match_score: (direction.match_percent || 0) / 100,
    },
    package: {
      direction_key: direction.pipeline_direction_key,
      direction_name: direction.title,
      line_items: lineItems,
      estimated_total: Math.round(estimatedTotal * 100) / 100,
    },
    budget: raw.budget || null,
  };
}
