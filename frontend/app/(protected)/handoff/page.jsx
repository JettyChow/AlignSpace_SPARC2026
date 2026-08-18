'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useNavigation } from '@/hooks/useNavigation';
import { useAppStore } from '@/store/useAppStore';
import HandoffScreen from '@/screens/decide/HandoffScreen';
import { handoffProject, projectBriefPdfUrl } from '@/services/project.service';

// TEMP-ID placeholders (useAppStore's makeTempId) are non-numeric strings;
// real main-backend project ids are integers — same check ProcessingScreen
// uses before calling project-scoped routes.
function looksLikeRealProjectId(id) {
  return Number.isFinite(Number(id));
}

export default function HandoffPage() {
  const { go } = useNavigation();
  const { getToken } = useAuth();
  const projectId = useAppStore((s) => s.projectId);

  const isRealProject = looksLikeRealProjectId(projectId);
  // 'offline' = no backend project exists (TEMP-ID demo flow) — nothing to
  // send, so we don't pretend it was delivered.
  const [status, setStatus] = useState(isRealProject ? 'sending' : 'offline');
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isRealProject) return;
    let cancelled = false;
    setStatus('sending');
    setError(null);

    handoffProject(projectId, {}, getToken)
      .then(() => {
        if (!cancelled) setStatus('sent');
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setError(err?.message || 'Could not reach the backend.');
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, isRealProject, getToken, attempt]);

  return (
    <HandoffScreen
      status={status}
      error={error}
      onRetry={() => setAttempt((n) => n + 1)}
      onViewProject={() => go('/summary')}
      onDownloadBrief={
        isRealProject
          ? () => window.open(projectBriefPdfUrl(projectId), '_blank')
          : undefined
      }
      onHome={() => go('/entry')}
    />
  );
}
