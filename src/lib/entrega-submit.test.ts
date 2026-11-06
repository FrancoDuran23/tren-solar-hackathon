import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import type { EntregaInput } from './entrega.ts';
import {
  CREATE_ENTREGA_SQL,
  ENTREGA_MUTABLE_COLUMNS,
  UPSERT_ENTREGA_SQL,
  entregaWebhookPayload,
  mergeEntrega,
  queryUpsert,
  type EntregaWrite,
  type SqlQuery,
  type StoredEntrega,
} from './entrega-record.ts';
import { ENTREGA_SAVE_ERROR, finishEntrega, type EntregaDelivery } from './entrega-submit.ts';

const input: EntregaInput = {
  proyecto: 'Tren Solar',
  responsable: 'Ana Pérez',
  email: 'ana@gmail.com',
  jujuy: true,
  localidad: 'San Salvador de Jujuy',
  repo: 'https://github.com/ana/tren',
  demo: 'https://demo.example.com',
  video: 'https://youtu.be/abc',
  tractionTipo: 'users',
  tractionNumero: '12',
  tractionEvidencia: 'https://demo.example.com/traction',
  descripcion: 'Una app para el colectivo.',
};

function write(over: Partial<EntregaWrite> = {}): EntregaWrite {
  return {
    userId: 'user-1',
    hackerId: 'JDV-2026-0007',
    at: '2026-11-06T15:00:00.000Z',
    input,
    ...over,
  };
}

function memorySave() {
  const rows = new Map<string, StoredEntrega>();
  const save = async (next: EntregaWrite) => {
    const stored = mergeEntrega(rows.get(next.userId) ?? null, next);
    rows.set(next.userId, stored);
    return stored;
  };
  return { rows, save };
}

function silent(over: Partial<EntregaDelivery> = {}): EntregaDelivery {
  return {
    save: async (next) => mergeEntrega(null, next),
    webhookUrl: undefined,
    post: async () => ({ ok: true, status: 200 }),
    log: () => {},
    ...over,
  };
}

describe('entrega en Neon', () => {
  it('crea la tabla con una fila por usuario', () => {
    assert.match(CREATE_ENTREGA_SQL, /CREATE TABLE IF NOT EXISTS entrega/);
    assert.match(CREATE_ENTREGA_SQL, /user_id TEXT PRIMARY KEY REFERENCES "user"\(id\) ON DELETE CASCADE/);
    assert.match(CREATE_ENTREGA_SQL, /hacker_id TEXT NOT NULL/);
    assert.match(CREATE_ENTREGA_SQL, /submitted_at TIMESTAMPTZ NOT NULL/);
    const mutable = ENTREGA_MUTABLE_COLUMNS as readonly string[];
    assert.equal(mutable.includes('hacker_id'), false);
    assert.equal(mutable.includes('submitted_at'), false);
    for (const column of ['repo', 'demo', 'video', 'updated_at'] as const) {
      assert.equal(ENTREGA_MUTABLE_COLUMNS.includes(column), true);
      assert.match(UPSERT_ENTREGA_SQL, new RegExp(`${column} = EXCLUDED\\.${column}`));
    }
    assert.match(UPSERT_ENTREGA_SQL, /ON CONFLICT \(user_id\)/);
    assert.equal(UPSERT_ENTREGA_SQL.includes('hacker_id ='), false);
    assert.equal(UPSERT_ENTREGA_SQL.includes('submitted_at ='), false);
  });

  it('el schema de arranque incluye la tabla', () => {
    const schema = readFileSync(new URL('../server/schema.ts', import.meta.url), 'utf8');
    assert.match(schema, /CREATE_ENTREGA_SQL/);
  });

  it('el upsert manda los campos y se queda con el hacker id que devuelve la base', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const query: SqlQuery = async (sql, params) => {
      calls.push({ sql, params });
      return {
        rows: [
          {
            user_id: 'user-1',
            hacker_id: 'JDV-2026-0007',
            email: input.email,
            proyecto: input.proyecto,
            responsable: input.responsable,
            jujuy: true,
            localidad: input.localidad,
            repo: input.repo,
            demo: input.demo,
            video: input.video,
            traction_tipo: input.tractionTipo,
            traction_numero: input.tractionNumero,
            traction_evidencia: input.tractionEvidencia,
            descripcion: input.descripcion,
            submitted_at: new Date('2026-11-06T15:00:00.000Z'),
            updated_at: new Date('2026-11-07T18:30:00.000Z'),
          },
        ],
      };
    };
    const saved = await queryUpsert(query, write({ hackerId: 'JDV-2026-9999' }));
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.sql, UPSERT_ENTREGA_SQL);
    assert.deepEqual(calls[0]?.params, [
      'user-1',
      'JDV-2026-9999',
      input.email,
      input.proyecto,
      input.responsable,
      true,
      input.localidad,
      input.repo,
      input.demo,
      input.video,
      'users',
      '12',
      input.tractionEvidencia,
      input.descripcion,
      '2026-11-06T15:00:00.000Z',
    ]);
    assert.equal(saved.hackerId, 'JDV-2026-0007');
    assert.equal(saved.submittedAt, '2026-11-06T15:00:00.000Z');
    assert.equal(saved.updatedAt, '2026-11-07T18:30:00.000Z');
    assert.equal(saved.input.repo, input.repo);
  });

  it('si la base no devuelve fila, no finge un guardado', async () => {
    const query: SqlQuery = async () => ({ rows: [] });
    await assert.rejects(() => queryUpsert(query, write()), /No se pudo guardar la entrega/);
  });

  it('reenviar actualiza la misma entrega y conserva el hacker id', () => {
    const first = mergeEntrega(null, write());
    const second = mergeEntrega(
      first,
      write({
        hackerId: 'JDV-2026-9999',
        at: '2026-11-08T12:00:00.000Z',
        input: { ...input, repo: 'https://gitlab.com/ana/tren', video: 'https://vimeo.com/99' },
      }),
    );
    assert.equal(second.hackerId, 'JDV-2026-0007');
    assert.equal(second.submittedAt, '2026-11-06T15:00:00.000Z');
    assert.equal(second.updatedAt, '2026-11-08T12:00:00.000Z');
    assert.equal(second.input.repo, 'https://gitlab.com/ana/tren');
    assert.equal(second.input.video, 'https://vimeo.com/99');
    assert.equal(first.input.repo, input.repo);
  });
});

