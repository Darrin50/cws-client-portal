import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { organizationsTable, usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const WeeklyFocusSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  status: z.enum(['in_progress', 'starting_soon', 'completed']),
});

async function requireAdmin(): Promise<boolean> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role;
  if (role === 'admin') return true;
  // Fallback: check DB role
  const rows = await db
    .select({ role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, userId))
    .limit(1);
  return rows[0]?.role === 'admin';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rows = await db
      .select({ weeklyFocus: organizationsTable.weeklyFocus, lastBriefingSentAt: organizationsTable.lastBriefingSentAt })
      .from(organizationsTable)
      .where(eq(organizationsTable.id, params.orgId))
      .limit(1);

    if (!rows[0]) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error('GET weekly-focus error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body: unknown = await request.json();
    const parsed = WeeklyFocusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Validation failed' },
        { status: 400 }
      );
    }

    const focus = { ...parsed.data, updatedAt: new Date().toISOString() };

    await db
      .update(organizationsTable)
      .set({ weeklyFocus: focus, updatedAt: new Date() })
      .where(eq(organizationsTable.id, params.orgId));

    return NextResponse.json({ data: focus });
  } catch (err) {
    console.error('PUT weekly-focus error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db
      .update(organizationsTable)
      .set({ weeklyFocus: null, updatedAt: new Date() })
      .where(eq(organizationsTable.id, params.orgId));

    return NextResponse.json({ data: null });
  } catch (err) {
    console.error('DELETE weekly-focus error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
