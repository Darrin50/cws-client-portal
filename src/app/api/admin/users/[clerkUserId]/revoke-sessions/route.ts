/**
 * DELETE /api/admin/users/[clerkUserId]/revoke-sessions
 *
 * Force-revokes all active Clerk sessions for a given user.
 * Admin-only. Useful when a client account is compromised or access must be
 * immediately terminated — no need to wait for the 30-day JWT to expire.
 *
 * Clerk is the source of truth for sessions; there is no custom JWT layer
 * in this portal, so revoking via Clerk is sufficient and instant.
 */
import { NextRequest } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { requireAdmin } from '@/lib/auth';
import { jsonResponse, errorResponse, unauthorizedResponse } from '@/lib/api-helpers';
import { createAuditLog } from '@/lib/data/audit';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clerkUserId: string }> }
) {
  let adminId: string;
  try {
    adminId = await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const { clerkUserId } = await params;

  if (!clerkUserId) {
    return errorResponse('clerkUserId is required', 400);
  }

  try {
    const client = await clerkClient();

    // Fetch all sessions for the target user
    const { data: sessions } = await client.sessions.getSessionList({
      userId: clerkUserId,
      status: 'active',
    });

    // Revoke every active session
    await Promise.all(sessions.map((s) => client.sessions.revokeSession(s.id)));

    // Audit trail
    await createAuditLog({
      userId: adminId,
      action: 'sessions_revoked',
      resourceType: 'user',
      resourceId: clerkUserId,
      changes: { revokedCount: sessions.length },
    }).catch(() => {
      // Non-fatal — don't fail the request if audit logging fails
    });

    return jsonResponse({ success: true, revokedCount: sessions.length });
  } catch (err) {
    console.error('DELETE /api/admin/users/[clerkUserId]/revoke-sessions error:', err);
    return errorResponse('Failed to revoke sessions', 500);
  }
}
