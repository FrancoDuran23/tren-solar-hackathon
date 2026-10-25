import { timingSafeEqual } from 'node:crypto';

/** Compara secretos sin filtrar el largo por un return temprano obvio. */
export function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}
