/** Validación compartida cliente + servidor (design.md §3.10, spec §4.6). */

export type TractionType = 'users' | 'revenue' | 'waitlist' | 'stars' | 'otro';
export const TRACTION_TYPES: { value: TractionType; label: string }[] = [
  { value: 'users', label: 'Usuarios' },
  { value: 'revenue', label: 'Ingresos' },
  { value: 'waitlist', label: 'Lista de espera' },
  { value: 'stars', label: 'Stars' },
  { value: 'otro', label: 'Otro' },
];

export interface EntregaInput {
  proyecto: string;
  responsable: string;
  email: string;
  jujuy: boolean;
  localidad: string;
  repo: string;
  demo: string;
  video: string;
  tractionTipo: string;
  tractionNumero: string;
  tractionEvidencia: string;
  descripcion: string;
}

export type EntregaField = keyof EntregaInput;
export type EntregaErrors = Partial<Record<EntregaField, string>>;

export const FIELDS: EntregaField[] = [
  'proyecto', 'responsable', 'email', 'jujuy', 'localidad', 'repo', 'demo', 'video',
  'tractionTipo', 'tractionNumero', 'tractionEvidencia', 'descripcion',
];

export const REPO_HOSTS = ['github.com', 'gitlab.com', 'codeberg.org'];
export const VIDEO_HOSTS = ['youtube.com', 'youtu.be', 'vimeo.com', 'loom.com', 'drive.google.com'];

/** Límite de payload (bytes) aceptado por la API. */
export const MAX_PAYLOAD = 8 * 1024;

function parseHttps(v: string): URL | null {
  try {
    const u = new URL(v);
    return u.protocol === 'https:' ? u : null;
  } catch {
    return null;
  }
}

function hostIn(u: URL, hosts: string[]): boolean {
  const h = u.hostname.toLowerCase();
  return hosts.some((x) => h === x || h.endsWith('.' + x));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateField(f: EntregaField, d: EntregaInput): string | null {
  const v = (typeof d[f] === 'string' ? (d[f] as string) : '').trim();
  switch (f) {
    case 'proyecto':
      if (v.length < 3 || v.length > 60) return 'Entre 3 y 60 caracteres.';
      return null;
    case 'responsable':
      return v.length < 2 || v.length > 80 ? 'Nombre y apellido de quien entrega.' : null;
    case 'email':
      return v.length <= 120 && EMAIL_RE.test(v) ? null : 'Ingresá un email válido.';
    case 'jujuy':
      return d.jujuy === true ? null : 'Es condición para competir por los 30 tickets.';
    case 'localidad':
      return d.jujuy && (v.length < 2 || v.length > 80) ? 'Indicá tu localidad.' : null;
    case 'repo': {
      const u = parseHttps(v);
      return u && hostIn(u, REPO_HOSTS) && v.length <= 300
        ? null
        : 'URL https de GitHub, GitLab o Codeberg.';
    }
    case 'demo': {
      const u = parseHttps(v);
      return u && v.length <= 300 ? null : 'URL https de la demo.';
    }
    case 'video': {
      const u = parseHttps(v);
      return u && hostIn(u, VIDEO_HOSTS) && v.length <= 300
        ? null
        : 'URL https de YouTube, Vimeo, Loom o Drive.';
    }
    case 'tractionTipo':
      return v === '' || TRACTION_TYPES.some((t) => t.value === v) ? null : 'Tipo inválido.';
    case 'tractionNumero':
      if (v === '') return null;
      return Number.isFinite(Number(v)) && Number(v) >= 0 ? null : 'Número mayor o igual a 0.';
    case 'tractionEvidencia': {
      if (d.tractionTipo.trim() === '' && v === '') return null;
      if (d.tractionTipo.trim() === '') return null;
      const u = parseHttps(v);
      return u && v.length <= 300 ? null : 'Link https que respalde el número.';
    }
    case 'descripcion':
      return v.length > 280 ? 'Máximo 280 caracteres.' : null;
  }
}

export function validateEntrega(d: EntregaInput): EntregaErrors {
  const errors: EntregaErrors = {};
  for (const f of FIELDS) {
    const e = validateField(f, d);
    if (e) errors[f] = e;
  }
  return errors;
}

/** Normaliza un body desconocido a EntregaInput (strings recortados; sanitiza control chars). */
export function coerceEntrega(raw: unknown): EntregaInput {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  // eslint-disable-next-line no-control-regex
  const s = (k: string) => (typeof o[k] === 'string' ? (o[k] as string).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim() : '');
  return {
    proyecto: s('proyecto'),
    responsable: s('responsable'),
    email: s('email').toLowerCase(),
    jujuy: o.jujuy === true,
    localidad: s('localidad'),
    repo: s('repo'),
    demo: s('demo'),
    video: s('video'),
    tractionTipo: s('tractionTipo'),
    tractionNumero: s('tractionNumero'),
    tractionEvidencia: s('tractionEvidencia'),
    descripcion: s('descripcion'),
  };
}
