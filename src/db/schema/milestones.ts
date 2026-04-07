import { pgTable, uuid, varchar, timestamp, boolean, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';

export const milestonesTable = pgTable(
  'milestones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    milestoneKey: varchar('milestone_key', { length: 100 }).notNull(),
    earnedAt: timestamp('earned_at', { withTimezone: true }).defaultNow().notNull(),
    notified: boolean('notified').default(false).notNull(),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'milestones_organization_id_fk',
    }).onDelete('cascade'),
    orgKeyIdx: index('milestones_org_key_idx').on(table.organizationId, table.milestoneKey),
  }),
);

export const milestonesRelations = relations(milestonesTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [milestonesTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export type Milestone = typeof milestonesTable.$inferSelect;
export type NewMilestone = typeof milestonesTable.$inferInsert;
