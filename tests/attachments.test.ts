/**
 * Codificarea atașamentelor Resend — bug găsit la verificarea LIVE, nu la
 * citirea codului: API-ul Resend cere `content` base64; SDK-ul nu convertește,
 * doar transmite mai departe orice primește. Trimis text brut, serverul l-a
 * interpretat CA base64 și l-a „decodat" — un `.ics` de 900 de octeți a ajuns
 * garbage binar de 162 de octeți, fără nicio eroare zgomotoasă.
 */

import { describe, it, expect } from 'vitest';
import { codificaAtasamente } from '../src/lib/attachments';

describe('codificaAtasamente', () => {
  it('conținutul codificat, decodat înapoi, dă exact textul original', () => {
    const original = 'BEGIN:VCALENDAR\r\nSUMMARY:Test cu diacritice ă î â ș ț\r\nEND:VCALENDAR\r\n';
    const [rezultat] = codificaAtasamente([{ filename: 'test.ics', content: original }])!;

    const decodat = Buffer.from(rezultat!.content, 'base64').toString('utf8');
    expect(decodat).toBe(original);
  });

  it('conținutul codificat NU e identic cu originalul (altfel bug-ul ar trece neobservat)', () => {
    // Exact defectul găsit live: dacă cineva „repară" prin eliminarea
    // encoding-ului, testul de mai sus ar tot trece (Buffer.from(text,'base64')
    // pe un text care nu e base64 valid produce uneori tot ceva, din greșeală) —
    // dar acesta prinde regresia direct: content-ul trimis nu mai poate fi
    // identic cu inputul brut.
    const original = 'BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n';
    const [rezultat] = codificaAtasamente([{ filename: 'test.ics', content: original }])!;
    expect(rezultat!.content).not.toBe(original);
  });

  it('rezultatul e base64 valid (doar A-Za-z0-9+/=)', () => {
    const [rezultat] = codificaAtasamente([{ filename: 'x.ics', content: 'orice text\ncu linii\r\nmultiple' }])!;
    expect(rezultat!.content).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
  });

  it('păstrează filename și contentType', () => {
    const [rezultat] = codificaAtasamente([
      { filename: 'eveniment.ics', content: 'x', contentType: 'text/calendar' },
    ])!;
    expect(rezultat!.filename).toBe('eveniment.ics');
    expect(rezultat!.contentType).toBe('text/calendar');
  });

  it('undefined rămâne undefined (fără atașamente = fără câmp)', () => {
    expect(codificaAtasamente(undefined)).toBeUndefined();
  });

  it('array gol rămâne array gol', () => {
    expect(codificaAtasamente([])).toEqual([]);
  });

  it('conținutul real .ics (cu VTIMEZONE, CRLF, diacritice) supraviețuiește round-trip-ul', async () => {
    const { genereazaIcs } = await import('../src/lib/ics');
    const icsReal = genereazaIcs(new Date('2026-08-28T10:00:00Z'));
    const [rezultat] = codificaAtasamente([{ filename: 'eveniment.ics', content: icsReal }])!;
    const decodat = Buffer.from(rezultat!.content, 'base64').toString('utf8');
    expect(decodat).toBe(icsReal);
    expect(decodat).toContain('BEGIN:VTIMEZONE');
    expect(decodat).toContain('Casa Dăinuirii');
  });
});
