'use client';

import { useUser } from '@clerk/nextjs';
import { useNavigation } from '@/hooks/useNavigation';
import { useAppStore } from '@/store/useAppStore';
import IntakeScreen from '@/screens/flow/IntakeScreen';
import { createProject } from '@/services/project.service';

export default function IntakePage() {
  const { go, back } = useNavigation();
  const { user } = useUser();
  const setBrief = useAppStore((s) => s.setBrief);
  const setFirmId = useAppStore((s) => s.setFirmId);
  const setProjectId = useAppStore((s) => s.setProjectId);

  return (
    <IntakeScreen
      onBack={back}
      userName={user?.firstName}
      onComplete={async (brief) => {
        setBrief(brief);

        try {
          // Real project record on the main backend — replaces the local
          // TEMP-ID placeholders the moment this succeeds (see
          // useAppStore.js). Silently falls back to those placeholders if
          // the backend isn't reachable yet, so the AI-pipeline demo still
          // works standalone.
          const project = await createProject({
            title: brief.room_type ? brief.room_type.replace(/_/g, ' ') : 'New project',
            ...brief,
          });
          if (project?.project_id) setProjectId(project.project_id);
          if (project?.firm_id) setFirmId(project.firm_id);
        } catch {
          // No main backend configured/running — keep the temp ids.
        }

        go('/processing');
      }}
    />
  );
}
