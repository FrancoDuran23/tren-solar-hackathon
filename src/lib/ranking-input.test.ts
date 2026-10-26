import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseRankingBody } from './ranking-input.ts';

describe('ranking admin body', () => {
  it('normaliza, deduplica y guarda la etiqueta', () => {
    const parsed = parseRankingBody({
      emails: [' Ana@Gmail.com ', 'ana@gmail.com', 'b@jujuy.dev'],
      weekLabel: '  Semana 4  ',
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.deepEqual(parsed.value.emails, ['ana@gmail.com', 'b@jujuy.dev']);
    assert.equal(parsed.value.weekLabel, 'Semana 4');
  });

  it('acepta lista vacía para dejar a nadie en el top', () => {
    const parsed = parseRankingBody({ emails: [] });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.deepEqual(parsed.value.emails, []);
    assert.equal(parsed.value.weekLabel, null);
  });

  it('rechaza más de 30 y emails rotos', () => {
    const many = parseRankingBody({ emails: Array.from({ length: 31 }, (_, i) => `a${i}@jujuy.dev`) });
    assert.equal(many.ok, false);
    const atCap = parseRankingBody({ emails: Array.from({ length: 30 }, (_, i) => `a${i}@jujuy.dev`) });
    assert.equal(atCap.ok, true);
    const bad = parseRankingBody({ emails: ['no-es-email'] });
    assert.equal(bad.ok, false);
  });
});
