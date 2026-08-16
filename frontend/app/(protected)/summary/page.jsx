'use client';

import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import SummaryScreen from '@/screens/decide/SummaryScreen';

export default function SummaryPage() {
  const role = useAppStore((s) => s.role);
  const confirmed = useAppStore((s) => s.confirmed);
  const { go, back } = useNavigation();

  return (
    <SummaryScreen
      role={role}
      confirmed={confirmed}
      onBack={back}
      onHandoff={() => go('/handoff')}
      onMenu={() => go('/history')}
    />
  );
}
