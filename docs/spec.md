# Pre-Hackatón · jujuy.dev — Spec (T04)

> Landing online del **Pre-Hackatón** (Road to Solar Train Hackathon).
> Inputs: `docs/brief.md`, `docs/brief-visual.md`, `docs/design.md`, `docs/notas-criterios.txt`.
> Este documento define **qué** se construye y **con qué decisiones**. La fuente de verdad visual es `docs/design.md` (tokens, ticket, componentes, copy de ejemplo); acá solo se referencia, no se repite.
> No contiene código de app.

---

## 1. Problem Statement

La Solar Train Hackathon tiene cupos contados: 30 jujeños por esta landing (Pre) y 30 invitados especiales de otras provincias, que se gestionan aparte. Hace falta un mecanismo online, transparente y con identidad propia para elegir a los 30 jujeños. Hoy no hay un lugar único donde un dev o equipo de Jujuy pueda:

- entender cómo se gana un ticket y con qué criterios lo evalúan,
- inscribirse (Luma) y entregar su proyecto (repo, demo, video),
- ver el calendario de workshops y quién evalúa,

y la landing existente (https://pre-hacka-landing.vercel.app/) tiene un ticket flat que no transmite el nivel del evento, y su código no está en el repo (`FrancoDuran23/tren-solar-hackathon` solo tiene README).

## 2. Solution

Una **landing de una página** con estética "movida tren" (navy + naranja + blanco) que funciona como andén: el visitante llega, ve el **ticket hero** (30 ADMIT ONE), entiende las reglas (hard gate Jujuy, 5 criterios 0–10, 50% organización + 50% jurados), se inscribe en **Luma** (link externo) y **entrega su proyecto en la misma página** (repo + demo + video + tracción). Lo que todavía no está definido (link Luma, fecha de cierre, workshops, jurado) se muestra en estados "pronto / próximamente" diseñados, no como huecos. El sponsor del hackathon se insinúa con un cohete y **no se nombra**.

---

## 3. User Stories

Actores: **Visitante** (aún no decidió), **Participante** (dev/equipo de Jujuy), **Invitado** (otra provincia), **Organización** (jujuy.dev).
Convención: `H1`, `I1`… = letra de grupo + número. Cada historia tiene criterio de aceptación breve (CA).

### H — Hero / Home

- **H1.** Como visitante, quiero ver arriba de todo el headline "Y vos… ¿te ganás tu ticket?" con una bajada que diga "30 tickets a la Solar Train Hackathon", para entender el producto en 5 segundos.
  *CA:* H1 es `<h1>` único de la página; eyebrow, bajada y micro-línea según `design.md §5 Hero`.
- **H2.** Como visitante, quiero ver el **ticket hero** (cuerpo + notch + stub, N° ··/30, ADMIT ONE, barcode/QR, ANDÉN JUJ / GATE PRE) para sentir el nivel del evento.
  *CA:* anatomía de `design.md §2.2` (desktop) y `§2.3` (mobile); estado *placeholder* por defecto; `aria-label` descriptivo.
- **H3.** Como visitante en desktop, quiero que el ticket tenga stack 3D con tilt y sheen de foil al pasar el puntero, para que se sienta un objeto premium.
  *CA:* tilt ±8°, sheen en hover; todo se congela con `prefers-reduced-motion: reduce`.
- **H4.** Como visitante en mobile, quiero el ticket en layout vertical sin tilt, con sheen al entrar en viewport, para que cargue liviano.
  *CA:* 340×620 nominal, sin capas fantasma; breakpoint horizontal ≥ 1024px.
- **H5.** Como visitante, quiero ver la boletería "30 TICKETS · 30 JUJEÑOS" (pill + tira de 30 asientos libres), para dimensionar la escasez.
- **H6.** Como visitante, quiero un marquee "movida tren" debajo del hero, para sentir el vibe sin que me estorbe.
  *CA:* se pausa en hover/foco y en reduced motion.
- **H7.** Como visitante, quiero una nav fija con "Cómo funciona · Criterios · Workshops · Entregar proyecto" y barra de progreso "vía", para moverme rápido.
  *CA:* anclas `#como`, `#criterios`, `#workshops`, `#entrega`; menú colapsable en mobile.
- **H8.** Como visitante, quiero entender qué es el Pre ("Un pre-hackatón para ganarte el asiento") con los 3 datos clave (Formato online · Tickets 30 · Destino Solar Train Hackathon), para saber de qué se trata antes de comprometerme.
- **H9.** Como visitante, quiero ver los tres pasos **Inscribite → Construí → Subite al tren** unidos por una línea de vía, para entender el flujo completo.

### I — Inscripción (Luma)

- **I1.** Como visitante, quiero un CTA primario "Inscribite en Luma →" que me lleve al evento en Luma en una pestaña nueva, para anotarme.
  *CA:* link externo con `rel="noopener noreferrer"`; mismo estado y destino en hero, nav y CTA final.
- **I2.** Como visitante, mientras no exista el link de Luma, quiero ver el CTA en estado "Inscripción abre pronto" (deshabilitado, `aria-disabled`) y poder dejar mi mail para que me avisen, para no quedarme sin acción.
  *CA:* el estado lo gobierna **una sola variable de config** (`LUMA_URL` vacío ⇒ "pronto"); cambiar a vivo no requiere tocar componentes.
- **I3.** Como organización, quiero que al cargar el link de Luma el QR del ticket y el chip pasen a "Inscripción abierta", para que la página se actualice con un solo cambio de config.
- **I4.** Como visitante, quiero ver CTA en estado "Inscripción cerrada" + "Ver proyectos" cuando se cierre, para saber que ya no puedo anotarme.
  *CA:* estados `pronto | abierta | cerrada` definidos en un único tipo de config (ver §4.5).
- **I5.** Como visitante, quiero que quede claro que **inscribirse en Luma** y **entregar el proyecto** son dos pasos distintos, para no confundirme.

### K — Cupos e invitados

- **K1.** Como visitante, quiero ver los dos cupos (`30 · JUJEÑOS` por scoring y `30 · INVITADOS ESPECIALES` de otras provincias), para entender la composición del hackathon.
- **K2.** Como invitado de otra provincia, quiero que la página me diga que mi cupo se gestiona aparte, para no intentar entrar por el scoring.
- **K3.** Como visitante, quiero leer "Vas a buildear con los mejores de Argentina", para sentir que vale la pena competir.

### C — Countdown / tablero

- **C1.** Como visitante, quiero un tablero de salidas tipo split-flap con tres modos (**apagado**, **tentativo**, **en vivo**), para ver el tiempo restante sin falsas precisiones.
  *CA:* modo derivado de config: sin fecha ⇒ apagado; fecha con flag `tentative` ⇒ tentativo (chip "fecha tentativa" + aclaración); fecha confirmada ⇒ en vivo.
- **C2.** Como visitante, quiero que en modo apagado el tablero diga "HORARIO POR CONFIRMAR" sin dígitos, para no ver `00:00:00` engañoso.
- **C3.** Como visitante, quiero que al llegar a cero el tablero diga "SALIÓ · ENTREGAS CERRADAS" y el form se bloquee, para entender que terminó.
- **C4.** Como usuario de lector de pantalla, quiero que el countdown no anuncie cada segundo, para no ser interrumpido.
  *CA:* `aria-live` solo en cambios de modo, no en ticks; reduced motion ⇒ sin flip.

### S — Scoring visible

- **S1.** Como visitante, quiero ver el **hard gate** destacado ("Para subirte tenés que vivir o residir en Jujuy"), para saber si puedo competir antes de invertir tiempo.
- **S2.** Como visitante, quiero ver los **5 criterios** (utilidad, experiencia de usuario, modelo de negocio, tecnología interesante, tracción) con puntaje **0–10** cada uno, para saber cómo me evalúan.
- **S3.** Como participante, quiero que **tracción** liste las evidencias válidas (users, revenue, waitlist, stars; número + link o captura), para saber qué debo mostrar.
- **S4.** Como visitante, quiero ver el split **50% organización / 50% jurados** y la regla "suben los 30 con mayor puntaje", para confiar en el proceso.
- **S5.** Como visitante, quiero un FAQ de ~6 preguntas (¿vivir en Jujuy?, ¿equipo?, ¿tracción?, ¿presencial?, ¿sin demo?, ¿cuándo cierra?), para resolver dudas sin escribir.

### E — Entrega de proyecto

- **E1.** Como participante, quiero un form de entrega en la landing con **nombre del proyecto, responsable, email, URL de repo, URL de demo, URL de video**, para entregar sin salir de la página.
- **E2.** Como participante, quiero un checkbox obligatorio "Vivo o resido en Jujuy" (+ localidad), para declarar el hard gate; sin marcarlo no puedo enviar.
- **E3.** Como participante, quiero cargar opcionalmente **tracción** (tipo, número, evidencia por URL), para sumar en ese criterio.
  *CA:* si hay tipo, la evidencia es obligatoria; número ≥ 0.
- **E4.** Como participante, quiero validación inline (al perder foco) con mensajes claros: repo en github/gitlab/codeberg, demo https, video youtube/vimeo/loom/drive, descripción ≤ 280 chars, para corregir antes de enviar.
- **E5.** Como participante, quiero un estado de éxito "Proyecto a bordo" con un **comprobante** (Hacker ID, hora, resumen de los links), para tener constancia.
- **E6.** Como participante, quiero un error de servidor claro ("No pudimos despachar tu proyecto. Probá de nuevo en un minuto.") sin perder lo que escribí, para reintentar.
- **E7.** Como visitante, antes de que abran las entregas, quiero ver el form visible pero deshabilitado con banner explicativo, para saber qué voy a tener que preparar.
- **E8.** Como organización, quiero recibir cada entrega estructurada (campos + timestamp) en un destino que pueda exportar a planilla, para alimentar el scoring offline.
  *CA:* ver decisión §4.6.
- **E9.** Como participante, quiero poder reenviar una corrección (misma persona/email), para arreglar un link roto.
  *CA:* la última entrega por email gana; queda historial de las anteriores en el destino.
- **E10.** Como organización, quiero un honeypot y un límite básico de envíos por IP en el endpoint, para frenar spam sin captcha pesado.
- **E11.** Como participante con cuenta, quiero que la entrega quede atada a mi email de Google y que no se pueda despachar sin perfil al 100%.
  *CA:* si el auth está configurado, `POST /api/entrega` exige sesión y `profileCompleteness === 100`, y pisa el email con el de Google. Si faltan los secretos, el endpoint sigue el comportamiento de §4.6.

### A — Cuenta (Google)

- **A1.** Como visitante, quiero un botón "Entrar con Google" en la nav, para identificarme sin crear una contraseña.
  *CA:* no hay alta por email/contraseña. Con sesión, la nav muestra avatar (o inicial) y "Salir".
- **A2.** Como visitante, quiero recorrer la landing sin cuenta. El login no bloquea el contenido público.
- **A3.** Como participante, después de entrar quiero completar mi perfil y ver el porcentaje (0–100) antes de poder ver mi estado o despachar.
  *CA:* 100% exige nombre completo, confirmación "vivo o resido en Jujuy", localidad (si Jujuy), URL https de github.com y una línea de 3 a 120 caracteres. Email y avatar salen de Google; el email no se edita.

### R — Estado propio del top 30

- **R1.** Como participante con perfil al 100%, quiero ver solo si estoy en el top 30 o todavía no, para saber mi situación sin comparar con el resto.
  *CA:* la UI (`#mi-estado`) no muestra otras personas, puntajes, puestos ni listas.
- **R2.** Como organización, quiero publicar el top del fin de semana con un POST autenticado por secreto, sin un panel público.
  *CA:* `POST /api/admin/ranking` con `ADMIN_SECRET`. El body es la lista completa: esos emails quedan `inTop=true` y el resto `inTop=false`.

### W — Workshops

- **W1.** Como visitante, quiero una sección de workshops en formato tablero (DÍA · HORA · TEMA · SPEAKER · ESTADO) que hoy diga "Próximamente — la agenda se lanza pronto", para saber que habrá apoyo.
- **W2.** Como visitante, quiero un link "Avisame cuando salga la agenda →" (captura de mail o mailto), para no perderme la publicación.
- **W3.** Como organización, quiero publicar la agenda cargando datos (no tocando markup), para activar el estado "publicado" con filas reales.
  *CA:* datos en un archivo tipado; si la lista está vacía ⇒ "próximamente"; si tiene ítems ⇒ filas con pill `ONLINE` y link a Luma/detalle si existe.
- **W4.** Como visitante en mobile, quiero que cada fila del tablero sea una card de dos líneas, para leerla sin scroll horizontal.

### J — Jurado

- **J1.** Como visitante, quiero ver un bloque "Jurado: próximamente" con 4 siluetas (`?`, nombre `———`, rol "Jurado · por confirmar"), para saber que habrá jurado externo.
- **J2.** Como visitante, quiero que ahí se repita que el jurado pone el 50% del puntaje, para ligarlo al scoring.
- **J3.** Como alguien interesado en ser jurado, quiero un link "¿Querés ser jurado? Escribinos →", para postularme.
- **J4.** Como organización, quiero cargar jurados (nombre, rol, foto, link social) en un archivo de datos y que las siluetas se reemplacen solas, para no rehacer la sección.

### P — Sponsor sorpresa

- **P1.** Como visitante, quiero ver una card "Sponsor sorpresa a bordo" con un cohete en línea y estela naranja, para intuir que hay un sponsor grande sin saber cuál.
- **P2.** Como organización, quiero garantía de que **no aparezca** nombre, logo, iniciales, color ni pista del sponsor en HTML, assets, `alt`, metadatos, comentarios, nombres de archivo ni analytics, para respetar la confidencialidad.
  *CA:* revisión explícita en el checklist de release (ver §5).
- **P3.** Como visitante, quiero un chip "CLASIFICADO · SE ABRE EN EL HACKATHON", para entender cuándo se revela.

### F — Footer / legal / meta

- **F1.** Como visitante, quiero un footer con logo jujuy.dev, links (Luma cuando exista, repo, redes), "Hecho en Jujuy, Argentina" y la línea mono del evento, para ubicar a la comunidad.
- **F2.** Como visitante, quiero un CTA final "Sacá tu ticket" con el mismo estado que el hero, para actuar al terminar de leer.
- **F3.** Como participante, quiero ver una nota de privacidad breve junto al form (qué datos se piden, para qué, quién los ve), para saber qué hacen con mis datos.
- **F4.** Como visitante que comparte el link, quiero que la preview (OG/Twitter) muestre el ticket 1200×630 sobre fondo navy, para que el link se vea bien en redes y WhatsApp.
- **F5.** Como visitante, quiero que el sitio tenga `<title>`, description, favicon y `lang="es-AR"`, para que se indexe y se vea bien en pestañas.

---

## 4. Implementation Decisions

### 4.1 Stack

| Capa | Decisión | Por qué |
|---|---|---|
| Framework | **Astro** (misma familia que la landing viva https://pre-hacka-landing.vercel.app/, Astro 7) | Sitio mayormente estático, mínimo JS, islas solo donde hace falta. Mantiene continuidad con lo ya deployado. |
| Lenguaje | **TypeScript** (modo estricto) | Config y datos tipados (§4.5). |
| Estilos | **CSS plano con custom properties** que mapean 1:1 los tokens de `docs/design.md §1` (`--navy-900`, `--orange-500`, `--sp-*`, `--r-*`, etc.). Sin framework CSS. | Los tokens ya están definidos; evita reinterpretarlos. Un único `tokens.css` como fuente. |
| Islas JS | Solo para: tilt/sheen del ticket, countdown, form de entrega, acordeón FAQ. Cargar con `client:visible` / `client:idle`. Framework de isla: el mínimo que Astro permita (preferible JS vanilla o Preact; no React completo). | Perf y Lighthouse. |
| Fuentes | Unbounded, Inter, JetBrains Mono, **self-hosted** (subset latino, `font-display: swap`). | Evita requests a terceros y layout shift. |
| Iconos / ilustraciones | SVG inline (cohete, tren "M", molinete, candado, reloj). | Sin dependencias; se pintan con tokens. |
| Deploy | **Vercel**, branch `main` ⇒ producción, PRs ⇒ preview. | Ya se usa. |
| Repo | `FrancoDuran23/tren-solar-hackathon` (hoy solo README). | Definido en `brief-visual.md`. |

### 4.2 Estructura de contenido

- **Una sola ruta** `/` con secciones en el orden de `design.md §4`. Páginas extra solo si hacen falta (404).
- **Copy en español rioplatense con voseo** ("Inscribite", "Entregá", "Subite"). Sin jerga crypto. Tomar el copy de `design.md §5` como base; editable sin tocar componentes (archivo de contenido).
- **Un solo tier** de ticket (las 3 capas del stack son el mismo ticket).
- Tamaños de tipografía, spacing, radios, sombras y motion según tokens de `design.md`.

### 4.3 Luma

- Luma es **link externo**, sin embed ni API. Abre en pestaña nueva.
- Mientras el link sea TBD, el CTA muestra el estado "pronto" (I2). No inventar ni hardcodear una URL placeholder.

### 4.4 Sponsor

- El sponsor sorpresa **no se nombra ni se insinúa más allá del cohete** (P2). Ningún asset, `alt`, comentario HTML, metadato o nombre de archivo menciona al sponsor real.

### 4.5 Config y datos (fuente única de estado)

Un módulo de configuración tipado concentra el estado que hoy es TBD, para que "abrir" una sección sea editar datos y no componentes:

| Clave | Tipo | Efecto |
|---|---|---|
| `lumaUrl` | `string \| null` | `null` ⇒ CTA "pronto"; con valor ⇒ CTA vivo + QR del ticket. |
| `registration` | `'soon' \| 'open' \| 'closed'` | Estado del CTA y del chip del ticket. |
| `deadline` | `{ iso: string, tentative: boolean } \| null` | Modo del tablero y campo CIERRE del ticket. |
| `submissions` | `'closed' \| 'open'` | Habilita el form de entrega. |
| `workshops` | `Workshop[]` | Vacío ⇒ "próximamente". |
| `jury` | `Juror[]` | Vacío ⇒ siluetas. |
| `ticketsAssigned` | `number` (0–30) | Tira de asientos y sello "EMITIDO". |

Los textos de FAQ, criterios y pasos viven en archivos de contenido tipados, no en los componentes.

### 4.6 Form de entrega

Sin backend pesado en MVP. Decisión:

- **UI**: form en la landing (isla), validación client-side según `design.md §3.10`.
- **Transporte (MVP)**: **una API route serverless de Vercel** (`/api/entrega`) que valida de nuevo en servidor, aplica honeypot + rate-limit simple, y **reenvía a un destino exportable**. Opciones de destino, en orden de preferencia:
  1. **Formspree** (o equivalente) vía `fetch` desde la route, con el endpoint en variable de entorno. Cero infra propia.
  2. **Google Sheets / webhook** (Apps Script) si la organización prefiere planilla directa.
- **Stub inicial**: si no hay variable de entorno de destino, el endpoint responde `501` con mensaje claro y la UI muestra el error de servidor (E6); en dev puede loguear el payload. Así el front se desarrolla y prueba sin bloquearse por el backend (pendiente en `design.md §8`).
- **Hacker ID**: `JDV-2026-####` generado por el servidor (secuencial o hash corto). Si el destino no permite secuencial, usar hash corto y mostrarlo igual en el comprobante.
- **Comprobante**: se muestra en pantalla y se descarga (PNG/HTML); el envío por email depende del destino elegido y no bloquea el MVP.
- **Evidencia de tracción**: solo por **URL** en MVP. La subida de archivos (png/jpg ≤ 5 MB de `design.md`) queda como mejora posterior para no sumar storage.
- **Anti-abuso**: honeypot, límite por IP, payload máximo, sanitización. Sin captcha en MVP.
- **Datos personales**: solo los del form; sin tracking de terceros. Nota de privacidad (F3).
- **Cierre**: `submissions: 'closed'` desactiva el form en UI **y** el endpoint rechaza con `403`.
- **Con auth configurado (T16–T18)**: además, la entrega exige sesión de Google y perfil al 100% (§4.9). El email del payload es el de la cuenta, y se agrega `userId`. Sin las variables de auth, este gate no se aplica y el endpoint se comporta como el stub de arriba.

### 4.7 Ticket y motion

- Ticket construido con **HTML + CSS** (clip-path/mask para notch y chanfle) y SVG para barcode/QR/logo; **no** como imagen plana (accesibilidad + estados).
- Estados implementados en el MVP: *placeholder*, *inscripción abierta*, *hover/tilt*, *foco*, *reduced motion*. *Personalizado*, *emitido* y *skeleton* (`design.md §2.4`) quedan como **fase 2** (dependen de datos de ganadores).
- QR: apunta a Luma cuando exista; mientras tanto, a la URL de la landing.
- Textura Quebrada: usar la foto duotono si hay derechos; **fallback** degradé navy→naranja + grano (`design.md §8`).
- Todo lo decorativo se apaga con `prefers-reduced-motion: reduce`.

### 4.8 SEO, analytics, performance

- Meta tags, OG/Twitter con render 1200×630 estático del ticket (F4), `lang="es-AR"`, sitemap y robots básicos.
- Analytics: opcional y sin cookies (p. ej. Vercel Web Analytics) — decidir al deploy; no bloquea el MVP.
- Imagen del hero `loading="eager"` + `fetchpriority="high"`; resto lazy. Sin texto dentro de imágenes salvo el render OG.

### 4.9 Auth, perfil y estado propio (T16–T18)

Stack elegido: **Better Auth** (solo Google, sin email/contraseña) + **Neon Postgres** (`pg` contra el connection string pooled) + adapter `@astrojs/vercel`. No se usa Clerk.

| Pieza | Dónde |
|---|---|
| Handler | `src/pages/api/auth/[...all].ts` |
| Sesión para la UI | `GET /api/me` (la landing sigue estática; el estado se pide en el cliente) |
| Perfil | `PUT /api/profile`, tabla `profile` por `user.id` |
| Estado propio | `GET /api/me` incluye `ranking` solo si `profileCompleteness === 100` |
| Publicación semanal | `POST /api/admin/ranking` |

**Perfil al 100%.** Cinco checks de 20%: nombre completo (nombre y apellido), confirmación de que vive o reside en Jujuy, localidad (solo cuenta si esa confirmación es sí), URL `https://github.com/…` y una línea de 3–120 caracteres. Se puede guardar un borrador. El porcentaje que gatea es el guardado en la base, no el del formulario sin enviar.

**Ranking privado.** Tabla `ranking` por email (el de Google, en minúsculas) con `in_top` y `updated_at`, más `ranking_meta` para la etiqueta de la semana. La UI muestra una de dos frases: "Estás en el top 30" o "Todavía no estás en el top", y la etiqueta si existe. Quien no tiene fila se lee como "todavía no".

**Actualización de la organización (reemplazo total, no incremental).** Cada fin de semana se manda la lista completa de quienes están en el top. Esos emails quedan `inTop=true`; cualquier otra fila pasa a `inTop=false`. No hay UI de admin. Detalle, variables y el `curl` están en `docs/auth-ranking.md`.

**Sin secretos.** `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_SECRET` y `BETTER_AUTH_URL` son opcionales en el schema de Astro. Si faltan, `astro check` / `astro build` pasan, el botón de ingreso avisa que todavía no está habilitado y `/api/auth/*` responde 503. La entrega anónima sigue el stub de §4.6.

**Sponsor.** Nada de esto nombra al sponsor del hackathon.

---

## 5. Non-goals

Fuera del alcance de este spec y del MVP:

1. **App de scoring interno**: el puntaje (organización + jurados) se calcula offline/en planilla. La landing solo explica los criterios.
2. **Login con email y contraseña, magic links y panel de scoring.** El ingreso es solo con Google (§4.9). El puntaje de organización y jurado se sigue calculando offline.
3. **CRUD de proyectos**: sin panel para ver/editar/borrar entregas dentro de la web; la organización las ve en el destino exportable (§4.6).
4. **App móvil** (nativa o PWA instalable).
5. Pasarela de pago o venta de tickets (los tickets no se compran).
6. Hosting de archivos/capturas de tracción (solo URL).
7. **Ranking público.** La landing no publica listas, puntajes ni posiciones de otras personas. El estado propio (top 30 sí/no) está en §4.9.
8. Gestión de los 30 invitados especiales en la web (se coordinan aparte).
9. Landing del hackathon principal y cualquier mención del sponsor real.
10. CMS o backoffice: el contenido se edita en archivos del repo.
11. i18n: solo español (es-AR).

---

## 6. Acceptance criteria globales

La landing se considera lista para producción cuando cumple **todo**:

### Contenido y reglas de negocio
- [ ] Están presentes las secciones y el orden de `design.md §4` (salvo las explícitamente en fase 2).
- [ ] Hard gate, 5 criterios 0–10, tracción con evidencias y split 50/50 son visibles y coinciden con `docs/brief.md`.
- [ ] Cupos 30 + 30 y el mensaje "mejores de Argentina" están visibles.
- [ ] Jurado y workshops muestran estado "próximamente" mientras sus listas estén vacías; al cargar datos se reemplazan sin tocar markup.
- [ ] El sponsor **no está nombrado** ni insinuado fuera del cohete (revisión de HTML, assets, `alt`, meta, comentarios y nombres de archivo).
- [ ] Copy en español con voseo.
- [ ] Con `lumaUrl = null` ⇒ CTA "Inscripción abre pronto" (sin link roto). Con `lumaUrl` ⇒ CTA vivo en hero, nav y cierre.
- [ ] Sin fecha de cierre ⇒ tablero "apagado"; sin dígitos falsos.
- [ ] Form: bloqueado hasta marcar "Vivo o resido en Jujuy"; validaciones de `design.md §3.10`; estados cerrado / validando / enviando / éxito / error funcionan.
- [ ] Con auth configurado: sin sesión no se despacha; sin perfil al 100% no se ve el estado propio ni se despacha; el estado no lista a nadie más.
- [ ] Sin las variables de auth el build pasa y la landing pública sigue usable.

### Responsive
- [ ] Probado en **360, 768, 1024 y 1440 px** de ancho.
- [ ] Sin scroll horizontal en ningún breakpoint.
- [ ] Ticket vertical (< 1024) y horizontal (≥ 1024); tilt solo en desktop con puntero.
- [ ] Tablero, criterios y workshops se reacomodan a cards en mobile.
- [ ] Targets táctiles ≥ 44×44 px; inputs de 48 px de alto.

### Accesibilidad
- [ ] Contraste AA en todo el texto usando los pares de `design.md §1.1`; **CTAs siempre navy sobre naranja**, nunca blanco sobre naranja.
- [ ] Un solo `<h1>`; jerarquía de headings sin saltos; landmarks (`header`, `nav`, `main`, `footer`).
- [ ] Navegación completa por teclado; foco visible (anillo `--focus`) en todo elemento interactivo; orden de tab: nav → CTA hero → ticket → secciones.
- [ ] Labels asociados a cada input; errores vinculados con `aria-describedby`; estado de envío anunciado.
- [ ] Todo lo animado (tilt, sheen, marquee, split-flap, pulso) respeta `prefers-reduced-motion`; marquee pausable.
- [ ] Ticket con `aria-label` descriptivo; texto decorativo mono del stub con `aria-hidden`.
- [ ] Texto del cuerpo ≥ 14 px; 10–11 px solo en mono decorativo.

### Performance y calidad (Lighthouse, build de producción, perfil mobile)
- [ ] **Performance ≥ 90**, **Accessibility ≥ 95**, **Best Practices ≥ 95**, **SEO ≥ 95**.
- [ ] LCP < 2,5 s, CLS < 0,1, TBT bajo (sin bloqueos largos del hilo principal).
- [ ] JS enviado mínimo: sin JS en secciones estáticas; islas hidratadas bajo demanda.
- [ ] Fuentes self-hosted con `font-display: swap` y subset.
- [ ] Sin errores en consola; HTML válido; sin requests a dominios no declarados (salvo el destino del form y el link a Luma).

### Entrega técnica
- [ ] Build sin errores ni warnings de TypeScript.
- [ ] Deploy en Vercel con preview por PR y producción desde `main`.
- [ ] Variables de entorno documentadas en el README (destino del form).
- [ ] Meta/OG verificados (preview de WhatsApp/Twitter con el ticket 1200×630).

---

## 7. Mapa de secciones ↔ user stories

Numeración de secciones = `design.md §4`.

| # | Sección | Anclas | User stories |
|---|---|---|---|
| 0 | Nav + barra "vía" | — | H7, I1, I2 |
| 1 | Hero + ticket + boletería | `#top` | H1, H2, H3, H4, H5, I1, I2, I3, I4 |
| 2 | Marquee | — | H6 |
| 3 | Qué es | — | H8 |
| 4 | Cómo funciona (3 pasos) | `#como` | H9, I5 |
| 5 | Tablero / countdown | — | C1, C2, C3, C4 |
| 6 | Criterios | `#criterios` | S1, S2, S3, S4 |
| 7 | Cupos 30 + 30 | — | K1, K2, K3 |
| 8 | Workshops | `#workshops` | W1, W2, W3, W4 |
| 9 | Tu perfil + tu estado | `#perfil`, `#mi-estado` | A1–A3, R1, R2 |
| 9b | Entregá tu proyecto | `#entrega` | E1–E11, F3 |
| 10 | Jurado | `#jurado` | J1, J2, J3, J4 |
| 11 | Sponsor sorpresa | — | P1, P2, P3 |
| 12 | FAQ | `#faq` | S5, K2 |
| 13 | CTA final | — | F2, I1, I2 |
| 14 | Footer | — | F1, F5 |
| — | `<head>` / meta | — | F4, F5 |

**Cobertura inversa (por grupo):** H → 0,1,2,3,4 · I → 0,1,4,13 · K → 7,12 · C → 5 · S → 6,12 · A → 0,9 · R → 9,12 · E → 9b · W → 8 · J → 10 · P → 11 · F → 9b,13,14,head.

---

## 8. Preguntas abiertas / datos pendientes

No bloquean el MVP; el diseño y los estados ya las contemplan (ver `design.md §8`).

| Dato | Estado | Impacto |
|---|---|---|
| Link de Luma | TBD | CTA y QR (I2, I3). |
| Fecha de cierre (y si es tentativa) | TBD | Tablero y campo CIERRE del ticket (C1). |
| Fecha de apertura de entregas | TBD | Estado del form (E7). |
| Agenda de workshops | TBD | W1, W3. |
| Nombres del jurado | TBD | J1, J4. |
| Destino del form (Formspree vs. Sheets) | A decidir por la organización | §4.6. |
| Foto de la Quebrada con derechos | TBD | Textura del ticket; fallback definido. |
| Canal para "Avisame cuando abra" / jurados | A definir (mail o form simple) | I2, W2, J3. |
| ¿Hay elementos extra (p. ej. "bonus track" / tesoro escondido de las notas)? | Fuera de este spec; confirmar con la organización si entra en la landing | — |
