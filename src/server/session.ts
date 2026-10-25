import type { MeUser } from '../lib/me';
import { getAuth } from './auth';
import { authConfigured } from './env';

export async function currentUser(request: Request): Promise<
  | { configured: false }
  | { configured: true; user: MeUser | null }
> {
  if (!authConfigured()) return { configured: false };
  const auth = await getAuth();
  const result = await auth.api.getSession({ headers: request.headers });
  if (!result?.user) return { configured: true, user: null };
  return {
    configured: true,
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email.toLowerCase(),
      image: result.user.image ?? null,
    },
  };
}
