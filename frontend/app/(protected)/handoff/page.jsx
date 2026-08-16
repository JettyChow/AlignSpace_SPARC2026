'use client';

import { useNavigation } from '@/hooks/useNavigation';
import HandoffScreen from '@/screens/decide/HandoffScreen';

export default function HandoffPage() {
  const { go } = useNavigation();

  return (
    <HandoffScreen
      onHome={() => go('/entry')}
      onMenu={() => go('/summary')}
    />
  );
}
