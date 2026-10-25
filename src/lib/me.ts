import type { ProfileInput } from './profile';

export interface MeUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface MeProfile extends ProfileInput {
  completeness: number;
}

export interface MeRanking {
  /** Solo el estado de esta persona. Nunca un puesto ni una lista. */
  inTop: boolean;
  updatedAt: string | null;
  weekLabel: string | null;
}

export interface MeResponse {
  configured: boolean;
  user: MeUser | null;
  profile: MeProfile | null;
  ranking: MeRanking | null;
  error: string | null;
}

export const SIGNED_OUT: MeResponse = {
  configured: false,
  user: null,
  profile: null,
  ranking: null,
  error: null,
};
