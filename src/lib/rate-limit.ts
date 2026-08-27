/**
 * Rate limiting pe IP, cu contorul atomic în Postgres (vezi
 * supabase/migrations/0002_rate_limit.sql pentru funcția `check_rate_limit`
 * și motivul pentru care trăiește acolo, nu într-un KV Cloudflare).
 *
 * IP-ul brut nu ajunge NICIODATĂ în Postgres — se hash-uiește aici, în Worker,
 * unde Web Crypto e disponibil nativ. Postgres primește doar un bucket opac
 * de forma `register:a3f9…`, deci logurile bazei de date nu conțin identificatori
 * personali reutilizabili.
 */

import { checkRateLimit } from './supabase';

async function hashIp(ip: string): Promise<string> {
  const octeti = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest('SHA-256', octeti);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16); // 8 bytes de entropie — suficient să separe bucket-uri, nu nevoie de tot hash-ul
}

interface LimitaConfig {
  /** Cereri permise per fereastră. */
  limita: number;
  /** Lungimea ferestrei, în secunde. */
  fereastraSecunde: number;
}

/**
 * Praguri generoase, deliberat: Turnstile e prima linie de apărare reală —
 * un token valid cere o rezolvare per cerere, greu de scriptat în masă.
 * Rate limiting-ul de aici e a doua linie, împotriva unui om (sau a unui
 * script simplu care refolosește un singur token) care lovește endpoint-ul
 * repetat. Pragurile trebuie să încapă confortabil un birou/familie în
 * spatele aceluiași NAT, care se înscrie pe rând.
 */
const LIMITE: Record<string, LimitaConfig> = {
  register: { limita: 12, fereastraSecunde: 15 * 60 },
  raspuns: { limita: 20, fereastraSecunde: 15 * 60 },
  checkin: { limita: 20, fereastraSecunde: 15 * 60 },
};

export type RutaLimitata = keyof typeof LIMITE;

/** true = cererea trece; false = peste prag, se respinge cu 429. */
export async function subLimita(ruta: RutaLimitata, ip: string | undefined): Promise<boolean> {
  // Fără IP (dev local, sau un proxy care nu-l propagă) — nu blocăm, doar nu
  // limităm. Mai bine permisiv local decât o eroare 500 care ascunde alte bug-uri.
  if (!ip) return true;

  // `ruta` e `keyof typeof LIMITE`, deci prezența e garantată de tipuri —
  // dar `noUncheckedIndexedAccess` tot adaugă `| undefined` la orice acces
  // indexat. Fallback-ul explicit ține TypeScript mulțumit fără `!`.
  const config = LIMITE[ruta] ?? { limita: 10, fereastraSecunde: 15 * 60 };
  const bucket = `${ruta}:${await hashIp(ip)}`;
  return checkRateLimit(bucket, config.limita, config.fereastraSecunde);
}
