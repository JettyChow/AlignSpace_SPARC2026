'use client';

import { useNavigation } from '@/hooks/useNavigation';
import ProfileScreen from '@/screens/support/ProfileScreen';

export default function ProfilePage() {
  const { back } = useNavigation();
  return <ProfileScreen onBack={back} />;
}
