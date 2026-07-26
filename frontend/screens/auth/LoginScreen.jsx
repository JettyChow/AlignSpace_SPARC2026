'use client';

import { useState } from 'react';
import DarkScene from '@/components/frame/DarkScene';
import Logo from '@/components/Logo';
import FloralDivider from '@/components/FloralDivider';
import { PrimaryButton } from '@/components/Buttons';
import Field from '@/components/Field';
import Icon from '@/components/Icon';

export default function LoginScreen({ role, onLogin, onBack, onSignup }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const features = [
    { icon: 'layers', label: 'Structured\nDecisions', gold: false },
    { icon: 'dollar', label: 'Budget\nAware', gold: false },
    { icon: 'hexagon', label: 'Buildable\nSolutions', gold: true },
    { icon: 'users', label: 'Collaborative\nWorkflows', gold: false },
  ];
  return (
    <DarkScene>
      <div style={{ position: 'absolute', inset: 0, padding: '70px 24px 30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="chevron-left" size={20} color="rgba(255,255,255,0.7)" stroke={2} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Back</span>
          </button>
        </div>
        <Logo markSize={46} wordSize={15} />
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--champagne)', textAlign: 'center', marginTop: 14, lineHeight: 1.45, opacity: 0.85 }}>Signing in as {role === 'designer' ? 'a designer' : 'a client'}</div>

        <div className="lg lg-drift" style={{
          width: '100%', marginTop: 22, padding: '28px 24px 26px', boxSizing: 'border-box',
          borderRadius: 32, border: '1px solid rgba(255,255,255,0.16)',
          '--lg-tint': 'linear-gradient(155deg, rgba(34,27,20,0.34), rgba(14,11,8,0.46))',
          '--lg-blur': '10px', '--lg-sheen': 0.28, '--lg-bright': 1.0,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 1px 1px 1px rgba(255,255,255,0.12), 0 22px 58px rgba(0,0,0,0.36)',
        }}>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 27, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.15, letterSpacing: '-0.015em' }}>Log in to AlignSpace</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.5, color: 'rgba(255,255,255,0.66)', margin: '8px 0 26px' }}>Continue your renovation workflow and project progress</p>
          <Field label="Email address" icon="mail" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field label="Password" icon="lock" type={show ? 'text' : 'password'} placeholder="Enter your password" value={pw} onChange={(e) => setPw(e.target.value)}
            trailing={<button onClick={() => setShow(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><Icon name="eye" size={20} color="rgba(255,255,255,0.55)" stroke={1.6} /></button>} />
          <div style={{ textAlign: 'right', marginTop: -6, marginBottom: 22 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--champagne)', cursor: 'pointer' }}>Forgot password?</span>
          </div>
          <PrimaryButton onClick={onLogin}>Login</PrimaryButton>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '22px 0 16px' }}>
            <FloralDivider width={180} color="rgba(255,255,255,0.35)" />
          </div>
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
            {"Don't have an account? "}<span onClick={onSignup} style={{ color: 'var(--champagne)', fontWeight: 600, cursor: 'pointer' }}>Sign up</span>
          </div>
        </div>

        <div style={{ display: 'flex', width: '100%', marginTop: 24, paddingBottom: 4 }}>
          {features.map((f, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '0 4px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.12)' : 'none' }}>
              <Icon name={f.icon} size={26} stroke={1.5} color={f.gold ? 'var(--champagne)' : 'rgba(255,255,255,0.8)'} />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, textAlign: 'center', color: 'rgba(255,255,255,0.78)', lineHeight: 1.3, whiteSpace: 'pre-line' }}>{f.label}</span>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 20, textAlign: 'center' }}>© 2026 AlignSpace. All rights reserved.</div>
      </div>
    </DarkScene>
  );
}
