'use client';

import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import MaterialsScreen from '@/screens/designer/MaterialsScreen';

export default function ProjectDetailPage() {
  const project = useAppStore((s) => s.project);
  const { go, back } = useNavigation();

  return (
    <MaterialsScreen
      project={project}
      onBack={back}
      onProfile={() => go('/profile')}
      onTab={() => {}}
    />
  );
}
