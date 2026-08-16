'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import DiscoveryScreen from '@/screens/explore/DiscoveryScreen';
import { runAssemble } from '@/services/pipeline.service';
import { updateProjectPreferences, selectDirection } from '@/services/project.service';

export default function DiscoveryPage() {
  const directions = useAppStore((s) => s.directions);
  const brief = useAppStore((s) => s.brief);
  const firmId = useAppStore((s) => s.firmId);
  const projectId = useAppStore((s) => s.projectId);
  const selected = useAppStore((s) => s.selected);
  const setSelected = useAppStore((s) => s.setSelected);
  const setDeliverable = useAppStore((s) => s.setDeliverable);
  const { go, back } = useNavigation();
  const { getToken } = useAuth();
  const [assembling, setAssembling] = useState(false);
  const [error, setError] = useState(null);

  const fullBrief = useMemo(
    () => ({ firm_id: firmId, project_id: projectId, ...brief }),
    [brief, firmId, projectId]
  );

  // No directions in the store means intake hasn't run yet for this session.
  useEffect(() => {
    if (!directions || directions.length === 0) go('/intake');
  }, [directions, go]);

  async function handleSelect(directionKey) {
    setError(null);
    setAssembling(true);
    try {
      // direction_id is only present when `directions` came from the main
      // backend's /generate (see ProcessingScreen.jsx's normalization) — the
      // pipeline-fallback shape has no id to select by.
      const dir = directions.find((d) => d.key === directionKey);
      const canUseMainBackend =
        dir?.direction_id != null && projectId && Number.isFinite(Number(projectId));

      let deliverable;
      let persistedByMainBackend = false;

      if (canUseMainBackend) {
        try {
          deliverable = await selectDirection(projectId, dir.direction_id, getToken);
          persistedByMainBackend = true;
        } catch {
          // Main backend unreachable/rejected — fall back to the raw pipeline.
          deliverable = await runAssemble(fullBrief, directionKey);
        }
      } else {
        deliverable = await runAssemble(fullBrief, directionKey);
      }

      setDeliverable(deliverable);

      if (!persistedByMainBackend) {
        try {
          // Persist the chosen direction on the real project record. Silently
          // ignored if the main backend isn't reachable yet — the AI-pipeline
          // deliverable itself is the source of truth for this session either way.
          await updateProjectPreferences(projectId, { direction_key: directionKey }, getToken);
        } catch {
          // No main backend configured/running — nothing to persist to.
        }
      }

      go('/focus');
    } catch (err) {
      setError(err.message || 'Could not build the material package for this direction.');
    } finally {
      setAssembling(false);
    }
  }

  if (!directions || directions.length === 0) return null;

  return (
    <>
      <DiscoveryScreen
        directions={directions}
        selected={selected?.[0]}
        setSelected={(key) => setSelected(key ? [key] : [])}
        onBack={back}
        onSelect={handleSelect}
        onMenu={() => go('/history')}
      />
      {(assembling || error) && (
        <div style={{ position: 'absolute', bottom: 96, left: 20, right: 20, zIndex: 30, textAlign: 'center' }}>
          <span style={{
            display: 'inline-block', padding: '8px 16px', borderRadius: 999,
            fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
            background: error ? 'rgba(212,90,90,0.16)' : 'rgba(198,163,107,0.16)',
            color: error ? '#e08787' : 'var(--champagne)',
            border: `1px solid ${error ? 'rgba(212,90,90,0.4)' : 'rgba(198,163,107,0.4)'}`,
          }}>
            {error || 'Building your material package…'}
          </span>
        </div>
      )}
    </>
  );
}
