# 03: Ticket hero + boletería + marquee (H1–H6)

**What to build:** Hero completo: H1 + bajada, ticket HTML/CSS (notch, stub, ADMIT ONE, N°/35, barcode/QR, ANDÉN JUJ / GATE PRE), stack 3D + tilt/sheen desktop, vertical mobile, boletería 35 asientos, marquee "movida tren". Estados placeholder / inscripción abierta. Respetar `prefers-reduced-motion`.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Ticket anatomía desktop §2.2 + mobile §2.3
- [ ] Tilt ±8° + foil sheen; off en reduced-motion y mobile
- [ ] Boletería pill + 35 asientos (H5)
- [ ] Marquee pausable (H6)
- [ ] CTA hero estados según config (I1–I4)
- [ ] `aria-label` en ticket; contraste CTA navy-on-orange
- [ ] Smoke visual: screenshot desktop+mobile en `.scratch/mvp/playwright/03/`
- [ ] Commit: `feat(hero): ticket boletería marquee (T03)`
