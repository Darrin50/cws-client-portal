import {
  pgTable,
  uuid,
  numeric,
  real,
  varchar,
  integer,
  timestamp,
  uniqueIndex,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';

export const revenueSettingsTable = pgTable(
  'revenue_settings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    /** Average dollar value of a closed deal */
    averageDealValue: numeric('average_deal_value', { precision: 10, scale: 2 })
      .default('5000')
      .notNull(),
    /** Fraction of leads that become closed deals (0.0 – 1.0) */
    closeRate: real('close_rate').default(0.25).notNull(),
    /** Fraction of leads that result in a call/meeting (0.0 – 1.0) */
    leadToCallRate: real('lead_to_call_rate').default(0.4).notNull(),
    /** Optional monthly revenue goal */
    revenueGoal: numeric('revenue_goal', { precision: 12, scale: 2 }),
    currency: varchar('currency', { length: 3 }).default('USD').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'revenue_settings_organization_id_fk',
    }).onDelete('cascade'),
    orgIdUniq: uniqueIndex('revenue_settings_organization_id_uniq').on(table.organizationId),
  }),
);

export const revenueSnapshotsTable = pgTable(
  'revenue_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    /** YYYY-MM */
    month: varchar('month', { length: 7 }).notNull(),
    visitors: integer('visitors').default(0).notNull(),
    leads: integer('leads').default(0).notNull(),
    calls: integer('calls').default(0).notNull(),
    deals: integer('deals').default(0).notNull(),
    estimatedRevenue: numeric('estimated_revenue', { precision: 12, scale: 2 })
      .default('0')
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'revenue_snapshots_organization_id_fk',
    }).onDelete('cascade'),
    orgMonthUniq: uniqueIndex('revenue_snapshots_org_month_uniq').on(
      table.organizationId,
      table.month,
    ),
  }),
);

export const revenueSettingsRelations = relations(revenueSettingsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [revenueSettingsTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export const revenueSnapshotsRelations = relations(revenueSnapshotsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [revenueSnapshotsTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export type RevenueSettings = typeof revenueSettingsTable.$inferSelect;
export type NewRevenueSettings = typeof revenueSettingsTable.$inferInsert;
export type RevenueSnapshot = typeof revenueSnapshotsTable.$inferSelect;
export type NewRevenueSnapshot = typeof revenueSnapshotsTable.$inferInsert;
