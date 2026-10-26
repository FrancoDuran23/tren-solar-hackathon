# Pre-Hackatón · jujuy.dev — Design spec (T03)

> Landing online del **Pre-Hackatón** (Road to Solar Train Hackathon).
> Este documento es la fuente de verdad visual para el front. No contiene código de producción:
> define tokens, anatomía del ticket hero, componentes, orden de secciones y copy de ejemplo.
>
> Inputs: `docs/brief.md`, `docs/brief-visual.md`, `docs/notas-criterios.txt` y las cinco imágenes de `docs/refs/`.
> Brand bible: `docs/refs/guideline-solar-train-poster.jpg`. Las otras cuatro refs son **solo** lenguaje de tickets.

---

## 0. Resumen en una pantalla

| Tema | Decisión |
|---|---|
| Concepto | "Movida tren": la landing es un **andén**. El usuario llega, mira el tablero de salidas, saca su ticket y se sube. |
| Paleta | Navy profundo + naranja vivo + blanco. Grises/negro solo para los stubs técnicos del ticket. **Sin lime** Clavius. |
| Pieza hero | Ticket "tope de gama": mitad objeto premium (foil solar sobre Quebrada), mitad boarding pass (grilla mono densa, ADMIT ONE, N° __/30, barcode + QR). Apilado 3D, con notch y perforación. |
| Tono | Cinematográfico, premium, tech regional. Voseo. Frases cortas. Nada de jerga crypto. |
| Estado de datos | Luma: link TBD → CTA en estado "pronto". Jurado y workshops: "próximamente". Countdown: apagado o tentativo. Sponsor: sorpresa, motif cohete, **no se nombra**. |
| Cupos | 30 tickets por scoring (viven/residen en Jujuy) + 30 invitados especiales de otras provincias. El copy de Pre no suma los dos bloques. Mensaje: "vas a buildear con los mejores de Argentina". |

---

## 1. Tokens

### 1.1 Color

Derivados del poster (`guideline-solar-train-poster.jpg`): cielo navy, sol naranja, tipografía blanca, shards naranja en las esquinas.

#### Brand (uso libre)

| Token | Hex | Uso |
|---|---|---|
| `--navy-950` | `#060F22` | Fondo base de la página (el "espacio"). |
| `--navy-900` | `#0B1D3A` | Fondo de secciones, cuerpo del ticket, nav. **Navy principal.** |
| `--navy-800` | `#122B55` | Cards, superficies elevadas, bordes sutiles sobre navy-900. |
| `--navy-700` | `#1B3A6B` | Hover de cards, degradé de cielo (arriba del hero). |
| `--navy-600` | `#2A4E86` | Bordes activos, líneas de "vía" decorativas. |
| `--orange-500` | `#FF5A1F` | **Naranja principal.** CTAs, shards, subrayados, acentos del ticket. |
| `--orange-400` | `#FF7A2A` | Sol del hero, degradés cálidos, hover de CTA. |
| `--orange-300` | `#FF8A3D` | Highlights del foil, brillo del sheen. |
| `--orange-600` | `#D9440F` | CTA pressed, bordes de foco sobre naranja. |
| `--white` | `#FFFFFF` | Tipografía principal sobre navy. |
| `--paper` | `#F2F0EA` | Fondo del stub "boarding pass" (papel térmico, Tokyo). |

#### Neutros técnicos (solo stubs del ticket, barcodes, metadatos)

| Token | Hex | Uso |
|---|---|---|
| `--ink-950` | `#0E0F12` | Tinta del stub, barcode, QR. |
| `--ink-800` | `#1C1F26` | Texto secundario del stub, sombras duras. |
| `--ink-600` | `#3A3F4A` | Labels mono en el stub. |
| `--ink-400` | `#8B919C` | Metadatos pequeños sobre navy (legal, "unauthorised resale"). |
| `--ink-200` | `#C9CDD3` | Líneas de la grilla del stub. |
| `--ink-100` | `#E4E1DA` | Fondo alterno del stub, filas pares. |

#### Semánticos

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `--navy-950` | Body. |
| `--surface` | `--navy-900` | Secciones. |
| `--surface-2` | `--navy-800` | Cards. |
| `--text` | `--white` | Texto principal. |
| `--text-muted` | `rgba(255,255,255,.64)` | Texto secundario sobre navy. |
| `--accent` | `--orange-500` | Acento único. |
| `--success` | `#3DDC97` | Solo feedback de formulario (URL válida, "proyecto a bordo"). Nunca decorativo. |
| `--error` | `#FF4D4D` | Error de validación. |
| `--focus` | `--orange-300` | Anillo de foco, 2px + 2px offset. |

#### Degradés y texturas

| Token | Definición | Uso |
|---|---|---|
| `--grad-sky` | `linear-gradient(180deg, #060F22 0%, #0B1D3A 55%, #1B3A6B 100%)` | Fondo del hero (cielo del poster). |
| `--grad-sun` | `radial-gradient(circle at 50% 50%, #FF8A3D 0%, #FF5A1F 60%, rgba(255,90,31,0) 61%)` | Sol/círculo sólido del ticket. |
| `--grad-foil` | `linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,138,61,.28) 45%, rgba(255,255,255,.55) 50%, rgba(27,58,107,.35) 56%, rgba(255,255,255,0) 70%)` | "Foil solar": el sheen holográfico de Soul traducido a navy/naranja/blanco. Se mueve en hover. |
| `--tex-grain` | PNG/SVG de ruido monocromo, 6–8% opacidad, `mix-blend-mode: overlay` | Grano fílmico sobre hero y ticket. |
| `--tex-quebrada` | Foto de la Quebrada en duotono navy→naranja (`#0B1D3A` sombras, `#FF5A1F` luces) | Fondo del cuerpo del ticket. Reemplaza el regolito lunar de Clavius. |

#### Reglas de contraste (medidas)

| Par | Ratio aprox. | Permitido |
|---|---|---|
| Blanco sobre navy-900 | 17:1 | Todo. |
| Naranja-500 sobre navy-900 | 5.4:1 | Texto normal y grande. |
| Navy-900 sobre naranja-500 | 5.4:1 | **Texto de CTAs.** |
| Blanco sobre naranja-500 | 3.1:1 | Solo texto ≥ 24px o ≥ 19px bold. **No usar en botones.** |
| ink-950 sobre paper | 16:1 | Stub completo. |
| ink-400 sobre navy-900 | 6:1 | Metadatos pequeños. |

