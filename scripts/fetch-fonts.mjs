#!/usr/bin/env node
/**
 * Descarcă fonturile de la Google Fonts și le self-hostează în public/fonts/.
 *
 * De ce self-hosted, nu <link> către Google:
 *  1. O cerere DNS + TLS către un al treilea domeniu, pe 4G, în browserul in-app
 *     din WhatsApp — exact contextul în care vine 40%+ din trafic.
 *  2. Subsetul. Româna corectă folosește ș/ț cu VIRGULĂ dedesubt (U+0219/U+021B),
 *     care sunt în `latin-ext`, nu în `latin`. Un <link> naiv ia doar `latin`,
 *     iar ș și ț cad pe fontul de sistem — se văd diferit în mijlocul cuvântului,
 *     pe o pagină integral în română.
 *  3. Fără cereri către un terț, nu e nevoie de banner de cookies.
 *
 * Rulează:  node scripts/fetch-fonts.mjs
 * Scrie:    public/fonts/*.woff2  +  src/styles/fonts.css
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// `new URL(...).pathname` NU decodează procent-encodarea: un director cu spații
// în nume devine „Workshop%20AI%20-%20Deep%20Logic" și `mkdir -p` îl creează
// literal, ca director nou. `fileURLToPath` e singura formă corectă.
const RADACINA = fileURLToPath(new URL('..', import.meta.url));
const DIR_FONTURI = join(RADACINA, 'public/fonts');

// UA de Chrome moderne — altfel Google servește woff/ttf în loc de woff2.
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Fonturi VARIABILE (`wght@a..b`), nu statice.
 *
 * Măsurat pe subseturile latin + latin-ext:
 *   Inter          static 600+700 → 261 KB   |  variabil 400..700 → 131 KB
 *   Source Sans 3  static 400+600 → 174 KB   |  variabil 400..600 →  87 KB
 *
 * Jumătate din greutate, și acoperă toate valorile intermediare — deci o
 * schimbare de design mai târziu nu mai cere un fișier nou. IBM Plex Mono
 * n-are variantă variabilă pe Google Fonts și oricum e sub 20 KB.
 */
const FAMILII = [
  { nume: 'Inter', slug: 'inter', spec: 'Inter:wght@400..700' },
  { nume: 'Source Sans 3', slug: 'source-sans-3', spec: 'Source+Sans+3:wght@400..600' },
  { nume: 'IBM Plex Mono', slug: 'ibm-plex-mono', spec: 'IBM+Plex+Mono:wght@500' },
];

// Doar subseturile de care avem nevoie. `latin-ext` e obligatoriu pentru română.
const SUBSETURI_DORITE = new Set(['latin', 'latin-ext']);

async function ia(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} — ${url}`);
  return r;
}

/** Parsează CSS-ul Google în blocuri @font-face adnotate cu subsetul. */
function parseazaFontFace(css) {
  const blocuri = [];
  let subsetCurent = null;

  // Google pune deasupra fiecărui bloc un comentariu cu numele subsetului.
  const regexComentariu = /\/\*\s*([a-z0-9-]+)\s*\*\//gi;
  const regexBloc = /@font-face\s*\{([^}]+)\}/g;

  const marcaje = [];
  let m;
  while ((m = regexComentariu.exec(css))) marcaje.push({ index: m.index, subset: m[1] });

  while ((m = regexBloc.exec(css))) {
    const corp = m[1];
    for (const mark of marcaje) {
      if (mark.index < m.index) subsetCurent = mark.subset;
      else break;
    }
    // La fonturile variabile, Google emite un interval: `font-weight: 400 700`.
    const weight = /font-weight:\s*([\d\s]+?);/.exec(corp)?.[1]?.trim();
    const style = /font-style:\s*(\w+)/.exec(corp)?.[1] ?? 'normal';
    const urlWoff2 = /url\((https:\/\/[^)]+\.woff2)\)/.exec(corp)?.[1];
    const unicodeRange = /unicode-range:\s*([^;]+);/.exec(corp)?.[1]?.trim();
    if (urlWoff2 && weight) {
      blocuri.push({ subset: subsetCurent, weight, style, url: urlWoff2, unicodeRange });
    }
  }
  return blocuri;
}

await mkdir(DIR_FONTURI, { recursive: true });

const reguli = [];
let descarcate = 0;
let octetiTotal = 0;

for (const familie of FAMILII) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${familie.spec}&display=swap`;
  const css = await (await ia(cssUrl)).text();
  const blocuri = parseazaFontFace(css).filter((b) => SUBSETURI_DORITE.has(b.subset));

  if (!blocuri.some((b) => b.subset === 'latin-ext')) {
    throw new Error(
      `${familie.nume}: nu s-a găsit subsetul latin-ext. Fără el, ș și ț cad pe fontul de sistem.`,
    );
  }

  for (const b of blocuri) {
    // `400 700` → `400-700` în numele fișierului.
    const slugWeight = b.weight.replace(/\s+/g, '-');
    const numeFisier = `${familie.slug}-${slugWeight}-${b.subset}.woff2`;
    const buf = Buffer.from(await (await ia(b.url)).arrayBuffer());
    await writeFile(join(DIR_FONTURI, numeFisier), buf);
    descarcate++;
    octetiTotal += buf.length;
    console.log(`  ${numeFisier.padEnd(38)} ${(buf.length / 1024).toFixed(1).padStart(6)} KB`);

    reguli.push(
      `@font-face {\n` +
        `  font-family: '${familie.nume}';\n` +
        `  font-style: ${b.style};\n` +
        `  font-weight: ${b.weight};\n` +
        `  font-display: swap;\n` +
        `  src: url('/fonts/${numeFisier}') format('woff2');\n` +
        (b.unicodeRange ? `  unicode-range: ${b.unicodeRange};\n` : '') +
        `}`,
    );
  }
}

const antet = `/*
 * Generat de scripts/fetch-fonts.mjs — nu edita manual.
 *
 * Subseturi: latin + latin-ext. Al doilea e OBLIGATORIU pentru română:
 * ș/ț cu virgulă dedesubt (U+0219/U+021B) nu sunt în subsetul latin.
 *
 * unicode-range lasă browserul să descarce latin-ext doar dacă pagina chiar
 * conține caractere din el — ceea ce, aici, se întâmplă mereu.
 */\n\n`;

await writeFile(join(RADACINA, 'src/styles/fonts.css'), antet + reguli.join('\n\n') + '\n');

console.log(
  `\n✓ ${descarcate} fișiere, ${(octetiTotal / 1024).toFixed(0)} KB total → public/fonts/`,
);
console.log('  src/styles/fonts.css regenerat.\n');
