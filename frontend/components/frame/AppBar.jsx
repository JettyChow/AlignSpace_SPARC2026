'use client';

import Icon from '../Icon';
import { Mark } from '../Logo';

export default function AppBar({ onBack, title, eyebrow, step, total, trailing, onMenu }) {
  const circle = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    cursor: 'pointer',
    flex: 'none',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.22)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 30,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '54px 20px 14px',
      background: 'linear-gradient(180deg, rgba(14,10,7,0.94) 55%, rgba(14,10,7,0))',
    }}>
      {onBack ? (
        <button onClick={onBack} style={circle}>
          <Icon name="arrowLeft" size={20} color="rgba(245,240,232,0.95)" stroke={1.8} />
        </button>
      ) : (
        <Mark size={32} />
      )}

      {(title || eyebrow) && (
        <div style={{ minWidth: 0, flex: 1 }}>
          {eyebrow && (
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(222,187,128,0.9)',
            }}>
              {eyebrow}
            </div>
          )}
          {title && (
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 17,
              fontWeight: 600,
              color: 'rgba(247,242,234,0.97)',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {title}
            </div>
          )}
        </div>
      )}

      {step !== undefined && (
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              width: i === step ? 22 : 7,
              height: 7,
              borderRadius: 999,
              background: i <= step ? 'var(--champagne)' : 'rgba(255,255,255,0.2)',
              transition: 'all var(--dur-base) var(--ease-soft)',
            }} />
          ))}
        </div>
      )}

      {trailing && (
        <div style={{ marginLeft: title || eyebrow ? 0 : 'auto' }}>{trailing}</div>
      )}
      {onMenu && (
        <button onClick={onMenu} style={{ ...circle, marginLeft: 'auto' }}>
          <Icon name="dots" size={20} color="rgba(245,240,232,0.95)" stroke={1.8} />
        </button>
      )}
    </div>
  );
}
