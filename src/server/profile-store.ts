import type { ProfileInput } from '../lib/profile';
import { normalizeGithubUrl } from '../lib/profile';
import { getPool } from './db';

interface ProfileDb {
  full_name: string;
  lives_in_jujuy: boolean;
  localidad: string;
  github_url: string;
  one_liner: string;
}

function mapRow(row: ProfileDb): ProfileInput {
  return {
    fullName: row.full_name,
    livesInJujuy: row.lives_in_jujuy,
    localidad: row.localidad,
    githubUrl: row.github_url,
    oneLiner: row.one_liner,
  };
}

export async function readProfile(userId: string): Promise<ProfileInput | null> {
  const pool = getPool();
  if (!pool) throw new Error('Sin base');
  const { rows } = await pool.query<ProfileDb>(
    'SELECT full_name, lives_in_jujuy, localidad, github_url, one_liner FROM profile WHERE user_id = $1',
    [userId],
  );
  const row = rows[0];
  return row ? mapRow(row) : null;
}

export async function writeProfile(userId: string, input: ProfileInput): Promise<ProfileInput> {
  const pool = getPool();
  if (!pool) throw new Error('Sin base');
  const github = normalizeGithubUrl(input.githubUrl) ?? '';
  const { rows } = await pool.query<ProfileDb>(
    `INSERT INTO profile (user_id, full_name, lives_in_jujuy, localidad, github_url, one_liner, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       full_name = EXCLUDED.full_name,
       lives_in_jujuy = EXCLUDED.lives_in_jujuy,
       localidad = EXCLUDED.localidad,
       github_url = EXCLUDED.github_url,
       one_liner = EXCLUDED.one_liner,
       updated_at = NOW()
     RETURNING full_name, lives_in_jujuy, localidad, github_url, one_liner`,
    [userId, input.fullName.trim(), input.livesInJujuy, input.localidad.trim(), github, input.oneLiner.trim()],
  );
  const row = rows[0];
  if (!row) throw new Error('No se pudo guardar el perfil');
  return mapRow(row);
}
