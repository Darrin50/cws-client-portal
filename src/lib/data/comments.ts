import { db } from "@/db";
import { comments, pages, organizations } from "@/db/schema";
import { eq, and, count, desc, isNull } from "drizzle-orm";

export interface CommentFilters {
  orgId?: string;
  pageId?: string;
  status?: "open" | "resolved" | "in-progress";
  type?: "comment" | "request";
  userId?: string;
  limit?: number;
  offset?: number;
}

export async function getComments(filters: CommentFilters) {
  let query = db.select().from(comments);

  if (filters.orgId) {
    query = query.where(eq(comments.organizationId, filters.orgId));
  }

  if (filters.pageId) {
    query = query.where(eq(comments.pageId, filters.pageId));
  }

  if (filters.status) {
    query = query.where(eq(comments.status, filters.status));
  }

  if (filters.type) {
    query = query.where(eq(comments.type, filters.type));
  }

  if (filters.userId) {
    query = query.where(eq(comments.authorId, filters.userId));
  }

  query = query.orderBy(desc(comments.createdAt));

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.offset(filters.offset);
  }

  return query;
}

export async function getComment(id: string) {
  const result = await db
    .select()
    .from(comments)
    .where(eq(comments.id, id))
    .limit(1);

  return result?.[0] || null;
}

export async function createComment(data: {
  organizationId: string;
  pageId: string;
  authorId: string;
  content: string;
  type: "comment" | "request";
  priority?: "low" | "medium" | "high";
  x?: number;
  y?: number;
  screenshot?: string;
}) {
  const result = await db
    .insert(comments)
    .values({
      ...data,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result?.[0] || null;
}

export async function updateCommentStatus(
  id: string,
  status: "open" | "resolved" | "in-progress",
  resolvedById?: string,
  resolutionNote?: string
) {
  const result = await db
    .update(comments)
    .set({
      status,
      resolvedById: resolvedById || null,
      resolutionNote: resolutionNote || null,
      updatedAt: new Date(),
      resolvedAt: status === "resolved" ? new Date() : null,
    })
    .where(eq(comments.id, id))
    .returning();

  return result?.[0] || null;
}

export async function deleteComment(id: string) {
  const result = await db.delete(comments).where(eq(comments.id, id)).returning();

  return result?.[0] || null;
}

export async function getOpenRequestsCount(orgId: string) {
  const result = await db
    .select({ count: count() })
    .from(comments)
    .where(
      and(
        eq(comments.organizationId, orgId),
        eq(comments.status, "open"),
        eq(comments.type, "request")
      )
    );

  return result?.[0]?.count || 0;
}

export async function getQueueData() {
  // Admin function - get all orgs' queue data
  const result = await db
    .select({
      orgId: comments.organizationId,
      orgName: organizations.name,
      openCount: count(),
      oldestRequest: comments.createdAt,
    })
    .from(comments)
    .innerJoin(
      organizations,
      eq(comments.organizationId, organizations.id)
    )
    .where(
      and(
        eq(comments.status, "open"),
        eq(comments.type, "request")
      )
    )
    .groupBy(comments.organizationId, organizations.id, organizations.name)
    .orderBy(desc(count()));

  return result;
}
