# 06: Form entrega + API `/api/entrega` stub

**What to build:** Form E1–E10 + F3: campos proyecto/responsable/email/repo/demo/video + checkbox Jujuy + tracción opcional; validación inline; estados UI; API route Vercel valida + honeypot + rate-limit; sin env ⇒ 501; con env ⇒ Formspree/webhook. Comprobante Hacker ID en éxito. `submissions:closed` bloquea UI y API.

**Blocked by:** 01, 02

**Status:** done

- [x] Form completo + privacidad breve (E1–E3, F3)
- [x] Validaciones design.md §3.10 (E4)
- [x] Éxito con comprobante / error sin perder datos (E5, E6)
- [x] Form disabled si submissions closed (E7)
- [x] `/api/entrega` stub 501 + honeypot (E8, E10)
- [x] Documentar env en README
- [x] Smoke Playwright form en `.scratch/mvp/playwright/06/`
- [x] Commit: `feat(entrega): form + api stub (T06)`
