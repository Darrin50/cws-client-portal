import { pgTable, uuid, varchar, integer, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { commentsTable } from './comments';

export const commentAttachmentsTable = pgTable(
  'comment_attachments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    commentId: uuid('comment_id').notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    fileUrl: varchar('file_url', { length: 500 }).notNull(),
    fileSize: integer('file_size'),
    mimeType: varchar('mime_type', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    commentIdFk: foreignKey({
      columns: [table.commentId],
      foreignColumns: [commentsTable.id],
      name: 'comment_attachments_comment_id_fk',
    }).onDelete('cascade'),
  }),
);

export const commentAttachmentsRelations = relations(commentAttachmentsTable, ({ one }) => ({
  comment: one(commentsTable, {
    fields: [commentAttachmentsTable.commentId],
    references: [commentsTable.id],
  }),
}));

export type CommentAttachment = typeof commentAttachmentsTable.$inferSelect;
export type NewCommentAttachment = typeof commentAttachmentsTable.$inferInsert;
