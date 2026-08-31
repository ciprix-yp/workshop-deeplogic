/**
 * Geometria labirintului — generator DETERMINIST, rulat la BUILD.
 *
 * Vezi docs/design/DESIGN_BRIEF-labirint.md §6.1. Regulile care nu se
 * negociază, pentru că fiecare are un eșec măsurat în spate:
 *
 *  1. **Zero `Math.random`.** Ieșirea trebuie să fie bit-identică la fiecare
 *     build, altfel `npm run test:visual` compară screenshoturi care diferă
 *     din zgomot, nu din regresie. Sursa de „variație" e `Math.sin`, exact
 *     precedentul deja stabilit în CampulSprite.astro (v4).
 *  2. **100% axial (0°/90°).** Diagonalele arbitrare sunt cauza #1
 *     diagnosticată a artefactului „zgârieturi" din v3. Un labirint ortogonal
 *     nu poate produce acel artefact — nu pentru că e mai frumos, ci pentru
 *     că nu are cum.
 *  3. **Traseul întâi, decorul după.** Coridorul se autorează ca drum continuu
 *     cp1 → cp16; ramurile-fundătură și „celelalte coridoare" se așază DUPĂ,
 *     verificate să nu atingă traseul. Consecință: poziția subiectului e
 *     garantat pe un coridor legal, fără niciun pathfinding la runtime.
 *  4. **Ramurile se termină pe un nod al grilei** (criteriul V5 din brief) —
 *     o terminație la jumătate de celulă citește ca eroare de randare.
 *
 * ── De ce labirintul e o BANDĂ care derulează, nu o hartă fixă ────────────
 *
 * Prima implementare a urmat brief-ul literal: 16 rânduri = 16 carduri, un
 * singur strat `fixed`, harta întreagă pe ecran deodată. Arăta foarte bine pe
 * desktop și **pica pe telefon**, verificat pe screenshot la 390×844:
 *
 *   · placa acoperă tot ce nu e bandă, deci din hartă se vedeau rândurile 1–2
 *     (banda de sus) și 16 (banda de jos) — 3 rânduri din 16;
 *   · checkpointul cardului k stă la (k−0.5)/16 din înălțimea ecranului, iar
 *     subiectul e EXACT pe el în repaus. Pentru cardurile 3–15 asta înseamnă
 *     în spatele plăcii opace: **subiectul era invizibil pe 13 din 16 carduri**;
 *   · banda vizibilă era identică pe fiecare card, deci criteriul V11 din
 *     brief (contact sheet: cardurile timpurii trebuie să se distingă de cele
 *     târzii) nu avea cum să treacă.
 *
 * Modelul de aici mută camera: labirintul e o bandă înaltă de ~6.75 ecrane,
 * translatată cu scroll-ul. Checkpointurile sunt echidistante (PAS_CARD
 * sub-rânduri), iar translația e liniară în progresul pe carduri — din cele
 * două împreună rezultă că **poziția pe ecran a checkpointului în repaus e
 * aceeași pentru toate cele 16 carduri**, și o alegem în banda de sus. Deci
 * subiectul e vizibil la fiecare oprire, pe fiecare card, la orice viewport.
 * Între carduri coboară în spatele plăcii și reiese — ceea ce citește ca
 * adâncime, nu ca dispariție.
 *
 * Ieșirea e consumată în două locuri, ambele la build:
 *   · `Labirint.astro`  — cele 3 `<path>`, feliate în plăci de un ecran
 *   · payload-ul JSON inline — LUT-ul pentru controller
 *
 * NIMIC din fișierul ăsta nu ajunge în bundle-ul de client.
 */

export const COLOANE = 12;
export const CELULA = 10;
export const LAT = COLOANE * CELULA; // 120

/** Sub-rânduri de labirint care încap într-un viewport. Cu 12 coloane, dă o
 *  celulă de 32.5×52.7px la 390×844 și 106.7×56.3px la 1280×900 — același
 *  raport ca varianta v4 verificată vizual, la ambele capete. */
export const RANDURI_VIZIBILE = 16;
/** Sub-rânduri între două checkpointuri consecutive = cât derulează banda pe
 *  un card. 6/16 dintr-un ecran: destul cât mișcarea să fie evidentă, puțin
 *  destul cât banda să nu treacă ca un tren. */
