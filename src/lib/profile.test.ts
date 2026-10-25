import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  coerceProfile,
  normalizeGithubUrl,
  profileCompleteness,
  validateProfileInput,
  type ProfileInput,
} from './profile.ts';

const full: ProfileInput = {
  fullName: 'Ana Pérez',
  livesInJujuy: true,
  localidad: 'San Salvador de Jujuy',
  githubUrl: 'https://github.com/anaperez',
  oneLiner: 'Una app para el colectivo.',
};

describe('perfil', () => {
  it('está al 100% con los cinco datos', () => {
    assert.equal(profileCompleteness(full), 100);
  });

  it('suma de a 20', () => {
    assert.equal(profileCompleteness({ ...full, fullName: '', livesInJujuy: false, localidad: '', githubUrl: '', oneLiner: '' }), 0);
    assert.equal(profileCompleteness({ ...full, livesInJujuy: false, localidad: '', githubUrl: '', oneLiner: '' }), 20);
    assert.equal(profileCompleteness({ ...full, localidad: '', githubUrl: '', oneLiner: '' }), 40);
    assert.equal(profileCompleteness({ ...full, githubUrl: '', oneLiner: '' }), 60);
    assert.equal(profileCompleteness({ ...full, oneLiner: '' }), 80);
  });

  it('sin confirmar Jujuy no llega al 100 aunque haya localidad', () => {
    // La localidad solo cuenta si la confirmación es sí, y la confirmación es otro check.
    assert.equal(profileCompleteness({ ...full, livesInJujuy: false }), 60);
  });

  it('normaliza GitHub y rechaza otros hosts', () => {
    assert.equal(normalizeGithubUrl('https://www.github.com/Ana/Repo/'), 'https://github.com/Ana/Repo');
    assert.equal(normalizeGithubUrl('http://github.com/ana'), null);
    assert.equal(normalizeGithubUrl('https://gitlab.com/ana'), null);
    assert.equal(normalizeGithubUrl('https://github.com/'), null);
  });

  it('deja guardar un borrador y marca el formato inválido', () => {
    assert.deepEqual(validateProfileInput({ ...full, fullName: '', githubUrl: '', oneLiner: '' }), {});
    assert.equal(validateProfileInput({ ...full, fullName: 'Ana' }).fullName, 'Nombre y apellido, entre 3 y 120 caracteres.');
    assert.equal(validateProfileInput({ ...full, githubUrl: 'https://gitlab.com/a' }).githubUrl !== undefined, true);
  });

  it('coerce acepta solo el boolean true', () => {
    const p = coerceProfile({ fullName: ' Ana Pérez ', livesInJujuy: 'sí', githubUrl: 'https://github.com/ana' });
    assert.equal(p.fullName, 'Ana Pérez');
    assert.equal(p.livesInJujuy, false);
    assert.equal(p.githubUrl, 'https://github.com/ana');
  });
});
