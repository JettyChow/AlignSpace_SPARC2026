'use client';

import { useState, useEffect } from 'react';
import DarkScene from '@/components/frame/DarkScene';
import { Mark } from '@/components/Logo';
import Icon from '@/components/Icon';

const PROCESS_STAGES = [
  { icon: 'layers', label: 'Analysing your preferences' },
  { icon: 'hexagon', label: 'Generating design directions' },
  { icon: 'package', label: 'Building material palette' },
];

export default function ProcessingScreen({ onDone }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setActiveIdx(1), 1600);
    const t2 = setTimeout(() => setActiveIdx(2), 3200);
    const t3 = setTimeout(onDone, 4800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <DarkScene>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
        <div style={{ position: 'relative', width: 180, height: 180, marginBottom: 48 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute', inset: i * 22,
              borderRadius: '50%', border: '1px solid rgba(255,255,255,0.13)',
              background: `rgba(255,255,255,0.0${4 - i})`,
              backdropFilter: 'blur(6px)',
              animation: 'breathe 3.2s ease-in-out infinite',
              animationDelay: `${i * 0.4}s`,
            }} />
          ))}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mark size={46} />
          </div>
          <style>{`@keyframes breathe { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }`}</style>
        </div>

        <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 600, color: 'rgba(247,242,234,0.96)', textAlign: 'center', letterSpacing: '-0.01em', marginBottom: 8 }}>Creating your design brief</h2>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(247,242,234,0.5)', textAlign: 'center', marginBottom: 40 }}>Our AI is analysing your preferences…</p>

        <div style={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {PROCESS_STAGES.map((s, i) => {
            const done = i < activeIdx;
            const active = i === activeIdx;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: active || done ? 1 : 0.35, transition: 'opacity 500ms ease' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: done ? 'none' : active ? '1px solid rgba(198,163,107,0.6)' : '1px solid rgba(255,255,255,0.16)',
                  background: done ? 'rgba(122,185,107,0.22)' : active ? 'rgba(198,163,107,0.15)' : 'rgba(255,255,255,0.04)',
                }}>
                  {done ? <Icon name="check" size={18} stroke={2.2} color="#7AB96B" /> : <Icon name={s.icon} size={18} stroke={1.5} color={active ? 'var(--champagne)' : 'rgba(255,255,255,0.55)'} />}
                </div>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, color: done ? 'rgba(247,242,234,0.6)' : active ? 'rgba(247,242,234,0.95)' : 'rgba(247,242,234,0.4)' }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </DarkScene>
  );
}
