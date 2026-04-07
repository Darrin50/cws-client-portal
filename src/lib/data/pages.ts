import { db } from "@/db";
import { pagesTable, commentsTable } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function getPages(orgId: string) {
  const result = await db
    .select()
    .from(pagesTable)
    .where(eq(pagesTable.organizationId, orgId))
    .orderBy(pagesTable.createdAt);

  return result;
}

export async function getPage(id: string) {
  const result = await db
    .select()
    .from(pagesTable)
    .where(eq(pagesTable.id, id))
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
    .insert(pagesTable)
    .values({
      organizationId: data.organizationId,
      name: data.title,
      urlPath: data.slug,
      fullUrl: data.url,
      screenshotUrl: data.screenshot,
      metaDescription: data.description,
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
    .update(pagesTable)
    .set({
      name: data.title,
      urlPath: data.slug,
      fullUrl: data.url,
      metaDescription: data.description,
      screenshotUrl: data.screenshot,
      screenshotTakenAt: data.lastAnalyzedAt,
      updatedAt: new Date(),
    })
    .where(eq(pagesTable.id, id))
    .returning();

  return result?.[0] || null;
}

export async function deletePage(id: string) {
  // Delete associated commentsTable first
  await db.delete(commentsTable).where(eq(commentsTable.pageId, id));

  // Delete the page
  const result = await db.delete(pagesTable).where(eq(pagesTable.id, id)).returning();

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
        .from(commentsTable)
        .where(eq(commentsTable.pageId, page.id));

      const openCounts = await db
        .select({ count: count() })
        .from(commentsTable)
        .where(
          and(
            eq(commentsTable.pageId, page.id),
            eq(commentsTable.status, "new")
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
