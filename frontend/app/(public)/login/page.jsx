'use client';

import { useEffect, useRef, useState } from 'react';
import { useSignIn, useUser, useClerk } from '@clerk/nextjs';
import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import LoginScreen from '@/screens/auth/LoginScreen';

export default function LoginPage() {
  const role = useAppStore((s) => s.role);
  const { go, back } = useNavigation();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Only route automatically once *this* screen just completed a login —
  // an already-active Clerk session from a previous visit should not skip
  // the login page when the user lands here intentionally (e.g. via the
  // role-select screen).
  const justLoggedIn = useRef(false);

  // Route once the session is actually active and the user record is
  // available — role comes from the account (unsafeMetadata), falling back
  // to the locally-chosen role for accounts created before that was tracked.
  useEffect(() => {
    if (!justLoggedIn.current || !isSignedIn || !user) return;
    const accountRole = user.unsafeMetadata?.role || role;
    go(accountRole === 'designer' ? '/projects' : '/entry');
  }, [isSignedIn, user, role, go]);

  // Reconcile a still-active Clerk session against the role just picked on
  // /role. Clerk only allows one active session per browser, so a stale
  // session left over from a previous login (e.g. Client) collides with a
  // fresh signIn.create() call here and Clerk rejects it with "already
  // signed in". Two cases:
  //  - the active session already IS the selected role → skip the form,
  //    route straight to that role's home.
  //  - it's a different (or unrecorded) role → end it first via signOut(),
  //    gating `loading` for the duration so a submit can't race it and hit
  //    the same "already signed in" error again.
  // Bails immediately once isSignedIn flips (after signOut resolves, or
  // once the redirect above fires), so this can't loop.
  useEffect(() => {
    if (!userLoaded || !isSignedIn || !user) return;
    const accountRole = user.unsafeMetadata?.role;
    if (accountRole === role) {
      go(role === 'designer' ? '/projects' : '/entry');
      return;
    }
    setLoading(true);
    signOut().finally(() => setLoading(false));
  }, [userLoaded, isSignedIn, user, role, go, signOut]);

  async function handleLogin({ email, pw }) {
    if (!isLoaded || loading) return;
    setError(null);

    if (!email.trim() || !pw) {
      setError('Enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password: pw });
      if (result.status === 'complete') {
        justLoggedIn.current = true;
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
