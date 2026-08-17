'use client';

import { useState, useRef } from 'react';
import { PrimaryButton } from '@/components/Buttons';
import RoundIconButton from '@/components/frame/RoundIconButton';
import PhotoTile from '@/components/PhotoTile';
import Icon from '@/components/Icon';

// Placeholder ITEMS tagged in the scene photo — item_name/item_id mirror the
// DBML schema; id/icon/tone/x/y/dx/dy/colors are UI-only positioning and
// swatch chrome for the pinned-tag layout, not DB columns. `count` is
// display copy for "N similar items", not a schema field either.
const SCENE_TAGS = [
  { id: 'sofa',  item_id: 201, item_name: 'Linen sofa',     count: '24 similar', icon: 'sofa',    tone: 'linen',      x: 64, y: 52, dx: -58, dy: -20, colors: ['#D8C5A9', '#C4B394', '#9a8f7e', '#5F554C'] },
  { id: 'floor', item_id: 202, item_name: 'White oak floor', count: '12 similar', icon: 'layers',  tone: 'oak',        x: 25, y: 63, dx: 6,   dy: -42, colors: ['#d8b888', '#b88e5c', '#9a6f42'] },
  { id: 'wall',  item_id: 203, item_name: 'Travertine wall', count: '8 similar',  icon: 'hexagon', tone: 'travertine', x: 19, y: 30, dx: 14,  dy: -2,  colors: ['#ece0cc', '#d4c0a0', '#b69f78'] },
  { id: 'drape', item_id: 204, item_name: 'Sheer drapery',   count: '10 similar', icon: 'tile',    tone: 'warmwhite',  x: 89, y: 25, dx: -54, dy: 4,   colors: ['#f7f1e7', '#e8ddca', '#d2c3a6'] },
];

const CARD_STEP = 298;

function ColorDots({ colors }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {colors.map((c, i) => (
        <span key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: c, display: 'inline-block', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35), 0 1px 2px rgba(0,0,0,0.3)' }} />
      ))}
    </div>
  );
}

function SceneTag({ t, active, onClick }) {
  const dist = Math.hypot(t.dx, t.dy);
  const angle = Math.atan2(t.dy, t.dx) * 180 / Math.PI;
  return (
    <div style={{ position: 'absolute', left: `${t.x}%`, top: `${t.y}%`, zIndex: active ? 7 : 6 }}>
      {/* connector line */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: dist, height: 1.5, transformOrigin: '0 50%', transform: `rotate(${angle}deg)`, background: 'linear-gradient(90deg, var(--champagne), rgba(244,233,207,0.15))', opacity: 0.85 }} />
      {/* dot */}
      <div style={{ position: 'absolute', left: -5, top: -5, width: 10, height: 10, borderRadius: '50%', background: 'var(--champagne)', boxShadow: '0 0 0 4px rgba(244,233,207,0.22), 0 0 12px rgba(198,163,107,0.85)' }} />
      {/* pill button */}
      <button onClick={onClick} style={{
        position: 'absolute', left: t.dx, top: t.dy,
        transform: `translate(${t.dx < 0 ? '-100%' : '0'}, -50%)`,
        display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', cursor: 'pointer',
        height: 38, padding: '0 14px 0 7px', borderRadius: 999,
        background: active ? 'rgba(247,243,236,0.94)' : 'rgba(20,16,12,0.44)',
        border: active ? '1px solid #fff' : '1px solid rgba(255,255,255,0.30)',
        backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        boxShadow: active ? '0 10px 26px rgba(0,0,0,0.32)' : '0 6px 18px rgba(0,0,0,0.26)',
        transition: 'background var(--dur-base) var(--ease-soft), box-shadow var(--dur-base) var(--ease-soft)',
      }}>
        <span style={{ width: 24, height: 24, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'var(--champagne-grad)' : 'rgba(255,255,255,0.14)' }}>
          <Icon name={t.icon} size={14} color={active ? '#fff' : 'rgba(255,255,255,0.92)'} stroke={1.8} />
        </span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, color: active ? 'var(--fg-1)' : '#fff' }}>{t.item_name}</span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: active ? 'var(--fg-3)' : 'rgba(255,255,255,0.6)' }}>{t.count}</span>
      </button>
    </div>
  );
}

