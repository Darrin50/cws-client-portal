import { pgTable, pgEnum, uuid, varchar, text, integer, boolean, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usersTable } from './users';

export const faqCategoryEnum = pgEnum('faq_category', ['billing', 'website', 'analytics', 'social', 'technical']);

export const faqArticlesTable = pgTable(
  'faq_articles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    category: faqCategoryEnum('category').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    isPublished: boolean('is_published').default(false).notNull(),
    helpfulCount: integer('helpful_count').default(0).notNull(),
    notHelpfulCount: integer('not_helpful_count').default(0).notNull(),
    createdById: uuid('created_by_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    createdByIdFk: foreignKey({
      columns: [table.createdById],
      foreignColumns: [usersTable.id],
      name: 'faq_articles_created_by_id_fk',
    }).onDelete('set null'),
    categoryIdx: index('faq_articles_category_idx').on(table.category),
    isPublishedIdx: index('faq_articles_is_published_idx').on(table.isPublished),
    sortOrderIdx: index('faq_articles_sort_order_idx').on(table.sortOrder),
  }),
);

export const faqArticlesRelations = relations(faqArticlesTable, ({ one }) => ({
  createdBy: one(usersTable, {
    fields: [faqArticlesTable.createdById],
    references: [usersTable.id],
  }),
}));

export type FAQArticle = typeof faqArticlesTable.$inferSelect;
export type NewFAQArticle = typeof faqArticlesTable.$inferInsert;
