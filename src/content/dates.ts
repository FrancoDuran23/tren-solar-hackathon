/**
 * Fechas confirmadas (T21). Una sola fuente: el resto de la UI no dice "por confirmar".
 * Zona: America/Argentina/Jujuy (UTC−3).
 */
export const dates = {
  /** Cierra la ventana de build / entrega. */
  buildEndIso: '2026-11-13T23:59:00-03:00',
  build: '1 al 13 de noviembre 2026',
  buildMono: '1–13 NOV 2026',
  winners: '16 de noviembre 2026',
  winnersMono: '16 NOV 2026',
  /** Los workshops caen dentro de la ventana de build, no en una fecha aparte. */
  workshops: 'durante esas semanas',
} as const;
