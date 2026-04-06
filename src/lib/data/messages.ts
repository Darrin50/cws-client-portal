import { db } from "@/db";
import { messages } from "@/db/schema";
import { eq, and, count, desc } from "drizzle-orm";

export async function getMessages(orgId: string, cursor?: string, limit: number = 20) {
  let query = db
    .select()
    .from(messages)
    .where(eq(messages.organizationId, orgId))
    .orderBy(desc(messages.createdAt));

  // Implement cursor-based pagination if provided
  if (cursor) {
    const cursorDate = new Date(cursor);
    // Additional filtering logic for cursor position
  }

  query = query.limit(limit);
  return query;
}

export async function createMessage(data: {
  organizationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  subject?: string;
  channel?: "in-app" | "email" | "sms";
}) {
  const result = await db
    .insert(messages)
    .values({
      ...data,
      readAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result?.[0] || null;
}

export async function markMessageRead(id: string) {
  const result = await db
    .update(messages)
    .set({
      readAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(messages.id, id))
    .returning();

  return result?.[0] || null;
}

export async function getUnreadCount(orgId: string, userId: string) {
  const result = await db
    .select({ count: count() })
    .from(messages)
    .where(
      and(
        eq(messages.organizationId, orgId),
        eq(messages.recipientId, userId),
        eq(messages.readAt, null)
      )
    );

  return result?.[0]?.count || 0;
}
