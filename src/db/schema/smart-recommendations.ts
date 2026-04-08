import { pgTable, uuid, varchar, text, integer, timestamp, index, foreignKey, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';

export const recommendationCategoryEnum = pgEnum('recommendation_category', [
  'seo',
  'content',
  'technical',
  'design',
  'marketing',
]);

export const smartRecommendationsTable = pgTable(
  'cws_smart_recommendations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    impact: varchar('impact', { length: 100 }).notNull(),
    category: recommendationCategoryEnum('category').notNull(),
    priority: integer('priority').default(1).notNull(),
    generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow().notNull(),
    dismissedAt: timestamp('dismissed_at', { withTimezone: true }),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'smart_recommendations_organization_id_fk',
    }).onDelete('cascade'),
    orgGeneratedIdx: index('smart_recommendations_org_generated_idx').on(table.organizationId, table.generatedAt),
    orgActiveIdx: index('smart_recommendations_org_active_idx').on(table.organizationId, table.dismissedAt),
  }),
);

export const smartRecommendationsRelations = relations(smartRecommendationsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [smartRecommendationsTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export type SmartRecommendation = typeof smartRecommendationsTable.$inferSelect;
export type NewSmartRecommendation = typeof smartRecommendationsTable.$inferInsert;
