'use client';

import { useEffect, useState } from 'react';
import { useSignIn, useUser } from '@clerk/nextjs';
import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';

export default function ForgotPasswordPage() {
  const role = useAppStore((s) => s.role);
  const { go, back } = useNavigation();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, user } = useUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [codeSent, setCodeSent] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState(null);

  // Route once the session is actually active and the user record is
  // available, same as login/page.jsx — resetting a password successfully
  // signs the user in.
  useEffect(() => {
    if (!isSignedIn || !user) return;
    const accountRole = user.unsafeMetadata?.role || role;
    go(accountRole === 'designer' ? '/projects' : '/entry');
  }, [isSignedIn, user, role, go]);

  async function handleSendCode(email) {
    if (!isLoaded) return;
    setError(null);

    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await signIn.create({ strategy: 'reset_password_email_code', identifier: email });
      setCodeSent(true);
    } catch (err) {
      setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Could not send a reset code to that email.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset({ code, newPw, confirmPw }) {
    if (!isLoaded) return;
    setResetError(null);

    if (!code.trim() || !newPw) {
      setResetError('Enter the code and a new password.');
      return;
    }
    if (newPw !== confirmPw) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetting(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPw,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // Navigation happens in the effect above once `user` reflects the
        // newly active session.
      } else {
        setResetError('Could not reset your password. Please try again.');
      }
    } catch (err) {
      setResetError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'That code did not work. Please try again.');
    } finally {
      setResetting(false);
    }
  }

  return (
    <ForgotPasswordScreen
      onBack={back}
      onLogin={() => go('/login')}
      onSendCode={handleSendCode}
      onReset={handleReset}
      loading={loading}
      error={error}
      codeSent={codeSent}
      resetting={resetting}
      resetError={resetError}
    />
  );
}
