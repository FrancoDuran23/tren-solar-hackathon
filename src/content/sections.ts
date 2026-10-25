/** Copy de workshops, jurado, sponsor, FAQ y CTA final (design.md §5). */

import { dates } from './dates';

export interface FaqItem {
  q: string;
  a: string;
}

export const sections = {
  workshops: {
    title: 'Workshops de la semana.',
    columns: ['DÍA', 'HORA', 'TEMA', 'SPEAKER', 'ESTADO'],
    soonNote: `Workshops ${dates.workshops}, del ${dates.build}.`,
    soonText:
      `Hay workshops ${dates.workshops} del build, del ${dates.build}, para destrabar producto, tech y pitch. La grilla de día y speaker se publica en esa ventana.`,
    soonPill: 'PRÓXIMAMENTE',
    livePill: 'ONLINE',
    notify: 'Avisame cuando salga la agenda →',
    placeholderRows: 3,
  },
  jury: {
    title: 'Jurado.',
    soonText:
      'Próximamente. Estamos confirmando nombres. El jurado evalúa junto con la organización, con los mismos criterios.',
    liveText: 'Evalúan junto con la organización, con los mismos criterios.',
    apply: '¿Querés ser jurado? Escribinos →',
    placeholderCards: 4,
    placeholderName: '',
    placeholderRole: 'Jurado · por confirmar',
  },
  sponsor: {
    title: 'Sponsor sorpresa a bordo.',
    text:
      'La Hackatón Tren Solar tiene un sponsor que todavía no podemos nombrar. Se revela en el hackathon. Por ahora, solo te decimos que apunta alto.',
    chip: 'CLASIFICADO · SE ABRE EN EL HACKATHON',
  },
  faq: {
    title: 'Preguntas frecuentes.',
    items: [
      {
        q: '¿Tengo que vivir en Jujuy?',
        a: 'Sí, para competir por los 35 tickets. Si sos de otra provincia, los cupos de invitados especiales se gestionan aparte.',
      },
      {
        q: '¿Puedo participar en equipo?',
        a: 'Sí. Entregás un proyecto por equipo y el ticket es por persona del equipo ganador, hasta donde alcancen los 35.',
      },
      {
        q: '¿Qué cuenta como tracción?',
        a: 'Usuarios reales, revenue, una waitlist con gente anotada o stars en el repo. Siempre con número y evidencia.',
      },
      {
        q: '¿Hay que viajar para participar?',
        a: 'No, esta etapa es 100% online. El tren es después.',
      },
      {
        q: '¿Qué pasa si no tengo demo deployada?',
        a: 'Necesitás algo navegable. Un video solo no alcanza.',
      },
      {
        q: '¿Cuándo cierra?',
        a: `La entrega es del ${dates.build}. Los workshops corren ${dates.workshops}. Los ganadores se anuncian el ${dates.winners}.`,
      },
      {
        q: '¿Puedo ver el ranking?',
        a: 'No hay lista pública. Si entrás con Google y tu perfil está al 100%, ves solo tu estado: si estás en el top 35 o todavía no. La organización lo actualiza los fines de semana.',
      },
    ] satisfies FaqItem[],
  },
  finalCta: {
    title: 'Sacá tu ticket.',
    text: '35 asientos. Uno puede ser tuyo.',
  },
} as const;
