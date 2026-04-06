import { pgTable, uuid, text, boolean, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';
import { usersTable } from './users';

export const messagesTable = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    senderId: uuid('sender_id').notNull(),
    content: text('content').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'messages_organization_id_fk',
    }).onDelete('cascade'),
    senderIdFk: foreignKey({
      columns: [table.senderId],
      foreignColumns: [usersTable.id],
      name: 'messages_sender_id_fk',
    }).onDelete('cascade'),
    orgIdIdx: index('messages_organization_id_idx').on(table.organizationId),
    isReadIdx: index('messages_is_read_idx').on(table.isRead),
  }),
);

export const messageAttachmentsTable = pgTable(
  'message_attachments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    messageId: uuid('message_id').notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    fileUrl: varchar('file_url', { length: 500 }).notNull(),
    fileSize: integer('file_size'),
    mimeType: varchar('mime_type', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    messageIdFk: foreignKey({
      columns: [table.messageId],
      foreignColumns: [messagesTable.id],
      name: 'message_attachments_message_id_fk',
    }).onDelete('cascade'),
  }),
);

export const messagesRelations = relations(messagesTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [messagesTable.organizationId],
    references: [organizationsTable.id],
  }),
  sender: one(usersTable, {
    fields: [messagesTable.senderId],
    references: [usersTable.id],
  }),
  attachments: many(messageAttachmentsTable),
}));

export const messageAttachmentsRelations = relations(messageAttachmentsTable, ({ one }) => ({
  message: one(messagesTable, {
    fields: [messageAttachmentsTable.messageId],
    references: [messagesTable.id],
  }),
}));

import { varchar, integer } from 'drizzle-orm/pg-core';

export type Message = typeof messagesTable.$inferSelect;
export type NewMessage = typeof messagesTable.$inferInsert;
export type MessageAttachment = typeof messageAttachmentsTable.$inferSelect;
export type NewMessageAttachment = typeof messageAttachmentsTable.$inferInsert;
