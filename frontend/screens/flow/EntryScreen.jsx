'use client';

import LightScene from '@/components/frame/LightScene';
import { Mark } from '@/components/Logo';
import RoundIconButton from '@/components/frame/RoundIconButton';
import FloralDivider from '@/components/FloralDivider';
import Icon from '@/components/Icon';
import PhotoTile from '@/components/PhotoTile';

function EntryCard({ tone, icon, title, subtitle, accent, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', borderRadius: 22, overflow: 'hidden', cursor: 'pointer',
      border: accent ? '1px solid rgba(198,163,107,0.55)' : '1px solid rgba(255,255,255,0.10)',
      background: accent ? 'rgba(198,163,107,0.12)' : 'rgba(255,255,255,0.04)',
      padding: 0, display: 'flex', alignItems: 'center', transition: 'all 180ms ease',
    }}>
      {tone ? (
        <div style={{ width: 70, height: 70, flexShrink: 0 }}>
          <PhotoTile tone={tone} style={{ width: '100%', height: '100%', borderRadius: 0 }} />
        </div>
      ) : (
        <div style={{ width: 70, height: 70, flexShrink: 0, background: accent ? 'rgba(198,163,107,0.22)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={28} stroke={1.5} color={accent ? 'var(--champagne)' : 'rgba(255,255,255,0.8)'} />
        </div>
      )}
      <div style={{ flex: 1, padding: '14px 16px', textAlign: 'left' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: accent ? 'var(--champagne)' : 'rgba(247,242,234,0.95)', marginBottom: 3 }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'rgba(247,242,234,0.52)', lineHeight: 1.4 }}>{subtitle}</div>
      </div>
      <Icon name="chevron-right" size={18} stroke={1.8} color={accent ? 'var(--champagne)' : 'rgba(255,255,255,0.35)'} style={{ marginRight: 16 }} />
    </button>
  );
}

export default function EntryScreen({ role, onNew, onContinue, onSupport }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <LightScene>
      <div style={{ position: 'absolute', inset: 0, padding: '60px 24px 100px', overflowY: 'auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <Mark size={34} />
          <div style={{ display: 'flex', gap: 10 }}>
            <RoundIconButton icon="bell" onClick={() => onSupport?.('notifications')} />
            <RoundIconButton icon="user" onClick={() => onSupport?.('profile')} />
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--champagne)', opacity: 0.8, marginBottom: 4 }}>{greeting}</div>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 34, fontWeight: 600, color: 'rgba(247,242,234,0.97)', letterSpacing: '-0.015em', lineHeight: 1.1, margin: 0 }}>
          {role === 'designer' ? 'Your workspace' : 'Maya Chen'}
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(247,242,234,0.54)', marginTop: 8, marginBottom: 28 }}>
          {role === 'designer' ? '3 projects need your attention today' : "Let's continue shaping your space"}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <EntryCard accent icon="plus" title="Create new project" subtitle="Start a fresh renovation journey" onClick={onNew} />
          <EntryCard tone="warmwhite" icon="layers" title="Continue: Living Room" subtitle="Package review · 68% complete" onClick={onContinue} />
          <EntryCard tone="linen" icon="book-open" title="Saved inspirations" subtitle="12 saved pieces" onClick={() => onSupport?.('saved')} />
          <EntryCard tone="oak" icon="clock" title="Project history" subtitle="3 completed · 1 active" onClick={() => onSupport?.('history')} />
        </div>

        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <FloralDivider width={200} />
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, textAlign: 'center', color: 'rgba(247,242,234,0.38)', lineHeight: 1.5 }}>AlignSpace · Renovation Workflow Platform</p>
        </div>
      </div>
    </LightScene>
  );
}
