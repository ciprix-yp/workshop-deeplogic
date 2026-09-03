/**
 * POST /api/register — înscrierea la workshop.
 *
 * Ordinea verificărilor contează: cea mai ieftină primul, ca o cerere respinsă
 * să coste cât mai puțin.
 *   1. rate limit (o interogare Postgres, nimic extern)
 *   2. validare Zod (in-process, gratis)
 *   3. Turnstile siteverify (apel de rețea către Cloudflare)
 *   4. register_participant (apel de rețea către Supabase)
 *   5. inngest.send() (apel de rețea către Inngest)
 *
 * Contract cu clientul: `Accept: application/json` (setat explicit de
 * fetch()-ul din S16Inscriere.astro) primește JSON `{ok, redirect}` sau
 * `{ok:false, erori|mesaj}`. Fără acel header — submit nativ, JS oprit sau
 * eșuat — răspunde cu un redirect HTTP; pagina țintă citește starea din
 * query string. Un formular care are nevoie de JS ca să existe e un formular
 * care pierde înscrieri fără să știi.
 */

import type { APIRoute } from 'astro';
import { inscriereSchema, formDataInSchema } from '../../content/form-schema';
import { verificaTurnstile } from '../../lib/turnstile';
import { subLimita } from '../../lib/rate-limit';
import { registerParticipant, type RegisterStatus } from '../../lib/supabase';
import { inngest, evtRegistered, evtWaitlisted } from '../../inngest/client';

export const prerender = false;

/** Unde trimitem omul, în funcție de starea reală a rândului (nou sau existent). */
function tintaPentruStatus(status: RegisterStatus): string {
  switch (status) {
    case 'inscris':
      return '/multumesc';
    case 'asteptare':
      return '/lista-asteptare';
    case 'reconfirmat':
    case 'prezent':
      return '/multumesc?stare=' + status;
    case 'anulat':
    case 'no_show':
      return '/multumesc?stare=anulat';
  }
}

/**
 * Cheia din `stari` (src/content/copy.ts) pentru clientul cu JS — care nu
 * navighează la `redirect`, ci randează confirmarea direct în dialog. Aceeași
 * ramificare ca `multumesc.astro`/`lista-asteptare.astro`, dusă pe server ca
 * să nu fie reimplementată a doua oară, diferit, pe client.
 */
