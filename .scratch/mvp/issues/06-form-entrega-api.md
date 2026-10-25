# 06: Form entrega + API `/api/entrega` stub

**What to build:** Form E1–E10 + F3: campos proyecto/responsable/email/repo/demo/video + checkbox Jujuy + tracción opcional; validación inline; estados UI; API route Vercel valida + honeypot + rate-limit; sin env ⇒ 501; con env ⇒ Formspree/webhook. Comprobante Hacker ID en éxito. `submissions:closed` bloquea UI y API.

**Blocked by:** 01, 02

**Status:** ready-for-agent

- [ ] Form completo + privacidad breve (E1–E3, F3)
- [ ] Validaciones design.md §3.10 (E4)
- [ ] Éxito con comprobante / error sin perder datos (E5, E6)
- [ ] Form disabled si submissions closed (E7)
- [ ] `/api/entrega` stub 501 + honeypot (E8, E10)
- [ ] Documentar env en README
- [ ] Smoke Playwright form en `.scratch/mvp/playwright/06/`
- [ ] Commit: `feat(entrega): form + api stub (T06)`
