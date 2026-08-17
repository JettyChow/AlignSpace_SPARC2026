'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import SummaryScreen from '@/screens/decide/SummaryScreen';

export default function SummaryPage() {
  const deliverable = useAppStore((s) => s.deliverable);
  const role = useAppStore((s) => s.role);
  const confirmed = useAppStore((s) => s.confirmed);
  const brief = useAppStore((s) => s.brief);
  const { go, back } = useNavigation();

  useEffect(() => {
    if (!deliverable) go('/discovery');
  }, [deliverable, go]);

  if (!deliverable) return null;

  return (
    <SummaryScreen
      deliverable={deliverable}
      roomType={deliverable?.room_type || brief?.room_type}
      role={role}
      confirmed={confirmed}
      onBack={back}
      onHandoff={() => go('/handoff')}
      onMenu={() => go('/history')}
    />
  );
}
