import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { organizationsTable, usersTable, adminAuditLogTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createImpersonationCookie, COOKIE_NAME } from '@/lib/impersonation';
import { errorResponse } from '@/lib/api-helpers';

async function requireAdmin(): Promise<{ ok: boolean; clerkUserId: string | null }> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return { ok: false, clerkUserId: null };

  const role = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role;
  if (role === 'admin') return { ok: true, clerkUserId: userId };

  const rows = await db
    .select({ role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, userId))
    .limit(1);
  return { ok: rows[0]?.role === 'admin', clerkUserId: userId };
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { ok, clerkUserId } = await requireAdmin();
    if (!ok) return errorResponse('Forbidden', 403);

    // Verify the target org exists
    const [org] = await db
      .select({ id: organizationsTable.id, name: organizationsTable.name })
      .from(organizationsTable)
      .where(eq(organizationsTable.id, orgId))
      .limit(1);

    if (!org) return errorResponse('Organization not found', 404);

    // Create signed cookie
    const cookieValue = createImpersonationCookie(clerkUserId!, org.id);

    // Write audit log
    await db.insert(adminAuditLogTable).values({
      adminClerkUserId: clerkUserId!,
      action: 'impersonate_start',
      targetOrgId: org.id,
      details: { orgName: org.name },
    });

    const response = NextResponse.json({ success: true, orgName: org.name });
    response.cookies.set(COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2, // 2 hours
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('[POST /api/admin/impersonate/[orgId]] error:', err);
    return errorResponse('Internal server error', 500);
  }
}
