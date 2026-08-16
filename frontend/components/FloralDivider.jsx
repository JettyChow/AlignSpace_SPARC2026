'use client';

import Icon from './Icon';

export default function FloralDivider({ color = 'rgba(255,255,255,0.4)', width = 220 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, width, opacity: 0.9 }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${color})` }} />
      <Icon name="sparkle" size={15} color={color} stroke={1.4} />
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  );
}
