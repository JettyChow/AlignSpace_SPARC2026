'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import FFEScreen from '@/screens/decide/FFEScreen';

export default function FFEPage() {
  const deliverable = useAppStore((s) => s.deliverable);
  const confirmed = useAppStore((s) => s.confirmed);
  const { go, back } = useNavigation();

  useEffect(() => {
    if (!deliverable) go('/discovery');
  }, [deliverable, go]);

  if (!deliverable) return null;

  return (
    <FFEScreen
      deliverable={deliverable}
      confirmed={confirmed}
      onBack={back}
      onContinue={() => go('/budget')}
      onMenu={() => go('/history')}
    />
  );
}
