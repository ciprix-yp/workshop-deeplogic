/**
 * POST /api/checkin — bifează prezența. Aceeași regulă B2 ca la /raspuns:
 * GET-ul de pe /checkin doar randează, mutarea stă exclusiv aici.
 *
 * Spec-ul original lista `GET /checkin?token=xxx` ca rută unică, mutantă —
 * risc mai mic decât la anulare (nimic nu se propagă în cascadă, check-in
 * e idempotent), dar regula din CLAUDE.md e generală, nu scopată doar la
 * /raspuns. Consecvența costă un tap în plus la ușă; excepțiile motivate
 * „doar de data asta" sunt exact cum se strecoară bug-urile de genul ăsta.
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { checkIn } from '../../lib/supabase';
import { subLimita } from '../../lib/rate-limit';

export const prerender = false;

const inputSchema = z.object({ token: z.string().min(1) });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const vreaJson = (request.headers.get('accept') ?? '').includes('application/json');
  const raspundeJson = (corp: unknown, status = 200) =>
    new Response(JSON.stringify(corp), { status, headers: { 'Content-Type': 'application/json' } });
  const raspundeRedirect = (locatie: string) =>
    new Response(null, { status: 303, headers: { Location: locatie } });
  const tinta = (stare: string) => `/rezultat?stare=${encodeURIComponent(stare)}`;

  const permis = await subLimita('checkin', clientAddress);
  if (!permis) {
    return vreaJson
      ? raspundeJson({ ok: false, mesaj: 'Prea multe încercări. Așteaptă câteva minute.' }, 429)
      : raspundeRedirect(tinta('tokenInvalid'));
  }

  let corpCerere: Record<string, unknown>;
  try {
    const ct = request.headers.get('content-type') ?? '';
    corpCerere = ct.includes('application/json')
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return raspundeRedirect(tinta('tokenInvalid'));
  }

  const parsed = inputSchema.safeParse(corpCerere);
  if (!parsed.success) {
    return vreaJson
      ? raspundeJson({ ok: false, mesaj: 'Link incomplet.' }, 400)
      : raspundeRedirect(tinta('tokenInvalid'));
  }

  const rezultat = await checkIn(parsed.data.token);
  // 'prezent' și 'deja' duc la același ecran — pentru om contează că e
  // bifat, nu drumul prin care s-a ajuns acolo.
  const stareFinala = rezultat === 'invalid' ? 'tokenInvalid' : 'checkinReusit';

  return vreaJson
    ? raspundeJson({ ok: true, redirect: tinta(stareFinala) })
    : raspundeRedirect(tinta(stareFinala));
};
