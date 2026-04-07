import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { pagesTable, usersTable, organizationMembersTable, organizationsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-helpers';

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
  const dbUser = userRows[0];
  if (!dbUser) return null;

  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, dbUser.id))
    .limit(1);
  if (!memberRows[0]) return null;

  const orgRows = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

async function captureWithScreenshotOne(url: string): Promise<string> {
  const apiKey =
    process.env.SCREENSHOTONE_API_KEY ?? process.env.SCREENSHOT_ONE_API_KEY ?? '';

  if (!apiKey) {
    throw new Error('SCREENSHOTONE_API_KEY is not configured');
  }

  const params = new URLSearchParams({
    access_key: apiKey,
    url,
    viewport_width: '1280',
    viewport_height: '800',
    format: 'jpg',
    image_quality: '90',
    full_page: 'false',
    delay: '2',
    block_ads: 'true',
    block_cookie_banners: 'true',
  });

  const apiUrl = `https://api.screenshotone.com/take?${params.toString()}`;

  const res = await fetch(apiUrl);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ScreenshotOne API error ${res.status}: ${text}`);
  }

  // Get image as buffer and upload to Vercel Blob
  const imageBuffer = await res.arrayBuffer();
  const { put } = await import('@vercel/blob');

  const timestamp = Date.now();
  const blob = await put(`screenshots/${timestamp}.jpg`, imageBuffer, {
    access: 'public',
    contentType: 'image/jpeg',
    addRandomSuffix: true,
  });

  return blob.url;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId, sessionClaims } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    // Must be admin or belong to the org that owns the page
    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    const isAdmin = role === 'admin';

    const { pageId } = await params;

    // Fetch the page
    const pageRows = await db
      .select()
      .from(pagesTable)
      .where(eq(pagesTable.id, pageId))
      .limit(1);

    if (!pageRows[0]) return notFoundResponse();
    const page = pageRows[0];

    // Verify access: admin can access any page; clients must belong to the org
    if (!isAdmin) {
      const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
      if (!org || org.id !== page.organizationId) return forbiddenResponse();
    }

    const targetUrl = page.fullUrl ?? page.urlPath;
    if (!targetUrl) {
      return errorResponse('Page has no URL configured', 400);
    }

    const screenshotUrl = await captureWithScreenshotOne(targetUrl);
    const capturedAt = new Date();

    await db
      .update(pagesTable)
      .set({
        screenshotUrl,
        screenshotTakenAt: capturedAt,
        updatedAt: capturedAt,
      })
      .where(eq(pagesTable.id, pageId));

    return jsonResponse({ screenshotUrl, capturedAt: capturedAt.toISOString() });
  } catch (err) {
    console.error('POST /api/pages/[pageId]/screenshot error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return errorResponse(message, 500);
  }
}