export default function FocusScreen({ deliverable, onBack, onContinue, onMenu }) {
  const direction = deliverable?.chosen_direction;
  const matchPercent = direction ? Math.round((direction.match_score || 0) * 100) : null;
  const [saved, setSaved] = useState(false);
  const [active, setActive] = useState(0);
  const scrollRef = useRef(null);

  function focusCard(i) {
    setActive(i);
    if (scrollRef.current) scrollRef.current.scrollTo({ left: i * CARD_STEP, behavior: 'smooth' });
  }

  function onScroll() {
    if (!scrollRef.current) return;
    const i = Math.round(scrollRef.current.scrollLeft / CARD_STEP);
    if (i !== active) setActive(Math.max(0, Math.min(SCENE_TAGS.length - 1, i)));
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* full-bleed scene image — the chosen direction's real photo when available */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${direction?.imageUrl || '/assets/scene-interior.png'})`, backgroundSize: 'cover', backgroundPosition: '58% 46%' }} />
      {/* gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(14,11,8,0.5) 0%, rgba(14,11,8,0.12) 22%, rgba(14,11,8,0.05) 42%, rgba(12,9,6,0.30) 60%, rgba(10,8,5,0.78) 82%, rgba(8,6,4,0.92) 100%)' }} />

      {/* top chrome — custom, no AppBar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '54px 20px 0' }}>
        <RoundIconButton icon="arrowLeft" dark onClick={onBack} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 34, padding: '0 14px', borderRadius: 999, whiteSpace: 'nowrap', flex: 'none', background: 'rgba(20,16,12,0.42)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.26)' }}>
          <Icon name="sparkle" size={14} color="var(--champagne)" stroke={1.6} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: '#fff' }}>{direction?.name || 'Your direction'}</span>
          {matchPercent != null && (
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--champagne)' }}>{matchPercent}%</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <RoundIconButton icon={saved ? 'check' : 'bookmark'} dark onClick={() => setSaved(s => !s)} />
          <RoundIconButton icon="dots" dark onClick={onMenu} />
        </div>
      </div>

      {/* helper hint text */}
      <div style={{ position: 'absolute', top: 104, left: 0, right: 0, zIndex: 8, textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.72)', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>Tap a tag to explore each element</span>
      </div>

      {/* pinned scene tags with SVG connector lines */}
      {SCENE_TAGS.map((t, i) => (
        <SceneTag key={t.id} t={t} active={active === i} onClick={() => focusCard(i)} />
      ))}

      {/* bottom sheet */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 10, paddingTop: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 10px' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>Tagged in this scene</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{active + 1} / {SCENE_TAGS.length}</span>
        </div>

        {/* horizontally scrollable cards */}
        <div ref={scrollRef} onScroll={onScroll} style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px 18px', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          {SCENE_TAGS.map((t, i) => (
            <button key={t.id} onClick={() => focusCard(i)} style={{
              scrollSnapAlign: 'center', flex: 'none', width: 286, textAlign: 'left', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14, padding: 12, borderRadius: 22,
              background: active === i ? 'rgba(40,33,25,0.66)' : 'rgba(24,20,15,0.5)',
              border: active === i ? '1px solid rgba(220,192,147,0.55)' : '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(26px) saturate(160%)', WebkitBackdropFilter: 'blur(26px) saturate(160%)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
              transition: 'border-color var(--dur-base), background var(--dur-base)',
            }}>
              <PhotoTile tone={t.tone} height={64} radius={16} style={{ width: 64, flex: 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>{t.item_name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600, color: 'var(--champagne)', margin: '2px 0 8px' }}>{t.count} models</div>
                <ColorDots colors={t.colors} />
              </div>
              <Icon name="chevronRight" size={18} color="rgba(255,255,255,0.5)" stroke={2} />
            </button>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: '0 20px 26px' }}>
          <PrimaryButton onClick={onContinue}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              <Icon name="layers" size={18} stroke={1.7} /> Review the material list
            </span>
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
