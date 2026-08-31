#!/usr/bin/env node
/**
 * Lint de selector — constrangerea 1 („continutul nu depinde de animatie"),
 * verificata static, nu prin disciplina.
 *
 * Regula: in `src/styles/labirint.css`, niciun selector care seteaza
 * `opacity`, `transform`, `clip-path`, `mask`, `filter`, `visibility` sau
 * `display` nu are voie sa se potriveasca pe un element din afara multimii
 * DECORATIVE. Subiectul selectorului (ultimul compound, fara pseudo-elemente)
 * trebuie sa poarte `[aria-hidden]`, `[data-decor]` sau una din clasele
 * declarate mai jos ca decor.
 *
 * De ce static SI in browser: aici verificam ca REGULA nu se poate scrie
 * gresit; `tests/e2e/labirint-continut.spec.ts` verifica separat ca fiecare
 * element din lista de mai jos chiar poarta `aria-hidden="true"` in DOM.
 * Una fara cealalta ar fi o promisiune, nu un mecanism.
 *
 * Ruleaza:  npm run lint:decor   (inclus in `npm run verify`)
 */

import { readFileSync } from 'node:fs';

const FISIER = 'src/styles/labirint.css';

const PROPRIETATI_INTERZISE = new Set([
  'opacity',
  'transform',
  'clip-path',
  '-webkit-clip-path',
  'mask',
  'mask-image',
  '-webkit-mask',
  '-webkit-mask-image',
  'filter',
  '-webkit-filter',
  'visibility',
  'display',
]);

/**
 * Clasele care AU VOIE sa primeasca proprietatile de mai sus. Fiecare e un
 * element `aria-hidden="true"` fara continut textual. Lista e scurta
 * deliberat: daca trebuie extinsa, ala e momentul in care cineva se uita din
 * nou la ce anume se animeaza.
 */
const DECOR = ['sticla-chrome', 'labirint', 'subiect', 'checkpoint', 'grup', 'fantoma', 'cap'];

const sursa = readFileSync(new URL(`../${FISIER}`, import.meta.url), 'utf8');

/** Scoate comentariile /* … *\/ fara sa strice numararea de acolade. */
const faraComentarii = sursa.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Parcurge fisierul si extrage perechile (selector, bloc de declaratii),
 * intrand in at-rule-uri (`@media`, `@supports`) si sarind complet peste
 * `@keyframes` — acolo „selectorii" sunt procente, nu elemente.
 */
function reguli(text) {
  const rezultat = [];
  let i = 0;
  let start = 0;

  while (i < text.length) {
    const c = text[i];
    if (c === '{') {
      const antet = text.slice(start, i).trim();
      const corp = extrageBloc(text, i);
      if (/^@keyframes\b|^@-webkit-keyframes\b/.test(antet)) {
        // sarit integral
      } else if (antet.startsWith('@')) {
        rezultat.push(...reguli(corp.continut));
      } else if (antet) {
        rezultat.push({ selector: antet, declaratii: corp.continut });
      }
      i = corp.sfarsit + 1;
      start = i;
      continue;
    }
    i++;
  }
  return rezultat;
}

/** Returneaza continutul blocului care incepe la `{` de la indexul `poz`. */
function extrageBloc(text, poz) {
  let adancime = 0;
  for (let i = poz; i < text.length; i++) {
    if (text[i] === '{') adancime++;
    else if (text[i] === '}') {
      adancime--;
      if (adancime === 0) return { continut: text.slice(poz + 1, i), sfarsit: i };
    }
  }
  return { continut: text.slice(poz + 1), sfarsit: text.length };
}

/** Ultimul compound al selectorului, fara pseudo-elemente si pseudo-clase. */
function subiect(selector) {
  const ultim = selector.trim().split(/\s*[\s>+~]\s*/).filter(Boolean).pop() ?? '';
  return ultim.replace(/::[a-z-]+/g, '').replace(/:[a-z-]+(\([^)]*\))?/g, '');
}

function eDecor(selector) {
  const s = subiect(selector);
  if (/\[aria-hidden/.test(s) || /\[data-decor/.test(s)) return true;
  return DECOR.some((clasa) => new RegExp(`\\.${clasa}(?![\\w-])`).test(s));
}

const incalcari = [];
for (const { selector, declaratii } of reguli(faraComentarii)) {
  const proprietati = [];
  for (const decl of declaratii.split(';')) {
    const nume = decl.split(':')[0]?.trim().toLowerCase();
    if (nume && PROPRIETATI_INTERZISE.has(nume)) proprietati.push(nume);
  }
  if (proprietati.length === 0) continue;

  for (const s of selector.split(',')) {
    if (!eDecor(s)) {
      incalcari.push({ selector: s.trim(), proprietati: [...new Set(proprietati)] });
    }
  }
}

console.log(`\nLint decor — ${FISIER}\n`);
console.log(`  reguli inspectate : ${reguli(faraComentarii).length}`);
console.log(`  clase decorative  : ${DECOR.map((c) => '.' + c).join(', ')}`);
console.log(`  proprietati sub gate: ${[...PROPRIETATI_INTERZISE].join(', ')}\n`);

if (incalcari.length > 0) {
  console.error('✗ Selectori care ating o proprietate de animatie in afara multimii decorative:\n');
  for (const { selector, proprietati } of incalcari) {
    console.error(`  · "${selector}"  →  ${proprietati.join(', ')}`);
  }
  console.error(
    '\n  Regula nu e stilistica: un element care poarta text nu are voie sa fie tinta de\n' +
      '  animatie, altfel starea „neajunsa" poate ascunde continut. Muta proprietatea pe\n' +
      '  cromul aria-hidden, sau adauga elementul in DECOR daca e chiar decor.\n',
  );
  process.exit(1);
}

console.log('✓ Nicio proprietate de animatie in afara multimii decorative.\n');
