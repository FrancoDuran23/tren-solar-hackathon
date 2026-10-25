import type { MeResponse } from './me';
import { SIGNED_OUT } from './me';

export const AUTH_CHANGED = 'pre:auth';

const SESSION_ERROR = 'No pudimos verificar tu sesión. Recargá en un minuto.';

let inflight: Promise<MeResponse> | null = null;

export function notifyAuth(): void {
  window.dispatchEvent(new Event(AUTH_CHANGED));
}

export function onAuthChange(fn: () => void): void {
  window.addEventListener(AUTH_CHANGED, fn);
}

export function invalidateMe(): void {
  inflight = null;
}

export function loadMe(force = false): Promise<MeResponse> {
  if (force) inflight = null;
  if (!inflight) {
    inflight = fetch('/api/me', { credentials: 'same-origin', headers: { accept: 'application/json' } })
      .then(async (res) => {
        const body = (await res.json().catch(() => null)) as MeResponse | null;
        if (body && typeof body.configured === 'boolean') return body;
        return { ...SIGNED_OUT, configured: true, error: SESSION_ERROR };
      })
      .catch(() => ({ ...SIGNED_OUT, configured: true, error: SESSION_ERROR }));
  }
  return inflight;
}

export async function signInWithGoogle(): Promise<string | null> {
  const { createAuthClient } = await import('better-auth/client');
  const client = createAuthClient();
  const result = await client.signIn.social({
    provider: 'google',
    callbackURL: '/#perfil',
  });
  if (result.error) {
    const message = 'message' in result.error && typeof result.error.message === 'string' ? result.error.message : '';
    return message || 'No pudimos entrar con Google.';
  }
  return null;
}

export async function signOut(): Promise<void> {
  const { createAuthClient } = await import('better-auth/client');
  const client = createAuthClient();
  await client.signOut();
  invalidateMe();
  notifyAuth();
}
