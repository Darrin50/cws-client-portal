import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { adminAuditLogTable } from '@/db/schema';
import { getImpersonationPayloadFromRequest, COOKIE_NAME } from '@/lib/impersonation';
import { errorResponse } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return errorResponse('Unauthorized', 401);

    // Read current impersonation state before clearing
    const payload = getImpersonationPayloadFromRequest(request.cookies);

    // Write audit log (even if cookie was expired/invalid, still clear it)
    if (payload) {
      await db.insert(adminAuditLogTable).values({
        adminClerkUserId: payload.adminUserId,
        action: 'impersonate_stop',
        targetOrgId: payload.targetOrgId,
        details: { startedAt: payload.startedAt },
      });
    }

    const response = NextResponse.json({ success: true });
    // Clear the cookie
    response.cookies.set(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('[POST /api/admin/impersonate/stop] error:', err);
    return errorResponse('Internal server error', 500);
  }
}
