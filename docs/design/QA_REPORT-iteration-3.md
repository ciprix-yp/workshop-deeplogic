# QA Report — iterația 3

Verificare a „Câmpul" (v3, layer de fundal SVG animat pe toate cele 16 carduri) —
`docs/design/DESIGN_BRIEF.md` v3 + `docs/design/IMPLEMENTATION_NOTES.md`
„v3 — Câmpul". Server verificat pe `http://localhost:4321`. Toate cifrele de mai
jos vin din rulare live (chromium real, prin `playwright-core`, scripturi ad-hoc
în scratchpad de sesiune, plus `npx playwright test`) — nu din citirea codului,
cu excepția locurilor marcate explicit „verificare de cod".

## Verificare live (Playwright MCP)

**Indisponibilă** — confirmat din system-reminder-ul de sesiune:
`plugin:playwright:playwright` în stare de eșec cached ("Skipping connection").
Trecut pe harness-ul din Pasul 2 (`npx playwright test`) plus scripturi Playwright
ad-hoc (`playwright-core`, `chromium.launch()` direct — API identică, doar
orchestrată prin Bash/Node în loc de tool-uri MCP), exact ca în iterațiile 1-2.
Toate rezultatele de mai jos sunt din rulare reală în browser, inclusiv
`getComputedStyle`, screenshot-uri și simulare de gesturi (`page.mouse.wheel`,
`page.keyboard.press`).

## Regresie vizuală

**Diff real față de baseline-ul iterației 2, așteptat și confirmat ca intenționat
(adăugarea Câmpul), nu regresie.**

- Prima rulare (4 workers, `fullyParallel: true`): `desktop` și
  `desktop-reduced-motion` au picat la `maxDiffPixelRatio` (3%/peste), `mobile`
  și `tablet` au trecut sub prag. Am inspectat diff-ul (`desktop-diff.png`,
  `desktop-actual.png`): diferența e exact liniile Câmpul (zigzag pe §02-§07,
  drepte pe §08-§16) — text intact, lizibil, zero elemente rupte/suprapuse.
  Confirmă vizual ce spune `IMPLEMENTATION_NOTES.md`, nu contrazice.
- **Am actualizat baseline-ul** (`--update-snapshots`, excepția declarată a
  Pasului 2). La actualizare și la re-rularea imediat următoare, `mobile` și
  `tablet` au picat sporadic cu `Timeout 5000ms exceeded` în timpul
  stabilizării screenshot-ului — **nu** cu un pixel-diff raportat. Am rulat
  suita cu `--workers=1` (elimină contenția de CPU pe 4 chromium-uri
  paralele): **5/5, zero eșecuri, determinist.** Concluzie: flake de resurse
  pe mașina locală, nu instabilitate cauzată de animația Câmpul (care oricum e
  `translate3d` compositor, nu recalcul de layout). Noul baseline (cu Câmpul)
  devine reperul pentru o eventuală iterație 4.
- Suita `tests/e2e/*.spec.ts`: **38/38** (mobil-360 + desktop), neschimbat.

## Anti-slop (`impeccable detect .`)

**0 rezultate noi.** Aceleași 2 preexistente, deja disclosed în iterațiile
anterioare: `broken-image` (`S11Facilitator.astro:9`, placeholder) și
`em-dash-overuse` advisory (`Base.astro`, agregat pe body text). Scanat pe `.`
(rădăcina proiectului), nu doar `src/`.

## Contrast (`npm run contrast`) — miza centrală a rundei

**18/18, zero perechi noi, zero regresie.** Rulat direct, nu presupus din cod:

