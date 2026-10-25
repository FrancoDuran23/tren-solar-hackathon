import { config } from '../config';

export type BoardMode = 'off' | 'tentative' | 'live' | 'zero';

/** spec C1: sin fecha ⇒ apagado; tentative ⇒ tentativo; confirmada ⇒ en vivo; vencida ⇒ cero. */
export function boardMode(now: number = Date.now()): BoardMode {
  const d = config.deadline;
  if (!d) return 'off';
  const t = Date.parse(d.iso);
  if (Number.isNaN(t)) return 'off';
  if (t - now <= 0) return 'zero';
  return d.tentative ? 'tentative' : 'live';
}

export function parts(ms: number): [number, number, number, number] {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
}
