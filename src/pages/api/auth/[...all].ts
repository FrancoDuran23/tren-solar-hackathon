import type { APIRoute } from 'astro';
import { getAuth } from '../../../server/auth';
import { authConfigured } from '../../../server/env';
import { json } from '../../../server/http';

export const prerender = false;

export const ALL: APIRoute = async ({ request }) => {
  if (!authConfigured()) {
    return json(503, { error: 'El ingreso con Google todavía no está habilitado.' });
  }
  try {
    const auth = await getAuth();
    return auth.handler(request);
  } catch (err) {
    console.error('[auth]', err instanceof Error ? err.message : 'error');
    return json(503, { error: 'No pudimos iniciar el ingreso. Probá de nuevo en un minuto.' });
  }
};
