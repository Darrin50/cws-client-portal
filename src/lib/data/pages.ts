import { db } from "@/db";
import { pages, comments } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function getPages(orgId: string) {
  const result = await db
    .select()
    .from(pages)
    .where(eq(pages.organizationId, orgId))
    .orderBy(pages.createdAt);

  return result;
}

export async function getPage(id: string) {
  const result = await db
    .select()
    .from(pages)
    .where(eq(pages.id, id))
    .limit(1);

  return result?.[0] || null;
}

export async function createPage(data: {
  organizationId: string;
  title: string;
  slug: string;
  url: string;
  description?: string;
  screenshot?: string;
}) {
  const result = await db
    .insert(pages)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result?.[0] || null;
}

export async function updatePage(
  id: string,
  data: {
    title?: string;
    slug?: string;
    url?: string;
    description?: string;
    screenshot?: string;
    lastAnalyzedAt?: Date;
  }
) {
  const result = await db
    .update(pages)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, id))
    .returning();

  return result?.[0] || null;
}

export async function deletePage(id: string) {
  // Delete associated comments first
  await db.delete(comments).where(eq(comments.pageId, id));

  // Delete the page
  const result = await db.delete(pages).where(eq(pages.id, id)).returning();

  return result?.[0] || null;
}

export async function getPagesWithCommentCounts(orgId: string) {
  const orgPages = await getPages(orgId);

  const pagesWithCounts = await Promise.all(
    orgPages.map(async (page) => {
      const commentCounts = await db
        .select({
          total: count(),
          open: count(),
        })
        .from(comments)
        .where(eq(comments.pageId, page.id));

      const openCounts = await db
        .select({ count: count() })
        .from(comments)
        .where(
          and(
            eq(comments.pageId, page.id),
            eq(comments.status, "open")
          )
        );

      return {
        ...page,
        totalComments: commentCounts?.[0]?.total || 0,
        openComments: openCounts?.[0]?.count || 0,
      };
    })
  );

  return pagesWithCounts;
}
