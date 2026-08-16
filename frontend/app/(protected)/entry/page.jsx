'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import EntryScreen from '@/screens/flow/EntryScreen';
import { getProjects } from '@/services/project.service';

export default function EntryPage() {
  const role = useAppStore((s) => s.role);
  const { go } = useNavigation();
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getProjects(getToken)
      .then((data) => {
        if (!cancelled) setProjects(Array.isArray(data) ? data : data?.projects || []);
      })
      .catch(() => {
        // No main backend configured/running yet — teasers just stay hidden.
      });
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  return (
    <EntryScreen
      role={role}
      userName={isLoaded ? user?.fullName : null}
      projects={projects}
      onNew={() => go('/intake')}
      onContinue={() => go('/ffe')}
      onSupport={(screen) => go(`/${screen}`)}
    />
  );
}
