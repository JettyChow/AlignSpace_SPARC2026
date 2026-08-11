'use client';

export default function GlassPanel({ children, style = {} }) {
  return (
    <div
      className="lg"
      style={{
        borderRadius: 28,
        padding: 22,
        border: '1px solid rgba(255,255,255,0.85)',
        '--lg-tint': 'linear-gradient(155deg, rgba(255,255,255,0.62), rgba(255,255,255,0.34))',
        '--lg-sheen': 0.7,
        '--lg-bright': 1.04,
        boxShadow: 'inset 1px 1px 1px rgba(255,255,255,0.9), 0 8px 30px rgba(95,85,76,0.12)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
