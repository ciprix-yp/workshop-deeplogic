/**
 * Validarea formularului — pură, fără `astro:env`, deci testabilă direct.
 *
 * Verificarea end-to-end prin `/api/register` (rulată manual împotriva
 * Supabase real) a confirmat cazurile fericite. Aici acoperim marginile:
 * ce respinge schema și de ce, plus coerciția FormData → obiect.
 */

import { describe, it, expect } from 'vitest';
import { inscriereSchema, formDataInSchema, LIMITE } from '../src/content/form-schema';

function formCompletValid(): FormData {
  const fd = new FormData();
  fd.set('nume', 'Ion Popescu');
  fd.set('email', 'ion@exemplu.ro');
  fd.set('firma_rol', 'Firma SRL, administrator');
  fd.set('sursa', 'Sunt membru DRW');
  fd.set('proces', 'Fac ofertele de mână, fiecare îmi ia 40 de minute.');
  fd.set('nivel_ai', 'Din când în când');
  fd.append('asteptari', 'Să știu de unde încep în firma mea');
  fd.set('frica_principala', 'Că nu știu dacă e momentul potrivit');
  fd.append('provocare_business', 'Vânzarea — nu ajung la destui oameni potriviți');
  fd.append('blocaj_istoric', 'N-am știut de unde să încep');
  fd.set('interes_incompany', 'Poate — vreau întâi să văd formatul pe 16');
  fd.set('consimtamant_comunicare', 'true');
  fd.set('cf-turnstile-response', 'token-fals-pentru-test');
  return fd;
}

describe('un formular complet și valid trece', () => {
  it('parsează fără erori', () => {
    const rezultat = inscriereSchema.safeParse(formDataInSchema(formCompletValid()));
    expect(rezultat.success).toBe(true);
  });

  it('normalizează email-ul la lowercase', () => {
    const fd = formCompletValid();
    fd.set('email', 'ION@EXEMPLU.RO');
    const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
    expect(rezultat.success).toBe(true);
    if (rezultat.success) expect(rezultat.data.email).toBe('ion@exemplu.ro');
  });
});

describe('bifa de consimțământ', () => {
  it('lipsă din FormData (nebifată) → respinsă, nu „undefined" tăcut', () => {
    const fd = formCompletValid();
    fd.delete('consimtamant_comunicare');
    const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
    expect(rezultat.success).toBe(false);
    if (!rezultat.success) {
      const eroare = rezultat.error.issues.find((i) => i.path[0] === 'consimtamant_comunicare');
      expect(eroare?.message).toMatch(/singura obligatorie/);
    }
  });

  it('bifa opțională "vrea_discutie" lipsă → implicit false, nu eroare', () => {
    const fd = formCompletValid();
    // Nu setăm vrea_discutie deloc — simulează un checkbox nebifat.
    const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
    expect(rezultat.success).toBe(true);
    if (rezultat.success) expect(rezultat.data.vrea_discutie).toBe(false);
  });
});

describe('câmpul „proces" — prag minim de sens', () => {
  it(`respinge sub ${LIMITE.procesMin} caractere`, () => {
    const fd = formCompletValid();
    fd.set('proces', 'x'.repeat(LIMITE.procesMin - 1));
    const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
    expect(rezultat.success).toBe(false);
  });

  it('„." sau text fără sens nu trece — exact defectul B17', () => {
    const fd = formCompletValid();
    fd.set('proces', '.');
    const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
    expect(rezultat.success).toBe(false);
  });

  it(`acceptă exact ${LIMITE.procesMin} caractere`, () => {
    const fd = formCompletValid();
    fd.set('proces', 'x'.repeat(LIMITE.procesMin));
    const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
    expect(rezultat.success).toBe(true);
  });
});

describe('sursa condiționată — câmpul „De la cine?" / „Cum ai aflat?"', () => {
  it('„Am primit invitația..." fără detaliu → respins', () => {
    const fd = formCompletValid();
    fd.set('sursa', 'Am primit invitația de la un membru BIZZ.CLUB');
    const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
    expect(rezultat.success).toBe(false);
    if (!rezultat.success) {
      expect(rezultat.error.issues.some((i) => i.path[0] === 'sursa_detaliu')).toBe(true);
    }
  });

  it('„Am primit invitația..." cu detaliu → trece', () => {
    const fd = formCompletValid();
    fd.set('sursa', 'Am primit invitația de la un membru BIZZ.CLUB');
    fd.set('sursa_detaliu', 'Andrei');
    const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
    expect(rezultat.success).toBe(true);
  });

  it('„Sunt membru DRW" nu cere detaliu', () => {
    const fd = formCompletValid();
    fd.set('sursa', 'Sunt membru DRW');
    fd.delete('sursa_detaliu');
    const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
    expect(rezultat.success).toBe(true);
  });

  it('detaliu trimis pentru o sursă care nu-l cere → ignorat, nu respins', () => {
    const fd = formCompletValid();
    fd.set('sursa', 'Sunt membru DRW');
    fd.set('sursa_detaliu', 'text irelevant, JS dezactivat ar putea trimite asta oricum');
    const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
    expect(rezultat.success).toBe(true);
  });
});

