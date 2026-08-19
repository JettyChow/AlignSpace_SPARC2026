'use client';

import { useState, useRef, useMemo, useLayoutEffect } from 'react';
import { PrimaryButton } from '@/components/Buttons';
import RoundIconButton from '@/components/frame/RoundIconButton';
import PhotoTile from '@/components/PhotoTile';
import Icon from '@/components/Icon';
import { CATEGORIES } from '@/data/warmMinimalKitchen';
import { categoryMeta } from '@/lib/materialCategories';

// The 4 categories this screen highlights, in priority order — pulled from
// the same warmMinimalKitchen.js CATEGORIES/line_items that PackageScreen's
// material list reads, so "Tagged in this scene" and "Review the material
// list" always show the same real products.
const FOCUS_CATEGORIES = ['cabinet', 'countertop', 'backsplash', 'faucet'];

// Hotspot pill labels stay category-oriented and fixed, independent of
// which pick (primary/alternate) is currently selected — Switching on a
// card can change the live product_name (e.g. "Travertine Countertop" ->
// "Warm Marble Countertop"), and a hotspot label that changed length or
// wording on every switch would feel unstable pinned over the photo. The
// card underneath always shows the exact live product_name instead.
const SHORT_LABEL = {
  cabinet: 'Cabinet Door',
  countertop: 'Countertop',
  backsplash: 'Backsplash',
  faucet: 'Faucet',
};

// Manually-placed hotspot centers (x/y, % of image) for each of the 6 real
// Warm Minimal inspiration photos (data/warmMinimalKitchen.js INSPIRATIONS).
// The photos differ enough in camera angle and layout that one universal
// position would mis-point the cabinet/countertop/backsplash/faucet dots on
// several of them, so each direction key gets its own set. One {x,y} per
// FOCUS_CATEGORIES entry, same order: [cabinet, countertop, backsplash,
// faucet]. Which way each pill opens, and keeping it on-screen, is NOT part
// of this map — SceneTag derives that at render time from x and the pill's
// real measured width, so it stays correct regardless of label length
// instead of needing 6 more hand-tuned offsets per direction.
const HOTSPOTS_BY_DIRECTION = {
  warm_minimal_01: [{ x: 14, y: 35 }, { x: 50, y: 63 }, { x: 37, y: 49 }, { x: 63, y: 56 }],
  warm_minimal_02: [{ x: 40, y: 35 }, { x: 22, y: 75 }, { x: 72, y: 38 }, { x: 60, y: 59 }],
  warm_minimal_03: [{ x: 40, y: 30 }, { x: 55, y: 80 }, { x: 45, y: 52 }, { x: 48, y: 60 }],
  warm_minimal_04: [{ x: 75, y: 28 }, { x: 42, y: 62 }, { x: 75, y: 50 }, { x: 37, y: 54 }],
  warm_minimal_05: [{ x: 12, y: 33 }, { x: 50, y: 76 }, { x: 50, y: 42 }, { x: 48, y: 58 }],
  warm_minimal_06: [{ x: 25, y: 28 }, { x: 55, y: 76 }, { x: 40, y: 52 }, { x: 22, y: 53 }],
};
const DEFAULT_DIRECTION_KEY = 'warm_minimal_01';

// Small vertical stagger per hotspot slot (cabinet/countertop/backsplash/
// faucet) so the 4 pills don't stack when their dots land close together.
const DY_BY_SLOT = [-26, 26, -6, 14];

// Builds the 4 scene tags for a given direction. Live product data (name,
// image) comes from `lineItems` — deliverable.package.line_items, the same
// store-backed source PackageScreen reads — so a Switch tap here is
// reflected immediately and survives the trip to /package. CATEGORIES is
// only a fallback for the rare case FocusScreen renders before a deliverable
// exists (e.g. direct nav) — never a second source of truth once lineItems
// is present.
function buildSceneTags(directionKey, lineItems) {
  const coords = HOTSPOTS_BY_DIRECTION[directionKey] || HOTSPOTS_BY_DIRECTION[DEFAULT_DIRECTION_KEY];
  return FOCUS_CATEGORIES.map((category, i) => {
    const li = lineItems?.find((l) => l.category === category);
    const fallback = CATEGORIES.find((c) => c.category === category)?.primary;
    const meta = categoryMeta(category);
    const { x, y } = coords[i];
    return {
      id: category,
      category,
      item_name: SHORT_LABEL[category] || meta.label,
      full_name: li?.product_name || fallback?.product_name,
      imageUrl: li?.imageUrl || fallback?.imageUrl,
      canSwitch: Boolean(li?.alternate),
      count: '2 options',
      icon: meta.icon,
      tone: meta.tone,
      x, y, dy: DY_BY_SLOT[i],
    };
  });
}

// Fallback scene width (px) for the very first layout pass, before
// FocusScreen measures its actual box — matches PhoneFrame's fixed content
// area (components/frame/PhoneFrame.jsx: 390px frame, 11px padding/side).
const DEFAULT_SCENE_WIDTH = 368;
// Keep every pill fully inside the screen, this far from either edge...
const PILL_SAFE_MARGIN = 16;
// ...and, room permitting, this far from the dot it's labeling.
const PILL_DOT_GAP = 14;

const CARD_STEP = 298;

