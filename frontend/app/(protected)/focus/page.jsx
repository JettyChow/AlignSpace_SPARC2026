'use client';

import { useNavigation } from '@/hooks/useNavigation';
import FocusScreen from '@/screens/explore/FocusScreen';

export default function FocusPage() {
  const { go, back } = useNavigation();

  return (
    <FocusScreen
      onBack={back}
      onContinue={() => go('/package')}
      onMenu={() => go('/history')}
    />
  );
}
