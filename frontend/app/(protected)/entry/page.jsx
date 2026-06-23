'use client';

import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import EntryScreen from '@/screens/flow/EntryScreen';

export default function EntryPage() {
  const role = useAppStore((s) => s.role);
  const { go } = useNavigation();

  return (
    <EntryScreen
      role={role}
      onNew={() => go('/intake')}
      onContinue={() => go('/ffe')}
      onSupport={(screen) => go(`/${screen}`)}
    />
  );
}
