import type { APIRoute } from 'astro';
import { ENTREGA_WEBHOOK_URL } from 'astro:env/server';
import { config } from '../../config';
import { MAX_PAYLOAD, coerceEntrega, validateEntrega } from '../../lib/entrega';

export const prerender = false;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
/** Rate-limit simple por IP, en memoria de la instancia serverless (best effort, spec §4.6). */
const hits = new Map<string, number[]>();

function limited(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  return recent.length > MAX_PER_WINDOW;
}

const json = (status: number, body: Record<string, unknown>, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });

async function hackerId(email: string, at: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email + at));
  const n = new DataView(buf).getUint32(0) % 10000;
  return `JDV-2026-${String(n).padStart(4, '0')}`;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (config.submissions === 'closed') {
    return json(403, { ok: false, error: 'Las entregas están cerradas.' });
  }

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_PAYLOAD) return json(413, { ok: false, error: 'Payload demasiado grande.' });
  const text = await request.text();
  if (text.length > MAX_PAYLOAD) return json(413, { ok: false, error: 'Payload demasiado grande.' });

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return json(400, { ok: false, error: 'JSON inválido.' });
  }

  const at = new Date().toISOString();
  const input = coerceEntrega(raw);

  // Honeypot: un bot completa `website`. Respondemos como éxito sin reenviar nada.
  const trap = (raw as Record<string, unknown> | null)?.website;
  if (typeof trap === 'string' && trap.trim() !== '') {
    return json(200, { ok: true, hackerId: await hackerId(input.email || 'x', at), at });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress || 'unknown';
  if (limited(ip, Date.now())) {
    return json(429, { ok: false, error: 'Demasiados envíos. Probá de nuevo en unos minutos.' }, { 'retry-after': '600' });
  }

  const errors = validateEntrega(input);
  if (Object.keys(errors).length > 0) return json(422, { ok: false, error: 'Revisá los campos.', errors });

  const dest = ENTREGA_WEBHOOK_URL;
  const id = await hackerId(input.email, at);
  const payload = { ...input, hackerId: id, submittedAt: at };

  if (!dest) {
    if (import.meta.env.DEV) console.log('[entrega] (stub, sin ENTREGA_WEBHOOK_URL)', payload);
    return json(501, { ok: false, error: 'Destino de entregas no configurado todavía.' });
  }

  try {
    const res = await fetch(dest, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return json(502, { ok: false, error: 'No pudimos despachar tu proyecto.' });
  } catch {
    return json(502, { ok: false, error: 'No pudimos despachar tu proyecto.' });
  }
  return json(200, { ok: true, hackerId: id, at });
};

export const ALL: APIRoute = () => json(405, { ok: false, error: 'Método no permitido.' }, { allow: 'POST' });
