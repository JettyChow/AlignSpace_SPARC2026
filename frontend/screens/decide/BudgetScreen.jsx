'use client';

import LightScene from '@/components/frame/LightScene';
import AppBar from '@/components/frame/AppBar';
import { PrimaryButton } from '@/components/Buttons';
import GlassPanel from '@/components/GlassPanel';
import Icon from '@/components/Icon';
import { groupLineItems } from '@/lib/materialCategories';

// Real numbers from the deliverable's BudgetReport (as-ai-server's budget
// agent — src/pipeline/agents/budget.py) + the MaterialPackage's line_items,
// grouped into the same Materials/Fixtures/Lighting buckets PackageScreen
// and FFEScreen use (see lib/materialCategories.js).
const ALLOCATION_COLORS = { materials: '#C6A36B', fixtures: '#D8C5A9', lighting: '#A8854F' };

export default function BudgetScreen({ deliverable, onBack, onContinue, onMenu }) {
  const pkg = deliverable?.package;
  const budget = deliverable?.budget;

  if (!pkg || !budget) {
    return (
      <LightScene>
        <AppBar onBack={onBack} eyebrow="Confidence" title="Budget review" onMenu={onMenu} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(247,242,234,0.6)' }}>
            No budget yet — pick a direction to generate one.
          </span>
        </div>
      </LightScene>
    );
  }

  const primaryTotal = pkg.estimated_total;
  const withinBudget = budget.status === 'within';
  const buffer = budget.band_ceiling - primaryTotal;

  const ALLOCATION = groupLineItems(pkg.line_items)
    .map((g) => ({
      group: g.id,
      label: g.label,
      total: g.items.reduce((sum, li) => sum + li.subtotal, 0),
      color: ALLOCATION_COLORS[g.id],
    }))
    .filter((a) => a.total > 0);

  // Cheaper alternates the budget agent found (only populated when the
  // package came in over budget — see budget.py's suggested_swaps).
  const topSwap = budget.suggested_swaps?.length
    ? [...budget.suggested_swaps].sort((a, b) => b.savings - a.savings)[0]
    : null;

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
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(222,187,128,0.9)' }}>Estimated total</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '6px 0 4px', color: 'rgb(255,255,255)' }}>${primaryTotal.toLocaleString()}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'rgb(182,182,182)' }}>
            {budget.budget_band} budget · target was <strong style={{ color: 'rgb(255,255,255)' }}>${Math.round(budget.band_ceiling / 1000)}K</strong>
          </div>
        </div>

        {/* allocation bar inside GlassPanel (white frosted card) */}
        <GlassPanel style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>Allocation</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: buffer >= 0 ? 'var(--success)' : '#e08787' }}>
              {buffer >= 0 ? `$${buffer.toLocaleString()} buffer` : `$${Math.abs(buffer).toLocaleString()} over`}
            </span>
          </div>
          <div style={{ display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden', background: 'rgba(95,85,76,0.1)' }}>
            {ALLOCATION.map((a) => (
              <div key={a.group} style={{ width: `${Math.round((a.total / primaryTotal) * 100)}%`, background: a.color }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
            {ALLOCATION.map((a) => (
              <div key={a.group} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: a.color, display: 'inline-block' }} />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-2)' }}>
                  {a.label} <strong style={{ color: 'var(--fg-1)' }}>${(a.total / 1000).toFixed(1)}K</strong>
                </span>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* warning callout — surfaces the budget agent's top suggested_swaps entry */}
        {topSwap && (
          <div style={{ display: 'flex', gap: 13, padding: 16, borderRadius: 20, background: 'rgba(212,164,90,0.18)', border: '1px solid rgba(212,164,90,0.42)', marginBottom: 12 }}>
            <Icon name="alert" size={22} color="#e3b878" stroke={1.8} style={{ flex: 'none', marginTop: 1 }} />
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.5, color: 'rgb(255,255,255)' }}>
              Swap {topSwap.from_product.toLowerCase()} for {topSwap.to_product.toLowerCase()} to save ~${topSwap.savings.toLocaleString()}
              {!withinBudget && budget.adjusted_total <= budget.band_ceiling ? ', bringing you within budget.' : '.'}
            </div>
          </div>
        )}

        {/* adjust package button — white card */}
        <button onClick={onBack} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: 16, borderRadius: 20, background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', flex: 'none', background: 'var(--champagne-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sparkle" size={19} color="#fff" stroke={1.7} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'var(--fg-1)' }}>Adjust package</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-2)', marginTop: 1 }}>
              {topSwap ? 'See smart swaps to free up budget' : 'Review the material list'}
            </div>
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