```
ok 12.74:1 corp pe fundal primar          ok  6.15:1 CTA — text alb pe buton
ok 10.24:1 corp pe fundal secundar        ok  6.15:1 CTA — link pe fundal primar
ok  9.33:1 corp pe fundal succes          ok  4.94:1 CTA — link pe fundal secundar
ok  8.93:1 secundar pe fundal primar      ok  4.91:1 coloana ÎNAINTE (§05)
ok  7.18:1 secundar pe fundal secundar    ok  5.90:1 mesaj eroare pe alb
ok  4.06:1 accent decorativ (text mare)   ok  4.74:1 mesaj eroare pe fundal secundar
ok  4.06:1 accent decorativ (bordură/UI)  ok 15.83:1 titlu pe fundal închis
ok  8.86:1 corp secundar pe fundal închis ok  8.91:1 accent clar pe fundal închis
ok  8.91:1 CTA pe întuneric               ok 12.72:1 fundal secundar ca text pe închis
```

Confirmă exact ce susține `IMPLEMENTATION_NOTES.md`: scrim-ul reutilizează
perechile deja verificate, zero calcul nou introdus de Câmpul.

### Mecanismul de scrim — verificat prin `getComputedStyle`, nu doar vizual

Pentru fiecare mostră: `background` === `box-shadow` (culoare), exact
comportamentul „invizibil ca formă" descris în brief (interior și exterior,
aceeași culoare exactă, zero muchie posibil vizibilă):

| Element | Registru | `--bg-registru` moștenit | `background` | `box-shadow` |
|---|---|---|---|---|
| `.hero h1` | primar | `#ffffff` | `rgb(255,255,255)` | `rgb(255,255,255) 0 0 0 7.98px` |
| `#problema h2` | primar | `#ffffff` | `rgb(255,255,255)` | `rgb(255,255,255) 0 0 0 6.98px` |
| `#inainte-dupa td` | **secundar** | `#e4e7e7` | `rgb(228,231,231)` | `rgb(228,231,231) 0 0 0 2.85px` |
| `#ce-pleci-cu-tine h2`/`p` | **închis** | `#1b2426` | `rgb(27,36,38)` | `rgb(27,36,38) 0 0 0 …px` |
| `.vacarm-bloc p` (sub-bloc, în card primar) | override local | `#1b2426` | `rgb(27,36,38)` | idem — **corect, ignoră registrul cardului-părinte** |
| `.granita h3` (sub-bloc, în card primar) | override local | `#e4e7e7` | `rgb(228,231,231)` | idem |
| `#ce-facem .format p` (sub-bloc) | override local | `#c9e3d0` (succes) | `rgb(201,227,208)` | idem |
| `.bife label` (§16, sub-bloc) | override local | `#e4e7e7` | `rgb(228,231,231)` | idem |

**Toate cele 3 registre** (primar/secundar/închis) confirmate cu valoarea
corectă, nu doar fundalul alb implicit — plus 4 sub-blocuri cu registru propriu,
toate corect izolate de registrul cardului-părinte (ex: `.vacarm-bloc`, închis,
trăiește într-un card `primar`, și tot primește scrim închis, nu alb).
Spread-ul `box-shadow` scalează cu `em`-ul fiecărui element (7.98px pe `h1`,
2.85px pe `p`/`td`/`label`) — confirmă „padding în `em`" din brief, implementat
via `box-shadow`, nu `padding` literal (deviere documentată, verificată aici ca
funcțională).

### Scrim vizual — screenshot-uri, nu presupunere

