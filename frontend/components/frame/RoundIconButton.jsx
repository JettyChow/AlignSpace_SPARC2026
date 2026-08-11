'use client';

import Icon from '../Icon';

export default function RoundIconButton({ icon, onClick, dark = false, size = 40, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        cursor: 'pointer',
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: dark ? 'rgba(20,16,12,0.34)' : 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.22)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
        ...style,
      }}
    >
      <Icon name={icon} size={20} color="rgba(245,240,232,0.95)" stroke={1.8} />
    </button>
  );
}
