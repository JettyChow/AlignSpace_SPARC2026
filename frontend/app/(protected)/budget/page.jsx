'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import BudgetScreen from '@/screens/decide/BudgetScreen';

export default function BudgetPage() {
  const deliverable = useAppStore((s) => s.deliverable);
  const { go, back } = useNavigation();

  useEffect(() => {
    if (!deliverable) go('/discovery');
  }, [deliverable, go]);

  if (!deliverable) return null;

  return (
    <BudgetScreen
      deliverable={deliverable}
      onBack={back}
      onContinue={() => go('/summary')}
      onMenu={() => go('/history')}
      onAdjustPackage={() => go('/package')}
    />
  );
}
