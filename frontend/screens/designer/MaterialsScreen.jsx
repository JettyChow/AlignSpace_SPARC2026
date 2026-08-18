'use client';

import { useState } from 'react';
import LightScene from '@/components/frame/LightScene';
import AppBar from '@/components/frame/AppBar';
import PhotoTile from '@/components/PhotoTile';
import StatusPill from '@/components/StatusPill';
import Icon from '@/components/Icon';
import { fullName } from '@/lib/schema';
import { GROUPS, GROUP_LABELS } from '@/lib/materialCategories';

// Bottom tab bar — presentational chrome only. "Projects" and "Profile" are
// the only two destinations that exist in this app today (this screen IS
// reached from Projects, and /profile is a real route), so those two are
// interactive; Reviews/AI Queue/Documents have no backing screens yet and
// are rendered genuinely disabled (native `disabled`, dimmed, no cursor
// affordance) rather than as a clickable no-op.
const TABS = [
  { id: 'projects', label: 'Projects', icon: 'folder', interactive: true },
  { id: 'reviews', label: 'Reviews', icon: 'message', badge: 3 },
  { id: 'ai-queue', label: 'AI Queue', icon: 'sparkle', badge: 2 },
  { id: 'documents', label: 'Documents', icon: 'fileText' },
  { id: 'profile', label: 'Profile', icon: 'user', interactive: true },
];

