/**
 * Garda pe `EMAIL_FROM` — regresie pentru incidentul din 14 septembrie 2026.
 *
 * Secretul din producție conținea ghilimelele literale din `.env`, Resend
 * respingea fiecare trimitere cu „Invalid `from` field", și TOT ce depindea de
 * email se rupea tăcut: confirmările nu plecau, funcțiile Inngest eșuau, iar
 * alerta care ar fi anunțat-o pleca prin aceeași cale ruptă. Două înscrieri
 * reale au stat șase ore fără confirmare.
 *
 * Testul ăsta există ca să nu se mai poată întâmpla în silență.
 */

import { describe, it, expect } from 'vitest';
import { valideazaExpeditor } from '../src/lib/expeditor';

describe('formate acceptate de Resend', () => {
  it('adresă simplă', () => {
    expect(valideazaExpeditor('ciprian@deeplogic.ro')).toBe('ciprian@deeplogic.ro');
  });

  it('`Nume <adresă>` — forma folosită în proiect', () => {
    const from = 'Ciprian Micu - Deep Logic <ciprian@deeplogic.ro>';
    expect(valideazaExpeditor(from)).toBe(from);
  });

  it('spațiile din jur sunt tăiate, nu respinse', () => {
    expect(valideazaExpeditor('  ciprian@deeplogic.ro \n')).toBe('ciprian@deeplogic.ro');
  });

  it('diacriticele din numele afișat sunt permise', () => {
    const from = 'Ciprian Micu — Deep Logic Satu Mare <ciprian@deeplogic.ro>';
    expect(valideazaExpeditor(from)).toBe(from);
  });
});

describe('exact greșeala din producție e respinsă', () => {
  it('ghilimele în jurul întregii valori — cazul real', () => {
    // Așa arăta secretul din Worker: `wrangler secret put` a copiat valoarea
    // cu tot cu ghilimelele din `.env`, pe care dotenv le-ar fi eliminat.
    expect(() => valideazaExpeditor('"Ciprian Micu - Deep Logic <ciprian@deeplogic.ro>"')).toThrow(
      /EMAIL_FROM are format invalid/,
    );
  });

  it('mesajul de eroare spune CUM se repară', () => {
    expect(() => valideazaExpeditor('"x <a@b.ro>"')).toThrow(/wrangler secret put EMAIL_FROM/);
  });

  it('mesajul arată valoarea primită, ca să se vadă ghilimelele', () => {
    expect(() => valideazaExpeditor('"a@b.ro"')).toThrow(/\\"a@b\.ro\\"/);
  });
});

describe('alte forme invalide', () => {
  it.each([
    ['gol', ''],
    ['doar spații', '   '],
    ['undefined', undefined],
    ['fără @', 'Ciprian Micu'],
    ['paranteză neînchisă', 'Ciprian <ciprian@deeplogic.ro'],
    ['două adrese', 'a@b.ro, c@d.ro'],
    ['spațiu în adresă', 'Ciprian <ciprian @deeplogic.ro>'],
    ['ghilimele doar pe nume', '"Ciprian" <ciprian@deeplogic.ro>'],
  ])('respinge: %s', (_, valoare) => {
    expect(() => valideazaExpeditor(valoare as string | undefined)).toThrow(
      /EMAIL_FROM are format invalid/,
    );
  });
});
