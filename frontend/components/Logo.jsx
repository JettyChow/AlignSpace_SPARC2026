'use client';

export function Mark({ size = 56 }) {
  return (
    <img
      src="/assets/alignspace-mark.png"
      alt="AlignSpace"
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
    />
  );
}

export function Wordmark({ size = 20, color = '#fff' }) {
  return (
    <div style={{
      fontFamily: 'var(--font-sans)',
      fontWeight: 500,
      fontSize: size,
      letterSpacing: '0.32em',
      textTransform: 'uppercase',
      color,
    }}>
      Alignspace
    </div>
  );
}

export default function Logo({ markSize = 56, wordSize = 20, color = '#fff', gap = 14 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap }}>
      <Mark size={markSize} />
      <Wordmark size={wordSize} color={color} />
    </div>
  );
}
