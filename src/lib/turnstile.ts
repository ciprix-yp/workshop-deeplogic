/**
 * Verificare Turnstile pe server.
 *
 * Widget-ul de pe client dovedește doar că un răspuns a fost validat ODATĂ —
 * fără verificarea de aici, un atacator ocolește widget-ul complet și trimite
 * direct la `/api/register`. Contractul oficial Cloudflare:
 * POST https://challenges.cloudflare.com/turnstile/v0/siteverify
 * cu { secret, response, remoteip } → { success, "error-codes": [...] }.
 *
 * Tokenul e single-use: a doua verificare a aceluiași token eșuează cu
 * `timeout-or-duplicate`. De asta formularul din client resetează widget-ul
 * (`window.turnstile.reset()`) după orice respingere, altfel a doua încercare
 * a omului ar pica mereu, fără explicație.
 */

import { TURNSTILE_SECRET_KEY } from 'astro:env/server';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface SiteverifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export interface TurnstileRezultat {
  ok: boolean;
  coduriEroare: string[];
}

export async function verificaTurnstile(
  token: string,
  remoteIp?: string,
): Promise<TurnstileRezultat> {
  if (!token) {
    return { ok: false, coduriEroare: ['missing-input-response'] };
  }

  let raspuns: Response;
  try {
    raspuns = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: TURNSTILE_SECRET_KEY,
        response: token,
        ...(remoteIp ? { remoteip: remoteIp } : {}),
      }),
    });
  } catch {
    // Cloudflare nepic răspunde — nu blocăm omul din cauza unei erori de
    // rețea de partea noastră. Turnstile e apărare defensivă, nu singura.
    return { ok: false, coduriEroare: ['internal-error'] };
  }

  if (!raspuns.ok) {
    return { ok: false, coduriEroare: [`http-${raspuns.status}`] };
  }

  const date = (await raspuns.json()) as SiteverifyResponse;
  return { ok: date.success === true, coduriEroare: date['error-codes'] ?? [] };
}
