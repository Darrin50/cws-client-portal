import { pgTable, uuid, text, date, jsonb, timestamp, uniqueIndex, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';

export const morningBriefsTable = pgTable(
  'cws_morning_briefs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    date: date('date').notNull(),
    briefData: jsonb('brief_data'),
    aiSummary: text('ai_summary'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'morning_briefs_organization_id_fk',
    }).onDelete('cascade'),
    orgDateUnique: uniqueIndex('morning_briefs_org_date_unique').on(table.organizationId, table.date),
    orgIdIdx: index('morning_briefs_org_id_idx').on(table.organizationId),
  }),
);

export const morningBriefsRelations = relations(morningBriefsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [morningBriefsTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export type MorningBrief = typeof morningBriefsTable.$inferSelect;
export type NewMorningBrief = typeof morningBriefsTable.$inferInsert;

export interface MorningBriefData {
  orgName: string;
  newLeadsOvernight: number;
  newMessagesOvernight: number;
  growthScore: number;
  growthScoreDelta: number | null;
  healthScore: number;
  competitorAlert: string | null;
  unreadMessages: number;
  openRequests: number;
  recommendedAction: string;
  milestoneHit: string | null;
}
