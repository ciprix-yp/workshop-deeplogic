/**
 * POST /api/raspuns — singura rută care mută starea pentru reconfirmare,
 * anulare, sau revendicarea unui loc din waitlist.
 *
 * B2: `GET /raspuns` (pagina) NU face nimic altceva decât să afișeze un
 * buton — Outlook Safe Links și scanerele antivirus fac prefetch pe
 * linkurile din email, dar nu simulează un click pe un buton de pe pagina
 * REZULTATĂ. Fără separarea asta, prefetch-ul ar putea anula pe cineva
 * fără să fi dat vreodată click.
 *
 * Aici, nu în `register.ts`, se emite `workshop/seat_freed` pentru
 * anulările individuale — cealaltă jumătate a fixului B1 (prima e cutoff-ul,
 * în `registered.ts`).
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import {
  getStatusByToken,
  respondToInvite,
  claimWaitlistSeat,
} from '../../lib/supabase';
import { subLimita } from '../../lib/rate-limit';
import { inngest, evtSeatFreed, EVENT_SLUG } from '../../inngest/client';

export const prerender = false;

const inputSchema = z.object({
  token: z.string().min(1),
  r: z.enum(['da', 'nu']),
});

/** Starea finală, pentru ecranul de rezultat — vezi src/pages/rezultat.astro. */
function tintaRezultat(stare: string): string {
  return `/rezultat?stare=${encodeURIComponent(stare)}`;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const vreaJson = (request.headers.get('accept') ?? '').includes('application/json');

  const raspundeJson = (corp: unknown, status = 200) =>
    new Response(JSON.stringify(corp), { status, headers: { 'Content-Type': 'application/json' } });
  const raspundeRedirect = (locatie: string) =>
    new Response(null, { status: 303, headers: { Location: locatie } });

  const permis = await subLimita('raspuns', clientAddress);
  if (!permis) {
    return vreaJson
      ? raspundeJson({ ok: false, mesaj: 'Prea multe încercări. Așteaptă câteva minute.' }, 429)
      : raspundeRedirect(tintaRezultat('tokenInvalid'));
  }

  let corpCerere: Record<string, unknown>;
  try {
    const ct = request.headers.get('content-type') ?? '';
    corpCerere = ct.includes('application/json')
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return raspundeRedirect(tintaRezultat('tokenInvalid'));
  }

  const parsed = inputSchema.safeParse(corpCerere);
  if (!parsed.success) {
    return vreaJson
      ? raspundeJson({ ok: false, mesaj: 'Link incomplet.' }, 400)
      : raspundeRedirect(tintaRezultat('tokenInvalid'));
  }
  const { token, r } = parsed.data;

  const stareCurenta = await getStatusByToken(token);
  if (!stareCurenta) {
    return vreaJson
      ? raspundeJson({ ok: true, redirect: tintaRezultat('tokenInvalid') })
      : raspundeRedirect(tintaRezultat('tokenInvalid'));
  }

  let stareRezultat: string;

  // I-7 (fix 2026-09-10): try/catch ca în `register.ts`. Fără el, o sincopă
  // Supabase arunca o excepție neprinsă și omul primea pagina de eroare
  // implicită a lui Astro, în afara contractului JSON/redirect al aplicației.
  try {
    if (stareCurenta === 'asteptare' && r === 'da') {
      /* ── Cursa din waitlist ─────────────────────────────────────────────── */
      const rezultat = await claimWaitlistSeat(token);
      stareRezultat = rezultat === 'revendicat' ? 'locRevendicat' : rezultat === 'plin' ? 'locLuat' : 'tokenInvalid';
    } else {
      /* ── Reconfirmare / anulare normală ───────────────────────────────────── */
      const rezultat = await respondToInvite(token, r === 'da');

      if (rezultat === 'reconfirmat') stareRezultat = 'reconfirmat';
      else if (rezultat === 'anulat') stareRezultat = 'anulat';
      else if (rezultat === 'pe_asteptare') stareRezultat = 'revenitPeAsteptare';
      else if (rezultat === 'deja') {
        // Deja în starea cerută — arătăm ecranul care corespunde REZULTATULUI
        // dorit, nu unul separat de „deja făcut": pentru om, contează că
        // starea finală e cea corectă, nu drumul prin care s-a ajuns acolo.
        stareRezultat = r === 'da' ? 'reconfirmat' : 'anulat';
      } else {
        stareRezultat = 'tokenInvalid';
      }

      // B1, a doua jumătate: anulare REALĂ (nu „deja anulat") → emite
      // seat_freed. `deja` nu re-emite — locul a fost eliberat la tranziția
      // originală, nu acum.
      //
      // Excepție (fix 2026-09-10): cine anulează de pe lista de AȘTEPTARE nu
      // eliberează niciun loc — n-avea unul. Emiteam degeaba un broadcast care
      // anunța locuri inexistente. `stareCurenta` e citit oricum mai sus, deci
      // verificarea e gratuită.
      if (rezultat === 'anulat' && stareCurenta !== 'asteptare') {
        try {
          await inngest.send(
            evtSeatFreed.create(
              { event_slug: EVENT_SLUG },
              // Idempotency pe token, nu pe un timestamp — dacă cineva dă
              // reîncărcare/dublu-submit pe același răspuns, nu emite de două ori.
              { id: `seatfreed-raspuns-${token}` },
            ),
          );
        } catch (eroare) {
          // Nu blocăm răspunsul pentru om din cauza unei erori de mesagerie —
          // aceeași logică ca în register.ts. Waitlist-ul poate rămâne
          // neanunțat până la următoarea tranziție care emite seat_freed.
          console.error('emitere seat_freed din /api/raspuns a eșuat:', eroare);
        }
      }
    }
  } catch (eroare) {
    console.error('RPC-ul din /api/raspuns a eșuat:', eroare);
    return vreaJson
      ? raspundeJson(
          { ok: false, mesaj: 'Ceva s-a rupt la mine, nu la tine. Încearcă din nou peste un minut.' },
          500,
        )
      : raspundeRedirect(tintaRezultat('tokenInvalid'));
  }

  return vreaJson
    ? raspundeJson({ ok: true, redirect: tintaRezultat(stareRezultat) })
    : raspundeRedirect(tintaRezultat(stareRezultat));
};
