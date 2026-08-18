// Designer-side demo adapter — reshapes the EXISTING kitchen demo data
// (data/warmMinimalKitchen.js) into the DBML-ish shapes the Designer
// screens (ProjectsScreen / MaterialsScreen) render.
//
// This file defines NO product/price/image data of its own. It only maps
// fields that already exist in warmMinimalKitchen.js's CATEGORIES /
// buildDemoDeliverable() output, plus a handful of purely presentational
// placeholders (timeline estimate, "last updated" timestamp) for which no
// real data exists anywhere yet — see the Designer-flow audit.
//
// Why this exists: the real Client -> DB -> Designer handoff isn't wired
// (see services/project.service.js's getDesignerProjects/getDesignerProject
// — they call a main backend that doesn't exist in this repo yet). Until
// that lands, every Designer account is shown this one deterministic demo
// project instead of an empty/error state. Swap this out once the main
// backend's /designer/projects is real — see projects/page.jsx and
// projects/[id]/page.jsx for the two call sites.

import { CATEGORIES, INSPIRATIONS, ROOM_TYPE, buildDemoDeliverable } from './warmMinimalKitchen';
import { categoryMeta } from '@/lib/materialCategories';

export const DEMO_PROJECT_ID = 'demo-kitchen';

// Deterministic per point 5 of the approved plan.
const DEMO_CLIENT = { user_firstName: 'Maya', user_lastName: 'Chen' };

// Purely presentational placeholders — neither the AI pipeline's
// MaterialPackage/BudgetReport nor warmMinimalKitchen.js carries a timeline
// estimate or an update timestamp, and no real backend is wired to supply
// one yet. Fixed values keep the demo deterministic rather than inventing
// a fake "live" feel.
const DEMO_TIMELINE = '6 weeks';
const DEMO_LAST_UPDATED_DATE = 'May 28';
const DEMO_LAST_UPDATED_TIME = '2:30 PM';

// Reuse the same default direction the Discovery screen would land on
// first (INSPIRATIONS[0]) — one real deliverable, not a second fixture.
const deliverable = buildDemoDeliverable(INSPIRATIONS[0].key);

const CATEGORY_BY_KEY = new Map(CATEGORIES.map((c) => [c.category, c]));

function titleCase(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// The full demo deliverable (same shape Client screens consume), exposed
// in case a Designer screen ever wants scope/budget detail beyond the
// flattened material rows below.
export function getDemoDeliverable() {
  return deliverable;
}

// Presentation data for the Designer project card / project detail hero.
// Field names mirror the DBML PROJECTS shape the real backend is expected
// to return (see the placeholder PROJECTS array removed in 38ab4d9/3a982bf).
export function buildDemoDesignerProject() {
  return {
    proj_id: DEMO_PROJECT_ID,
    proj_title: `${titleCase(ROOM_TYPE)} Renovation`,
    proj_status: 'Needs Review',
    // Client already finished the full flow and handed off, so this reads
    // as fully selected / ready for designer review (>= 90% per
    // ProjectsScreen's FILTERS.Review bucket) rather than "in progress".
    proj_completionPercent: 100,
    proj_budgetMaxOverride: deliverable.budget.band_ceiling,
    proj_timeline: DEMO_TIMELINE,
    proj_updatedAt: DEMO_LAST_UPDATED_DATE,
    proj_updatedAtTime: DEMO_LAST_UPDATED_TIME,
    client: DEMO_CLIENT,
    assignedDesigner: null,
    tone: 'oak',
    imageUrl: deliverable.chosen_direction.imageUrl,
    urgent: false,
  };
}

// Maps buildDemoDeliverable().package.line_items (the same 8 kitchen line
// items the Client's PackageScreen renders) onto the fields MaterialsScreen
// expects, pulling brand/material from CATEGORIES by category key rather
// than inventing new descriptive data.
export function buildDemoDesignerMaterials() {
  return deliverable.package.line_items.map((li, i) => {
    const cat = CATEGORY_BY_KEY.get(li.category);
    const meta = categoryMeta(li.category);
    return {
      item_id: cat?.primary.item_id ?? i + 1,
      item_name: li.product_name,
      item_category: meta.label,
      item_group: meta.group,
      item_brand: cat?.primary.brand ?? null,
      item_material: cat?.primary.mat_name
        ? [cat.primary.mat_name, cat.primary.mat_finish].filter(Boolean).join(' · ')
        : null,
      projItem_quantity: li.quantity,
      projItem_unitCost: li.unit_price,
      // The client confirmed every category while completing the demo
      // flow, so all 8 read as confirmed selections awaiting the
      // designer's review (project-level "Needs Review" above).
      projItem_status: 'approved',
      imageUrl: li.imageUrl,
      tone: meta.tone,
    };
  });
}
