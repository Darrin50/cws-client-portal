import { db } from "@/db";
import { messagesTable } from "@/db/schema";
import { eq, and, count, desc, isNull } from "drizzle-orm";

export async function getMessages(orgId: string, cursor?: string, limit: number = 20) {
  const result = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.organizationId, orgId))
    .orderBy(desc(messagesTable.createdAt))
    .limit(limit);

  return result;
}

export async function createMessage(data: {
  organizationId: string;
  senderId: string;
  recipientId?: string;
  content: string;
  subject?: string;
  channel?: "in-app" | "email" | "sms";
}) {
  const result = await db
    .insert(messagesTable)
    .values({
      organizationId: data.organizationId,
      senderId: data.senderId,
      content: data.content,
      isRead: false,
      readAt: null,
    })
    .returning();

  return result?.[0] || null;
}

export async function markMessageRead(id: string) {
  const result = await db
    .update(messagesTable)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(eq(messagesTable.id, id))
    .returning();

  return result?.[0] || null;
}

export async function getUnreadCount(orgId: string, userId: string) {
  const result = await db
    .select({ count: count() })
    .from(messagesTable)
    .where(
      and(
        eq(messagesTable.organizationId, orgId),
        eq(messagesTable.senderId, userId),
        isNull(messagesTable.readAt)
      )
    );

  return result?.[0]?.count || 0;
}
