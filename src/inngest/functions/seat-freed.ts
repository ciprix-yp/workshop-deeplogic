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
    // O rulare activă per eveniment. **`skip` ARUNCĂ rularea nouă** — nu o pune
    // la coadă, nu o reîncearcă. Comentariul de dinainte spunea că „așteaptă",
    // ceea ce e fals; corectat la review-ul din 10 septembrie 2026 (I-3).
    //
    // Păstrat totuși `skip`, deliberat, nu schimbat pe `cancel`:
    //   · `cancel` ar opri rularea în curs și ar porni una nouă, care ar
    //     retrimite întregului waitlist cu o cheie de idempotență NOUĂ
    //     (`email6-batch-${event.id}`) — deci oamenii care primiseră deja din
    //     rularea anulată ar primi un al doilea email. Cost sigur, pe toată
    //     lista.
    //   · `skip` riscă, în schimb, ca un loc eliberat să nu fie anunțat — dar
    //     doar dacă o a doua fereastră de debounce se închide cât prima rulare
    //     e încă în execuție (rularea reală durează ~500ms, fereastra e de 2
    //     minute, deci cere retry-uri lungi). Și **se autovindecă**: următorul
    //     `seat_freed` — altă anulare, sau cutoff-ul de la 11:00, care emite
    //     pentru fiecare `no_show` — pornește o rulare care citește starea
    //     CURENTĂ și anunță tot ce e liber atunci, nu doar locul nou.
    // Un email dublu către toată lista e mai scump decât un anunț întârziat
    // care oricum se recuperează la următorul eveniment.
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
