'use client';

import { useState } from 'react';
import LightScene from '@/components/frame/LightScene';
import AppBar from '@/components/frame/AppBar';
import { PrimaryButton } from '@/components/Buttons';
import PhotoTile from '@/components/PhotoTile';
import Icon from '@/components/Icon';
import { fullName } from '@/lib/schema';

function MaterialCard({ item }) {
  const total = item.projItem_quantity * item.projItem_unitCost;
  const approved = item.projItem_status === 'approved';
  const stockColor = approved ? '#7AB96B' : '#D4A45A';
  const stockLabel = approved ? 'Confirmed' : 'Pending';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <PhotoTile tone={item.tone} style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, color: 'rgba(247,242,234,0.92)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.item_name}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(247,242,234,0.42)' }}>{item.projItem_quantity} × ${item.projItem_unitCost.toLocaleString()} ea</div>
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

export default function MaterialsScreen({ project, materials = [], deliverable, loading, error, onDownloadBrief, onBack, onProfile }) {
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');

  // Category chips derive from the actual list (pipeline categories like
  // "Floor tile"/"Vanity"), so they track whatever the backend returns.
  const categories = ['All', ...new Set(materials.map(m => m.item_category))];

  const filtered = materials.filter(m => {
    const catMatch = activeCat === 'All' || m.item_category === activeCat;
    const searchMatch = !search || m.item_name.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const totalFFE = materials.reduce((s, m) => s + m.projItem_quantity * m.projItem_unitCost, 0);
  const confirmedCount = materials.filter(m => m.projItem_status === 'approved').length;
  const pendingCount = materials.length - confirmedCount;
  const budgetUsedPct = project?.proj_budgetMaxOverride
    ? Math.round((totalFFE / project.proj_budgetMaxOverride) * 100)
    : null;

  // Computed from MATERIALS/project above rather than a separate hardcoded
  // array, so these stay in sync with whatever the real fetch returns.
  const statCells = [
    { label: 'Total items', value: materials.length },
    { label: 'Confirmed', value: confirmedCount },
    { label: 'Pending', value: pendingCount },
    { label: 'Budget used', value: budgetUsedPct != null ? `${budgetUsedPct}%` : '—' },
    { label: 'FFE total', value: `$${totalFFE.toLocaleString()}` },
  ];

  const designerInitial = fullName(project?.assignedDesigner)?.[0]?.toUpperCase() || 'D';
  const clientName = fullName(project?.client) || 'Client';

  return (
    <LightScene>
      <AppBar onBack={onBack} title="Materials list" trailing={
        <button onClick={onProfile} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(198,163,107,0.2)', border: '1px solid rgba(198,163,107,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, color: 'var(--champagne)' }}>{designerInitial}</button>
      } />
      <div style={{ position: 'absolute', top: 88, bottom: 80, left: 0, right: 0, overflowY: 'auto' }}>
        <div style={{ padding: '10px 18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <PhotoTile tone="linen" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'rgba(247,242,234,0.95)' }}>{project?.proj_title || project?.title || 'Project'}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(247,242,234,0.45)' }}>{clientName}</div>
            </div>
          </div>

          {deliverable?.scope_summary && (
            <div style={{ padding: '12px 14px', borderRadius: 16, background: 'rgba(198,163,107,0.08)', border: '1px solid rgba(198,163,107,0.25)', marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--champagne)', marginBottom: 6 }}>Client brief</div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(247,242,234,0.75)', lineHeight: 1.55, margin: '0 0 10px' }}>{deliverable.scope_summary}</p>
              <button onClick={onDownloadBrief} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, cursor: 'pointer', background: 'rgba(198,163,107,0.14)', border: '1px solid rgba(198,163,107,0.45)', fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600, color: 'var(--champagne)' }}>
                <Icon name="download" size={15} stroke={1.8} color="var(--champagne)" />
                Download brief (PDF)
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 0, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 14 }}>
            {statCells.map((s, i) => (
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
            {categories.map(cat => (
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
          {loading && (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'rgba(247,242,234,0.5)', textAlign: 'center', marginTop: 40 }}>Loading materials…</div>
          )}
          {!loading && error && (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'rgba(247,242,234,0.55)', textAlign: 'center', marginTop: 40, lineHeight: 1.6 }}>{error}</div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'rgba(247,242,234,0.5)', textAlign: 'center', marginTop: 40, lineHeight: 1.6 }}>
              No materials yet — they appear once the client picks a direction.
            </div>
          )}
          {!loading && !error && filtered.map(m => <MaterialCard key={m.item_id} item={m} />)}
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
