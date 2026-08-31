#!/usr/bin/env node
/**
 * Verificator de contrast WCAG 2.2 pentru paleta proiectului.
 *
 * De ce există: paleta din documentul original avea CTA-ul principal la 4.06:1 — sub
 * pragul AA de 4.5:1 — iar defectul e invizibil la citirea codului și greu de prins cu
 * ochiul liber. E singurul CTA de pe pagină, repetat de patru ori.
 *
 * Rulează:  npm run contrast
 * Iese cu cod 1 dacă orice pereche declarată ca „text normal" pică AA.
 */

const TOKENS = {
  bgPrimar: '#FFFFFF',
  bgSecundar: '#E4E7E7',
  text: '#2A3439',
  accentCta: '#376A66', // corectat: original #468984 = 4.06:1, pica AA
  accentDecor: '#468984', // pastrat DOAR pentru text >=24px si elemente non-text
  secundar: '#2F4F4F',
  inainte: '#637474', // `--text-muted`; corectat fata de #2F4F4F la opacitate 70% (= 4.23:1)
  // v4: `--text-muted-pe-secundar`. Pe registrul secundar, #637474 da 3.94:1
  // — defect PREEXISTENT, nelegat de redesign, gasit abia la recalcularea
  // perechilor pentru sticla. Vezi tokens.css si docs/DECIZII.md.
  inaintePeSecundar: '#576565',
  eroare: '#9E4B4B', // corectat: original #B85C5C = 4.45:1, marginal sub AA
  succes: '#C9E3D0',

  // Registrul întunecat (§02 vacarm, §08, footer).
  bgInchis: '#1B2426',
  textPeInchis: '#FFFFFF',
  textPeInchisMuted: '#B9C4C4',
  accentClar: '#7FD1C4',
};

/*
 * ── Compozitele de sub placa de sticlă (v4) ─────────────────────────────
 *
 * Sticla e translucida, deci perechea text/fundal de pe ecran NU mai e una
 * din cele plate de mai sus. Fara intrarile de mai jos, scriptul ar
 * continua sa raporteze verde peste ce era pe ecran in v3, nu peste ce e
 * acum — adica gate-ul CONTRAST din CLAUDE.md §6 ar deveni decorativ.
 *
 * Ce e sub sticla e cunoscut si marginit: DOAR liniile Campului
 * (`--accent-decor` / `--accent-clar`, plafonate la `stroke-opacity`) peste
 * fundalul registrului. Deci compozitul worst-case e determinabil exact:
 *
 *   U = blend(culoare_linie, bg_registru, alpha_linie)   // sub sticla
 *   C = blend(tenta_registru, U, alpha_tenta)            // ce vede ochiul
 *
 * Calculul e CONSERVATOR prin constructie: presupune linia opaca pe 100%
 * din pixelul de sub text, ignorand ca `backdrop-filter: blur(20px)`
 * mediaza backdrop-ul si slabeste drastic o linie fina izolata. Realitatea
 * e mai buna decat numarul; numarul e cel care tine gate-ul.
 *
 * SURSA DE ADEVAR PARTAJATA — cele doua seturi de constante de mai jos
 * exista si in CSS:
 *   ALPHA_LINIE_CAMP  ↔ `--camp-opacitate` (src/components/Campul.astro)
 *   ALPHA_TENTA       ↔ `--sticla-alpha`   (src/components/Sectiune.astro,
 *                                           S01Hero.astro, tokens.css)
 * Daca schimbi una, schimba-le pe amandoua si ruleaza `npm run contrast`.
 */
const ALPHA_LABIRINT = { deschis: 0.25, inchis: 0.2 };

/*
 * ── Subiectul (v5) ──────────────────────────────────────────────────────
 *
 * `ALPHA_SUBIECT` ↔ `--subiect-opacitate` (src/components/Subiect.astro).
 *
 * 0.32 nu e o alegere de gust: e ultimul numar rotund sub pragul la care cel
 * mai slab text al paginii pica AA. Vezi `AVERTISMENTE` mai jos pentru cifre.
 *
 * ATENTIE la compunere — defect gasit la implementare, nu in brief: subiectul
 * circula PE coridor, deci e intotdeauna peste o linie de labirint. Alfa lui
 * efectiva in compozit NU e 0.32, ci
 *     1 - (1 - ALPHA_LABIRINT) * (1 - ALPHA_SUBIECT) = 0.49
 * Brief-ul (§8.3) calculase subiectul direct peste fundalul registrului,
 * ignorand linia de sub el. Diferenta e de 0.13 alfa — destul cat sa mute
 * `--text-muted` de la 4.58:1 la 4.45:1, adica din trecut in picat.
 */
