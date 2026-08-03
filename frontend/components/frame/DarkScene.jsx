'use client';

export default function DarkScene({ children, overlay }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/assets/scene-interior.png)',
        backgroundSize: 'cover',
        backgroundPosition: '64% 48%',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: overlay || 'linear-gradient(180deg, rgba(18,14,10,0.66) 0%, rgba(18,14,10,0.30) 34%, rgba(18,14,10,0.30) 60%, rgba(14,11,8,0.70) 100%)',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        mixBlendMode: 'multiply',
        background: 'linear-gradient(150deg, rgba(74,60,46,0.28), rgba(30,24,18,0.16))',
      }} />
      <div style={{ position: 'relative', height: '100%' }}>{children}</div>
    </div>
  );
}
