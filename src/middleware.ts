import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/signup(.*)',
  '/api/stripe/webhook',
  '/api/auth/webhook',
  '/',
  '/features',
  '/pricing',
  '/about',
  '/case-studies',
  '/faq',
]);

export default clerkMiddleware(async (auth, req) => {
  // Redirect authenticated users from root to dashboard
  if (req.nextUrl.pathname === '/') {
    const { userId } = await auth();
    if (userId) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return;
  }

  // Public routes pass through without auth check
  if (isPublicRoute(req)) {
    return;
  }

  // All other routes require authentication — auth.protect() handles the redirect
  await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
