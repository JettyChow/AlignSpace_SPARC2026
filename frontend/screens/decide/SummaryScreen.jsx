'use client';

import LightScene from '@/components/frame/LightScene';
import AppBar from '@/components/frame/AppBar';
import { PrimaryButton, GlassButton } from '@/components/Buttons';
import PhotoTile from '@/components/PhotoTile';
import Icon from '@/components/Icon';

// Placeholder PROJECTS row (+ its ROOM_TYPES/STYLES/BUDGETS joins) — field
// names mirror the DBML schema so a real fetch is a drop-in swap.
const PROJECT = {
  proj_id: 1,
  proj_title: 'Warm Minimal renovation',
  proj_matchPercent: 92,
  proj_completionPercent: 67,
  proj_budgetMinOverride: 31400,
  proj_budgetMaxOverride: 38200,
  roomType: { roomType_id: 1, roomType_name: 'Primary bathroom' },
  styles: [{ sty_id: 1, sty_name: 'Warm Minimal' }],
};
const BUDGET = { bud_id: 1, bud_maxAmount: 50000 };

// FFE section confirmation counts — an aggregate over ROOMS/PROJECT_ITEMS,
// not a single schema column, so it's kept as its own small placeholder.
const FFE_SECTIONS = { confirmed: 6, total: 9 };

// PROJECT_ITEMS still awaiting a decision (status !== 'approved').
const OUTSTANDING_ITEMS = [
  { projItem_id: 1, item_name: 'Floor tile selection', projItem_status: 'pending' },
  { projItem_id: 2, item_name: 'Faucet & shower system', projItem_status: 'pending' },
  { projItem_id: 3, item_name: 'Mirror & hardware', projItem_status: 'pending' },
];

const STATS = [
  { icon: 'sparkle', label: 'Direction selected', value: PROJECT.styles[0]?.sty_name, meta: `${PROJECT.proj_matchPercent}% match` },
  { icon: 'layers', label: 'FFE status', value: `${FFE_SECTIONS.confirmed} of ${FFE_SECTIONS.total} confirmed`, meta: `${PROJECT.proj_completionPercent}% complete` },
  { icon: 'dollar', label: 'Budget summary', value: `$${(PROJECT.proj_budgetMinOverride / 1000).toFixed(1)}K–$${(PROJECT.proj_budgetMaxOverride / 1000).toFixed(1)}K`, meta: `Within $${Math.round(BUDGET.bud_maxAmount / 1000)}K` },
];

export default function SummaryScreen({ role, onBack, onHandoff, onMenu }) {
  return (
    <LightScene>
      <AppBar onBack={onBack} eyebrow="Before handoff" title="Project summary" onMenu={onMenu} />
      <div style={{ position: 'absolute', inset: 0, padding: '108px 20px 96px', overflowY: 'auto', boxSizing: 'border-box' }}>

        {/* project header card — white card with scene photo */}
        <div style={{ borderRadius: 24, overflow: 'hidden', background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)', marginBottom: 18 }}>
          <PhotoTile tone="travertine" photo photoPos="64% 46%" height={140} radius={0}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(14,11,8,0.6))' }} />
            <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}>{PROJECT.roomType.roomType_name.toUpperCase()}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>{PROJECT.proj_title}</div>
            </div>
          </PhotoTile>
        </div>

        {/* 3 stat rows — each a white card */}
        {STATS.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', borderRadius: 20, background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)', marginBottom: 11 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, flex: 'none', background: 'var(--soft-beige)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={r.icon} size={20} color="var(--dark-taupe)" stroke={1.7} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{r.label}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600, color: 'var(--fg-1)', marginTop: 1 }}>{r.value}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--champagne-deep)' }}>{r.meta}</span>
          </div>
        ))}

        {/* outstanding decisions */}
        <div style={{ marginTop: 10, padding: 18, borderRadius: 20, background: 'rgba(212,164,90,0.1)', border: '1px solid rgba(212,164,90,0.28)' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'rgb(255,255,255)' }}>{OUTSTANDING_ITEMS.length} outstanding decisions</div>
          {OUTSTANDING_ITEMS.map((item) => (
            <div key={item.projItem_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--warning)', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgb(228,210,194)' }}>{item.item_name}</span>
            </div>
          ))}
        </div>

        {/* edit / save glass buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <GlassButton dark={false} full onClick={onBack}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <Icon name="edit" size={17} stroke={1.8} /> Edit
            </span>
          </GlassButton>
          <GlassButton dark={false} full>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <Icon name="bookmark" size={17} stroke={1.8} /> Save
            </span>
          </GlassButton>
        </div>
      </div>

      {/* bottom CTA — light warm cream fade */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px 28px', zIndex: 20, background: 'linear-gradient(180deg, rgba(247,243,236,0), rgba(247,243,236,0.96) 40%)' }}>
        <PrimaryButton onClick={onHandoff}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
            <Icon name="users" size={19} stroke={1.7} /> Hand over to designer
          </span>
        </PrimaryButton>
      </div>
    </LightScene>
  );
}
