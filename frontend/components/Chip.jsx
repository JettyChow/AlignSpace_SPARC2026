'use client';

import Icon from './Icon';

export default function Chip({ label, icon, selected, onClick, dark = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 44,
        padding: icon ? '0 18px 0 14px' : '0 20px',
        borderRadius: 999,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'var(--font-sans)',
        fontSize: 15,
        fontWeight: 500,
        transition: 'all var(--dur-base) var(--ease-soft)',
        ...(selected ? {
          background: 'linear-gradient(135deg, #F4E9CF 0%, #DBC093 100%)',
          color: 'var(--near-black)',
          border: '1px solid transparent',
          boxShadow: '0 6px 18px rgba(198,163,107,0.4)',
        } : dark ? {
          background: 'rgba(255,255,255,0.07)',
          color: 'rgba(255,255,255,0.86)',
          border: '1px solid rgba(255,255,255,0.22)',
          backdropFilter: 'blur(22px) saturate(180%) brightness(1.05)',
          WebkitBackdropFilter: 'blur(22px) saturate(180%) brightness(1.05)',
          boxShadow: 'inset 1px 1px 1px rgba(255,255,255,0.28)',
        } : {
          background: '#fff',
          color: 'var(--fg-2)',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow-card)',
        }),
      }}
    >
      {icon && <Icon name={icon} size={18} stroke={1.7} />}
      {label}
    </button>
  );
}