**Prohibido:** lime `#D9FF00`/`#CCFF00` (Clavius) en cualquier rol, incluso "contraste técnico". Naranja-sobre-negro-matrix (LABITCONF) como identidad de página.

### 1.2 Tipografía

Tres voces, como en el poster: display geométrica bold, texto neutra, mono para lo técnico.

| Rol | Familia | Fallback | Peso | Notas |
|---|---|---|---|---|
| Display | **Unbounded** (Google Fonts) | Monument Extended si hay licencia; `Arial Black` | 700 / 900 | Ancha, geométrica, cortes rectos. Títulos, "PRE-HACKATÓN" del ticket, números grandes. Tracking `-0.02em` en ≥ 48px, `+0.04em` en etiquetas mayúsculas. |
| Texto | **Inter** | `system-ui` | 400 / 500 / 600 | Párrafos, cards, form. `font-feature-settings: "ss01", "cv11"`. |
| Mono | **JetBrains Mono** | `IBM Plex Mono`, `ui-monospace` | 400 / 700 | Stub del ticket, labels GATE/VAGÓN, countdown, tablero de andén, IDs. Siempre mayúsculas con tracking `+0.08em` en labels. |

Escala (desktop → mobile). Base 16px, ratio ≈ 1.25.

| Token | Desktop | Mobile | Line-height | Uso |
|---|---|---|---|---|
| `--fs-hero` | 96px | 48px | 0.95 | Headline "Y vos… ¿te ganás tu ticket?" |
| `--fs-h1` | 64px | 40px | 1.0 | Títulos de sección. |
| `--fs-h2` | 40px | 28px | 1.1 | Subtítulos, números del countdown. |
| `--fs-h3` | 24px | 20px | 1.2 | Títulos de card. |
| `--fs-lead` | 20px | 18px | 1.5 | Bajada del hero. |
| `--fs-body` | 16px | 16px | 1.6 | Texto. |
| `--fs-small` | 14px | 14px | 1.5 | Ayudas de form, metadatos. |
| `--fs-micro` | 11px | 10px | 1.3 | Mono del stub, legales, "ADMIT ONE". |
| `--fs-ticket-no` | 56px | 36px | 1.0 | "N° 07/30" en el stub. |

### 1.3 Espaciado

Base 4px.

| Token | px | Uso típico |
|---|---|---|
| `--sp-1` | 4 | Gap de iconos. |
| `--sp-2` | 8 | Padding interno de chips. |
| `--sp-3` | 12 | Gap de grilla del stub. |
| `--sp-4` | 16 | Padding de inputs, gutter mobile. |
| `--sp-6` | 24 | Padding de cards. |
| `--sp-8` | 32 | Gap entre cards. |
| `--sp-12` | 48 | Padding vertical de sección mobile. |
| `--sp-16` | 64 | Gap título→contenido. |
| `--sp-24` | 96 | Padding vertical de sección desktop. |
| `--sp-32` | 128 | Separación hero→resto. |

Contenedor: `max-width: 1200px`, gutter 16px mobile / 32px tablet / 48px desktop. Grilla 12 col desktop, 4 col mobile.

### 1.4 Radios y bordes

| Token | Valor | Uso |
|---|---|---|
| `--r-0` | 0 | Shards, bandas, tablero de andén. Lo brand es anguloso. |
| `--r-xs` | 4 | Chips, celdas del stub. |
| `--r-sm` | 8 | Inputs, botones. |
| `--r-md` | 12 | Cards. |
| `--r-lg` | 20 | Esquinas exteriores del ticket. |
| `--r-pill` | 999 | Badge "30 tickets", pills de estado. |
| `--chamfer` | 12px | Corte diagonal en las esquinas exteriores del stub (LABITCONF). Se hace con `clip-path`, no con radio. |
| `--notch` | 14px radio | Semicírculos en la perforación (Clavius/Soul). |
| `--border` | 1px `rgba(255,255,255,.12)` | Borde por defecto sobre navy. |
| `--border-strong` | 1px `rgba(255,255,255,.28)` | Borde en hover/focus. |

### 1.5 Sombras, motion, z

