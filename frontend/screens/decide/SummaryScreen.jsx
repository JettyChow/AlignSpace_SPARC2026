'use client';

import LightScene from '@/components/frame/LightScene';
import AppBar from '@/components/frame/AppBar';
import { PrimaryButton, GlassButton } from '@/components/Buttons';
import PhotoTile from '@/components/PhotoTile';
import Icon from '@/components/Icon';

const STATS = [
  { icon: 'sparkle', label: 'Direction selected', value: 'Warm Minimal', meta: '92% match' },
  { icon: 'layers',  label: 'FFE status',         value: '6 of 9 confirmed', meta: '67% complete' },
  { icon: 'dollar',  label: 'Budget summary',     value: '$31.4K–$38.2K',   meta: 'Within $50K' },
];

const OUTSTANDING = ['Floor tile selection', 'Faucet & shower system', 'Mirror & hardware'];

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
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}>PRIMARY BATHROOM</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>Warm Minimal renovation</div>
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
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'rgb(255,255,255)' }}>3 outstanding decisions</div>
          {OUTSTANDING.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--warning)', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgb(228,210,194)' }}>{d}</span>
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
