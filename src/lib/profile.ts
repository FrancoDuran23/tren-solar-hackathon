/** Perfil del participante (T17). Puro: lo usa el form y la API. */

export interface ProfileInput {
  fullName: string;
  livesInJujuy: boolean;
  localidad: string;
  githubUrl: string;
  oneLiner: string;
}

export type ProfileCheckKey = 'fullName' | 'livesInJujuy' | 'localidad' | 'githubUrl' | 'oneLiner';

export type ProfileErrors = Partial<Record<ProfileCheckKey, string>>;

export const EMPTY_PROFILE: ProfileInput = {
  fullName: '',
  livesInJujuy: false,
  localidad: '',
  githubUrl: '',
  oneLiner: '',
};

/** Cinco checks iguales. 100 solo si los cinco pasan. */
export const PROFILE_CHECKS: readonly ProfileCheckKey[] = [
  'fullName',
  'livesInJujuy',
  'localidad',
  'githubUrl',
  'oneLiner',
];

function clean(v: string): string {
  return v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim();
}

/** https://github.com/usuario o https://github.com/usuario/repo */
export function normalizeGithubUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== 'https:') return null;
    const host = u.hostname.toLowerCase();
    if (host !== 'github.com' && host !== 'www.github.com') return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 1 || parts.length > 2) return null;
    if (parts.some((p) => !/^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,98})$/.test(p))) return null;
    return `https://github.com/${parts.join('/')}`;
  } catch {
    return null;
  }
}

function nameOk(name: string): boolean {
  return name.length >= 3 && name.length <= 120 && /\s/.test(name);
}

export function profileChecks(p: ProfileInput): Record<ProfileCheckKey, boolean> {
  const name = p.fullName.trim();
  const loc = p.localidad.trim();
  const line = p.oneLiner.trim();
  const jujuy = p.livesInJujuy === true;
  return {
    fullName: nameOk(name),
    livesInJujuy: jujuy,
    localidad: jujuy && loc.length >= 2 && loc.length <= 80,
    githubUrl: normalizeGithubUrl(p.githubUrl) !== null,
    oneLiner: line.length >= 3 && line.length <= 120,
  };
}

export function profileCompleteness(p: ProfileInput): number {
  const checks = profileChecks(p);
  const passed = PROFILE_CHECKS.filter((k) => checks[k]).length;
  return Math.round((passed / PROFILE_CHECKS.length) * 100);
}

/** Acepta borradores: un campo vacío no es error; un formato inválido sí. */
export function validateProfileInput(p: ProfileInput): ProfileErrors {
  const errors: ProfileErrors = {};
  const name = p.fullName.trim();
  if (name !== '' && !nameOk(name)) errors.fullName = 'Nombre y apellido, entre 3 y 120 caracteres.';
  const loc = p.localidad.trim();
  if (loc !== '' && (loc.length < 2 || loc.length > 80)) errors.localidad = 'Entre 2 y 80 caracteres.';
  const gh = p.githubUrl.trim();
  if (gh !== '' && normalizeGithubUrl(gh) === null) errors.githubUrl = 'URL https de github.com (usuario o repo).';
  const line = p.oneLiner.trim();
  if (line !== '' && (line.length < 3 || line.length > 120)) errors.oneLiner = 'Entre 3 y 120 caracteres.';
  return errors;
}

export function coerceProfile(raw: unknown): ProfileInput {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const s = (k: string) => (typeof o[k] === 'string' ? clean(o[k] as string) : '');
  const gh = normalizeGithubUrl(s('githubUrl'));
  return {
    fullName: s('fullName'),
    livesInJujuy: o.livesInJujuy === true,
    localidad: s('localidad'),
    githubUrl: gh ?? s('githubUrl'),
    oneLiner: s('oneLiner'),
  };
}
