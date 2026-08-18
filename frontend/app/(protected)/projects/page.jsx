'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import ProjectsScreen from '@/screens/designer/ProjectsScreen';
import { getDesignerProjects } from '@/services/project.service';
import { DEMO_PROJECT_ID, buildDemoDesignerProject } from '@/data/demoDesignerProject';

// DEMO MODE: the real Client -> DB -> Designer handoff isn't wired yet (see
// services/project.service.js), so getDesignerProjects() below either fails
// or resolves empty. Every Designer account is shown one deterministic demo
// kitchen project regardless — see data/demoDesignerProject.js. Swap this
// out once /designer/projects is backed by a real main backend.
const DEMO_PROJECT = buildDemoDesignerProject();

function withDemoProject(projects) {
  if ((projects || []).some((p) => p.proj_id === DEMO_PROJECT_ID)) return projects;
  return [DEMO_PROJECT, ...(projects || [])];
}

export default function ProjectsPage() {
  const setProject = useAppStore((s) => s.setProject);
  const { go } = useNavigation();
  const { getToken } = useAuth();
  const { user } = useUser();

  // Start pre-populated with the demo project (not an empty array) so it
  // renders immediately with no loading/error flash while the real
  // (currently unreachable) backend request resolves in the background.
  const [projects, setProjects] = useState([DEMO_PROJECT]);

  useEffect(() => {
    let cancelled = false;

    getDesignerProjects(getToken)
      .then((data) => {
        if (cancelled) return;
        setProjects(withDemoProject(data?.projects));
      })
      .catch(() => {
        // A real-backend failure never blocks the demo project — it just
        // means no *additional* real projects show up alongside it. Once
        // /designer/projects is real, surface this properly again.
      });

    return () => {
      cancelled = true;
    };
  }, [getToken]);

  return (
    <ProjectsScreen
      designer={{ user_firstName: user?.firstName, user_lastName: user?.lastName }}
      projects={projects}
      loading={false}
      error={null}
      onOpenProject={(project) => {
        setProject(project);
        go(`/projects/${project.proj_id ?? project.project_id ?? 0}`);
      }}
      onProfile={() => go('/profile')}
      onTab={() => {}}
    />
  );
}
