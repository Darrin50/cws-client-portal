import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { clientNotesTable, usersTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-helpers';

function isAdmin(sessionClaims: Record<string, unknown> | null) {
  return (sessionClaims?.metadata as { role?: string } | undefined)?.role === 'admin';
}

// PATCH /api/admin/clients/[orgId]/notes/[noteId] — update body or pinned
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; noteId: string }> },
) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return unauthorizedResponse();
    if (!isAdmin(sessionClaims as Record<string, unknown> | null)) return forbiddenResponse();

    const { orgId, noteId } = await params;

    // Resolve internal user
    const authorRows = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, userId))
      .limit(1);
    if (!authorRows[0]) return errorResponse('User not found', 404);

    // Only allow editing own notes
    const noteRows = await db
      .select({ id: clientNotesTable.id, authorUserId: clientNotesTable.authorUserId })
      .from(clientNotesTable)
      .where(and(eq(clientNotesTable.id, noteId), eq(clientNotesTable.orgId, orgId)))
      .limit(1);
    if (!noteRows[0]) return errorResponse('Note not found', 404);
    if (noteRows[0].authorUserId !== authorRows[0].id) return forbiddenResponse();

    const body = (await request.json()) as { body?: string; pinned?: boolean };
    const updates: Partial<{ body: string; pinned: boolean; updatedAt: Date }> = {
      updatedAt: new Date(),
    };
    if (body.body !== undefined) {
      const trimmed = body.body.trim();
      if (!trimmed) return errorResponse('Note body cannot be empty');
      updates.body = trimmed;
    }
    if (body.pinned !== undefined) {
      updates.pinned = body.pinned;
    }

    const [updated] = await db
      .update(clientNotesTable)
      .set(updates)
      .where(eq(clientNotesTable.id, noteId))
      .returning();

    return jsonResponse({ note: updated });
  } catch (err) {
    console.error('PATCH /api/admin/clients/[orgId]/notes/[noteId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE /api/admin/clients/[orgId]/notes/[noteId]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string; noteId: string }> },
) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return unauthorizedResponse();
    if (!isAdmin(sessionClaims as Record<string, unknown> | null)) return forbiddenResponse();

    const { orgId, noteId } = await params;

    // Resolve internal user
    const authorRows = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, userId))
      .limit(1);
    if (!authorRows[0]) return errorResponse('User not found', 404);

    // Only allow deleting own notes
    const noteRows = await db
      .select({ id: clientNotesTable.id, authorUserId: clientNotesTable.authorUserId })
      .from(clientNotesTable)
      .where(and(eq(clientNotesTable.id, noteId), eq(clientNotesTable.orgId, orgId)))
      .limit(1);
    if (!noteRows[0]) return errorResponse('Note not found', 404);
    if (noteRows[0].authorUserId !== authorRows[0].id) return forbiddenResponse();

    await db.delete(clientNotesTable).where(eq(clientNotesTable.id, noteId));

    return jsonResponse({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/admin/clients/[orgId]/notes/[noteId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}
