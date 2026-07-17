'use client';

import LightScene from '@/components/frame/LightScene';
import AppBar from '@/components/frame/AppBar';
import PhotoTile from '@/components/PhotoTile';
import Icon from '@/components/Icon';

const SAVED_ITEMS = [
  { id: 1, tone: 'linen', tag: 'Seating', name: 'Linen Sectional Sofa' },
  { id: 2, tone: 'oak', tag: 'Tables', name: 'White Oak Coffee Table' },
  { id: 3, tone: 'travertine', tag: 'Surfaces', name: 'Travertine Side Table' },
  { id: 4, tone: 'sand', tag: 'Textiles', name: 'Jute Area Rug 8×10' },
  { id: 5, tone: 'charcoal', tag: 'Lighting', name: 'Brass Pendant' },
  { id: 6, tone: 'clay', tag: 'Decor', name: 'Terracotta Vase Set' },
  { id: 7, tone: 'warmwhite', tag: 'Finishes', name: 'Warm White Paint' },
  { id: 8, tone: 'stone', tag: 'Textiles', name: 'Stone Throw Pillows' },
  { id: 9, tone: 'greenery', tag: 'Decor', name: 'Potted Olive Tree' },
  { id: 10, tone: 'linen', tag: 'Lighting', name: 'Linen Floor Lamp' },
  { id: 11, tone: 'travertine', tag: 'Surfaces', name: 'Marble Tray' },
  { id: 12, tone: 'sand', tag: 'Decor', name: 'Rattan Mirror' },
];

export default function SavedScreen({ onBack }) {
  return (
    <LightScene>
      <AppBar onBack={onBack} title="Saved inspirations" />
      <div style={{ position: 'absolute', top: 88, bottom: 0, left: 0, right: 0, overflowY: 'auto', padding: '14px 16px 48px' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(247,242,234,0.45)', marginBottom: 16 }}>{SAVED_ITEMS.length} saved items</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {SAVED_ITEMS.map(item => (
            <button key={item.id} style={{ borderRadius: 18, overflow: 'hidden', cursor: 'pointer', padding: 0, position: 'relative', border: '1px solid rgba(255,255,255,0.08)', background: 'none', display: 'block' }}>
              <PhotoTile tone={item.tone} style={{ width: '100%', aspectRatio: '1/1', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,7,4,0.75) 0%, transparent 50%)' }} />
              <div style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: '50%', background: 'rgba(10,7,4,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="bookmark" size={14} stroke={1.8} color="var(--champagne)" />
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 10px 10px' }}>
                <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, background: 'rgba(198,163,107,0.22)', border: '1px solid rgba(198,163,107,0.35)', fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600, color: 'var(--champagne)', marginBottom: 4 }}>{item.tag}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600, color: 'rgba(247,242,234,0.92)', lineHeight: 1.3 }}>{item.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </LightScene>
  );
}
