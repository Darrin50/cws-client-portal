"use server";

import { requireAuth } from "@/lib/auth";
import {
  getNotificationPreferences as fetchPreferences,
  saveNotificationPreferences,
  type NotificationPreferencesMap,
} from "@/lib/data/notifications";

export async function updateBusinessInfo(
  businessInfo: {
    businessName: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    hours?: string;
    industry?: string;
    description?: string;
  }
) {
  try {
    // Validate required fields
    if (!businessInfo.businessName.trim()) {
      throw new Error("Business name is required");
    }

    // TODO: Implement real update logic
    // 1. Validate user authentication
    // 2. Update business info in database
    // 3. Return success response

    console.log("Business info updated:", businessInfo);

    return {
      success: true,
      message: "Business information updated successfully",
    };
  } catch (error) {
    console.error("Error updating business info:", error);
    throw new Error("Failed to update business information");
  }
}

export async function updateNotificationPreferences(
  preferences: Record<string, Record<string, boolean>>
) {
  try {
    const clerkUserId = await requireAuth();
    await saveNotificationPreferences(clerkUserId, preferences);
    return { success: true, message: "Notification preferences updated successfully" };
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    throw new Error("Failed to update notification preferences");
  }
}

export async function inviteTeamMember(
  email: string,
  role: "Viewer" | "Editor" | "Admin"
) {
  try {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email address");
    }

    // TODO: Implement real invite logic
    // 1. Validate user authentication and permissions
    // 2. Check if user already exists
    // 3. Generate invite token
    // 4. Send invitation email
    // 5. Record pending invite in database

    console.log("Team member invited:", { email, role });

    return {
      success: true,
      message: "Invitation sent successfully",
      inviteId: `INVITE-${Date.now()}`,
    };
  } catch (error) {
    console.error("Error inviting team member:", error);
    throw new Error("Failed to send invitation");
  }
}

export async function removeTeamMember(userId: string) {
  try {
    // TODO: Implement real removal logic
    // 1. Validate user authentication and permissions
    // 2. Check if user is the only admin (prevent removal)
    // 3. Remove user from team
    // 4. Revoke access to all resources
    // 5. Send notification email

    console.log("Team member removed:", { userId });

    return {
      success: true,
      message: "Team member removed successfully",
    };
  } catch (error) {
    console.error("Error removing team member:", error);
    throw new Error("Failed to remove team member");
  }
}

export async function getBusinessInfo() {
  try {
    // TODO: Implement real fetch logic
    // 1. Validate user authentication
    // 2. Fetch business info from database
    // 3. Return complete business profile

    return {
      businessName: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      hours: "",
      industry: "",
      description: "",
    };
  } catch (error) {
    console.error("Error fetching business info:", error);
    throw new Error("Failed to fetch business information");
  }
}

export async function getTeamMembers() {
  try {
    // TODO: Implement real fetch logic
    // 1. Fetch all team members for authenticated user
    // 2. Include role and join date
    // 3. Return sorted by join date

    return {
      members: [],
      total: 0,
    };
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw new Error("Failed to fetch team members");
  }
}

export async function getNotificationPreferences(): Promise<NotificationPreferencesMap> {
  try {
    const clerkUserId = await requireAuth();
    return await fetchPreferences(clerkUserId);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    throw new Error("Failed to fetch notification preferences");
  }
}
