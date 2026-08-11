// Protected routes — all screens except /role and /login
//
// To add Clerk auth:
//   1. npm install @clerk/nextjs
//   2. Wrap RootLayout with <ClerkProvider> in app/layout.jsx
//   3. Uncomment the block below and add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to .env.local
//
// import { auth } from '@clerk/nextjs/server';
// import { redirect } from 'next/navigation';
//
// export default async function ProtectedLayout({ children }) {
//   const { userId } = await auth();
//   if (!userId) redirect('/role');
//   return children;
// }

export default function ProtectedLayout({ children }) {
  return children;
}
