import { db } from "@/db";
import { notificationsTable, notificationPreferencesTable } from "@/db/schema";
import { usersTable } from "@/db/schema/users";
import { eq, and, count, isNull, sql } from "drizzle-orm";

// ── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  "Request Updates": { email: true, sms: false, inApp: true },
  Messages: { email: true, sms: true, inApp: true },
  Reports: { email: true, sms: false, inApp: false },
  Social: { email: false, sms: false, inApp: true },
  Billing: { email: true, sms: false, inApp: true },
} as const;

export type NotificationPreferencesMap = {
  [K in keyof typeof DEFAULT_NOTIFICATION_PREFERENCES]: Record<"email" | "sms" | "inApp", boolean>;
};

// Maps UI channel names → DB enum values
const CHANNEL_MAP: Record<string, "email" | "sms" | "push"> = {
  email: "email",
  sms: "sms",
  inApp: "push",
};

// ── Notifications ─────────────────────────────────────────────────────────────

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

// ── Notification Preferences ──────────────────────────────────────────────────

/**
 * Returns the structured notification preferences for a user by their Clerk ID.
 * Falls back to defaults if no rows exist yet.
 */
export async function getNotificationPreferences(
  clerkUserId: string
): Promise<NotificationPreferencesMap> {
  const defaults = structuredClone(
    DEFAULT_NOTIFICATION_PREFERENCES
  ) as NotificationPreferencesMap;

  // Resolve Clerk ID → DB user UUID
  const user = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);

  if (!user[0]) return defaults;

  const rows = await db
    .select()
    .from(notificationPreferencesTable)
    .where(eq(notificationPreferencesTable.userId, user[0].id));

  if (rows.length === 0) return defaults;

  // Overlay DB rows on top of defaults
  const result = structuredClone(DEFAULT_NOTIFICATION_PREFERENCES) as NotificationPreferencesMap;
  for (const row of rows) {
    const cat = row.category as keyof NotificationPreferencesMap;
    const ch = row.channel === "push" ? "inApp" : (row.channel as "email" | "sms");
    if (result[cat] && ch in result[cat]) {
      (result[cat] as Record<string, boolean>)[ch] = row.enabled;
    }
  }

  return result;
}

/**
 * Upserts all notification preference rows for a user (15 rows: 5 categories × 3 channels).
 * Accepts the same shape the UI produces.
 */
export async function saveNotificationPreferences(
  clerkUserId: string,
  preferences: Record<string, Record<string, boolean>>
) {
  // Resolve Clerk ID → DB user UUID
  const user = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);

  if (!user[0]) throw new Error("User not found");
  const dbUserId = user[0].id;

  type PrefRow = {
    userId: string;
    channel: "email" | "sms" | "push";
    category: string;
    enabled: boolean;
  };

  const rows: PrefRow[] = [];
  for (const [category, channels] of Object.entries(preferences)) {
    for (const [channel, enabled] of Object.entries(channels)) {
      const dbChannel = CHANNEL_MAP[channel];
      if (!dbChannel) continue;
      rows.push({ userId: dbUserId, channel: dbChannel, category, enabled });
    }
  }

  if (rows.length === 0) return;

  await db
    .insert(notificationPreferencesTable)
    .values(rows)
    .onConflictDoUpdate({
      target: [
        notificationPreferencesTable.userId,
        notificationPreferencesTable.channel,
        notificationPreferencesTable.category,
      ],
      set: {
        enabled: sql`excluded.enabled`,
        updatedAt: sql`now()`,
      },
    });
}
