import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/signup(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/stripe/webhook',
  '/api/auth/webhook',
]);

/** Verify the impersonation cookie signature using Web Crypto (Edge-compatible). */
async function verifyImpersonationCookieEdge(value: string): Promise<boolean> {
  const secret = process.env.IMPERSONATION_SECRET;
  if (!secret || !value) return false;

  try {
    const lastDot = value.lastIndexOf('.');
    if (lastDot === -1) return false;

    const payloadPart = value.slice(0, lastDot);
    const sigHex = value.slice(lastDot + 1);

    if (sigHex.length === 0 || sigHex.length % 2 !== 0) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Hex → Uint8Array
    const sigBytes = new Uint8Array(sigHex.length / 2);
    for (let i = 0; i < sigHex.length; i += 2) {
      sigBytes[i / 2] = parseInt(sigHex.slice(i, i + 2), 16);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(payloadPart));
    if (!isValid) return false;

    // Check TTL (2 hours)
    const json = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { startedAt?: string };
    if (!payload.startedAt) return false;
    const age = Date.now() - new Date(payload.startedAt).getTime();
    return age < 2 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default clerkMiddleware(async (auth, req) => {
  // Public routes: pass through
  if (isPublicRoute(req)) {
    return;
  }

  // Protected routes: check auth and redirect to /login explicitly
  const { userId } = await auth();
  if (!userId) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Impersonation read-only enforcement:
  // Block all non-GET requests while an impersonation cookie is active.
  // The ONLY exception is the stop endpoint itself (which clears the cookie).
  if (req.method !== 'GET') {
    const cookieValue = req.cookies.get('cws_admin_impersonate')?.value;
    if (cookieValue) {
      const isStopRoute = req.nextUrl.pathname === '/api/admin/impersonate/stop';
      if (!isStopRoute) {
        const valid = await verifyImpersonationCookieEdge(cookieValue);
        if (valid) {
          return new NextResponse(
            JSON.stringify({
              success: false,
              error: 'Read-only mode: stop impersonating before making changes.',
              statusCode: 403,
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
