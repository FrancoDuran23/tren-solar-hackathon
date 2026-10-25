import type { APIRoute } from 'astro';
import { coerceProfile, profileCompleteness, validateProfileInput } from '../../lib/profile';
import { clientIp, isSameOrigin, json } from '../../server/http';
import { readProfile, writeProfile } from '../../server/profile-store';
import { currentUser } from '../../server/session';

export const prerender = false;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function limited(key: string, now: number): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_PER_WINDOW;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const who = await currentUser(request);
    if (!who.configured) return json(503, { error: 'El ingreso con Google todavía no está habilitado.' });
    if (!who.user) return json(401, { error: 'Entrá con Google para ver tu perfil.' });
    const stored = await readProfile(who.user.id);
    const profile = stored ?? {
      fullName: '',
      livesInJujuy: false,
      localidad: '',
      githubUrl: '',
      oneLiner: '',
    };
    return json(200, { profile: { ...profile, completeness: profileCompleteness(profile) }, email: who.user.email });
  } catch (err) {
    console.error('[profile]', err instanceof Error ? err.message : 'error');
    return json(503, { error: 'No pudimos leer tu perfil. Probá de nuevo en un minuto.' });
  }
};

export const PUT: APIRoute = async ({ request, clientAddress }) => {
  if (!isSameOrigin(request)) return json(403, { error: 'Origen no permitido.' });
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json(400, { error: 'JSON inválido.' });
  }
  const input = coerceProfile(raw);
  const errors = validateProfileInput(input);
  if (Object.keys(errors).length > 0) return json(422, { error: 'Revisá los campos.', errors });

  try {
    const who = await currentUser(request);
    if (!who.configured) return json(503, { error: 'El ingreso con Google todavía no está habilitado.' });
    if (!who.user) return json(401, { error: 'Entrá con Google para guardar tu perfil.' });
    const ip = clientIp(request, clientAddress);
    if (limited(`${who.user.id}:${ip}`, Date.now())) {
      return json(429, { error: 'Demasiados guardados. Probá de nuevo en unos minutos.' }, { 'retry-after': '600' });
    }
    const saved = await writeProfile(who.user.id, input);
    return json(200, { ok: true, profile: { ...saved, completeness: profileCompleteness(saved) } });
  } catch (err) {
    console.error('[profile]', err instanceof Error ? err.message : 'error');
    return json(503, { error: 'No pudimos guardar el perfil. Probá de nuevo en un minuto.' });
  }
};

export const ALL: APIRoute = () => json(405, { error: 'Método no permitido.' }, { allow: 'GET, PUT' });
