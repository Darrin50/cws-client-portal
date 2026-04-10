import { pgTable, pgEnum, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';

export const cronRunStatusEnum = pgEnum('cron_run_status', ['success', 'error']);

export const cronRunsTable = pgTable(
  'cron_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cronName: varchar('cron_name', { length: 100 }).notNull(),
    orgId: uuid('org_id'),
    status: cronRunStatusEnum('status').notNull(),
    ranAt: timestamp('ran_at', { withTimezone: true }).defaultNow().notNull(),
    errorMessage: text('error_message'),
  },
  (table) => ({
    cronNameIdx: index('cron_runs_cron_name_idx').on(table.cronName),
    ranAtIdx: index('cron_runs_ran_at_idx').on(table.ranAt),
    statusIdx: index('cron_runs_status_idx').on(table.status),
  }),
);

export type CronRun = typeof cronRunsTable.$inferSelect;
export type NewCronRun = typeof cronRunsTable.$inferInsert;
