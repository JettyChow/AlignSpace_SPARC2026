// Small helpers shared by screens that render placeholder data shaped like
// the DBML schema (see as-ai-server/src/migrations + app/models.py) — kept
// here instead of duplicated per-screen since a few designer/support screens
// all need to turn a USERS-shaped object into a display name.

// USERS.user_firstName / user_lastName -> a display name. Works with a
// partial/null user (e.g. before a real fetch has populated it).
export function fullName(user) {
  if (!user) return null;
  const name = [user.user_firstName, user.user_lastName].filter(Boolean).join(' ');
  return name || null;
}
