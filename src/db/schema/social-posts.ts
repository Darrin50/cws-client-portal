import { pgTable, pgEnum, uuid, text, jsonb, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';
import { usersTable } from './users';

export const socialPostStatusEnum = pgEnum('social_post_status', [
  'draft',
  'pending_approval',
  'approved',
  'published',
  'rejected',
]);

export const socialPostsTable = pgTable(
  'social_posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    content: text('content').notNull(),
    mediaUrls: jsonb('media_urls'),
    platforms: jsonb('platforms'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    status: socialPostStatusEnum('status').default('draft').notNull(),
    rejectionNote: text('rejection_note'),
    metrics: jsonb('metrics'),
    createdById: uuid('created_by_id').notNull(),
    approvedById: uuid('approved_by_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'social_posts_organization_id_fk',
    }).onDelete('cascade'),
    createdByIdFk: foreignKey({
      columns: [table.createdById],
      foreignColumns: [usersTable.id],
      name: 'social_posts_created_by_id_fk',
    }).onDelete('cascade'),
    approvedByIdFk: foreignKey({
      columns: [table.approvedById],
      foreignColumns: [usersTable.id],
      name: 'social_posts_approved_by_id_fk',
    }).onDelete('set null'),
    orgIdIdx: index('social_posts_organization_id_idx').on(table.organizationId),
    statusIdx: index('social_posts_status_idx').on(table.status),
    createdByIdIdx: index('social_posts_created_by_id_idx').on(table.createdById),
  }),
);

export const socialPostsRelations = relations(socialPostsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [socialPostsTable.organizationId],
    references: [organizationsTable.id],
  }),
  createdBy: one(usersTable, {
    fields: [socialPostsTable.createdById],
    references: [usersTable.id],
    relationName: 'createdBy',
  }),
  approvedBy: one(usersTable, {
    fields: [socialPostsTable.approvedById],
    references: [usersTable.id],
    relationName: 'approvedBy',
  }),
}));

export type SocialPost = typeof socialPostsTable.$inferSelect;
export type NewSocialPost = typeof socialPostsTable.$inferInsert;
