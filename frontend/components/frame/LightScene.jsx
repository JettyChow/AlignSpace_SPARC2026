'use client';

export default function LightScene({ children, variant = 'gradient' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {variant === 'photo' ? (
        <>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/assets/scene-interior.png)',
            backgroundSize: 'cover',
            backgroundPosition: '58% 46%',
            filter: 'blur(2px)',
            transform: 'scale(1.06)',
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(16,12,8,0.74) 0%, rgba(22,16,11,0.58) 38%, rgba(15,11,7,0.72) 70%, rgba(10,7,5,0.92) 100%)',
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            mixBlendMode: 'multiply',
            background: 'linear-gradient(150deg, rgba(64,50,36,0.32), rgba(24,18,13,0.2))',
          }} />
        </>
      ) : (
        <div style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(120% 72% at 50% -12%, rgba(86,66,46,0.55), transparent 60%),' +
            'radial-gradient(95% 55% at 102% 4%, rgba(62,49,35,0.5), transparent 55%),' +
            'linear-gradient(165deg, #271d14 0%, #1b140e 55%, #110c08 100%)',
        }} />
      )}
      <div style={{ position: 'relative', height: '100%' }}>{children}</div>
    </div>
  );
}
