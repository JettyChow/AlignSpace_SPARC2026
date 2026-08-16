'use client';

import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import SignupScreen from '@/screens/auth/SignupScreen';

export default function SignupPage() {
  const role = useAppStore((s) => s.role);
  const { go, back } = useNavigation();
  const { isLoaded, signUp, setActive } = useSignUp();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

  async function handleSignup({ fullName, email, pw, confirmPw }) {
    if (!isLoaded) return;
    setError(null);

    if (!fullName.trim() || !email.trim() || !pw) {
      setError('Fill in your name, email, and password.');
      return;
    }
    if (pw !== confirmPw) {
      setError('Passwords do not match.');
      return;
    }

    const [firstName, ...rest] = fullName.trim().split(/\s+/);
    const lastName = rest.join(' ') || undefined;

    setLoading(true);
    try {
      const result = await signUp.create({
        emailAddress: email,
        password: pw,
        firstName,
        lastName,
        unsafeMetadata: { role },
      });

      if (result.status === 'complete') {
        // Account created and Clerk already finalized a session for it —
        // activate it client-side and route straight in, rather than
        // sending the user to /login where signIn.create() would just
        // reject with "already signed in".
        await setActive({ session: result.createdSessionId });
        go(role === 'designer' ? '/projects' : '/entry');
        return;
      }

      // Most Clerk instances require email verification before the account
      // is usable — send the code and show the verify step.
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(code) {
    if (!isLoaded || !code) return;
    setVerifyError(null);
    setVerifying(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        go(role === 'designer' ? '/projects' : '/entry');
      } else {
        setVerifyError('That code did not work. Please try again.');
      }
    } catch (err) {
      setVerifyError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Could not verify that code.');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <SignupScreen
      role={role}
      onBack={back}
      onLogin={() => go('/login')}
      onSignup={handleSignup}
      onGoogle={() => {}}
      onApple={() => {}}
      loading={loading}
      error={error}
      pendingVerification={pendingVerification}
      onVerify={handleVerify}
      verifying={verifying}
      verifyError={verifyError}
    />
  );
}
