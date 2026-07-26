'use client';

import { useState } from 'react';
import LightScene from '@/components/frame/LightScene';
import AppBar from '@/components/frame/AppBar';
import PhotoTile from '@/components/PhotoTile';
import Icon from '@/components/Icon';

const FILTER_CHIPS = [
  { label: 'All', count: 12, dot: null },
  { label: 'Active', count: 8, dot: '#7AB96B' },
  { label: 'Review', count: 3, dot: '#D4A45A' },
  { label: 'Pending', count: 1, dot: 'rgba(255,255,255,0.4)' },
];

const PROJECTS = [
  { proj_id: 1, tone: 'linen', proj_title: 'Living Room Refresh', user_id_client: 'Maya Chen', proj_completionPercent: 68, proj_status: 'Package Review', urgent: false, firm_id: 1, user_id_assignedDesigner: 'Elena Ross', bud_id: 1, proj_budgetMinOverride: null, proj_budgetMaxOverride: null, proj_budgetNotes: '', proj_timeline: '', proj_scope: '', proj_goal: '', proj_matchPercent: null, proj_createdAt: '2026-01-01T00:00:00Z', proj_updatedAt: '2026-01-01T00:00:00Z' },
  { proj_id: 2, tone: 'oak', proj_title: 'Master Suite Reno', user_id_client: 'Jordan Park', proj_completionPercent: 34, proj_status: 'FFE Selection', urgent: true, firm_id: 1, user_id_assignedDesigner: 'Elena Ross', bud_id: 2, proj_budgetMinOverride: null, proj_budgetMaxOverride: null, proj_budgetNotes: '', proj_timeline: '', proj_scope: '', proj_goal: '', proj_matchPercent: null, proj_createdAt: '2026-01-01T00:00:00Z', proj_updatedAt: '2026-01-01T00:00:00Z' },
  { proj_id: 3, tone: 'travertine', proj_title: 'Open Kitchen', user_id_client: 'Sam Rivera', proj_completionPercent: 92, proj_status: 'Handoff Ready', urgent: false, firm_id: 1, user_id_assignedDesigner: 'Elena Ross', bud_id: 3, proj_budgetMinOverride: null, proj_budgetMaxOverride: null, proj_budgetNotes: '', proj_timeline: '', proj_scope: '', proj_goal: '', proj_matchPercent: null, proj_createdAt: '2026-01-01T00:00:00Z', proj_updatedAt: '2026-01-01T00:00:00Z' },
  { proj_id: 4, tone: 'sand', proj_title: 'Home Office', user_id_client: 'Casey Wu', proj_completionPercent: 12, proj_status: 'Discovery', urgent: false, firm_id: 1, user_id_assignedDesigner: 'Elena Ross', bud_id: 1, proj_budgetMinOverride: null, proj_budgetMaxOverride: null, proj_budgetNotes: '', proj_timeline: '', proj_scope: '', proj_goal: '', proj_matchPercent: null, proj_createdAt: '2026-01-01T00:00:00Z', proj_updatedAt: '2026-01-01T00:00:00Z' },
];

function StatTile({ value, label, accent }) {
  return (
    <div style={{ flex: 1, padding: '14px 16px', borderRadius: 20, background: accent ? 'rgba(198,163,107,0.12)' : 'rgba(255,255,255,0.04)', border: accent ? '1px solid rgba(198,163,107,0.35)' : '1px solid rgba(255,255,255,0.09)' }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 32, fontWeight: 700, color: accent ? 'var(--champagne)' : 'rgba(247,242,234,0.95)', letterSpacing: '-0.02em', marginBottom: 3 }}>{value}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(247,242,234,0.48)', lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function AvatarStack({ count }) {
  return (
    <div style={{ display: 'flex' }}>
      {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
        <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: `hsl(${30 + i * 25}, 40%, ${45 + i * 8}%)`, border: '1.5px solid rgba(14,11,8,0.9)', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, color: 'rgba(247,242,234,0.9)' }}>
          {String.fromCharCode(65 + i)}
        </div>
      ))}
    </div>
  );
}

function ProjectCard({ project, onClick }) {
  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 0, borderRadius: 20, overflow: 'hidden', border: project.urgent ? '1px solid rgba(212,164,90,0.4)' : '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', marginBottom: 10, textAlign: 'left' }}>
      <PhotoTile tone={project.tone} style={{ width: 80, height: 84, borderRadius: 0, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '12px 14px' }}>
        {project.urgent && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: 'rgba(212,164,90,0.14)', border: '1px solid rgba(212,164,90,0.3)', marginBottom: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#D4A45A' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 600, color: '#D4A45A' }}>Needs attention</span>
          </div>
        )}
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 600, color: 'rgba(247,242,234,0.95)', marginBottom: 2 }}>{project.proj_title}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(247,242,234,0.45)', marginBottom: 8 }}>{project.user_id_client} · {project.proj_status}</div>
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${project.proj_completionPercent}%`, borderRadius: 2, background: 'var(--champagne)', transition: 'width 600ms ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <AvatarStack count={2} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(247,242,234,0.38)' }}>{project.proj_completionPercent}%</span>
        </div>
      </div>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(198,163,107,0.15)', border: '1px solid rgba(198,163,107,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 }}>
        <Icon name="chevron-right" size={16} stroke={2} color="var(--champagne)" />
      </div>
    </button>
  );
}

export default function ProjectsScreen({ onOpenProject, onProfile }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All' ? PROJECTS : PROJECTS.filter(p => {
    if (activeFilter === 'Active') return p.proj_completionPercent < 90;
    if (activeFilter === 'Review') return p.urgent;
    return false;
  });

  return (
    <LightScene>
      <AppBar title="Your projects" trailing={
        <button onClick={onProfile} style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(198,163,107,0.35), rgba(212,180,130,0.2))', border: '1px solid rgba(198,163,107,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700, color: 'var(--champagne)' }}>E</button>
      } />
      <div style={{ position: 'absolute', top: 88, bottom: 80, left: 0, right: 0, overflowY: 'auto', padding: '14px 18px' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(247,242,234,0.48)', marginBottom: 2 }}>Good afternoon</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 26, fontWeight: 600, color: 'rgba(247,242,234,0.97)', letterSpacing: '-0.015em', marginBottom: 18 }}>Elena Ross</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <StatTile value="12" label={"Active\nprojects"} />
          <StatTile value="3" label={"Need\nattention"} accent />
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 18, paddingBottom: 2 }}>
          {FILTER_CHIPS.map(chip => (
            <button key={chip.label} onClick={() => setActiveFilter(chip.label)} style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
              border: activeFilter === chip.label ? '1px solid rgba(198,163,107,0.6)' : '1px solid rgba(255,255,255,0.12)',
              background: activeFilter === chip.label ? 'rgba(198,163,107,0.14)' : 'transparent',
              fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: activeFilter === chip.label ? 600 : 400,
              color: activeFilter === chip.label ? 'var(--champagne)' : 'rgba(247,242,234,0.58)',
            }}>
              {chip.dot && <div style={{ width: 6, height: 6, borderRadius: '50%', background: chip.dot, flexShrink: 0 }} />}
              {chip.label}
              <span style={{ fontSize: 11, opacity: 0.65 }}>{chip.count}</span>
            </button>
          ))}
        </div>
        {filtered.map(p => <ProjectCard key={p.proj_id} project={p} onClick={() => onOpenProject?.(p)} />)}
      </div>
    </LightScene>
  );
}
