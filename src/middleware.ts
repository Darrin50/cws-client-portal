import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/signup(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
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
  // Public routes: pass through (but redirect authed users from root)
  if (isPublicRoute(req)) {
    if (req.nextUrl.pathname === '/') {
      const { userId } = await auth();
      if (userId) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
    return;
  }

  // Protected routes: check auth and redirect to /login explicitly
  const { userId } = await auth();
  if (!userId) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
