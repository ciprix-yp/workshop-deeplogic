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
import { PROGRAM, fereastraInscrierii } from '../schedule';
import { trimiteEmail } from '../../lib/resend';
import {
  email1Confirmare,
  email2Reconfirmare,
  email3NeVedemAzi,
  email4CheckIn,
} from '../../emails/templates';
import {
  getRegistrationStatus,
  expireIfUnconfirmed,
  markWelcomeSent,
  respondToInvite,
} from '../../lib/supabase';
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
    const linkCalendar = `${PUBLIC_SITE_URL}/eveniment.ics`;

    /* ── În ce fereastră a picat înscrierea (B-3, fix 2026-09-10) ────────
     *
     * Memoizat în `step.run`: la o reluare, Inngest întoarce rezultatul
     * înregistrat, nu reevaluează ceasul. Fără asta, o reluare de peste
     * cutoff ar putea reclasifica aceeași înscriere pe altă cale.
     */

    const moment = await step.run('clasifica-momentul', () => {
      const acum = new Date();
      return {
        fereastra: fereastraInscrierii(acum),
        inainteDeCheckin: acum.getTime() < Date.parse(PROGRAM.CHECKIN_TRIMIS),
      };
    });

    /* ── Evenimentul s-a terminat ─────────────────────────────────────────
     * Nu trimitem nimic: orice email din ciclu ar minți despre un eveniment
     * care a trecut. Rândul rămâne în bază, `welcome_sent_at` NEmarcat, deci
     * reconcilierea B11 îl vede ca pe un om care n-a primit nimic — corect,
     * fiindcă asta e situația reală, și cere o decizie umană, nu un email
     * automat.
     */
    if (moment.fereastra === 'dupa_eveniment') {
      return { fereastra: moment.fereastra, trimise: 0, motiv: 'eveniment încheiat' };
    }

    /* ── Calea same-day (după cutoff-ul de 11:00, în ziua evenimentului) ──
     *
     * Un singur email, cu detaliile practice și `.ics`-ul atașat. Fără
     * cerere de reconfirmare (deadline-ul e deja trecut), fără marcare
     * automată ca `no_show`, fără difuzarea propriului loc pe waitlist —
     * cascada pe care B-3 a găsit-o.
     *
     * Marcat `reconfirmat`: cine se înscrie în ziua evenimentului a confirmat
     * prin însuși actul înscrierii. Contează și pentru lista de la ușă.
     */
    if (moment.fereastra === 'same_day') {
      await step.run('email-3-same-day', async () => {
        const tmpl = email3NeVedemAzi({ nume, linkAnulare });
        const ics = genereazaIcs(new Date());
        await trimiteEmail({
          idempotencyKey: `email3/${registration_id}`,
          to: email,
          ...tmpl,
          attachments: [{ filename: 'eveniment.ics', content: ics, contentType: 'text/calendar' }],
        });
      });
      await step.run('marcheaza-welcome-trimis', async () => {
        // Vezi nota de pe același pas din calea normală, mai jos: eșecul lasă
        // rândul pe seama reconcilierii B11, nu oprește lanțul.
        try {
          await markWelcomeSent(registration_id);
          return 'marcat';
        } catch (eroare) {
          console.error(`markWelcomeSent a eșuat pentru ${registration_id}:`, eroare);
          return 'nemarcat — preluat de reconcilierea B11';
        }
      });
      await step.run('marcheaza-reconfirmat-same-day', async () => {
        // Doar din `inscris`. Dacă a anulat între timp, `respondToInvite` ar
        // intra pe calea de revenire (cu poartă de capacitate) și l-ar
        // reînvia — exact ce nu vrem.
        const stare = await getRegistrationStatus(registration_id);
        if (stare?.status !== 'inscris') return 'sărit';
        return respondToInvite(confirm_token, true);
      });

      if (!moment.inainteDeCheckin) {
        return { fereastra: moment.fereastra, trimise: 1, motiv: 'după ora de check-in' };
      }

      await step.sleepUntil('asteapta-checkin-same-day', PROGRAM.CHECKIN_TRIMIS);
      const stareCheckin = await step.run('citeste-stare-checkin-same-day', () =>
        getRegistrationStatus(registration_id),
      );
      if (stareCheckin?.status === 'reconfirmat') {
        await step.run('email-4-checkin', async () => {
          const tmpl = email4CheckIn({
            nume,
            linkCheckin: `${PUBLIC_SITE_URL}/checkin?token=${checkin_token}`,
          });
          await trimiteEmail({ idempotencyKey: `email4/${registration_id}`, to: email, ...tmpl });
        });
      }
      return { fereastra: moment.fereastra, trimise: 2 };
    }

    /* ── Email 1 — imediat, fără condiție de stare ─────────────────────── */

    await step.run('email-1-confirmare', async () => {
      // Calendarul e CTA-ul principal; anularea rămâne, ca buton secundar,
      // mai jos — vezi D101/D101c în DECIZII.md.
      //
      // `cereReconfirmare: false` în fereastra `tarziu`: acolo marcăm
      // `reconfirmat` imediat, deci nu mai vine niciun email 2, deci subsolul
      // n-are voie să promită unul.
      const tmpl = email1Confirmare({
        nume,
        linkCalendar,
        linkAnulare,
        cereReconfirmare: moment.fereastra === 'normala',
      });
      await trimiteEmail({ idempotencyKey: `email1/${registration_id}`, to: email, ...tmpl });
    });
    await step.run('marcheaza-welcome-trimis', async () => {
      // Eșecul NU oprește lanțul (I-2, fix 2026-09-10). Înainte, un `markWelcomeSent`
      // care pica persistent epuiza cele 4 reîncercări și oprea TOATĂ rularea:
      // emailurile 2/3/4 nu mai plecau, omul nu era nici reconfirmat nici marcat
      // `no_show`, iar locul rămânea ocupat fără curățare. Acum eșecul lasă
      // `welcome_sent_at` NULL, deci reconcilierea B11 îl vede și re-emite —
      // idempotent prin D16, deci fără email dublu.
      try {
        await markWelcomeSent(registration_id);
        return 'marcat';
      } catch (eroare) {
        console.error(`markWelcomeSent a eșuat pentru ${registration_id}:`, eroare);
        return 'nemarcat — preluat de reconcilierea B11';
      }
    });

    /* ── Fereastra `tarziu`: înscrierea ÎNSĂȘI e confirmarea ─────────────
     *
     * Reconfirmarea a fost deja cerută tuturor celorlalți (14 sep, 09:00).
     * Un email 2 ar sosi la secundă distanță de emailul 1 și ar cere unui om
     * să confirme ceva ce tocmai a făcut. Îl marcăm direct, iar la cutoff
     * intră pe ramura corectă și primește emailul 3 („Azi ne vedem").
     */
    if (moment.fereastra === 'tarziu') {
      await step.run('marcheaza-reconfirmat-tarziu', async () => {
        const stare = await getRegistrationStatus(registration_id);
        if (stare?.status !== 'inscris') return 'sărit';
        return respondToInvite(confirm_token, true);
      });
    } else {
      /* ── Somn 1: până la reconfirmare (14 sept, 09:00) ───────────────── */

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
    }

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
