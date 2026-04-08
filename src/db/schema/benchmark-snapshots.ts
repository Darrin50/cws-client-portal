import { pgTable, pgEnum, uuid, varchar, integer, real, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';

export const benchmarkMetricTypeEnum = pgEnum('metric_type', [
  'growth_score',
  'traffic_growth_rate',
  'lead_conversion_rate',
]);

export const benchmarkSnapshotsTable = pgTable(
  'benchmark_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    planType: varchar('plan_type', { length: 50 }).notNull(),
    metricType: benchmarkMetricTypeEnum('metric_type').notNull(),
    value: real('value').notNull(),
    percentile: integer('percentile').notNull(), // 0-100
    snapshotDate: varchar('snapshot_date', { length: 10 }).notNull(), // YYYY-MM-DD
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'benchmark_snapshots_org_id_fk',
    }).onDelete('cascade'),
    orgDateIdx: index('benchmark_snapshots_org_date_idx').on(table.orgId, table.snapshotDate),
    planMetricDateIdx: index('benchmark_snapshots_plan_metric_date_idx').on(
      table.planType,
      table.metricType,
      table.snapshotDate,
    ),
  }),
);

export const benchmarkSnapshotsRelations = relations(benchmarkSnapshotsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [benchmarkSnapshotsTable.orgId],
    references: [organizationsTable.id],
  }),
}));

export type BenchmarkSnapshot = typeof benchmarkSnapshotsTable.$inferSelect;
export type NewBenchmarkSnapshot = typeof benchmarkSnapshotsTable.$inferInsert;
