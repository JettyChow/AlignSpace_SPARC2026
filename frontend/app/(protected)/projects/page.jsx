'use client';

import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import ProjectsScreen from '@/screens/designer/ProjectsScreen';

export default function ProjectsPage() {
  const setProject = useAppStore((s) => s.setProject);
  const { go } = useNavigation();

  return (
    <ProjectsScreen
      onOpenProject={(project) => {
        setProject(project);
        go('/projects/0');
      }}
      onProfile={() => go('/profile')}
      onTab={() => {}}
    />
  );
}
