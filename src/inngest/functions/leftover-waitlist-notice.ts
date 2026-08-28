/**
 * Cei rămași pe listă la final — o singură rulare, batch, declanșată MANUAL.
 *
 * Spec: „trigger: scheduled, ex. 17 septembrie dimineața, sau manual". Nu e
 * un cron: e o acțiune UNICĂ, nu recurentă — mai simplu și mai sigur s-o
 * declanșeze Ciprian explicit (din dashboard-ul Inngest, „Send event", cu
 * `{ "name": "workshop/leftover_notice_requested", "data": { "event_slug":
 * "workshop-2026-09-16" } }`) decât să încerc să exprim „o singură dată, pe
 * 17 septembrie" printr-un cron — sintaxa aia e făcută pentru recurență.
 */

import { inngest, evtLeftoverNoticeRequested } from '../client';
import { listWaitlist } from '../../lib/supabase';
import { trimiteEmailBatch } from '../../lib/resend';
import { email7Leftover } from '../../emails/templates';

export const leftoverWaitlistNotice = inngest.createFunction(
  {
    id: 'workshop-leftover-waitlist-notice',
    triggers: [{ event: evtLeftoverNoticeRequested }],
    // Nu are sens decât o singură rulare reală — dacă se apasă de două ori
    // din grabă, a doua nu pornește una paralelă.
    singleton: { mode: 'skip', key: 'event.data.event_slug' },
    retries: 4,
  },
  async ({ event, step }) => {
    const asteptare = await step.run('lista-asteptare-ramasa', () => listWaitlist());
    if (asteptare.length === 0) {
      return { trimise: 0, motiv: 'waitlist gol la final' };
    }

    await step.run('trimite-batch', async () => {
      const destinatari = asteptare.map((w) => {
        const tmpl = email7Leftover({ nume: w.nume });
        return { to: w.email, subject: tmpl.subject, text: tmpl.text, html: tmpl.html };
      });
      await trimiteEmailBatch({ idempotencyKeyBaza: `email7-batch-${event.id}`, destinatari });
    });

    return { trimise: asteptare.length };
  },
);
