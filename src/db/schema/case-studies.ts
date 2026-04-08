import { pgTable, pgEnum, uuid, varchar, text, jsonb, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';

export const caseStudyStatusEnum = pgEnum('case_study_status', ['draft', 'approved', 'published']);

export const caseStudiesTable = pgTable(
  'case_studies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    title: varchar('title', { length: 500 }).notNull(),
    challenge: text('challenge').notNull(),
    solution: text('solution').notNull(),
    results: text('results').notNull(),
    metrics: jsonb('metrics'),
    status: caseStudyStatusEnum('status').default('draft').notNull(),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'case_studies_org_id_fk',
    }).onDelete('cascade'),
    orgIdIdx: index('case_studies_org_id_idx').on(table.orgId),
    statusIdx: index('case_studies_status_idx').on(table.status),
  }),
);

export const caseStudiesRelations = relations(caseStudiesTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [caseStudiesTable.orgId],
    references: [organizationsTable.id],
  }),
}));

export type CaseStudy = typeof caseStudiesTable.$inferSelect;
export type NewCaseStudy = typeof caseStudiesTable.$inferInsert;

export interface CaseStudyMetrics {
  trafficIncrease?: number;
  leadIncrease?: number;
  rankingImprovement?: string;
  growthScoreStart?: number;
  growthScoreCurrent?: number;
  monthsAsClient?: number;
  milestonesEarned?: number;
}
