'use client';

import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import FFEScreen from '@/screens/decide/FFEScreen';

export default function FFEPage() {
  const confirmed = useAppStore((s) => s.confirmed);
  const { go, back } = useNavigation();

  return (
    <FFEScreen
      confirmed={confirmed}
      onBack={back}
      onContinue={() => go('/budget')}
      onMenu={() => go('/history')}
    />
  );
}
