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
  // Pe registrul secundar, #637474 da 3.94:1 — defect PREEXISTENT, gasit la
  // recalcularea perechilor. Vezi tokens.css si docs/DECIZII.md.
  inaintePeSecundar: '#576565',
  eroare: '#9E4B4B', // corectat: original #B85C5C = 4.45:1, marginal sub AA
  succes: '#C9E3D0',

  // Registrul întunecat (§02 vacarm, §08, footer).
  bgInchis: '#1B2426',
  textPeInchis: '#FFFFFF',
  textPeInchisMuted: '#B9C4C4',
  accentClar: '#7FD1C4',
  // Capătul „roșu" al gradientului din BaraScarcity.astro — interpolat în JS
  // între alb (--text-pe-inchis) și acesta, pe raportul de ocupare a locurilor.
  eroareClar: '#E08585',
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
   * Perechea care LIPSEA pana in prima trecere — unghiul mort care raporta
   * verde peste un defect real: `coloana ÎNAINTE (§05)` era declarata DOAR
   * contra `bgPrimar`, dar §05 e `fundal="secundar"` (si la fel §13, si
   * `.bife` din §16).
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
  { nume: 'BaraScarcity — capăt roșu (0 locuri) pe fundal închis', fg: TOKENS.eroareClar, bg: TOKENS.bgInchis, min: 4.5 },
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

// Santinela pe valorile pe care le-am scos din paleta: daca cineva le reintroduce
// ca text normal, testul trebuie sa spuna de ce au fost scoase.
const RESPINSE = [
  { val: '#468984', ratio: contrast('#FFFFFF', '#468984'), motiv: 'CTA original — pica AA ca text normal' },
  { val: '#B85C5C', ratio: contrast('#B85C5C', '#FFFFFF'), motiv: 'eroare originală — marginal sub AA' },
  { val: '#6B7F7F', ratio: contrast('#6B7F7F', '#FFFFFF'), motiv: '≈ #2F4F4F la opacitate 70% — pica AA' },
  { val: '#3A716D', ratio: contrast('#3A716D', '#E4E7E7'), motiv: 'prima corectie a CTA — trecea pe alb, pica pe fundalul secundar din §03 si footer' },
  { val: '#637474', ratio: contrast('#637474', '#E4E7E7'), motiv: '`--text-muted` PE SECUNDAR — defectul gasit initial; foloseste --text-muted-pe-secundar (#576565)' },
  { val: '#637474', ratio: contrast('#637474', '#C9E3D0'), motiv: '`--text-muted` pe `--succes-bg` — nefolosit azi (.format §06 fixeaza `color: var(--text)`); nu-l introduce' },
];
console.log('\nValori scoase din paletă (pentru referință, ca să nu revină):\n');
for (const { val, ratio, motiv } of RESPINSE) {
  console.log(`  ${val}  ${ratio.toFixed(2)}:1  — ${motiv}`);
}

if (picat > 0) {
  console.error(`\n✗ ${picat} pereche(i) sub prag. Vezi §3 din CLAUDE.md.\n`);
  process.exit(1);
}
console.log('\n✓ Toate perechile trec pragul cerut.\n');
