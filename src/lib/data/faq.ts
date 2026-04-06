import { db } from "@/db";
import { faqArticles } from "@/db/schema";
import { eq, and, count, desc } from "drizzle-orm";

export async function getFaqArticles(category?: string) {
  let query = db.select().from(faqArticles).where(eq(faqArticles.published, true));

  if (category) {
    query = query.where(eq(faqArticles.category, category));
  }

  query = query.orderBy(desc(faqArticles.views));

  return query;
}

export async function getFaqArticle(id: string) {
  const result = await db
    .select()
    .from(faqArticles)
    .where(eq(faqArticles.id, id))
    .limit(1);

  if (result?.[0]) {
    // Increment views
    await db
      .update(faqArticles)
      .set({ views: (result[0].views || 0) + 1 })
      .where(eq(faqArticles.id, id));
  }

  return result?.[0] || null;
}

export async function createFaqArticle(data: {
  title: string;
  content: string;
  category: string;
  keywords?: string[];
  published?: boolean;
}) {
  const result = await db
    .insert(faqArticles)
    .values({
      ...data,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result?.[0] || null;
}

export async function updateFaqArticle(
  id: string,
  data: {
    title?: string;
    content?: string;
    category?: string;
    keywords?: string[];
    published?: boolean;
  }
) {
  const result = await db
    .update(faqArticles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(faqArticles.id, id))
    .returning();

  return result?.[0] || null;
}

export async function deleteFaqArticle(id: string) {
  const result = await db
    .delete(faqArticles)
    .where(eq(faqArticles.id, id))
    .returning();

  return result?.[0] || null;
}

export async function markHelpful(id: string, helpful: boolean) {
  const article = await getFaqArticle(id);
  if (!article) {
    return null;
  }

  const currentHelpful = article.helpful || 0;
  const currentUnhelpful = article.unhelpful || 0;

  const result = await db
    .update(faqArticles)
    .set({
      helpful: helpful ? currentHelpful + 1 : currentHelpful,
      unhelpful: !helpful ? currentUnhelpful + 1 : currentUnhelpful,
      updatedAt: new Date(),
    })
    .where(eq(faqArticles.id, id))
    .returning();

  return result?.[0] || null;
}
