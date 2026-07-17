'use client';

import { useState } from 'react';
import LightScene from '@/components/frame/LightScene';
import AppBar from '@/components/frame/AppBar';
import { PrimaryButton, GlassButton } from '@/components/Buttons';
import PhotoTile from '@/components/PhotoTile';
import Icon from '@/components/Icon';

const MAT_CATS = ['All', 'Furniture', 'Lighting', 'Fixtures', 'Finishes'];

const MATERIALS = [
  { id: 1, tone: 'linen', name: 'Linen Sectional', cat: 'Furniture', qty: 1, unit: 'ea', unitPrice: 4200, stock: 'in-stock' },
  { id: 2, tone: 'oak', name: 'White Oak Coffee Table', cat: 'Furniture', qty: 1, unit: 'ea', unitPrice: 1100, stock: 'in-stock' },
  { id: 3, tone: 'charcoal', name: 'Brass Pendant Light', cat: 'Lighting', qty: 2, unit: 'ea', unitPrice: 620, stock: 'order' },
  { id: 4, tone: 'travertine', name: 'Travertine Side Table', cat: 'Furniture', qty: 2, unit: 'ea', unitPrice: 460, stock: 'in-stock' },
  { id: 5, tone: 'sand', name: 'Jute Area Rug', cat: 'Finishes', qty: 1, unit: 'ea', unitPrice: 680, stock: 'in-stock' },
  { id: 6, tone: 'stone', name: 'Matte Black Faucet', cat: 'Fixtures', qty: 1, unit: 'ea', unitPrice: 340, stock: 'order' },
  { id: 7, tone: 'warmwhite', name: 'Warm White Paint', cat: 'Finishes', qty: 4, unit: 'gal', unitPrice: 35, stock: 'in-stock' },
  { id: 8, tone: 'clay', name: 'Terracotta Vase Set', cat: 'Furniture', qty: 3, unit: 'ea', unitPrice: 120, stock: 'in-stock' },
];

const STAT_CELLS = [
  { label: 'Total items', value: '22' },
  { label: 'Confirmed', value: '14' },
  { label: 'On order', value: '6' },
  { label: 'Budget used', value: '78%' },
  { label: 'FFE total', value: '$31,400' },
];

function MaterialCard({ item }) {
  const total = item.qty * item.unitPrice;
  const stockColor = item.stock === 'in-stock' ? '#7AB96B' : '#D4A45A';
  const stockLabel = item.stock === 'in-stock' ? 'In stock' : 'To order';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <PhotoTile tone={item.tone} style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, color: 'rgba(247,242,234,0.92)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(247,242,234,0.42)' }}>{item.qty} {item.unit} · ${item.unitPrice.toLocaleString()} ea</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700, color: 'rgba(247,242,234,0.88)', marginBottom: 3 }}>${total.toLocaleString()}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: stockColor }} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: stockColor }}>{stockLabel}</span>
        </div>
      </div>
    </div>
  );
}

export default function MaterialsScreen({ project, onBack, onProfile }) {
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = MATERIALS.filter(m => {
    const catMatch = activeCat === 'All' || m.cat === activeCat;
    const searchMatch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const totalFFE = MATERIALS.reduce((s, m) => s + m.qty * m.unitPrice, 0);

  return (
    <LightScene>
      <AppBar onBack={onBack} title="Materials list" trailing={
        <button onClick={onProfile} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(198,163,107,0.2)', border: '1px solid rgba(198,163,107,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, color: 'var(--champagne)' }}>E</button>
      } />
      <div style={{ position: 'absolute', top: 88, bottom: 80, left: 0, right: 0, overflowY: 'auto' }}>
        <div style={{ padding: '10px 18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <PhotoTile tone="linen" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'rgba(247,242,234,0.95)' }}>{project?.name || 'Living Room Refresh'}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(247,242,234,0.45)' }}>{project?.client || 'Maya Chen'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 0, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 14 }}>
            {STAT_CELLS.map((s, i) => (
              <div key={s.label} style={{ flex: 1, padding: '8px 0', textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, color: 'rgba(247,242,234,0.92)' }}>{s.value}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 9.5, color: 'rgba(247,242,234,0.38)', lineHeight: 1.3, marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <Icon name="search" size={16} stroke={1.8} color="rgba(247,242,234,0.45)" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'rgba(247,242,234,0.85)' }} />
            </div>
            <button style={{ padding: '9px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="filter" size={16} stroke={1.8} color="rgba(247,242,234,0.65)" />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(247,242,234,0.65)' }}>Filters</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14, paddingBottom: 2 }}>
            {MAT_CATS.map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)} style={{
                flexShrink: 0, padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
                border: activeCat === cat ? '1px solid rgba(198,163,107,0.6)' : '1px solid rgba(255,255,255,0.10)',
                background: activeCat === cat ? 'rgba(198,163,107,0.14)' : 'transparent',
                fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: activeCat === cat ? 600 : 400,
                color: activeCat === cat ? 'var(--champagne)' : 'rgba(247,242,234,0.55)',
              }}>{cat}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 18px 100px' }}>
          {filtered.map(m => <MaterialCard key={m.id} item={m} />)}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 18px 32px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(14,11,8,0.88)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(247,242,234,0.42)' }}>FF&E total</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700, color: 'rgba(247,242,234,0.97)', letterSpacing: '-0.015em' }}>${totalFFE.toLocaleString()}</div>
        </div>
        <PrimaryButton onClick={() => {}} style={{ flex: 0, padding: '11px 22px' }}>Approve all</PrimaryButton>
      </div>
    </LightScene>
  );
}
