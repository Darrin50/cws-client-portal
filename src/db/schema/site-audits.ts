import { pgTable, uuid, varchar, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';

export const siteAuditsTable = pgTable(
  'cws_site_audits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizationsTable.id, { onDelete: 'cascade' }),
    auditedAt: timestamp('audited_at', { withTimezone: true }).defaultNow().notNull(),
    overallGrade: varchar('overall_grade', { length: 2 }).notNull(), // A, B, C, D, F
    scores: jsonb('scores').notNull(), // { content: 'A', cta: 'B', mobile: 'C', seo: 'A', speed: 'B' }
    recommendations: jsonb('recommendations').notNull(), // Array of { category, item, priority }
    pagesAudited: jsonb('pages_audited'), // Array of page URLs crawled
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('site_audits_org_idx').on(table.organizationId),
    auditedAtIdx: index('site_audits_audited_at_idx').on(table.auditedAt),
  }),
);

export const siteAuditsRelations = relations(siteAuditsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [siteAuditsTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export type SiteAudit = typeof siteAuditsTable.$inferSelect;
export type NewSiteAudit = typeof siteAuditsTable.$inferInsert;
