// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  adapter: vercel(),
  env: {
    schema: {
      ENTREGA_WEBHOOK_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
