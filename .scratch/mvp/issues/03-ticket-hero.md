# 03: Ticket hero + boletería + marquee (H1–H6)

**What to build:** Hero completo: H1 + bajada, ticket HTML/CSS (notch, stub, ADMIT ONE, N°/35, barcode/QR, ANDÉN JUJ / GATE PRE), stack 3D + tilt/sheen desktop, vertical mobile, boletería 35 asientos, marquee "movida tren". Estados placeholder / inscripción abierta. Respetar `prefers-reduced-motion`.

**Blocked by:** 01

**Status:** done

- [x] Ticket anatomía desktop §2.2 + mobile §2.3
- [x] Tilt ±8° + foil sheen; off en reduced-motion y mobile
- [x] Boletería pill + 35 asientos (H5)
- [x] Marquee pausable (H6)
- [x] CTA hero estados según config (I1–I4)
- [x] `aria-label` en ticket; contraste CTA navy-on-orange
- [x] Smoke visual: screenshot desktop+mobile en `.scratch/mvp/playwright/03/`
- [x] Commit: `feat(hero): ticket boletería marquee (T03)`

**Notas:** QR y barcode son decorativos (patrón determinista, sin lib); QR real con URL Luma queda para cuando exista el link. "Avisame cuando abra" no se renderiza (canal sin definir, spec §6). Estado `open` verificado temporalmente con config alterada (`desktop-1440-open.png`); config final intacto. Dev requiere Node ≥22.23.4 (VM tiene 20).
