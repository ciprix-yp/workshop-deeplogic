/**
 * Client Supabase cu service role key.
 *
 * Toată logica atomică (praguri de capacitate, cursa din waitlist, tranziții
 * de stare) trăiește în funcțiile Postgres din migrație — vezi
 * supabase/migrations/0001_init.sql pentru motivul: `supabase-js` nu are
 * tranzacții, deci orice logică „citește apoi scrie" scrisă aici, în loc de
 * o funcție RPC, ar avea aceeași fereastră de cursă pe care am eliminat-o cu
 * `pg_advisory_xact_lock`.
 *
 * Acest modul e un înveliș subțire peste `.rpc()` — tipat, ca un apel greșit
 * de parametru să pice la compilare, nu la prima cerere reală din producție.
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from 'astro:env/server';
import type { Q1Unealta, Q2Blocaj, Q3Domeniu, Q4Pregatire, Q5Anvergura } from '../content/form-schema';

export function supabaseAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

export const EVENT_SLUG = 'workshop-2026-09-16' as const;

/* ── register_participant ────────────────────────────────────────────────── */

export interface QualificationAnswers {
  q1_unealta: Q1Unealta;
  q2_blocaj: Q2Blocaj;
  q3_domeniu: Q3Domeniu;
  q4_pregatire: Q4Pregatire;
  q5_anvergura: Q5Anvergura;
}

export interface RegisterParticipantInput {
  email: string;
  nume: string;
  firma_rol: string;
  sursa: string;
  sursa_detaliu: string | null;
  proces: string;
  nivel_ai: string;
  qualification: QualificationAnswers;
  consimtamant_comunicare: boolean;
  vrea_discutie: boolean;
}

/**
 * Statusul REAL al rândului, nu un „duplicat" sintetic (fix migrația 0003).
 * La o reînscriere, `status` e starea curentă a rândului existent — apelantul
 * decide ecranul din `(status, este_nou)`, nu doar din „a mai fost înscris".
 */
export type RegisterStatus = 'inscris' | 'asteptare' | 'reconfirmat' | 'anulat' | 'no_show' | 'prezent';

export interface RegisterParticipantResult {
  registration_id: string;
  status: RegisterStatus;
  /** false = rândul exista deja; nu s-a creat nimic nou la această cerere. */
  este_nou: boolean;
  confirm_token: string;
  checkin_token: string;
}

/**
 * Praguri hardcodate aici, nu doar în semnătura SQL: dacă cineva schimbă
 * default-ul din migrație fără să știe că valoarea contează și pentru copy
 * (§13 „Maximum 25", §16 „25 de locuri"), diferența trebuie să fie vizibilă
 * în cod, nu ascunsă într-un DEFAULT din altă parte a repo-ului.
 */
export const PRAG_WAITLIST = 30;
export const CAPACITATE_REALA = 25;

export async function registerParticipant(
  input: RegisterParticipantInput,
): Promise<RegisterParticipantResult> {
  const { data, error } = await supabaseAdmin()
    .rpc('register_participant', {
      p_email: input.email,
      p_nume: input.nume,
      p_firma_rol: input.firma_rol,
      p_sursa: input.sursa,
      p_sursa_detaliu: input.sursa_detaliu,
      p_proces: input.proces,
      p_nivel_ai: input.nivel_ai,
      p_qualification: input.qualification,
      p_consimtamant_comunicare: input.consimtamant_comunicare,
      p_vrea_discutie: input.vrea_discutie,
      p_event_slug: EVENT_SLUG,
      p_prag_waitlist: PRAG_WAITLIST,
    })
    .single<RegisterParticipantResult>();

  if (error) throw new SupabaseRpcError('register_participant', error);
  return data;
}

/* ── respond_to_invite ───────────────────────────────────────────────────── */

export type RaspunsRezultat = 'reconfirmat' | 'anulat' | 'deja' | 'invalid';

export async function respondToInvite(token: string, vine: boolean): Promise<RaspunsRezultat> {
  const { data, error } = await supabaseAdmin()
    .rpc('respond_to_invite', { p_token: token, p_vine: vine, p_event_slug: EVENT_SLUG })
    .single<RaspunsRezultat>();

  if (error) throw new SupabaseRpcError('respond_to_invite', error);
  return data;
}

/* ── claim_waitlist_seat ─────────────────────────────────────────────────── */

export type ClaimRezultat = 'revendicat' | 'plin' | 'invalid';

export async function claimWaitlistSeat(token: string): Promise<ClaimRezultat> {
  const { data, error } = await supabaseAdmin()
    .rpc('claim_waitlist_seat', {
      p_token: token,
      p_event_slug: EVENT_SLUG,
      p_capacitate: CAPACITATE_REALA,
    })
    .single<ClaimRezultat>();

  if (error) throw new SupabaseRpcError('claim_waitlist_seat', error);
  return data;
}

/* ── check_in / walk_in_check_in ─────────────────────────────────────────── */

export type CheckInRezultat = 'prezent' | 'deja' | 'invalid';

export async function checkIn(token: string): Promise<CheckInRezultat> {
  const { data, error } = await supabaseAdmin()
    .rpc('check_in', { p_token: token, p_event_slug: EVENT_SLUG })
    .single<CheckInRezultat>();

  if (error) throw new SupabaseRpcError('check_in', error);
  return data;
}

export async function walkInCheckIn(
  email: string,
  nume: string,
  consimtamantComunicare: boolean,
): Promise<CheckInRezultat> {
  const { data, error } = await supabaseAdmin()
    .rpc('walk_in_check_in', {
      p_email: email,
      p_nume: nume,
      p_consimtamant_comunicare: consimtamantComunicare,
      p_event_slug: EVENT_SLUG,
    })
    .single<CheckInRezultat>();

  if (error) throw new SupabaseRpcError('walk_in_check_in', error);
  return data;
}

/* ── mark_welcome_sent ───────────────────────────────────────────────────── */

export async function markWelcomeSent(registrationId: string): Promise<void> {
  const { error } = await supabaseAdmin().rpc('mark_welcome_sent', {
    p_registration_id: registrationId,
  });
  if (error) throw new SupabaseRpcError('mark_welcome_sent', error);
}

/* ── check_rate_limit ────────────────────────────────────────────────────── */

export async function checkRateLimit(
  bucket: string,
  limita: number,
  fereastraSecunde: number,
): Promise<boolean> {
  const { data, error } = await supabaseAdmin()
    .rpc('check_rate_limit', {
      p_bucket: bucket,
      p_limita: limita,
      p_fereastra: `${fereastraSecunde} seconds`,
    })
    .single<boolean>();

  if (error) throw new SupabaseRpcError('check_rate_limit', error);
  return data;
}

/* ── Eroare tipată ───────────────────────────────────────────────────────── */

/**
 * Păstrează numele funcției RPC în mesaj — la debugging pe log-urile din
 * Cloudflare, „eroare Supabase" fără context e inutilizabil la 23:40 în
 * seara dinaintea workshopului.
 */
export class SupabaseRpcError extends Error {
  constructor(
    public readonly rpc: string,
    public readonly cauza: { message: string; code?: string },
  ) {
    super(`Supabase RPC "${rpc}" a eșuat: ${cauza.message}`);
    this.name = 'SupabaseRpcError';
  }
}
