# 01: Scaffold Astro 7 + TypeScript + tokens + config

**What to build:** Repo usable: Astro 7 + TS strict, `src/styles/tokens.css` mapeando 1:1 `docs/design.md §1`, módulo `src/config.ts` tipado (`lumaUrl`, `registration`, `deadline`, `submissions`, `workshops`, `jury`, `ticketsAssigned`) con defaults TBD (CTA pronto, form closed, workshops/jury vacíos), layout base mínimo, README con scripts y env vars del form. Empujar estructura hacia `FrancoDuran23/tren-solar-hackathon` sin romper docs/.

**Blocked by:** —

**Status:** done

- [x] `npm create` / scaffold Astro 7 + TypeScript estricto; `astro check` y `astro build` pasan
- [x] `src/styles/tokens.css` con tokens de design.md (navy/naranja/blanco, tipografía, spacing, radios)
- [x] `src/config.ts` tipado con estados TBD; un solo lugar gobierna "pronto/próximamente"
- [x] Fuentes self-hosted declaradas (Unbounded, Inter, JetBrains Mono) o placeholders documentados
- [x] README: scripts, deploy Vercel, env del destino del form
- [x] Commit: `feat(scaffold): Astro 7 + tokens + config (T01)`
