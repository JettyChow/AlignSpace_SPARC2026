'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useNavigation } from '@/hooks/useNavigation';
import HistoryScreen from '@/screens/support/HistoryScreen';
import { getProjects } from '@/services/project.service';
import { ApiError } from '@/services/apiClient';

export default function HistoryPage() {
  const { go, back } = useNavigation();
  const { getToken } = useAuth();
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
        setProjects(Array.isArray(data) ? data : data?.projects || []);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? 'Could not load your projects right now.'
            : 'Project history is not available yet.';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [getToken]);

  return (
    <HistoryScreen
      onBack={back}
      onOpen={() => go('/summary')}
      projects={projects}
      loading={loading}
      error={error}
    />
  );
}
