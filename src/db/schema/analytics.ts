import { pgTable, pgEnum, uuid, varchar, text, jsonb, timestamp, date, uniqueIndex, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';

export const analyticsSourceEnum = pgEnum('analytics_source', ['ga4', 'gbp', 'meta']);
export const leadStatusEnum = pgEnum('lead_status', ['new', 'contacted', 'converted', 'closed']);

export const analyticsSnapshotsTable = pgTable(
  'analytics_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    snapshotDate: date('snapshot_date').notNull(),
    source: analyticsSourceEnum('source').notNull(),
    metrics: jsonb('metrics'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'analytics_snapshots_organization_id_fk',
    }).onDelete('cascade'),
    orgDateSourceUnique: uniqueIndex('analytics_snapshots_org_date_source_unique').on(
      table.organizationId,
      table.snapshotDate,
      table.source,
    ),
    orgIdIdx: index('analytics_snapshots_organization_id_idx').on(table.organizationId),
    snapshotDateIdx: index('analytics_snapshots_snapshot_date_idx').on(table.snapshotDate),
  }),
);

export const leadsTable = pgTable(
  'leads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 20 }),
    formSource: varchar('form_source', { length: 255 }),
    message: text('message'),
    status: leadStatusEnum('status').default('new').notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'leads_organization_id_fk',
    }).onDelete('cascade'),
    orgIdIdx: index('leads_organization_id_idx').on(table.organizationId),
    statusIdx: index('leads_status_idx').on(table.status),
    emailIdx: index('leads_email_idx').on(table.email),
  }),
);

export const analyticsSnapshotsRelations = relations(analyticsSnapshotsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [analyticsSnapshotsTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export const leadsRelations = relations(leadsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [leadsTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export type AnalyticsSnapshot = typeof analyticsSnapshotsTable.$inferSelect;
export type NewAnalyticsSnapshot = typeof analyticsSnapshotsTable.$inferInsert;
export type Lead = typeof leadsTable.$inferSelect;
export type NewLead = typeof leadsTable.$inferInsert;
