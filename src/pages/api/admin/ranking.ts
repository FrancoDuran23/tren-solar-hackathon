import type { APIRoute } from 'astro';
import { parseRankingBody } from '../../../lib/ranking-input';
import { secretsMatch } from '../../../lib/secret';
import { env } from '../../../server/env';
import { json } from '../../../server/http';
import { replaceRanking } from '../../../server/ranking-store';

export const prerender = false;

const MAX_BODY = 16 * 1024;

function bearer(request: Request): string {
  const header = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(\S+)\s*$/i.exec(header);
  return match?.[1] ?? '';
}

export const POST: APIRoute = async ({ request }) => {
  const secret = env.adminSecret;
  if (!secret || !env.databaseUrl) {
    return json(503, { error: 'El ranking admin no está configurado.' });
  }
  if (!secretsMatch(bearer(request), secret)) {
    return json(401, { error: 'No autorizado.' });
  }

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY) return json(413, { error: 'Payload demasiado grande.' });
  const text = await request.text();
  if (text.length > MAX_BODY) return json(413, { error: 'Payload demasiado grande.' });

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return json(400, { error: 'JSON inválido.' });
  }
  const parsed = parseRankingBody(raw);
  if (!parsed.ok) return json(422, { error: parsed.error });

  try {
    const result = await replaceRanking(parsed.value);
    return json(200, { ok: true, ...result });
  } catch (err) {
    console.error('[ranking]', err instanceof Error ? err.message : 'error');
    return json(503, { error: 'No pudimos actualizar el ranking.' });
  }
};

export const ALL: APIRoute = () => json(405, { error: 'Método no permitido.' }, { allow: 'POST' });
