'use client';

import { useEffect, useState } from 'react';
import { useSignIn, useUser } from '@clerk/nextjs';
import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import LoginScreen from '@/screens/auth/LoginScreen';

export default function LoginPage() {
  const role = useAppStore((s) => s.role);
  const { go, back } = useNavigation();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, user } = useUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Route once the session is actually active and the user record is
  // available — role comes from the account (unsafeMetadata), falling back
  // to the locally-chosen role for accounts created before that was tracked.
  useEffect(() => {
    if (!isSignedIn || !user) return;
    const accountRole = user.unsafeMetadata?.role || role;
    go(accountRole === 'designer' ? '/projects' : '/entry');
  }, [isSignedIn, user, role, go]);

  async function handleLogin({ email, pw }) {
    if (!isLoaded) return;
    setError(null);

    if (!email.trim() || !pw) {
      setError('Enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password: pw });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // Navigation happens in the effect above once `user` reflects the
        // newly active session.
      } else {
        setError('Could not complete login. Please try again.');
      }
    } catch (err) {
      setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginScreen
      role={role}
      onBack={back}
      onLogin={handleLogin}
      onSignup={() => go('/signup')}
      onForgotPassword={() => go('/forgot-password')}
      loading={loading}
      error={error}
    />
  );
}
