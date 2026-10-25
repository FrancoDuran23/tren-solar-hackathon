import { betterAuth } from 'better-auth';
import { getMigrations } from 'better-auth/db/migration';
import { getPool } from './db';
import { authConfigured, env } from './env';
import { ensureAppSchema } from './schema';

const PROD_ORIGIN = 'https://tren-solar-hackathon.vercel.app';

let pending: ReturnType<typeof boot> | null = null;

export function getAuth(): ReturnType<typeof boot> {
  if (!authConfigured()) return Promise.reject(new Error('Auth no configurada'));
  if (!pending) {
    pending = boot().catch((err: unknown) => {
      pending = null;
      throw err;
    });
  }
  return pending;
}

async function boot() {
  const pool = getPool();
  const secret = env.betterAuthSecret;
  const clientId = env.googleClientId;
  const clientSecret = env.googleClientSecret;
  if (!pool || !secret || !clientId || !clientSecret) throw new Error('Auth no configurada');

  const options = {
    appName: 'jujuy.dev',
    secret,
    baseURL: {
      allowedHosts: ['localhost', '127.0.0.1', 'tren-solar-hackathon.vercel.app', '*.vercel.app'],
      fallback: env.betterAuthUrl ?? PROD_ORIGIN,
      protocol: 'auto' as const,
    },
    database: pool,
    emailAndPassword: { enabled: false },
    socialProviders: {
      google: { clientId, clientSecret },
    },
    trustedOrigins: [
      'http://localhost:4321',
      'http://127.0.0.1:4321',
      PROD_ORIGIN,
      'https://*.vercel.app',
    ],
    advanced: { trustedProxyHeaders: true },
  };

  const { runMigrations } = await getMigrations(options);
  await runMigrations();
  await ensureAppSchema(pool);
  return betterAuth(options);
}
