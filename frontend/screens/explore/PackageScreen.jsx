'use client';

import { useState, useRef } from 'react';
import { PrimaryButton } from '@/components/Buttons';
import PhotoTile from '@/components/PhotoTile';
import RoundIconButton from '@/components/frame/RoundIconButton';
import Icon from '@/components/Icon';

const CATS = [
  { id: 'materials', label: 'Materials', icon: 'layers' },
  { id: 'fixtures',  label: 'Fixtures',  icon: 'faucet' },
  { id: 'lighting',  label: 'Lighting',  icon: 'light' },
  { id: 'textiles',  label: 'Textiles',  icon: 'sofa' },
  { id: 'surfaces',  label: 'Surfaces',  icon: 'tile' },
];

const CAT_ITEMS = {
  materials: [
    { name: 'Calacatta Quartz',       desc: 'Soft white base with subtle veining. Durable and timeless.',  tone: 'travertine' },
    { name: 'Zellige backsplash tile', desc: 'Warm ivory handmade tile with natural variation.',             tone: 'warmwhite' },
    { name: 'Brushed brass faucet',   desc: 'Elegant brushed brass finish. Modern and warm.',               tone: 'sand' },
    { name: 'White oak cabinetry',    desc: 'Rift-sawn white oak with a natural matte finish.',             tone: 'oak' },
  ],
  fixtures: [
    { name: 'Brushed brass faucet set', desc: 'Faucet, shower set and hardware in a warm brass tone.', tone: 'sand' },
    { name: 'Rain shower head',          desc: 'Ceiling-mounted in soft matte brass.',                  tone: 'oak' },
    { name: 'Concealed linear drain',    desc: 'Tile-in profile in brushed stainless.',                 tone: 'stone' },
    { name: 'Matte brass towel bar',     desc: 'Minimal hardware to match the faucet set.',             tone: 'sand' },
  ],
  lighting: [
    { name: 'Warm LED plan',          desc: '2700K dimmable scheme, softly layered.',         tone: 'warmwhite' },
    { name: 'Brass wall sconces',     desc: 'A pair with frosted glass globes.',               tone: 'sand' },
    { name: 'Recessed ceiling spots', desc: 'Trimless, tunable warm white.',                   tone: 'charcoal' },
    { name: 'Linen pendant shades',   desc: 'Natural linen drum over the island.',             tone: 'warmwhite' },
  ],
  textiles: [
    { name: 'Belgian linen drapery', desc: 'Sand tone, floor-length and lined.',   tone: 'linen' },
    { name: 'Wool-blend rug',         desc: 'Hand-loomed in a soft oatmeal.',       tone: 'stone' },
    { name: 'Bouclé accent cushions', desc: 'Set of four in a warm ecru.',          tone: 'warmwhite' },
    { name: 'Mohair throw',           desc: 'Lightweight, in a muted clay.',        tone: 'clay' },
  ],
  surfaces: [
    { name: 'Quartzite countertop',  desc: 'Honed finish with soft veining.',            tone: 'travertine' },
    { name: 'Zellige wall tile',     desc: 'Handmade in a warm ivory glaze.',            tone: 'warmwhite' },
    { name: 'White oak cabinetry',   desc: 'Rift-cut flat panel, matte finish.',         tone: 'oak' },
    { name: 'Lime-washed plaster',   desc: 'Hand-troweled in a soft ivory.',             tone: 'warmwhite' },
  ],
};

const rowIconBtn = {
  width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', flex: 'none',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#fff', border: '1px solid var(--line-strong)',
};

