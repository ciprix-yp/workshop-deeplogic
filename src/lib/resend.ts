/**
 * Client Resend — înveliș subțire, tipat, peste `emails.send()`.
 *
 * Idempotency key pe FIECARE trimitere: `step.run()` din Inngest oferă
 * siguranță la reluare DOAR în interiorul aceleiași execuții (dacă pasul
 * aruncă, Inngest îl reia). Dar dacă apelul către Resend a reușit pe server
 * și doar răspunsul HTTP s-a pierdut (network blip), codul vede o eroare,
 * `step.run` reîncearcă, și fără idempotency key ar pleca un al doilea email
 * fizic identic. Cu ea, Resend recunoaște reluarea și întoarce răspunsul
 * original, fără să trimită de două ori.
 */

import { Resend } from 'resend';
import { RESEND_API_KEY, EMAIL_FROM } from 'astro:env/server';
import { codificaAtasamente, type AtasamentEmail } from './attachments';

let client: Resend | undefined;
function resendAdmin(): Resend {
  client ??= new Resend(RESEND_API_KEY);
  return client;
}

export interface TrimiteEmailInput {
  /** Format recomandat de Resend: `<tip-eveniment>/<id-entitate>`. */
  idempotencyKey: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: AtasamentEmail[];
}

export class ResendSendError extends Error {
  constructor(public readonly cauza: { message: string; name?: string }) {
    super(`Resend a eșuat: ${cauza.message}`);
    this.name = 'ResendSendError';
  }
}

export async function trimiteEmail(input: TrimiteEmailInput): Promise<{ id: string }> {
  const { data, error } = await resendAdmin().emails.send(
    {
      from: EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      attachments: codificaAtasamente(input.attachments),
    },
    { idempotencyKey: input.idempotencyKey },
  );

  if (error) throw new ResendSendError(error);
  return { id: data!.id };
}

/**
 * Broadcast către waitlist (email 6 — B1). Batch, nu N apeluri single:
 * atomic la nivelul lui Resend, un singur round-trip de rețea pentru
 * potențial zeci de destinatari simultan.
 *
 * Batch NU suportă atașamente — nu e nevoie aici, emailul 6 n-are `.ics`.
 */
export interface TrimiteBatchInput {
  idempotencyKeyBaza: string;
  destinatari: { to: string; subject: string; text: string; html: string }[];
}

export async function trimiteEmailBatch(input: TrimiteBatchInput): Promise<void> {
  if (input.destinatari.length === 0) return;

  // Limita Resend pentru batch e 100; peste, se împarte în bucăți. Cu 25-30
  // de locuri, waitlist-ul real nu se apropie de asta — plasă de siguranță,
  // nu cale așteptată.
  const BUCATA = 100;
  for (let i = 0; i < input.destinatari.length; i += BUCATA) {
    const felie = input.destinatari.slice(i, i + BUCATA);
    const { error } = await resendAdmin().batch.send(
      felie.map((d) => ({ from: EMAIL_FROM, ...d })),
      { idempotencyKey: `${input.idempotencyKeyBaza}-${i / BUCATA}` },
    );
    if (error) throw new ResendSendError(error);
  }
}
