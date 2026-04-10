import { db } from '@/db';
import { cronRunsTable } from '@/db/schema';

/**
 * Log a cron job run result to cron_runs table.
 * Call once per cron execution (not per org) to capture overall health.
 * Errors are swallowed so a failed DB write doesn't break the cron response.
 */
export async function logCronRun(
  cronName: string,
  status: 'success' | 'error',
  errorMessage?: string,
): Promise<void> {
  try {
    await db.insert(cronRunsTable).values({
      cronName,
      status,
      errorMessage: errorMessage ?? null,
    });
  } catch (err) {
    console.error(`[cron-logger] Failed to log cron run for "${cronName}":`, err);
  }
}