function FeaturedCard({ it, onDelete, onSwitch }) {
  const [dx, setDx] = useState(0);
  const [inPlan, setInPlan] = useState(true);
  const startX = useRef(null);

  const down = (e) => {
    startX.current = e.clientX;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
  };
  const move = (e) => {
    if (startX.current == null) return;
    setDx(Math.max(-96, Math.min(96, e.clientX - startX.current)));
  };
  const end = () => {
    if (dx < -60) onDelete();
    else if (dx > 60) onSwitch();
    setDx(0);
    startX.current = null;
  };

  return (
    <div style={{ position: 'relative', borderRadius: 26, overflow: 'hidden', marginBottom: 22, boxShadow: 'var(--shadow-raise)' }}>
      {/* reveal left: switch */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #C6A36B, #A8854F)', opacity: Math.max(0, dx / 60) }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Icon name="swap" size={22} color="#fff" stroke={1.9} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, color: '#fff' }}>Switch</span>
        </div>
      </div>
      {/* reveal right: remove */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6b6157, #332d27)', opacity: Math.max(0, -dx / 60) }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Icon name="x" size={22} color="#fff" stroke={2} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, color: '#fff' }}>Remove</span>
        </div>
      </div>
      {/* draggable white card */}
      <div
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        style={{
          position: 'relative', display: 'flex', alignItems: 'stretch', minHeight: 188,
          background: '#fff', border: '1px solid var(--line)', borderRadius: 24, overflow: 'hidden',
          touchAction: 'pan-y', cursor: 'grab',
          transform: `translateX(${dx}px)`,
          transition: startX.current == null ? 'transform var(--dur-base) var(--ease-soft)' : 'none',
        }}
      >
        <PhotoTile tone={it.tone} radius={0} style={{ width: 122, flex: 'none', alignSelf: 'stretch' }} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: '14px 14px 12px' }}>
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 5, height: 22, padding: '0 9px 0 8px', borderRadius: 999, background: 'rgba(122,185,107,0.16)' }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--success)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, color: '#5a9a4c' }}>In your plan</span>
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18.5, lineHeight: 1.12, fontWeight: 600, color: 'var(--fg-1)', letterSpacing: '-0.015em', marginTop: 10 }}>{it.name}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, lineHeight: 1.4, color: 'var(--fg-2)', marginTop: 7 }}>{it.desc}</div>
          <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setInPlan(v => !v)}
              style={{
                width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', flex: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: inPlan ? 'var(--champagne-grad)' : '#fff',
                border: inPlan ? '1px solid transparent' : '1px solid var(--line-strong)',
                boxShadow: inPlan ? '0 6px 16px rgba(198,163,107,0.4)' : 'none',
                transition: 'all var(--dur-base) var(--ease-soft)',
              }}
            >
              <Icon name="check" size={16} stroke={2.4} color={inPlan ? '#fff' : 'var(--dark-taupe)'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MaterialRow({ it, onDelete, onSwitch }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 9, background: '#fff', border: '1px solid var(--line)', borderRadius: 18, boxShadow: 'var(--shadow-card)' }}>
      <PhotoTile tone={it.tone} height={68} radius={13} style={{ width: 80, flex: 'none' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', letterSpacing: '-0.01em' }}>{it.name}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: 1.36, color: 'var(--fg-2)', marginTop: 2 }}>{it.desc}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, flex: 'none' }}>
        <button onClick={onSwitch} title="Switch" style={rowIconBtn}><Icon name="swap" size={16} color="var(--dark-taupe)" stroke={1.9} /></button>
        <button onClick={onDelete} title="Remove" style={rowIconBtn}><Icon name="x" size={16} color="var(--dark-taupe)" stroke={2} /></button>
      </div>
    </div>
  );
}

