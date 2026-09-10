/**
 * Ciclul principal — o instanță per persoană înscrisă cu status `inscris`.
 *
 * 4 puncte de somn, cu verificare de stare înainte de fiecare acțiune care
 * urmează: cineva poate anula oricând, prin linkurile din email 1, 2 sau 3
 * (B3 + decizia 3 din spec — calea de anulare există și după reconfirmare).
 * Fără verificare, cineva care a anulat deja ar primi în continuare email 2
 * („vii miercuri?") sau email 3 — copy care contrazice starea reală.
 *
 * La cutoff, fiecare instanță marchează DOAR propriul rând `no_show`, dacă
 * e cazul (migrația 0005 — `expire_if_unconfirmed`, per rând, nu sweep în
 * bloc). Până la 25-30 de instanțe se pot trezi în aceeași secundă; fiecare
 * care chiar tocmai a devenit no_show emite `workshop/seat_freed` — funcția
 * care le primește (`seat-freed.ts`) le coalesează cu `debounce` + `singleton`
 * (B1), exact ca la anulările individuale.
 */

import { inngest, evtRegistered, evtSeatFreed, EVENT_SLUG } from '../client';
import { PROGRAM } from '../schedule';
import { trimiteEmail } from '../../lib/resend';
import {
  email1Confirmare,
  email2Reconfirmare,
  email3NeVedemAzi,
  email4CheckIn,
} from '../../emails/templates';
import { getRegistrationStatus, expireIfUnconfirmed, markWelcomeSent } from '../../lib/supabase';
import { genereazaIcs } from '../../lib/ics';
import { PUBLIC_SITE_URL } from 'astro:env/client';

function linkRaspuns(token: string, raspuns: 'da' | 'nu'): string {
  return `${PUBLIC_SITE_URL}/raspuns?token=${token}&r=${raspuns}`;
}

export const registered = inngest.createFunction(
  {
    id: 'workshop-registered',
    triggers: [{ event: evtRegistered }],
    retries: 4,
  },
  async ({ event, step }) => {
    const { registration_id, email, nume, confirm_token, checkin_token } = event.data;
    const linkAnulare = linkRaspuns(confirm_token, 'nu');

    /* ── Email 1 — imediat, fără condiție de stare ─────────────────────── */

    await step.run('email-1-confirmare', async () => {
      // Calendarul e CTA-ul principal; anularea rămâne, ca buton secundar,
      // mai jos — vezi D101/D101b în DECIZII.md.
      const tmpl = email1Confirmare({
        nume,
        linkCalendar: `${PUBLIC_SITE_URL}/eveniment.ics`,
        linkAnulare,
      });
      await trimiteEmail({ idempotencyKey: `email1/${registration_id}`, to: email, ...tmpl });
    });
    await step.run('marcheaza-welcome-trimis', () => markWelcomeSent(registration_id));

    /* ── Somn 1: până la reconfirmare (14 sept, 09:00) ─────────────────── */

    await step.sleepUntil('asteapta-reconfirmare', PROGRAM.RECONFIRMARE_TRIMISA);

    const stareInainteEmail2 = await step.run('citeste-stare-inainte-email2', () =>
      getRegistrationStatus(registration_id),
    );

    if (stareInainteEmail2?.status === 'inscris') {
      await step.run('email-2-reconfirmare', async () => {
        const tmpl = email2Reconfirmare({
          nume,
          linkConfirmare: linkRaspuns(confirm_token, 'da'),
          linkAnulare,
        });
        await trimiteEmail({ idempotencyKey: `email2/${registration_id}`, to: email, ...tmpl });
      });
    }
    // altă stare (anulat prin email 1) → email 2 nu se trimite, tăcut.

    /* ── Somn 2: până la cutoff (16 sept, 11:00) ───────────────────────── */

    await step.sleepUntil('asteapta-cutoff', PROGRAM.CUTOFF_RECONFIRMARE);

    const stareLaCutoff = await step.run('citeste-stare-la-cutoff', () =>
      getRegistrationStatus(registration_id),
    );

    if (stareLaCutoff?.status === 'reconfirmat') {
      await step.run('email-3-ne-vedem-azi', async () => {
        const tmpl = email3NeVedemAzi({ nume, linkAnulare });
        // .ics generat AICI, în interiorul step.run: Inngest memorează
        // rezultatul, deci `new Date()` folosit de genereazaIcs e sigur —
        // nu se reevaluează la reluare.
        const ics = genereazaIcs(new Date());
        await trimiteEmail({
          idempotencyKey: `email3/${registration_id}`,
          to: email,
          ...tmpl,
          attachments: [{ filename: 'eveniment.ics', content: ics, contentType: 'text/calendar' }],
        });
      });
    } else if (stareLaCutoff?.status === 'inscris') {
      const tocmaiSchimbat = await step.run('marcheaza-no-show', () =>
        expireIfUnconfirmed(registration_id),
      );
      if (tocmaiSchimbat) {
        await step.sendEvent(
          'emite-seat-freed-cutoff',
          evtSeatFreed.create({ event_slug: EVENT_SLUG }, { id: `seatfreed-cutoff-${registration_id}` }),
        );
      }
    }
    // `anulat` — locul a fost deja eliberat la momentul anulării, prin
    // /api/raspuns; nimic de făcut aici.

    /* ── Somn 3: până la trimiterea linkului de check-in (16 sept, 13:30) ── */

    await step.sleepUntil('asteapta-checkin-send', PROGRAM.CHECKIN_TRIMIS);

    const stareLaCheckin = await step.run('citeste-stare-la-checkin', () =>
      getRegistrationStatus(registration_id),
    );

    if (stareLaCheckin?.status === 'reconfirmat') {
      await step.run('email-4-checkin', async () => {
        const tmpl = email4CheckIn({
          nume,
          linkCheckin: `${PUBLIC_SITE_URL}/checkin?token=${checkin_token}`,
        });
        await trimiteEmail({ idempotencyKey: `email4/${registration_id}`, to: email, ...tmpl });
      });
    }
    // no_show / anulat / prezent (walk-in devreme, teoretic) → nimic.
  },
);
