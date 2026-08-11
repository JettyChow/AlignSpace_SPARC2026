'use client';

import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import SummaryScreen from '@/screens/decide/SummaryScreen';

export default function SummaryPage() {
  const role = useAppStore((s) => s.role);
  const { go, back } = useNavigation();

  return (
    <SummaryScreen
      role={role}
      onBack={back}
      onHandoff={() => go('/handoff')}
      onMenu={() => go('/history')}
    />
  );
}
