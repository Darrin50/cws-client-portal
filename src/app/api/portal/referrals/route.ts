import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
  referralsTable,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
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

/** GET /api/portal/referrals — list referrals for the current org */
export async function GET(_request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    const referrals = await db
      .select()
      .from(referralsTable)
      .where(eq(referralsTable.referrerOrgId, org.id))
      .orderBy(referralsTable.createdAt);

    // Ensure there is always a referral code row for this org (the "base" link row)
    // We use a deterministic code derived from org slug so it's stable.
    const baseCode = slugToCode(org.slug);
    const hasBaseCode = referrals.some((r) => r.referralCode === baseCode && !r.referredEmail);

    if (!hasBaseCode) {
      await db.insert(referralsTable).values({
        referrerOrgId: org.id,
        referralCode: baseCode,
        status: 'pending',
        rewardIssued: false,
      }).onConflictDoNothing();
    }

    const allReferrals = await db
      .select()
      .from(referralsTable)
      .where(eq(referralsTable.referrerOrgId, org.id))
      .orderBy(referralsTable.createdAt);

    const referralLink = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://cwsportal.com'}/signup?ref=${baseCode}`;

    return jsonResponse({
      referralCode: baseCode,
      referralLink,
      referrals: allReferrals,
      stats: {
        total: allReferrals.filter((r) => r.referredEmail).length,
        pending: allReferrals.filter((r) => r.status === 'pending' && r.referredEmail).length,
        active: allReferrals.filter((r) => r.status === 'active').length,
        rewarded: allReferrals.filter((r) => r.status === 'rewarded').length,
      },
    });
  } catch (err) {
    console.error('[GET /api/portal/referrals] error:', err);
    return errorResponse('Failed to fetch referrals', 500);
  }
}

function slugToCode(slug: string): string {
  // Use org slug + short hash for a clean, deterministic code
  const clean = slug.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 12);
  const suffix = Math.abs(hashString(slug)).toString(36).slice(0, 4);
  return `${clean}-${suffix}`;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}