describe('POST /api/entrega', () => {
  it('sin webhook responde 200 y el hacker id, y un segundo envío actualiza', async () => {
    const { rows, save } = memorySave();
    const posts: string[] = [];
    const first = await finishEntrega(write(), {
      ...silent({ save, webhookUrl: undefined }),
      post: async (url) => {
        posts.push(url);
        return { ok: true, status: 200 };
      },
    });
    const second = await finishEntrega(
      write({
        hackerId: 'JDV-2026-9999',
        at: '2026-11-08T12:00:00.000Z',
        input: { ...input, demo: 'https://demo.example.com/v2' },
      }),
      silent({ save, webhookUrl: '   ' }),
    );

    assert.equal(first.status, 200);
    assert.equal(first.body.ok, true);
    assert.equal(first.body.hackerId, 'JDV-2026-0007');
    assert.equal(first.body.at, '2026-11-06T15:00:00.000Z');
    assert.equal(second.status, 200);
    assert.equal(second.body.hackerId, 'JDV-2026-0007');
    assert.equal(second.body.at, '2026-11-08T12:00:00.000Z');
    assert.equal(rows.size, 1);
    assert.equal(rows.get('user-1')?.input.demo, 'https://demo.example.com/v2');
    assert.equal(rows.get('user-1')?.submittedAt, '2026-11-06T15:00:00.000Z');
    assert.deepEqual(posts, []);
  });

  it('con webhook reenvía el payload guardado y no falla si el destino responde mal o cae', async () => {
    const saved = mergeEntrega(null, write());
    const seen: { url: string; hackerId: string; submittedAt: string; repo: string; userId: string }[] = [];
    const ok = await finishEntrega(write(), silent({
      save: async () => saved,
      webhookUrl: ' https://hooks.example/entrega ',
      post: async (url, payload) => {
        seen.push({
          url,
          hackerId: payload.hackerId,
          submittedAt: payload.submittedAt,
          repo: payload.repo,
          userId: payload.userId,
        });
        return { ok: true, status: 200 };
      },
    }));
    const down = await finishEntrega(write(), silent({
      save: async () => saved,
      webhookUrl: 'https://hooks.example/entrega',
      post: async () => ({ ok: false, status: 502 }),
    }));
    const thrown = await finishEntrega(write(), silent({
      save: async () => saved,
      webhookUrl: 'https://hooks.example/entrega',
      post: async () => {
        throw new Error('timeout');
      },
    }));

    assert.equal(ok.status, 200);
    assert.deepEqual(seen, [
      {
        url: 'https://hooks.example/entrega',
        hackerId: 'JDV-2026-0007',
        submittedAt: '2026-11-06T15:00:00.000Z',
        repo: input.repo,
        userId: 'user-1',
      },
    ]);
    assert.deepEqual(entregaWebhookPayload(saved).userId, 'user-1');
    assert.equal(down.status, 200);
    assert.equal(down.body.hackerId, 'JDV-2026-0007');
    assert.equal(thrown.status, 200);
    assert.equal(thrown.body.ok, true);
  });

  it('si Neon no guarda, responde 503 y no llama al webhook', async () => {
    let posted = false;
    const result = await finishEntrega(write(), silent({
      webhookUrl: 'https://hooks.example/entrega',
      save: async () => {
        throw new Error('Sin base');
      },
      post: async () => {
        posted = true;
        return { ok: true, status: 200 };
      },
    }));
    assert.equal(result.status, 503);
    assert.deepEqual(result.body, { ok: false, error: ENTREGA_SAVE_ERROR });
    assert.equal(posted, false);
  });

  it('la route ya no responde 501 si falta el webhook', () => {
    const src = readFileSync(new URL('../pages/api/entrega.ts', import.meta.url), 'utf8');
    assert.equal(src.includes('501'), false);
    assert.equal(src.includes('Destino de entregas no configurado'), false);
    const saveAt = src.indexOf('finishEntrega(');
    const gates = ['profileCompleteness(stored)', '?.website', 'limited(ip', 'validateEntrega(input)'];
    assert.ok(saveAt > 0);
    for (const gate of gates) assert.ok(src.indexOf(gate) < saveAt, gate);
    assert.match(src, /save: saveEntrega/);
    assert.match(src, /webhookUrl: ENTREGA_WEBHOOK_URL/);
  });
});
