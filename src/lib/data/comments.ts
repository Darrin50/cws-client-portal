import { db } from "@/db";
import { commentsTable, organizationsTable } from "@/db/schema";
import { eq, and, count, desc } from "drizzle-orm";

export interface CommentFilters {
  orgId?: string;
  pageId?: string;
  status?: "new" | "in_progress" | "completed";
  userId?: string;
  limit?: number;
  offset?: number;
}

export async function getComments(filters: CommentFilters) {
  const conditions: ReturnType<typeof eq>[] = [];

  if (filters.orgId) {
    conditions.push(eq(commentsTable.organizationId, filters.orgId));
  }

  if (filters.pageId) {
    conditions.push(eq(commentsTable.pageId, filters.pageId));
  }

  if (filters.status) {
    conditions.push(eq(commentsTable.status, filters.status));
  }

  if (filters.userId) {
    conditions.push(eq(commentsTable.authorId, filters.userId));
  }

  let query = db
    .select()
    .from(commentsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(commentsTable.createdAt));

  if (filters.limit) {
    query = query.limit(filters.limit) as typeof query;
  }

  if (filters.offset) {
    query = query.offset(filters.offset) as typeof query;
  }

  return query;
}

export async function getComment(id: string) {
  const result = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.id, id))
    .limit(1);

  return result?.[0] || null;
}

export async function createComment(data: {
  organizationId: string;
  pageId: string;
  authorId: string;
  content: string;
  priority?: string;
  x?: number;
  y?: number;
  screenshot?: string;
}) {
  const result = await db
    .insert(commentsTable)
    .values({
      organizationId: data.organizationId,
      pageId: data.pageId,
      authorId: data.authorId,
      content: data.content,
      priority: (data.priority as any) || "nice_to_have",
      status: "new",
    })
    .returning();

  return result?.[0] || null;
}

export async function updateCommentStatus(
  id: string,
  status: "new" | "in_progress" | "completed",
  resolvedById?: string,
  resolutionNote?: string
) {
  const result = await db
    .update(commentsTable)
    .set({
      status,
      assignedToId: resolvedById || null,
      completedAt: status === "completed" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(commentsTable.id, id))
    .returning();

  return result?.[0] || null;
}

export async function deleteComment(id: string) {
  const result = await db.delete(commentsTable).where(eq(commentsTable.id, id)).returning();

  return result?.[0] || null;
}

export async function getOpenRequestsCount(orgId: string) {
  const result = await db
    .select({ count: count() })
    .from(commentsTable)
    .where(
      and(
        eq(commentsTable.organizationId, orgId),
        eq(commentsTable.status, "new")
      )
    );

  return result?.[0]?.count || 0;
}

export async function getQueueData() {
  // Admin function - get all orgs' queue data
  const result = await db
    .select({
      orgId: commentsTable.organizationId,
      orgName: organizationsTable.name,
      openCount: count(),
      oldestRequest: commentsTable.createdAt,
    })
    .from(commentsTable)
    .innerJoin(
      organizationsTable,
      eq(commentsTable.organizationId, organizationsTable.id)
    )
    .where(eq(commentsTable.status, "new"))
    .groupBy(commentsTable.organizationId, organizationsTable.id, organizationsTable.name)
    .orderBy(desc(count()));

  return result;
}
