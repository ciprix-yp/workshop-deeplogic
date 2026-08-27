/**
 * Clientul Inngest — folosit atât la EMITERE (`inngest.send()`, din rutele API)
 * cât și la SERVIRE (`serve()`, din /api/inngest — F6).
 *
 * `isDev: import.meta.env.DEV` e semnalul explicit, nu variabila `INNGEST_DEV`:
 * Vite/Astro setează `import.meta.env.DEV` la build time (`true` în `astro dev`,
 * `false` în worker-ul construit pentru producție), deci comportamentul e
 * determinist și nu depinde de o variabilă de mediu suplimentară care poate fi
 * uitată la deploy. Documentația Inngest confirmă că `isDev` explicit are
 * prioritate față de variabila de mediu.
 *
 * Cheile vin din `astro:env/server`, care pe adaptorul Cloudflare le rezolvă
 * din `env`-ul Worker-ului (nu din `process.env`, inexistent în Workers) —
 * exact același mecanism folosit pentru Supabase și Turnstile.
 */

import { Inngest } from 'inngest';
import { eventType } from 'inngest';
import { z } from 'zod';
import { INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY } from 'astro:env/server';

export const EVENT_SLUG = 'workshop-2026-09-16' as const;

/* ── Evenimente tipate ────────────────────────────────────────────────────
 * Zod 4 implementează StandardSchemaV1 nativ — `eventType()` acceptă direct
 * schema, fără vreun adaptor.
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Emis din `POST /api/register` pentru cei intrați cu status `inscris`
 * (nu pentru cei direct pe `asteptare` — aceia primesc `workshop/waitlisted`).
 * Declanșează funcția principală: 4 × `sleepUntil`, cu linkul de anulare
 * inclus în primul email (B3).
 */
export const evtRegistered = eventType('workshop/registered', {
  schema: z.object({
    registration_id: z.string(),
    email: z.string(),
    nume: z.string(),
    confirm_token: z.string(),
    checkin_token: z.string(),
  }),
});

/** Emis pentru cei intrați direct pe listă de așteptare. */
export const evtWaitlisted = eventType('workshop/waitlisted', {
  schema: z.object({
    registration_id: z.string(),
    email: z.string(),
    nume: z.string(),
    confirm_token: z.string(),
  }),
});

export const inngest = new Inngest({
  id: 'workshop-deeplogic',
  isDev: import.meta.env.DEV,
  eventKey: INNGEST_EVENT_KEY,
  signingKey: INNGEST_SIGNING_KEY,
});
