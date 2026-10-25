// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';
import { wgslVitePlugin } from '@vgpu/wgsl/loader-vite';

export default defineConfig({
  adapter: vercel(),
  vite: { plugins: [wgslVitePlugin()] },
  env: {
    schema: {
      ENTREGA_WEBHOOK_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
