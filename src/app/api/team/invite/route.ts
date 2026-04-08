import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
  notificationsTable,
} from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import {
  validateRequest,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-helpers';
import { rateLimit, getIp } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';
import { TeamInviteEmail } from '@/lib/email/templates/team-invite';
import React from 'react';

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['owner', 'member']).default('member'),
});

/** Seat limits per plan tier. */
const SEAT_LIMITS: Record<string, number> = {
  starter: 2,
  growth: 5,
  domination: 20,
};

/** Resolve DB org for the calling user. */
async function resolveContext(clerkUserId: string, clerkOrgId: string | null) {
  const userRows = await db
    .select({ id: usersTable.id, role: usersTable.role, firstName: usersTable.firstName, lastName: usersTable.lastName })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  const dbUser = userRows[0] ?? null;
  if (!dbUser) return { org: null, dbUser: null };

  if (clerkOrgId) {
    const orgRows = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
      .limit(1);
    if (orgRows[0]) return { org: orgRows[0], dbUser };
  }

  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId, role: organizationMembersTable.role })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, dbUser.id))
    .limit(1);
  if (!memberRows[0]) return { org: null, dbUser };

  const orgRows = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return { org: orgRows[0] ?? null, dbUser };
}

export async function POST(request: NextRequest) {
  try {
    const { success } = await rateLimit(getIp(request));
    if (!success) return errorResponse('Too many requests', 429);

    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const { org, dbUser } = await resolveContext(clerkUserId, clerkOrgId ?? null);
    if (!org || !dbUser) return forbiddenResponse();

    // Only org owners or CWS admins can invite
    const memberRow = await db
      .select({ role: organizationMembersTable.role })
      .from(organizationMembersTable)
      .where(eq(organizationMembersTable.userId, dbUser.id))
      .limit(1);
    const memberRole = memberRow[0]?.role;
    const isOrgAdmin = dbUser.role === 'admin' || memberRole === 'owner';
    if (!isOrgAdmin) return forbiddenResponse();

    const body = await request.json();
    const validation = validateRequest(InviteSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error ?? 'Validation failed', 400);
    }

    const { email, role } = validation.data!;

    // Check seat limit
    const currentMemberCountRows = await db
      .select({ count: count() })
      .from(organizationMembersTable)
      .where(eq(organizationMembersTable.organizationId, org.id));
    const currentCount = currentMemberCountRows[0]?.count ?? 0;
    const seatLimit = SEAT_LIMITS[org.planTier] ?? 2;

    if (currentCount >= seatLimit) {
      return errorResponse(
        `Your ${org.planTier} plan allows up to ${seatLimit} team members. Upgrade to add more.`,
        403,
      );
    }

    // Check if user already has a DB record (already signed up)
    const existingUserRows = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    const existingUser = existingUserRows[0] ?? null;

    if (existingUser) {
      // Check if already a member
      const existingMember = await db
        .select({ id: organizationMembersTable.id })
        .from(organizationMembersTable)
        .where(eq(organizationMembersTable.userId, existingUser.id))
        .limit(1);

      if (existingMember.length > 0) {
        return errorResponse('This user is already a member of your organization.', 409);
      }

      // Add directly
      await db.insert(organizationMembersTable).values({
        organizationId: org.id,
        userId: existingUser.id,
        role,
        invitedById: dbUser.id,
      });
    }

    // Send invite email via Clerk (creates a Clerk org invitation if using Clerk orgs)
    const clerk = await clerkClient();
    let invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup`;

    try {
      if (org.clerkOrgId) {
        const invitation = await clerk.organizations.createOrganizationInvitation({
          organizationId: org.clerkOrgId,
          emailAddress: email,
          role: role === 'owner' ? 'org:admin' : 'org:member',
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          inviterUserId: clerkUserId,
        });
        invitationUrl = invitation.publicMetadata?.inviteUrl as string ?? invitationUrl;
      }
    } catch (clerkErr) {
      console.warn('Clerk org invite failed, falling back to email-only:', clerkErr);
    }

    // Send invite email
    const inviterName =
      [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' ') || 'Your team';

    await sendEmail(
      email,
      `You've been invited to join ${org.name} on CWS Portal`,
      React.createElement(TeamInviteEmail, {
        inviterName,
        organizationName: org.name,
        joinLink: invitationUrl,
        role,
      }),
    );

    // Notify inviter
    await db.insert(notificationsTable).values({
      userId: dbUser.id,
      organizationId: org.id,
      type: 'team_invite',
      title: 'Team invitation sent',
      body: `An invitation has been sent to ${email}.`,
    });

    return jsonResponse(
      {
        email,
        role,
        status: 'invited',
        organizationId: org.id,
      },
      201,
    );
  } catch (err) {
    console.error('POST /api/team/invite error:', err);
    return errorResponse('Internal server error', 500);
  }
}
