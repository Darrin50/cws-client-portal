import { db } from "@/db";
import { notificationsTable, notificationPreferencesTable } from "@/db/schema";
import { eq, and, count, isNull } from "drizzle-orm";

export async function getNotifications(userId: string, limit: number = 20) {
  const result = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(notificationsTable.createdAt)
    .limit(limit);

  return result;
}

export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  description?: string;
  relatedId?: string;
  link?: string;
  priority?: string;
}) {
  const result = await db
    .insert(notificationsTable)
    .values({
      userId: data.userId,
      type: data.type as any,
      title: data.title,
      body: data.description || null,
      link: data.link || null,
      isRead: false,
      readAt: null,
      emailSent: false,
      smsSent: false,
    })
    .returning();

  return result?.[0] || null;
}

export async function markRead(id: string) {
  const result = await db
    .update(notificationsTable)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(eq(notificationsTable.id, id))
    .returning();

  return result?.[0] || null;
}

export async function markAllRead(userId: string) {
  const result = await db
    .update(notificationsTable)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(
      and(
        eq(notificationsTable.userId, userId),
        isNull(notificationsTable.readAt)
      )
    )
    .returning();

  return result;
}

export async function getUnreadCount(userId: string) {
  const result = await db
    .select({ count: count() })
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.userId, userId),
        isNull(notificationsTable.readAt)
      )
    );

  return result?.[0]?.count || 0;
}

export async function getNotificationPreferences(userId: string) {
  const result = await db
    .select()
    .from(notificationPreferencesTable)
    .where(eq(notificationPreferencesTable.userId, userId))
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
    // Update per-category preferences
    await db
      .update(notificationPreferencesTable)
      .set({ updatedAt: new Date() })
      .where(eq(notificationPreferencesTable.userId, userId));

    return existing;
  } else {
    const result = await db
      .insert(notificationPreferencesTable)
      .values({
        userId,
        channel: 'email',
        category: 'general',
        enabled: true,
      })
      .returning();

    return result?.[0] || null;
  }
}
