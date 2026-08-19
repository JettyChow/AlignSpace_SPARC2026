'use client';

import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import FocusScreen from '@/screens/explore/FocusScreen';

// Swaps one MaterialPackage line item's selected pick for its paired
// alternate (see data/warmMinimalKitchen.js buildLineItems) — primary and
// alternate simply trade places, so `alternate` always holds "the other
// option" for whichever pick is currently selected. This updates the same
// `deliverable` the store already holds (via setDeliverable below), which
// is the exact source PackageScreen's buildCategoryData reads on `/package`
// — no separate Focus-only selection state.
//
// A swapped pick can change price, so package.estimated_total and every
// budget.* total derived from it are recomputed here too — same
// semantics/formulas buildDemoDeliverable() uses (data/warmMinimalKitchen.js):
// estimated_total = sum of line-item subtotals; status = within/over
// band_ceiling; overage = the shortfall past band_ceiling (0 if within);
// adjusted_total = estimated_total minus any suggested_swaps savings (this
// demo's suggested_swaps is always [], so it reduces to estimated_total,
// but the subtraction is kept so this stays correct if that ever changes).
function withSwappedPick(deliverable, category) {
  const lineItems = deliverable?.package?.line_items;
  if (!lineItems) return deliverable;
  const nextLineItems = lineItems.map((li) => {
    if (li.category !== category || !li.alternate) return li;
    return {
      ...li,
      product_name: li.alternate.product_name,
      unit_price: li.alternate.unit_price,
      imageUrl: li.alternate.imageUrl,
      subtotal: li.alternate.unit_price * li.quantity,
      alternate: {
        product_name: li.product_name,
        unit_price: li.unit_price,
        imageUrl: li.imageUrl,
      },
    };
  });

  const estimatedTotal = nextLineItems.reduce((sum, li) => sum + li.subtotal, 0);
  const budget = deliverable.budget;
  const swapSavings = (budget?.suggested_swaps ?? []).reduce((sum, s) => sum + s.savings, 0);

  return {
    ...deliverable,
    package: { ...deliverable.package, line_items: nextLineItems, estimated_total: estimatedTotal },
    budget: budget && {
      ...budget,
      estimated_total: estimatedTotal,
      status: estimatedTotal <= budget.band_ceiling ? 'within' : 'over',
      overage: Math.max(0, estimatedTotal - budget.band_ceiling),
      adjusted_total: estimatedTotal - swapSavings,
    },
  };
}

export default function FocusPage() {
  const deliverable = useAppStore((s) => s.deliverable);
  const setDeliverable = useAppStore((s) => s.setDeliverable);
  const { go, back } = useNavigation();

  return (
    <FocusScreen
      deliverable={deliverable}
      onBack={back}
      onContinue={() => go('/package')}
      onMenu={() => go('/history')}
      onSwitchCategory={(category) => setDeliverable(withSwappedPick(deliverable, category))}
    />
  );
}
