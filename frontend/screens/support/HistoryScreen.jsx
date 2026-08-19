'use client';

import LightScene from '@/components/frame/LightScene';
import AppBar from '@/components/frame/AppBar';
import PhotoTile from '@/components/PhotoTile';
import Icon from '@/components/Icon';

// Decorative only — the backend doesn't return a photo/tone per project, so
// cycle through the same palette DiscoveryScreen uses for direction cards.
const FALLBACK_TONES = ['linen', 'sand', 'charcoal', 'oak', 'clay', 'travertine'];

export default function HistoryScreen({ onBack, onOpen, projects = [], loading, error }) {
  return (
    <LightScene>
      <AppBar onBack={onBack} title="Project history" />
      <div style={{ position: 'absolute', top: 88, bottom: 0, left: 0, right: 0, overflowY: 'auto', padding: '16px 18px 48px' }}>
        {loading && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(247,242,234,0.55)', textAlign: 'center', marginTop: 60 }}>Loading your projects…</div>
        )}

        {!loading && error && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(247,242,234,0.55)', textAlign: 'center', marginTop: 60, lineHeight: 1.6 }}>{error}</div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(247,242,234,0.55)', textAlign: 'center', marginTop: 60, lineHeight: 1.6 }}>
            No projects yet.<br />Start one from your home screen to see it here.
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(247,242,234,0.45)', marginBottom: 16 }}>{projects.length} project{projects.length === 1 ? '' : 's'}</div>
        )}
        {projects.map((p, i) => {
          const done = p.proj_completionPercent >= 100;
          const doneColor = done ? '#7AB96B' : '#D4A45A';
          const doneLabel = done ? 'Complete' : 'In progress';
          const tone = p.tone || FALLBACK_TONES[i % FALLBACK_TONES.length];
          return (
            <button key={p.proj_id ?? i} onClick={() => onOpen?.(p)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 0, borderRadius: 20, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', marginBottom: 10, textAlign: 'left',
            }}>
              <PhotoTile tone={tone} imageUrl={p.proj_imageUrl} style={{ width: 76, height: 82, borderRadius: 0, flexShrink: 0 }} />
              <div style={{ flex: 1, padding: '12px 14px', minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 600, color: 'rgba(247,242,234,0.95)', marginBottom: 2 }}>{p.proj_title}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(247,242,234,0.42)', marginBottom: 8 }}>{p.proj_updatedAt} · {p.proj_status}</div>
                <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ height: '100%', width: `${p.proj_completionPercent || 0}%`, background: done ? 'rgba(122,185,107,0.7)' : 'var(--champagne)', borderRadius: 2 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: doneColor }} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: doneColor }}>{doneLabel}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, color: 'rgba(247,242,234,0.78)' }}>{p.proj_budgetMaxOverride}</span>
                </div>
              </div>
              <div style={{ paddingRight: 14, flexShrink: 0 }}>
                <Icon name="chevron-right" size={16} stroke={1.8} color="rgba(255,255,255,0.25)" />
              </div>
            </button>
          );
        })}
      </div>
    </LightScene>
  );
}
