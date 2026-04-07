import { db } from "@/db";
import { faqArticlesTable } from "@/db/schema";
import { eq, and, count, desc } from "drizzle-orm";

export async function getFaqArticles(category?: string) {
  const conditions: ReturnType<typeof eq>[] = [eq(faqArticlesTable.isPublished, true)];

  if (category) {
    conditions.push(eq(faqArticlesTable.category, category as any));
  }

  const result = await db
    .select()
    .from(faqArticlesTable)
    .where(and(...conditions))
    .orderBy(desc(faqArticlesTable.helpfulCount));

  return result;
}

export async function getFaqArticle(id: string) {
  const result = await db
    .select()
    .from(faqArticlesTable)
    .where(eq(faqArticlesTable.id, id))
    .limit(1);

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
    .insert(faqArticlesTable)
    .values({
      title: data.title,
      content: data.content,
      category: data.category as any,
      isPublished: data.published ?? false,
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
    .update(faqArticlesTable)
    .set({
      title: data.title,
      content: data.content,
      category: data.category as any,
      isPublished: data.published,
      updatedAt: new Date(),
    })
    .where(eq(faqArticlesTable.id, id))
    .returning();

  return result?.[0] || null;
}

export async function deleteFaqArticle(id: string) {
  const result = await db
    .delete(faqArticlesTable)
    .where(eq(faqArticlesTable.id, id))
    .returning();

  return result?.[0] || null;
}

export async function markHelpful(id: string, helpful: boolean) {
  const article = await getFaqArticle(id);
  if (!article) {
    return null;
  }

  const currentHelpful = article.helpfulCount || 0;
  const currentUnhelpful = article.notHelpfulCount || 0;

  const result = await db
    .update(faqArticlesTable)
    .set({
      helpfulCount: helpful ? currentHelpful + 1 : currentHelpful,
      notHelpfulCount: !helpful ? currentUnhelpful + 1 : currentUnhelpful,
      updatedAt: new Date(),
    })
    .where(eq(faqArticlesTable.id, id))
    .returning();

  return result?.[0] || null;
}
