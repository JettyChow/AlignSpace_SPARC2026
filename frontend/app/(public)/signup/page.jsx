'use client';

import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import SignupScreen from '@/screens/auth/SignupScreen';

export default function SignupPage() {
  const role = useAppStore((s) => s.role);
  const { go, back } = useNavigation();

  return (
    <SignupScreen
      role={role}
      onBack={back}
      onLogin={() => go('/login')}
      onSignup={() => go(role === 'designer' ? '/projects' : '/entry')}
      onGoogle={() => go(role === 'designer' ? '/projects' : '/entry')}
      onApple={() => go(role === 'designer' ? '/projects' : '/entry')}
    />
  );
}
