import {
  ADMIN_SECRET,
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  DATABASE_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from 'astro:env/server';

function clean(v: string | undefined): string | undefined {
  const t = v?.trim();
  return t ? t : undefined;
}

export const env = {
  databaseUrl: clean(DATABASE_URL),
  betterAuthSecret: clean(BETTER_AUTH_SECRET),
  betterAuthUrl: clean(BETTER_AUTH_URL),
  googleClientId: clean(GOOGLE_CLIENT_ID),
  googleClientSecret: clean(GOOGLE_CLIENT_SECRET),
  adminSecret: clean(ADMIN_SECRET),
};

/** Google + Neon + secreto. Sin esto la landing sigue en pie y las routes responden 503. */
export function authConfigured(): boolean {
  return Boolean(env.databaseUrl && env.betterAuthSecret && env.googleClientId && env.googleClientSecret);
}
