import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
  referralsTable,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  validateRequest,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-helpers';
import { sendEmail } from '@/lib/email';
import { ReferralInviteEmail } from '@/lib/email/templates/referral-invite';
import React from 'react';

const SendReferralSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

async function resolveOrgWithUser(clerkUserId: string, clerkOrgId: string | null) {
  let org = null;

  if (clerkOrgId) {
    const rows = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
      .limit(1);
    if (rows[0]) org = rows[0];
  }

  if (!org) {
    const userRows = await db
      .select({ id: usersTable.id, firstName: usersTable.firstName, lastName: usersTable.lastName })
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
    org = orgRows[0] ?? null;
  }

  // Also fetch user name
  const userRows = await db
    .select({ firstName: usersTable.firstName, lastName: usersTable.lastName })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  const user = userRows[0];

  return { org, user };
}

/** POST /api/portal/referrals/send — send a referral invitation email */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const result = await resolveOrgWithUser(clerkUserId, clerkOrgId ?? null);
    if (!result?.org) return forbiddenResponse();

    const { org, user } = result;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const validation = validateRequest(SendReferralSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error ?? 'Validation failed', 400);
    }

    const { email } = validation.data!;

    // Check for duplicate — don't spam the same email
    const existing = await db
      .select({ id: referralsTable.id })
      .from(referralsTable)
      .where(
        and(
          eq(referralsTable.referrerOrgId, org.id),
          eq(referralsTable.referredEmail, email),
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return errorResponse('A referral has already been sent to this email address.', 409);
    }

    // Generate a unique code for this email referral
    const referralCode = generateReferralCode(org.slug, email);
    const referralLink = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://cwsportal.com'}/signup?ref=${referralCode}`;

    // Insert referral record
    await db.insert(referralsTable).values({
      referrerOrgId: org.id,
      referralCode,
      referredEmail: email,
      status: 'pending',
      rewardIssued: false,
    });

    // Send email
    const referrerName = user
      ? [user.firstName, user.lastName].filter(Boolean).join(' ') || org.name
      : org.name;

    await sendEmail(
      email,
      `${referrerName} thinks Caliber Web Studio could grow your business`,
      React.createElement(ReferralInviteEmail, {
        referrerName,
        referrerOrgName: org.name,
        referralLink,
        reward: '1 month free',
      }),
    );

    return jsonResponse({ message: 'Referral sent successfully', referralCode });
  } catch (err) {
    console.error('[POST /api/portal/referrals/send] error:', err);
    return errorResponse('Failed to send referral', 500);
  }
}

function generateReferralCode(slug: string, email: string): string {
  const clean = slug.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 10);
  const ts = Date.now().toString(36).slice(-4);
  const emailHash = Math.abs(hashString(email)).toString(36).slice(0, 4);
  return `${clean}-${emailHash}${ts}`;
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
