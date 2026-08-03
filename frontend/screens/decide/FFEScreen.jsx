'use client';

import { useState } from 'react';
import LightScene from '@/components/frame/LightScene';
import AppBar from '@/components/frame/AppBar';
import { PrimaryButton } from '@/components/Buttons';
import PhotoTile from '@/components/PhotoTile';
import StatusPill from '@/components/StatusPill';
import GlassPanel from '@/components/GlassPanel';
import Icon from '@/components/Icon';

const FFE = [
  { id: 'materials', group: 'Materials', icon: 'layers', hero: { tone: 'oak', pos: '42% 80%' }, items: [
    { name: 'White oak flooring',    tone: 'oak',       pos: '42% 80%' },
    { name: 'Honed travertine wall', tone: 'travertine', pos: '30% 24%' },
    { name: 'Lime plaster finish',   tone: 'warmwhite', pos: '8% 56%'  },
  ]},
  { id: 'fixtures', group: 'Fixtures', icon: 'faucet', hero: { tone: 'sand', pos: '55% 62%' }, items: [
    { name: 'Brushed brass faucet set',  tone: 'sand',  pos: '55% 62%' },
    { name: 'Rain shower head',          tone: 'stone', pos: '50% 30%' },
    { name: 'Concealed linear drain',    tone: 'stone', pos: '40% 86%' },
  ]},
  { id: 'lighting', group: 'Lighting', icon: 'light', hero: { tone: 'warmwhite', pos: '78% 40%' }, items: [
    { name: 'Warm LED plan',          tone: 'warmwhite', pos: '78% 32%' },
    { name: 'Brass wall sconces',     tone: 'clay',      pos: '12% 48%' },
    { name: 'Recessed ceiling spots', tone: 'warmwhite', pos: '50% 12%' },
  ]},
  { id: 'textiles', group: 'Textiles', icon: 'sofa', hero: { tone: 'linen', pos: '82% 58%' }, items: [
    { name: 'Belgian linen drapery',   tone: 'linen', pos: '80% 36%' },
    { name: 'Wool-blend rug',          tone: 'linen', pos: '30% 88%' },
    { name: 'Bouclé accent cushions',  tone: 'linen', pos: '86% 60%' },
  ]},
  { id: 'surfaces', group: 'Surfaces', icon: 'tile', hero: { tone: 'stone', pos: '52% 64%' }, items: [
    { name: 'Quartzite countertop', tone: 'stone',      pos: '54% 62%' },
    { name: 'Zellige wall tile',    tone: 'travertine', pos: '25% 30%' },
    { name: 'White oak cabinetry',  tone: 'oak',        pos: '6% 62%'  },
  ]},
];

function ProgressRing({ pct, size = 64 }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(95,85,76,0.14)" strokeWidth="6" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--champagne)" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset var(--dur-slow) var(--ease-soft)' }} />
    </svg>
  );
}

function ItemTile({ tone, pos, label, height }) {
  return (
    <PhotoTile tone={tone} photo photoPos={pos} height={height} radius={0}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 45%, rgba(20,15,10,0.55) 100%)' }} />
      {label && (
        <div style={{ position: 'absolute', left: 18, bottom: 13, whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)', fontSize: 15.5, fontWeight: 600, color: '#fff', textShadow: '0 1px 8px rgba(0,0,0,0.55)' }}>{label}</div>
      )}
    </PhotoTile>
  );
}

function FFEGroup({ g, confirmedSection, open, onToggle }) {
  return (
    <div style={{ borderRadius: 22, background: '#fff', border: `1px solid ${confirmedSection ? 'rgba(122,185,107,0.4)' : 'var(--line)'}`, boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 13, padding: '13px 14px 12px', cursor: 'pointer', background: 'transparent', border: 'none', textAlign: 'left' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, flex: 'none', background: confirmedSection ? 'rgba(122,185,107,0.16)' : 'var(--soft-beige)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
          <Icon name={g.icon} size={21} color={confirmedSection ? '#4e8c40' : 'var(--dark-taupe)'} stroke={1.7} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 600, color: 'var(--fg-1)', letterSpacing: '-0.01em' }}>{g.group}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--fg-3)', marginTop: 2, lineHeight: 1.3 }}>
            {confirmedSection ? `${g.items.length} items confirmed` : `${g.items.length} items · awaiting confirmation`}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none', marginTop: 2 }}>
          <StatusPill kind={confirmedSection ? 'confirmed' : 'review'} />
          <Icon name="chevronDown" size={20} color="var(--fg-3)" stroke={2} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-base) var(--ease-soft)' }} />
        </div>
      </button>
      {open ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {g.items.map((it, i) => <ItemTile key={i} tone={it.tone} pos={it.pos} label={it.name} height={104} />)}
        </div>
      ) : (
        <ItemTile tone={g.hero.tone} pos={g.hero.pos} height={96} />
      )}
    </div>
  );
}

export default function FFEScreen({ confirmed = [], onBack, onContinue, onMenu }) {
  const [open, setOpen] = useState('materials');

  const done = FFE.filter(g => confirmed.includes(g.id)).length;
  const total = FFE.length;
  const pct = Math.round(done / total * 100);

  const headline = done === 0
    ? 'Confirm sections to begin'
    : done === total
    ? "Everything's confirmed"
    : "You're making great progress";

  const sub = done === 0
    ? 'Tap "Looks good to me" on each material section to sync it here.'
    : done === total
    ? `All ${total} sections confirmed — ready for review.`
    : `${done} of ${total} sections confirmed. ${total - done} left to review.`;

  return (
    <LightScene>
      <AppBar onBack={onBack} eyebrow="Step 3 · Decisions" title="Decision tracker" onMenu={onMenu} />

      {/* inset: 0 with top/bottom padding — content clears AppBar (108px) and CTA (96px) */}
      <div style={{ position: 'absolute', inset: 0, padding: '108px 20px 96px', overflowY: 'auto', boxSizing: 'border-box' }}>

        {/* progress summary — GlassPanel (frosted white card, dark text inside) */}
        <GlassPanel style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, padding: '16px 18px' }}>
          <div style={{ position: 'relative', width: 60, height: 60, flex: 'none' }}>
            <ProgressRing pct={pct} size={60} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 700, color: 'var(--fg-1)' }}>{pct}%</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 600, color: 'var(--fg-1)', letterSpacing: '-0.01em' }}>{headline}</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, color: 'var(--fg-2)', marginTop: 4, lineHeight: 1.4 }}>{sub}</div>
          </div>
        </GlassPanel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FFE.map(g => (
            <FFEGroup
              key={g.id}
              g={g}
              confirmedSection={confirmed.includes(g.id)}
              open={open === g.id}
              onToggle={() => setOpen(open === g.id ? null : g.id)}
            />
          ))}
        </div>
      </div>

      {/* bottom CTA — light warm cream fade matching BudgetScreen / SummaryScreen */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px 28px', zIndex: 20, background: 'linear-gradient(180deg, rgba(247,243,236,0), rgba(247,243,236,0.96) 40%)' }}>
        <PrimaryButton onClick={onContinue}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
            See budget review <Icon name="arrowRight" size={18} stroke={1.8} />
          </span>
        </PrimaryButton>
      </div>
    </LightScene>
  );
}
