import type { MeRanking } from '../lib/me';
import type { RankingUpdate } from '../lib/ranking-input';
import { getPool } from './db';

export async function readRanking(email: string): Promise<MeRanking> {
  const pool = getPool();
  if (!pool) throw new Error('Sin base');
  const meta = await pool.query<{ week_label: string | null; updated_at: Date }>(
    'SELECT week_label, updated_at FROM ranking_meta WHERE id = 1',
  );
  const row = await pool.query<{ in_top: boolean; updated_at: Date }>(
    'SELECT in_top, updated_at FROM ranking WHERE email = $1',
    [email.toLowerCase()],
  );
  const mine = row.rows[0];
  const published = meta.rows[0];
  const when = mine?.updated_at ?? published?.updated_at ?? null;
  return {
    inTop: mine?.in_top ?? false,
    updatedAt: when ? new Date(when).toISOString() : null,
    weekLabel: published?.week_label ?? null,
  };
}

export interface RankingWriteResult {
  inTop: number;
  total: number;
  weekLabel: string | null;
}

/**
 * Reemplazo total: los emails del body quedan inTop=true y el resto de las filas
 * pasan a inTop=false. Quien no tiene fila se lee como "todavía no" hasta que entre en una lista.
 */
export async function replaceRanking(update: RankingUpdate): Promise<RankingWriteResult> {
  const pool = getPool();
  if (!pool) throw new Error('Sin base');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE ranking SET in_top = FALSE, updated_at = NOW(), week_label = $1', [update.weekLabel]);
    if (update.emails.length > 0) {
      await client.query(
        `INSERT INTO ranking (email, in_top, updated_at, week_label)
         SELECT unnest($1::text[]), TRUE, NOW(), $2
         ON CONFLICT (email) DO UPDATE
           SET in_top = TRUE, updated_at = NOW(), week_label = EXCLUDED.week_label`,
        [update.emails, update.weekLabel],
      );
    }
    await client.query(
      `INSERT INTO ranking_meta (id, week_label, updated_at)
       VALUES (1, $1, NOW())
       ON CONFLICT (id) DO UPDATE SET week_label = EXCLUDED.week_label, updated_at = NOW()`,
      [update.weekLabel],
    );
    const counts = await client.query<{ in_top: string; total: string }>(
      'SELECT COUNT(*) FILTER (WHERE in_top) AS in_top, COUNT(*) AS total FROM ranking',
    );
    await client.query('COMMIT');
    const row = counts.rows[0];
    return {
      inTop: Number(row?.in_top ?? 0),
      total: Number(row?.total ?? 0),
      weekLabel: update.weekLabel,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
