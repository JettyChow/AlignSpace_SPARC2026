'use client';

import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import FocusScreen from '@/screens/explore/FocusScreen';

export default function FocusPage() {
  const deliverable = useAppStore((s) => s.deliverable);
  const { go, back } = useNavigation();

  return (
    <FocusScreen
      deliverable={deliverable}
      onBack={back}
      onContinue={() => go('/package')}
      onMenu={() => go('/history')}
    />
  );
}
