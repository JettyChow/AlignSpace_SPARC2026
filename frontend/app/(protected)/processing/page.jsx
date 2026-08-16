'use client';

import { useEffect, useMemo } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { useAppStore } from '@/store/useAppStore';
import ProcessingScreen from '@/screens/flow/ProcessingScreen';

export default function ProcessingPage() {
  const { go } = useNavigation();
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

  // Full BriefRequest shape as-ai-server expects (see api_schemas.py) — the
  // firm/project ids are the client-side TEMP-ID placeholders from the store
  // until a real auth/project backend exists.
  const fullBrief = useMemo(
    () => ({ firm_id: firmId, project_id: projectId, ...brief }),
    [brief, firmId, projectId]
  );

  if (!brief) return null;

  return (
    <ProcessingScreen
      brief={fullBrief}
      onDone={({ profile, directions }) => {
        setProfile(profile);
        setDirections(directions);
        go('/discovery');
      }}
    />
  );
}
