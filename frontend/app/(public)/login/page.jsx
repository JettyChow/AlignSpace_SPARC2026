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
  // Email-code second factor — entered when signIn.create() comes back with
  // status 'needs_second_factor' and Clerk's only supported second factor
  // for this account is 'email_code' (confirmed via the sign_in_attempt
  // response; this app doesn't support TOTP/SMS/backup codes).
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false);
  const [secondFactorEmail, setSecondFactorEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
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
      } else if (result.status === 'needs_second_factor') {
        const emailFactor = result.supportedSecondFactors?.find((f) => f.strategy === 'email_code');
        if (!emailFactor) {
          setError('This account requires a verification step that isn’t supported here yet.');
        } else {
          await signIn.prepareSecondFactor({ strategy: 'email_code', emailAddressId: emailFactor.emailAddressId });
          setSecondFactorEmail(emailFactor.safeIdentifier || email);
          setNeedsSecondFactor(true);
        }
      } else {
        // TEMPORARY DIAGNOSTIC — remove once the production non-complete
        // status is identified. Logs only status enums, never credentials,
        // tokens, or session identifiers.
        console.error('[login] signIn.create() did not complete', {
          status: result.status,
          firstFactorVerificationStatus: result.firstFactorVerification?.status,
          secondFactorVerificationStatus: result.secondFactorVerification?.status,
          supportedFirstFactors: result.supportedFirstFactors?.map((f) => f.strategy),
        });
        setError(`Could not complete login (status: ${result.status}).`);
      }
    } catch (err) {
      setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifySecondFactor(code) {
    if (!isLoaded || verifying) return;
    setVerifyError(null);

    if (!code || !code.trim()) {
      setVerifyError('Enter your verification code.');
      return;
    }

    setVerifying(true);
    try {
      const result = await signIn.attemptSecondFactor({ strategy: 'email_code', code: code.trim() });
      if (result.status === 'complete') {
        justLoggedIn.current = true;
        await setActive({ session: result.createdSessionId });
        // Navigation happens in the effect above, same as the primary flow.
      } else {
        setVerifyError('That code did not work. Please try again.');
      }
    } catch (err) {
      setVerifyError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Could not verify that code.');
    } finally {
      setVerifying(false);
    }
  }

  function handleCancelSecondFactor() {
    setNeedsSecondFactor(false);
    setSecondFactorEmail('');
    setVerifyError(null);
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
      needsSecondFactor={needsSecondFactor}
      secondFactorEmail={secondFactorEmail}
      onVerifySecondFactor={handleVerifySecondFactor}
      onCancelSecondFactor={handleCancelSecondFactor}
      verifying={verifying}
      verifyError={verifyError}
    />
  );
}
