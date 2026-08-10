'use client';

import LightScene from '@/components/frame/LightScene';
import AppBar from '@/components/frame/AppBar';
import { PrimaryButton } from '@/components/Buttons';
import GlassPanel from '@/components/GlassPanel';
import Icon from '@/components/Icon';

// Placeholder PROJECTS + BUDGETS row — field names mirror the DBML schema,
// so a real fetch of this project is a drop-in swap.
const PROJECT = {
  proj_id: 1,
  proj_budgetMinOverride: 31400,
  proj_budgetMaxOverride: 38200,
  bud_id: 1,
};
const BUDGET = { bud_id: 1, bud_label: 'medium', bud_minAmount: 25000, bud_maxAmount: 50000 };

// PROJECT_ITEMS summed and grouped by ITEMS.item_category — this aggregate
// would come pre-computed from the backend, not raw rows.
const ALLOCATION = [
  { item_category: 'Materials', total: 19200, color: '#C6A36B' },
  { item_category: 'Fixtures', total: 7000, color: '#D8C5A9' },
  { item_category: 'Lighting', total: 5200, color: '#A8854F' },
];

// A single ITEM_ALTERNATIVES row surfaced as a callout — alt_reason is the
// real column; the item names/savings estimate are what a join + price
// diff against the swapped-out item would return.
const ALTERNATIVE = {
  alt_id: 1,
  projItem_id: 3,
  alternative_item_id: 21,
  alt_reason: 'Brass fixtures run high. A brushed-nickel set saves ~$1,400 with a similar warmth.',
  alt_rank: 1,
};

export default function BudgetScreen({ onBack, onContinue, onMenu }) {
  const allocatedTotal = ALLOCATION.reduce((sum, a) => sum + a.total, 0);
  const buffer = BUDGET.bud_maxAmount - PROJECT.proj_budgetMaxOverride;
  const withinBudget = PROJECT.proj_budgetMaxOverride <= BUDGET.bud_maxAmount;

  return (
    <LightScene>
      <AppBar onBack={onBack} eyebrow="Confidence" title="Budget review" onMenu={onMenu} />
      <div style={{ position: 'absolute', inset: 0, padding: '108px 20px 140px', overflowY: 'auto', boxSizing: 'border-box' }}>

        {/* big number hero — sits directly on dark LightScene, text is white */}
        <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 30, padding: '0 14px', borderRadius: 999, background: 'rgba(122,185,107,0.16)', marginBottom: 18 }}>
            <Icon name="checkCircle" size={16} color="#5a9a4c" stroke={2} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, color: '#5a9a4c' }}>{withinBudget ? 'Comfortably within budget' : 'Over budget'}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(222,187,128,0.9)' }}>Estimated range</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '6px 0 4px', color: 'rgb(255,255,255)' }}>${PROJECT.proj_budgetMinOverride.toLocaleString()}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'rgb(182,182,182)' }}>
            to ${PROJECT.proj_budgetMaxOverride.toLocaleString()} · target was <strong style={{ color: 'rgb(255,255,255)' }}>${Math.round(BUDGET.bud_maxAmount / 1000)}K</strong>
          </div>
        </div>

        {/* allocation bar inside GlassPanel (white frosted card) */}
        <GlassPanel style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>Allocation</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>${buffer.toLocaleString()} buffer</span>
          </div>
          <div style={{ display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden', background: 'rgba(95,85,76,0.1)' }}>
            {ALLOCATION.map((a) => (
              <div key={a.item_category} style={{ width: `${Math.round((a.total / allocatedTotal) * 100)}%`, background: a.color }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
            {ALLOCATION.map((a) => (
              <div key={a.item_category} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: a.color, display: 'inline-block' }} />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-2)' }}>
                  {a.item_category} <strong style={{ color: 'var(--fg-1)' }}>${(a.total / 1000).toFixed(1)}K</strong>
                </span>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* warning callout — surfaces one ITEM_ALTERNATIVES suggestion */}
        <div style={{ display: 'flex', gap: 13, padding: 16, borderRadius: 20, background: 'rgba(212,164,90,0.18)', border: '1px solid rgba(212,164,90,0.42)', marginBottom: 12 }}>
          <Icon name="alert" size={22} color="#e3b878" stroke={1.8} style={{ flex: 'none', marginTop: 1 }} />
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.5, color: 'rgb(255,255,255)' }}>
            {ALTERNATIVE.alt_reason}
          </div>
        </div>

        {/* adjust package button — white card */}
        <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: 16, borderRadius: 20, background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', flex: 'none', background: 'var(--champagne-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sparkle" size={19} color="#fff" stroke={1.7} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'var(--fg-1)' }}>Adjust package</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-2)', marginTop: 1 }}>See smart swaps to free up budget</div>
          </div>
          <Icon name="chevronRight" size={19} color="var(--fg-3)" stroke={2} />
        </button>
      </div>

      {/* bottom CTA — tall cream gradient that reaches up to content, eliminating dark gap */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '138px 20px 28px', zIndex: 20, background: 'linear-gradient(180deg, rgba(247,243,236,0), rgba(247,243,236,0.96) 40%)' }}>
        <PrimaryButton onClick={onContinue}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
            Continue to summary <Icon name="arrowRight" size={18} stroke={1.8} />
          </span>
        </PrimaryButton>
      </div>
    </LightScene>
  );
}
