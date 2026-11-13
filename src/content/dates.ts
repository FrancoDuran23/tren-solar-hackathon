/**
 * Fechas confirmadas (T21). Una sola fuente: el resto de la UI no dice "por confirmar".
 * Zona: America/Argentina/Jujuy (UTC−3).
 */
export const dates = {
  /**
   * Fin de la ventana de build / entrega, inclusive.
   * 15 de noviembre de 2026, 23:59, America/Argentina (ART, UTC−3).
   */
  buildEndIso: '2026-11-15T23:59:00-03:00',
  buildEndLabel: '15 de noviembre de 2026 a las 23:59 (hora de Argentina)',
  build: '1 al 15 de noviembre 2026',
  buildMono: '1–15 NOV 2026',
  winners: '16 de noviembre 2026',
  winnersMono: '16 NOV 2026',
  /** Los workshops caen dentro de la ventana de build, no en una fecha aparte. */
  workshops: 'durante esas semanas',
} as const;
