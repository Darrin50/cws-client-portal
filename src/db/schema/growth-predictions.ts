import {
  pgTable,
  pgEnum,
  uuid,
  text,
  real,
  integer,
  jsonb,
  timestamp,
  date,
  uniqueIndex,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';

export const metricTypeEnum = pgEnum('metric_type', ['visitors', 'leads', 'revenue', 'score']);

// Cached prediction snapshots (regenerated periodically)
export const growthPredictionsTable = pgTable(
  'growth_predictions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow().notNull(),
    metricType: metricTypeEnum('metric_type').notNull(),
    historicalData: jsonb('historical_data'),  // PredictionDataPoint[]
    predictedData: jsonb('predicted_data'),    // PredictionDataPoint[]
    growthRate: real('growth_rate'),           // % per month
    confidenceLevel: real('confidence_level'), // 0-1 (R²)
    narrative: text('narrative'),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'growth_predictions_org_id_fk',
    }).onDelete('cascade'),
    orgIdIdx: index('growth_predictions_org_id_idx').on(table.orgId),
    generatedAtIdx: index('growth_predictions_generated_at_idx').on(table.generatedAt),
  }),
);

// Client-set growth goals
export const growthGoalsTable = pgTable(
  'growth_goals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    metricType: metricTypeEnum('metric_type').notNull(),
    targetValue: integer('target_value').notNull(),
    targetDate: date('target_date'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'growth_goals_org_id_fk',
    }).onDelete('cascade'),
    orgMetricUnique: uniqueIndex('growth_goals_org_metric_unique').on(
      table.orgId,
      table.metricType,
    ),
    orgIdIdx: index('growth_goals_org_id_idx').on(table.orgId),
  }),
);

export const growthPredictionsRelations = relations(growthPredictionsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [growthPredictionsTable.orgId],
    references: [organizationsTable.id],
  }),
}));

export const growthGoalsRelations = relations(growthGoalsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [growthGoalsTable.orgId],
    references: [organizationsTable.id],
  }),
}));

export type GrowthPrediction = typeof growthPredictionsTable.$inferSelect;
export type NewGrowthPrediction = typeof growthPredictionsTable.$inferInsert;
export type GrowthGoal = typeof growthGoalsTable.$inferSelect;
export type NewGrowthGoal = typeof growthGoalsTable.$inferInsert;

export interface PredictionDataPoint {
  date: string;  // YYYY-MM-DD
  value: number;
}