function SceneTag({ t, active, onClick, containerWidth }) {
  const pillRef = useRef(null);
  const [pillWidth, setPillWidth] = useState(0);

  // Measure the pill's real rendered width (it varies with label length) so
  // the clamp below is exact instead of guessed — runs before paint, so a
  // width change (e.g. switching direction) never flashes an unclamped pill.
  useLayoutEffect(() => {
    if (pillRef.current) setPillWidth(pillRef.current.offsetWidth);
  });

  const dotX = (t.x / 100) * containerWidth;
  const openLeft = dotX > containerWidth / 2; // prefer opening toward screen center

  // Bounded label-position calculation: start from the preferred gap next
  // to the dot, opening toward the center, then clamp the pill's own box to
  // stay fully within [PILL_SAFE_MARGIN, containerWidth - PILL_SAFE_MARGIN]
  // regardless of label width or where the dot sits. This is what keeps
  // every pill on-screen across all 6 directions without per-tag offsets.
  const desiredLeft = openLeft ? dotX - PILL_DOT_GAP - pillWidth : dotX + PILL_DOT_GAP;
  const minLeft = PILL_SAFE_MARGIN;
  const maxLeft = Math.max(minLeft, containerWidth - PILL_SAFE_MARGIN - pillWidth);
  const pillLeft = Math.min(Math.max(desiredLeft, minLeft), maxLeft);
  const pillDx = pillLeft - dotX; // pill's left edge, relative to the dot

  // Connector line still points from the dot to the pill's nearest edge —
  // if clamping pulled the pill so it now straddles the dot horizontally,
  // fall back to a short vertical stub into the pill instead of a line that
  // overshoots past it.
  const nearEdgeDx = dotX < pillLeft ? pillDx
    : dotX > pillLeft + pillWidth ? pillDx + pillWidth
    : 0;
  const dist = Math.hypot(nearEdgeDx, t.dy);
  const angle = Math.atan2(t.dy, nearEdgeDx) * 180 / Math.PI;

  return (
    <div style={{ position: 'absolute', left: `${t.x}%`, top: `${t.y}%`, zIndex: active ? 7 : 6 }}>
      {/* connector line */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: dist, height: 1.5, transformOrigin: '0 50%', transform: `rotate(${angle}deg)`, background: 'linear-gradient(90deg, var(--champagne), rgba(244,233,207,0.15))', opacity: 0.85 }} />
      {/* dot */}
      <div style={{ position: 'absolute', left: -5, top: -5, width: 10, height: 10, borderRadius: '50%', background: 'var(--champagne)', boxShadow: '0 0 0 4px rgba(244,233,207,0.22), 0 0 12px rgba(198,163,107,0.85)' }} />
      {/* pill button */}
      <button ref={pillRef} onClick={onClick} style={{
        position: 'absolute', left: pillDx, top: t.dy,
        transform: 'translateY(-50%)',
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

export default function FocusScreen({ deliverable, onBack, onContinue, onMenu, onSwitchCategory }) {
  const direction = deliverable?.chosen_direction;
  const matchPercent = direction ? Math.round((direction.match_score || 0) * 100) : null;
  const [saved, setSaved] = useState(false);
  const [active, setActive] = useState(0);
  const scrollRef = useRef(null);
  const sceneRef = useRef(null);
  const [sceneWidth, setSceneWidth] = useState(DEFAULT_SCENE_WIDTH);
  const lineItems = deliverable?.package?.line_items;
  const SCENE_TAGS = useMemo(() => buildSceneTags(direction?.key, lineItems), [direction?.key, lineItems]);

  // Real width of the scene image box — used to clamp hotspot pills to the
  // visible screen. PhoneFrame is fixed-width today, but this stays correct
  // if that ever changes (e.g. a wider viewport) instead of assuming 390px.
  useLayoutEffect(() => {
    function measure() {
      if (sceneRef.current) setSceneWidth(sceneRef.current.clientWidth);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

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
    <div ref={sceneRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
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
        <SceneTag key={t.id} t={t} active={active === i} onClick={() => focusCard(i)} containerWidth={sceneWidth} />
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
            <div
              key={t.id}
              role="button"
              tabIndex={0}
              onClick={() => focusCard(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focusCard(i); } }}
              style={{
                scrollSnapAlign: 'center', flex: 'none', width: 286, textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 14, padding: 12, borderRadius: 22,
                background: active === i ? 'rgba(40,33,25,0.66)' : 'rgba(24,20,15,0.5)',
                border: active === i ? '1px solid rgba(220,192,147,0.55)' : '1px solid rgba(255,255,255,0.14)',
                backdropFilter: 'blur(26px) saturate(160%)', WebkitBackdropFilter: 'blur(26px) saturate(160%)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                transition: 'border-color var(--dur-base), background var(--dur-base)',
              }}>
              <PhotoTile tone={t.tone} imageUrl={t.imageUrl} height={64} radius={16} style={{ width: 64, flex: 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>{t.full_name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600, color: 'var(--champagne)', margin: '2px 0 8px' }}>{t.count}</div>
                {t.canSwitch && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSwitchCategory && onSwitchCategory(t.category); }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                      height: 26, padding: '0 10px 0 8px', borderRadius: 999,
                      background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.24)',
                      fontFamily: 'var(--font-sans)', fontSize: 11.5, fontWeight: 600, color: '#fff',
                    }}>
                    <Icon name="swap" size={12} color="#fff" stroke={2} /> Switch
                  </button>
                )}
              </div>
              <Icon name="chevronRight" size={18} color="rgba(255,255,255,0.5)" stroke={2} />
            </div>
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
