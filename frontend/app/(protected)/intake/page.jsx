'use client';

import { useNavigation } from '@/hooks/useNavigation';
import IntakeScreen from '@/screens/flow/IntakeScreen';

export default function IntakePage() {
  const { go, back } = useNavigation();

  return (
    <IntakeScreen
      onBack={back}
      onComplete={() => go('/processing')}
    />
  );
}
