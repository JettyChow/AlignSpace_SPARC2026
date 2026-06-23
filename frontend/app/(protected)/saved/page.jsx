'use client';

import { useNavigation } from '@/hooks/useNavigation';
import SavedScreen from '@/screens/support/SavedScreen';

export default function SavedPage() {
  const { back } = useNavigation();
  return <SavedScreen onBack={back} />;
}
