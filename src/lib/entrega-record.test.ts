import assert from 'node:assert/strict';
import test from 'node:test';
import { SELECT_ENTREGA_SQL, queryRead } from './entrega-record.ts';

const row = {
  user_id: 'u1', hacker_id: 'JDV-2026-0042', email: 'a@b.c', proyecto: 'Vaultix', responsable: 'Ana',
  jujuy: true, localidad: 'Palpalá', repo: 'https://github.com/a/b', demo: 'https://d.ar', video: 'https://v.ar',
  traction_tipo: '', traction_numero: '', traction_evidencia: '', descripcion: 'x',
  submitted_at: new Date('2026-11-12T22:00:00Z'), updated_at: '2026-11-13T10:00:00Z',
};

test('queryRead', async (t) => {
  await t.test('devuelve la entrega guardada del usuario', async () => {
    let seen: unknown[] = [];
    const got = await queryRead(async (sql, params) => {
      assert.equal(sql, SELECT_ENTREGA_SQL);
      seen = [...params];
      return { rows: [row] };
    }, 'u1');
    assert.deepEqual(seen, ['u1']);
    assert.equal(got?.hackerId, 'JDV-2026-0042');
    assert.equal(got?.input.proyecto, 'Vaultix');
    assert.equal(got?.input.jujuy, true);
    assert.equal(got?.updatedAt, '2026-11-13T10:00:00.000Z');
  });
  await t.test('null si todavía no entregó', async () => {
    assert.equal(await queryRead(async () => ({ rows: [] }), 'u2'), null);
  });
});