describe('email invalid', () => {
  it.each(['nu-e-email', 'fara-domeniu@', '@fara-user.ro', ''])('respinge „%s"', (email) => {
    const fd = formCompletValid();
    fd.set('email', email);
    const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
    expect(rezultat.success).toBe(false);
  });
});

describe('câmpuri de calificare — formular-calificare-workshop.md', () => {
  it('o valoare care nu există în ASTEPTARI e respinsă', () => {
    const fd = formCompletValid();
    fd.delete('asteptari');
    fd.append('asteptari', 'O opțiune inventată de mine');
    const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
    expect(rezultat.success).toBe(false);
  });

  it('toate cele 5 întrebări sunt obligatorii', () => {
    for (const camp of ['asteptari', 'frica_principala', 'provocare_business', 'blocaj_istoric', 'interes_incompany']) {
      const fd = formCompletValid();
      fd.delete(camp);
      const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
      expect(rezultat.success, `${camp} lipsă ar trebui să respingă`).toBe(false);
    }
  });

  describe('Q1 (asteptari) și Q3 (provocare_business) — checkbox, max 2', () => {
    it('respinge 3 bife pe asteptari', () => {
      const fd = formCompletValid();
      fd.delete('asteptari');
      fd.append('asteptari', 'Să știu de unde încep în firma mea');
      fd.append('asteptari', 'Să știu ce riscuri îmi asum dacă încep');
      fd.append('asteptari', 'Să pot da direcție echipei mele pentru implementare');
      const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
      expect(rezultat.success).toBe(false);
      if (!rezultat.success) {
        const eroare = rezultat.error.issues.find((i) => i.path[0] === 'asteptari');
        expect(eroare?.message).toMatch(/Alege doar 2/);
      }
    });

    it('acceptă exact 2 bife pe provocare_business', () => {
      const fd = formCompletValid();
      fd.delete('provocare_business');
      fd.append('provocare_business', 'Ofertele și devizele — durează prea mult, se fac manual');
      fd.append('provocare_business', 'Vânzarea — nu ajung la destui oameni potriviți');
      const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
      expect(rezultat.success).toBe(true);
    });
  });

  describe('Q3 — „Altceva:" condiționează un detaliu, ca „sursa"', () => {
    it('„Altceva:" bifat fără detaliu → respins', () => {
      const fd = formCompletValid();
      fd.delete('provocare_business');
      fd.append('provocare_business', 'Altceva:');
      const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
      expect(rezultat.success).toBe(false);
      if (!rezultat.success) {
        expect(rezultat.error.issues.some((i) => i.path[0] === 'provocare_business_altceva')).toBe(true);
      }
    });

    it('„Altceva:" bifat cu detaliu → trece', () => {
      const fd = formCompletValid();
      fd.delete('provocare_business');
      fd.append('provocare_business', 'Altceva:');
      fd.set('provocare_business_altceva', 'Programarea la cabinet');
      const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
      expect(rezultat.success).toBe(true);
    });
  });

  describe('Q4 (blocaj_istoric) — checkbox, fără limită maximă', () => {
    it('acceptă toate cele 6 opțiuni bifate deodată', () => {
      const fd = formCompletValid();
      fd.delete('blocaj_istoric');
      for (const op of [
        'N-am știut de unde să încep',
        'N-am avut cu cine să vorbesc — pe cineva care înțelege și afacerea, nu doar tehnologia',
        'Am crezut că e pentru firme mai mari decât a mea',
        'Am încercat și n-am fost impresionat',
        'N-am avut timp să mă uit serios',
        'Nu m-a ținut nimic pe loc, abia acum devine relevant',
      ]) {
        fd.append('blocaj_istoric', op);
      }
      const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
      expect(rezultat.success).toBe(true);
    });

    it('nicio bifă → respins', () => {
      const fd = formCompletValid();
      fd.delete('blocaj_istoric');
      const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
      expect(rezultat.success).toBe(false);
    });
  });
});

describe('token Turnstile', () => {
  it('lipsă din formular → respins, cu mesajul dedicat', () => {
    const fd = formCompletValid();
    fd.delete('cf-turnstile-response');
    const rezultat = inscriereSchema.safeParse(formDataInSchema(fd));
    expect(rezultat.success).toBe(false);
  });
});
