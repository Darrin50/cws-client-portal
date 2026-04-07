import { pgTable, pgEnum, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';
import { brandAssetsTable } from './brand-assets';

export const scheduledPostStatusEnum = pgEnum('scheduled_post_status', [
  'draft',
  'scheduled',
  'published',
  'cancelled',
  'failed',
]);

export const scheduledPostsTable = pgTable(
  'cws_scheduled_posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizationsTable.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id').references(() => brandAssetsTable.id, { onDelete: 'set null' }),
    platform: varchar('platform', { length: 50 }).notNull(),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    caption: text('caption'),
    imageUrl: varchar('image_url', { length: 1000 }),
    status: scheduledPostStatusEnum('status').default('scheduled').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('scheduled_posts_org_idx').on(table.organizationId),
    scheduledAtIdx: index('scheduled_posts_scheduled_at_idx').on(table.scheduledAt),
  }),
);

export const scheduledPostsRelations = relations(scheduledPostsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [scheduledPostsTable.organizationId],
    references: [organizationsTable.id],
  }),
  asset: one(brandAssetsTable, {
    fields: [scheduledPostsTable.assetId],
    references: [brandAssetsTable.id],
  }),
}));

export type ScheduledPost = typeof scheduledPostsTable.$inferSelect;
export type NewScheduledPost = typeof scheduledPostsTable.$inferInsert;
