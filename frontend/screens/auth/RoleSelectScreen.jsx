'use client';

import { useState } from 'react';
import DarkScene from '@/components/frame/DarkScene';
import Logo from '@/components/Logo';
import FloralDivider from '@/components/FloralDivider';
import Icon from '@/components/Icon';

function RoleCard({ icon, title, desc, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} className="lg"
      onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}
      style={{
        flex: 1, minWidth: 0, textAlign: 'left', cursor: 'pointer', padding: 20,
        background: 'transparent',
        borderRadius: 28, border: '1px solid rgba(255,255,255,0.16)',
        '--lg-tint': hover
          ? 'linear-gradient(155deg, rgba(34,27,20,0.20), rgba(14,11,8,0.30))'
          : 'linear-gradient(155deg, rgba(28,22,17,0.22), rgba(12,9,7,0.34))',
        '--lg-blur': '7px',
        '--lg-sheen': hover ? 0.34 : 0.22,
        '--lg-bright': 1.0,
        boxShadow: hover
          ? 'inset 0 1px 0 rgba(255,255,255,0.45), inset 1px 1px 1px rgba(255,255,255,0.16), 0 18px 50px rgba(0,0,0,0.34)'
          : 'inset 0 1px 0 rgba(255,255,255,0.35), inset 1px 1px 1px rgba(255,255,255,0.12), 0 14px 44px rgba(0,0,0,0.30)',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'all var(--dur-slow) var(--ease-soft)',
        display: 'flex', flexDirection: 'column', minHeight: 190,
      }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%', marginBottom: 'auto',
        border: '1px solid rgba(255,255,255,0.30)', background: 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.94)',
      }}>
        <Icon name={icon} size={25} stroke={1.5} />
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', marginTop: 18 }}>{title}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.45, color: 'rgba(255,255,255,0.62)', marginTop: 6 }}>{desc}</div>
    </button>
  );
}

export default function RoleSelectScreen({ onSelect }) {
  return (
    <DarkScene>
      <div style={{ position: 'absolute', inset: 0, padding: '64px 26px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}>
        <Logo markSize={50} wordSize={16} />
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 400, textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginTop: 14, lineHeight: 1.45 }}>AI-powered renovation<br/>workflow platform</div>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 39, fontWeight: 300, textAlign: 'center', color: 'rgba(255,255,255,0.96)', letterSpacing: '-0.01em', lineHeight: 1.12, margin: '30px 0 0' }}>Who are you<br/>signing in as?</h1>
        <div style={{ display: 'flex', gap: 14, width: '100%', marginTop: 28 }}>
          <RoleCard icon="home" title="I'm a client" desc="I want to design or renovate a space" onClick={() => onSelect('client')} />
          <RoleCard icon="ruler" title="I'm a designer" desc="I manage projects and review client selections" onClick={() => onSelect('designer')} />
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, paddingTop: 28 }}>
          <FloralDivider width={240} />
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, textAlign: 'center', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, maxWidth: 280 }}>Same application · same login page ·<br/>different experience based on your role</div>
        </div>
      </div>
    </DarkScene>
  );
}
