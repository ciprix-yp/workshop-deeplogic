/**
 * Generatorul `.ics` — pur, fără `astro:env`, testabil direct.
 *
 * B9: fără aceste teste, un `.ics` cu timp „plutitor" sau linii nefragmentate
 * trece neobservat local — se vede doar când cineva îl importă într-un
 * calendar real, la câteva zile de eveniment.
 */

import { describe, it, expect } from 'vitest';
import { genereazaIcs } from '../src/lib/ics';

const ics = genereazaIcs(new Date('2026-08-28T10:00:00Z'));
const linii = ics.split('\r\n');

describe('structură RFC 5545', () => {
  it('începe și se termină corect', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('foloseşte CRLF peste tot, nu \\n gol', () => {
    // Dacă VTIMEZONE ar reveni la un template string cu \n intern, testul
    // ăsta pică — exact bug-ul găsit și reparat la scriere.
    const faraUltimulCrlf = ics.slice(0, -2);
    expect(faraUltimulCrlf).not.toMatch(/[^\r]\n/);
  });

  it('nicio linie fizică nu depășește 75 octeți (line folding, RFC 5545 §3.1)', () => {
    for (const linie of linii) {
      expect(Buffer.byteLength(linie, 'utf8'), `linie: ${linie}`).toBeLessThanOrEqual(75);
    }
  });

  it('liniile de continuare încep cu exact un spațiu', () => {
    // O linie de continuare a unui fold nu are `NUME:` — verificăm indirect:
    // nicio linie plicuită nu conține virgula scăpată tăiată în două.
    const reasamblat = ics.replace(/\r\n /g, '');
    expect(reasamblat).toContain('Casa Dăinuirii\\, Strada 1 Decembrie 1918');
  });
});

describe('B9 — timp ancorat, nu plutitor sau UTC brut', () => {
  it('conține blocul VTIMEZONE pentru Europe/Bucharest', () => {
    expect(ics).toContain('BEGIN:VTIMEZONE');
    expect(ics).toContain('TZID:Europe/Bucharest');
    expect(ics).toContain('END:VTIMEZONE');
  });

  it('DTSTART/DTEND ale evenimentului sunt calificate cu TZID, nu Z sau timp plutitor', () => {
    expect(ics).toMatch(/DTSTART;TZID=Europe\/Bucharest:20260916T140000/);
    expect(ics).toMatch(/DTEND;TZID=Europe\/Bucharest:20260916T170000/);
  });

  it('doar DTSTART-urile din VTIMEZONE (regulile de tranziție) sunt fără TZID', () => {
    // Acolo e corect și cerut de RFC 5545 — sunt relative la offset-ul
    // blocului STANDARD/DAYLIGHT, nu la un moment calendaristic absolut.
    // Restul fișierului (VEVENT-ul propriu-zis) nu are voie să aibă
    // „DTSTART:" simplu — ar fi exact timpul „plutitor" pe care B9 îl repară.
    const dtstartSimple = linii.filter((l) => /^DTSTART:\d{8}T\d{6}$/.test(l));
    expect(dtstartSimple).toEqual(['DTSTART:19810329T030000', 'DTSTART:19961027T040000']);
  });

  it('regula EU de schimbare a orei — ultima duminică din martie/octombrie', () => {
    expect(ics).toContain('RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3');
    expect(ics).toContain('RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10');
  });
});

describe('conținut', () => {
  it('UID e stabil — reimportarea actualizează, nu duplică', () => {
    const ics2 = genereazaIcs(new Date('2026-09-01T00:00:00Z'));
    const uid1 = ics.match(/UID:([^\r\n]+)/)?.[1];
    const uid2 = ics2.match(/UID:([^\r\n]+)/)?.[1];
    expect(uid1).toBe(uid2);
    expect(uid1).toBeTruthy();
  });

  it('DTSTAMP reflectă momentul generării, nu e hardcodat', () => {
    const ics2 = genereazaIcs(new Date('2026-09-15T12:34:56Z'));
    expect(ics2).toContain('DTSTAMP:20260915T123456Z');
  });

  it('virgulele din adresă sunt scăpate conform RFC 5545', () => {
    expect(ics).toMatch(/LOCATION:.*\\,.*Strada 1 Decembrie/);
  });

  it('adresa completă e prezentă (după eliminarea plierii)', () => {
    const reasamblat = ics.replace(/\r\n /g, '');
    expect(reasamblat).toContain('440010 Satu Mare');
  });
});
