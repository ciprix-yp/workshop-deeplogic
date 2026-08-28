#!/usr/bin/env node
/**
 * Scrie `public/eveniment.ics` static, o singură dată la build.
 *
 * Conținutul e identic pentru toată lumea (același eveniment, aceeași oră) —
 * generat dinamic per-cerere ar fi muncă de server irosită. Emailul 3
 * atașează conținutul direct (vezi src/emails/), nu link-uiește fișierul
 * ăsta; fișierul static deservește linkul „Adaugă în calendar" de pe
 * paginile de confirmare (§ stari.reconfirmat, stari.locRevendicat).
 *
 * Rulează:  node scripts/generate-ics.mjs
 * Rulează automat înainte de build — vezi package.json → "prebuild".
 */

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { genereazaIcs } from '../src/lib/ics.ts';

const RADACINA = fileURLToPath(new URL('..', import.meta.url));
const TINTA = join(RADACINA, 'public/eveniment.ics');

const ics = genereazaIcs(new Date());
await writeFile(TINTA, ics, 'utf8');

console.log(`✓ public/eveniment.ics scris (${ics.length} octeți)`);
