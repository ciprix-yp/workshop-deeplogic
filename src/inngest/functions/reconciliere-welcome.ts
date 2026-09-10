/**
 * B11 — plasa de siguranță pentru „om în bază, fără niciun email".
 *
 * Scenariul pe care îl acoperă: `register_participant` scrie rândul, apoi
 * `inngest.send()` eșuează definitiv. `register.ts` înghite eroarea deliberat
 * (`register.ts:186`) — nu întoarcem 500 cuiva pentru o problemă de mesagerie,
 * locul lui e deja rezervat. Fără jobul ăsta, omul rămâne invizibil până apare
 * la ușă, și nimeni nu află.
 *
 * Infrastructura exista din prima migrație — coloana `welcome_sent_at` și un
 * index parțial construit exact pentru interogarea asta (`0001_init.sql:97`).
 * Consumatorul n-a fost scris niciodată: `DECIZII.md:83` spunea explicit
 * „reconcilierea B11 care încă nu există", iar `PROGRES.md` o marca „F-viitor".
 * Comentariul din `register.ts` o descria însă la PREZENT — „B11 recuperează
 * exact situația asta" — deci citind doar codul credeai că plasa e activă.
 * Găsit la code review-ul din 10 septembrie 2026 (I-1), scris atunci.
 *
 * ── De ce re-emiterea e sigură ──────────────────────────────────────────────
 *
 * D16: `id`-ul de idempotență (`reg-${id}` / `wait-${id}`) face re-emiterea un
 * NO-OP dacă evenimentul a ajuns deja, și o recuperare dacă emiterea inițială
 * eșuase. Nu există „retrimite emailul" ca operațiune separată — și nici nu
 * trebuie: aceeași cheie, același rezultat.
 *
 * ── De ce alerta e idempotentă ─────────────────────────────────────────────
 *
 * Dacă emiterea reușise dar `mark_welcome_sent` a picat, rândul rămâne cu
 * `welcome_sent_at` NULL iar re-emiterea e no-op — deci cronul l-ar găsi la
 * fiecare 10 minute, la infinit. Cheia de idempotență Resend, ancorată pe
 * `registration_id`, face ca alerta să plece o singură dată pentru același om.
 * Rândul rămâne vizibil în interogare ca semnal persistent, dar inboxul nu se
 * umple.
 */

import { inngest, evtRegistered, evtWaitlisted } from '../client';
import { gasesteInscrieriFaraWelcome } from '../../lib/supabase';
import { trimiteEmail } from '../../lib/resend';
import { ALERT_EMAIL, EMAIL_FROM } from 'astro:env/server';

/** La cât timp după înscriere un rând nemarcat devine suspect. */
const MINUTE_TOLERANTA = 10;

export const reconciliereWelcome = inngest.createFunction(
  {
    id: 'workshop-reconciliere-welcome',
    // La fiecare 10 minute: suficient de des ca un om să nu aștepte mult după
    // confirmarea lui, suficient de rar ca să nu conteze la cost.
    triggers: [{ cron: 'TZ=Europe/Bucharest */10 * * * *' }],
    retries: 2,
  },
  async ({ step }) => {
    const restante = await step.run('gaseste-restante', () =>
      gasesteInscrieriFaraWelcome(MINUTE_TOLERANTA),
    );

    if (restante.length === 0) {
      return { gasite: 0 };
    }

    await step.sendEvent(
      're-emite-evenimentele',
      restante.map((r) =>
        r.status === 'asteptare'
          ? evtWaitlisted.create(
              {
                registration_id: r.registration_id,
                email: r.email,
                nume: r.nume,
                confirm_token: r.confirm_token,
              },
              { id: `wait-${r.registration_id}` },
            )
          : evtRegistered.create(
              {
                registration_id: r.registration_id,
                email: r.email,
                nume: r.nume,
                confirm_token: r.confirm_token,
                checkin_token: r.checkin_token,
              },
              { id: `reg-${r.registration_id}` },
            ),
      ),
    );

    // Alertă per om, nu per rulare: altfel reconcilierea repară tăcut și nimeni
    // nu află niciodată că mesageria a picat.
    for (const r of restante) {
      await step.run(`alerta-${r.registration_id}`, async () => {
        const linii = [
          'Reconcilierea B11 a găsit o înscriere fără email de confirmare.',
          '',
          `Nume:    ${r.nume}`,
          `Email:   ${r.email}`,
          `Status:  ${r.status}`,
          `ID:      ${r.registration_id}`,
          '',
          `Evenimentul a fost re-emis cu id-ul de idempotență obișnuit, deci`,
          `dacă emiterea inițială eșuase, ciclul pornește acum. Dacă emiterea`,
          `reușise dar marcajul a picat, re-emiterea e no-op — verifică manual`,
          `dacă omul a primit emailul, apoi marchează rândul.`,
        ].join('\n');

        await trimiteEmail({
          idempotencyKey: `alerta-welcome/${r.registration_id}`,
          to: ALERT_EMAIL ?? EMAIL_FROM,
          subject: `[workshop] Înscriere fără email de confirmare — ${r.email}`,
          text: linii,
          html: `<pre style="font-family:ui-monospace,monospace;font-size:14px;line-height:1.6;">${linii
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')}</pre>`,
        });
      });
    }

    return { gasite: restante.length };
  },
);