Capturi pe §02 (zgomot/primar), §05 (zgomot/secundar, `<table>`), §08
(clar/închis), §16 (clar, formular) — la 390×844 și 1280×900. **Zero „cutie"
vizibilă în jurul textului pe toate cele 8 combinații** (4 secțiuni × 2
breakpoint-uri): liniile Câmpul trec complet invizibil pe sub fiecare bloc de
text, inclusiv exact peste rânduri de tabel (§05) și peste eticheta „Structura
de prompt" din §08 unde o linie diagonală traversează întregul rând. Niciun ban
din `craft-floor.md`/`DECIZII.md` („card în card") încălcat.

**Observație minoră, nu defect** (pattern deja disclosed de motion-engineer la
§05 desktop): în §16, o linie a Câmpul devine vizibilă peste marginea de sus a
câmpurilor de input GOALE („Firma și rolul tău" pe desktop, „Email" pe mobil) —
input-urile nu sunt în lista de tag-uri cu scrim (`h1..th`), pentru că nu poartă
text propriu. Exact comportamentul „vizibil în spațiul negativ, invizibil peste
text" descris în brief — zero problemă WCAG (nu există text acolo), nu un
defect nou.

## Mapare stare↔secțiune a Câmpul — verificată live pe toate cele 16 carduri

`getComputedStyle` pe `.campul`/`.linii`, per card:

| Index | Secțiune | `data-camp` | Culoare (`--camp-culoare`) |
|---|---|---|---|
| 0 | hero | `neutru` | `rgb(70,137,132)` (accent-decor) |
| 1-6 | problema…nu-doar-teorie | `zgomot` | `rgb(70,137,132)` |
| 7 | ce-pleci-cu-tine (**închis**) | `clar` | `rgb(127,209,196)` (**accent-clar**) |
| 8-15 | use-cases…inscriere | `clar` | `rgb(70,137,132)` |

**Exact maparea din brief** (§01 neutru · §02-§07 zgomot · §08-§16 clar), și
culoarea comută corect pe singurul registru închis din cele 16 (§08) — restul
rămân pe `accent-decor`. Confirmat și vizual (linii dese/frânte pe §02/§05,
rare/drepte pe §08/§16, vezi capturile de mai sus).

## Performanță și disciplină de execuție a Câmpul

- **Play-state** (`animation-play-state`, toate cele 16 `.linii`, 3 poziții de
  scroll): start (scrollY=0) → **2 running / 14 paused**; mijloc (cardul index
  8) → **3 running / 13 paused**; final (ultimul card) → **2 running / 14
  paused**. Niciodată mai mult de 2-3 din 16, exact cum susține
  `IMPLEMENTATION_NOTES.md`.
- **`prefers-reduced-motion: reduce`**: toate cele **16/16** `.campul` cu
  `display: none` — verificat cu context Playwright `reducedMotion: 'reduce'`,
  nu presupus din regula CSS.
- **Buget de octeți**: cele 3 `<symbol>` (`camp-neutru`/`camp-zgomot`/
  `camp-clar`) randate în DOM însumează **1341 bytes** (doar conținutul
  symbol-urilor) / **1447 bytes** (elementul `<svg>` sprite complet, cu
  wrapper). Motion-engineer raportează 1483 bytes — diferență mică, probabil
  metodă de măsurare (whitespace/atribute incluse diferit) — în orice caz, cu
  o marjă uriașă sub bugetul de 15KB din brief, indiferent de metoda exactă.
- **`§17` (footer)**: `hasDataCard: false`, `hasCampul: false` — Câmpul
  rămâne complet în afara footer-ului, izolare confirmată.

## Regresie hijack — riscul semnalat de motion-engineer (`scrollHeight`/`poateAvansa`)

**Verificat direct riscul specific: un Câmpul supradimensionat ar fi umflat
`scrollHeight` artificial.** Am remăsurat overflow-ul intern la 360×800 (același
breakpoint și acelea și 16 carduri din `QA_REPORT-iteration-2.md`) și comparat
cifră cu cifră cu baseline-ul PRE-Câmpul:

| Card | Iterația 2 (fără Câmpul) | Iterația 3 (cu Câmpul) |
|---|---|---|
| §02 problema | 885px | **885px** ✓ identic |
| §04 pentru-cine | 0px | **0px** ✓ |
| §06 ce-facem | 612px | **612px** ✓ identic |
| §07 nu-doar-teorie | 0px | **0px** ✓ |
| §08 ce-pleci-cu-tine | 684px | **684px** ✓ identic |
| §10 deep-logic | 0px | **0px** ✓ |
| §12 precedent | 0px | **0px** ✓ |
| §15 intrebari | 376px | **376px** ✓ identic |
| §16 inscriere (excepție) | 2679px | **2679px** ✓ identic |

**Zero px de diferență pe toate cele 9 carduri raportate în iterația 2** —
fix-ul motion-engineer-ului (`.campul` clipat exact la `inset:0; overflow:hidden`,
doar `.linii` interior e supradimensionat) funcționează matematic, nu doar
„pare corect": Câmpul contribuie **zero** la `scrollHeight`, deci `poateAvansa()`
nu e afectat.

**Test funcțional, pe un card FĂRĂ overflow intern** (§10 `deep-logic`, la
1280×900): un singur gest wheel rapid (`page.mouse.wheel(0, 800)`) → salt de
exact **900px** (o înălțime de card), identic comportamentului v2.

**Test funcțional, pe un card CU overflow intern** (§02 `problema`, overflow
măsurat 149px la 1280×900): primul gest wheel rapid → `window.scrollY`
**neschimbat** (900→900), overflow-ul intern al cardului absoarbe gestul
(`scrollTop` intern crește 0→129, nativ) — **nu sare peste conținut necitit**.
Al doilea gest, după ce overflow-ul intern e epuizat → salt extern de exact
**900px** (un card), acum că `poateAvansa()` întoarce `true`. Comportament
corect pe ambele tipuri de card, fără regresie.

## Regresie — restul verificat live din iterațiile 1-2, re-confirmat

- **Indicator de scroll intern**: pe §02 la 360×800, `display: flex` la
  `scrollTop=0`, comută la `display: none` după `scrollTop = scrollHeight` +
  eveniment `scroll` — funcționează identic cu Câmpul în fundal.
- **Tastatură vs. formular**: focus pe radio din §16 (cu pagina scrollată
  acolo întâi), `ArrowDown` → `window.scrollY` neschimbat (13500→13500).
  Separarea rămâne intactă.
- **Izolare §17/footer**: confirmată mai sus (`hasDataCard`/`hasCampul`: false).
- **Tilt vs. reveal**: `document.querySelectorAll('[data-tilt][data-reveal]').length === 0`
  — zero conflict, neschimbat.
- **Contrast**: 18/18 (secțiune dedicată mai sus).
- **Zero erori de consolă**: confirmat pe toate scripturile ad-hoc (0 erori la
  încărcare, la wheel, la tastatură, la reduced-motion) + testul dedicat din
  harness (`no console errors on load`: pass).
- **Anti-slop**: 0 regresii noi (vezi mai sus).
- **Suita Playwright existentă**: 38/38.
- **`npm run check`** (astro check): 0 erori / 0 avertismente / 72 fișiere
  (70 + `Campul.astro` + `CampulSprite.astro`).
- **`npm run test`** (vitest, include `copy-invariants.test.ts`): **135/135**.
- **`npm run build`**: complet, fără erori.

## Animație (`review-animations` — cele zece standarde, aplicat manual)

| Standard | Verdict pe Câmpul (v3) |
|---|---|
| 1. Justified motion | **Tensiune notă, nu blocantă**: Câmpul e pur decorativ, zero semnal de stare — cerință explicită a userului, evaluată și motivată în brief împotriva a două alternative respinse (gradient animat, particule canvas). Nu e „arată cool" nejustificat: e o decizie de direcție vizuală documentată, cu disciplină de execuție (vezi mai jos) care limitează exact riscul pe care standardul îl vizează. |
| 2. Frequency-appropriate | Conform — element ambiental mereu vizibil, dar amplitudine minimă (translate 3%/2.4% pe ciclu de 46-90s), echivalent tier „redus", potrivit pentru ceva văzut continuu. |
| 3. Responsive easing | N/A pe sensul strict al standardului (nu e intrare/ieșire de UI) — `ease-in-out` pe o buclă ambientală simetrică e alegerea corectă convențional, nu o încălcare de „ease-in pe UI". |
| 4. Sub-300ms UI | N/A — buclă ambientală (46-90s), nu interacțiune UI. `.segment` (Firul) rămâne 240ms `ease-out`, neschimbat, deja aprobat în iterația 2. |
| 5. Origin/fizicalitate | N/A — fără popover/tooltip/dropdown implicat. |
| 6. Interruptibilitate | Conform — `animation-play-state: paused` îngheață la frame-ul curent (nu resetează la 0), reluarea continuă de unde a rămas. Comutare de clasă instant, fără sughiț. |
| 7. GPU-only | Conform, exemplar — exclusiv `transform: translate3d`, `will-change: transform`, zero proprietăți de layout animate. |
| 8. Accesibilitate | **Depășește bara** — sub `prefers-reduced-motion`, elementul nu doar „încetinește", dispare complet (`display:none`), motivat explicit: zero informație purtată, deci eliminarea completă nu costă nimic funcțional. Verificat live (16/16). |
| 9. Enter/exit asimetric | N/A — fără interacțiune press/hold. |
| 10. Coeziune | Conform, exemplar — „Firul multiplicat": aceeași gramatică vizuală (frânt/drept), aceeași paletă licențiată (`--accent-decor`/`--accent-clar`), z-index sub tot conținutul, limbaj mat identic cu restul `tokens.css` (zero blur/gradient). |

**Verdict: Approve.** Zero găsiri blocante. Singura tensiune (Standard 1) e
recunoscută explicit în brief și mitigată prin disciplina de execuție (instanțe
limitate, amplitudine mică, eliminare completă pe reduced-motion) — nu se
califică drept regresie de „feel", nu e pe o acțiune de tastatură/frecvență
mare, nu are `ease-in`/`scale(0)`/`transition: all`.

## Accesibilitate / Performanță

- Toate verificările de mai sus (contrast, scrim, reduced-motion,
  tastatură/formular, tilt/reveal) sunt și verificări de accesibilitate.
- Performanță (aproximativă — `chrome-devtools` MCP indisponibil, confirmat de
  system-reminder; server de **dev**, nu producție, la fel ca iterațiile 1-2):
  TTFB ≈ 7ms, First Contentful Paint ≈ 220ms — consistent cu iterațiile 1-2
  (192-212ms), nicio regresie de performanță vizibilă la acest nivel de
  aproximare. `box-shadow`-ul scrim-ului e proprietate pur de pictură (zero
  impact pe layout/CLS, confirmat indirect prin `astro check`/`build` fără
  erori și prin faptul că iterația 2 a rezolvat deja problemele de layout pe
  care un `padding` literal le-ar fi putut reintroduce).

## Verdict

**Gata de livrare.**

Toate cele patru zone de risc semnalate explicit în dispecerizare sunt
verificate live, cu rezultat pozitiv:

1. **Contrast/scrim** — `npm run contrast` 18/18, zero perechi noi; scrim-ul
   verificat prin `getComputedStyle` pe toate cele 3 registre + 4 sub-blocuri
   cu registru propriu, `background === box-shadow` (invizibil ca formă)
   confirmat numeric, nu doar vizual; zero „cutie" vizibilă pe 8 combinații
   secțiune×breakpoint (inclusiv `<table>`-ul din §05 și formularul §16).
2. **Performanță Câmpul** — play-state niciodată peste 3/16 `running`
   (2/3/2 la start/mijloc/final); `prefers-reduced-motion` → 16/16
   `display:none`; buget de octeți confirmat sub prag (1341-1447 bytes,
   consistent cu cifra motion-engineer-ului, ambele mult sub 15KB).
3. **Regresie hijack** — riscul specific (`scrollHeight` umflat de Câmpul
   supradimensionat) verificat și infirmat cu potrivire exactă, px cu px, pe
   toate cele 9 carduri raportate în iterația 2; comportament corect pe card
   fără overflow (900px/gest) și pe card cu overflow (§02: nu sare peste
   conținut necitit, avansează exact un card după epuizare).
4. **Regresii pe tot ce iterațiile 1-2 confirmaseră** — zero: tastatură/
   formular, izolare footer, tilt/reveal, contrast, anti-slop, 38/38 e2e,
   135/135 unitare, 0 erori `astro check`, build curat.

Singura observație rămasă e cosmetică, non-blocantă și deja precedentă
(disclosed de motion-engineer la §05 desktop): o linie a Câmpul vizibilă peste
marginea unui input gol în §16 — spațiu negativ, fără text, fără impact WCAG.
Nu justifică o iterație 4.