function stareaPentruClient(status: RegisterStatus): 'inscris' | 'asteptare' | 'reconfirmat' | 'anulatAnterior' {
  switch (status) {
    case 'inscris':
      return 'inscris';
    case 'asteptare':
      return 'asteptare';
    case 'reconfirmat':
    case 'prezent':
      return 'reconfirmat';
    case 'anulat':
    case 'no_show':
      return 'anulatAnterior';
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const vreaJson = (request.headers.get('accept') ?? '').includes('application/json');

  const raspundeJson = (corp: unknown, status = 200) =>
    new Response(JSON.stringify(corp), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  const raspundeRedirect = (locatie: string) =>
    new Response(null, { status: 303, headers: { Location: locatie } });

  const eșuează = (mesaj: string, statusHttp = 200) =>
    vreaJson
      ? raspundeJson({ ok: false, mesaj }, statusHttp)
      : raspundeRedirect(`/?eroare=${encodeURIComponent(mesaj)}#inscriere`);

  // ── 1. Rate limit ──────────────────────────────────────────────────────
  const permis = await subLimita('register', clientAddress);
  if (!permis) {
    return eșuează('Prea multe încercări de la adresa asta. Așteaptă câteva minute și încearcă din nou.', 429);
  }

  // ── 2. Validare ─────────────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return eșuează('Formularul n-a ajuns întreg. Reîncarcă pagina și încearcă din nou.', 400);
  }

  const parsed = inscriereSchema.safeParse(formDataInSchema(formData));
  if (!parsed.success) {
    if (!vreaJson) {
      return eșuează('Câteva răspunsuri lipsesc sau nu sunt completate corect.', 400);
    }
    const erori: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const camp = String(issue.path[0] ?? '_general');
      if (!(camp in erori)) erori[camp] = issue.message;
    }
    return raspundeJson({ ok: false, erori });
  }
  const date = parsed.data;

  // ── 3. Turnstile ────────────────────────────────────────────────────────
  const turnstile = await verificaTurnstile(date['cf-turnstile-response'], clientAddress);
  if (!turnstile.ok) {
    return eșuează('Verificarea anti-spam n-a trecut. Reîncarcă pagina și încearcă din nou.', 400);
  }

  // ── 4. Scriere ──────────────────────────────────────────────────────────
  let rezultat: Awaited<ReturnType<typeof registerParticipant>>;
  try {
    rezultat = await registerParticipant({
      email: date.email,
      nume: date.nume,
      firma_rol: date.firma_rol,
      sursa: date.sursa,
      sursa_detaliu: date.sursa_detaliu?.trim() || null,
      proces: date.proces,
      nivel_ai: date.nivel_ai,
      qualification: {
        asteptari: date.asteptari,
        frica_principala: date.frica_principala,
        provocare_business: date.provocare_business,
        provocare_business_altceva: date.provocare_business_altceva?.trim() || null,
        blocaj_istoric: date.blocaj_istoric,
        interes_incompany: date.interes_incompany,
      },
      consimtamant_comunicare: date.consimtamant_comunicare,
      vrea_discutie: date.vrea_discutie,
    });
  } catch (eroare) {
    console.error('register_participant a eșuat:', eroare);
    return eșuează('Ceva s-a rupt la mine, nu la tine. Încearcă din nou peste un minut.', 500);
  }

  // ── 5. Emitere eveniment ────────────────────────────────────────────────
  //
  // Se emite pentru `inscris` ȘI `asteptare`, indiferent dacă rândul e nou
  // sau exista deja (`este_nou=false`) — id-ul evenimentului e legat de
  // `registration_id`, deci Inngest deduplichează automat (B10). Efectul e
  // exact comportamentul cerut la B4 „retrimite email 1 idempotent", dar
  // fără cod separat de retrimitere: dacă funcția a rulat deja, re-emiterea
  // e un no-op; dacă emiterea inițială eșuase silențios (B11), acum reușește.
  //
  // Pentru reconfirmat/prezent/anulat/no_show NU emitem nimic — omul a
  // trecut deja de pasul ăsta al fluxului, iar re-emiterea l-ar băga înapoi
  // în ciclul de 4 emailuri ca și cum tocmai s-ar fi înscris.
  try {
    if (rezultat.status === 'inscris') {
      const evt = evtRegistered.create(
        {
          registration_id: rezultat.registration_id,
          email: date.email,
          nume: date.nume,
          confirm_token: rezultat.confirm_token,
          checkin_token: rezultat.checkin_token,
        },
        { id: `reg-${rezultat.registration_id}` },
      );
      await inngest.send(evt);
    } else if (rezultat.status === 'asteptare') {
      const evt = evtWaitlisted.create(
        {
          registration_id: rezultat.registration_id,
          email: date.email,
          nume: date.nume,
          confirm_token: rezultat.confirm_token,
        },
        { id: `wait-${rezultat.registration_id}` },
      );
      await inngest.send(evt);
    }
  } catch (eroare) {
    // Rândul e deja scris în Supabase — nu întoarcem eroare omului pentru o
    // problemă de mesagerie. B11 (job de reconciliere, F6) recuperează
    // exact situația asta: `welcome_sent_at IS NULL` mai vechi de 10 minute.
    console.error('inngest.send() a eșuat după register_participant reușit:', eroare);
  }

  const tinta = tintaPentruStatus(rezultat.status);
  return vreaJson
    ? raspundeJson({ ok: true, redirect: tinta, stare: stareaPentruClient(rezultat.status) })
    : raspundeRedirect(tinta);
};
