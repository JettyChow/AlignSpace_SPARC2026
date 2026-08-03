'use client';

const STATUS_STYLES = {
  confirmed: { bg: 'rgba(122,185,107,0.16)', fg: '#5a9a4c', dot: 'var(--success)', label: 'Confirmed' },
  review:    { bg: 'rgba(212,164,90,0.18)',  fg: '#a87a32', dot: 'var(--warning)', label: 'Needs review' },
  later:     { bg: 'rgba(95,85,76,0.10)',    fg: 'var(--fg-3)', dot: '#a89e92', label: 'TBD later' },
  fit:       { bg: 'rgba(122,185,107,0.16)', fg: '#5a9a4c', dot: 'var(--success)', label: 'On budget' },
};

export default function StatusPill({ kind, label }) {
  const s = STATUS_STYLES[kind] || STATUS_STYLES.later;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 26,
      padding: '0 11px 0 9px',
      borderRadius: 999,
      background: s.bg,
      color: s.fg,
      whiteSpace: 'nowrap',
      fontFamily: 'var(--font-sans)',
      fontSize: 12.5,
      fontWeight: 600,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: s.dot }} />
      {label || s.label}
    </span>
  );
}
