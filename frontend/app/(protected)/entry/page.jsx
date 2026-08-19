'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import EntryScreen from '@/screens/flow/EntryScreen';
import { getProjects } from '@/services/project.service';

export default function EntryPage() {
  const role = useAppStore((s) => s.role);
  const projectHistory = useAppStore((s) => s.projectHistory);
  const resetFlow = useAppStore((s) => s.resetFlow);
  const { go } = useNavigation();
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let cancelled = false;
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
      .catch(() => {
        if (!cancelled) setProjects(projectHistory);
      });
    return () => {
      cancelled = true;
    };
  }, [getToken, projectHistory]);

  return (
    <EntryScreen
      role={role}
      userName={isLoaded ? user?.fullName : null}
      projects={projects}
      onNew={() => {
        resetFlow();
        go('/intake');
      }}
      onContinue={() => go('/ffe')}
      onSupport={(screen) => go(`/${screen}`)}
    />
  );
}