const ALPHA_SUBIECT = { deschis: 0.32, inchis: 0.5 };

/*
 * ── Tenta plăcii (v5) ───────────────────────────────────────────────────
 *
 * 1.0 pe registrele DESCHISE = placa e OPACA. Nu e o simplificare, e
 * rezultatul calculului de mai sus: la 0.82/0.88 subiectul peste labirint
 * tragea `--text-muted` sub AA, iar ce se pierde prin opacizare e o linie
 * care era oricum la ~3% delta de luminanta (invizibila). Pe registrul
 * inchis tenta ramane 0.70 — acolo aceeasi linie da 1.59:1, adica se vede,
 * si acolo si `backdrop-filter` isi plateste costul.
 *
 * Valorile v4 (0.82 / 0.88) raman verificate mai jos, in blocul
 * `AVERTISMENTE`, ca sa nu fie reintroduse din greseala.
 */
const ALPHA_TENTA_STICLA = { primar: 1, secundar: 1, inchis: 0.7 };
const ALPHA_TENTA_V4 = { primar: 0.82, secundar: 0.88, inchis: 0.7 };

/*
 * Coerenta, verificata in script, nu tinuta minte: peste 0.38, `--text-muted`
 * pica AA sub tenta primara chiar si FARA linia de labirint dedesubt.
 */
const PLAFON_SUBIECT_DESCHIS = 0.38;

