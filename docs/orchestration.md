# Pre-Hackatón — Cómo orquestar la landing

**Archivos:** brief `docs/brief.md` · design `docs/design.md` · spec `docs/spec.md` · DAG `docs/dag.md` · tickets `.scratch/mvp/issues/NN-*.md`.

## Regla de RAM
- Máximo **2 workers** concurrentes. Antes de lanzar: `free -g`; si quedan < 4 GiB libres, no lanzar.
- Un worker = un ticket. Detener `astro dev` al cerrar.

## Flujo
1. Frontier: tickets `ready-for-agent` con `Blocked by` cerrados.
2. Lanzar ≤2 con el modelo de `dag.md`.
3. Worker lee `spec.md`, su ticket y `design.md`; implementa; Playwright smoke en tickets UI.
4. Al cumplir checkboxes: Status `done`, commit, liberar slot, recalcular frontier.
5. Orden: W0(01) → W1(02∥03) → W2(04∥05) → W3(06) → W4(07).

## Fable
- Ya entregó `design.md`. Solo vuelve para review visual puntual si un ticket se desvía fuerte.

## Autonomía
- El orquestador no pide "dale" entre waves. Avisa a Franco al cerrar cada wave o si hay blocker real.
