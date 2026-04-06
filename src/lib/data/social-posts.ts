import { db } from "@/db";
import { socialPosts } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getSocialPosts(
  orgId: string,
  status?: "draft" | "scheduled" | "published" | "rejected"
) {
  let query = db
    .select()
    .from(socialPosts)
    .where(eq(socialPosts.organizationId, orgId));

  if (status) {
    query = query.where(eq(socialPosts.status, status));
  }

  query = query.orderBy(desc(socialPosts.createdAt));

  return query;
}

export async function createSocialPost(data: {
  organizationId: string;
  content: string;
  platforms: string[];
  scheduledFor?: Date;
  imageUrl?: string;
  caption?: string;
}) {
  const result = await db
    .insert(socialPosts)
    .values({
      ...data,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
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
    .update(socialPosts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(socialPosts.id, id))
    .returning();

  return result?.[0] || null;
}

export async function approveSocialPost(id: string, approvedById: string) {
  const result = await db
    .update(socialPosts)
    .set({
      status: "scheduled",
      approvedById,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(socialPosts.id, id))
    .returning();

  return result?.[0] || null;
}

export async function rejectSocialPost(
  id: string,
  rejectedById: string,
  reason?: string
) {
  const result = await db
    .update(socialPosts)
    .set({
      status: "rejected",
      rejectedById,
      rejectionReason: reason,
      rejectedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(socialPosts.id, id))
    .returning();

  return result?.[0] || null;
}
