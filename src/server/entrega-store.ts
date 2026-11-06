import { queryUpsert, type EntregaWrite, type StoredEntrega } from '../lib/entrega-record';
import { getPool } from './db';

export async function saveEntrega(write: EntregaWrite): Promise<StoredEntrega> {
  const pool = getPool();
  if (!pool) throw new Error('Sin base');
  return queryUpsert((sql, params) => pool.query(sql, params as unknown[]), write);
}