export default function PackageScreen({ onBack, onContinue, onMenu, confirmed = [], onConfirm }) {
  const [activeCat, setActiveCat] = useState('materials');
  const [data, setData] = useState(() => JSON.parse(JSON.stringify(CAT_ITEMS)));

  const list = data[activeCat] || [];
  const featured = list[0];
  const rest = list.slice(1);

  const rotate = (cat, from, to) => {
    setData(d => {
      const arr = [...d[cat]];
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return { ...d, [cat]: arr };
    });
  };
  const remove = (cat, idx) => setData(d => ({ ...d, [cat]: d[cat].filter((_, i) => i !== idx) }));

  const totalSel = Object.values(data).reduce((a, l) => a + Math.max(0, l.length - 1), 0);
  const isOn = confirmed.includes(activeCat);
  const activeCatLabel = CATS.find(c => c.id === activeCat)?.label ?? '';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'var(--warm-ivory)' }}>

      {/* hero band — blurred scene fading to warm-ivory */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 196, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/assets/scene-interior.png)', backgroundSize: 'cover', backgroundPosition: '58% 42%', filter: 'blur(3px)', transform: 'scale(1.08)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(14,11,8,0.62) 0%, rgba(16,12,8,0.46) 48%, rgba(247,243,236,0.0) 90%, var(--warm-ivory) 100%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '54px 20px 0' }}>
          <RoundIconButton icon="arrowLeft" dark onClick={onBack} />
          <RoundIconButton icon="dots" dark onClick={onMenu} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.78)' }}>Material list</div>
          <div style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 37, lineHeight: 1, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', marginTop: 2, textShadow: '0 2px 16px rgba(0,0,0,0.42)' }}>Warm Minimal</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.74)', marginTop: 5 }}>{totalSel} selections · 5 categories</div>
        </div>
      </div>

      {/* category chip rail */}
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, zIndex: 12, display: 'flex', gap: 8, overflowX: 'auto', padding: '0 20px 4px', scrollSnapType: 'x proximity' }}>
        {CATS.map(c => {
          const on = activeCat === c.id;
          const ok = confirmed.includes(c.id);
          const count = Math.max(0, data[c.id].length - 1);
          return (
            <button key={c.id} onClick={() => setActiveCat(c.id)} style={{
              scrollSnapAlign: 'start', flex: 'none', height: 40, padding: '0 15px 0 12px', borderRadius: 999, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
              background: on ? 'var(--champagne-grad)' : '#fff',
              color: on ? '#fff' : 'var(--fg-2)',
              border: on ? '1px solid transparent' : '1px solid var(--line)',
              boxShadow: on ? '0 8px 20px rgba(198,163,107,0.4)' : 'var(--shadow-card)',
              transition: 'all var(--dur-base) var(--ease-soft)',
            }}>
              <Icon name={c.icon} size={16} stroke={1.8} color={on ? '#fff' : 'var(--dark-taupe)'} />
              {c.label}
              {ok
                ? <Icon name="checkCircle" size={15} stroke={2} color={on ? '#fff' : 'var(--success)'} />
                : <span style={{ fontSize: 12, fontWeight: 700, opacity: on ? 0.85 : 0.5 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* scrollable section content */}
      <div style={{ position: 'absolute', top: 256, left: 0, right: 0, bottom: 0, overflowY: 'auto', padding: '14px 20px 148px', boxSizing: 'border-box' }}>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 500, color: 'var(--fg-3)' }}>
            Swipe a card — remove&nbsp;&nbsp;••&nbsp;&nbsp;switch
          </span>
        </div>

        {featured ? (
          <FeaturedCard
            key={activeCat + featured.name}
            it={featured}
            onDelete={() => remove(activeCat, 0)}
            onSwitch={() => list.length > 1 && rotate(activeCat, 0, list.length - 1)}
          />
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--fg-3)' }}>
            No items left in this category.
          </div>
        )}

        {rest.length > 0 && (
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)', margin: '2px 2px 10px' }}>
              Also in {activeCatLabel.toLowerCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {rest.map((it, i) => (
                <MaterialRow
                  key={it.name}
                  it={it}
                  onSwitch={() => rotate(activeCat, i + 1, 0)}
                  onDelete={() => remove(activeCat, i + 1)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* footer — confirm toggle + continue */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '18px 20px 26px', zIndex: 20, display: 'flex', flexDirection: 'column', gap: 10, background: 'linear-gradient(180deg, rgba(247,243,236,0), rgba(247,243,236,0.86) 30%, var(--warm-ivory) 60%)' }}>
        <button
          onClick={() => onConfirm && onConfirm(activeCat)}
          style={{
            width: '100%', height: 50, borderRadius: 'var(--r-button)', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontFamily: 'var(--font-sans)', fontSize: 15.5, fontWeight: 600,
            transition: 'all var(--dur-base) var(--ease-soft)',
            ...(isOn ? {
              background: 'rgba(122,185,107,0.16)', color: '#4e8c40',
              border: '1px solid rgba(122,185,107,0.5)', boxShadow: 'none',
            } : {
              background: '#FAF4E9', color: 'var(--champagne-deep)',
              border: '1px solid rgba(198,163,107,0.45)', boxShadow: '0 4px 16px rgba(95,85,76,0.08)',
            }),
          }}
        >
          <Icon name={isOn ? 'checkCircle' : 'check'} size={19} stroke={2.2} color={isOn ? 'var(--success)' : 'var(--champagne-deep)'} />
          {isOn ? `${activeCatLabel} confirmed` : 'Looks good to me'}
        </button>
        <PrimaryButton onClick={onContinue} style={{ height: 52, fontSize: 16 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            Continue to decision tracker <Icon name="arrowRight" size={18} stroke={1.9} />
          </span>
        </PrimaryButton>
      </div>
    </div>
  );
}
