/**
 * Fuente única de estado (spec §4.5). Abrir una sección = editar este archivo,
 * no los componentes. `lumaUrl: null` ⇒ el CTA de inscripción pasa a la fecha de build.
 */

import { dates } from './content/dates';

export type RegistrationState = 'soon' | 'open' | 'closed';
export type SubmissionsState = 'closed' | 'open';

export interface Deadline {
  /** ISO 8601 con offset, ej. "2026-11-30T23:59:00-03:00" */
  iso: string;
  /** true ⇒ tablero en modo "tentativo" */
  tentative: boolean;
}

export interface Workshop {
  day: string;
  time: string;
  topic: string;
  speaker: string;
  /** Link del workshop (Luma u otro), opcional */
  url?: string;
}

export interface Juror {
  name: string;
  role: string;
  /** Ruta bajo /public, opcional (sin foto ⇒ silueta) */
  photo?: string;
  social?: string;
}

export interface SiteConfig {
  lumaUrl: string | null;
  registration: RegistrationState;
  deadline: Deadline | null;
  submissions: SubmissionsState;
  workshops: Workshop[];
  jury: Juror[];
  /** 0–30 */
  ticketsAssigned: number;
}

export const TICKETS_TOTAL = 30;

export const config: SiteConfig = {
  lumaUrl: null,
  registration: 'soon',
  deadline: { iso: dates.buildEndIso, tentative: false },
  submissions: 'closed',
  workshops: [],
  jury: [],
  ticketsAssigned: 0,
};
