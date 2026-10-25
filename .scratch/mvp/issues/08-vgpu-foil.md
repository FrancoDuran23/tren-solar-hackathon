# 08 · vgpu holographic foil on ticket

Status: done

- Deps: `vgpu`, `@vgpu/wgsl` (plugin Vite en `astro.config.mjs`).
- `src/lib/vgpu/foil.{ts,wgsl}`: foil navy/naranja/blanco adaptado de `holographic-card`; pointer hover/light.
- Canvas `[data-foil-gl]` en `Ticket.astro`; `Hero.astro` lo monta solo en desktop (hover fino) y sin reduced-motion.
- Fallback: sin WebGPU / error / mobile / reduced-motion ⇒ sheen CSS existente.
- Verificado: `npm run build` OK (Node 22), `astro check` 0 errores, `<canvas class="foil-gl">` en HTML.
- No verificado visualmente en navegador con WebGPU real (sin GPU en el entorno).