| Token | Valor |
|---|---|
| `--shadow-card` | `0 8px 24px rgba(6,15,34,.45)` |
| `--shadow-ticket` | `0 30px 60px rgba(6,15,34,.65), 0 2px 0 rgba(255,255,255,.08) inset` |
| `--shadow-cta` | `0 0 0 0 rgba(255,90,31,.0)` → hover `0 0 32px rgba(255,90,31,.45)` |
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` |
| `--dur-fast` / `--dur-base` / `--dur-slow` | 120ms / 240ms / 600ms |
| Reduced motion | Todo lo decorativo (tilt, sheen, marquee, split-flap) se congela con `prefers-reduced-motion: reduce`. |

---

## 2. Ticket hero "tope de gama"

### 2.1 Qué toma de cada ref

| Ref | Qué se toma | Qué NO se toma |
|---|---|---|
| `ticket-clavius-space.jpg` | Layout: palabra vertical gigante en el borde izquierdo ("ENTRY" → "PRE-HACKATÓN"), círculo sólido a la derecha, barcode vertical, "ADMIT ONE" rotado, "NO. ______", relación stub/cuerpo. Textura fotográfica (regolito) → **Quebrada duotono**. | El lime. El círculo pasa a naranja sobre foto, o foto circular (luna/Quebrada) sobre navy. |
| `ticket-tokyo-equestrian.jpg` | Grilla del boarding pass: pares label/valor en mono (GATE 4 / LEVEL 2 / ROW 13 / NUMBER 10), fecha en bloque grande "01:8月", bloque de sesión + "UNAUTHORISED RESALE PROHIBITED", sello circular, barcode chico abajo a la derecha, stack vertical en mobile. | El holo arcoíris pastel. |
| `ticket-soul-holo.jpg` | Lenguaje de textura: superficie que reacciona a la luz, borde interior fino blanco (inset 10px), perforación con línea punteada, scallops en la perforación, numeración "33" como objeto coleccionable. | El arcoíris. Se traduce a **foil solar** navy→naranja→blanco. |
| `ref-labitconf-tickets.jpg` | Tres tickets apilados en 3D con rotación y profundidad, QR en el stub separado por perforación, esquinas chanfleadas, pregunta "Y VOS… ¿CÓMO QUERÉS VIVIR…?" (ya adoptada en el headline), iconos de beneficios en una tira. | Paleta naranja-sobre-matrix, tiers General/Business/Experience como oferta. Acá hay **un solo tier**: las 3 capas son el mismo ticket. |
| `guideline-solar-train-poster.jpg` | Paleta, tipografía display con cortes, shards naranja en esquinas, sol naranja, Quebrada + espacio (planetas), logo tren "M" naranja, línea de puntos tipo trayectoria. | Fechas SEP 20–25 2025 (arte viejo). Las fechas reales se cargan aparte. |

### 2.2 Anatomía (desktop, horizontal)

Dimensiones nominales **880 × 320 px** (ratio 2.75:1). Cuerpo 600px + stub 280px. Esquinas exteriores `--r-lg`, esquinas del stub con `--chamfer`.

```
 ┌──────────────────────────────────────────────────────────┐ ╭─╮ ┌──────────────────────────┐
 │ ▌ P R E - H A C K A T Ó N  (vertical, display 900)       │ │ │ │ ADMIT ONE        ● logo  │
 │ ▌                                                        │ │ │ │                          │
 │ ▌  jujuy.dev · Road to Solar Train Hackathon             │ ┆ ┆ │  N°  07 / 30             │
 │ ▌                              ┌───────────┐             │ ┆ ┆ │  ───────────────────     │
 │ ▌  CIERRE  ·  DD.MM.2026       │   SOL     │             │ ┆ ┆ │  VAGÓN  01   ANDÉN  JUJ  │
 │ ▌  ONLINE  ·  ARG             │  naranja  │             │ ┆ ┆ │  ASIENTO 07  GATE   PRE  │
 │ ▌                              └───────────┘             │ ┆ ┆ │  HACKER ID  JDV-2026-0007│
 │ ▌  ━━━━━━━━━━━━━━━━━━━━━━━━━  (línea trayectoria)        │ ┆ ┆ │  ▐▌▌▐▐▌▐▌▌▐▌▐  [QR]      │
 │ ▌  "IDEAS QUE VIAJAN MÁS LEJOS"       ◢ shard naranja    │ │ │ │  UNAUTHORISED RESALE ··  │
 └──────────────────────────────────────────────────────────┘ ╰─╯ └──────────────────────────┘
                    cuerpo (foil solar sobre Quebrada)        notch + perforación        stub (paper)
