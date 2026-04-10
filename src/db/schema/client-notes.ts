import { pgTable, uuid, text, boolean, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';
import { usersTable } from './users';

export const clientNotesTable = pgTable(
  'client_notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    authorUserId: uuid('author_user_id').notNull(),
    body: text('body').notNull(),
    pinned: boolean('pinned').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'client_notes_org_id_fk',
    }).onDelete('cascade'),
    authorUserIdFk: foreignKey({
      columns: [table.authorUserId],
      foreignColumns: [usersTable.id],
      name: 'client_notes_author_user_id_fk',
    }).onDelete('cascade'),
    orgIdIdx: index('client_notes_org_id_idx').on(table.orgId),
    authorIdx: index('client_notes_author_user_id_idx').on(table.authorUserId),
  }),
);

export const clientNotesRelations = relations(clientNotesTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [clientNotesTable.orgId],
    references: [organizationsTable.id],
  }),
  author: one(usersTable, {
    fields: [clientNotesTable.authorUserId],
    references: [usersTable.id],
  }),
}));

export type ClientNote = typeof clientNotesTable.$inferSelect;
export type NewClientNote = typeof clientNotesTable.$inferInsert;
