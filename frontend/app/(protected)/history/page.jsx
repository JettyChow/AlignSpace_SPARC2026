'use client';

import { useNavigation } from '@/hooks/useNavigation';
import HistoryScreen from '@/screens/support/HistoryScreen';

export default function HistoryPage() {
  const { go, back } = useNavigation();

  return (
    <HistoryScreen
      onBack={back}
      onOpen={() => go('/summary')}
    />
  );
}
