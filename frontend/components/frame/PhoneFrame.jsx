'use client';

function StatusClock() {
  return (
    <span style={{
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 15,
      color: 'rgba(255,255,255,0.92)',
    }}>
      9:41
    </span>
  );
}

export default function PhoneFrame({ children }) {
  return (
    <div style={{
      width: 390,
      height: 844,
      borderRadius: 52,
      position: 'relative',
      padding: 11,
      boxSizing: 'border-box',
      background: 'linear-gradient(160deg, #2a2a2c, #0d0d0e)',
      boxShadow: '0 50px 100px rgba(40,30,20,0.45), 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 2px rgba(255,255,255,0.2)',
    }}>
      <div style={{
        position: 'absolute',
        inset: 11,
        borderRadius: 42,
        overflow: 'hidden',
        background: '#1a1612',
      }}>
        {/* Status bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 30px',
          pointerEvents: 'none',
        }}>
          <StatusClock />
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <svg width="18" height="11" viewBox="0 0 18 11">
              <rect x="0" y="7" width="3" height="4" rx="0.6" fill="rgba(255,255,255,0.92)" />
              <rect x="4.5" y="4.5" width="3" height="6.5" rx="0.6" fill="rgba(255,255,255,0.92)" />
              <rect x="9" y="2" width="3" height="9" rx="0.6" fill="rgba(255,255,255,0.92)" />
              <rect x="13.5" y="0" width="3" height="11" rx="0.6" fill="rgba(255,255,255,0.92)" />
            </svg>
            <svg width="22" height="11" viewBox="0 0 24 12">
              <rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke="rgba(255,255,255,0.5)" fill="none" />
              <rect x="2" y="2" width="16" height="8" rx="1.6" fill="rgba(255,255,255,0.92)" />
              <rect x="22" y="4" width="1.5" height="4" rx="0.7" fill="rgba(255,255,255,0.5)" />
            </svg>
          </div>
        </div>

        {/* Dynamic island */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 110,
          height: 32,
          borderRadius: 20,
          background: '#000',
          zIndex: 50,
        }} />

        {/* Screen content */}
        <div style={{ position: 'absolute', inset: 0 }}>{children}</div>

        {/* Home indicator */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 134,
          height: 5,
          borderRadius: 100,
          background: 'rgba(255,255,255,0.6)',
          zIndex: 60,
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}
