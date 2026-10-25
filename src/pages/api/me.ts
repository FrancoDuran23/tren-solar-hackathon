import type { APIRoute } from 'astro';
import { EMPTY_PROFILE, profileCompleteness } from '../../lib/profile';
import type { MeResponse } from '../../lib/me';
import { readProfile } from '../../server/profile-store';
import { readRanking } from '../../server/ranking-store';
import { currentUser } from '../../server/session';
import { json } from '../../server/http';

export const prerender = false;

const SESSION_ERROR = 'No pudimos verificar tu sesión. Recargá en un minuto.';

export const GET: APIRoute = async ({ request }) => {
  try {
    const who = await currentUser(request);
    if (!who.configured) {
      const body: MeResponse = { configured: false, user: null, profile: null, ranking: null, error: null };
      return json(200, { ...body });
    }
    if (!who.user) {
      const body: MeResponse = { configured: true, user: null, profile: null, ranking: null, error: null };
      return json(200, { ...body });
    }
    const stored = await readProfile(who.user.id);
    const profile = stored ?? EMPTY_PROFILE;
    const completeness = profileCompleteness(profile);
    const ranking = completeness === 100 ? await readRanking(who.user.email) : null;
    const body: MeResponse = {
      configured: true,
      user: who.user,
      profile: { ...profile, completeness },
      ranking,
      error: null,
    };
    return json(200, { ...body });
  } catch (err) {
    console.error('[me]', err instanceof Error ? err.message : 'error');
    const body: MeResponse = { configured: true, user: null, profile: null, ranking: null, error: SESSION_ERROR };
    return json(503, { ...body });
  }
};

export const ALL: APIRoute = () => json(405, { error: 'Método no permitido.' }, { allow: 'GET' });
