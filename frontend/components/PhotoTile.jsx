'use client';

import Icon from './Icon';

const PHOTO_TONES = {
  oak:        { grad: 'linear-gradient(150deg, #d8b888 0%, #b88e5c 60%, #9a6f42 100%)', icon: 'layers' },
  travertine: { grad: 'linear-gradient(150deg, #ece0cc 0%, #d4c0a0 55%, #b69f78 100%)', icon: 'hexagon' },
  linen:      { grad: 'linear-gradient(150deg, #f0e8da 0%, #ddccb4 60%, #c4b394 100%)', icon: 'sofa' },
  clay:       { grad: 'linear-gradient(150deg, #d8a883 0%, #bd8460 55%, #9c6448 100%)', icon: 'palette' },
  sand:       { grad: 'linear-gradient(150deg, #e6d4b6 0%, #d4bc92 55%, #b89c6e 100%)', icon: 'bath' },
  stone:      { grad: 'linear-gradient(150deg, #cfc7bb 0%, #b0a698 55%, #8d8275 100%)', icon: 'tile' },
  warmwhite:  { grad: 'linear-gradient(150deg, #f7f1e7 0%, #e8ddca 60%, #d2c3a6 100%)', icon: 'light' },
  charcoal:   { grad: 'linear-gradient(150deg, #6b6157 0%, #4c443b 60%, #332d27 100%)', icon: 'hexagon' },
  greenery:   { grad: 'linear-gradient(150deg, #b9c2a3 0%, #94a07c 55%, #6f7d58 100%)', icon: 'palette' },
};

export default function PhotoTile({
  tone = 'oak',
  photo = false,
  photoPos = '50% 50%',
  label,
  icon,
  height,
  radius = 22,
  children,
  style = {},
}) {
  const t = PHOTO_TONES[tone] || PHOTO_TONES.oak;
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height,
      borderRadius: radius,
      overflow: 'hidden',
      background: t.grad,
      ...style,
    }}>
      {photo && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/assets/scene-interior.png)',
          backgroundSize: 'cover',
          backgroundPosition: photoPos,
        }} />
      )}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(120% 90% at 30% 10%, rgba(255,255,255,0.22), transparent 55%), linear-gradient(180deg, transparent 40%, rgba(40,30,20,0.30) 100%)',
      }} />
      {(icon || t.icon) && !children && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon || t.icon} size={30} color="rgba(255,255,255,0.5)" stroke={1.3} />
        </div>
      )}
      {label && (
        <div style={{
          position: 'absolute',
          left: 14,
          bottom: 12,
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: 'rgba(255,255,255,0.92)',
          textShadow: '0 1px 6px rgba(0,0,0,0.4)',
        }}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
