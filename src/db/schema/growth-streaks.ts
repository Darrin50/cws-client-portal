import {
  pgTable,
  uuid,
  integer,
  boolean,
  timestamp,
  date,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';

/** One record per org — tracks current and longest streak */
export const growthStreaksTable = pgTable(
  'growth_streaks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    currentStreak: integer('current_streak').default(0).notNull(),
    longestStreak: integer('longest_streak').default(0).notNull(),
    /** Resets to true on the 1st week of each calendar month */
    streakFreezeAvailable: boolean('streak_freeze_available').default(true).notNull(),
    lastCalculatedAt: timestamp('last_calculated_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgFk: foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'growth_streaks_org_id_fk',
    }).onDelete('cascade'),
    orgIdx: index('growth_streaks_org_idx').on(table.orgId),
  }),
);

/** One record per org per week — the calendar view source of truth */
export const growthStreakWeeksTable = pgTable(
  'growth_streak_weeks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    /** ISO date of the Monday that started this week (YYYY-MM-DD) */
    weekStart: date('week_start').notNull(),
    growthScore: integer('growth_score').notNull(),
    previousScore: integer('previous_score'),
    /** true if growthScore >= previousScore (or first week) */
    improved: boolean('improved').default(false).notNull(),
    /** true if a streak freeze was consumed to keep the streak alive */
    freezeUsed: boolean('freeze_used').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgFk: foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'growth_streak_weeks_org_id_fk',
    }).onDelete('cascade'),
    orgWeekIdx: index('growth_streak_weeks_org_week_idx').on(table.orgId, table.weekStart),
  }),
);

export const growthStreaksRelations = relations(growthStreaksTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [growthStreaksTable.orgId],
    references: [organizationsTable.id],
  }),
}));

export const growthStreakWeeksRelations = relations(growthStreakWeeksTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [growthStreakWeeksTable.orgId],
    references: [organizationsTable.id],
  }),
}));

export type GrowthStreak = typeof growthStreaksTable.$inferSelect;
export type NewGrowthStreak = typeof growthStreaksTable.$inferInsert;
export type GrowthStreakWeek = typeof growthStreakWeeksTable.$inferSelect;
export type NewGrowthStreakWeek = typeof growthStreakWeeksTable.$inferInsert;