```

**Cuerpo (izquierda, 600px)**

| Zona | Especificación |
|---|---|
| Fondo | `--tex-quebrada` (foto duotono) + `--grad-foil` por encima + `--tex-grain`. En hover el foil se desplaza 40% en X (sheen). |
| Marco interior | Borde 1px `rgba(255,255,255,.55)` inset 10px (Soul), esquinas `--r-md`. |
| Palabra vertical | "PRE-HACKATÓN", Unbounded 900, 72px, blanco, rotada −90°, pegada al borde izquierdo (Clavius "ENTRY"). Opcional: una letra "cortada" con shard naranja como la "A" del poster. |
| Sol | Círculo sólido `--grad-sun`, 140px, a la derecha del cuerpo, 24px del notch. Alternativa B: foto circular de la Quebrada/luna recortada sobre navy (Clavius VIP). Elegir una por build, no mezclar. |
| Datos | Mono 11px tracking +0.08em, blanco 80%: `JUJUY.DEV · ROAD TO SOLAR TRAIN HACKATHON`, `CIERRE · DD.MM.2026`, `ONLINE · ARG`. |
| Línea de trayectoria | Línea de puntos naranja 2px (poster) que atraviesa el cuerpo y "entra" al stub por el notch. |
| Slogan | "IDEAS QUE VIAJAN MÁS LEJOS" mono 10px, "MÁS LEJOS" en naranja (poster). |
| Shard | Triángulo naranja `--r-0` en la esquina inferior derecha, 48px. |

**Perforación**

| Zona | Especificación |
|---|---|
| Notches | Dos semicírculos de 14px de radio (arriba y abajo) con el color del fondo de página, vía `mask` o `radial-gradient`. |
| Línea | Dashed 2px, dash 6 / gap 6, `rgba(255,255,255,.45)` sobre cuerpo, `--ink-200` sobre stub. |
| Scallops | Opcionales, 6 por lado, 6px de radio (Soul). Solo si el `clip-path` se mantiene nítido en mobile. |

**Stub (derecha, 280px)**

| Zona | Especificación |
|---|---|
| Fondo | `--paper` con grilla de 1px `--ink-200` (filas de 12px), chanfles de 12px en las dos esquinas exteriores. |
| Cabecera | "ADMIT ONE" mono 11px bold tracking +0.16em, `--ink-950`. Logo jujuy.dev monocromo en ink a la derecha, 24px. |
| Número | `N° 07/30` Unbounded 700, 56px, `--ink-950`. Antes de la asignación muestra `N° ··/30` con los puntos en naranja pulsando (ver estados). |
| Grilla de datos | Mono, 2 columnas × 3 filas: `VAGÓN 01` · `ANDÉN JUJ` / `ASIENTO 07` · `GATE PRE` / `HACKER ID JDV-2026-0007` (full width). Labels 9px `--ink-600`, valores 16px bold `--ink-950` (Tokyo). |
| Barcode | Code-128 estilizado, 120 × 28px, abajo a la izquierda. |
| QR | 56px, abajo a la derecha, con el logo tren "M" naranja en el centro. Apunta a la URL de la landing con `?t=<hackerId>`. |
| Legal | Mono 8px `--ink-600`: `UNAUTHORISED RESALE PROHIBITED · VÁLIDO SOLO CON RESIDENCIA EN JUJUY`. |
| Acento | Banda naranja de 6px en el borde exterior del stub (franja del tren del poster). |

**Stack 3D (LABITCONF)**

- Tres capas. La principal al frente, dos "fantasmas" detrás.
- Capa 2: `rotate(-6deg) translate(-28px, 22px)`, opacidad .55, blur 0.5px.
- Capa 3: `rotate(4deg) translate(26px, 40px)`, opacidad .3, blur 1px.
- Las capas traseras reusan el mismo markup; no son otro tier.
- Contenedor con `perspective: 1200px`. Tilt máx. ±8° según el puntero, `--dur-base --ease-out`. En touch, tilt leve con giroscopio si hay permiso; si no, animación de respiración de 6s muy sutil (±2°).

### 2.3 Anatomía (mobile, vertical)

Stack vertical como `ticket-tokyo-equestrian.jpg`: **340 × 620 px** nominales, cuerpo arriba (340 × 360), stub abajo (340 × 260). La perforación pasa a horizontal; los notches a izquierda/derecha. La palabra "PRE-HACKATÓN" deja de estar rotada y se lee horizontal, 40px, dos líneas. Sin capas fantasma (solo una sombra proyectada), sin tilt. Sheen sí, disparado por scroll al entrar en viewport.

### 2.4 Estados del ticket

| Estado | Cuándo | Qué cambia |
|---|---|---|
| **Placeholder** (default) | Inscripción no abrió o visitante anónimo. | `N° ··/30` con puntos naranja pulsando 1.6s. `HACKER ID  ——`. Chip "30 tickets en juego" arriba del ticket. |
| **Inscripción abierta** | Luma vivo. | Igual al placeholder, pero el QR es real (link Luma) y el chip dice "Inscripción abierta". |
| **Personalizado** | Visitante llega con `?t=<hackerId>` (post-entrega) o ganador anunciado. | Número real `N° 07/30`, nombre del equipo en mono bajo "ADMIT ONE", HACKER ID real. Sheen más intenso al cargar (una pasada de 1.2s). Botón "Descargar ticket" (PNG 1600×582). |
| **Emitido / Sold out** | Los 30 asignados y el visitante no es ganador. | Sello circular "EMITIDO · 30/30" en naranja rotado −12° sobre el stub (Tokyo). CTA cambia a "Mirá los proyectos". |
| **Hover / tilt** | Desktop, puntero sobre el ticket. | Tilt ±8°, foil se desplaza, sombra crece a `0 40px 80px`. |
| **Foco** | Teclado. | Anillo `--focus` 2px + offset 4px alrededor del ticket completo. El ticket es un `<a>`/botón al CTA. |
| **Reduced motion** | OS. | Sin tilt, sin sheen, sin pulso. Puntos del número estáticos en naranja. |
| **Skeleton** | Carga de datos personalizados. | Stub en `--ink-100` con bloques shimmer; cuerpo visible completo. |
| **OG / share** | Metatag y descarga. | Render estático 1200×630 del ticket horizontal sobre `--grad-sky`, sin capas fantasma, con el sheen "congelado" al 50%. |

### 2.5 Datos que muestra

`Pre-Hackatón` · `jujuy.dev` · `Ticket N° __/30` · `Cierre DD.MM.2026` · `Hacker ID` · `Online · ARG` · `VAGÓN / ANDÉN / ASIENTO / GATE` (decorativos pero consistentes: ANDÉN siempre `JUJ`, GATE siempre `PRE`, VAGÓN `01`, ASIENTO = N°).

---

## 3. Componentes

### 3.1 Logo y nav

- Logo de la comunidad **jujuy.dev** arriba a la izquierda, blanco, altura 28px. A su derecha, separado por una barra naranja de 1px, el lockup mono `PRE-HACKATÓN · ROAD TO SOLAR TRAIN`.
- Nav: `Cómo funciona` · `Criterios` · `Workshops` · `Entregar proyecto` · CTA chico.
- Fondo `rgba(6,15,34,.72)` + `backdrop-filter: blur(12px)`, borde inferior `--border`. Altura 64px. En scroll > 80px aparece una línea de "vía" naranja de 2px que avanza según progreso de scroll (la barra de progreso es la vía del tren).

### 3.2 CTA

| Variante | Visual | Estados |
|---|---|---|
| **Primario** | Fondo `--orange-500`, texto `--navy-900` Inter 600 16px, padding 16×28, `--r-sm`, chanfle de 8px en la esquina superior derecha (eco del shard). Icono flecha → a la derecha. | Hover: `--orange-400` + `--shadow-cta` + flecha se mueve 4px. Active: `--orange-600`. Focus: anillo `--focus`. |
| **Primario · pronto** (Luma TBD) | Mismo tamaño, fondo `--navy-800`, borde dashed 1px `--orange-500`, texto blanco 64%: "Inscripción abre pronto". Icono reloj. `aria-disabled`. Debajo, link mono "Avisame cuando abra →" (mailto o form de 1 campo). | No hover de color; cursor default. |
| **Secundario** | Borde 1px blanco 28%, texto blanco, fondo transparente. | Hover: borde blanco 60%, fondo blanco 6%. |
| **Terciario / link** | Mono 14px mayúsculas naranja con subrayado 1px offset 4px. | Hover: subrayado 2px. |
| **Cerrado** | Fondo `--navy-800`, texto 48%, icono candado: "Inscripción cerrada". Al lado, secundario "Ver proyectos". | — |

Texto blanco sobre naranja **no** (3.1:1). Siempre navy sobre naranja.

### 3.3 Boletería (contador 30)

- Pill grande sobre el ticket: `30 TICKETS · 30 JUJEÑOS` en mono, fondo navy-800, punto naranja pulsando a la izquierda.
- Debajo del ticket, tira de 30 cuadraditos de 10px (`--r-xs`), gap 4px, en fila (desktop) o 5×6 (mobile). Vacíos: borde `--border`. Asignados: relleno naranja. Antes del cierre, todos vacíos + leyenda "30 asientos libres".

### 3.4 Countdown / tablero de andén

Se diseña como un **tablero de salidas tipo split-flap** (Solari), mono, sobre `--ink-950` con filas de `--navy-800`. Tres modos:

| Modo | Fila del tablero | Notas |
|---|---|---|
| **Apagado** | `SALIDA  ·  PRE-HACKATÓN  ·  HORARIO POR CONFIRMAR  ·  ANDÉN JUJ` | Sin dígitos. Las fichas hacen un flip ocioso cada 8s (una sola letra cambia). |
| **Tentativo** | `CIERRE TENTATIVO  ·  DD  HH  MM  SS` + chip "fecha tentativa" naranja outline | Dígitos 40px mono 700. Debajo, texto small "Confirmamos la fecha final cuando abra la inscripción." |
| **En vivo** | `CIERRA EN  ·  DD  HH  MM  SS` | Flip real cada segundo (solo la unidad de segundos). Últimas 24h: fila con borde naranja. |

Estados: `00 00 00 00` → fila cambia a "SALIÓ · ENTREGAS CERRADAS". Reduced motion: números cambian sin flip.

### 3.5 Pasos (Inscribite → Construí → Subite al tren)

Tres cards unidas por una línea de vía punteada naranja (horizontal desktop, vertical mobile). Cada card: número mono grande `01` en naranja, título Unbounded 24px, texto 16px, icono lineal (ticket / llave inglesa / tren). La tercera card tiene un shard naranja en la esquina. La card activa según estado del flujo tiene borde `--border-strong`.

### 3.6 Criterios de scoring

- Encabezado con el **hard gate** como "control de acceso": card full-width `--navy-800` con borde izquierdo naranja 4px, icono de molinete: "Para subirte tenés que vivir o residir en Jujuy."
- Debajo, 5 cards en grilla (5 desktop / 2+2+1 tablet / 1 mobile). Cada una: título, bajada de una línea, barra `0 ——— 10` en mono con la marca "0–10".
- La card **Tracción** es más alta y lista las evidencias como chips mono: `USERS` · `REVENUE` · `WAITLIST` · `STARS`, más la nota "número + link o captura".
- Al pie, split visual 50/50: dos bloques iguales, "50% organización" y "50% jurados", separados por la perforación punteada. Texto: "Suben los 30 con mayor puntaje."

### 3.7 Cupos (30 + 30)

Dos tickets chicos (versión 320×120 del stub, solo paper + número) lado a lado:
- `30 · JUJEÑOS` — "Por scoring. Vivís o residís en Jujuy."
- `30 · INVITADOS ESPECIALES` — "Otras provincias. Equipos y empresas ya formadas."
Debajo, headline H2: "Vas a buildear con los mejores de Argentina."

### 3.8 Cards de workshops ("próximamente")

- Formato fila de tablero de andén: `DÍA · HORA · TEMA · SPEAKER · ESTADO`.
- Estado "próximamente": 4 filas placeholder con texto `———` en fichas grises, columna ESTADO con pill outline naranja `PRÓXIMAMENTE`. La primera fila dice en mono: "La agenda de la semana se lanza pronto."
- Estado "publicado": filas reales; hover eleva la fila a `--navy-700`; click abre detalle (modal o link Luma del workshop). Pill `ONLINE` en `--success` solo en la columna estado.
- Mobile: cada fila pasa a card de 2 líneas.

### 3.9 Jurado ("próximamente")

- Grilla de 4 cards (desktop) con **silueta** en vez de foto: círculo 96px con degradé navy-700→navy-800 y un signo `?` en mono naranja. Nombre: `———` en fichas. Rol: "Jurado · por confirmar".
- Banner encima: "Jurado próximamente. Estamos confirmando nombres." + link terciario "Querés ser jurado? Escribinos →".
- Al confirmar, las cards reciben foto duotono navy/naranja (mismo tratamiento que la Quebrada), nombre Unbounded 20px, rol mono, link social.
- La explicación 50/50 se repite acá en una línea.

### 3.10 Form de entrega (repo / demo / video)

Se presenta como **mostrador de despacho**: card ancha `--navy-800`, borde 1px, con un stub de "comprobante" a la derecha que se va completando en vivo.

Campos (en este orden):

| Campo | Tipo | Validación | Ayuda |
|---|---|---|---|
| Nombre del proyecto | text, requerido | 3–60 chars | — |
| Equipo / responsable | text, requerido | — | "Nombre y apellido de quien entrega." |
| Email de contacto | email, requerido | formato | "El mismo que usaste en Luma." |
| **Vivo o resido en Jujuy** | checkbox, requerido | debe estar marcado para habilitar Enviar | "Es condición para competir por los 30 tickets." |
| Localidad | text, requerido si el checkbox está marcado | — | — |
| URL del repo | url, requerido | https + host github.com / gitlab.com / codeberg.org | "Público, o con acceso para el jurado." |
| URL de la demo | url, requerido | https | "Deploy navegable. Si es app móvil, link a TestFlight/APK." |
| URL del video | url, requerido | youtube / vimeo / loom / drive | "Máx. 3 minutos. Mostrá el producto funcionando." |
| Tracción · tipo | select: users / revenue / waitlist / stars / otro | opcional | — |
| Tracción · número | number | opcional, ≥ 0 | — |
| Tracción · evidencia | url o archivo (png/jpg ≤ 5MB) | requerido si cargaste tipo | "Link o captura que respalde el número." |
| Descripción corta | textarea | ≤ 280 chars | "Qué problema resuelve y para quién." |

Estados del form:
- **Cerrado**: campos deshabilitados, banner "Las entregas abren el DD.MM" (o "cerraron").
- **Validando**: inline, al perder foco. Error en rojo con texto debajo del campo e icono. Éxito con tilde `--success` dentro del input.
- **Enviando**: botón con spinner mono `[ // ]`.
- **Éxito**: la card se voltea y queda el comprobante: stub paper con `PROYECTO A BORDO`, hacker ID generado `JDV-2026-####`, hora, y QR al estado de la entrega. Botón "Descargar comprobante".
- **Error de servidor**: toast naranja outline: "No pudimos despachar tu proyecto. Probá de nuevo en un minuto."

### 3.11 Sponsor sorpresa (cohete)

- Card full-width `--navy-950` con un cohete en línea blanca (ilustración lineal, 2px, estilo icono) despegando en diagonal, estela de puntos naranja (misma línea de trayectoria del poster). Pequeños planetas del poster de fondo al 20%.
- Título: "Sponsor sorpresa a bordo." Bajada: "Se revela en la Solar Train Hackathon."
- Chip mono: `CLASIFICADO · SE ABRE EN EL HACKATHON`.
- **No** aparece logo, nombre, iniciales, color ni pista del sponsor. El cohete es el único motif.
- Hover: el cohete sube 6px y la estela se extiende. Reduced motion: estático.

### 3.12 Marquee "movida tren"

Tira horizontal mono 14px, mayúsculas, separadores `◆` naranja, scroll infinito 40s: `PRÓXIMA SALIDA · PRE-HACKATÓN · 30 TICKETS · ONLINE · ANDÉN JUJUY · IDEAS QUE VIAJAN MÁS LEJOS · SPONSOR SORPRESA A BORDO ·`. Se pausa en hover y en reduced motion.

### 3.13 Chips y badges

- `--r-pill`, mono 11px tracking +0.08em, padding 4×10.
- Outline naranja: estados ("PRÓXIMAMENTE", "FECHA TENTATIVA"). Relleno naranja + texto navy: destacados ("30 TICKETS"). Outline blanco 28%: neutros.

### 3.14 Inputs

Fondo `--navy-950`, borde `--border`, texto blanco, placeholder 40%, `--r-sm`, altura 48px, label mono 11px arriba. Focus: borde naranja + anillo. Error: borde `--error`.

### 3.15 Footer

Fondo `--navy-950`, shard naranja grande cortando la esquina inferior izquierda (poster). Logo jujuy.dev, links (Luma, repo, redes), "Hecho en Jujuy, Argentina". Línea mono: `PRE-HACKATÓN 2026 · ROAD TO SOLAR TRAIN HACKATHON`.

---

## 4. Landing: secciones en orden de scroll

| # | Sección | Contenido | Fondo | Notas |
|---|---|---|---|---|
| 0 | **Nav** | Logo, links, CTA chico. | Blur navy. | Barra de progreso "vía". |
| 1 | **Hero** | Eyebrow mono `JUJUY.DEV PRESENTA · PRE-HACKATÓN ONLINE`. Headline "Y vos… ¿te ganás tu ticket?". Bajada. CTA primario (Luma) + secundario "Ver cómo funciona". Pill boletería. **Ticket hero** en stack 3D a la derecha (desktop) / debajo (mobile). | `--grad-sky` + planetas del poster al 15% + grano. Shards naranja en esquina superior izquierda e inferior derecha. | Al fondo, silueta de la Quebrada en navy-800 (sin tren: el tren es el usuario). |
| 2 | **Marquee** | Tira "movida tren". | `--navy-900`. | — |
| 3 | **Qué es** | Dos columnas: texto (Pre-Hackatón online, 30 tickets a la Solar Train Hackathon) + tarjeta con los 3 datos clave en mono: `FORMATO ONLINE` · `TICKETS 30` · `DESTINO SOLAR TRAIN HACKATHON`. | `--navy-900`. | — |
| 4 | **Cómo funciona** | Pasos Inscribite → Construí → Subite al tren (3.5). | `--navy-950`. | Línea de vía une las cards. |
| 5 | **Tablero / countdown** | Split-flap en modo apagado o tentativo (3.4). | `--ink-950` franja full-bleed. | Única sección oscura "pura". |
| 6 | **Criterios** | Hard gate + 5 cards + 50/50 (3.6). | `--navy-900`. | Ancla `#criterios`. |
| 7 | **Cupos** | 30 + 30 (3.7) + headline "Vas a buildear con los mejores de Argentina." | `--navy-950` con sol naranja grande recortado a la derecha (poster). | — |
| 8 | **Workshops** | Tablero "próximamente" (3.8). | `--navy-900`. | Ancla `#workshops`. |
| 9 | **Entregá tu proyecto** | Form + comprobante (3.10). | `--navy-950`. | Ancla `#entrega`. Visible siempre; deshabilitado hasta que abran entregas. |
| 10 | **Jurado** | Siluetas "próximamente" (3.9). | `--navy-900`. | — |
| 11 | **Sponsor sorpresa** | Cohete (3.11). | `--navy-950` + planetas. | — |
| 12 | **FAQ** | Acordeón de 6 preguntas. | `--navy-900`. | — |
| 13 | **CTA final** | Ticket hero en versión estática chica + "Sacá tu ticket" + CTA. | `--grad-sky` invertido. | Repite el CTA con el mismo estado que el hero. |
| 14 | **Footer** | (3.15). | `--navy-950`. | Shard. |

Ritmo: alternancia navy-900 / navy-950 cada sección, separadas por una línea de 1px `--border` que en algunos cruces se vuelve perforación punteada (eco del ticket). Padding vertical `--sp-24` desktop, `--sp-12` mobile.

### 4.1 Wireframe hero (desktop)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ◢                     jujuy.dev │ PRE-HACKATÓN · ROAD TO SOLAR TRAIN     [CTA] │
│                                                                                │
│   JUJUY.DEV PRESENTA · PRE-HACKATÓN ONLINE          ┌──────────────┐╭╮┌─────┐  │
│                                                   ┌─┤   TICKET     │││ STUB│  │
│   Y vos…                                        ┌─┤ │  (capa 1)    │┆│07/30│  │
│   ¿te ganás                                     │ │ │              │││ ▐▌▐ │  │
│   tu ticket?                                    │ │ └──────────────┘╰╯└─────┘  │
│                                                 │ └── capa 2                   │
│   30 tickets a la Solar Train Hackathon.        └──── capa 3                   │
│   Pre-Hackatón online de jujuy.dev.                                            │
│                                                     ● 30 TICKETS · 30 JUJEÑOS  │
│   [ Inscribite en Luma → ]  [ Ver cómo funciona ]   □□□□□□□□□□□□□□□□□□□□□□□□□  │
│                                                                              ◢ │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Wireframe hero (mobile)

```
┌──────────────────────┐
│ jujuy.dev      [☰]   │
│ PRE-HACKATÓN ONLINE  │
│                      │
│ Y vos…               │
│ ¿te ganás            │
│ tu ticket?           │
│                      │
│ 30 tickets a la…     │
│ [ Inscribite en Luma ]│
│ [ Ver cómo funciona ]│
│                      │
│  ┌────────────────┐  │
│  │  PRE-HACKATÓN  │  │
│  │  (cuerpo)   ●  │  │
│ ╭┤ ─ ─ ─ ─ ─ ─ ─ ├╮ │
│ ╰┤ ADMIT ONE      ├╯ │
│  │ N° ··/30       │  │
│  │ ▐▌▐▌▐    [QR]  │  │
│  └────────────────┘  │
│ ● 30 TICKETS         │
│ □□□□□ □□□□□ □□□□□ …  │
└──────────────────────┘
```

---

## 5. Copy de ejemplo (voseo)

### Hero
- Eyebrow: `JUJUY.DEV PRESENTA · PRE-HACKATÓN ONLINE`
- H1: **Y vos… ¿te ganás tu ticket?**
- Bajada: "30 tickets a la Solar Train Hackathon. Buildeá online, subí tu proyecto y subite al tren."
- CTA primario: "Inscribite en Luma →" / (TBD) "Inscripción abre pronto" / (cerrado) "Inscripción cerrada"
- CTA secundario: "Ver cómo funciona"
- Pill: `30 TICKETS · 30 JUJEÑOS`
- Micro: "Online · Jujuy, Argentina · Cierre: por confirmar"

### Marquee
`PRÓXIMA SALIDA ◆ PRE-HACKATÓN ◆ 30 TICKETS ◆ ONLINE ◆ ANDÉN JUJUY ◆ IDEAS QUE VIAJAN MÁS LEJOS ◆ SPONSOR SORPRESA A BORDO ◆`

### Qué es
- H2: "Un pre-hackatón para ganarte el asiento."
- Texto: "La Solar Train Hackathon tiene cupos contados. El Pre-Hackatón es tu manera de entrar: armás un proyecto, lo entregás acá y los 30 mejores se suben. Es online, así que buildeás desde donde estés en Jujuy."

### Cómo funciona
- H2: "Tres paradas."
- 01 **Inscribite** — "Anotate en Luma. Te llega el kit del Pre-Hackatón y la agenda de workshops."
- 02 **Construí** — "Tenés la semana para buildear. Solo o en equipo. Lo que importa es que funcione y que alguien lo use."
- 03 **Subite al tren** — "Entregá repo, demo y video. Si quedás en el top 30, tu ticket a la Solar Train Hackathon tiene tu nombre."

### Tablero
- Apagado: `SALIDA · PRE-HACKATÓN · HORARIO POR CONFIRMAR · ANDÉN JUJ`
- Tentativo: `CIERRE TENTATIVO` + "Confirmamos la fecha final cuando abra la inscripción."
- En vivo: `CIERRA EN`
- Cero: `SALIÓ · ENTREGAS CERRADAS`

### Criterios
- H2: "Cómo se gana el ticket."
- Hard gate: "**Para subirte tenés que vivir o residir en Jujuy.** Es condición excluyente para los 30 tickets del Pre."
- Utilidad — "¿Resuelve un problema real? ¿Para quién?"
- Experiencia de usuario — "¿Se entiende solo? ¿Da ganas de volver a usarlo?"
- Modelo de negocio — "¿Cómo se sostiene? ¿Quién paga y por qué?"
- Tecnología interesante — "¿Qué tiene de nuevo por adentro? Contanos la decisión técnica que te enorgullece."
- Tracción — "Mostranos evidencia: usuarios, revenue, waitlist o stars. Número + link o captura."
- 50/50: "La mitad del puntaje lo pone la organización, la otra mitad el jurado. Suben los 30 con mayor puntaje."
- Nota: "Cada criterio va de 0 a 10."

### Cupos
- H2: "Vas a buildear con los mejores de Argentina."
- Ticket A: `30 · JUJEÑOS` — "Por scoring en el Pre-Hackatón. Vivís o residís en Jujuy."
- Ticket B: `30 · INVITADOS ESPECIALES` — "De otras provincias. Equipos y empresas ya formadas, invitados por la organización. Se gestionan aparte."
- Texto: "En la Hackatón Tren Solar compartís vagón con 30 invitados especiales de otras provincias: vos y 29 jujeños más, codo a codo con ellos, construyendo mientras la Quebrada pasa por la ventana."

### Workshops
- H2: "Workshops de la semana."
- Próximamente: "La agenda se lanza pronto. Vas a tener workshops durante la semana del Pre para destrabar producto, tech y pitch."
- Pill: `PRÓXIMAMENTE`
- Link: "Avisame cuando salga la agenda →"

### Entrega
- H2: "Entregá tu proyecto."
- Texto: "Tres links y listo. Repo, demo y video de hasta 3 minutos. Si tenés tracción, mostrala: suma."
- Botón: "Despachar proyecto →"
- Checkbox: "Vivo o resido en Jujuy"
- Ayuda repo: "Público, o con acceso para el jurado."
- Ayuda demo: "Deploy navegable. Si es app móvil, link a TestFlight o APK."
- Ayuda video: "Máximo 3 minutos. Mostrá el producto funcionando, no slides."
- Éxito: "**Proyecto a bordo.** Te mandamos el comprobante a tu email. Hacker ID: JDV-2026-0042."
- Error: "No pudimos despachar tu proyecto. Probá de nuevo en un minuto."
- Cerrado: "Las entregas abren cuando arranque la semana del Pre."

### Jurado
- H2: "Jurado."
- Texto: "Próximamente. Estamos confirmando nombres. El jurado pone el 50% del puntaje."
- Link: "¿Querés ser jurado? Escribinos →"

### Sponsor sorpresa
- H2: "Sponsor sorpresa a bordo."
- Texto: "La Solar Train Hackathon tiene un sponsor que todavía no podemos nombrar. Se revela en el hackathon. Por ahora, solo te decimos que apunta alto."
- Chip: `CLASIFICADO · SE ABRE EN EL HACKATHON`

### FAQ
- "¿Tengo que vivir en Jujuy?" — "Sí, para competir por los 30 tickets del Pre. Si sos de otra provincia, los cupos de invitados especiales se gestionan aparte."
- "¿Puedo participar en equipo?" — "Sí. Entregás un proyecto por equipo y el ticket es por persona del equipo ganador, hasta donde alcancen los 30."
- "¿Qué cuenta como tracción?" — "Usuarios reales, revenue, una waitlist con gente anotada o stars en el repo. Siempre con número y evidencia."
- "¿El Pre es presencial?" — "No, es 100% online. El tren es después."
- "¿Qué pasa si no tengo demo deployada?" — "Necesitás algo navegable. Un video solo no alcanza."
- "¿Cuándo cierra?" — "Fecha por confirmar. Anotate en Luma y te avisamos."

### CTA final
- H2: "Sacá tu ticket."
- Texto: "30 asientos. Uno puede ser tuyo."
- CTA: "Inscribite en Luma →"

### Footer
- "Hecho en Jujuy, Argentina · jujuy.dev"
- Mono: `PRE-HACKATÓN 2026 · ROAD TO SOLAR TRAIN HACKATHON · IDEAS QUE VIAJAN MÁS LEJOS`

---

## 6. Referencias: qué sale de cada imagen

### `docs/refs/guideline-solar-train-poster.jpg` — brand bible
- **Paleta completa** de la sección 1.1: cielo navy (`--navy-950/900/700`), sol naranja (`--orange-400/500`), tipografía blanca, shards naranja.
- **Tipografía display** geométrica, ancha, con cortes en diagonal ("HACKATHON" con la "A" cortada) → Unbounded 900 + shard en una letra del ticket.
- **Shards** naranja en esquinas superior izquierda e inferior derecha → hero y footer.
- **Sol naranja** gigante detrás de la Quebrada → círculo sólido del ticket y fondo de la sección Cupos.
- **Planetas** y línea de puntos de trayectoria → fondo del hero al 15%, línea que cruza el ticket, estela del cohete.
- **Quebrada** → textura duotono del cuerpo del ticket y silueta del hero.
- **Logo tren "M" naranja** → centro del QR.
- **Slogan** "Ideas que viajan más lejos" → micro-copy del ticket, marquee, footer.
- **Franja naranja del tren** → banda de 6px en el borde del stub.
- **Barra inferior** con tres datos (fecha / lugar / energía) → tarjeta de 3 datos de la sección "Qué es".
- **No se toma:** las fechas SEP 20–25 2025.

### `docs/refs/ticket-clavius-space.jpg`
- Palabra vertical gigante en el borde izquierdo ("ENTRY") → "PRE-HACKATÓN" rotado.
- Círculo sólido a la derecha + foto de textura de fondo → sol naranja + Quebrada duotono.
- Barcode vertical, "ADMIT ONE" rotado, "NO. 490878" → barcode y N° del stub.
- Variante VIP con foto circular sobre fondo plano → alternativa B del sol.
- Notch único en la unión → notches de la perforación.
- **No se toma:** lime en ningún rol.

### `docs/refs/ticket-tokyo-equestrian.jpg`
- Stack vertical cuerpo/stub → layout mobile del ticket.
- Grilla label/valor en mono (GATE / LEVEL / ROW / NUMBER) → VAGÓN / ANDÉN / ASIENTO / GATE.
- Bloque de fecha grande "01 : 8月" → bloque "N° 07/30".
- Sello circular + barcode chico + "UNAUTHORISED RESALE PROHIBITED" → sello "EMITIDO", barcode y legal del stub.
- Agujeros de colgar arriba → no se usan (el ticket es digital).
- **No se toma:** holo pastel arcoíris.

### `docs/refs/ticket-soul-holo.jpg`
- Lenguaje de textura reactiva a la luz → `--grad-foil` ("foil solar") + grano.
- Borde interior fino blanco → marco inset 10px del cuerpo.
- Perforación punteada + scallops → línea dashed y scallops opcionales.
- Número "33" como pieza coleccionable → el N°/30 como protagonista del stub.
- **No se toma:** el arcoíris; se reemplaza por navy → naranja → blanco.

### `docs/refs/ref-labitconf-tickets.jpg`
- Tres tickets apilados en 3D con rotación y profundidad → stack de 3 capas del hero.
- Stub separado con QR y perforación visible → stub con QR + perforación.
- Esquinas chanfleadas → `--chamfer` 12px en el stub.
- Headline "Y VOS… ¿CÓMO QUERÉS VIVIR…?" → confirma el headline "Y vos… ¿te ganás tu ticket?".
- Tira de iconos de beneficios → no se usa en el Pre (no hay tiers).
- **No se toma:** paleta naranja-sobre-matrix, tiers General/Business/Experience, lluvia de caracteres de fondo.

---

## 7. Accesibilidad y responsive

- Contraste mínimo AA en todo; AAA en texto del stub. CTA siempre navy sobre naranja.
- Todo lo animado respeta `prefers-reduced-motion`. El marquee se pausa en hover y foco.
- El ticket hero tiene `alt`/`aria-label` descriptivo: "Ticket Pre-Hackatón jujuy.dev, número por asignar de 30".
- Orden de tabulación: nav → CTA hero → ticket → secciones. Focus visible siempre (anillo naranja).
- Breakpoints: 360 (mobile), 768 (tablet), 1024 (desktop), 1440 (wide). El ticket cambia de vertical a horizontal en 1024.
- Tipografía mínima 14px en texto; 10px solo en mono decorativo del stub con `aria-hidden`.
- Imágenes del hero con `loading="eager"` + `fetchpriority="high"`; el resto lazy.
- Sin texto dentro de imágenes salvo el render OG.

---

## 8. Pendientes de datos (no de diseño)

| Dato | Estado | Dónde impacta |
|---|---|---|
| Link Luma | TBD | CTA (estado "pronto" hasta tenerlo), QR del ticket. |
| Fecha de cierre | TBD | Tablero (apagado → tentativo → vivo), campo CIERRE del ticket. |
| Agenda de workshops | TBD | Sección 8, filas del tablero. |
| Nombres del jurado | TBD | Sección 10, cards con silueta. |
| Backend de entrega | TBD | Form 3.10 (el diseño no cambia). |
| Foto de la Quebrada con derechos | TBD | Textura del ticket. Fallback: degradé navy→naranja con grano. |
