'use client';

import { useState } from 'react';
import DarkScene from '@/components/frame/DarkScene';
import Logo from '@/components/Logo';
import { PrimaryButton, GlassButton } from '@/components/Buttons';
import Field from '@/components/Field';
import Icon from '@/components/Icon';

function GoogleGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" style={{ display: 'block', flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A24 24 0 0 0 0 24c0 3.86.92 7.51 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.9l-7.97 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M16.365 1.43c0 1.14-.468 2.11-1.14 2.86-.73.82-1.94 1.45-2.95 1.37-.13-1.1.42-2.24 1.1-2.95.75-.8 2.04-1.4 2.99-1.28zm3.02 16.65c-.47 1.09-.7 1.58-1.31 2.55-.85 1.35-2.05 3.04-3.54 3.05-1.32.02-1.66-.86-3.45-.85-1.79.01-2.17.87-3.49.85-1.49-.02-2.63-1.53-3.48-2.88C1.94 17.7.9 13.94 2.35 11.4c.72-1.27 2.02-2.07 3.44-2.09 1.35-.02 2.62.9 3.45.9.82 0 2.38-1.12 4.01-.95.68.03 2.6.28 3.83 2.06-.1.06-2.29 1.34-2.27 3.99.03 3.17 2.78 4.22 2.81 4.24-.03.08-.44 1.5-1.45 2.98z" />
    </svg>
  );
}

export default function SignupScreen({
  role, onSignup, onGoogle, onApple, onBack, onLogin,
  loading, error, pendingVerification, onVerify, verifying, verifyError,
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [code, setCode] = useState('');

  if (pendingVerification) {
    return (
      <DarkScene>
        <div style={{ position: 'absolute', inset: 0, padding: '70px 24px 30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}>
          <Logo markSize={46} wordSize={15} />
          <div className="lg lg-drift" style={{
            width: '100%', marginTop: 22, padding: '28px 24px 26px', boxSizing: 'border-box',
            borderRadius: 32, border: '1px solid rgba(255,255,255,0.16)',
            '--lg-tint': 'linear-gradient(155deg, rgba(34,27,20,0.34), rgba(14,11,8,0.46))',
            '--lg-blur': '10px', '--lg-sheen': 0.28, '--lg-bright': 1.0,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 1px 1px 1px rgba(255,255,255,0.12), 0 22px 58px rgba(0,0,0,0.36)',
          }}>
            <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 27, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.15, letterSpacing: '-0.015em' }}>Verify your email</h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.5, color: 'rgba(255,255,255,0.66)', margin: '8px 0 26px' }}>Enter the code we just sent to {email || 'your email'}.</p>
            <Field label="Verification code" icon="lock" placeholder="Enter the 6-digit code" value={code} onChange={(e) => setCode(e.target.value)} />
            {verifyError && (
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#e08787', marginTop: -12, marginBottom: 18 }}>{verifyError}</div>
            )}
            <PrimaryButton onClick={() => onVerify?.(code)} style={{ marginTop: 4, opacity: verifying ? 0.7 : 1 }}>
              {verifying ? 'Verifying…' : 'Verify & continue'}
            </PrimaryButton>
          </div>
        </div>
      </DarkScene>
    );
  }

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
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--champagne)', textAlign: 'center', marginTop: 14, lineHeight: 1.45, opacity: 0.85 }}>Signing up as {role === 'designer' ? 'a designer' : 'a client'}</div>

        <div className="lg lg-drift" style={{
          width: '100%', marginTop: 22, padding: '28px 24px 26px', boxSizing: 'border-box',
          borderRadius: 32, border: '1px solid rgba(255,255,255,0.16)',
          '--lg-tint': 'linear-gradient(155deg, rgba(34,27,20,0.34), rgba(14,11,8,0.46))',
          '--lg-blur': '10px', '--lg-sheen': 0.28, '--lg-bright': 1.0,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 1px 1px 1px rgba(255,255,255,0.12), 0 22px 58px rgba(0,0,0,0.36)',
        }}>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 27, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.15, letterSpacing: '-0.015em' }}>Create your account</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.5, color: 'rgba(255,255,255,0.66)', margin: '8px 0 26px' }}>Get started and simplify your renovation planning with AlignSpace.</p>

          <Field label="Full name" icon="user" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Field label="Email address" icon="mail" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field label="Password" icon="lock" type={showPw ? 'text' : 'password'} placeholder="Create a password" value={pw} onChange={(e) => setPw(e.target.value)}
            trailing={<button onClick={() => setShowPw(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><Icon name="eye" size={20} color="rgba(255,255,255,0.55)" stroke={1.6} /></button>} />
          <Field label="Confirm password" icon="lock" type={showConfirmPw ? 'text' : 'password'} placeholder="Confirm your password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
            trailing={<button onClick={() => setShowConfirmPw(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><Icon name="eye" size={20} color="rgba(255,255,255,0.55)" stroke={1.6} /></button>} />

          {error && (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#e08787', marginTop: -12, marginBottom: 18 }}>{error}</div>
          )}
          <PrimaryButton onClick={() => onSignup?.({ fullName, email, pw, confirmPw })} style={{ marginTop: 4, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating account…' : 'Sign up'}
          </PrimaryButton>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.16)' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.16)' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <GlassButton onClick={onGoogle} full={false} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 12px', fontSize: 13.5 }}>
              <GoogleGlyph /> Continue with Google
            </GlassButton>
            <GlassButton onClick={onApple} full={false} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 12px', fontSize: 13.5 }}>
              <AppleGlyph /> Continue with Apple
            </GlassButton>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 20, textAlign: 'center', lineHeight: 1.5, maxWidth: 320 }}>
          By signing up, you agree to AlignSpace&apos;s{' '}
          <span style={{ color: 'var(--champagne)', fontWeight: 600, cursor: 'pointer' }}>Terms of Service</span>{' '}
          and{' '}
          <span style={{ color: 'var(--champagne)', fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</span>.
        </div>

        {onLogin && (
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 18 }}>
            {'Already have an account? '}
            <span onClick={onLogin} style={{ color: 'var(--champagne)', fontWeight: 600, cursor: 'pointer' }}>Log in</span>
          </div>
        )}
      </div>
    </DarkScene>
  );
}
