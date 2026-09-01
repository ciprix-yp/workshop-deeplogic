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
 * Capacitate unificată (migrația 0007) — până la 2026-08-31 existau două
 * cifre: un buffer soft de 30 la înscriere (`register_participant`) și un
 * cap dur de 25 la revendicarea unui loc din waitlist (`claim_waitlist_seat`).
 * Asimetria era intenționată ȘI ascunsă: pagina afirma 25, sistemul accepta
 * 30. Odată ce pagina capătă un contor LIVE de locuri, asimetria devine
 * vizibil neonestă — contorul ar putea arăta locuri libere chiar când
 * bufferul e deja plin, sau invers. Cifra stată pe pagină (30) e acum și
 * cifra hard aplicată în bază, la ambele praguri.
 *
 * Hardcodată aici, nu doar în semnătura SQL: dacă cineva schimbă default-ul
 * din migrație fără să știe că valoarea contează și pentru copy
 * (EVENIMENT.capacitate din src/content/copy.ts), diferența trebuie să fie
 * vizibilă în cod, nu ascunsă într-un DEFAULT din altă parte a repo-ului.
 */
export const CAPACITATE = 30;

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
      p_prag_waitlist: CAPACITATE,
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
      p_capacitate: CAPACITATE,
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

/* ── expire_if_unconfirmed ───────────────────────────────────────────────── */

/**
 * Marchează `no_show` DOAR rândul dat, dacă e încă `inscris`. Întoarce
 * `true` dacă tocmai l-a schimbat, `false` dacă era deja altceva (idempotent).
 *
 * Per rând, nu sweep în bloc (migrația 0005) — fiecare instanță Inngest are
 * nevoie să știe dacă PROPRIA înscriere tocmai a devenit no_show, ca să
 * decidă dacă emite `workshop/seat_freed`. Vezi comentariul din migrație.
 */
export async function expireIfUnconfirmed(registrationId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin()
    .rpc('expire_if_unconfirmed', { p_registration_id: registrationId, p_event_slug: EVENT_SLUG })
    .single<boolean>();

  if (error) throw new SupabaseRpcError('expire_if_unconfirmed', error);
  return data;
}

/* ── Citiri directe ──────────────────────────────────────────────────────────
 * Fără funcție RPC dedicată: sunt CITIRI, nu tranziții de stare — nimic de
 * protejat cu atomicitate. Service role ocolește RLS prin design.
 * ──────────────────────────────────────────────────────────────────────────── */

export interface StareInregistrare {
  status: RegisterStatus;
  email: string;
  nume: string;
  confirm_token: string;
  checkin_token: string;
}

/**
 * Starea curentă a unei înscrieri, după `registration_id` — folosită de
 * `registered.ts` la pașii „check-status" / „check-status-again" din spec:
 * lucrurile se pot schimba între cele două `sleepUntil` (cineva anulează
 * exact în fereastra dintre cutoff și trimiterea emailului de check-in).
 */
export async function getRegistrationStatus(
  registrationId: string,
): Promise<StareInregistrare | null> {
  const { data, error } = await supabaseAdmin()
    .from('event_registrations')
    .select('status, confirm_token, checkin_token, contacts(email, nume)')
    .eq('id', registrationId)
    .maybeSingle();

  if (error) throw new SupabaseRpcError('select event_registrations', error);
  if (!data) return null;

  const contact = Array.isArray(data.contacts) ? data.contacts[0] : data.contacts;
  if (!contact) return null;

  return {
    status: data.status as RegisterStatus,
    confirm_token: data.confirm_token,
    checkin_token: data.checkin_token,
    email: contact.email,
    nume: contact.nume,
  };
}

export interface IntrareWaitlist {
  registration_id: string;
  email: string;
  nume: string;
  confirm_token: string;
}

/** Toți cei aflați curent pe `asteptare` — pentru broadcast-ul din email 6. */
export async function listWaitlist(): Promise<IntrareWaitlist[]> {
  const { data, error } = await supabaseAdmin()
    .from('event_registrations')
    .select('id, confirm_token, contacts(email, nume)')
    .eq('event_slug', EVENT_SLUG)
    .eq('status', 'asteptare');

  if (error) throw new SupabaseRpcError('select waitlist', error);

  return (data ?? []).flatMap((r) => {
    const contact = Array.isArray(r.contacts) ? r.contacts[0] : r.contacts;
    if (!contact) return [];
    return [{ registration_id: r.id, confirm_token: r.confirm_token, email: contact.email, nume: contact.nume }];
  });
}

/**
 * Câte locuri sunt libere ACUM, sub capacitatea unificată (30) — nu un contor
 * de evenimente. La cutoff, până la 30 de tranziții spre `no_show` pot avea
 * loc simultan; interogarea directă, la momentul rulării funcției debounced,
 * reflectă starea reală mai fidel decât ar face suma evenimentelor primite
 * (pe care Inngest oricum le coalesce, nu le agregă).
 *
 * Numără DOAR `reconfirmat`/`prezent` — locuri fizic confirmate, folosit de
 * broadcast-ul intern către waitlist (email 6) când se eliberează un loc
 * real. Diferit de `locuriDisponibilePublic()` de mai jos, care numără și
 * `inscris`/`asteptare` — pragul care decide dacă un NOU înscris intră direct
 * sau pe listă.
 */
