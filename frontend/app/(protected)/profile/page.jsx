'use client';

import { useEffect, useState } from 'react';
import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import { useNavigation } from '@/hooks/useNavigation';
import { useAppStore } from '@/store/useAppStore';
import ProfileScreen from '@/screens/support/ProfileScreen';
import { getProjects } from '@/services/project.service';

export default function ProfilePage() {
  const { back, go } = useNavigation();
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const role = useAppStore((s) => s.role);
  const [activeProjectCount, setActiveProjectCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getProjects(getToken)
      .then((data) => {
        if (cancelled) return;
        const projects = Array.isArray(data) ? data : data?.projects || [];
        setActiveProjectCount(projects.filter((p) => (p.proj_completionPercent || 0) < 100).length);
      })
      .catch(() => {
        // No main backend configured/running yet — omit the count rather than guess.
      });
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  return (
    <ProfileScreen
      onBack={back}
      userName={isLoaded ? user?.fullName : null}
      role={role}
      activeProjectCount={activeProjectCount}
      onSignOut={() => signOut(() => go('/role'))}
    />
  );
}
