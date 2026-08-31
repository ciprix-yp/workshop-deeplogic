# QA Report — iterația 2

Verificare a fixurilor din `docs/design/IMPLEMENTATION_NOTES.md` §„Iterația 2",
raportate ca răspuns la `QA_REPORT-iteration-1.md`. Server verificat pe
`http://localhost:4321`. Toate cifrele de mai jos vin din rulare live
(Playwright, chromium real, scripturi ad-hoc în scratchpad de sesiune — nu din
citirea codului), cu excepția locurilor unde e explicit marcat „verificare de cod".

## Verificare live (Playwright MCP)

**Indisponibilă** — confirmat direct din system-reminder-ul de sesiune:
`plugin:playwright:playwright` în stare de eșec cached („Skipping connection —
recent failure cached retries automatically in 15 min"), nu doar un `ToolSearch`
gol. Trecut pe harness-ul din Pasul 2 (`npx playwright test` prin Bash) plus
scripturi Playwright ad-hoc (chromium API directă), exact ca în iterația 1.
Toate rezultatele de mai jos sunt din rulare reală în browser.

## Regresie vizuală

**Diff real față de baseline-ul iterației 1, așteptat și verificat ca intenționat
— nu regresie.**

- `mobile` (375×812) și `desktop-reduced-motion` (1440×900): diff peste
  `maxDiffPixelRatio` (3%, respectiv 4%). `tablet` (768×1024) și `desktop`
  (1440×900, motion normal): 0 diff.
- Cauza diff-ului: fix #1 (`safe center`) schimbă fundamental poziția
  conținutului în interiorul fiecărui card cu overflow — exact efectul dorit
  (titlul nu mai e împins deasupra ariei vizibile). Baseline-ul iterației 1 a
  fost capturat CU bug-ul de centrare unsafe încă activ, deci diferă structural
  de randarea corectă de acum. Verificat vizual, nu presupus: am inspectat
  `mobile-actual.png` și `desktop-reduced-motion-actual.png` (screenshot-urile
  „primite" din rularea eșuată) — layout corect, titluri vizibile pe fiecare
  card, zero elemente rupte/suprapuse.
- **Am actualizat baseline-ul** (`--update-snapshots`, 5/5) — parte din scopul
  declarat al Pasului 2 (excepția explicită din instrucțiuni), nu o modificare
  de cod. Re-rulare fără flag după actualizare: **5/5, zero diff — determinist**.
  Acesta devine reperul pentru iterația 3, dacă va fi necesară.
- Suplimentar, `node scripts/screenshots.mjs` (360/390/768/1280/1920,
  breakpoint-urile native ale proiectului): **zero defecte** pe toate cele 5
  ecrane (zero scroll orizontal, zero erori consolă, exact un `h1`/pagină,
  diacritice ș/ț prezente).
- Suita `tests/e2e/*.spec.ts`: **38/38**, confirmă independent cifra din
  `IMPLEMENTATION_NOTES.md`.

## Anti-slop (`impeccable detect .`)

**0 rezultate noi.** Aceleași 2 preexistente, deja disclosed:
`broken-image` (`S11Facilitator.astro:9`, placeholder) și `em-dash-overuse`
advisory (`Base.astro`, agregat pe body text).

## Defectul major din iterația 1 — verificat, REZOLVAT pe toate cele 16 carduri

Am remăsurat independent poziția `h1`/`h2` la `scrollTop: 0`, pe toate cele 16
carduri (`[data-card]`), la **360×800 ȘI 1920×1080** (nu doar §02/§08):

| # | id | 360×800 headingTop | 1920×1080 headingTop |
|---|---|---|---|
| 0 | primar (hero) | 59.8px | 214.4px |
| 1 | problema | 20.0px | 39.6px |
| 2 | rezultatul | 20.0px | 57.5px |
| 3 | pentru-cine | 76.8px | 401.9px |
| 4 | inainte-dupa | 20.0px | 254.4px |
| 5 | ce-facem | 20.0px | 71.3px |
| 6 | nu-doar-teorie | 120.4px | 346.3px |
| 7 | ce-pleci-cu-tine | 20.0px | 80.9px |
| 8 | use-cases | 20.0px | 247.7px |
| 9 | deep-logic | 108.4px | 359.9px |
| 10 | facilitator | 20.0px | 323.3px |
| 11 | precedent | 190.9px | 403.3px |
| 12 | detalii | 20.0px | 250.3px |
| 13 | de-ce-gratuit | 20.0px | 172.0px |
| 14 | intrebari | 20.0px | 113.5px |
| 15 | inscriere | 20.0px | 20.0px |

**Toate cele 16 valori sunt pozitive (vizibile) — zero excepții, pe ambele
breakpoint-uri.** Confirmat în cod: `justify-content: safe center` prezent
identic pe `.sectiune.card` (`Sectiune.astro:131`) ȘI pe `.hero`
(`S01Hero.astro:68`) — paritatea susținută de motion-engineer e reală, nu doar
declarată. Blocker-ul de accesibilitate din iterația 1 e **rezolvat complet**.

## Amploarea overflow-ului la `100dvh` — remăsurat corect (post-fix #1)

Confirmat empiric: bug-ul vechi de `scrollHeight` subestimat e real — motivul
tehnic e corect (centrarea unsafe ascundea jumătate din exces deasupra ariei
vizibile, deci `scrollHeight - clientHeight` nu-l număra). Cifrele de mai jos
sunt măsurate DUPĂ fix #1, deci autoritative:

| Breakpoint | Carduri afectate | Detalii |
|---|---|---|
| 360×800 | **12/16** | neafectate: §04, §07, §10, §12 (toate la 0px) |
| 390×844 | 12/16 | aceleași 4 neafectate |
| 768×1024 | 3/16 | §02 (295px), §08 (43px), §16 (1406px, excepție) |
| 1280×800 | 6/16 | §02, §03, §06, §08, §15, §16 |
| 1920×1080 | **1/16** | doar §16 (1424px, excepție acceptată explicit) |

**Confirmă exact** cifrele raportate de motion-engineer pentru cele 4 secțiuni
retunate + §16, la ambele breakpoint-uri de referință — potrivire exactă, px cu
px:

| Card | 360×800 (raportat / verificat) | 1920×1080 |
|---|---|---|
| §02 problema | 885px / **885px** ✓ | 0px / **0px** ✓ |
| §04 pentru-cine | 0px / **0px** ✓ | 0px / **0px** ✓ |
| §06 ce-facem | 612px / **612px** ✓ | 0px / **0px** ✓ |
| §08 ce-pleci-cu-tine | 684px / **684px** ✓ | 0px / **0px** ✓ |
| §15 intrebari | 376px / **376px** ✓ | 0px / **0px** ✓ |
| §16 inscriere (excepție) | 2679px / **2679px** ✓ | 1424px / **1424px** ✓ |

**Zero carduri cu overflow la 1920×1080** în afara excepției §16 — confirmat.
**12/16 la 360×800** (era 13/16 în iterația 1) — confirmat, cu exact aceleași
4 carduri ieșite din listă (§04 nou intrat la 0px; §07/§10/§12 deja la 0px).

Verificare vizuală suplimentară (nu doar cifre): capturi la 1920×1080 și
360×800 pe §02/§06/§08 — grid-ul nou de 3 coloane la `min-width: 64rem` randează
corect, fără suprapuneri, fără conținut tăiat; la 360×800 titlul e vizibil sus,
indicatorul de scroll prezent și corect poziționat deasupra `CtaSticky`.

## Fix #3 — interruptibilitate hijack (verificat empiric)

Metodologie: navigare pe un card fără overflow intern (§10 `deep-logic`, ca să
izolez hijack-ul de `poateAvansa`), apoi două flick-uri wheel rapide succesive
(al doilea la +150ms, în interiorul saltului de 450ms).

```
start: scrollY=7200 (card index 9, deep-logic)
end:   scrollY=8800 (card index 11, precedent)
distanță parcursă: 2 carduri (așteptat: 2)
```

**Confirmat** — înainte de fix (iterația 1): 1 card. Acum: 2 carduri. Al doilea
gest se acumulează în `tintaCoada` și se aplică înlănțuit, nu mai e ignorat.

## Fix #4 — indicator fals după derulare completă (verificat empiric)

```
scrollTop=0   → .indicator-scroll { display: flex }   (overflow=885px, §02)
scrollTop=max → .indicator-scroll { display: none }   (după eveniment `scroll`)
```

**Confirmat** — `.scroll-vazut-complet` se togglează corect pe eveniment
`scroll`, cu pragul `scrollHeight - clientHeight - scrollTop <= 1`, și câștigă
în cascadă (specificitate egală, declarat ultimul) inclusiv față de media
query-ul de 559.98px.

## Fix #5 — easing pe `.segment` (verificare de cod)

Confirmat în `RailFir.astro:119`: `transition: opacity 240ms ease-out,
transform 240ms ease-out` (era `ease`). Proprietate CSS statică, fără
comportament dinamic de testat live — verificare de cod suficientă, cum a
precizat și motion-engineer.

## Animație (`review-animations` — cele zece standarde)

Aplicat manual pe diff-ul iterației 2 (nu s-au atins fișiere de conținut/
tipografie cu proprietăți de `transition`/`animation` — verificat prin grep,
zero rezultate pe `S02Problema.astro`, `S04PentruCine.astro`,
`S06CeFacem.astro`, `S08CePleciCuTine.astro`, `S15Faq.astro`).

| Standard | Verdict pe iterația 2 |
|---|---|
| 3. Responsive easing | Rezolvat — `.segment` trece la `ease-out` (era finding-ul cosmetic din iterația 1) |
| 6. Interruptibilitate | Rezolvat — gestul al doilea acum retarghetează, nu e ignorat (finding-ul minor din iterația 1) |
| 7. GPU-only | Neschimbat, tot conform — `tintaCoada`/`navigheazaLa` scriu tot `window.scrollTo`, zero proprietăți noi de layout animate |
| 8. Accesibilitate | Fix #4 e disclosure (`display:none/flex`), nu mișcare — corect independent de `prefers-reduced-motion`, ca și `.deruleaza-real` |

**Verdict: Approve.** Ambele finding-uri deschise de iterația 1 (interruptibilitate,
easing) sunt rezolvate, verificate live/în cod. Zero regresii noi introduse de
retunarea de tipografie (nicio proprietate de animație atinsă în acele fișiere).

## Regresie — tot ce iterația 1 confirmase deja corect, re-verificat live

- **Hijack pe viteza gestului**: wheel rapid → salt de exact 1 card (confirmat,
  800px la 1280×800); wheel lent (10px) → nativ, zero interceptare; touch rapid
  (flick simulat via CDP) → salt ~1 card; touch lent (drag) → nativ (55px).
- **Stress test**: 30 de flick-uri wheel succesive (mai multe decât cele 18 din
  iterația 1, necesar fiindcă acum overflow-ul remăsurat corect e mai mare,
  deci mai multe carduri cer un flick suplimentar de „epuizare" a scroll-ului
  intern înainte de a avansa — comportament corect, protejează conținutul
  necitit, nu bug) → aterizează exact pe ultimul card (§16, scrollY=12000),
  segmentul `activ` de pe rail sincron (index 15), **zero erori de consolă/pagină**.
- **Tastatură vs. formular**: focus pe radio din §16 (cu pagina deja scrollată
  acolo — setup corect, spre deosebire de o primă încercare eronată în care am
  focalizat radio-ul fără să scrolez întâi pagina, ceea ce a produs exact
  fals-pozitivul documentat în iterația 1 — `scrollIntoView` nativ pe focus
  de la distanță, nu bug al aplicației), `ArrowDown` → `window.scrollY`
  neschimbat (12000 înainte/după), `scrollTop` intern al cardului se schimbă
  (0→808), radio selectat corect. Checkbox + `Space` → bifează, scroll extern
  neschimbat. Focus pe `<body>` + `Space` → salt de exact 800px (un card).
- **`prefers-reduced-motion: reduce`**: wheel → scroll nativ de exact 300px
  (suma deltas, zero salt animat), `html` fără clasă suplimentară; tilt-ul de
  card nu scrie deloc `transform` (bail-out complet înainte de orice
  `addEventListener`, confirmat: niciun listener atașat).
- **`§17` (footer)**: `hasDataCard: false`, `hasDataTilt: false`,
  `totalDataCard: 16`, `totalRailSegments: 16` — footer-ul rămâne complet în
  afara sistemului.
- **Contrast**: `npm run contrast` → 18/18 perechi peste prag, zero hex noi
  (neschimbat față de iterația 1 — nicio culoare nouă introdusă).
- **Tilt vs. reveal**: `document.querySelectorAll('[data-tilt][data-reveal]').length === 0`
  — zero conflict.
- **Zero erori de consolă**: confirmat pe toate scripturile de mai sus (wheel,
  touch, tastatură, reduced-motion, stress test) — array de erori gol de
  fiecare dată.
- **Anti-slop**: 0 regresii (vezi mai sus).
- **Suita Playwright existentă**: 38/38.

## Accesibilitate / Performanță

- `npm run check` (astro check): 0 erori / 0 avertismente / 70 fișiere.
- `npm run test` (vitest): 135/135.
- `npm run build`: complet, fără erori.
- Performanță (aproximativă — `chrome-devtools` MCP indisponibil, confirmat de
  system-reminder, la fel ca playwright MCP; server de **dev**, nu producție):
  LCP ≈ 212ms, CLS = 0 (inclusiv după un salt de hijack), TTFB ≈ 18ms —
  consistent cu iterația 1 (192ms/0/17ms), nicio regresie de performanță
  vizibilă la acest nivel de aproximare. Recomand remăsurare pe
  `npm run build && npm run preview` într-o rundă cu acces la chrome-devtools MCP.

## Verdict

**Gata de livrare.**

Toate cele cinci defecte din `QA_REPORT-iteration-1.md` sunt rezolvate și
verificate live, nu doar citite în cod:

1. [Major] Centrare unsafe → `safe center` pe toate cele 16 carduri, la
   360×800 ȘI 1920×1080, zero excepții — blocker-ul de accesibilitate e închis.
2. [Amploare] Overflow remăsurat corect, retunare tipografică confirmată:
   12/16 la 360×800 (era 13/16), 1/16 la 1920×1080 (doar excepția §16, era
   4/16) — cifrele motion-engineer-ului se potrivesc px cu px cu măsurătoarea
   mea independentă.
3. [Minor] Interruptibilitate hijack — două flick-uri rapide aterizează acum
   la 2 carduri distanță (verificat empiric), nu 1.
4. [Minor] Indicator fals după derulare completă — ascuns corect la
   `scrollTop` maxim, verificat cu eveniment `scroll` real.
5. [Cosmetic] Easing `.segment` → `ease-out`, confirmat în cod.

Zero regresii noi introduse: suita e2e (38/38), suita unitară (135/135),
anti-slop (0 rezultate noi), contrast (18/18), build/check (0 erori),
mecanismul de hijack pe viteză, separarea tastatură/formular, bail-out-ul de
`prefers-reduced-motion`, izolarea §17/footer, absența conflictului
tilt/reveal — toate re-verificate live și confirmate neatinse.

Singurul element rămas explicit ca decizie de conținut/design (nu de mecanism,
nesemnalat ca defect): la 360×800, 12/16 carduri tot depășesc `100dvh` și
rămân pe fallback-ul de scroll intern — funcțional, accesibil, cu indicator
corect, dar nu „fit perfect" pe toate. Acesta e comportamentul acceptat
explicit de `IMPLEMENTATION_NOTES.md`/`DESIGN_BRIEF.md` (fallback ca normă, nu
eșec), nu un defect deschis.
