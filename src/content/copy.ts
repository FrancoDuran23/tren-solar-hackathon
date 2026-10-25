/**
 * Copy del shell (voseo), desde docs/design.md §5. Los componentes no hardcodean texto.
 * Copy de secciones (hero, criterios, etc.) se agrega acá en sus tickets.
 */

export const copy = {
  meta: {
    title: 'Road to Hackatón Tren Solar · jujuy.dev',
    description:
      '35 tickets a la Hackatón Tren Solar. Buildeá online, subí tu proyecto y subite al tren.',
    ogAlt: 'Ticket Hackatón Tren Solar · jujuy.dev, 35 tickets en juego',
    locale: 'es_AR',
    siteName: 'jujuy.dev',
  },
  a11y: {
    skipToContent: 'Saltar al contenido',
    menuOpen: 'Abrir menú',
    menuClose: 'Cerrar menú',
    mainNav: 'Principal',
    progress: 'Progreso de lectura',
  },
  nav: {
    logoAlt: 'jujuy.dev',
    lockup: 'ROAD TO HACKATÓN TREN SOLAR',
    links: [
      { href: '#como', label: 'Cómo funciona' },
      { href: '#criterios', label: 'Criterios' },
      { href: '#workshops', label: 'Workshops' },
      { href: '#entrega', label: 'Entregar proyecto' },
    ],
  },
  cta: {
    open: 'Inscribite en Luma',
    soon: 'Inscripción abre pronto',
    closed: 'Inscripción cerrada',
    /** Versión corta para la nav */
    short: { open: 'Inscribite', soon: 'Abre pronto', closed: 'Cerrada' },
  },
  footer: {
    madeIn: 'Hecho en Jujuy, Argentina',
    site: 'jujuy.dev',
    mono: 'ROAD TO HACKATÓN TREN SOLAR · 2026 · IDEAS QUE VIAJAN MÁS LEJOS',
    linksLabel: 'Enlaces',
    links: {
      luma: 'Luma',
      repo: 'Repo',
      social: 'Redes',
    },
  },
  what: {
    id: 'que-es',
    h2: 'Una semana online para ganarte el asiento.',
    text: 'La Hackatón Tren Solar tiene cupos contados. Esta etapa online es tu manera de entrar: armás un proyecto, lo entregás acá y los 35 mejores se suben. Buildeás desde donde estés en Jujuy.',
    factsLabel: 'Datos clave',
    facts: [
      { k: 'FORMATO', v: 'ONLINE' },
      { k: 'TICKETS', v: '35' },
      { k: 'DESTINO', v: 'HACKATÓN TREN SOLAR' },
    ],
  },
  steps: {
    h2: 'Tres paradas.',
    note: 'Inscribirte en Luma y entregar tu proyecto son dos pasos distintos: primero te anotás, después subís repo, demo y video acá.',
    items: [
      {
        n: '01',
        title: 'Inscribite',
        text: 'Anotate en Luma. Te llega el kit de la semana y la agenda de workshops.',
        icon: '🎫',
      },
      {
        n: '02',
        title: 'Construí',
        text: 'Tenés la semana para buildear. Solo o en equipo. Lo que importa es que funcione y que alguien lo use.',
        icon: '🔧',
      },
      {
        n: '03',
        title: 'Subite al tren',
        text: 'Entregá repo, demo y video. Si quedás en el top 35, tu ticket a la Hackatón Tren Solar tiene tu nombre.',
        icon: '🚆',
      },
    ],
  },
  board: {
    label: 'Tablero de salidas',
    off: ['SALIDA', 'HACKATÓN TREN SOLAR', 'HORARIO POR CONFIRMAR', 'ANDÉN JUJ'],
    tentative: 'CIERRE TENTATIVO',
    tentativeChip: 'fecha tentativa',
    tentativeNote: 'Confirmamos la fecha final cuando abra la inscripción.',
    live: 'CIERRA EN',
    zero: 'SALIÓ · ENTREGAS CERRADAS',
    units: ['DD', 'HH', 'MM', 'SS'],
    unitsLong: ['días', 'horas', 'minutos', 'segundos'],
    announce: {
      off: 'Horario de cierre por confirmar.',
      tentative: 'Cierre tentativo. Fecha por confirmar.',
      live: 'Cuenta regresiva en curso.',
      zero: 'Salió. Entregas cerradas.',
    },
  },
  criteria: {
    id: 'criterios',
    h2: 'Cómo se gana el ticket.',
    gateLabel: 'CONTROL DE ACCESO',
    gate: 'Para subirte tenés que vivir o residir en Jujuy.',
    gateNote: 'Es condición excluyente para los 35 tickets.',
    scale: '0–10',
    scaleNote: 'Cada uno de estos cuatro criterios va de 0 a 10.',
    items: [
      { title: 'Utilidad', text: '¿Resuelve un problema real? ¿Para quién?' },
      { title: 'Experiencia de usuario', text: '¿Se entiende solo? ¿Da ganas de volver a usarlo?' },
      { title: 'Modelo de negocio', text: '¿Cómo se sostiene? ¿Quién paga y por qué?' },
      {
        title: 'Tecnología interesante',
        text: '¿Qué tiene de nuevo por adentro? Contanos la decisión técnica que te enorgullece.',
      },
    ],
    traction: {
      tag: 'PESA MÁS EN EL ANÁLISIS',
      title: 'Tracción',
      text: 'No es un criterio más con su barra de 0 a 10: es la evidencia que más mueve el análisis. Un proyecto con gente usándolo le gana a uno perfecto en el papel.',
      chips: ['USERS', 'REVENUE', 'WAITLIST', 'STARS'],
      note: 'Siempre con número y link o captura que lo respalde.',
    },
    verdict:
      'Organización y jurado evalúan juntos cada proyecto, con los mismos criterios y la misma planilla. Suben los 35 con mayor puntaje.',
  },
  slots: {
    h2: 'Vas a buildear con los mejores de Argentina.',
    text: 'En la Hackatón Tren Solar compartís vagón con 35 equipos invitados de todo el país: vos y 34 jujeños más, codo a codo con ellos, construyendo mientras la Quebrada pasa por la ventana.',
    a: {
      n: '35',
      label: 'JUJEÑOS',
      text: 'Por scoring en la etapa online. Vivís o residís en Jujuy.',
    },
    b: {
      n: '35',
      label: 'INVITADOS ESPECIALES',
      text: 'De otras provincias. Equipos y empresas ya formadas, invitados por la organización.',
    },
  },
} as const;

export type Copy = typeof copy;
