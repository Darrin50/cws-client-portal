import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { clientNotesTable, usersTable, organizationsTable } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-helpers';

async function requireAdmin(userId: string, sessionClaims: Record<string, unknown> | null): Promise<boolean> {
  const claimsRole = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (claimsRole === 'admin') return true;
  // Fallback: check DB (covers users whose Clerk metadata isn't set yet)
  const rows = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.clerkUserId, userId)).limit(1);
  return rows[0]?.role === 'admin';
}

// GET /api/admin/clients/[orgId]/notes — list notes for an org
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return unauthorizedResponse();
    if (!await requireAdmin(userId, sessionClaims as Record<string, unknown> | null)) return forbiddenResponse();

    const { orgId } = await params;

    const notes = await db
      .select({
        id: clientNotesTable.id,
        orgId: clientNotesTable.orgId,
        authorUserId: clientNotesTable.authorUserId,
        body: clientNotesTable.body,
        pinned: clientNotesTable.pinned,
        createdAt: clientNotesTable.createdAt,
        updatedAt: clientNotesTable.updatedAt,
        authorFirstName: usersTable.firstName,
        authorLastName: usersTable.lastName,
        authorAvatarUrl: usersTable.avatarUrl,
      })
      .from(clientNotesTable)
      .leftJoin(usersTable, eq(clientNotesTable.authorUserId, usersTable.id))
      .where(eq(clientNotesTable.orgId, orgId))
      .orderBy(desc(clientNotesTable.pinned), desc(clientNotesTable.createdAt));

    return jsonResponse({ notes });
  } catch (err) {
    console.error('GET /api/admin/clients/[orgId]/notes error:', err);
    return errorResponse('Internal server error', 500);
  }
}

// POST /api/admin/clients/[orgId]/notes — create a note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return unauthorizedResponse();
    if (!await requireAdmin(userId, sessionClaims as Record<string, unknown> | null)) return forbiddenResponse();

    const { orgId } = await params;

    // Verify org exists
    const orgRows = await db
      .select({ id: organizationsTable.id })
      .from(organizationsTable)
      .where(eq(organizationsTable.id, orgId))
      .limit(1);
    if (!orgRows[0]) return errorResponse('Organization not found', 404);

    // Resolve the internal user id from clerkUserId
    const authorRows = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, userId))
      .limit(1);
    if (!authorRows[0]) return errorResponse('Author user not found', 404);

    const body = (await request.json()) as { body?: string; pinned?: boolean };
    const noteBody = body.body?.trim();
    if (!noteBody) return errorResponse('Note body is required');

    const [note] = await db
      .insert(clientNotesTable)
      .values({
        orgId,
        authorUserId: authorRows[0].id,
        body: noteBody,
        pinned: body.pinned ?? false,
      })
      .returning();

    return jsonResponse({ note }, 201);
  } catch (err) {
    console.error('POST /api/admin/clients/[orgId]/notes error:', err);
    return errorResponse('Internal server error', 500);
  }
}
