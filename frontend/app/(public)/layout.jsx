// Public routes: /role, /login — no auth guard
// To restrict these once authenticated (e.g. redirect to /entry),
// add a Clerk `auth()` check here.
export default function PublicLayout({ children }) {
  return children;
}
