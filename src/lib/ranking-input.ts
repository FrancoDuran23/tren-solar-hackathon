/** Body de POST /api/admin/ranking. Reemplazo total del top, no un delta. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const RANKING_EMAIL_CAP = 35;

export interface RankingUpdate {
  emails: string[];
  weekLabel: string | null;
}

export function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (email.length < 3 || email.length > 120 || !EMAIL_RE.test(email)) return null;
  return email;
}

export function parseRankingBody(raw: unknown): { ok: true; value: RankingUpdate } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'JSON inválido.' };
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.emails)) return { ok: false, error: 'emails tiene que ser una lista.' };
  if (o.emails.length > RANKING_EMAIL_CAP) {
    return { ok: false, error: `La lista admite hasta ${RANKING_EMAIL_CAP} emails.` };
  }
  const emails: string[] = [];
  const seen = new Set<string>();
  for (const item of o.emails) {
    if (typeof item !== 'string') return { ok: false, error: 'Cada email tiene que ser texto.' };
    const email = normalizeEmail(item);
    if (!email) return { ok: false, error: 'Hay un email inválido en la lista.' };
    if (!seen.has(email)) {
      seen.add(email);
      emails.push(email);
    }
  }
  let weekLabel: string | null = null;
  if (o.weekLabel !== undefined && o.weekLabel !== null) {
    if (typeof o.weekLabel !== 'string') return { ok: false, error: 'weekLabel tiene que ser texto.' };
    const label = o.weekLabel.trim();
    if (label.length > 80) return { ok: false, error: 'weekLabel admite hasta 80 caracteres.' };
    weekLabel = label === '' ? null : label;
  }
  return { ok: true, value: { emails, weekLabel } };
}
