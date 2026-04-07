import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

const isMarketingRoot = createRouteMatcher(['/']);

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

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const authObject = await auth();
  const { userId } = authObject;

  // Protect admin routes - require authentication
  if (isAdminRoute(req)) {
    if (!userId) {
      return authObject.redirectToSignIn();
    }
  }

  // Redirect authenticated users from marketing root to dashboard
  if (isMarketingRoot(req) && userId) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Public routes can be accessed without auth
  if (isPublicRoute(req)) {
    return;
  }

  // Protect all other routes - require authentication
  if (!userId) {
    return authObject.redirectToSignIn();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
