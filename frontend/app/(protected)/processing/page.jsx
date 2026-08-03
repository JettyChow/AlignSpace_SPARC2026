'use client';

import { useNavigation } from '@/hooks/useNavigation';
import ProcessingScreen from '@/screens/flow/ProcessingScreen';

export default function ProcessingPage() {
  const { go } = useNavigation();

  return (
    <ProcessingScreen
      onDone={() => go('/discovery')}
    />
  );
}
