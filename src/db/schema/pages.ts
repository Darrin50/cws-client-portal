import { pgTable, uuid, varchar, text, integer, boolean, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';
import { commentsTable } from './comments';

export const pagesTable = pgTable(
  'pages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    urlPath: varchar('url_path', { length: 500 }),
    fullUrl: varchar('full_url', { length: 500 }),
    screenshotUrl: varchar('screenshot_url', { length: 500 }),
    screenshotFullUrl: varchar('screenshot_full_url', { length: 500 }),
    screenshotTakenAt: timestamp('screenshot_taken_at', { withTimezone: true }),
    metaTitle: varchar('meta_title', { length: 255 }),
    metaDescription: text('meta_description'),
    sortOrder: integer('sort_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'pages_organization_id_fk',
    }).onDelete('cascade'),
    orgIdIdx: index('pages_organization_id_idx').on(table.organizationId),
    isActiveIdx: index('pages_is_active_idx').on(table.isActive),
  }),
);

export const pagesRelations = relations(pagesTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [pagesTable.organizationId],
    references: [organizationsTable.id],
  }),
  comments: many(commentsTable),
}));

export type Page = typeof pagesTable.$inferSelect;
export type NewPage = typeof pagesTable.$inferInsert;
