/**
 * Ventana de edición de la entrega (T24).
 * Se puede crear y volver a enviar mientras `now` no pase `dates.buildEndIso`.
 */
import { dates } from '../content/dates.ts';

export function entregaDeadlineMs(): number {
  return Date.parse(dates.buildEndIso);
}

/** Inclusive: a las 23:59 del 13 de noviembre de 2026 (ART) todavía se puede actualizar. */
export function entregaEditsOpen(now: number = Date.now()): boolean {
  const end = entregaDeadlineMs();
  return Number.isFinite(end) && now <= end;
}
