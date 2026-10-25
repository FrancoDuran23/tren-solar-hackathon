/**
 * Copy del shell (voseo), desde docs/design.md §5. Los componentes no hardcodean texto.
 * Copy de secciones (hero, criterios, etc.) se agrega acá en sus tickets.
 */

export const copy = {
  meta: {
    title: 'Pre-Hackatón · jujuy.dev',
    description:
      '35 tickets a la Solar Train Hackathon. Buildeá online, subí tu proyecto y subite al tren.',
    ogAlt: 'Ticket Pre-Hackatón jujuy.dev, 35 tickets a la Solar Train Hackathon',
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
    lockup: 'PRE-HACKATÓN · ROAD TO SOLAR TRAIN',
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
    mono: 'PRE-HACKATÓN 2026 · ROAD TO SOLAR TRAIN HACKATHON · IDEAS QUE VIAJAN MÁS LEJOS',
    linksLabel: 'Enlaces',
    links: {
      luma: 'Luma',
      repo: 'Repo',
      social: 'Redes',
    },
  },
} as const;

export type Copy = typeof copy;
