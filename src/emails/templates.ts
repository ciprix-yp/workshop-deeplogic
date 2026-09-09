/**
 * Cele 7 emailuri — transcrise din `docs/EMAILURI.md`, aprobat de Ciprian pe
 * 28 august 2026. Orice schimbare de text se face ÎNTÂI acolo, apoi aici —
 * documentul e sursa de adevăr pentru copy, la fel ca `src/content/copy.ts`
 * pentru pagină.
 */

import { randeazaText, randeazaHtml } from './render';
import { EVENIMENT } from '../content/copy';

export interface EmailGata {
  subject: string;
  text: string;
  html: string;
}

const ADRESA = `${EVENIMENT.locatie}, ${EVENIMENT.adresa}`;
const SEMNATURA = 'Ciprian Micu - Deep Logic';

/* ── Email 1 — Confirmare imediată ──────────────────────────────────────── */

export function email1Confirmare(p: { nume: string; linkAnulare: string }): EmailGata {
  const continut = {
    salut: p.nume,
    paragrafe: [
      `Ești pe listă. Miercuri, 16 septembrie, 14:00–17:00, la ${ADRESA}.`,
      'Nu trebuie să faci nimic acum. Cu două zile înainte îți scriu din nou, să confirmi că vii — abia atunci contează locul rezervat.',
      'Un singur lucru dacă se schimbă ceva: dacă știi deja acum că nu mai poți veni, spune-mi, ca să dau locul mai departe din timp, nu în ultima clipă.',
    ],
    butoane: [{ text: 'Nu mai pot veni', href: p.linkAnulare }],
    notePicior: ['Ce aduci: un pix. Atât.', `Întrebări? Răspunde direct la mailul ăsta.`],
    semnatura: `Ne vedem miercuri,\n${SEMNATURA}`,
  };
  return {
    // Bug real (2026-09-09): era hardcodat „Prima Mutare spre un Asistent
    // Digital", numele vechi al produsului — vezi nota din render.ts.
    subject: `Ești înscris — ${EVENIMENT.titlu}`,
    text: randeazaText(continut),
    html: randeazaHtml(continut),
  };
}

/* ── Email 2 — Reconfirmare ──────────────────────────────────────────────── */

export function email2Reconfirmare(p: {
  nume: string;
  linkConfirmare: string;
  linkAnulare: string;
}): EmailGata {
  const continut = {
    salut: p.nume,
    paragrafe: [
      'Miercuri e workshopul. Am nevoie să știu sigur cine vine, ca să nu țin locuri goale în timp ce alții așteaptă pe listă.',
      'Răspunde până miercuri, 16 septembrie, ora 11:00 — după ora asta, dacă n-am auzit nimic de la tine, dau locul mai departe.',
    ],
    butoane: [
      { text: 'Confirm că vin', href: p.linkConfirmare },
      { text: 'Nu pot veni', href: p.linkAnulare },
    ],
    notePicior: [
      'Detalii, ca să le ai la îndemână:',
      `Miercuri, 16 septembrie · ${EVENIMENT.ora}`,
      ADRESA,
      '',
      'Dacă ai bifat că vrei o discuție separată, nu ține de mailul ăsta — te caut eu, separat.',
    ],
    semnatura: SEMNATURA,
  };
  return {
    subject: 'Vii miercuri? Am nevoie de un răspuns până la 11:00',
    text: randeazaText(continut),
    html: randeazaHtml(continut),
  };
}

/* ── Email 3 — „Ne vedem azi" ─────────────────────────────────────────────── */

export function email3NeVedemAzi(p: { nume: string; linkAnulare: string }): EmailGata {
  const continut = {
    salut: p.nume,
    paragrafe: [
      `Azi ne vedem. 14:00, ${ADRESA}. Am atașat evenimentul, ca să-l ai direct în calendar.`,
      'Un pix. Atât ai nevoie.',
      'Dacă între timp chiar nu mai poți ajunge, spune-mi acum, nu la ușă — ia altcineva locul.',
    ],
    butoane: [{ text: 'Nu mai pot veni', href: p.linkAnulare }],
    semnatura: `Pe curând,\n${SEMNATURA}`,
  };
  return {
    subject: 'Azi, 14:00 — Casa Dăinuirii',
    text: randeazaText(continut),
    html: randeazaHtml(continut),
  };
}

/* ── Email 4 — Link de check-in ──────────────────────────────────────────── */

