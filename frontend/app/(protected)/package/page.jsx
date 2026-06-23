'use client';

import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import PackageScreen from '@/screens/explore/PackageScreen';

export default function PackagePage() {
  const confirmed = useAppStore((s) => s.confirmed);
  const toggleConfirmed = useAppStore((s) => s.toggleConfirmed);
  const { go, back } = useNavigation();

  return (
    <PackageScreen
      confirmed={confirmed}
      onConfirm={toggleConfirmed}
      onBack={back}
      onContinue={() => go('/ffe')}
      onMenu={() => go('/saved')}
    />
  );
}
