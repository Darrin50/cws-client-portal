import { NextRequest } from 'next/server';
import { db } from '@/db';
import { referralsTable, organizationsTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth';

/** GET /api/admin/referrals — list all referrals across all orgs (admin only) */
export async function GET(_request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  try {
    const rows = await db
      .select({
        id: referralsTable.id,
        referralCode: referralsTable.referralCode,
        referredEmail: referralsTable.referredEmail,
        status: referralsTable.status,
        rewardIssued: referralsTable.rewardIssued,
        createdAt: referralsTable.createdAt,
        convertedAt: referralsTable.convertedAt,
        referrerOrgId: referralsTable.referrerOrgId,
        referrerOrgName: organizationsTable.name,
        referrerOrgPlan: organizationsTable.planTier,
      })
      .from(referralsTable)
      .leftJoin(organizationsTable, eq(referralsTable.referrerOrgId, organizationsTable.id))
      .orderBy(desc(referralsTable.createdAt));

    const emailReferrals = rows.filter((r) => r.referredEmail);

    const stats = {
      total: emailReferrals.length,
      pending: emailReferrals.filter((r) => r.status === 'pending').length,
      active: emailReferrals.filter((r) => r.status === 'active').length,
      rewarded: emailReferrals.filter((r) => r.status === 'rewarded').length,
    };

    return jsonResponse({ referrals: emailReferrals, stats });
  } catch (err) {
    console.error('[GET /api/admin/referrals] error:', err);
    return errorResponse('Failed to fetch referrals', 500);
  }
}
