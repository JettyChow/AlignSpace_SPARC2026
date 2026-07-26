'use client';

import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import LoginScreen from '@/screens/auth/LoginScreen';

export default function LoginPage() {
  const role = useAppStore((s) => s.role);
  const { go, back } = useNavigation();

  return (
    <LoginScreen
      role={role}
      onBack={back}
      onLogin={() => go(role === 'designer' ? '/projects' : '/entry')}
      onSignup={() => go('/signup')}
    />
  );
}
