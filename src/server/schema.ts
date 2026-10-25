import type { Pool } from 'pg';

/** Tablas propias. Las de Better Auth las crea su migrador antes de esto. */
const APP_SQL = `
CREATE TABLE IF NOT EXISTS profile (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  lives_in_jujuy BOOLEAN NOT NULL DEFAULT FALSE,
  localidad TEXT NOT NULL DEFAULT '',
  github_url TEXT NOT NULL DEFAULT '',
  one_liner TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ranking (
  email TEXT PRIMARY KEY,
  in_top BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  week_label TEXT
);
CREATE TABLE IF NOT EXISTS ranking_meta (
  id INTEGER PRIMARY KEY,
  week_label TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ranking_meta_singleton CHECK (id = 1)
);
`;

export async function ensureAppSchema(pool: Pool): Promise<void> {
  await pool.query(APP_SQL);
}
