/**
 * S-a eliberat cel puțin un loc — broadcast către toată lista de așteptare.
 *
 * B1, jumătatea critică: la cutoff-ul de 11:00, până la 25-30 de instanțe
 * din `registered.ts` pot emite `workshop/seat_freed` în aceeași secundă —
 * câte una pentru fiecare persoană care tocmai devine `no_show`. Fără
 * coalescing, fiecare om de pe waitlist ar primi câte un email pentru
 * FIECARE loc eliberat, în loc de unul singur cu numărul corect.
 *
 * `debounce` + `singleton`, amândouă pe `event_slug`: evenimentele care sosesc
 * în fereastra de 2 minute se coalesc într-o SINGURĂ rulare, care interoghează
 * starea reală (nu numără evenimente — Inngest oricum le coalesce, nu le
 * agregă) și trimite UN singur broadcast, cu numărul corect de locuri.
 */

import { inngest, evtSeatFreed } from '../client';
import { listWaitlist, locuriLibere } from '../../lib/supabase';
import { trimiteEmailBatch } from '../../lib/resend';
import { email6SeatFreed } from '../../emails/templates';
import { PUBLIC_SITE_URL } from 'astro:env/client';

export const seatFreed = inngest.createFunction(
  {
    id: 'workshop-seat-freed',
    triggers: [{ event: evtSeatFreed }],
    // 2 minute: suficient să prindă un cutoff cu zeci de tranziții simultane,
    // suficient de scurt încât cineva care anulează izolat să nu aștepte mult
    // pentru ca waitlist-ul să afle.
    debounce: { period: '2m', key: 'event.data.event_slug' },
    // O rulare activă per eveniment — o a doua rundă de tranziții, sosită cât
    // prima încă rulează, așteaptă (nu pornește o rulare paralelă care ar
    // număra din nou aceleași locuri).
    singleton: { mode: 'skip', key: 'event.data.event_slug' },
    retries: 4,
  },
  async ({ event, step }) => {
    const asteptare = await step.run('lista-asteptare', () => listWaitlist());
    if (asteptare.length === 0) {
      // Spec: „dacă lista e goală → nu face nimic".
      return { trimise: 0, motiv: 'waitlist gol' };
    }

    const nLocuri = await step.run('locuri-libere', () => locuriLibere());
    if (nLocuri <= 0) {
      // Nu s-a întâmplat în practică (a trimite notificarea E calea prin care
      // cineva poate revendica un loc), dar dacă starea reală arată zero
      // locuri libere, un broadcast „s-a eliberat un loc" ar minți.
      return { trimise: 0, motiv: 'zero locuri libere la momentul verificării' };
    }

    await step.run('trimite-broadcast', async () => {
      const destinatari = asteptare.map((w) => {
        const tmpl = email6SeatFreed({
          nume: w.nume,
          numarLocuri: nLocuri,
          linkRevendicare: `${PUBLIC_SITE_URL}/raspuns?token=${w.confirm_token}&r=da`,
        });
        return { to: w.email, subject: tmpl.subject, text: tmpl.text, html: tmpl.html };
      });
      // `event.id` ca bază de idempotency: stabil pentru ACEASTĂ rulare
      // (inclusiv la reluare după un eșec parțial), diferit rulare de rulare.
      await trimiteEmailBatch({ idempotencyKeyBaza: `email6-batch-${event.id}`, destinatari });
    });

    return { trimise: asteptare.length, locuriLibere: nLocuri };
  },
);
