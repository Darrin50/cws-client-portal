import { pgTable, pgEnum, uuid, text, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { pagesTable } from './pages';
import { organizationsTable } from './organizations';
import { usersTable } from './users';
import { commentAttachmentsTable } from './comment-attachments';

export const commentPriorityEnum = pgEnum('comment_priority', ['nice_to_have', 'important', 'urgent']);
export const commentStatusEnum = pgEnum('comment_status', ['new', 'in_progress', 'completed']);

export const commentsTable = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pageId: uuid('page_id').notNull(),
    organizationId: uuid('organization_id').notNull(),
    authorId: uuid('author_id').notNull(),
    content: text('content').notNull(),
    priority: commentPriorityEnum('priority').default('nice_to_have').notNull(),
    status: commentStatusEnum('status').default('new').notNull(),
    assignedToId: uuid('assigned_to_id'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pageIdFk: foreignKey({
      columns: [table.pageId],
      foreignColumns: [pagesTable.id],
      name: 'comments_page_id_fk',
    }).onDelete('cascade'),
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'comments_organization_id_fk',
    }).onDelete('cascade'),
    authorIdFk: foreignKey({
      columns: [table.authorId],
      foreignColumns: [usersTable.id],
      name: 'comments_author_id_fk',
    }).onDelete('cascade'),
    assignedToIdFk: foreignKey({
      columns: [table.assignedToId],
      foreignColumns: [usersTable.id],
      name: 'comments_assigned_to_id_fk',
    }).onDelete('set null'),
    orgStatusIdx: index('comments_org_status_idx').on(table.organizationId, table.status),
    priorityStatusIdx: index('comments_priority_status_idx').on(table.priority, table.status),
  }),
);

export const commentsRelations = relations(commentsTable, ({ one, many }) => ({
  page: one(pagesTable, {
    fields: [commentsTable.pageId],
    references: [pagesTable.id],
  }),
  organization: one(organizationsTable, {
    fields: [commentsTable.organizationId],
    references: [organizationsTable.id],
  }),
  author: one(usersTable, {
    fields: [commentsTable.authorId],
    references: [usersTable.id],
  }),
  assignedTo: one(usersTable, {
    fields: [commentsTable.assignedToId],
    references: [usersTable.id],
  }),
  attachments: many(commentAttachmentsTable),
}));

export type Comment = typeof commentsTable.$inferSelect;
export type NewComment = typeof commentsTable.$inferInsert;
