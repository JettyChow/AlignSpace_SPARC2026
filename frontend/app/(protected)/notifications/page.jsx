'use client';

import { useNavigation } from '@/hooks/useNavigation';
import NotificationsScreen from '@/screens/support/NotificationsScreen';

export default function NotificationsPage() {
  const { back } = useNavigation();
  return <NotificationsScreen onBack={back} />;
}
