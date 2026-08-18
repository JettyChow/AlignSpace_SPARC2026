'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import ProjectsScreen from '@/screens/designer/ProjectsScreen';
import { getDesignerProjects } from '@/services/project.service';
import { ApiError } from '@/services/apiClient';

export default function ProjectsPage() {
  const setProject = useAppStore((s) => s.setProject);
  const { go } = useNavigation();
  const { getToken } = useAuth();
  const { user } = useUser();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getDesignerProjects(getToken)
      .then((data) => {
        if (cancelled) return;
        setProjects(data?.projects || []);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? 'Could not load projects right now.'
            : 'The projects backend is not reachable yet.';
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
    <ProjectsScreen
      designer={{ user_firstName: user?.firstName, user_lastName: user?.lastName }}
      projects={projects}
      loading={loading}
      error={error}
      onOpenProject={(project) => {
        setProject(project);
        go(`/projects/${project.proj_id ?? project.project_id ?? 0}`);
      }}
      onProfile={() => go('/profile')}
      onTab={() => {}}
    />
  );
}
