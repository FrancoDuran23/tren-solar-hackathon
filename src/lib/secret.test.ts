import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { secretsMatch } from './secret.ts';

describe('secretsMatch', () => {
  it('acepta el mismo secreto y rechaza otro o uno más corto', () => {
    assert.equal(secretsMatch('top-secret-value', 'top-secret-value'), true);
    assert.equal(secretsMatch('top-secret-value', 'top-secret-valuX'), false);
    assert.equal(secretsMatch('short', 'top-secret-value'), false);
    assert.equal(secretsMatch('', 'x'), false);
  });
});
