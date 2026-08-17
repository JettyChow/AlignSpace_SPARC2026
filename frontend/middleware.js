import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Mirrors the app/(public) vs app/(protected) route-group split — Next route
// groups don't affect the URL, so the actual public paths are listed here by
// hand. Keep in sync with app/(public)/*.
const isPublicRoute = createRouteMatcher(['/', '/role', '/login(.*)', '/signup(.*)', '/forgot-password(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    // Without an explicit target, protect() sends signed-out visitors to
    // Clerk's hosted Account Portal instead of this app's own role/login
    // screens — send them there instead.
    await auth.protect({ unauthenticatedUrl: new URL('/role', req.url).toString() });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes.
    '/(api|trpc)(.*)',
  ],
};