function TabBar({ onProjects, onProfile }) {
  const actionFor = { projects: onProjects, profile: onProfile };
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', padding: '10px 4px 22px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(14,11,8,0.94)', backdropFilter: 'blur(16px)' }}>
      {TABS.map((t) => {
        const active = t.id === 'projects';
        const disabled = !t.interactive;
        const action = actionFor[t.id];
        const color = disabled ? 'rgba(247,242,234,0.22)' : active ? 'var(--champagne)' : 'rgba(247,242,234,0.42)';
        return (
          <button
            key={t.id}
            onClick={action}
            disabled={disabled}
            aria-disabled={disabled}
            style={{ flex: 1, background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 0' }}
          >
            <div style={{ position: 'relative' }}>
              <Icon name={t.icon} size={19} stroke={1.8} color={color} />
              {t.badge && (
                <div style={{ position: 'absolute', top: -5, right: -8, minWidth: 14, height: 14, borderRadius: 999, background: disabled ? 'rgba(247,242,234,0.2)' : '#D4A45A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, color: disabled ? 'rgba(247,242,234,0.5)' : 'var(--near-black)', padding: '0 3px' }}>{t.badge}</div>
              )}
            </div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: active ? 600 : 400, color }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function StatCell({ icon, value, label, first }) {
  return (
    <div style={{ flex: 1, minWidth: 0, padding: '10px 3px', textAlign: 'center', borderLeft: first ? 'none' : '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
      <Icon name={icon} size={14} stroke={1.8} color="var(--champagne)" style={{ margin: '0 auto 5px' }} />
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, color: 'rgba(247,242,234,0.92)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 8.5, color: 'rgba(247,242,234,0.4)', lineHeight: 1.3, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
    </div>
  );
}

function MetaRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
      <Icon name={icon} size={11} stroke={1.8} color="rgba(247,242,234,0.38)" style={{ flexShrink: 0 }} />
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: 'rgba(247,242,234,0.48)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
    </div>
  );
}

function FigureRow({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, justifyContent: 'flex-end' }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10.5, color: 'rgba(247,242,234,0.4)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: bold ? 14 : 12.5, fontWeight: bold ? 700 : 600, color: 'rgba(247,242,234,0.9)' }}>{value}</span>
    </div>
  );
}

function MaterialCard({ item }) {
  const total = item.projItem_quantity * item.projItem_unitCost;
  const approved = item.projItem_status === 'approved';
  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <PhotoTile tone={item.tone} imageUrl={item.imageUrl} style={{ width: 68, height: 68, borderRadius: 16, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'rgba(247,242,234,0.94)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.item_name}</div>
        <MetaRow icon="tile" text={item.item_category} />
        {item.item_brand && <MetaRow icon="tag" text={item.item_brand} />}
        {item.item_material && <MetaRow icon="palette" text={item.item_material} />}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3, justifyContent: 'center' }}>
        <FigureRow label="Qty" value={item.projItem_quantity} />
        <FigureRow label="Unit" value={`$${item.projItem_unitCost.toLocaleString()}`} />
        <FigureRow label="Total" value={`$${total.toLocaleString()}`} bold />
        <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <StatusPill kind={approved ? 'confirmed' : 'review'} label={approved ? 'Confirmed' : 'Pending'} />
        </div>
      </div>
    </div>
  );
}

export default function MaterialsScreen({ project, materials = [], loading, error, onBack, onProfile }) {
  const [activeGroup, setActiveGroup] = useState('All');
  const [search, setSearch] = useState('');

  // Group chips (Materials / Fixtures / Lighting) reuse lib/materialCategories'
  // existing GROUPS/GROUP_LABELS rather than a new hardcoded category list —
  // the same grouping FFEScreen already uses on the client side.
  const presentGroups = GROUPS.filter((g) => materials.some((m) => m.item_group === g));
  const groupChips = ['All', ...presentGroups];

  const filtered = materials.filter((m) => {
    const groupMatch = activeGroup === 'All' || m.item_group === activeGroup;
    const searchMatch = !search || m.item_name.toLowerCase().includes(search.toLowerCase());
    return groupMatch && searchMatch;
  });

  const totalFFE = materials.reduce((s, m) => s + m.projItem_quantity * m.projItem_unitCost, 0);
  const clientName = fullName(project?.client) || 'Client';

  return (
    <LightScene>
      <AppBar onBack={onBack} onMenu={() => {}} />

      <div style={{ position: 'absolute', top: 88, bottom: 150, left: 0, right: 0, overflowY: 'auto' }}>
        <div style={{ padding: '10px 18px 0' }}>
          <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
            <PhotoTile tone={project?.tone || 'oak'} imageUrl={project?.imageUrl} style={{ width: 96, height: 108, borderRadius: 20, flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--champagne)' }}>{clientName}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700, color: 'rgba(247,242,234,0.97)', letterSpacing: '-0.01em', lineHeight: 1.15 }}>
                {project?.proj_title || project?.title || 'Project'}
              </div>
              <div>
                <StatusPill kind="review" label={project?.proj_status || 'Needs review'} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 14 }}>
            <StatCell first icon="wallet" value={project?.proj_budgetMaxOverride ? `$${project.proj_budgetMaxOverride.toLocaleString()}` : '—'} label="Budget target" />
            <StatCell icon="calendar" value={project?.proj_timeline || '—'} label="Est. timeline" />
            <StatCell icon="boxes" value={`${materials.length} items`} label="FFE selections" />
            <StatCell icon="clock" value={project?.proj_updatedAt || '—'} label={project?.proj_updatedAtTime || 'Last updated'} />
            <StatCell icon="trendUp" value={`${project?.proj_completionPercent ?? 0}%`} label="Ready for review" />
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
            {groupChips.map(g => {
              const label = g === 'All' ? 'All' : GROUP_LABELS[g];
              const count = g === 'All' ? materials.length : materials.filter(m => m.item_group === g).length;
              return (
                <button key={g} onClick={() => setActiveGroup(g)} style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
                  border: activeGroup === g ? '1px solid rgba(198,163,107,0.6)' : '1px solid rgba(255,255,255,0.10)',
                  background: activeGroup === g ? 'rgba(198,163,107,0.14)' : 'transparent',
                  fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: activeGroup === g ? 600 : 400,
                  color: activeGroup === g ? 'var(--champagne)' : 'rgba(247,242,234,0.55)',
                }}>
                  {label}
                  <span style={{ fontSize: 11, opacity: 0.65 }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '0 18px 24px' }}>
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

      <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, padding: '12px 18px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(14,11,8,0.88)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(247,242,234,0.42)' }}>FF&E total</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700, color: 'rgba(247,242,234,0.97)', letterSpacing: '-0.015em' }}>${totalFFE.toLocaleString()}</div>
        </div>
        {/* Genuinely disabled — no PDF/export backend exists for this demo,
            so this must not look like a working control. */}
        <button
          disabled
          aria-disabled="true"
          style={{
            height: 44, padding: '0 20px', borderRadius: 'var(--r-button)', border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.04)', color: 'rgba(247,242,234,0.32)', cursor: 'not-allowed',
            display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600,
          }}
        >
          <Icon name="download" size={16} stroke={2} color="rgba(247,242,234,0.32)" />
          Export
        </button>
      </div>

      <TabBar onProjects={onBack} onProfile={onProfile} />
    </LightScene>
  );
}
