'use client';

import { useState } from 'react';
import AppBar from '@/components/frame/AppBar';
import { PrimaryButton } from '@/components/Buttons';
import PhotoTile from '@/components/PhotoTile';
import Icon from '@/components/Icon';

// Decorative-only: as-ai-server's DesignDirection has no image/tone field,
// so this just picks a PhotoTile background per direction key. Purely
// cosmetic — safe to extend when new direction keys show up in
// pipeline/presets.py DIRECTIONS.
const TONE_BY_KEY = {
  warm_modern: 'oak',
  japandi: 'linen',
  contemporary_minimal: 'charcoal',
  organic_spa: 'stone',
  scandinavian: 'warmwhite',
  transitional: 'travertine',
};
const FALLBACK_TONES = ['linen', 'sand', 'charcoal', 'oak', 'clay', 'travertine'];

function DirectionCard({ dir, tone, isSelected, onClick }) {
  const pct = Math.round((dir.match_score || 0) * 100);
  return (
    <button onClick={onClick} style={{
      width: '100%', borderRadius: 20, overflow: 'hidden', cursor: 'pointer', padding: 0, position: 'relative',
      border: isSelected ? '1.5px solid rgba(198,163,107,0.75)' : '1px solid rgba(255,255,255,0.10)',
      boxShadow: isSelected ? '0 0 0 1px rgba(198,163,107,0.3), 0 8px 24px rgba(0,0,0,0.28)' : '0 4px 16px rgba(0,0,0,0.18)',
      transition: 'all 200ms ease',
    }}>
      <PhotoTile tone={tone} style={{ width: '100%', aspectRatio: '1/1.05', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,7,4,0.72) 0%, transparent 55%)' }} />
      {isSelected && (
        <div style={{ position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: '50%', background: 'var(--champagne)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={14} stroke={2.5} color="#2a1f0f" />
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{dir.name}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: 'rgba(255,255,255,0.65)' }}>{pct}% match</div>
      </div>
    </button>
  );
}

export default function DiscoveryScreen({ directions = [], selected, setSelected, onBack, onSelect }) {
  const [localSelected, setLocalSelected] = useState(selected || null);

  function toggle(key) {
    const next = localSelected === key ? null : key;
    setLocalSelected(next);
    setSelected?.(next);
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(52,36,20,0.95) 0%, rgba(14,10,7,0.98) 100%)' }}>
      <AppBar onBack={onBack} eyebrow="Step 1 of 4" title="Choose your direction" />
      <div style={{ position: 'absolute', top: 88, bottom: 100, left: 0, right: 0, overflowY: 'auto', padding: '16px 20px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(247,242,234,0.55)', marginBottom: 20, lineHeight: 1.5 }}>Based on your intake, we matched these design directions. Pick one to explore.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {directions.map((dir, i) => (
            <DirectionCard
              key={dir.key}
              dir={dir}
              tone={TONE_BY_KEY[dir.key] || FALLBACK_TONES[i % FALLBACK_TONES.length]}
              isSelected={localSelected === dir.key}
              onClick={() => toggle(dir.key)}
            />
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 24, left: 20, right: 20 }}>
        <PrimaryButton onClick={() => localSelected && onSelect(localSelected)} style={{ opacity: localSelected ? 1 : 0.45 }}>Explore this direction</PrimaryButton>
      </div>
    </div>
  );
}
