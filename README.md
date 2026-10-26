# Pre-Hackatón · jujuy.dev

Landing del Pre-Hackatón (Road to Solar Train Hackathon). Astro 7 + TypeScript estricto + CSS plano.
Docs de producto: `docs/brief.md`, `docs/design.md` (tokens y UI), `docs/spec.md`.

## Requisitos

Node **≥ 22.23.4** (lo exige Astro 7) y npm ≥ 9.6.5.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Dev server en `localhost:4321` |
| `npm run check` | `astro check` (TypeScript estricto) |
| `npm run build` | Build estático a `dist/` |
| `npm run preview` | Sirve `dist/` |

## Estructura

- `src/config.ts` — **fuente única de estado TBD** (`lumaUrl`, `registration`, `deadline`, `submissions`, `workshops`, `jury`, `ticketsAssigned`). Hoy todo está en "pronto / cerrado / vacío"; abrir una sección es editar este archivo.
- `src/styles/tokens.css` — tokens 1:1 de `docs/design.md §1`. Si cambia un valor, se cambia primero en design.md.
- `src/styles/global.css` — reset mínimo y foco.
- `src/layouts/Base.astro` — layout base.

## Fuentes

Self-hosted vía paquetes `@fontsource` (subset latino, `font-display: swap`): Unbounded 700/900, Inter variable, JetBrains Mono 400/700. Se importan desde `tokens.css`.

## Logo (placeholder)

Logos reales de la comunidad en `public/brand/`: `jujuydev-logo-white.webp` (sobre navy: nav, footer, cuerpo del ticket), `jujuydev-logo.webp` (sobre papel: stub del ticket, CTA final), `jujuydev-isotipo.png` (favicon, eyebrow, centro del QR). `solar-train-quebrada.jpg` y `solar-train-sky.jpg` son recortes del poster `guideline-solar-train-poster.jpg` (hero y CTA final). El cuerpo del ticket es navy/foil, sin foto.

## Cuenta, perfil y estado (T16–T18)

Ingreso **solo con Google** (Better Auth + Neon Postgres). Después del login hay que completar el perfil al 100% para ver el estado propio del top 30 y para despachar el proyecto atado a la cuenta. No hay lista pública de ranking.

Setup (Neon, redirect URIs de Google, `curl` del fin de semana): **`docs/auth-ranking.md`**.

Sin `DATABASE_URL` / Google / `BETTER_AUTH_SECRET` el sitio igual buildea: el botón de ingreso avisa que todavía no está habilitado.

## Variables de entorno (form de entrega, T06)

Ver `.env.example`.

| Variable | Descripción |
|---|---|
| `ENTREGA_WEBHOOK_URL` | Destino exportable de `/api/entrega` (endpoint Formspree o webhook de Google Apps Script). Si falta, el endpoint responde `501` y la UI muestra el error de servidor. Con valor, la route valida de nuevo, aplica honeypot (`website`) + rate-limit (5 envíos / 10 min por IP, en memoria) y hace `POST` JSON con los campos + `hackerId` + `submittedAt`. |

`config.submissions = 'closed'` deshabilita el form y hace que la API responda `403`. Smoke: `.scratch/mvp/playwright/06/smoke.mjs`.

En Vercel: Project → Settings → Environment Variables. Local: copiar `.env.example` a `.env`.

## Deploy (Vercel)

Repo destino: `FrancoDuran23/tren-solar-hackathon`. Rama `main` ⇒ producción, PRs ⇒ preview. Framework preset: Astro; build `npm run build`; el adapter `@astrojs/vercel` (T06) genera `.vercel/output` (necesario para la route `/api/entrega`).

1. Pushear el código al repo: `git remote add origin git@github.com:FrancoDuran23/tren-solar-hackathon.git && git push -u origin main` (y la rama de PR para el preview).
2. Vercel → Add New Project → importar `FrancoDuran23/tren-solar-hackathon`. Production Branch = `main`; Node.js 22.x en Settings → General (Astro 7 exige ≥ 22.23.4).
3. Environment Variables (Production + Preview): `ENTREGA_WEBHOOK_URL` (ver arriba) y, para el ingreso con Google, las de `docs/auth-ranking.md` (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_SECRET`, `BETTER_AUTH_URL`). Sin el webhook el form responde 501; sin las de auth el ingreso responde 503 y la landing igual se publica.
4. Cada PR genera un preview automático (`*.vercel.app`); el merge a `main` despliega producción.
5. CLI alternativa: `npx vercel link` y `npx vercel` (preview) / `npx vercel --prod`.
6. Antes de abrir inscripción: poner el link real en `lumaUrl` y `registration: 'open'` en `src/config.ts` (no está cargado; no inventar el link).

## Smoke / release (T07)

- Smoke Playwright (desktop 1440 + mobile 360): `node .scratch/mvp/playwright/07/smoke.mjs http://localhost:4321 [closed|open]` (`open` requiere `submissions: 'open'` y reiniciar el dev server). Screenshots en `.scratch/mvp/playwright/07/`. Playwright no es dependencia del proyecto; usar una instalación externa.
- Sponsor: `grep -rniE "spacex" src public` debe dar vacío (solo cohete + "sponsor sorpresa").
- Lighthouse (spec §6, mobile) **no se corrió** en T07; pendiente sobre el preview de Vercel.

## Foil del ticket (vgpu, T08/T09)

La franja del ticket se pinta con WebGPU vía [`vgpu`](https://vgpu.sh) (`src/lib/vgpu/foil.{ts,wgsl}`, shader cargado con `@vgpu/wgsl/loader-vite`): lámina procedural sin foto + foil holográfico (perlado brand, difracción sobre contornos grabados, grano) que sigue al puntero y orbita solo en reposo. Se monta en cualquier dispositivo con WebGPU; con `prefers-reduced-motion: reduce` renderiza un único frame estático. Sin WebGPU, o si la GPU falla después de montar, queda el fallback CSS (gradiente holográfico + sheen). El cuerpo del ticket es navy, sin textura fotográfica.

Verificación offscreen sin navegador: `vgpu/node` (Dawn) con `VK_ICD_FILENAMES` apuntando al ICD de SwiftShader de Chrome renderiza `foil.wgsl` a un target y permite leer los píxeles.

## OG image

`public/og.png` (1200×630) es un **stub** tipográfico. Reemplazar por el render del ticket manteniendo el nombre de archivo y verificar con el preview de WhatsApp/Twitter.
