import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Lazy initialization: the throw only happens at query time, not at module load.
// This prevents Next.js build-time failures when DATABASE_URL is not in the build env.
const getDb = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return drizzle(neon(process.env.DATABASE_URL), { schema });
};

let _db: ReturnType<typeof getDb> | undefined;

export const db: ReturnType<typeof getDb> = new Proxy(
  {} as ReturnType<typeof getDb>,
  {
    get(_target, prop) {
      if (!_db) _db = getDb();
      return (_db as unknown as Record<string | symbol, unknown>)[prop];
    },
  }
);

export type Database = ReturnType<typeof getDb>;
