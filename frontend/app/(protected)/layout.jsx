// Protected routes — all screens except /role, /login, /signup.
// middleware.js already redirects signed-out visitors before a request gets
// this far; this guard is the belt-and-suspenders server-side check.

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect('/role');
  return children;
}
