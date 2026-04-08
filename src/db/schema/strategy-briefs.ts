import { pgTable, uuid, text, timestamp, date, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';

export const strategyBriefsTable = pgTable(
  'strategy_briefs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    month: date('month').notNull(), // e.g. "2026-04-01"
    accomplishments: text('accomplishments').notNull(),
    impactAnalysis: text('impact_analysis').notNull(),
    recommendations: text('recommendations').notNull(),
    fullBrief: text('full_brief').notNull(),
    generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow().notNull(),
    viewedAt: timestamp('viewed_at', { withTimezone: true }),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'strategy_briefs_org_id_fk',
    }).onDelete('cascade'),
    orgMonthIdx: index('strategy_briefs_org_month_idx').on(table.orgId, table.month),
  }),
);

export const strategyBriefsRelations = relations(strategyBriefsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [strategyBriefsTable.orgId],
    references: [organizationsTable.id],
  }),
}));

export type StrategyBrief = typeof strategyBriefsTable.$inferSelect;
export type NewStrategyBrief = typeof strategyBriefsTable.$inferInsert;