export async function locuriLibere(): Promise<number> {
  const { count, error } = await supabaseAdmin()
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_slug', EVENT_SLUG)
    .in('status', ['reconfirmat', 'prezent']);

  if (error) throw new SupabaseRpcError('count locuri ocupate', error);
  return Math.max(0, CAPACITATE - (count ?? 0));
}

/**
 * Contorul PUBLIC de pe pagină (BaraScarcity.astro + insigna de pe CTA).
 *
 * Numără exact același set de statusuri ca `v_ocupate` din
 * `register_participant` (migrația 0001) — `inscris`, `asteptare`,
 * `reconfirmat`, `prezent`. Dacă ar număra altceva (de exemplu doar
 * `reconfirmat`/`prezent`, ca `locuriLibere()` de mai sus), pagina ar putea
 * arăta „3 locuri disponibile" chiar în momentul în care un submit real ar
 * fi trimis pe listă de așteptare — exact genul de neonestitate pe care
 * regula sursei o interzice explicit („fără deficit fals; afișează doar
 * date reale").
 */
export async function locuriDisponibilePublic(): Promise<{ ramase: number; maxime: number }> {
  const { count, error } = await supabaseAdmin()
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_slug', EVENT_SLUG)
    .in('status', ['inscris', 'asteptare', 'reconfirmat', 'prezent']);

  if (error) throw new SupabaseRpcError('count ocupate (public)', error);
  return { ramase: Math.max(0, CAPACITATE - (count ?? 0)), maxime: CAPACITATE };
}

/**
 * Statusul curent, după `confirm_token` — folosit de `/api/raspuns` ca să
 * decidă ÎNTRE reconfirmare normală și cursa din waitlist, ÎNAINTE de a
 * apela funcția RPC potrivită (`respond_to_invite` vs `claim_waitlist_seat`
 * așteaptă stări de plecare diferite).
 */
export async function getStatusByToken(token: string): Promise<RegisterStatus | null> {
  const { data, error } = await supabaseAdmin()
    .from('event_registrations')
    .select('status')
    .eq('confirm_token', token)
    .eq('event_slug', EVENT_SLUG)
    .maybeSingle();

  if (error) throw new SupabaseRpcError('select status by token', error);
  return (data?.status as RegisterStatus) ?? null;
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

/* ── Retenția de 1 an (migrația 0006) ────────────────────────────────────────
 * Vezi docs/DECIZII.md § „F9 — Politica de Confidențialitate": politica
 * promitea această automatizare înainte să existe; acum e verificată de
 * tests/db/retention.sql. Scop pe `contacts`, nu pe `event_registrations` —
 * politica promite ștergerea datelor personale, care trăiesc pe contact.
 * ──────────────────────────────────────────────────────────────────────────── */

export interface ContactScadentRetentie {
  contact_id: string;
  email: string;
  nume: string;
  retention_token: string;
}

/** Contactele cu 1 an de la ultima (re)confirmare, nenotificate încă în ciclul curent. */
export async function gasesteContacteScadenteRetentie(): Promise<ContactScadentRetentie[]> {
  const { data, error } = await supabaseAdmin().rpc('find_contacts_due_for_retention_notice');
  if (error) throw new SupabaseRpcError('find_contacts_due_for_retention_notice', error);
  return data ?? [];
}

export async function marcheazaNotificareRetentieTrimisa(contactId: string): Promise<void> {
  const { error } = await supabaseAdmin().rpc('mark_retention_notice_sent', {
    p_contact_id: contactId,
  });
  if (error) throw new SupabaseRpcError('mark_retention_notice_sent', error);
}

export type ReconfirmaRetentieRezultat = 'reconfirmat' | 'invalid';

/** Link din emailul de retenție — repornește ceasul de 1 an de la momentul apelului. */
export async function reconfirmaRetentie(token: string): Promise<ReconfirmaRetentieRezultat> {
  const { data, error } = await supabaseAdmin()
    .rpc('reconfirm_retention', { p_token: token })
    .single<ReconfirmaRetentieRezultat>();

  if (error) throw new SupabaseRpcError('reconfirm_retention', error);
  return data;
}

/**
 * Șterge contactele notificate de peste 30 de zile fără reconfirmare.
 * Întoarce DOAR un număr — jurnalul unui job care șterge date personale n-are
 * voie să rețină exact ce a șters.
 */
export async function curataRetentieExpirata(): Promise<number> {
  const { data, error } = await supabaseAdmin().rpc('purge_expired_retention').single<number>();
  if (error) throw new SupabaseRpcError('purge_expired_retention', error);
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
