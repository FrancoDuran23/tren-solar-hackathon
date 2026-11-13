/** Persistencia de una entrega por usuario. El reenvío pisa los campos y conserva el Hacker ID. */

import type { EntregaInput } from './entrega.ts';

/**
 * Columnas que un reenvío puede cambiar.
 * `hacker_id` y `submitted_at` quedan los del primer envío.
 */
export const ENTREGA_MUTABLE_COLUMNS = [
  'email',
  'proyecto',
  'responsable',
  'jujuy',
  'localidad',
  'repo',
  'demo',
  'video',
  'traction_tipo',
  'traction_numero',
  'traction_evidencia',
  'descripcion',
  'updated_at',
] as const;

const UPDATE_SET = ENTREGA_MUTABLE_COLUMNS.map((column) => `${column} = EXCLUDED.${column}`).join(',\n  ');

export const CREATE_ENTREGA_SQL = `
CREATE TABLE IF NOT EXISTS entrega (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  hacker_id TEXT NOT NULL,
  email TEXT NOT NULL,
  proyecto TEXT NOT NULL,
  responsable TEXT NOT NULL,
  jujuy BOOLEAN NOT NULL,
  localidad TEXT NOT NULL DEFAULT '',
  repo TEXT NOT NULL,
  demo TEXT NOT NULL,
  video TEXT NOT NULL,
  traction_tipo TEXT NOT NULL DEFAULT '',
  traction_numero TEXT NOT NULL DEFAULT '',
  traction_evidencia TEXT NOT NULL DEFAULT '',
  descripcion TEXT NOT NULL DEFAULT '',
  submitted_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
`;

export const UPSERT_ENTREGA_SQL = `
INSERT INTO entrega (
  user_id, hacker_id, email, proyecto, responsable, jujuy, localidad,
  repo, demo, video, traction_tipo, traction_numero, traction_evidencia,
  descripcion, submitted_at, updated_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7,
  $8, $9, $10, $11, $12, $13,
  $14, $15, $15
)
ON CONFLICT (user_id) DO UPDATE SET
  ${UPDATE_SET}
RETURNING
  user_id, hacker_id, email, proyecto, responsable, jujuy, localidad,
  repo, demo, video, traction_tipo, traction_numero, traction_evidencia,
  descripcion, submitted_at, updated_at
`;

export interface EntregaWrite {
  userId: string;
  hackerId: string;
  at: string;
  input: EntregaInput;
}

export interface StoredEntrega {
  userId: string;
  hackerId: string;
  submittedAt: string;
  updatedAt: string;
  input: EntregaInput;
}

export interface EntregaWebhookBody extends EntregaInput {
  hackerId: string;
  submittedAt: string;
  userId: string;
}

interface EntregaSqlRow {
  user_id: string;
  hacker_id: string;
  email: string;
  proyecto: string;
  responsable: string;
  jujuy: boolean;
  localidad: string;
  repo: string;
  demo: string;
  video: string;
  traction_tipo: string;
  traction_numero: string;
  traction_evidencia: string;
  descripcion: string;
  submitted_at: Date | string;
  updated_at: Date | string;
}

export type SqlQuery = (
  sql: string,
  params: readonly unknown[],
) => Promise<{ rows: EntregaSqlRow[] }>;

function toIso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Fecha de entrega inválida');
  return date.toISOString();
}

export function mapEntregaRow(row: EntregaSqlRow): StoredEntrega {
  return {
    userId: row.user_id,
    hackerId: row.hacker_id,
    submittedAt: toIso(row.submitted_at),
    updatedAt: toIso(row.updated_at),
    input: {
      proyecto: row.proyecto,
      responsable: row.responsable,
      email: row.email,
      jujuy: row.jujuy,
      localidad: row.localidad,
      repo: row.repo,
      demo: row.demo,
      video: row.video,
      tractionTipo: row.traction_tipo,
      tractionNumero: row.traction_numero,
      tractionEvidencia: row.traction_evidencia,
      descripcion: row.descripcion,
    },
  };
}

/** Misma regla que el ON CONFLICT: primera fila crea, la siguiente actualiza. */
export function mergeEntrega(prev: StoredEntrega | null, write: EntregaWrite): StoredEntrega {
  if (prev === null || prev.userId !== write.userId) {
    return {
      userId: write.userId,
      hackerId: write.hackerId,
      submittedAt: write.at,
      updatedAt: write.at,
      input: write.input,
    };
  }
  return {
    userId: prev.userId,
    hackerId: prev.hackerId,
    submittedAt: prev.submittedAt,
    updatedAt: write.at,
    input: write.input,
  };
}

export function entregaWebhookPayload(saved: StoredEntrega): EntregaWebhookBody {
  return {
    ...saved.input,
    hackerId: saved.hackerId,
    submittedAt: saved.updatedAt,
    userId: saved.userId,
  };
}

export async function queryUpsert(query: SqlQuery, write: EntregaWrite): Promise<StoredEntrega> {
  const input = write.input;
  const { rows } = await query(UPSERT_ENTREGA_SQL, [
    write.userId,
    write.hackerId,
    input.email,
    input.proyecto,
    input.responsable,
    input.jujuy,
    input.localidad,
    input.repo,
    input.demo,
    input.video,
    input.tractionTipo,
    input.tractionNumero,
    input.tractionEvidencia,
    input.descripcion,
    write.at,
  ]);
  const row = rows[0];
  if (!row) throw new Error('No se pudo guardar la entrega');
  return mapEntregaRow(row);
}

export const SELECT_ENTREGA_SQL = `
SELECT
  user_id, hacker_id, email, proyecto, responsable, jujuy, localidad,
  repo, demo, video, traction_tipo, traction_numero, traction_evidencia,
  descripcion, submitted_at, updated_at
FROM entrega
WHERE user_id = $1
`;

/** Lee la entrega guardada del usuario (o null si todavía no entregó). */
export async function queryRead(query: SqlQuery, userId: string): Promise<StoredEntrega | null> {
  const { rows } = await query(SELECT_ENTREGA_SQL, [userId]);
  const row = rows[0];
  return row ? mapEntregaRow(row) : null;
}
