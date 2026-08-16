'use client';

import { useState } from 'react';

export function PrimaryButton({ children, onClick, full = true, style = {} }) {
  const [press, setPress] = useState(false);
  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPress(true)}
      onPointerUp={() => setPress(false)}
      onPointerLeave={() => setPress(false)}
      style={{
        height: 54,
        width: full ? '100%' : 'auto',
        padding: full ? 0 : '0 32px',
        border: 'none',
        borderRadius: 'var(--r-button)',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 16,
        fontWeight: 600,
        color: 'var(--near-black)',
        background: 'linear-gradient(135deg, #F4E9CF 0%, #E4CC9E 55%, #CDAE78 100%)',
        boxShadow: press
          ? '0 2px 10px rgba(168,133,79,0.25)'
          : '0 8px 26px rgba(198,163,107,0.42), inset 0 1px 1px rgba(255,255,255,0.6)',
        transform: press ? 'scale(0.975)' : 'scale(1)',
        filter: press ? 'brightness(0.97)' : 'none',
        transition: 'transform var(--dur-base) var(--ease-soft), box-shadow var(--dur-base) var(--ease-soft), filter var(--dur-base)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function GlassButton({ children, onClick, dark = true, full = true, style = {} }) {
  const [press, setPress] = useState(false);
  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPress(true)}
      onPointerUp={() => setPress(false)}
      onPointerLeave={() => setPress(false)}
      style={{
        height: 54,
        width: full ? '100%' : 'auto',
        padding: full ? 0 : '0 28px',
        borderRadius: 'var(--r-button)',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 16,
        fontWeight: 500,
        color: dark ? 'rgba(255,255,255,0.92)' : 'var(--fg-1)',
        background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(95,85,76,0.06)',
        border: dark ? '1px solid rgba(255,255,255,0.22)' : '1px solid var(--line-strong)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transform: press ? 'scale(0.975)' : 'scale(1)',
        transition: 'transform var(--dur-base) var(--ease-soft)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
