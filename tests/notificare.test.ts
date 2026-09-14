/**
 * Notificarea către organizator (cerută 2026-09-11).
 *
 * Testabilă direct, ca `templates.ts`: compunerea e pură — nu atinge
 * `astro:env`, Resend sau Supabase. Trimiterea (care le atinge) stă separat,
 * în `src/lib/notificare.ts`.
 */

import { describe, it, expect } from 'vitest';
import { emailNotificareInscriere } from '../src/emails/notificare';

const DIANA = {
  nume: 'Diana Sorian',
  email: 'sorian_diana@yahoo.com',
  firma_rol: 'ESSENTOPIA',
  status: 'inscris' as const,
  sursa: 'Sunt membru BIZZ.CLUB Satu Mare',
  sursa_detaliu: null,
  nivel_ai: 'Zilnic, e parte din cum lucrez',
  proces: 'Ofertele și postările online',
  qualification_answers: {
    asteptari: ['Să înțeleg ce poate AI-ul', 'Să văd un sistem care funcționează'],
    frica_principala: 'Că datele firmei ajung unde nu trebuie',
    provocare_business: ['Ofertele și devizele'],
    blocaj_istoric: ['N-am avut timp'],
    interes_incompany: 'Nu e cazul',
    provocare_business_altceva: null,
  },
  vrea_discutie: true,
  creat: '2026-09-14T10:27:00+03:00',
};

describe('notificarea conține ce trebuie ca să pregătești workshopul', () => {
  it('subiectul spune cine și de la ce firmă', () => {
    const e = emailNotificareInscriere(DIANA);
    expect(e.subject).toBe('Înscriere nouă: Diana Sorian (ESSENTOPIA)');
  });

  it('distinge lista de așteptare de înscrierea normală', () => {
    const peLista = emailNotificareInscriere({ ...DIANA, status: 'asteptare' });
    expect(peLista.subject).toMatch(/^Listă de așteptare:/);
    expect(peLista.text).toContain('LISTĂ DE AȘTEPTARE');
  });

  it('include răspunsurile de calificare, nu doar numele — ele sunt partea utilă', () => {
    const e = emailNotificareInscriere(DIANA);
    expect(e.text).toContain('Să înțeleg ce poate AI-ul');
    expect(e.text).toContain('Că datele firmei ajung unde nu trebuie');
    expect(e.text).toContain('Ofertele și postările online');
    expect(e.text).toContain('Zilnic, e parte din cum lucrez');
  });

  it('semnalează explicit cine vrea discuție separată', () => {
    expect(emailNotificareInscriere(DIANA).text).toMatch(/te caută pe tine/);
    expect(emailNotificareInscriere({ ...DIANA, vrea_discutie: false }).text).toMatch(
      /Vrea discuție separată\s+nu/,
    );
  });

  it('câmpurile goale nu apar ca „null" sau „undefined"', () => {
    const gol = emailNotificareInscriere({
      ...DIANA,
      firma_rol: null,
      sursa: null,
      nivel_ai: null,
      proces: null,
      qualification_answers: {},
    });
    expect(gol.text).not.toMatch(/null|undefined/);
    expect(gol.html).not.toMatch(/null|undefined/);
    // Fără firmă, subiectul nu rămâne cu paranteze goale.
    expect(gol.subject).toBe('Înscriere nouă: Diana Sorian');
  });

  it('un nume cu markup nu injectează HTML', () => {
    const e = emailNotificareInscriere({ ...DIANA, nume: '<img src=x onerror=alert(1)>' });
    expect(e.html).not.toContain('<img src=x');
    expect(e.html).toContain('&lt;img');
  });

  it('ora e în fusul evenimentului, nu în UTC', () => {
    // 10:27+03:00 e 07:27 UTC — dacă apare 07, formatarea ignoră fusul.
    const e = emailNotificareInscriere(DIANA);
    expect(e.text).toMatch(/10:27/);
    expect(e.text).not.toMatch(/07:27/);
  });

  it('fără ș/ț cu sedilă — aceeași regulă ca la restul emailurilor', () => {
    const e = emailNotificareInscriere(DIANA);
    expect((e.text + e.subject).match(/[şţŞŢ]/g)).toBeNull();
  });
});
