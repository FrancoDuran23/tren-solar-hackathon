/** Copy de workshops, jurado, sponsor, FAQ y CTA final (design.md §5). */

export interface FaqItem {
  q: string;
  a: string;
}

export const sections = {
  workshops: {
    title: 'Workshops de la semana.',
    columns: ['DÍA', 'HORA', 'TEMA', 'SPEAKER', 'ESTADO'],
    soonNote: 'La agenda de la semana se lanza pronto.',
    soonText:
      'La agenda se lanza pronto. Vas a tener workshops durante la semana del Pre para destrabar producto, tech y pitch.',
    soonPill: 'PRÓXIMAMENTE',
    livePill: 'ONLINE',
    notify: 'Avisame cuando salga la agenda →',
    placeholderRows: 3,
  },
  jury: {
    title: 'Jurado.',
    soonText:
      'Próximamente. Estamos confirmando nombres. El jurado pone el 50% del puntaje.',
    liveText: 'El jurado pone el 50% del puntaje.',
    apply: '¿Querés ser jurado? Escribinos →',
    placeholderCards: 4,
    placeholderName: '',
    placeholderRole: 'Jurado · por confirmar',
  },
  sponsor: {
    title: 'Sponsor sorpresa a bordo.',
    text:
      'La Solar Train Hackathon tiene un sponsor que todavía no podemos nombrar. Se revela en el hackathon. Por ahora, solo te decimos que apunta alto.',
    chip: 'CLASIFICADO · SE ABRE EN EL HACKATHON',
  },
  faq: {
    title: 'Preguntas frecuentes.',
    items: [
      {
        q: '¿Tengo que vivir en Jujuy?',
        a: 'Sí, para competir por los 35 tickets del Pre. Si sos de otra provincia, los cupos de invitados especiales se gestionan aparte.',
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
        q: '¿El Pre es presencial?',
        a: 'No, es 100% online. El tren es después.',
      },
      {
        q: '¿Qué pasa si no tengo demo deployada?',
        a: 'Necesitás algo navegable. Un video solo no alcanza.',
      },
      {
        q: '¿Cuándo cierra?',
        a: 'Fecha por confirmar. Anotate en Luma y te avisamos.',
      },
    ] satisfies FaqItem[],
  },
  finalCta: {
    title: 'Sacá tu ticket.',
    text: '35 asientos. Uno puede ser tuyo.',
  },
} as const;
