import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { revenueSettingsTable, organizationsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-helpers';

function isAdmin(sessionClaims: Record<string, unknown> | null) {
  return (sessionClaims?.metadata as { role?: string } | undefined)?.role === 'admin';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return unauthorizedResponse();
    if (!isAdmin(sessionClaims as Record<string, unknown> | null)) return forbiddenResponse();

    const { orgId } = await params;

    // Verify org exists
    const orgRows = await db
      .select({ id: organizationsTable.id, name: organizationsTable.name, planTier: organizationsTable.planTier })
      .from(organizationsTable)
      .where(eq(organizationsTable.id, orgId))
      .limit(1);
    if (!orgRows[0]) return errorResponse('Organization not found', 404);

    const settingsRows = await db
      .select()
      .from(revenueSettingsTable)
      .where(eq(revenueSettingsTable.organizationId, orgId))
      .limit(1);

    const settings = settingsRows[0] ?? {
      id: null,
      organizationId: orgId,
      averageDealValue: '5000',
      closeRate: 0.25,
      leadToCallRate: 0.4,
      revenueGoal: null,
      currency: 'USD',
      createdAt: null,
      updatedAt: null,
    };

    return jsonResponse({
      org: orgRows[0],
      settings: {
        ...settings,
        averageDealValue: parseFloat(String(settings.averageDealValue)),
        revenueGoal: settings.revenueGoal ? parseFloat(String(settings.revenueGoal)) : null,
      },
    });
  } catch (err) {
    console.error('GET /api/admin/revenue-settings/[orgId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return unauthorizedResponse();
    if (!isAdmin(sessionClaims as Record<string, unknown> | null)) return forbiddenResponse();

    const { orgId } = await params;

    const body = (await request.json()) as {
      averageDealValue?: number;
      closeRate?: number;
      leadToCallRate?: number;
      revenueGoal?: number | null;
      currency?: string;
    };

    const { averageDealValue, closeRate, leadToCallRate, revenueGoal, currency } = body;

    // Validate
    if (averageDealValue !== undefined && (isNaN(averageDealValue) || averageDealValue < 0)) {
      return errorResponse('Invalid averageDealValue');
    }
    if (closeRate !== undefined && (isNaN(closeRate) || closeRate < 0 || closeRate > 1)) {
      return errorResponse('closeRate must be between 0 and 1');
    }
    if (leadToCallRate !== undefined && (isNaN(leadToCallRate) || leadToCallRate < 0 || leadToCallRate > 1)) {
      return errorResponse('leadToCallRate must be between 0 and 1');
    }

    // Upsert
    const existing = await db
      .select({ id: revenueSettingsTable.id })
      .from(revenueSettingsTable)
      .where(eq(revenueSettingsTable.organizationId, orgId))
      .limit(1);

    if (existing[0]) {
      await db
        .update(revenueSettingsTable)
        .set({
          ...(averageDealValue !== undefined && { averageDealValue: String(averageDealValue) }),
          ...(closeRate !== undefined && { closeRate }),
          ...(leadToCallRate !== undefined && { leadToCallRate }),
          ...(revenueGoal !== undefined && { revenueGoal: revenueGoal !== null ? String(revenueGoal) : null }),
          ...(currency !== undefined && { currency }),
          updatedAt: new Date(),
        })
        .where(eq(revenueSettingsTable.id, existing[0].id));
    } else {
      await db.insert(revenueSettingsTable).values({
        organizationId: orgId,
        averageDealValue: averageDealValue !== undefined ? String(averageDealValue) : '5000',
        closeRate: closeRate ?? 0.25,
        leadToCallRate: leadToCallRate ?? 0.4,
        revenueGoal: revenueGoal !== undefined && revenueGoal !== null ? String(revenueGoal) : null,
        currency: currency ?? 'USD',
      });
    }

    return jsonResponse({ success: true });
  } catch (err) {
    console.error('PUT /api/admin/revenue-settings/[orgId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}
