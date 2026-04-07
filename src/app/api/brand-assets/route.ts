import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { rateLimit, getIp } from '@/lib/rate-limit';
import {
  organizationsTable,
  brandAssetsTable,
  usersTable,
  organizationMembersTable,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  validateRequest,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-helpers';

const VALID_ASSET_TYPES = [
  'primary_logo',
  'secondary_logo',
  'icon',
  'favicon',
  'color',
  'font',
  'guidelines',
  'photo',
] as const;

const CreateAssetSchema = z.object({
  name: z.string().min(1),
  assetType: z.enum(VALID_ASSET_TYPES),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().int().optional(),
  mimeType: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/** Resolve DB org from Clerk auth. */
async function resolveOrg(clerkUserId: string, clerkOrgId: string | null) {
  if (clerkOrgId) {
    const rows = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
      .limit(1);
    if (rows[0]) return rows[0];
  }

  const userRows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  const dbUserId = userRows[0]?.id;
  if (!dbUserId) return null;

  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, dbUserId))
    .limit(1);
  if (!memberRows[0]) return null;

  const orgRows = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const assetType = searchParams.get('assetType') ?? searchParams.get('type');

    const conditions = [eq(brandAssetsTable.organizationId, org.id)];
    if (assetType && VALID_ASSET_TYPES.includes(assetType as (typeof VALID_ASSET_TYPES)[number])) {
      conditions.push(
        eq(brandAssetsTable.assetType, assetType as (typeof VALID_ASSET_TYPES)[number]),
      );
    }

    const assets = await db
      .select()
      .from(brandAssetsTable)
      .where(and(...conditions))
      .orderBy(brandAssetsTable.sortOrder);

    return jsonResponse({ assets, total: assets.length });
  } catch (err) {
    console.error('GET /api/brand-assets error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { success } = rateLimit(getIp(request));
    if (!success) return errorResponse('Too many requests', 429);

    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    const body = await request.json();
    const validation = validateRequest(CreateAssetSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error ?? 'Validation failed', 400);
    }

    const data = validation.data!;
    const inserted = await db
      .insert(brandAssetsTable)
      .values({
        organizationId: org.id,
        assetType: data.assetType,
        name: data.name,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        metadata: data.metadata as Record<string, unknown> | undefined,
      })
      .returning();

    return jsonResponse(inserted[0], 201);
  } catch (err) {
    console.error('POST /api/brand-assets error:', err);
    return errorResponse('Internal server error', 500);
  }
}

const UpdateAssetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const { success } = rateLimit(getIp(request));
    if (!success) return errorResponse('Too many requests', 429);

    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    const body = await request.json();
    const validation = validateRequest(UpdateAssetSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error ?? 'Validation failed', 400);
    }

    const data = validation.data!;

    const setFields: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) setFields.name = data.name;
    if (data.metadata !== undefined) setFields.metadata = data.metadata;

    const updated = await db
      .update(brandAssetsTable)
      .set(setFields)
      .where(
        and(
          eq(brandAssetsTable.id, data.id),
          eq(brandAssetsTable.organizationId, org.id),
        ),
      )
      .returning();

    if (updated.length === 0) return notFoundResponse();

    return jsonResponse(updated[0]);
  } catch (err) {
    console.error('PATCH /api/brand-assets error:', err);
    return errorResponse('Internal server error', 500);
  }
}
