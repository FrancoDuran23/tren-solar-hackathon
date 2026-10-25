# Pre-Hackatón — DAG landing

## Límites duros
- **Máx. 2 workers concurrentes** en esta VM (15 GB RAM). Nunca 3.
- **Modelos:** Sonnet/Composer para build. **Fable SOLO** ya usó T03 (`design.md`). **Opus NUNCA** para CSS/CRUD.
- Tickets de UI requieren `docs/design.md` + `docs/spec.md` (ya existen).
- Ningún ticket arranca hasta que todos sus `blocked_by` estén `done`.

| ticket | title | blocked_by | model | parallel_wave | notes |
|---|---|---|---|---|---|
| 01 | Scaffold Astro 7 + TS + tokens + config | — | Sonnet | 0 | Base del repo; solo |
| 02 | Shell: layout, nav, footer, meta/OG, content | 01 | Sonnet | 1 | Corre con 03 |
| 03 | Ticket hero + boletería + marquee (H1–H6) | 01 | Sonnet | 1 | Pieza visual crítica |
| 04 | Mid: qué es, pasos, countdown, criterios, cupos | 01,02 | Sonnet | 2 | Corre con 05 |
| 05 | Workshops + jurado + sponsor + FAQ + CTA final | 01,02 | Composer | 2 | CRUD de secciones estáticas → Composer |
| 06 | Form entrega + API `/api/entrega` stub | 01,02 | Sonnet | 3 | Validaciones + 501 sin env |
| 07 | Smoke Playwright + a11y + deploy Vercel | 03,04,05,06 | Sonnet | 4 | Solo al cerrar UI |

## Waves (≤2 tickets activos)
- **Wave 0:** 01 (solo).
- **Wave 1:** 02 ∥ 03.
- **Wave 2:** 04 ∥ 05.
- **Wave 3:** 06.
- **Wave 4:** 07.

```
01 ─> 02 ─┬─> 04 ─┐
          │       ├─> 06 ─> 07
          └─> 05 ─┘
01 ─> 03 ───────────────> 07
```
