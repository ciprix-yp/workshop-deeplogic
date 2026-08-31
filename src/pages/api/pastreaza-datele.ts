/**
 * POST /api/pastreaza-datele — reconfirmă retenția, repornește ceasul de
 * 1 an. Aceeași regulă B2 ca /raspuns și /checkin: GET-ul de pe
 * /pastreaza-datele doar randează, mutarea stă exclusiv aici.
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { reconfirmaRetentie } from '../../lib/supabase';
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

  const permis = await subLimita('pastreaza-datele', clientAddress);
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

  const rezultat = await reconfirmaRetentie(parsed.data.token);
  const stareFinala = rezultat === 'invalid' ? 'tokenInvalid' : 'datePastrate';

  return vreaJson
    ? raspundeJson({ ok: true, redirect: tinta(stareFinala) })
    : raspundeRedirect(tinta(stareFinala));
};
