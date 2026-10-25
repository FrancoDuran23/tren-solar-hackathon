// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import { wgslVitePlugin } from '@vgpu/wgsl/loader-vite';

export default defineConfig({
  adapter: vercel(),
  integrations: [react()],
  vite: { plugins: [wgslVitePlugin()] },
  env: {
    schema: {
      ENTREGA_WEBHOOK_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      DATABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      BETTER_AUTH_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      BETTER_AUTH_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      GOOGLE_CLIENT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      GOOGLE_CLIENT_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      ADMIN_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
