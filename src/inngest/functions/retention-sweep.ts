/**
 * Sweep zilnic de retenție — Politica de Confidențialitate §5: „datele sunt
 * păstrate 1 an, apoi contactat pentru reconfirmare; fără reconfirmare, sunt
 * șterse". Vezi docs/DECIZII.md § „F9 — Politica de Confidențialitate" pentru
 * cum s-a găsit că promisiunea asta n-avea cod în spate.
 *
 * Cron, nu event-triggered: spre deosebire de restul ciclului (legat de
 * datele fixe ale evenimentului din 16 septembrie), retenția e un proces
 * recurent, fără ancoră de calendar — verifică în fiecare zi cine a ajuns la
 * prag, indiferent când s-a înscris.
 *
 * Ordinea (curățenie înainte de notificare) nu contează pentru corectitudine
 * — cele două operează pe seturi disjuncte (notificați-de-mult vs.
 * nenotificați-încă) — dar reduce tabelul înainte de scanarea următoare.
 */

import { inngest } from '../client';
import {
  gasesteContacteScadenteRetentie,
  marcheazaNotificareRetentieTrimisa,
  curataRetentieExpirata,
} from '../../lib/supabase';
import { trimiteEmail } from '../../lib/resend';
import { email8RetentieDate } from '../../emails/templates';
import { PUBLIC_SITE_URL } from 'astro:env/client';

export const retentionSweep = inngest.createFunction(
  {
    id: 'workshop-retention-sweep',
    triggers: [{ cron: 'TZ=Europe/Bucharest 0 9 * * *' }],
    retries: 4,
  },
  async ({ step }) => {
    const sterse = await step.run('curatenie-expirati', () => curataRetentieExpirata());

    const scadenti = await step.run('gaseste-scadenti', () => gasesteContacteScadenteRetentie());

    if (scadenti.length === 0) {
      return { sterse, notificati: 0 };
    }

    // Un singur step per contact, nu unul pentru trimitere și altul separat
    // pentru marcaj (cum face waitlisted.ts): dacă marcajul ar eșua după un
    // trimis reușit, reluarea PASULUI reface ambele — Resend recunoaște
    // idempotencyKey-ul și nu retrimite fizic, apoi marcajul reușește.
    for (const c of scadenti) {
      await step.run(`retentie-${c.contact_id}`, async () => {
        const tmpl = email8RetentieDate({
          nume: c.nume,
          linkReconfirmare: `${PUBLIC_SITE_URL}/pastreaza-datele?token=${c.retention_token}`,
        });
        await trimiteEmail({ idempotencyKey: `email8/${c.contact_id}`, to: c.email, ...tmpl });
        await marcheazaNotificareRetentieTrimisa(c.contact_id);
      });
    }

    return { sterse, notificati: scadenti.length };
  },
);
