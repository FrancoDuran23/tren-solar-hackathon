import assert from 'node:assert/strict';
import test from 'node:test';
import { dates } from '../content/dates.ts';
import { entregaDeadlineMs, entregaEditsOpen } from './entrega-window.ts';

test('ventana de edición de la entrega', async (t) => {
  const end = entregaDeadlineMs();

  await t.test('sigue abierta en el instante del cierre', () => {
    assert.equal(entregaEditsOpen(end), true);
  });

  await t.test('queda cerrada un milisegundo después del 13 de noviembre de 2026, 23:59 ART', () => {
    assert.equal(entregaEditsOpen(end + 1), false);
  });

  await t.test('está abierta durante el build', () => {
    assert.equal(entregaEditsOpen(Date.parse('2026-11-01T00:00:00-03:00')), true);
    assert.equal(entregaEditsOpen(Date.parse('2026-10-25T12:00:00-03:00')), true);
  });

  await t.test('el cierre es el iso de dates.ts', () => {
    assert.equal(dates.buildEndIso, '2026-11-13T23:59:00-03:00');
    assert.match(dates.buildEndLabel, /13 de noviembre de 2026/);
    assert.match(dates.buildEndLabel, /23:59/);
  });
});
