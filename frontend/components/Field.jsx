'use client';

import { useState } from 'react';
import Icon from './Icon';

export default function Field({ label, icon, placeholder, type = 'text', value, onChange, trailing }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={{
        display: 'block',
        fontFamily: 'var(--font-sans)',
        fontSize: 14,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 10,
        letterSpacing: '0.01em',
      }}>
        {label}
      </label>
      <div style={{
        height: 56,
        borderRadius: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
        background: 'rgba(255,255,255,0.08)',
        border: `1px solid ${focus ? 'rgba(220,192,147,0.8)' : 'rgba(255,255,255,0.26)'}`,
        boxShadow: focus
          ? '0 0 0 4px rgba(198,163,107,0.16), inset 1px 1px 1px rgba(255,255,255,0.3)'
          : 'inset 1px 1px 1px rgba(255,255,255,0.3)',
        backdropFilter: 'blur(28px) saturate(180%) brightness(1.05)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%) brightness(1.05)',
        transition: 'all var(--dur-base) var(--ease-soft)',
      }}>
        <Icon name={icon} size={20} color="rgba(255,255,255,0.55)" stroke={1.6} />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'var(--font-sans)',
            fontSize: 16,
            color: '#fff',
          }}
        />
        {trailing}
      </div>
    </div>
  );
}
