/**
 * Trimiterea notificării către organizator — un singur loc, folosit de ambele
 * căi (directă din `register.ts` și durabilă din `notificare-inscriere.ts`).
 *
 * Cheia de idempotență e ancorată pe `registration_id`, deci oricare cale
 * ajunge prima trimite, iar a doua devine no-op la Resend. Asta face dublura
 * sigură — și face inofensivă și re-emiterea evenimentului din reconcilierea
 * B11.
 */

import { trimiteEmail } from './resend';
import { ALERT_EMAIL, EMAIL_FROM } from 'astro:env/server';
import { emailNotificareInscriere } from '../emails/notificare';
import type { InscriereCompleta } from './supabase';

/**
 * Unde ajung notificările.
 *
 * `ALERT_EMAIL` dacă e setat; altfel `EMAIL_FROM`, care e chiar
 * `ciprian@deeplogic.ro` — adresa cerută explicit (2026-09-11), și aceeași
 * unde ajung deja răspunsurile directe ale participanților la emailuri, deci
 * inbox-ul urmărit oricum în campanie. Ca să le muți, setezi secretul:
 * `wrangler secret put ALERT_EMAIL`.
 */
function destinatie(): string {
  return ALERT_EMAIL ?? EMAIL_FROM;
}

export async function trimiteNotificareInscriere(
  registrationId: string,
  date: InscriereCompleta,
): Promise<void> {
  const tmpl = emailNotificareInscriere(date);
  await trimiteEmail({
    idempotencyKey: `notificare-organizator/${registrationId}`,
    to: destinatie(),
    subject: tmpl.subject,
    text: tmpl.text,
    html: tmpl.html,
  });
}
