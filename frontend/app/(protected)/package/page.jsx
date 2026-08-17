'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import PackageScreen from '@/screens/explore/PackageScreen';

export default function PackagePage() {
  const deliverable = useAppStore((s) => s.deliverable);
  const confirmed = useAppStore((s) => s.confirmed);
  const toggleConfirmed = useAppStore((s) => s.toggleConfirmed);
  const { go, back } = useNavigation();

  // No deliverable in the store means a direction hasn't been assembled yet
  // for this session (refresh, back-button, or direct nav).
  useEffect(() => {
    if (!deliverable) go('/discovery');
  }, [deliverable, go]);

  if (!deliverable) return null;

  return (
    <PackageScreen
      deliverable={deliverable}
      confirmed={confirmed}
      onConfirm={toggleConfirmed}
      onBack={back}
      onContinue={() => go('/ffe')}
      onMenu={() => go('/history')}
    />
  );
}