export function email4CheckIn(p: { nume: string; linkCheckin: string }): EmailGata {
  const continut = {
    salut: p.nume,
    paragrafe: [
      'Peste puțin timp începem. Când ajungi, apasă linkul de mai jos — te bifez pe listă și gata, nu mai pierdem timp la intrare.',
    ],
    butoane: [{ text: 'Sunt aici', href: p.linkCheckin }],
    notePicior: ['Dacă nu apuci să-l apeși, nicio problemă — te bifez oricum la intrare.'],
    semnatura: `Ne vedem imediat,\n${SEMNATURA}`,
  };
  return {
    subject: 'Te aștept — check-in rapid la sosire',
    text: randeazaText(continut),
    html: randeazaHtml(continut),
  };
}

/* ── Email 5 — Ai intrat pe lista de așteptare ───────────────────────────── */

export function email5Waitlisted(p: { nume: string }): EmailGata {
  const continut = {
    salut: p.nume,
    paragrafe: [
      `Cele ${EVENIMENT.capacitate} de locuri sunt ocupate. Te-am trecut pe lista de așteptare.`,
      'Aproape mereu se eliberează locuri — oameni care anunță că nu mai pot veni. Când se întâmplă, primești imediat un mail, împreună cu toți ceilalți de pe listă. Primul care confirmă îl ia.',
      'Nu trebuie să faci nimic acum. Dacă se eliberează un loc, afli direct de la mine.',
    ],
    semnatura: SEMNATURA,
  };
  return {
    subject: `Ești pe lista de așteptare — ${EVENIMENT.titlu}`,
    text: randeazaText(continut),
    html: randeazaHtml(continut),
  };
}

/* ── Email 6 — S-a eliberat un loc (B1: plural corect) ───────────────────── */

export function email6SeatFreed(p: { nume: string; numarLocuri: number; linkRevendicare: string }): EmailGata {
  const mesajLocuri =
    p.numarLocuri === 1 ? 'S-a eliberat un loc.' : `S-au eliberat ${p.numarLocuri} locuri.`;
  const continut = {
    salut: p.nume,
    paragrafe: [
      mesajLocuri,
      'Dacă vrei să vii, apasă acum — primul care confirmă îl ia. Dacă ajungi al doilea, rămâi pe listă și te anunț din nou dacă se mai eliberează ceva.',
    ],
    butoane: [{ text: 'Confirm că vin', href: p.linkRevendicare }],
    semnatura: SEMNATURA,
  };
  return {
    subject: 'S-a eliberat un loc — primul care confirmă îl ia',
    text: randeazaText(continut),
    html: randeazaHtml(continut),
  };
}

/* ── Email 7 — Rămași pe listă la final ──────────────────────────────────── */

export function email7Leftover(p: { nume: string }): EmailGata {
  const continut = {
    salut: p.nume,
    paragrafe: [
      'N-am reușit să-ți fac loc la workshopul de miercuri — n-a plecat nimeni de pe listă la timp cât să-ți pot da vestea bună.',
      'Dacă mai organizez un workshop similar, ești primul anunțat, înainte de lansarea oficială — și ai prioritate la înscriere, nu mai treci prin coadă.',
      'Îmi pare rău că nu s-a potrivit de data asta.',
    ],
    semnatura: SEMNATURA,
  };
  return {
    subject: 'N-a fost loc de data asta',
    text: randeazaText(continut),
    html: randeazaHtml(continut),
  };
}

/* ── Email 8 — Retenție date, la 1 an (aprobat 28 august 2026) ───────────────
 * Vezi docs/EMAILURI.md § Email 8. `FEREASTRA_RASPUNS_RETENTIE_ZILE` e
 * literal în text, nu citit din SQL: dacă `purge_expired_retention()`
 * (migrația 0006) își schimbă DEFAULT-ul, editează manual și aici.
 * ──────────────────────────────────────────────────────────────────────────── */

const FEREASTRA_RASPUNS_RETENTIE_ZILE = 30;

export function email8RetentieDate(p: { nume: string; linkReconfirmare: string }): EmailGata {
  const continut = {
    salut: p.nume,
    paragrafe: [
      'A trecut un an de când mi-ai lăsat datele de contact, la înscrierea la un eveniment Deep Logic. Le păstrez maximum un an, apoi le șterg — așa am promis în politica de confidențialitate.',
      'Dacă vrei să le păstrez în continuare, apasă linkul de mai jos.',
    ],
    butoane: [{ text: 'Păstrează-mi datele', href: p.linkReconfirmare }],
    notePicior: [
      `Dacă nu răspunzi în ${FEREASTRA_RASPUNS_RETENTIE_ZILE} de zile, le șterg automat din bază — nu trebuie să faci nimic ca să se întâmple asta.`,
    ],
    semnatura: SEMNATURA,
  };
  return {
    subject: 'Vrei să-ți păstrez datele de contact?',
    text: randeazaText(continut),
    html: randeazaHtml(continut),
  };
}