export const PAS_CARD = 6;
/** Sub-rândul primului checkpoint. 2 → poziția pe ecran în repaus e
 *  (2 − 0.5)/16 = 9.4% din înălțime, adică în banda de sus (12dvh). */
const RAND_CP0 = 2;
export const CARDURI = 16;

export const RANDURI = RAND_CP0 + (CARDURI - 1) * PAS_CARD + RANDURI_VIZIBILE; // 108
export const INALT = RANDURI * CELULA; // 1080

/** Cursa de translatare, în viewport-uri. */
export const CURSA_VIEWPORTURI = ((CARDURI - 1) * PAS_CARD) / RANDURI_VIZIBILE; // 5.625
/** Înălțimea benzii, în viewport-uri (pentru CSS). */
export const INALTIME_VIEWPORTURI = RANDURI / RANDURI_VIZIBILE; // 6.75

/**
 * Coloana checkpointului fiecărui card.
 *
 * Rândurile-CTA (1, 5, 8, 16) revin în coloana 6 = centrul: placa crește
 * simetric exact în cele patru momente de conversie. Restul sunt împrăștiate
 * deliberat cât se poate de larg peste cele 12 coloane — direcția din care
 * crește placa e coordonata reală a checkpointului, deci dispersia coloanelor
 * E variația celor 16 sosiri (criteriul V12). Tabelul din brief §6.1 avea 8
 * poziții distincte pentru 16 carduri; ăsta are 11.
 */
const COLOANE_CHECKPOINT = [6, 10, 2, 12, 6, 1, 9, 6, 4, 11, 3, 8, 5, 12, 2, 6] as const;
const CARDURI_CTA = new Set([1, 5, 8, 16]);

/** Eșantioane per segment card→card. 16 × 15 + 1 = 241 de eșantioane, deci
 *  fiecare checkpoint cade EXACT pe un eșantion — brief §10.1 cere 240, dar cu
 *  240 (239 de intervale) interpolarea ar tăia colțul exact în punctul în care
 *  placa se materializează. */
const ESANTIOANE_PER_SEGMENT = 16;
export const ESANTIOANE_LUT = ESANTIOANE_PER_SEGMENT * (CARDURI - 1) + 1;

const centruX = (coloana: number) => coloana * CELULA - CELULA / 2;
const centruY = (rand: number) => rand * CELULA - CELULA / 2;

/** Hash determinist în [0,1) — `fract(sin(x)·k)`, aceeași familie ca
 *  `Math.sin` din CampulSprite.astro (v4). */
