import { pgTable, uuid, varchar, text, real, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';

export const clientWinsTable = pgTable(
  'client_wins',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    metricValue: varchar('metric_value', { length: 100 }), // e.g. "1,000", "78%"
    metricLabel: varchar('metric_label', { length: 100 }), // e.g. "Monthly Visitors", "Lead Rate"
    milestoneKey: varchar('milestone_key', { length: 100 }), // links back to milestone if auto-created
    shareImageUrl: text('share_image_url'),
    sharedAt: timestamp('shared_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'client_wins_org_id_fk',
    }).onDelete('cascade'),
    orgCreatedIdx: index('client_wins_org_created_idx').on(table.orgId, table.createdAt),
  }),
);

export const clientWinsRelations = relations(clientWinsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [clientWinsTable.orgId],
    references: [organizationsTable.id],
  }),
}));

export type ClientWin = typeof clientWinsTable.$inferSelect;
export type NewClientWin = typeof clientWinsTable.$inferInsert;
