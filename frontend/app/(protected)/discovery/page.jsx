'use client';

import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import DiscoveryScreen from '@/screens/explore/DiscoveryScreen';

export default function DiscoveryPage() {
  const selected = useAppStore((s) => s.selected);
  const setSelected = useAppStore((s) => s.setSelected);
  const { go, back } = useNavigation();

  return (
    <DiscoveryScreen
      selected={selected}
      setSelected={setSelected}
      onBack={back}
      onSelect={() => go('/focus')}
      onMenu={() => go('/history')}
    />
  );
}