function hash(i: number): number {
  const s = Math.sin((i + 1) * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;

export interface Checkpoint {
  x: number;
  y: number;
  /** Procente din viewBox — direct utilizabile în CSS. */
  xp: number;
  yp: number;
  cta: boolean;
}

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const segV = (x: number, ya: number, yb: number): Segment => ({
  x1: x,
  y1: Math.min(ya, yb),
  x2: x,
  y2: Math.max(ya, yb),
});
const segH = (y: number, xa: number, xb: number): Segment => ({
  x1: Math.min(xa, xb),
  y1: y,
  x2: Math.max(xa, xb),
  y2: y,
});

const EPS = 0.01;

function dePath(segmente: Segment[]): string {
  return segmente
    .map((s) =>
      s.x1 === s.x2
        ? `M${r1(s.x1)} ${r1(s.y1)}V${r1(s.y2)}`
        : `M${r1(s.x1)} ${r1(s.y1)}H${r1(s.x2)}`,
    )
    .join('');
}

export interface Labirint {
  coridor: string;
  ramuri: string;
  grila: string;
  checkpointuri: Checkpoint[];
  /** Poziția subiectului: perechi de procente `[x0, y0, x1, y1, …]`,
   *  parametrizate pe CARD — eșantionul de la `u = k/15` e exact
   *  checkpointul k+1. */
  lut: number[];
  statistici: {
    randuri: number;
    segmenteCoridor: number;
    segmenteRamuri: number;
    segmenteGrila: number;
    lungimeTraseu: number;
    octetiPath: number;
  };
}

let cache: Labirint | null = null;

/**
 * Memoizat: `Labirint.astro` și `Subiect.astro` cer amândouă geometria în
 * frontmatter, iar cele două TREBUIE să primească exact aceleași
 * checkpointuri — altfel subiectul ar ateriza lângă marcaj, nu pe el.
 */
export function genereazaLabirint(): Labirint {
  if (cache) return cache;
  return (cache = construieste());
}

function construieste(): Labirint {
  const colCp = (k: number) => COLOANE_CHECKPOINT[k] ?? 6;
  const cpX = (k: number) => centruX(colCp(k));
  const cpRand = (k: number) => RAND_CP0 + k * PAS_CARD;
  const cpY = (k: number) => centruY(cpRand(k));

  const checkpointuri: Checkpoint[] = COLOANE_CHECKPOINT.map((_, k) => ({
    x: cpX(k),
    y: cpY(k),
    xp: r2((cpX(k) / LAT) * 100),
    yp: r2((cpY(k) / INALT) * 100),
    cta: CARDURI_CTA.has(k + 1),
  }));

  /* ── Coridorul ────────────────────────────────────────────────────────
     Între două checkpointuri sunt PAS_CARD sub-rânduri și |Δcoloană|
     coloane. Traseul le împarte în cinci bucăți — cobor, traversez, cobor,
     traversez, cobor — cu proporțiile trase din hash. Zigzagul e ce face
     diferența dintre „o scară" și „un coridor de labirint": la un singur cot
     per card, ochiul citește un pattern; la trei, citește un drum.

     Fiecare checkpoint rămâne, prin construcție, capătul unei bucăți
     VERTICALE, adică un punct pe o dreaptă, nu un colț. Contează pentru că
     LUT-ul e parametrizat pe card, deci viteza aparentă se schimbă la fiecare
     checkpoint — dar aici schimbarea cade pe o oprire (cardul e în repaus),
     nu în mijlocul unei traversări. */
  const coridor: Segment[] = [];
  const polilinii: { x: number; y: number }[][] = [];

  coridor.push(segV(cpX(0), 0, cpY(0))); // intrarea, de la muchia de sus

  for (let k = 0; k < CARDURI - 1; k++) {
    const x0 = cpX(k);
    const x1 = cpX(k + 1);
    const y0 = cpY(k);
    const y1 = cpY(k + 1);
    const dx = x1 - x0;

    // Trei coborâri, fiecare de cel puțin un sub-rând.
    let d1 = 1 + Math.floor(hash(k * 5 + 1) * (PAS_CARD - 2));
    let d2 = 1 + Math.floor(hash(k * 5 + 2) * (PAS_CARD - d1 - 1));
    d1 = Math.min(d1, PAS_CARD - 2);
    d2 = Math.min(d2, PAS_CARD - d1 - 1);
    const yA = y0 + d1 * CELULA;
    const yB = yA + d2 * CELULA;

    // Două traversări; prima ia între 25% și 75% din drum, rotunjit la celulă.
    const celule = Math.round(dx / CELULA);
    const h1 = Math.round(celule * (0.25 + 0.5 * hash(k * 5 + 3)));
    const xA = x0 + h1 * CELULA;

    const puncte = [
      { x: x0, y: y0 },
      { x: x0, y: yA },
      { x: xA, y: yA },
      { x: xA, y: yB },
      { x: x1, y: yB },
      { x: x1, y: y1 },
    ];
    polilinii.push(puncte);

    for (let i = 1; i < puncte.length; i++) {
      const a = puncte[i - 1];
      const b = puncte[i];
      if (!a || !b) continue;
      if (Math.abs(a.x - b.x) < EPS && Math.abs(a.y - b.y) < EPS) continue;
      coridor.push(a.x === b.x ? segV(a.x, a.y, b.y) : segH(a.y, a.x, b.x));
    }
  }

  coridor.push(segV(cpX(CARDURI - 1), cpY(CARDURI - 1), INALT)); // ieșirea

  /* Nodurile ocupate de coridor — sursa pentru „unde se poate lipi o ramură"
     și pentru „unde NU se poate desena nimic altceva". */
  const cheie = (x: number, y: number) => `${Math.round(x)}:${Math.round(y)}`;
  const ocupate = new Set<string>();
  for (const s of coridor) {
    if (s.x1 === s.x2) {
      for (let y = s.y1; y <= s.y2 + EPS; y += CELULA) ocupate.add(cheie(s.x1, y));
    } else {
      for (let x = s.x1; x <= s.x2 + EPS; x += CELULA) ocupate.add(cheie(x, s.y1));
    }
  }

  const inGrila = (x: number, y: number) =>
    x >= CELULA / 2 - EPS &&
    x <= LAT - CELULA / 2 + EPS &&
    y >= CELULA / 2 - EPS &&
    y <= INALT - CELULA / 2 + EPS;

  /** Nodurile de pe un segment, fără capete (capetele sunt colțuri). */
  function noduriInterioare(s: Segment): { x: number; y: number }[] {
    const rezultat: { x: number; y: number }[] = [];
    if (s.x1 === s.x2) {
      for (let y = s.y1 + CELULA; y <= s.y2 - CELULA + EPS; y += CELULA) rezultat.push({ x: s.x1, y });
    } else {
      for (let x = s.x1 + CELULA; x <= s.x2 - CELULA + EPS; x += CELULA) rezultat.push({ x, y: s.y1 });
    }
    return rezultat;
  }

  /* ── Ramurile-fundătură ───────────────────────────────────────────────
     Se lipesc DE coridor, perpendicular pe el, și se termină în gol — momeala
     pe care o vezi într-un labirint real. Densitate preluată din gramatica
     railului v2, acum structurală, nu cromatică: cardul 1 (hero) deschis,
     cardurile 2–7 (zgomot) dese, 8–16 (claritate) rare.

     Formă în L, nu segment drept: un ciot de o celulă e un ciot; un ciot cu
     cot e un drum care pare că duce undeva și nu duce. Diferența dintre
     „textură" și „labirint" e chiar asta. */
  const ramuri: Segment[] = [];
  for (const s of coridor) {
    const rand = Math.round(s.y1 / CELULA);
    const card = Math.max(1, Math.min(CARDURI, Math.round((rand - RAND_CP0) / PAS_CARD) + 1));
    const dens = card === 1 ? 0.28 : card <= 7 ? 0.5 : 0.16;

    const noduri = noduriInterioare(s);
    for (let i = 0; i < noduri.length; i++) {
      const n = noduri[i];
      if (!n) continue;
      const s0 = Math.round(n.x * 7 + n.y * 13);
      if (hash(s0) > dens) continue;

      const vertical = s.x1 === s.x2;
      const preferat = hash(s0 + 101) < 0.5 ? -1 : 1;
      let dir = 0;
      let px = n.x;
      let py = n.y;
      for (const d of [preferat, -preferat]) {
        const x = vertical ? n.x + d * CELULA : n.x;
        const y = vertical ? n.y : n.y + d * CELULA;
        if (inGrila(x, y) && !ocupate.has(cheie(x, y))) {
          dir = d;
          px = x;
          py = y;
          break;
        }
      }
      if (dir === 0) continue;
      ocupate.add(cheie(px, py));
      const bucata: Segment[] = [vertical ? segH(n.y, n.x, px) : segV(n.x, n.y, py)];

      // Cotul: 1–2 celule pe cealaltă axă.
      const dir2 = hash(s0 + 211) < 0.5 ? -1 : 1;
      const maxim = 1 + Math.floor(hash(s0 + 307) * 2);
      let pasi = 0;
      for (let t = 1; t <= maxim; t++) {
        const x = vertical ? px : px + dir2 * t * CELULA;
        const y = vertical ? py + dir2 * t * CELULA : py;
        if (!inGrila(x, y) || ocupate.has(cheie(x, y))) break;
        ocupate.add(cheie(x, y));
        pasi = t;
      }
      if (pasi > 0) {
        bucata.push(
          vertical
            ? segV(px, py, py + dir2 * pasi * CELULA)
            : segH(py, px, px + dir2 * pasi * CELULA),
        );
      }
      ramuri.push(...bucata);
    }
  }

  /* ── „Celelalte coridoare" (stratul cel mai slab, 0.5px) ──────────────
     NU o grilă completă: la 360×800 celula are 30×50px, deci o grilă plină ar
     pune ~27 de intersecții într-un crop de 200×200px — criteriul V1 din brief
     cere 4–9, iar peste 9 desenul citește ca hârtie milimetrică. Sunt drumuri
     scurte care nu ating coridorul: restul labirintului, dincolo de culoarul
     pe care mergi. */
  const grila: Segment[] = [];
  for (let rand = 1; rand <= RANDURI; rand++) {
    const card = Math.max(1, Math.min(CARDURI, Math.round((rand - RAND_CP0) / PAS_CARD) + 1));
    const cate = card <= 7 ? 2 : 1;
    for (let j = 0; j < cate; j++) {
      const col = 1 + Math.floor(hash(rand * 53 + j * 19) * COLOANE);
      const x0 = centruX(Math.min(COLOANE, Math.max(1, col)));
      const y0 = centruY(rand);
      if (!inGrila(x0, y0) || ocupate.has(cheie(x0, y0))) continue;

      const orizontal = hash(rand * 41 + j * 23) < 0.55;
      const semn = hash(rand * 37 + j * 13) < 0.5 ? -1 : 1;
      const maxim = 2 + Math.floor(hash(rand * 29 + j * 7) * 3); // 2–4 celule

      let pasi = 0;
      for (let t = 1; t <= maxim; t++) {
        const x = orizontal ? x0 + semn * t * CELULA : x0;
        const y = orizontal ? y0 : y0 + semn * t * CELULA;
        if (!inGrila(x, y) || ocupate.has(cheie(x, y))) break;
        pasi = t;
      }
      if (pasi === 0) continue;

      for (let t = 0; t <= pasi; t++) {
        ocupate.add(
          cheie(orizontal ? x0 + semn * t * CELULA : x0, orizontal ? y0 : y0 + semn * t * CELULA),
        );
      }
      grila.push(
        orizontal
          ? segH(y0, x0, x0 + semn * pasi * CELULA)
          : segV(x0, y0, y0 + semn * pasi * CELULA),
      );
    }
  }

  /* ── LUT-ul ───────────────────────────────────────────────────────────
     Parametrizat pe CARD: `u = k/15` dă exact checkpointul k+1, deci
     subiectul ajunge în checkpoint EXACT când cardul k+1 e la repaus. O
     parametrizare pe lungime de arc totală ar fi dat viteză constantă, dar
     subiectul ar fi ratat checkpointul cu până la două carduri — adică „placa
     crește din checkpoint" ar fi devenit o afirmație falsă exact în momentul
     în care se vede. */
  const lut: number[] = [];
  let lungimeTraseu = 0;

  for (let k = 0; k < CARDURI - 1; k++) {
    const puncte = polilinii[k];
    if (!puncte) continue;
    const lungimi: number[] = [];
    let total = 0;
    for (let i = 1; i < puncte.length; i++) {
      const a = puncte[i - 1];
      const b = puncte[i];
      const l = a && b ? Math.abs(b.x - a.x) + Math.abs(b.y - a.y) : 0;
      lungimi.push(l);
      total += l;
    }
    lungimeTraseu += total;

    for (let s = 0; s < ESANTIOANE_PER_SEGMENT; s++) {
      const t = s / ESANTIOANE_PER_SEGMENT;
      let d = t * total;
      let x = puncte[0]?.x ?? 0;
      let y = puncte[0]?.y ?? 0;
      for (let i = 0; i < lungimi.length; i++) {
        const l = lungimi[i] ?? 0;
        const a = puncte[i];
        const b = puncte[i + 1];
        if (!a || !b) break;
        if (d <= l || i === lungimi.length - 1) {
          const f = l > 0 ? Math.min(1, d / l) : 0;
          x = a.x + (b.x - a.x) * f;
          y = a.y + (b.y - a.y) * f;
          break;
        }
        d -= l;
      }
      lut.push(r2((x / LAT) * 100), r2((y / INALT) * 100));
    }
  }
  // Ultimul eșantion: checkpointul 16, exact.
  lut.push(r2((cpX(CARDURI - 1) / LAT) * 100), r2((cpY(CARDURI - 1) / INALT) * 100));

  const coridorD = dePath(coridor);
  const ramuriD = dePath(ramuri);
  const grilaD = dePath(grila);

  return {
    coridor: coridorD,
    ramuri: ramuriD,
    grila: grilaD,
    checkpointuri,
    lut,
    statistici: {
      randuri: RANDURI,
      segmenteCoridor: coridor.length,
      segmenteRamuri: ramuri.length,
      segmenteGrila: grila.length,
      lungimeTraseu,
      octetiPath: coridorD.length + ramuriD.length + grilaD.length,
    },
  };
}
