/** Dirección de un tramo: +1 ida (hacia la última estación), −1 vuelta. */
export type LegDir = 1 | -1;

/**
 * Estación ya alcanzada viajando en `dir`.
 * Ida: la más avanzada cuyo centro quedó atrás. Vuelta: la más cercana al origen
 * a la que ya llegamos, y nos quedamos en la anterior hasta tocarla.
 * Devuelve −1 si no hay estaciones.
 */
export function stationReached(stops: readonly number[], l: number, dir: LegDir): number {
  const slack = 2;
  if (stops.length === 0) return -1;
  if (dir > 0) {
    let best = -1;
    for (let i = 0; i < stops.length; i++) if (l >= stops[i]! - slack) best = i;
    return best;
  }
  let best = -1;
  for (let i = stops.length - 1; i >= 0; i--) {
    if (l <= stops[i]! + slack) best = i;
    else break;
  }
  return best;
}
