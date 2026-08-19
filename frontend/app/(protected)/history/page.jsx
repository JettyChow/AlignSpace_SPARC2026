'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useNavigation } from '@/hooks/useNavigation';
import { useAppStore } from '@/store/useAppStore';
import HistoryScreen from '@/screens/support/HistoryScreen';
import { getProjects } from '@/services/project.service';
import { ApiError } from '@/services/apiClient';

export default function HistoryPage() {
  const { go, back } = useNavigation();
  const { getToken } = useAuth();
  const projectHistory = useAppStore((s) => s.projectHistory);
  const setViewingHistoryEntry = useAppStore((s) => s.setViewingHistoryEntry);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getProjects(getToken)
      .then((data) => {
        if (cancelled) return;
        const remote = Array.isArray(data) ? data : data?.projects || [];
        // Backend is reachable now (designos-backend.service) — but local
        // snapshots are still real data the client picked on this device, so
        // always keep them visible rather than treating them as a fallback.
        // Simple deterministic merge: remote first, then any local entry
        // whose proj_id isn't already present remotely.
        const local = projectHistory.filter((p) => !remote.some((r) => r.proj_id === p.proj_id));
        setProjects([...remote, ...local]);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError) {
          // Backend unreachable/erroring — local history is real data (the
          // client's own picks), not invented, so show it instead of erroring.
          setProjects(projectHistory);
        } else {
          setError('Project history is not available yet.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [getToken, projectHistory]);

  return (
    <HistoryScreen
      onBack={back}
      onOpen={(project) => {
        // Local snapshots carry their own deliverable/brief/confirmed —
        // route through the read-only viewer on /summary.
        if (project?._local) {
          setViewingHistoryEntry(project);
          go('/summary');
          return;
        }
        // Backend-sourced project: there's no mapping yet from whatever
        // getProjects()/getProject() returns into the deliverable shape
        // SummaryScreen renders, so don't navigate to /summary — that would
        // just show the unrelated, currently-live Zustand deliverable.
        // Safely no-op until real per-project detail loading is built.
      }}
      projects={projects}
      loading={loading}
      error={error}
    />
  );
}
