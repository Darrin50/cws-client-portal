import { db } from "@/db";
import { notifications, notificationPreferences } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function getNotifications(userId: string, limit: number = 20) {
  const result = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(notifications.createdAt)
    .limit(limit);

  return result;
}

export async function createNotification(data: {
  userId: string;
  type: "request" | "message" | "report" | "alert" | "team" | "billing";
  title: string;
  description?: string;
  relatedId?: string;
  link?: string;
  priority?: "low" | "medium" | "high";
}) {
  const result = await db
    .insert(notifications)
    .values({
      ...data,
      readAt: null,
      createdAt: new Date(),
    })
    .returning();

  return result?.[0] || null;
}

export async function markRead(id: string) {
  const result = await db
    .update(notifications)
    .set({
      readAt: new Date(),
    })
    .where(eq(notifications.id, id))
    .returning();

  return result?.[0] || null;
}

export async function markAllRead(userId: string) {
  const result = await db
    .update(notifications)
    .set({
      readAt: new Date(),
    })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.readAt, null)
      )
    )
    .returning();

  return result;
}

export async function getUnreadCount(userId: string) {
  const result = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.readAt, null)
      )
    );

  return result?.[0]?.count || 0;
}

export async function getNotificationPreferences(userId: string) {
  const result = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  return result?.[0] || null;
}

export async function updateNotificationPreference(
  userId: string,
  data: {
    emailRequests?: boolean;
    emailMessages?: boolean;
    emailReports?: boolean;
    emailAlerts?: boolean;
    smsRequests?: boolean;
    smsUrgent?: boolean;
    inAppAll?: boolean;
    digestFrequency?: "immediate" | "daily" | "weekly" | "off";
  }
) {
  // Check if preferences exist
  const existing = await getNotificationPreferences(userId);

  if (existing) {
    const result = await db
      .update(notificationPreferences)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreferences.userId, userId))
      .returning();

    return result?.[0] || null;
  } else {
    const result = await db
      .insert(notificationPreferences)
      .values({
        userId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return result?.[0] || null;
  }
}
