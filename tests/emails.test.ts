/**
 * Cele 7 emailuri — pure, fără `astro:env` (secretele intră doar în
 * src/lib/resend.ts, nu aici), deci testabile direct.
 *
 * Verifică două lucruri: că transcrierea din docs/EMAILURI.md în cod e
 * fidelă (subiectele, textul aprobat), și că regulile de pe pagină se aplică
 * și aici — un email care minte e la fel de grav ca o secțiune de pe pagină
 * care minte.
 */

import { describe, it, expect } from 'vitest';
import {
  email1Confirmare,
  email2Reconfirmare,
  email3NeVedemAzi,
  email4CheckIn,
  email5Waitlisted,
  email6SeatFreed,
  email7Leftover,
  email8RetentieDate,
} from '../src/emails/templates';

const P = {
  nume: 'Ion Popescu',
  linkAnulare: 'https://workshop.deeplogic.ro/raspuns?token=abc&r=nu',
  linkConfirmare: 'https://workshop.deeplogic.ro/raspuns?token=abc&r=da',
  linkCheckin: 'https://workshop.deeplogic.ro/checkin?token=xyz',
  linkRevendicare: 'https://workshop.deeplogic.ro/raspuns?token=abc&r=da',
};

const TOATE = [
  email1Confirmare({ nume: P.nume, linkAnulare: P.linkAnulare }),
  email2Reconfirmare({ nume: P.nume, linkConfirmare: P.linkConfirmare, linkAnulare: P.linkAnulare }),
  email3NeVedemAzi({ nume: P.nume, linkAnulare: P.linkAnulare }),
  email4CheckIn({ nume: P.nume, linkCheckin: P.linkCheckin }),
  email5Waitlisted({ nume: P.nume }),
  email6SeatFreed({ nume: P.nume, numarLocuri: 1, linkRevendicare: P.linkRevendicare }),
  email7Leftover({ nume: P.nume }),
];

describe('toate cele 7 emailuri se randează complet', () => {
  it.each(TOATE.map((e, i) => [i + 1, e] as const))('email %i are subject/text/html nevide', (_, e) => {
    expect(e.subject.length).toBeGreaterThan(5);
    expect(e.text.length).toBeGreaterThan(20);
    expect(e.html).toContain('<!doctype html>');
  });
});

describe('subiectele — fidele față de docs/EMAILURI.md, aprobat 28 august', () => {
  it.each([
    [email1Confirmare({ nume: P.nume, linkAnulare: P.linkAnulare }), 'Ești înscris — Prima Mutare spre un Asistent Digital'],
    [
      email2Reconfirmare({ nume: P.nume, linkConfirmare: P.linkConfirmare, linkAnulare: P.linkAnulare }),
      'Vii miercuri? Am nevoie de un răspuns până la 11:00',
    ],
    [email3NeVedemAzi({ nume: P.nume, linkAnulare: P.linkAnulare }), 'Azi, 14:00 — Casa Dăinuirii'],
    [email4CheckIn({ nume: P.nume, linkCheckin: P.linkCheckin }), 'Te aștept — check-in rapid la sosire'],
    [email5Waitlisted({ nume: P.nume }), 'Ești pe lista de așteptare — Prima Mutare spre un Asistent Digital'],
    [
      email6SeatFreed({ nume: P.nume, numarLocuri: 1, linkRevendicare: P.linkRevendicare }),
      'S-a eliberat un loc — primul care confirmă îl ia',
    ],
    [email7Leftover({ nume: P.nume }), 'N-a fost loc de data asta'],
  ])('subiect corect: %#', (email, asteptat) => {
    expect(email.subject).toBe(asteptat);
  });
});

describe('B1 — pluralul din email 6, nu „un loc" mereu', () => {
  it('1 loc → singular', () => {
    const e = email6SeatFreed({ nume: P.nume, numarLocuri: 1, linkRevendicare: P.linkRevendicare });
    expect(e.text).toContain('S-a eliberat un loc.');
    expect(e.text).not.toContain('S-au eliberat');
  });

  it('N locuri → plural, cu cifra', () => {
    const e = email6SeatFreed({ nume: P.nume, numarLocuri: 4, linkRevendicare: P.linkRevendicare });
    expect(e.text).toContain('S-au eliberat 4 locuri.');
    expect(e.text).not.toContain('S-a eliberat un loc');
  });
});

describe('linkurile ajung acolo unde trebuie', () => {
  it('email 1 conține linkul de anulare (B3)', () => {
    const e = email1Confirmare({ nume: P.nume, linkAnulare: P.linkAnulare });
    expect(e.text).toContain(P.linkAnulare);
    expect(e.html).toContain(P.linkAnulare);
  });

  it('email 3 păstrează calea de anulare și după reconfirmare', () => {
    const e = email3NeVedemAzi({ nume: P.nume, linkAnulare: P.linkAnulare });
    expect(e.text).toContain(P.linkAnulare);
  });

  it('email 2 are ambele butoane, confirmare și anulare', () => {
    const e = email2Reconfirmare({ nume: P.nume, linkConfirmare: P.linkConfirmare, linkAnulare: P.linkAnulare });
    expect(e.text).toContain(P.linkConfirmare);
    expect(e.text).toContain(P.linkAnulare);
  });
});

