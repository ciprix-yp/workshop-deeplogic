/**
 * Generator `.ics` — cu `VTIMEZONE`, nu timp „plutitor" sau UTC brut.
 *
 * B9: spec-ul original scria `DTSTART: 20260916T140000 (Europe/Bucharest)` ca
 * un simplu comentariu. Scris naiv, fără bloc VTIMEZONE, evenimentul apare la
 * ora greșită în Google Calendar / Outlook pentru cineva cu alt fus orar —
 * sau, și mai rău, unele clienți interpretează timpul „plutitor" ca ora
 * LOCALĂ A LOR, nu a evenimentului.
 *
 * Blocul VTIMEZONE de mai jos e regula EU de schimbare a orei (ultima
 * duminică din martie / octombrie, ora 01:00 UTC) — aceeași pentru toate
 * țările UE, regula IANA standard pentru Europe/Bucharest, nu inventată.
 */

import { EVENIMENT } from '../content/copy';

// Ca array de linii, nu ca un singur string cu \n — altfel liniile interne
// ale blocului rămân cu \n în timp ce restul fișierului are \r\n. RFC 5545
// cere CRLF peste tot; câțiva parseri stricți refuză linii terminate cu \n gol.
const VTIMEZONE_LINII = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Bucharest',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0300',
  'TZNAME:EEST',
  'DTSTART:19810329T030000',
  'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0300',
  'TZOFFSETTO:+0200',
  'TZNAME:EET',
  'DTSTART:19961027T040000',
  'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10',
  'END:STANDARD',
  'END:VTIMEZONE',
];

/** Scapă `,`, `;`, `\` conform RFC 5545 — altfel adresa cu virgulă rupe parsarea. */
function scapaText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

/** Timestamp UTC pentru DTSTAMP/UID — format RFC 5545, fără separatori. */
function acumUtc(data: Date): string {
  return data.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * *Line folding* — RFC 5545 §3.1: nicio linie fizică nu depășește 75 octeți
 * (nu caractere — „ă", „î" etc. sunt 2 octeți UTF-8 fiecare). Peste limită,
 * linia se rupe cu CRLF urmat de UN spațiu, care se elimină la reasamblare.
 *
 * Fără asta, LOCATION și DESCRIPTION (adresa completă, cu diacritice) trec
 * de 75 octeți — unele calendare stricte trunchiază sau resping linia
 * nefragmentată, în loc s-o afișeze corect.
 */
function pliazaLinie(linie: string): string {
  const octeti = Buffer.from(linie, 'utf8');
  if (octeti.length <= 75) return linie;

  const bucati: string[] = [];
  let start = 0;
  let limita = 75; // prima linie fizică: 75 octeți de conținut

  while (start < octeti.length) {
    let capat = Math.min(start + limita, octeti.length);
    // Nu tăia în mijlocul unui caracter UTF-8 multi-octet: octeții de
    // continuare încep cu biții `10xxxxxx` (0x80–0xBF) — dacă am aterizat
    // acolo, dăm înapoi până la începutul caracterului.
    while (capat < octeti.length && (octeti[capat]! & 0xc0) === 0x80) capat--;
    bucati.push(octeti.subarray(start, capat).toString('utf8'));
    start = capat;
    limita = 74; // liniile de continuare: 1 spațiu + 74 octeți = 75 total
  }

  return bucati.join('\r\n ');
}

export function genereazaIcs(dataGenerare: Date): string {
  const adresa = `${EVENIMENT.locatie}, ${EVENIMENT.adresa}`;
  const liniiContinut = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Deep Logic//Workshop 16 Septembrie//RO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...VTIMEZONE_LINII,
    'BEGIN:VEVENT',
    // UID fix — reimportarea aceluiași fișier actualizează evenimentul
    // existent în calendar, nu creează un duplicat.
    `UID:workshop-${EVENIMENT.data}@deeplogic.ro`,
    `DTSTAMP:${acumUtc(dataGenerare)}`,
    // TZID calificat, nu 'Z' (UTC) și nu timp plutitor — ancorat de blocul
    // VTIMEZONE de mai sus. Asta e exact fix-ul B9.
    'DTSTART;TZID=Europe/Bucharest:20260916T140000',
    'DTEND;TZID=Europe/Bucharest:20260916T170000',
    `SUMMARY:${scapaText(EVENIMENT.titlu + ' — ' + EVENIMENT.organizator)}`,
    `LOCATION:${scapaText(adresa)}`,
    `DESCRIPTION:${scapaText('Miercuri, 16 septembrie 2026, 14:00–17:00. ' + adresa)}`,
    // Alertă cu 24h înainte — cerută explicit (2026-09-02), „setată dintr-un
    // click" odată cu restul evenimentului. `TRIGGER:-P1D` = relativ la
    // DTSTART, nu la un timestamp fix — corect indiferent de fusul orar al
    // calendarului în care ajunge.
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${scapaText(EVENIMENT.titlu + ' — mâine, ' + EVENIMENT.ora)}`,
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  // CRLF — cerut explicit de RFC 5545, nu doar \n. Fiecare linie plicuită
  // individual, ca liniile scurte să rămână neatinse.
  return liniiContinut.map(pliazaLinie).join('\r\n') + '\r\n';
}
