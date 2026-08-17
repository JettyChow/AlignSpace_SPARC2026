'use client';

import { useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useNavigation } from '@/hooks/useNavigation';
import { useAppStore } from '@/store/useAppStore';
import ProcessingScreen from '@/screens/flow/ProcessingScreen';

export default function ProcessingPage() {
  const { go } = useNavigation();
  const { getToken } = useAuth();
  const brief = useAppStore((s) => s.brief);
  const firmId = useAppStore((s) => s.firmId);
  const projectId = useAppStore((s) => s.projectId);
  const setProfile = useAppStore((s) => s.setProfile);
  const setDirections = useAppStore((s) => s.setDirections);

  // Guard against landing here directly (refresh, back-button) with no
  // intake answers to send.
  useEffect(() => {
    if (!brief) go('/intake');
  }, [brief, go]);

  // Full BriefRequest shape as-ai-server expects (see api_schemas.py) — used
  // as the fallback payload when ProcessingScreen can't reach the main
  // backend's /generate route. firmId/projectId are the client-side TEMP-ID
  // placeholders from the store until createProject() succeeds against the
  // main backend (see intake/page.jsx).
  const fullBrief = useMemo(
    () => ({ firm_id: firmId, project_id: projectId, ...brief }),
    [brief, firmId, projectId]
  );

  if (!brief) return null;

  return (
    <ProcessingScreen
      brief={fullBrief}
      projectId={projectId}
      getToken={getToken}
      onDone={({ profile, directions }) => {
        setProfile(profile);
        setDirections(directions);
        go('/discovery');
      }}
    />
  );
}
