import { attachDatabasePool } from '@vercel/functions';
import { Pool, type Pool as PgPool } from 'pg';
import { env } from './env';

let pool: PgPool | null = null;

/** Pool chico para Fluid/serverless. En Vercel, attachDatabasePool espera a cerrar conexiones idle. */
export function getPool(): PgPool | null {
  if (!env.databaseUrl) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: env.databaseUrl,
      max: 1,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 10000,
      application_name: 'pre-hackaton',
    });
    pool.on('error', (err: Error) => {
      console.error('[db] conexión idle', err.message);
    });
    attachDatabasePool(pool);
  }
  return pool;
}
