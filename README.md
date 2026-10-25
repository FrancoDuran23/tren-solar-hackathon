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

`public/brand/logo-jujuy-dev.svg` es un **placeholder** (cuadrado naranja + texto). Reemplazar por el logo oficial de la comunidad manteniendo el nombre de archivo.

## Variables de entorno (form de entrega, T06)

Ver `.env.example`.

| Variable | Descripción |
|---|---|
| `ENTREGA_WEBHOOK_URL` | Destino exportable de `/api/entrega` (endpoint Formspree o webhook de Google Apps Script). Si falta, el endpoint responde `501` y la UI muestra el error de servidor. Con valor, la route valida de nuevo, aplica honeypot (`website`) + rate-limit (5 envíos / 10 min por IP, en memoria) y hace `POST` JSON con los campos + `hackerId` + `submittedAt`. |

`config.submissions = 'closed'` deshabilita el form y hace que la API responda `403`. Smoke: `.scratch/mvp/playwright/06/smoke.mjs`.

En Vercel: Project → Settings → Environment Variables. Local: copiar `.env.example` a `.env`.

## Deploy (Vercel)

Rama `main` ⇒ producción, PRs ⇒ preview. Framework preset: Astro; build `npm run build`; output `dist`. Configurar Node 22.x en Project Settings. El adapter `@astrojs/vercel` ya está configurado (T06) para la route `/api/entrega`.
