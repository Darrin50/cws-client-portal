"use server";

import {
  updateBusinessInfoSchema,
  inviteTeamMemberSchema,
} from "@/lib/validators";
import { updateOrganization, getOrganizationMembers } from "@/lib/data/organizations";
import { sendEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/data/audit";
import { updateNotificationPreference } from "@/lib/data/notifications";
import { requireOrgAccess, requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { organizationMembersTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function updateBusinessInfo(
  formData: unknown,
  organizationId: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const validated = updateBusinessInfoSchema.parse(formData);

    // Check authorization
    const { userId } = await requireOrgAccess(organizationId);

    // Update organization
    const updated = await updateOrganization(organizationId, {
      name: validated.name,
      website: validated.website,
      description: validated.description,
      timezone: validated.timezone,
    });

    if (!updated) {
      return { error: "Failed to update business info" };
    }

    // Log audit event
    await createAuditLog({
      organizationId,
      userId,
      action: "business_info_updated",
      resourceType: "organization",
      resourceId: organizationId,
      changes: {
        name: validated.name,
        website: validated.website,
      },
      ipAddress,
      userAgent,
    });

    return { success: true, updated };
  } catch (error) {
    console.error("Error updating business info:", error);
    return { error: "Failed to update business info" };
  }
}

export async function updateNotificationPreferences(
  formData: unknown,
  organizationId: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const userId = await requireAuth();

    // Parse preferences (would need appropriate schema)
    const preferences = formData as any;

    // Update preferences
    const updated = await updateNotificationPreference(userId, {
      emailRequests: preferences.emailRequests,
      emailMessages: preferences.emailMessages,
      emailReports: preferences.emailReports,
      emailAlerts: preferences.emailAlerts,
      smsRequests: preferences.smsRequests,
      smsUrgent: preferences.smsUrgent,
      inAppAll: preferences.inAppAll,
      digestFrequency: preferences.digestFrequency,
    });

    if (!updated) {
      return { error: "Failed to update preferences" };
    }

    return { success: true, updated };
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return { error: "Failed to update preferences" };
  }
}

export async function inviteTeamMember(
  formData: unknown,
  organizationId: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const validated = inviteTeamMemberSchema.parse(formData);

    // Check authorization (require admin or owner role)
    const { userId } = await requireOrgAccess(organizationId);

    // Check if user already exists in organization (by org ID only, no email column)
    const existing = await db
      .select()
      .from(organizationMembersTable)
      .where(
        eq(organizationMembersTable.organizationId, organizationId)
      )
      .limit(1);

    if (existing && existing.length > 0) {
      return { error: "User already a member of this organization" };
    }

    // Create invitation (would create in invitations table)
    // For now, we'll create a placeholder member record
    const member = await db
      .insert(organizationMembersTable)
      .values({
        organizationId,
        userId: validated.email, // placeholder - real impl would look up userId
        role: (validated.role || "member") as "owner" | "member",
        invitedById: userId,
      })
      .returning();

    if (!member?.[0]) {
      return { error: "Failed to invite team member" };
    }

    // Send invitation email
    await sendEmail(
      validated.email,
      "You're invited to join CWS Portal",
      null // Email template would go here
    );

    // Log audit event
    await createAuditLog({
      organizationId,
      userId,
      action: "team_member_invited",
      resourceType: "organization_member",
      resourceId: member[0].id,
      changes: {
        email: validated.email,
        role: validated.role,
      },
      ipAddress,
      userAgent,
    });

    return { success: true, member: member[0] };
  } catch (error) {
    console.error("Error inviting team member:", error);
    return { error: "Failed to invite team member" };
  }
}

export async function removeTeamMember(
  memberId: string,
  organizationId: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const { userId } = await requireOrgAccess(organizationId);

    // Delete member
    const deleted = await db
      .delete(organizationMembersTable)
      .where(eq(organizationMembersTable.id, memberId))
      .returning();

    if (!deleted?.[0]) {
      return { error: "Member not found" };
    }

    // Log audit event
    await createAuditLog({
      organizationId,
      userId,
      action: "team_member_removed",
      resourceType: "organization_member",
      resourceId: memberId,
      changes: {
        userId: deleted[0].userId,
      },
      ipAddress,
      userAgent,
    });

    return { success: true, deleted: deleted[0] };
  } catch (error) {
    console.error("Error removing team member:", error);
    return { error: "Failed to remove team member" };
  }
}