describe('securitate — HTML din numele participantului e scăpat', () => {
  it('un nume cu markup nu injectează HTML în email', () => {
    const numeRauVoitor = '<img src=x onerror=alert(1)>';
    const e = email1Confirmare({ nume: numeRauVoitor, linkAnulare: P.linkAnulare });
    expect(e.html).not.toContain('<img src=x onerror=alert(1)>');
    expect(e.html).toContain('&lt;img');
  });

  it('& și " din nume nu rup atributele HTML', () => {
    const e = email1Confirmare({ nume: 'Ion & "Fiul" SRL', linkAnulare: P.linkAnulare });
    expect(e.html).toContain('&amp;');
    expect(e.html).toContain('&quot;');
  });
});

describe('semnătura — „Ciprian Micu - Deep Logic" peste tot, cratimă simplă', () => {
  it.each(TOATE.map((e, i) => [i + 1, e] as const))('email %i', (_, e) => {
    expect(e.text).toContain('Ciprian Micu - Deep Logic');
    expect(e.text).not.toContain('Ciprian Micu ·'); // varianta respinsă
  });
});

describe('subsolul comun apare pe toate cele 7', () => {
  it.each(TOATE.map((e, i) => [i + 1, e] as const))('email %i', (_, e) => {
    expect(e.text).toContain('Deep Logic · Satu Mare, România');
    expect(e.text).toMatch(/te-ai înscris la „Prima Mutare/);
  });
});

describe('invarianți de copy — aceleași reguli ca pagina', () => {
  const totText = TOATE.map((e) => e.subject + '\n' + e.text).join('\n');

  it('fără preț sau ancoră de preț', () => {
    expect(totText).not.toMatch(/\blei\b/i);
    expect(totText).not.toMatch(/\beuro?\b/i);
    expect(totText).not.toMatch(/€|\$/);
  });

  it('fără urgență fabricată dincolo de deadline-ul real', () => {
    expect(totText).not.toMatch(/ultima șansă/i);
    expect(totText).not.toMatch(/grăbește-te/i);
    expect(totText).not.toMatch(/ofertă limitată/i);
  });

  it('fără cifre de piață sau procente', () => {
    expect(totText).not.toMatch(/\d+\s*%/);
  });

  it('email 7 e condițional — „dacă mai organizez", nu afirmativ', () => {
    const e7 = email7Leftover({ nume: P.nume });
    expect(e7.text).toMatch(/dacă mai organizez/i);
    expect(e7.text).not.toMatch(/^mai organizez/im);
  });

  it('email 5 nu conține poziție pe listă (decizie 28 august — nu e FIFO)', () => {
    const e5 = email5Waitlisted({ nume: P.nume });
    expect(e5.text).not.toMatch(/\d+\s*(persoane|locuri)?\s*înaintea ta/i);
  });
});

describe('diacritice — virgulă, nu sedilă', () => {
  it('niciun email nu conține ş/ţ cu sedilă', () => {
    for (const e of TOATE) {
      expect(e.text.match(/[şţŞŢ]/g), `în: ${e.subject}`).toBeNull();
    }
  });
});

/* ── Email 8 — aprobat 28 august 2026, testat separat de cele 7 ──────────
 * Deliberat NEinclus în `TOATE`: acel array e folosit peste tot mai sus ca
 * „cele 7", inclusiv în titluri de describe() — amestecarea lui acolo ar
 * cere redenumit șase blocuri de test pentru zero câștig de acoperire, de
 * vreme ce are deja propriul set complet de asertiuni mai jos.
 * ──────────────────────────────────────────────────────────────────────── */

describe('email 8 — retenție date la 1 an', () => {
  const linkReconfirmare = 'https://workshop.deeplogic.ro/pastreaza-datele?token=abc';
  const e8 = email8RetentieDate({ nume: P.nume, linkReconfirmare });

  it('se randează complet', () => {
    expect(e8.subject.length).toBeGreaterThan(5);
    expect(e8.text.length).toBeGreaterThan(20);
    expect(e8.html).toContain('<!doctype html>');
  });

  it('subiect fără cuvinte care declanșează filtre de spam', () => {
    expect(e8.subject).toBe('Vrei să-ți păstrez datele de contact?');
    expect(e8.subject).not.toMatch(/urgent|gratuit|garantat|!|\$/i);
  });

  it('conține linkul de reconfirmare și fereastra de răspuns', () => {
    expect(e8.text).toContain(linkReconfirmare);
    expect(e8.text).toMatch(/30 de zile/);
  });

  it('semnătura și subsolul comun — aceleași ca la cele 7 aprobate', () => {
    expect(e8.text).toContain('Ciprian Micu - Deep Logic');
    expect(e8.text).toContain('Deep Logic · Satu Mare, România');
  });

  it('HTML din nume e scăpat, la fel ca la celelalte 7', () => {
    const rauVoitor = email8RetentieDate({ nume: '<img src=x onerror=alert(1)>', linkReconfirmare });
    expect(rauVoitor.html).not.toContain('<img src=x onerror=alert(1)>');
  });

  it('fără preț, urgență fabricată sau cifre de piață — aceleași invarianți ca pagina', () => {
    const tot = e8.subject + '\n' + e8.text;
    expect(tot).not.toMatch(/\blei\b/i);
    expect(tot).not.toMatch(/€|\$/);
    expect(tot).not.toMatch(/ultima șansă|grăbește-te/i);
  });

  it('fără ş/ţ cu sedilă', () => {
    expect(e8.text.match(/[şţŞŢ]/g)).toBeNull();
  });
});
