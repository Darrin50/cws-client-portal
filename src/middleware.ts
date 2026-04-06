import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/login',
  '/signup',
  '/api/stripe/webhook',
  '/api/auth/webhook',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth();

  // Protect admin routes - require authentication
  if (isAdminRoute(req)) {
    if (!userId) {
      return auth().redirectToSignIn();
    }
  }

  // Public routes can be accessed without auth
  if (isPublicRoute(req)) {
    return;
  }

  // Protect all other routes - require authentication
  if (!userId) {
    return auth().redirectToSignIn();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
