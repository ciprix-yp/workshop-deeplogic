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

/**
 * Emis la orice tranziție spre `anulat`/`no_show` — din `POST /api/raspuns`
 * (cineva anunță că nu mai vine) sau din cutoff-ul automat de la 11:00
 * (funcția `registered.ts`).
 *
 * Funcția care-l ascultă (`seat-freed.ts`) are `debounce` + `singleton` pe
 * `event_slug` (B1): la cutoff, până la 30 de tranziții pot avea loc în
 * aceeași secundă — fără coalescing, fiecare om de pe waitlist ar primi
 * câte un email pentru fiecare loc eliberat. `data` nu conține un contor de
 * locuri: funcția interoghează Supabase direct, la momentul rulării (după
 * fereastra de debounce), pentru starea REALĂ — mai robust decât să sume
 * evenimente individuale, care Inngest oricum le coalesc fără să le agrege.
 */
export const evtSeatFreed = eventType('workshop/seat_freed', {
  schema: z.object({ event_slug: z.string() }),
});

/**
 * Declanșat MANUAL (din dashboard-ul Inngest sau printr-un script), nu de
 * un cron — e o rulare unică, nu una recurentă. Vezi spec: „trigger:
 * scheduled, ex. 17 septembrie dimineața, sau manual".
 */
export const evtLeftoverNoticeRequested = eventType('workshop/leftover_notice_requested', {
  schema: z.object({ event_slug: z.string() }),
});

/*
 * I-12 (review 10 septembrie 2026): cele două chei sunt `optional: true` în
 * `astro.config.mjs`, și AȘA TREBUIE să rămână — `.dev.vars`/`.env` le au
 * goale, corect, fiindcă dev-ul local vorbește cu Inngest Dev Server, care nu
 * cere nici event key nici semnătură. Un câmp `required` gol ar bloca TOATĂ
 * aplicația locală, nu doar Inngest (schema `astro:env` se validează integral
 * la fiecare cerere — vezi capcana `ALERT_EMAIL` din CLAUDE.md §4).
 *
 * Dar în producție lipsa lor e gravă și tăcută: fără `eventKey`, `inngest.send()`
 * eșuează și `register.ts` înghite eroarea (om în bază, fără email); fără
 * `signingKey`, `serve()` n-are cu ce verifica semnătura cererilor primite,
 * adică oricine ar putea POSTa direct pe `/api/inngest` ca să invoce funcțiile
 * de stare, fără token și fără Turnstile.
 *
 * Deci: garda e la RULARE, nu în schemă, și doar în afara dev-ului.
 */
if (!import.meta.env.DEV && (!INNGEST_EVENT_KEY || !INNGEST_SIGNING_KEY)) {
  throw new Error(
    'INNGEST_EVENT_KEY și INNGEST_SIGNING_KEY sunt obligatorii în afara dev-ului. ' +
      'Fără ele, emailurile nu pleacă și endpoint-ul /api/inngest e fail-open. ' +
      'Setează-le ca secrete de Worker: `wrangler secret put INNGEST_EVENT_KEY`.',
  );
}

export const inngest = new Inngest({
  id: 'workshop-deeplogic',
  isDev: import.meta.env.DEV,
  eventKey: INNGEST_EVENT_KEY,
  signingKey: INNGEST_SIGNING_KEY,
});