/** Compunere sRGB standard: `fg` la opacitatea `alpha` peste `bg`. */
function blend(fg, bg, alpha) {
  const c = (hex) => {
    const h = hex.replace('#', '');
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  };
  const [f, b] = [c(fg), c(bg)];
  const mix = f.map((v, i) => Math.round(v * alpha + b[i] * (1 - alpha)));
  return '#' + mix.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Culoarea efectiva de sub text.
 *
 * `cuSubiect` = worst-case-ul REAL al v5: subiectul stivuit peste linia de
 * labirint pe care circula. Compunerea a doua straturi de aceeasi culoare la
 * alfele a si b da alfa `1 - (1-a)(1-b)` — de aceea nu e destul sa inlocuiesti
 * o alfa cu cealalta.
 */
function compozitSticla(registru, bgRegistru, culoare, cuSubiect = false, tente = ALPHA_TENTA_STICLA) {
  const inchis = registru === 'inchis';
  const aLinie = inchis ? ALPHA_LABIRINT.inchis : ALPHA_LABIRINT.deschis;
  const aSubiect = inchis ? ALPHA_SUBIECT.inchis : ALPHA_SUBIECT.deschis;
  const alpha = cuSubiect ? 1 - (1 - aLinie) * (1 - aSubiect) : aLinie;
  const subSticla = blend(culoare, bgRegistru, alpha);
  return blend(bgRegistru, subSticla, tente[registru]);
}

const STICLA = {
  primar: compozitSticla('primar', TOKENS.bgPrimar, TOKENS.accentDecor),
  secundar: compozitSticla('secundar', TOKENS.bgSecundar, TOKENS.accentDecor),
  inchis: compozitSticla('inchis', TOKENS.bgInchis, TOKENS.accentClar),
};

/** Acelasi compozit, cu subiectul pe traseu sub text. */
const SUBIECT = {
  primar: compozitSticla('primar', TOKENS.bgPrimar, TOKENS.accentDecor, true),
  secundar: compozitSticla('secundar', TOKENS.bgSecundar, TOKENS.accentDecor, true),
  inchis: compozitSticla('inchis', TOKENS.bgInchis, TOKENS.accentClar, true),
};

/** @param {string} hex */
function relativeLuminance(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (/** @type {number} */ c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** @param {string} fg @param {string} bg */
function contrast(fg, bg) {
  const [a, b] = [relativeLuminance(fg), relativeLuminance(bg)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * `min` e pragul cerut:
 *   4.5 = text normal (AA)
 *   3.0 = text mare >=24px sau >=18.66px bold (AA Large), si componente UI (SC 1.4.11)
 */
const PERECHI = [
  { nume: 'corp pe fundal primar', fg: TOKENS.text, bg: TOKENS.bgPrimar, min: 4.5 },
  { nume: 'corp pe fundal secundar', fg: TOKENS.text, bg: TOKENS.bgSecundar, min: 4.5 },
  { nume: 'corp pe fundal succes', fg: TOKENS.text, bg: TOKENS.succes, min: 4.5 },
  { nume: 'CTA — text alb pe buton', fg: '#FFFFFF', bg: TOKENS.accentCta, min: 4.5 },
  { nume: 'CTA — link pe fundal primar', fg: TOKENS.accentCta, bg: TOKENS.bgPrimar, min: 4.5 },
  { nume: 'CTA — link pe fundal secundar', fg: TOKENS.accentCta, bg: TOKENS.bgSecundar, min: 4.5 },
  { nume: 'secundar pe fundal primar', fg: TOKENS.secundar, bg: TOKENS.bgPrimar, min: 4.5 },
  { nume: 'secundar pe fundal secundar', fg: TOKENS.secundar, bg: TOKENS.bgSecundar, min: 4.5 },
  { nume: 'text muted pe fundal primar (§01, §04, §09, §16)', fg: TOKENS.inainte, bg: TOKENS.bgPrimar, min: 4.5 },
  /*
   * Perechea care LIPSEA pana in v4 — unghiul mort care raporta 18/18 verde
   * peste un defect real in productie. `coloana ÎNAINTE (§05)` era declarata
   * DOAR contra `bgPrimar`, dar §05 e `fundal="secundar"` (si la fel §13, si
   * `.bife` din §16). Exact tiparul pentru care `#3A716D` a fost respins mai
   * jos: trecea pe alb, pica pe fundalul secundar.
   */
  { nume: 'text muted pe fundal secundar (§05, §13, .bife §16)', fg: TOKENS.inaintePeSecundar, bg: TOKENS.bgSecundar, min: 4.5 },
  { nume: 'mesaj de eroare pe alb', fg: TOKENS.eroare, bg: TOKENS.bgPrimar, min: 4.5 },
  { nume: 'mesaj de eroare pe fundal secundar', fg: TOKENS.eroare, bg: TOKENS.bgSecundar, min: 4.5 },
  { nume: 'accent decorativ — text mare', fg: TOKENS.accentDecor, bg: TOKENS.bgPrimar, min: 3.0 },
  { nume: 'accent decorativ — bordură/UI', fg: TOKENS.accentDecor, bg: TOKENS.bgPrimar, min: 3.0 },

  // Registrul întunecat. Textul secundar de pe fundal închis e cel mai ușor
  // de greșit: pe alb un gri se vede, pe negru același gri dispare.
  { nume: 'titlu pe fundal închis', fg: TOKENS.textPeInchis, bg: TOKENS.bgInchis, min: 4.5 },
  { nume: 'corp secundar pe fundal închis', fg: TOKENS.textPeInchisMuted, bg: TOKENS.bgInchis, min: 4.5 },
  { nume: 'accent clar pe fundal închis', fg: TOKENS.accentClar, bg: TOKENS.bgInchis, min: 4.5 },
  { nume: 'CTA pe întuneric — text închis pe accent clar', fg: TOKENS.bgInchis, bg: TOKENS.accentClar, min: 4.5 },
  { nume: 'fundal secundar ca text pe închis', fg: TOKENS.bgSecundar, bg: TOKENS.bgInchis, min: 4.5 },

  // ── Compozite: text peste sticla peste Campul peste fundal (v4) ────────
  // Astea sunt perechile care exista EFECTIV pe ecran pe cardul activ si pe
  // vecinii lui. Cardurile inactive (13 din 16), fallback-ul
  // `@supports not (backdrop-filter)`, `prefers-reduced-motion` si pagina
  // fara JS cad toate pe tenta opaca, adica exact pe perechile plate de mai
  // sus — deci nu au nevoie de intrari separate.
  { nume: 'STICLĂ primar — corp', fg: TOKENS.text, bg: STICLA.primar, min: 4.5 },
  { nume: 'STICLĂ primar — secundar', fg: TOKENS.secundar, bg: STICLA.primar, min: 4.5 },
  { nume: 'STICLĂ primar — accent/CTA link', fg: TOKENS.accentCta, bg: STICLA.primar, min: 4.5 },
  { nume: 'STICLĂ primar — eroare', fg: TOKENS.eroare, bg: STICLA.primar, min: 4.5 },
  { nume: 'STICLĂ primar — text muted', fg: TOKENS.inainte, bg: STICLA.primar, min: 4.5 },
  { nume: 'STICLĂ secundar — corp', fg: TOKENS.text, bg: STICLA.secundar, min: 4.5 },
  { nume: 'STICLĂ secundar — secundar', fg: TOKENS.secundar, bg: STICLA.secundar, min: 4.5 },
  { nume: 'STICLĂ secundar — accent/CTA link', fg: TOKENS.accentCta, bg: STICLA.secundar, min: 4.5 },
  { nume: 'STICLĂ secundar — eroare', fg: TOKENS.eroare, bg: STICLA.secundar, min: 4.5 },
  { nume: 'STICLĂ secundar — text muted', fg: TOKENS.inaintePeSecundar, bg: STICLA.secundar, min: 4.5 },
  { nume: 'STICLĂ închis — titlu alb', fg: TOKENS.textPeInchis, bg: STICLA.inchis, min: 4.5 },
  { nume: 'STICLĂ închis — corp secundar', fg: TOKENS.textPeInchisMuted, bg: STICLA.inchis, min: 4.5 },
  { nume: 'STICLĂ închis — accent clar', fg: TOKENS.accentClar, bg: STICLA.inchis, min: 4.5 },

  // ── Perechile NOI ale v5: text peste placa peste SUBIECT peste labirint ──
  // Subiectul e singurul element mai opac decat plafonul labirintului, deci
  // singura sursa de perechi noi. Pe registrele deschise placa e opaca, deci
  // perechile colapseaza pe cele plate — le pastram ca sentinela: daca cineva
  // reintroduce translucenta pe ele, aici se vede imediat.
  { nume: 'SUBIECT primar — corp', fg: TOKENS.text, bg: SUBIECT.primar, min: 4.5 },
  { nume: 'SUBIECT primar — text muted (perechea critica)', fg: TOKENS.inainte, bg: SUBIECT.primar, min: 4.5 },
  { nume: 'SUBIECT primar — accent/CTA link', fg: TOKENS.accentCta, bg: SUBIECT.primar, min: 4.5 },
  { nume: 'SUBIECT secundar — eroare', fg: TOKENS.eroare, bg: SUBIECT.secundar, min: 4.5 },
  { nume: 'SUBIECT secundar — text muted', fg: TOKENS.inaintePeSecundar, bg: SUBIECT.secundar, min: 4.5 },
  { nume: 'SUBIECT închis — corp secundar', fg: TOKENS.textPeInchisMuted, bg: SUBIECT.inchis, min: 4.5 },
  { nume: 'SUBIECT închis — titlu alb', fg: TOKENS.textPeInchis, bg: SUBIECT.inchis, min: 4.5 },
];

let picat = 0;
const linii = PERECHI.map(({ nume, fg, bg, min }) => {
  const r = contrast(fg, bg);
  const ok = r >= min;
  if (!ok) picat++;
  const prag = min === 4.5 ? 'AA normal' : 'AA large/UI';
  return `${ok ? '  ok  ' : ' PICA '} ${r.toFixed(2).padStart(5)}:1  (prag ${min}, ${prag})  ${nume}`;
});

console.log('\nContrast WCAG 2.2 — paleta workshop.deeplogic.ro\n');
console.log(linii.join('\n'));

console.log('\nCompozitele plăcii (v5) — culoarea efectivă de sub text:\n');
for (const [registru, culoare] of Object.entries(STICLA)) {
  const inchis = registru === 'inchis';
  const aLinie = inchis ? ALPHA_LABIRINT.inchis : ALPHA_LABIRINT.deschis;
  const aSub = inchis ? ALPHA_SUBIECT.inchis : ALPHA_SUBIECT.deschis;
  const combinat = (1 - (1 - aLinie) * (1 - aSub)).toFixed(2);
  console.log(
    `  ${registru.padEnd(9)} → ${culoare} (labirint ${aLinie})` +
      `  ·  cu subiect → ${SUBIECT[registru]} (α combinat ${combinat})` +
      `   [tentă ${ALPHA_TENTA_STICLA[registru]}]`,
  );
}

/*
 * ── Santinele numerice (v5) ─────────────────────────────────────────────
 * Doua afirmatii pe care documentele le fac si pe care nimeni nu le-ar
 * reverifica manual. Amandoua PICA build-ul, cu explicatia lor.
 */
const AVERTISMENTE = [];

if (ALPHA_SUBIECT.deschis > PLAFON_SUBIECT_DESCHIS) {
  AVERTISMENTE.push(
    `ALPHA_SUBIECT.deschis = ${ALPHA_SUBIECT.deschis} > ${PLAFON_SUBIECT_DESCHIS}. Peste asta, ` +
      '`--text-muted` #637474 pica AA sub tenta primara: subiectul intuneca fundalul de sub ' +
      'text mai repede decat isi permite cel mai slab text al paginii.',
  );
}

// De ce tenta pe registrele deschise e 1 si nu 0.82/0.88 (valorile v4).
console.log('\nDe ce placa e OPACĂ pe registrele deschise — cifrele, nu opinia:\n');
for (const [registru, bg, text, nume] of [
  ['primar', TOKENS.bgPrimar, TOKENS.inainte, '--text-muted'],
  ['secundar', TOKENS.bgSecundar, TOKENS.eroare, '--eroare'],
]) {
  const culoare = registru === 'inchis' ? TOKENS.accentClar : TOKENS.accentDecor;
  const doarLinie = compozitSticla(registru, bg, culoare, false, ALPHA_TENTA_V4);
  const cuSubiect = compozitSticla(registru, bg, culoare, true, ALPHA_TENTA_V4);
  const rLinie = contrast(text, doarLinie);
  const rSubiect = contrast(text, cuSubiect);
  console.log(
    `  ${registru.padEnd(9)} la tenta v4 ${ALPHA_TENTA_V4[registru]}:  ${nume} peste labirint ` +
      `${rLinie.toFixed(2)}:1  →  peste labirint + SUBIECT ${rSubiect.toFixed(2)}:1 ` +
      `${rSubiect >= 4.5 ? '(trece)' : '← PICA AA'}`,
  );
  if (ALPHA_TENTA_STICLA[registru] < 1 && rSubiect < 4.5) {
    AVERTISMENTE.push(
      `Tenta ${registru} e ${ALPHA_TENTA_STICLA[registru]}, dar ${nume} peste subiect da ` +
        `${rSubiect.toFixed(2)}:1. Placa trebuie sa ramana opaca pe registrele deschise.`,
    );
  }
}

// Santinela pe valorile pe care le-am scos din paleta: daca cineva le reintroduce
// ca text normal, testul trebuie sa spuna de ce au fost scoase.
const RESPINSE = [
  { val: '#468984', ratio: contrast('#FFFFFF', '#468984'), motiv: 'CTA original — pica AA ca text normal' },
  { val: '#B85C5C', ratio: contrast('#B85C5C', '#FFFFFF'), motiv: 'eroare originală — marginal sub AA' },
  { val: '#6B7F7F', ratio: contrast('#6B7F7F', '#FFFFFF'), motiv: '≈ #2F4F4F la opacitate 70% — pica AA' },
  { val: '#3A716D', ratio: contrast('#3A716D', '#E4E7E7'), motiv: 'prima corectie a CTA — trecea pe alb, pica pe fundalul secundar din §03 si footer' },
  { val: '#637474', ratio: contrast('#637474', '#E4E7E7'), motiv: '`--text-muted` PE SECUNDAR — defectul gasit in v4; foloseste --text-muted-pe-secundar (#576565)' },
  { val: '#637474', ratio: contrast('#637474', '#C9E3D0'), motiv: '`--text-muted` pe `--succes-bg` — nefolosit azi (.format §06 fixeaza `color: var(--text)`); nu-l introduce' },
];
console.log('\nValori scoase din paletă (pentru referință, ca să nu revină):\n');
for (const { val, ratio, motiv } of RESPINSE) {
  console.log(`  ${val}  ${ratio.toFixed(2)}:1  — ${motiv}`);
}

if (AVERTISMENTE.length > 0) {
  console.error('\n✗ Coerență ruptă între constante:\n');
  for (const a of AVERTISMENTE) console.error(`  · ${a}`);
  console.error('');
}

if (picat > 0) {
  console.error(`\n✗ ${picat} pereche(i) sub prag. Vezi §3 din CLAUDE.md.\n`);
}

if (picat > 0 || AVERTISMENTE.length > 0) process.exit(1);
console.log('\n✓ Toate perechile trec pragul cerut.\n');
