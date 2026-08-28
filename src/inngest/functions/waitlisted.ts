/**
 * Cineva intră direct pe listă de așteptare (peste bufferul de 30).
 *
 * Spec-ul original calcula o poziție informativă pentru email. Decizia din
 * 28 august a scos-o din copy: sistemul nu e FIFO — la eliberarea unui loc,
 * TOȚI cei de pe listă sunt anunțați simultan, câștigă primul care confirmă,
 * nu ordinea de înscriere. O poziție ar fi promis o ordine care nu există —
 * vezi docs/EMAILURI.md § Email 5. Funcția asta e mai simplă decât spec-ul
 * original tocmai din cauza aceea: nimic de calculat, doar de trimis.
 */

import { inngest, evtWaitlisted } from '../client';
import { trimiteEmail } from '../../lib/resend';
import { email5Waitlisted } from '../../emails/templates';
import { markWelcomeSent } from '../../lib/supabase';

export const waitlisted = inngest.createFunction(
  {
    id: 'workshop-waitlisted',
    triggers: [{ event: evtWaitlisted }],
    retries: 4,
  },
  async ({ event, step }) => {
    const { registration_id, email, nume } = event.data;

    await step.run('email-5-waitlisted', async () => {
      const tmpl = email5Waitlisted({ nume });
      await trimiteEmail({ idempotencyKey: `email5/${registration_id}`, to: email, ...tmpl });
    });

    // Același contor ca la `registered.ts` — reconcilierea B11 tratează
    // ambele căi la fel: un rând fără `welcome_sent_at` e un om care n-a
    // primit nicio confirmare, indiferent dacă a intrat `inscris` sau
    // `asteptare`.
    await step.run('marcheaza-welcome-trimis', () => markWelcomeSent(registration_id));
  },
);
