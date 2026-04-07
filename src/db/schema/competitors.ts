import { pgTable, uuid, varchar, timestamp, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';

export const competitorsTable = pgTable(
  'cws_competitors',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizationsTable.id, { onDelete: 'cascade' }),
    url: varchar('url', { length: 500 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    lastScannedAt: timestamp('last_scanned_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('competitors_org_idx').on(table.organizationId),
  }),
);

export const competitorSnapshotsTable = pgTable(
  'cws_competitor_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    competitorId: uuid('competitor_id').notNull().references(() => competitorsTable.id, { onDelete: 'cascade' }),
    scannedAt: timestamp('scanned_at', { withTimezone: true }).defaultNow().notNull(),
    pageCount: integer('page_count').default(0).notNull(),
    data: jsonb('data'),
    report: varchar('report', { length: 10000 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    competitorIdx: index('competitor_snapshots_competitor_idx').on(table.competitorId),
    scannedAtIdx: index('competitor_snapshots_scanned_at_idx').on(table.scannedAt),
  }),
);

export const competitorsRelations = relations(competitorsTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [competitorsTable.organizationId],
    references: [organizationsTable.id],
  }),
  snapshots: many(competitorSnapshotsTable),
}));

export const competitorSnapshotsRelations = relations(competitorSnapshotsTable, ({ one }) => ({
  competitor: one(competitorsTable, {
    fields: [competitorSnapshotsTable.competitorId],
    references: [competitorsTable.id],
  }),
}));

export type Competitor = typeof competitorsTable.$inferSelect;
export type NewCompetitor = typeof competitorsTable.$inferInsert;
export type CompetitorSnapshot = typeof competitorSnapshotsTable.$inferSelect;
export type NewCompetitorSnapshot = typeof competitorSnapshotsTable.$inferInsert;
