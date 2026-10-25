import { config, type RegistrationState } from '../config';

export interface CtaState {
  state: RegistrationState;
  /** Solo presente si el CTA es un link activo */
  href: string | null;
}

/** spec §4.5: sin lumaUrl la inscripción no se muestra abierta; el CTA pasa a la fecha de build. */
export function resolveCta(): CtaState {
  const { registration, lumaUrl } = config;
  if (registration === 'open' && lumaUrl) return { state: 'open', href: lumaUrl };
  if (registration === 'closed') return { state: 'closed', href: null };
  return { state: 'soon', href: '#tablero' };
}
