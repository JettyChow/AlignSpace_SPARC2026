'use client';

import LightScene from '@/components/frame/LightScene';
import AppBar from '@/components/frame/AppBar';
import PhotoTile from '@/components/PhotoTile';
import Icon from '@/components/Icon';

const HISTORY = [
  { id: 1, tone: 'linen', name: 'Living Room Refresh', stage: 'Handoff', date: 'Jul 2026', budget: '$31,400', progress: 100, done: true },
  { id: 2, tone: 'travertine', name: 'Master Bath Reno', stage: 'Summary', date: 'May 2026', budget: '$34,200', progress: 82, done: false },
  { id: 3, tone: 'oak', name: 'Kitchen Remodel', stage: 'Handoff', date: 'Jan 2026', budget: '$92,400', progress: 100, done: true },
  { id: 4, tone: 'sand', name: 'Home Office', stage: 'Handoff', date: 'Nov 2025', budget: '$18,750', progress: 100, done: true },
];

export default function HistoryScreen({ onBack, onOpen }) {
  return (
    <LightScene>
      <AppBar onBack={onBack} title="Project history" />
      <div style={{ position: 'absolute', top: 88, bottom: 0, left: 0, right: 0, overflowY: 'auto', padding: '16px 18px 48px' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(247,242,234,0.45)', marginBottom: 16 }}>{HISTORY.length} projects</div>
        {HISTORY.map(p => {
          const doneColor = p.done ? '#7AB96B' : '#D4A45A';
          const doneLabel = p.done ? 'Complete' : 'In progress';
          return (
            <button key={p.id} onClick={() => onOpen?.(p)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 0, borderRadius: 20, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', marginBottom: 10, textAlign: 'left',
            }}>
              <PhotoTile tone={p.tone} style={{ width: 76, height: 82, borderRadius: 0, flexShrink: 0 }} />
              <div style={{ flex: 1, padding: '12px 14px', minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 600, color: 'rgba(247,242,234,0.95)', marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(247,242,234,0.42)', marginBottom: 8 }}>{p.date} · {p.stage}</div>
                <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ height: '100%', width: `${p.progress}%`, background: p.done ? 'rgba(122,185,107,0.7)' : 'var(--champagne)', borderRadius: 2 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: doneColor }} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: doneColor }}>{doneLabel}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, color: 'rgba(247,242,234,0.78)' }}>{p.budget}</span>
                </div>
              </div>
              <div style={{ paddingRight: 14, flexShrink: 0 }}>
                <Icon name="chevron-right" size={16} stroke={1.8} color="rgba(255,255,255,0.25)" />
              </div>
            </button>
          );
        })}
      </div>
    </LightScene>
  );
}
