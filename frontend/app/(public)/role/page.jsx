'use client';

import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import RoleSelectScreen from '@/screens/auth/RoleSelectScreen';

export default function RolePage() {
  const setRole = useAppStore((s) => s.setRole);
  const { go } = useNavigation();

  return (
    <RoleSelectScreen
      onSelect={(role) => {
        setRole(role);
        go('/login');
      }}
    />
  );
}
