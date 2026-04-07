import { db } from "@/db";
import { socialPostsTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getSocialPosts(
  orgId: string,
  status?: "draft" | "pending_approval" | "approved" | "published" | "rejected"
) {
  const conditions: ReturnType<typeof eq>[] = [eq(socialPostsTable.organizationId, orgId)];

  if (status) {
    conditions.push(eq(socialPostsTable.status, status));
  }

  const result = await db
    .select()
    .from(socialPostsTable)
    .where(and(...conditions))
    .orderBy(desc(socialPostsTable.createdAt));

  return result;
}

export async function createSocialPost(data: {
  organizationId: string;
  content: string;
  platforms: string[];
  scheduledFor?: Date;
  imageUrl?: string;
  caption?: string;
  createdById: string;
}) {
  const result = await db
    .insert(socialPostsTable)
    .values({
      organizationId: data.organizationId,
      content: data.content,
      platforms: data.platforms,
      scheduledAt: data.scheduledFor || null,
      status: "draft",
      createdById: data.createdById,
    })
    .returning();

  return result?.[0] || null;
}

export async function updateSocialPost(
  id: string,
  data: {
    content?: string;
    platforms?: string[];
    scheduledFor?: Date;
    imageUrl?: string;
    caption?: string;
  }
) {
  const result = await db
    .update(socialPostsTable)
    .set({
      content: data.content,
      platforms: data.platforms as any,
      scheduledAt: data.scheduledFor,
      updatedAt: new Date(),
    })
    .where(eq(socialPostsTable.id, id))
    .returning();

  return result?.[0] || null;
}

export async function approveSocialPost(id: string, approvedById: string) {
  const result = await db
    .update(socialPostsTable)
    .set({
      status: "approved",
      approvedById,
      updatedAt: new Date(),
    })
    .where(eq(socialPostsTable.id, id))
    .returning();

  return result?.[0] || null;
}

export async function rejectSocialPost(
  id: string,
  rejectedById: string,
  reason?: string
) {
  const result = await db
    .update(socialPostsTable)
    .set({
      status: "rejected",
      rejectionNote: reason || null,
      updatedAt: new Date(),
    })
    .where(eq(socialPostsTable.id, id))
    .returning();

  return result?.[0] || null;
}
