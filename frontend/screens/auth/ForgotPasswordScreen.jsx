'use client';

import { useState } from 'react';
import DarkScene from '@/components/frame/DarkScene';
import Logo from '@/components/Logo';
import { PrimaryButton } from '@/components/Buttons';
import Field from '@/components/Field';
import Icon from '@/components/Icon';

export default function ForgotPasswordScreen({
  onBack, onLogin, onSendCode, onReset,
  loading, error, codeSent, resetting, resetError,
}) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

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

        <div className="lg lg-drift" style={{
          width: '100%', marginTop: 22, padding: '28px 24px 26px', boxSizing: 'border-box',
          borderRadius: 32, border: '1px solid rgba(255,255,255,0.16)',
          '--lg-tint': 'linear-gradient(155deg, rgba(34,27,20,0.34), rgba(14,11,8,0.46))',
          '--lg-blur': '10px', '--lg-sheen': 0.28, '--lg-bright': 1.0,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 1px 1px 1px rgba(255,255,255,0.12), 0 22px 58px rgba(0,0,0,0.36)',
        }}>
          {!codeSent ? (
            <>
              <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 27, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.15, letterSpacing: '-0.015em' }}>Forgot password?</h1>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.5, color: 'rgba(255,255,255,0.66)', margin: '8px 0 26px' }}>Enter your email and we&apos;ll send you a code to reset your password.</p>
              <Field label="Email address" icon="mail" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              {error && (
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#e08787', marginTop: -12, marginBottom: 18 }}>{error}</div>
              )}
              <PrimaryButton onClick={() => onSendCode?.(email)} style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Sending…' : 'Send reset code'}
              </PrimaryButton>
            </>
          ) : (
            <>
              <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 27, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.15, letterSpacing: '-0.015em' }}>Reset your password</h1>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.5, color: 'rgba(255,255,255,0.66)', margin: '8px 0 26px' }}>Enter the code we sent to {email || 'your email'}, then choose a new password.</p>
              <Field label="Reset code" icon="lock" placeholder="Enter the 6-digit code" value={code} onChange={(e) => setCode(e.target.value)} />
              <Field label="New password" icon="lock" type={showPw ? 'text' : 'password'} placeholder="Create a new password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
                trailing={<button onClick={() => setShowPw(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><Icon name="eye" size={20} color="rgba(255,255,255,0.55)" stroke={1.6} /></button>} />
              <Field label="Confirm new password" icon="lock" type={showConfirmPw ? 'text' : 'password'} placeholder="Confirm your new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                trailing={<button onClick={() => setShowConfirmPw(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><Icon name="eye" size={20} color="rgba(255,255,255,0.55)" stroke={1.6} /></button>} />
              {resetError && (
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#e08787', marginTop: -12, marginBottom: 18 }}>{resetError}</div>
              )}
              <PrimaryButton onClick={() => onReset?.({ code, newPw, confirmPw })} style={{ opacity: resetting ? 0.7 : 1 }}>
                {resetting ? 'Resetting…' : 'Reset password'}
              </PrimaryButton>
            </>
          )}
        </div>

        {onLogin && (
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 18 }}>
            {'Remembered your password? '}
            <span onClick={onLogin} style={{ color: 'var(--champagne)', fontWeight: 600, cursor: 'pointer' }}>Log in</span>
          </div>
        )}
      </div>
    </DarkScene>
  );
}
