import { pgTable, pgEnum, uuid, text, real, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { pagesTable } from './pages';
import { organizationsTable } from './organizations';

export const feedbackStatusEnum = pgEnum('feedback_status', ['new', 'in_progress', 'resolved']);

export const pageFeedbackTable = pgTable(
  'page_feedback',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pageId: uuid('page_id').notNull(),
    organizationId: uuid('organization_id').notNull(),
    xPercent: real('x_percent').notNull(),
    yPercent: real('y_percent').notNull(),
    comment: text('comment').notNull(),
    status: feedbackStatusEnum('status').default('new').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  },
  (table) => ({
    pageIdFk: foreignKey({
      columns: [table.pageId],
      foreignColumns: [pagesTable.id],
      name: 'page_feedback_page_id_fk',
    }).onDelete('cascade'),
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'page_feedback_organization_id_fk',
    }).onDelete('cascade'),
    pageIdIdx: index('page_feedback_page_id_idx').on(table.pageId),
    orgIdIdx: index('page_feedback_org_id_idx').on(table.organizationId),
  }),
);

export const pageFeedbackRelations = relations(pageFeedbackTable, ({ one }) => ({
  page: one(pagesTable, {
    fields: [pageFeedbackTable.pageId],
    references: [pagesTable.id],
  }),
  organization: one(organizationsTable, {
    fields: [pageFeedbackTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export type PageFeedback = typeof pageFeedbackTable.$inferSelect;
export type NewPageFeedback = typeof pageFeedbackTable.$inferInsert;
