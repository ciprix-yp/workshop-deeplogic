# Implementation Notes — v2, layout „cartonaș" + scroll hijack

Implementare peste pagina live existentă, pornind strict de la
`docs/design/DESIGN_BRIEF.md` (v2) și `docs/DECIZII.md` ("Layout «cartonaș»
+ scroll hijack real"). Iterația 1. Nu s-au atins: `src/content/copy.ts`,
structura de 17 secțiuni, logica de formular/backend.

## Stack — zero dependințe noi

Proiectul e Astro simplu (fără React/Tailwind/shadcn) — pasul de scaffold
shadcn din pipeline nu se aplică (deja confirmat în brief, secțiunea
„Preset shadcn de plecare"). Nu există GSAP/Motion/Lenis în `package.json`
și n-am adăugat niciunul: brief-ul recomandă explicit „mână scrisă, nu
Lenis" pentru mecanismul de hijack (motivat pe larg în secțiunea „Nivel de
motion" a brief-ului), consecvent cu disciplina deja stabilită în proiect
(`Base.astro`: reveal ~700 bytes zero dependințe, `data-tilt` reimplementat
de mână). Tot ce urmează e JS/CSS simplu, `is:inline`, fără build step.

## Din registry

Nimic nou din niciun catalog de componente — brief-ul cere modificarea
componentelor existente (`Sectiune.astro`, `data-tilt`), nu componente noi
dintr-un registry.

## Scris de mână

- **`Sectiune.astro` — mod nou `inaltime="card"`** (implicit): fiecare
  secțiune ocupă exact `100dvh`, centrată vertical, cu fallback de scroll
  intern. Motiv: e chiar componenta-sursă de adevăr pentru toate cele 15
  secțiuni din `<main>`; brief-ul cere explicit modificarea ei, nu o
  componentă separată.
- **`S01Hero.astro`** — aceeași regulă de card, scrisă direct în stilul
  propriu (hero nu trece prin `Sectiune.astro`), exact cum cere brief-ul.
- **`IndicatorScrollIntern.astro`** (nou) — chevron SVG autorat + scrim,
  extras într-o componentă separată ca să nu se dubleze markup-ul între
  `Sectiune.astro` și `S01Hero.astro`. Motiv „scris de mână": brief-ul
  interzice explicit un glyph unicode/emoji ca substitut de iconiță.
- **`RailFir.astro`** (nou) — elementul-semnătură (firul segmentat) +
  controller-ul unic de navigare pe carduri (hijack, tastatură, tilt de
  card recalibrat, aprindere rail, disclosure de overflow). Motiv: e
  exact elementul-semnătură + coregrafia de scroll cerută de brief —
  scrisă de mână, GSAP/ScrollTrigger ar fi disproporționat pentru o
  interacțiune care trebuie să rămână 100% nativă pe calea lentă (vezi
  argumentul din brief, „Reconciliere cu recomandarea v1 împotriva Lenis").
- **`Base.astro`** — un singur edit țintit: selectorul scriptului de tilt
  existent devine `[data-tilt]:not([data-tilt="card"])`, ca să nu se
  suprapună cu noul tilt de card (constante diferite: MAX_GRADE 8/perspective
  700px vs. 2/1600px — vezi „Decizii GSAP-vs-Motion" mai jos, secțiunea
  „Tilt").

## Versiuni

Nu se aplică — zero pachete npm noi. Totul e JavaScript vanilla (`is:inline`,
fără bundler) și CSS simplu (custom properties, `dvh`, `sticky`, media
queries pe `max-height`).

## Decizii GSAP-vs-Motion per secțiune

Nu se aplică literal (fără GSAP/Motion instalate), dar echivalentul
conceptual al deciziei cerute de skill:

- **Hijack de scroll (viteza gestului)** → echivalent „GSAP+ScrollTrigger":
  scris de mână (`RailFir.astro`), motiv detaliat în brief — Lenis ar
  virtualiza *tot* scroll-ul cât timp majoritatea gesturilor trebuie să
  rămână 100% native.
- **Tilt de card / tilt de sub-bloc (`data-tilt`)** → echivalent „Motion,
  micro-interacțiune de componentă": scris de mână, reutilizând pattern-ul
  deja existent din `Base.astro` (pointermove pe hover fin, tap scurt pe
  touch), NU pe același nod cu `data-reveal` (regulă deja documentată în
  `docs/DECIZII.md`).
- **Aprindere segment pe rail** → nu e o animație separată, e un efect
  direct al aceluiași controller care oricum urmărește poziția curentă
  (cerut explicit de brief: „un sistem mai puțin, nu unul în plus").
- **Reveal la scroll (`data-reveal`)** → neatins, e sistemul existent din
  `Base.astro`/`tokens.css`, în afara scopului acestei treceri.

## Mecanismul de hijack — cum funcționează, verificat empiric

- **Wheel**: fereastră de 100ms, acumulează `deltaY`; peste prag de viteză
  (0.6px/ms) ȘI peste un delta minim (40px, evită fals-pozitiv pe un tick
  minuscul dar instantaneu) → `preventDefault()` + salt animat (450ms,
  ease-out cubic) la cardul următor/anterior. Sub prag → **zero
  `preventDefault()`**, scroll nativ neîntrerupt.
- **Touch**: `touchmove` nu e atins deloc (nici `preventDefault`, nici
  vreo interceptare) — decizia se ia strict la `touchend`, pe viteza reală
  a gestului (deltaY/deltaT din ultimele ~6 puncte).
- **Epuizare internă înainte de salt** (`poateAvansa`): dacă un card are
  overflow intern (fallback de aspect ratio) și nu s-a derulat până la
  capăt în direcția gestului, hijack-ul se abține — atât pentru wheel
  (nu previne evenimentul, lasă scroll-chaining nativ să deruleze cardul
  intern) cât și pentru touch. Verificat direct (Playwright + CDP): un
  wheel rapid pe hero (care are 108px overflow la 360×800) derulează
  întâi intern (`hero.scrollTop` → 108), abia al doilea wheel rapid sare
  la §02.
- **Poziții absolute** (`offsetTop`/`offsetParent`, nu `getBoundingClientRect`):
  imune la `transform`-ul scris de tilt pe același element.
- **Tastatură**: handler complet separat, verifică
  `document.activeElement.closest('input, textarea, select, button,
  [role="radiogroup"], [contenteditable]')` înainte să intercepteze
  Page Down/Space/săgeți — inclusiv `button`, adăugat față de lista
  explicită din brief, pentru butonul de submit din §16 (Space trebuie
  să declanșeze click-ul nativ, nu să sară cardul).
- **`prefers-reduced-motion: reduce`**: bail-out complet, înainte de orice
  `addEventListener`, pentru TOT controller-ul (hijack + tilt de card +
  aprindere rail) — pattern identic cu cele două scripturi `is:inline`
  deja existente în `Base.astro`. Verificat: cu reduced-motion, Space
  produce scroll nativ „cu un ecran" (comportamentul implicit al
  browserului), nu saltul animat.

### Bug găsit și reparat DOAR prin verificare directă, nu la citirea codului

1. **Poziția `<RailFir />` în DOM.** Plasată inițial înaintea `<S01Hero />`
   (pentru lizibilitate în `index.astro`), scriptul `is:inline` rula
   ÎNAINTE ca vreun `[data-card]` să existe în DOM — `querySelectorAll`
   prindea o listă goală, `if (cards.length === 0) return` ieșea imediat,
   și NICIUN listener nu se atașa vreodată. Tot ce părea „hijack" în
   primele teste era de fapt scroll nativ pur (Space sărea ~860px, nu
   exact 900px = o înălțime de viewport). Mutat `<RailFir />` la finalul
   `<Base>` (poziția în DOM nu-i afectează randarea, e `position: fixed`).
   Verificat după fix: Space sare exact 900px (o înălțime de card).
2. **`overscroll-behavior-y: contain` bloca scroll-chaining-ul nativ.**
   Adăugat inițial din instinct („previne bounce-ul"), fără să verific
   interacțiunea cu propriul mecanism: proprietatea oprește explicit
   propagarea de scroll dinspre un element spre părintele lui la limita
   de derulare — inclusiv când elementul n-are overflow deloc (caz în care
   e „la limită" din prima clipă). Rezultat: un gest LENT peste orice card
   rămânea complet înghețat, indiferent de conținut — exact opusul cerinței
   „gest lent → zero interceptare, scroll nativ neîntrerupt". Găsit prin
   test direct (8 evenimente wheel de 10px, distanțate 120ms: pe o pagină
   de control fără `RailFir`, scroll nativ de 80px; pe pagina cu cardurile,
   0px). Eliminat din `Sectiune.astro` și `S01Hero.astro`.
3. **Un nod lipsă pe rail.** `AMPLITUDINI_ZGOMOT.map()` seta `nod: false`
   pentru toate cele 6 segmente de zgomot, pierzând nodul de la §05
   (al doilea nod-CTA din brief). Verificat prin numărare directă
   (`document.querySelectorAll('.segment.nod').length` → 3 în loc de 4),
   reparat cu un index explicit (`INDEX_NOD_IN_ZGOMOT = 3`).

Toate cele trei confirmă motivul pentru care „gata" înseamnă verificat, nu
scris: niciunul nu produce eroare în `astro check`/`vitest`/build — sunt
defecte de COMPORTAMENT, vizibile doar rulând pagina reală.

## Fallback de aspect ratio — extins față de brief, cu motiv documentat

Brief-ul definește două condiții pentru fallback-ul de scroll intern:
pragul `100dvh < 560px` (pur CSS, `@media (max-height: 559.98px)`) și
forțarea explicită pe §16 (`scrollIntern`, conținut inerent lung).

**Verificat direct** (Playwright, 360×800 — breakpoint-ul de referință din
CLAUDE.md §2): la tipografia fluidă ACTUALĂ (calibrată în v1 pentru flux
continuu, nu pentru un plafon dur de `100dvh`), **12 din 16 carduri
depășesc `100dvh`**, majoritatea cu mult mai mult decât acoperă cele două
condiții de mai sus (de la 15px pe `§04 pentru-cine` până la 504px pe
`§02 problema`, plus §16 la +2679px, cum era de așteptat). Cardul-mecanism
(`overflow-y: auto`, permanent activ) tratează corect toate aceste cazuri —
nimic nu se taie — dar cele două condiții CSS din brief n-ar fi arătat
niciodată indicatorul vizibil pe ele, lăsând scroll-ul intern „tăcut"
(exact genul de defect pe care CLAUDE.md §2 îl interzice pentru §02/§08,
ambele afectate: §02 la +504px, §08 la +406px).

**Fix, în scopul acestei treceri** (mecanism, nu conținut): adăugat un al
treilea declanșator — o mică detectare de overflow real
(`scrollHeight - clientHeight > 1`), independentă de `prefers-reduced-motion`
(e disclosure, nu mișcare — o măsurătoare + un toggle de vizibilitate, nu o
animație), rulată la load/resize/`fonts.ready`. Cele două condiții pur-CSS
din brief rămân valabile ca prag de bază, fără JS.

**Ce N-AM făcut în iterația 1, deliberat, în afara scopului**: nu am retunat
tipografia/spațierea internă a celor 15 componente de conținut ca să încapă
efectiv în `100dvh`. Am tighten-uit un singur lucru sigur, la nivel de
`Sectiune.astro`/hero (nu per-componentă): padding-ul vertical al cardului,
de la `--sp-2xl` (fluid, până la 6rem) la `--sp-md`/`--sp-lg` fix — a
recuperat ~30px per card, suficient pentru cazurile-limită (`§04
pentru-cine` de la 31px la 15px depășire), dar nu pentru cardurile cu
conținut mult mai lung (§02, §06, §08, §15).

**Actualizare, iterația 2**: exact retunarea per-secțiune recomandată mai
jos s-a făcut — vezi „Iterația 2 — fixuri din QA_REPORT-iteration-1.md",
secțiunea #2, pentru `§02`/`§04`/`§06`/`§08`/`§15`. Notă importantă pentru
oricine citește cifrele de mai jos ca istoric: fix-ul #1 din aceeași
secțiune (centrare „unsafe") a arătat că `scrollHeight - clientHeight`
subestima overflow-ul real cu ~50% cât timp centrarea era nesigură — cifrele
de „px depășire" din paragrafele astea (scrise în iterația 1) sunt deci
aproximativ jumătate din overflow-ul real de atunci. Cifrele corecte,
curente, sunt în „Rezultatul verificărilor".

**Rămas pentru o rundă viitoare, dacă mai e nevoie**: cardurile care încă
depășesc `100dvh` la 360×800 (majoritatea, minus `§04`/`§07`/`§10`/`§12`)
rămân pe fallback-ul de scroll intern — funcțional și complet accesibil
(fix #1), dar nu „fit perfect". Eliminarea completă la mobil ar cere fie o
retunare și mai agresivă de tipografie (risc: subminarea vocii „vacarm vs.
claritate" cerută explicit de brief pe `§02`), fie acceptarea explicită a
scroll-ului intern ca normă și pe alte carduri, nu doar `§16` — decizie de
conținut/design, nu de mecanism.

## Tilt

- `[data-tilt]` (bare, fără valoare) — neschimbat: MAX_GRADE 8,
  `perspective(700px)`, blocurile mici din §06/§09.
- `[data-tilt="card"]` (nou) — MAX_GRADE 2, `perspective(1600px)`, pe
  cardurile de `100dvh` (§01–§16). Element propriu (wrapper-ul cardului),
  separat de orice `data-reveal` (niciun `data-reveal` nu trăiește azi pe
  `<section>`/`<header>`, doar pe copii — verificat prin grep înainte de
  implementare).
- **Compunere intenționată**: pe §06/§09, hover-ul peste un sub-bloc
  declanșează AMBELE tilt-uri (cardul întreg la 2°, sub-blocul la 8°) —
  cele două scriu pe elemente DOM diferite, deci nu se ating tehnic; e
  extinderea explicită cerută de brief („efectul 3D deja existent extins
  la nivel de card"), nu un conflict nereparat.
- Box-shadow-ul deja existent pe `[data-tilt]` din `tokens.css` se aplică
  acum și cardurilor întregi — creează o umbră discretă la granița dintre
  carduri adiacente, care întărește vizual metafora „placă" cerută de
  brief pentru `perspective(1600px)`. Păstrat neschimbat, nu e un efect
  nou adăugat.

## Rail-ul (firul segmentat)

16 segmente autorate (SVG, nu emoji/glyph): §01 neutru, §02–§07 zigzag cu
amplitudine descrescătoare (zgomotul concentrat pe §02, „rezolvat" spre
§07), §08–§16 drepte. 4 noduri-CTA (§01, §05, §08, §16), culoare `--accent`/
`--accent-clar` separată de culoarea traseului (`--secundar`/
`--accent-decor`/`--accent-clar`), comutată în funcție de `data-fundal` al
cardului curent (citit din atributul deja existent pe `Sectiune.astro`).
`position: fixed`, `pointer-events: none`, `aria-hidden="true"` — nu devine
niciodată un al cincilea punct de acțiune.

## Accesibilitate — verificat, nu doar implementat

- **Tastatură**: verificat direct — focus pe primul radio din §16,
  `ArrowDown` mișcă selecția în grup ȘI NU schimbă poziția de scroll a
  paginii (`window.scrollY` neschimbat, radio bifat se schimbă corect).
- **Reduced motion**: verificat direct — context Playwright cu
  `reducedMotion: 'reduce'`, Space produce scroll nativ (nu salt animat),
  `html` nu capătă nicio clasă suplimentară de la controller.
- **DOM liniar**: `<section>`/`<header>` obișnuite, în ordinea din
  `index.astro`, fără nicio re-parentare ARIA — neschimbat față de
  structura deja existentă.
- **`§17` (footer)**: complet în afara sistemului — nu trece prin
  `Sectiune.astro`, n-are `data-card`, n-are segment pe rail.

## Rezultatul verificărilor (iterația 2 — cel mai recent, înlocuiește cifrele iterației 1 de mai sus)

```
npm run verify     → contrast + test + test:db + check + build, toate verzi
npm run contrast   → 18/18 perechi peste prag (neschimbat, zero hex noi)
npm run test       → 135/135 teste unitare (5 fișiere)
npm run test:db    → Postgres local disponibil de această dată — 20/20
                     runde de cursă waitlist, retenție, cascade, toate ok
npm run check      → 0 erori / 0 avertismente / 70 fișiere
npm run build      → complet, fără erori
npx playwright test → 38/38 (mobil-360 + desktop, suita completă e2e)
node scripts/screenshots.mjs → zero defecte pe toate cele 5 breakpoint-uri
```

Plus verificări ad-hoc live (Playwright, scripturi temporare, șterse după
rulare — nu au rămas în `scripts/`), toate confirmate prin măsurătoare
directă în pagină, nu prin citirea codului:

- **Fix #1** (`justify-content: safe center`): `h2`/`h1` la `top` pozitiv
  (vizibil, tipic +20px) pe toate cele 16 carduri, la `scrollTop: 0`, pe
  360×800, 390×844, 768×1024, 1280×800 ȘI 1920×1080 — zero excepții.
- **Fix #2** (retunare tipografie/spațiere), overflow (`scrollHeight -
  clientHeight`) măsurat DUPĂ fix #1 (cifrele corecte, ~2× cele raportate
  de QA cu centrarea „unsafe"):

  | Card | 360×800 | 1920×1080 |
  |---|---|---|
  | §02 problema | 885px (era 1029px) | **0px** (era 595px) |
  | §04 pentru-cine | **0px** (era 50px) | 0px |
  | §06 ce-facem | 612px (era 878px) | **0px** (era 138px) |
  | §08 ce-pleci-cu-tine | 684px (era 832px) | **0px** (era 42px) |
  | §15 intrebari | 376px (era 598px) | **0px** (era deja 0px) |
  | §16 inscriere (excepție acceptată) | 2679px | 1424px |

  La 1920×1080: **zero carduri cu overflow** în afara excepției `§16`.
  La 360×800: 12/16 carduri afectate (era 13/16) — `§07`, `§10`, `§12` deja
  încăpeau, `§04` s-a alăturat lor.
- **Fix #3** (interruptibilitate): două flick-uri wheel rapide succesive
  (al doilea la +150ms într-un salt de 450ms), simulate cu
  `page.mouse.wheel`, aterizează la 2 carduri distanță de start (verificat
  cu un card fără overflow intern, ca să izolez hijack-ul de `poateAvansa`)
  — înainte de fix, 1 card distanță.
- **Fix #4** (indicator fals): `.indicator-scroll` `display:flex` la
  `scrollTop:0` pe un card cu overflow (`§02`), `display:none` după
  `card.scrollTop = card.scrollHeight` + eveniment `scroll`.
- **Fix #5** (easing): verificare de cod (proprietate CSS unică, fără
  comportament dinamic de testat live).
- **Regresie**: suita `tests/e2e/motion.spec.ts` (reduced-motion, tilt,
  reveal, bara sticky) și `formular.spec.ts`/`b2-siguranta-get.spec.ts`
  rămân 38/38 — niciuna din schimbările de mai sus nu a atins tastatura,
  separarea de formular, sau bail-out-ul de `prefers-reduced-motion`.

## Iterația 2 — fixuri din `docs/design/QA_REPORT-iteration-1.md`

Toate cele cinci defecte semnalate de `visual-qa` prin verificare live
(Playwright, nu doar citirea codului), rezolvate în ordinea priorității.
Verificat din nou live, nu doar citit — vezi „Rezultatul verificărilor" mai
jos pentru cifrele actualizate.

### #1 [MAJOR] Centrare „unsafe" ascundea ireversibil vârful conținutului

Fix ales: `justify-content: safe center` pe `.sectiune.card`
(`Sectiune.astro`) și pe `.hero` (`S01Hero.astro`) — **nu** varianta cu
`.deruleaza-real { justify-content: flex-start }`. Motiv, pe scurt (detaliat
în comentariul din cod): `safe` e o proprietate CSS nativă, corectă din
primul paint, fără nicio dependență de timing-ul scriptului de detectare a
overflow-ului din `RailFir.astro` (care rulează abia la
load/resize/`fonts.ready` — o fereastră de FOUC posibilă cu varianta
alternativă). Browserele care nu recunosc `safe` ignoră declarația întreagă
și cad pe `normal` (echivalent `flex-start` în flex), deci fallback-ul
„greșit" e tot safe. N-am adăugat și al doilea mecanism — ar fi rezolvat
aceeași problemă de două ori, contrar principiului „un sistem mai puțin"
deja stabilit pentru acest controller.

**Descoperire neașteptată prin verificare live**: fix-ul a scos la iveală că
`scrollHeight - clientHeight` (metrica pe care se bazau atât
`IMPLEMENTATION_NOTES.md` v1 cât și `QA_REPORT-iteration-1.md` pentru
cifrele de overflow) număra doar JUMĂTATE din overflow-ul real cât timp
centrarea era „unsafe" — cealaltă jumătate stătea deasupra ariei vizibile,
neadresabilă prin scroll, deci necontorizată de `scrollHeight`. Verificat
direct: `§02` raportat la 514px overflow (QA) → 1029px overflow real, odată
ce tot conținutul devine parte din aria scrollabilă (`h2Top` trece de la
-494px la +20px, pe tot parcursul paginii, la 360×800 ȘI la 1920×1080).
Cifrele din secțiunea „Fallback de aspect ratio" de mai jos, scrise în
iterația 1, sunt deci substanțial subestimate — nu le-am șters (rămân
istoricul deciziei de atunci), dar cifrele curente, corecte, sunt cele din
„Rezultatul verificărilor".

Verificat live, la 360×800 ȘI 1920×1080: h2/h1 vizibil (`top` pozitiv) pe
toate cele 16 carduri, la `scrollTop: 0`, fără nicio excepție.

### #2 Retunare tipografie/spațiere — reducere de overflow

Prioritizat pe `§02`, `§06`, `§08`, `§15` (cardurile cele mai lungi), plus
`§04` (un câștig ieftin, la doar 50px de fit perfect). Strategie, per
secțiune:

- **`§02` (`S02Problema.astro`) și `§06` (`S06CeFacem.astro`)**: cele trei
  blocuri/`bloc-tilt` treceau pe o singură coloană indiferent de lățimea
  ecranului — pe 1920px lățime, folosindu-se din ea doar `--max-continut`
  (62rem), tot conținutul rămânea stivuit vertical, exact ca la 1280px.
  Adăugat `grid-template-columns: repeat(3, 1fr)` la `min-width: 64rem`,
  același pattern deja folosit în `S09UseCases.astro` pentru „multe
  elemente scurte" — nu un mecanism nou, o reutilizare a unuia existent.
  Plus reducerea spațierii verticale (`--sp-2xl`/`--sp-xl` → `--sp-xl`/
  `--sp-lg`, `--sp-md`/`--sp-lg` → `--sp-sm`/`--sp-md` pe elementele
  interne) — fără să ating `font-size`-urile (`--t-h2`, `--t-statement`):
  diferența de scală dintre vacarm și declarațiile de claritate E
  argumentul secțiunii, conform comentariilor deja existente în cod.
- **`§08` (`S08CePleciCuTine.astro`)**: cele cinci „linii de câmp" foloseau
  `padding-block: var(--sp-lg)` (32px sus+jos, ×5 = cel mai mare
  contribuitor singular la overflow). Redus la `--sp-md` (20px), păstrând
  motivul de design („linii de document, nu carduri") intact — doar mai
  strânse.
- **`§15` (`S15Faq.astro`)**: `dl { gap }` redus de la `--sp-lg` la
  `--sp-md`, plus `dd { line-height: var(--lh-normal) }` (era moștenit
  `--lh-lejer` de pe `body`) — răspunsurile FAQ sunt proză scurtă (2-3
  propoziții), nu proza lungă din `§02` pentru care `--lh-lejer` a fost
  gândit explicit (comentariul din `tokens.css`); același raționament deja
  aplicat în `.subheadline`/`.pentru-cine` din `S01Hero.astro`.
- **`§04` (`S04PentruCine.astro`)**: reduceri mici de gap, suficiente să
  aducă secțiunea la 0 overflow la 360×800 (era la +50px, cel mai apropiat
  card de fit din tabelul QA).

**Rezultat, verificat live** (nu doar codul): la **1920×1080, zero carduri
cu overflow** în afara excepției acceptate explicit de brief (`§16`,
formular) — obiectivul explicit cerut pentru runda asta. La 360×800,
numărul de carduri afectate a scăzut de la 13/16 la 12/16 (§04 a ieșit din
listă), iar pe cele patru priorizate, overflow-ul (cifrele CORECTE,
post-fix #1) a scăzut: `§02` 1029→885px, `§06` 878→612px (-30%), `§08`
832→684px (-18%), `§15` 598→376px (-37%). Eliminarea completă la mobil nu a
fost obiectivul (brief-ul acceptă explicit fallback-ul de scroll intern ca
normă, nu ca eșec) — obiectivul a fost reducere substanțială fără să ating
tipografia „de voce" a paginii, atins pe toate cele patru secțiuni.

### #3 [minor] Interruptibilitate hijack

`RailFir.astro`, handler-ul de `wheel`: rămâne autoritar pe scroll cât timp
`animand` (previne implicit, ca înainte — altfel scroll-ul nativ ar intra
în conflict cu `window.scrollTo` din `pas()`), dar acum acumulează delta-ul
gestului nou într-o „coadă" (`tintaCoada`, calculată de la `tintaCurenta`
sau de la o coadă deja existentă) și o aplică automat, înlănțuit, la
finalul animației curente din `navigheazaLa`. Verificat live (Playwright,
`page.mouse.wheel`): două flick-uri rapide succesive (al doilea la +150ms
într-un salt de 450ms) aterizează acum pe **2 carduri distanță**, nu 1.

### #4 [minor] Indicator fals după derulare completă

`RailFir.astro`: adăugat `.scroll-vazut-complet`, togglat pe eveniment
`scroll` al fiecărui card (prag `scrollHeight - clientHeight - scrollTop <=
1`), independent de `prefers-reduced-motion` (disclosure, nu mișcare,
același raționament ca `.deruleaza-real`). `IndicatorScrollIntern.astro`
capătă regula CSS care ascunde indicatorul când clasa e prezentă. Verificat
live: indicator `display:flex` la `scrollTop:0`, `display:none` după
`scrollTop = scrollHeight` + eveniment `scroll` dispatch-uit.

### #5 [cosmetic] Easing pe segmentul de rail

`.segment` din `RailFir.astro`: `transition: opacity 240ms ease-out,
transform 240ms ease-out` (era `ease`) — schimbarea de stare activ/trecut
se simte imediată, nu leneșă, exact în momentul în care utilizatorul se
uită la rail după un salt.

## Fișiere atinse

**Iterația 1** (nou/modificat inițial):
- Noi: `src/components/RailFir.astro`, `src/components/IndicatorScrollIntern.astro`
- Modificate: `src/components/Sectiune.astro`, `src/components/S01Hero.astro`,
  `src/components/S16Inscriere.astro`, `src/layouts/Base.astro`,
  `src/pages/index.astro`

**Iterația 2** (fixuri din `QA_REPORT-iteration-1.md`), modificate suplimentar:
- `src/components/Sectiune.astro` — fix #1 (`safe center`)
- `src/components/S01Hero.astro` — fix #1 (`safe center`), paritate cu Sectiune
- `src/components/RailFir.astro` — fix #3 (interruptibilitate wheel),
  fix #4 (`.scroll-vazut-complet`), fix #5 (easing segment)
- `src/components/IndicatorScrollIntern.astro` — fix #4 (regulă CSS de ascundere)
- `src/components/S02Problema.astro`, `S04PentruCine.astro`,
  `S06CeFacem.astro`, `S08CePleciCuTine.astro`, `S15Faq.astro` — fix #2
  (retunare tipografie/spațiere)
- `docs/design/IMPLEMENTATION_NOTES.md` — acest document

- Neatinse: `src/content/copy.ts`, `src/content/form-schema.ts`, toate
  rutele `/api/*`, toate componentele S02–S15 (conținut intern), `S17Footer.astro`

## v3 — Câmpul

Implementare peste v2, pornind strict de la `docs/design/DESIGN_BRIEF.md` v3
(„Element-semnătură" → „Câmpul", „Garanția de contrast — Câmpul"). Firul
(`RailFir.astro`) neschimbat vizual — atinsă doar logica lui de comutare a
indexului activ, ca al doilea consumator al aceleiași surse de adevăr.

### Din registry

Nimic — brief-ul cere un element nou, scris de mână (linii SVG autorate +
`@keyframes` CSS), nu un efect din React Bits/shadcn. Proiectul rămâne fără
Tailwind/shadcn (neschimbat din v1/v2).

### Scris de mână

- **`Campul.astro`** (nou) — elementul-semnătură nou, per card: un `<div>`
  `position:absolute` cu un `<svg>` care referă una din cele 3 variante prin
  `<use>`. Motiv „scris de mână": e chiar elementul-semnătură cerut de brief,
  autorat static (nu generare procedurală, nu catalog de efecte).
- **`CampulSprite.astro`** (nou) — cele 3 variante SVG (`neutru`/`zgomot`/
  `clar`) ca `<symbol>`, definite o singură dată și randate o dată în
  `index.astro` (lângă `<RailFir />`), referite din fiecare `<Campul>` prin
  `<use>`. Motiv: fără sprite, geometria s-ar repeta inline de până la 9 ori
  (câte o dată per card „clar") — sprite-ul e disciplina care ține bugetul
  de octeți REAL sub control, nu doar bugetul nominal al celor 3 fișiere.
- **`RailFir.astro`** — o singură funcție atinsă (`actualizeazaRail`): o a
  doua ieșire a aceluiași controller, care comută clasa `.camp-activ` pe
  cardul activ + vecinii imediați. Motiv „un sistem mai puțin, nu unul nou":
  brief-ul cere explicit reutilizarea controller-ului existent, nu un
  `scroll-timeline` separat.
- **`tokens.css`** — regulă globală nouă (scrim-ul de contrast, vezi mai
  jos). Motiv: e cross-cutting peste toate cele 16 carduri, deci aparține
  alături de restul regulilor globale (reset, `[data-tilt]`, reduced-motion),
  nu duplicată per componentă.
- **`Sectiune.astro`/`S01Hero.astro`** — prop nou `camp` (implicit `'clar'`
  în `Sectiune.astro`; `S01Hero.astro` randează direct `tip="neutru"`),
  `--bg-registru` expus pe fiecare registru, `position:relative`+`z-index`
  explicit pe container și pe `.continut`.

### Versiuni

Neschimbat — zero pachete npm noi (nici pentru Câmpul: SVG+CSS pur, fără
librărie de animație).

### Decizii GSAP-vs-Motion per secțiune

Nu se aplică literal (fără GSAP/Motion instalate, ca în v2). Echivalentul
conceptual:

- **Deriva ambientă a Câmpului** (`@keyframes campul-deriva`, translate
  pur) → echivalent „GSAP scroll-linked", dar brief-ul cere explicit CSS pur
  (compositor GPU, zero JS pe cadru) — motivat în brief prin respingerea
  variantelor „gradient animat" (clișeu Magic UI/Aurora) și „particule pe
  canvas" (cost de execuție disproporționat pe Android mediu/4G/WhatsApp).
- **Comutarea stării (neutru/zgomot/clar) + play-state activ/pauzat** →
  echivalent „efect al controller-ului de scroll, nu componentă izolată":
  aceeași sursă de adevăr ca aprinderea segmentului de pe Fir
  (`actualizeazaRail`), nu un observer nou.

## Mecanismul de contrast — scrim, nu plafon de opacitate

Implementat exact cum cere brief-ul ca mecanism PRINCIPAL: fiecare element
care poartă text din cele 16 carduri (`h1, h2, h3, p, li, dt, dd, label,
legend, td, th`) primește un fundal solid, culoarea registrului lui
(`--bg-registru`), plus `border-radius: var(--radius)`. Zero pereche nouă de
verificat — `npm run contrast` rămâne 18/18, neschimbat.

**O singură deviere deliberată de la litera brief-ului, documentată aici ca
să nu se piardă motivul:** brief-ul descrie „padding mic în em... care
scalează cu fontul". Am implementat halo-ul cu **`box-shadow: 0 0 0 0.15em
var(--bg-registru)`** în loc de `padding` (chiar și compensat cu `margin`
negativ egal). Motiv, verificat prin raționament înainte de a scrie codul,
nu doar presupus:

- Zeci de componente au deja reguli `margin-bottom`/`margin-top` explicite
  pe exact aceste tag-uri (`h2 { margin-bottom: var(--sp-md) }` etc.), cu
  specificitate mai mare (scoping Astro adaugă un atribut) decât o regulă
  globală din `tokens.css`. Un `margin` negativ global ar fi fost anulat
  DOAR pe unele laturi (cascada rezolvă per proprietate longhand, nu per
  regulă), lăsând padding-ul necompensat exact acolo — reintroducând, în
  mic, riscul de overflow pe care iterația 2 l-a eliminat cu atenție pe
  `§02`/`§06`/`§08`/`§15` (vezi „Fallback de aspect ratio" mai sus).
- `box-shadow` e o proprietate pur de pictură (nu participă la box model),
  deci zero conflict posibil cu orice `margin`/`padding` existent — și
  vizual identic: un halo care scalează cu fontul (`em`), respectă
  `border-radius`-ul elementului, aceeași culoare exactă în interior și în
  afara lui (deci „invizibil ca formă").

**`td`/`th` adăugate explicit** față de lista literală din brief: `§05`
(`S05InainteDupa.astro`) folosește un `<table>` real. Verificat că
`background`-ul scrim-ului se aplică pe ambele moduri de `display` ale
`<td>` (grid pe mobil, `table-cell` pe desktop) — pe `table-cell`, `margin`
nu se aplică prin definiție CSS (nu era relevant, nu foloseam margin), iar
`box-shadow` funcționează identic în ambele moduri.

**Sub-blocuri cu fundal propriu** (nu registrul cardului): `.vacarm-bloc`
(S02, `--bg-inchis`), `.granita` (S03, `--bg-secundar`), `.format` (S06,
`--succes-bg`), `.bife`/`.rezultat` (S16, `--bg-secundar`) — fiecare
republică local `--bg-registru` cu propria culoare, ca textul din interior
să nu moștenească greșit registrul cardului-părinte. `.bloc-tilt` (S06) și
`.zona-tilt` (S09) republică defensiv aceeași valoare ca registrul cardului
(`--bg`) — n-ar fi strict necesar azi (ambele secțiuni sunt deja pe
`primar`), dar elimină un mod silențios de defect dacă fundal-ul cardului
se schimbă vreodată fără să se atingă și sub-blocul.

## Ierarhia Fir/Câmpul/conținut — z-index, verificat nu doar citit

`.sectiune.card`/`.hero` primesc `position: relative; z-index: 0` explicit
(nu doar `position: relative`): un `z-index` non-`auto` e ce transformă
containerul într-un context de stacking IZOLAT, în care `Câmpul` (z-index 0)
și `.continut`/`IndicatorScrollIntern` (z-index 1/2) se ordonează doar între
ei — fără să schimbe nimic față de `RailFir`/`CtaSticky` (ambele
`position:fixed`, z-index 30/40, comparate la rădăcina documentului).
Verificat prin `getComputedStyle` în Playwright, pe toate cele 16 carduri:
`campZ:"0"`, `continutZ:"1"`, exact cum era proiectat.

**Risc identificat și evitat ÎNAINTE de a scrie codul, nu descoperit prin
eșec ulterior:** varianta inițială avea `.campul` însuși supradimensionat
(140%, `inset:-20%`) direct ca fundal al cardului. Un element
`position:absolute` care iese din containing block-ul lui CONTRIBUIE la
scrollable-overflow-ul unui părinte cu `overflow-y:auto` — exact
`.sectiune.card`. Asta ar fi umflat artificial `scrollHeight` cu ~40% pe
fiecare din cele 16 carduri, stricând `poateAvansa()` din `RailFir.astro`
(hijack-ul n-ar mai fi putut niciodată considera un card „epuizat", pentru
că `scrollTop` n-ar fi ajuns niciodată la un `scrollHeight` artificial de
mare) — o regresie catastrofală, silențioasă la `astro check`/`vitest`,
vizibilă doar rulând pagina. Fix: `.campul` însuși e exact `inset:0` (nu
oversized) cu `overflow:hidden`; DOAR `.linii` (SVG-ul din interior, clipat
de `.campul`) e cel supradimensionat. Verificat live (Playwright, wheel
rapid pe desktop): un singur gest rapid tot avansează exact 900px (o
înălțime de card), identic cu comportamentul v2.

## Verificat live (Playwright, nu doar citirea codului)

- **Mapare tip/culoare pe toate cele 16 carduri** (`getComputedStyle`): §01
  `neutru`, §02–§07 `zgomot`, §08–§16 `clar`; culoare `rgb(70,137,132)`
  (`--accent-decor`) pe toate registrele deschise, `rgb(127,209,196)`
  (`--accent-clar`) pe §08 (singurul registru închis din cele 16).
- **Play-state**: după navigare la un card din mijlocul paginii (index 8),
  exact 3 instanțe `running` (indecșii 7/8/9 — activ + cei doi vecini),
  restul de 13 `paused`. La încărcare (index 0), exact 2 `running` (0/1,
  fără vecin la stânga). Niciodată mai mult de 2–3 din 16, cum cere brief-ul.
- **`prefers-reduced-motion: reduce`**: toate cele 16 `.campul` cu
  `display:none` — Câmpul nu se randează deloc, pagina revine la fundalul
  plat din tokens.
- **Regresie hijack**: `tests/e2e/motion.spec.ts` + `formular.spec.ts` +
  `b2-siguranta-get.spec.ts` — 38/38, neschimbat. Plus verificarea ad-hoc de
  mai sus (wheel rapid → salt de exact un card).
- **Scrim vizual** (screenshot-uri pe §01/§02/§05/§08/§16, 390×844 și
  1280×900): textul rămâne complet lizibil, scrim-urile citesc ca „lipsă de
  cutie" (nicio muchie vizibilă) pe toate paginile verificate — inclusiv
  `<table>`-ul din §05 (ambele moduri, mobil `display:grid` și desktop
  `table-cell`) și etichetele/legendele din formularul §16. Observație
  minoră, nu defect: la §05 desktop, un fragment din linia de zgomot devine
  vizibil în spațiul dintre două rânduri de tabel (zonă fără text) — exact
  comportamentul „vizibil în spațiul negativ, invizibil peste text" descris
  în brief, nu o suprapunere peste conținut.
- **Buget de octeți**: cele 3 `<symbol>` din `CampulSprite.astro` însumează
  1483 bytes necomprimat (măsurat direct, nu estimat) — sub 15KB cerut de
  brief cu o marjă mare.
- `npm run verify` (contrast+vitest+test:db+astro check+build) și
  `npx playwright test tests/e2e` — toate verzi, identic cu v2 (contrast
  rămâne 18/18, `astro check` 0 erori pe 72 fișiere — 70 + cele 2 noi).

## Fișiere atinse (v3)

- Noi: `src/components/Campul.astro`, `src/components/CampulSprite.astro`
- Modificate: `src/styles/tokens.css` (scrim global), `src/components/Sectiune.astro`
  (prop `camp`, `--bg-registru`, poziționare/z-index, randare `<Campul>`),
  `src/components/S01Hero.astro` (`<Campul tip="neutru">`, `--bg-registru`,
  poziționare/z-index), `src/components/RailFir.astro` (`.camp-activ` în
  `actualizeazaRail`), `src/pages/index.astro` (`<CampulSprite />`),
  `src/components/S02Problema.astro`, `S03Rezultatul.astro`,
  `S04PentruCine.astro`, `S05InainteDupa.astro`, `S06CeFacem.astro`,
  `S07NuDoarTeorie.astro` (`camp="zgomot"` pe `<Sectiune>`),
  `S02Problema.astro`, `S03Rezultatul.astro`, `S06CeFacem.astro` (×2),
  `S09UseCases.astro`, `S16Inscriere.astro` (×2) (`--bg-registru` pe
  sub-blocuri cu fundal propriu)
- Neatinse: `src/content/copy.ts`, `src/content/form-schema.ts`, toate
  rutele `/api/*`, structura internă a componentelor S02–S16 (doar CSS
  adăugat, zero markup/copy schimbat), `S17Footer.astro`, `CtaSticky.astro`,
  `Cta.astro` (butoanele au deja fundal solid propriu, nu au nevoie de scrim)

---

# v4 — sticlă + Lenis

Implementare peste v3, pornind de la `docs/design/DESIGN_BRIEF.md` v4
(„cardul de sticlă"). Iterația 4. Scrim-urile per-element din v3 sunt
**șterse complet** — placa de sticlă le înlocuiește, nu le completează.

> **Notă de proces.** Iterația 4 a fost întreruptă la mijloc: fișierele erau
> pe jumătate rescrise, iar `npm run check` avea 8 erori TypeScript. Secțiunea
> „Reparații la reluare" de mai jos spune exact ce era rupt și de ce fix-ul nu
> e cosmetic.

## Din registry

Nimic — la fel ca v1–v3. Proiectul rămâne fără Tailwind/shadcn, deci poarta
anti-slop (`npx shadcn init -p <preset>`) **nu se aplică**; brief-ul o declară
explicit neaplicabilă („Preset shadcn de plecare: Neaplicabil"). Sticla,
Câmpul și Firul sunt scrise integral de mână. React Bits/Aceternity/Magic UI:
zero componente, la fel ca în iterațiile anterioare.

## Scris de mână

- **`tokens.css` — placa de sticlă** (`.sticla`, `.sticla::before`,
  `[data-card].camp-activ .sticla`, plafonul de rază sub 48rem, fallback-ul
  `@supports`). Global, nu per componentă: e cross-cutting peste toate cele 16
  carduri, exact ca scrim-ul pe care îl înlocuiește. Motiv „de mână": nu
  există catalog din care să iei un card căruia i se calculează tenta din
  registrul propriu ca să treacă un prag WCAG.
- **`CampulSprite.astro` — geometrie nouă**, generată în frontmatter (deci la
  BUILD, nu la runtime): 40 de polilinii verticale × 7 puncte × 3 variante.
  Deviația vine din `Math.sin`, nu din `Math.random` — ieșirea e deterministă,
  condiție necesară ca `npm run test:visual` să poată compara screenshot-uri
  între rulări.
- **`RailFir.astro` — controller-ul pe Lenis.** Lenis *înlocuiește* trei
  mecanisme scrise de mână (acumulator de `deltaY`, istoric de `touchmove`,
  animație de salt pe rAF) și unul de acoperire (`poateAvansa` →
  `allowNestedScroll`). Un senzor în loc de două, calibrate separat, pe unități
  diferite.
- **`Sectiune.astro` / `S01Hero.astro`** — clasa `.sticla` pe `.continut`,
  `--sticla-alpha` per registru, `data-tilt="card"` mutat de pe `<section>` pe
  PLACĂ, compensarea lui `--pad-sticla` în `max-width` (vezi mai jos).

## Versiuni

- `lenis`: **1.3.26** (singura dependință nouă din tot redesign-ul v1→v4)
- gsap: **neinstalat** — vezi „Decizii GSAP-vs-Motion"
- motion: **neinstalat** — idem

**Costul real al lui Lenis, măsurat pe build-ul de producție** (nu estimat):
bundle-ul client `RailFir.astro_astro_type_script_index_0` = **22.174 bytes
brut / 6.694 bytes gzip**. Până în v4 pagina livra **zero** JS bundle-uit (tot
era `is:inline`), deci ăsta e un cost nou, nu o creștere a unuia existent.
Sprite-ul Câmpului: **10.504 bytes brut / 2.891 gzip** (era 1.483 în v3 —
de 7× mai mare, pentru că 40 de polilinii × 7 puncte × 2 variante înlocuiesc
3–8 diagonale). Sub plafonul de 15KB din brief.

## Decizii GSAP-vs-Motion per secțiune

- **Scroll interpolat + snap pe viteză (toate cele 16 carduri)** → **Lenis**,
  nu GSAP/ScrollTrigger. Motiv: nu e o coregrafie legată de poziția de scroll
  (fără pin, fără scrub, fără parallax pe timeline); e o singură decizie
  binară — *gestul a fost rapid sau lent?* ScrollTrigger ar fi adus ~50KB
  pentru un semnal pe care `lenis.velocity` îl dă deja, plus interpolarea
  cerută explicit de user.
- **Tilt pe placă (`[data-tilt="card"]`)** → scris de mână, echivalent
  „Motion, micro-interacțiune": `pointermove`/`touchstart`, ~20 de linii, pe
  alt nod DOM decât `data-reveal` (regula din `docs/DECIZII.md`).
- **Deriva Câmpului** → CSS `@keyframes` pur (compositor, zero JS pe cadru),
  pornită/oprită de aceeași clasă `.camp-activ`.
- **Reveal la scroll (`data-reveal`)** → neatins, sistemul din `Base.astro`.
- **Zero element cu două sisteme simultan**: Lenis atinge `window`/document,
  tilt-ul atinge `.sticla`, reveal-ul atinge copiii lui `.sticla`, Câmpul
  atinge `.linii`. Verificat prin selectoare, nu presupus.

## Reparații la reluarea iterației (8 erori `astro check`)

Toate veneau din `noUncheckedIndexedAccess` (tsconfig) — `a[i]` e
`T | undefined`, corect: compilatorul nu poate ști că array-ul e plin.
**Niciuna reparată cu `!`**, pentru că în două din trei locuri cazul chiar
poate apărea:

| Loc | Cauza reală | Fix |
|---|---|---|
| `CampulSprite.astro:90` | `amplitudini[i % len]` pe `number[]` | tipul devine tuplă nevidă `readonly [number, ...number[]]` → `amplitudini[0]` e garantat `number`, fallback-ul `??` typează și e demonstrabil de neatins |
| `RailFir.astro` `indexCurent` / `tintaInDirectia` | iterare indexată peste `offsets` | `forEach`/`findIndex` — parametrul callback-ului e `number` prin construcție |
| `RailFir.astro` `navigheazaLa` | `offsets` poate fi gol sau mai scurt decât `cards` în fereastra de debounce de 150ms a lui `resize`, sau înainte de primul `recalculeazaOffsets` | guard explicit + **bail-out**: `lenis.scrollTo(undefined)` ar fi sărit la NaN, adică pagina ar fi „dispărut" |
| `RailFir.astro:589` | `ev.touches[0]` pe un `touchstart` sintetic/anulat | guard + return: fără atingere nu există punct de referință pentru tilt |

## Sticla — ce s-a implementat, exact

| Proprietate | Valoare livrată | Măsurat live |
|---|---|---|
| `border-radius` | `20px` | ✓ `20px` pe toate cele 16 |
| `backdrop-filter` | `blur(20px) saturate(115%)` | ✓ `blur(20px)` la 1280; ✓ `blur(12px)` la 390 (plafonul mobil) |
| tentă | `color-mix(... var(--sticla-alpha), transparent)` | ✓ `srgb 1 1 1 / 0.82` (primar) |
| bordură | `1px` | ✓ `1px color(srgb 1 1 1 / 0.55)` |
| umbră | offset+blur real | ✓ `0 1px 2px .05 / 0 18px 40px -20px .28` |
| margine față de card | `clamp(12px, 3vw, 28px)` | ✓ 12px la 390, 28px la 1280 |
| `will-change: backdrop-filter` | interzis | ✓ absent; doar `will-change: transform` pe placă, și doar sub `(hover: hover)` |
| carduri cu blur simultan | max 3 din 16 | ✓ 2 la încărcare (0+1), 3 în mijlocul paginii |

**Lățimea măsurii de text nu s-a schimbat**: `--pad-sticla` (padding INTERIOR,
14–32px) ar fi îngustat tăcut coloana calibrată în v1 (`--max-proza` ≈ 70 de
caractere), pentru că `box-sizing: border-box` e global. Compensat explicit în
`Sectiune.astro`: `max-width: calc(var(--max-proza) + 2 * var(--pad-sticla))`.

## Contrast — gate-ul acoperă acum ce e pe ecran

`scripts/check-contrast.mjs` a crescut de la 18 la **31 de perechi**: cele 18
plate + 13 compozite (`text peste tentă peste linia Câmpului peste registru`),
cu `blend()` și constantele `ALPHA_LINIE_CAMP` / `ALPHA_TENTA_STICLA`
oglindite din CSS. Compozitele calculate: primar `#F7FAF9`, secundar
`#DFE4E4`, închis `#212F30`. Cea mai strânsă pereche: `--text-muted` pe sticlă
primară = **4.67:1**. Toate trec.

**Cardurile inactive (13 din 16), fallback-ul `@supports`,
`prefers-reduced-motion` și pagina fără JS** cad toate pe tenta OPACĂ, adică
exact pe perechile plate deja verificate — de asta nu au nevoie de intrări
separate. Consecință deliberată: fără JS, nicio placă nu primește
`.camp-activ`, deci sticla e opacă peste tot, iar structura vizuală se
păstrează integral.

## `backdrop-filter` — costul real, măsurat, cu ambele limite

Măsurat cu Playwright + CDP `Emulation.setCPUThrottlingRate`, 390×844 @dsf3,
~3s de scroll de citire (60 de tick-uri de wheel), rulare A (cu blur) vs.
rulare B (aceeași pagină, blur dezactivat prin CSS injectat). Diferența A−B e
costul blurului, nu al paginii.

| Scenariu | Cadru median | p95 | Cadre > 32ms |
|---|---|---|---|
| GPU real, CPU 4× — **cu** blur | 15,0–16,1 ms | 29,9–38,7 ms | 12–23 din ~320 |
| GPU real, CPU 4× — **fără** blur | 15,3–15,5 ms | 28,5–30,6 ms | 7–13 din ~300 |
| GPU real, CPU 6× — **cu** blur | 16,1 ms | 45,5 ms | 40 din 287 |
| GPU real, CPU 6× — **fără** blur | 15,6 ms | 32,0 ms | 15 din 304 |
| **Rasterizare software** (headless, SwiftShader), CPU 4× — cu blur | **33,3 ms** | 116,6 ms | 133 din 250 |
| Rasterizare software, CPU 4× — fără blur | 16,7 ms | 33,4 ms | 30 din 312 |

**Citirea onestă a cifrelor, cu limitele metodei spuse pe față:**

1. Cu **GPU real**, blurul nu atinge cadrul median (60fps se ține la 4× și la
   6× throttling). Costul e în COADĂ: p95 crește cu 0–13ms și numărul de cadre
   peste 32ms se dublează–triplează. Se simte ca sacadare ocazională la
   comutarea lui `.camp-activ` (creare/distrugere de straturi), nu ca
   framerate scăzut constant.
2. **Varianța între rulări e mare** (o rulare la CPU 4× a dat Δ = −0,8 fps,
   alta Δ = −20 fps din cauza unui singur cadru de 1,2s). Nu trage concluzii
   dintr-o singură rulare.
3. **Ce NU măsoară asta:** mașina de test are GPU de desktop (Apple Silicon);
   CDP throttlează CPU-ul, **nu** GPU-ul, iar `backdrop-filter` e în primul
   rând cost de GPU și de bandă de memorie. Deci rândurile „GPU real" sunt
   limita OPTIMISTĂ. Rândul „rasterizare software" (30fps median) e limita
   PESIMISTĂ — proxy pentru un dispozitiv unde blurul nu e accelerat.
   Adevărul pe un Android mediu prin 4G/WhatsApp e între ele, și **nu poate fi
   stabilit fără un telefon real**. Praguri de degradare (blur doar pe cardul
   activ → rază 8px) sunt scrise în brief și rămân la îndemână; **nu le-am
   activat**, pentru că datele pe care le am nu le justifică.

## Verificat live (Playwright, nu citirea codului)

```
npm run contrast    → 31/31 perechi peste prag (18 plate + 13 compozite)
npm run test        → 135/135 teste unitare
npm run test:db     → 20/20 runde de cursă waitlist, migrație, retenție
npm run check       → 0 erori / 0 avertismente / 72 fișiere  (erau 8 erori)
npm run build       → complet, fără erori
npx playwright test → 38/38 (mobil-360 + desktop)
node scripts/screenshots.mjs → zero defecte pe 5 breakpoint-uri
                      (zero erori de consolă, zero scroll orizontal, ș/ț ok)
```

Plus verificări ad-hoc (scripturi temporare, șterse după rulare):

- **`prefers-reduced-motion: reduce`** — `html` FĂRĂ clasa `lenis` (Lenis nu
  se instanțiază deloc), 0 carduri cu `.camp-activ`, placa
  `rgb(255,255,255)` opacă, `backdrop-filter: none`, `border-radius: 20px`
  PĂSTRAT, `.campul { display: none }`. Exact contractul din brief: sticla
  rămâne ca structură, mișcarea și costul dispar.
- **Tastatura în §16** — `Space` tastat în `#nume` produce „Ion Popescu" (nu
  salt de card); `ArrowDown` pe un radio schimbă selecția și lasă
  `window.scrollY` neschimbat.
- **Tastatura în afara formularului** — `PageDown` din hero aterizează la
  `window.scrollY = 900`, adică EXACT offset-ul cardului 2 (nu 860px de
  scroll nativ).
- **Flick rapid** (6× wheel de 260px) — aterizează exact pe pragul unui card
  (index 6, delta < 3px). Senzorul `lenis.velocity` funcționează.
- **Ancora `#inscriere`** — la +180ms după click, `scrollY = 7145`
  (interpolat, în zbor), la +1,6s `scrollY = 13500` = exact ținta. Nu sare
  instant.
- **§17/footer** — 16 carduri, footer FĂRĂ `data-card`, fără placă de sticlă,
  complet în afara sistemului.
- **Containing block** — `backdrop-filter` creează containing block pentru
  descendenții `fixed`. Verificat că `CtaSticky` și `RailFir` (singurele
  `position: fixed`) sunt frați cu `<main>` în `index.astro`, nu descendenți
  ai vreunei plăci. Bara sticky se randează corect în toate capturile.

## Judecata vizuală — ce arată bine și ce nu

Iterația 3 a trecut QA-ul ca „gata de livrare" fiind în același timp urâtă pe
ecran. Deci, explicit, cu capturi la 390×844 și 1280×900 privite, nu doar
făcute:

**Ce arată bine.**
- **Desktop (1280+)**: placa citește ca obiect real — muchie rotunjită, umbră
  reală, fundal vizibil în jurul ei pe toate cele patru laturi. Liniile
  Câmpului citesc ca **ritm vertical coerent**, nu ca zgârieturi: diagnosticul
  central al v3 e rezolvat. Întreruperea liniilor la marginea plăcii se
  citește acum ca **ocluzie** (un obiect deasupra), nu ca defect de randare —
  diferența față de v3 e că dreptunghiul e VIZIBIL.
- **Registrul închis (§08, blocul din §02)**: aici efectul „liquid glass"
  chiar se vede — la tentă 0.70, liniile transpar prin placă. E cel mai
  reușit registru din pagină.
- **Varianta `clar`** (§08–§16): liniile se îndreaptă vizibil spre baza
  cardului. Metafora e legibilă în geometrie, nu doar în intenție.

**Ce NU arată grozav — spus pe față, nu ascuns.**
1. **Pe registrul primar (alb) placa nu citește ca sticlă, ci ca un card alb.**
   Tenta 0.82 alb peste alb dă compozitul `#F7FAF9`; liniile de dedesubt ajung
   la ~4,5% opacitate efectivă, adică invizibile. Placa se distinge doar prin
   umbră și prin liniile din jurul ei. E matematic inevitabil la valorile din
   brief — nu un bug de implementare. **11 din 16 carduri sunt pe registrul
   primar.**
2. **La 390px, Câmpul supraviețuiește doar ca ramă de 12px.** `clamp(12px,
   3vw, 28px)` dă exact minimul pe telefon; pe registrul alb, unde placa e
   invizibilă, ce se vede e „pagină albă cu dungi pe margini". Nu urât — dar
   nici „liquid glass".
3. **O placă mai înaltă decât cardul e tăiată de marginea cardului**
   (ex. §03 la 1280×900: placa are 1051px într-un card de 900px). Muchia de
   jos și umbra dispar; se vede o placă retezată. E consecința modelului
   `100dvh` + scroll intern din v2 (12 din 16 carduri depășesc `100dvh` la
   360px), nu a sticlei — dar sticla o face VIZIBILĂ, pentru că acum există o
   muchie care se poate reteza.
4. **Scrimul indicatorului de scroll** (gradient spre culoarea registrului)
   trece peste blocurile interne colorate (`.granita` în §03) și lasă o dungă
   palidă vizibilă pe ele. Preexistent din v2, dar mai vizibil acum.

**Două opțiuni pentru (1) și (2), cu cifre, dacă Ciprian vrea sticla mai
prezentă pe alb** — nu le-am aplicat unilateral, pentru că schimbă valori
calculate în brief, exact ca decizia `#576565`:
- **Tentă mai mică pe primar: 0.82 → 0.78.** Minimul calculat WCAG e 0.707,
  deci mai e marjă. Compozitul devine `#F5F9F8`; cea mai strânsă pereche
  (`--text-muted`) coboară de la 4,67 la ~4,60 — încă peste 4,5. Liniile de
  sub placă trec de la ~4,5% la ~5,5% opacitate efectivă: câștig REAL, dar
  mic. Sincer: nu rezolvă (1), doar îl atenuează.
- **Contur de 1px vizibil pe registrele deschise.** Bordura din brief e
  `alb 55%` — invizibilă pe alb prin construcție. Un contur derivat din
  `--secundar` la ~10–12% ar desena muchia plăcii pe ORICE fundal, fără să
  atingă niciun calcul de contrast (e decor non-text). Ar fi cea mai eficientă
  schimbare pentru „cardul se vede", dar deviază de la o valoare scrisă
  explicit în brief, deci e decizie de design, nu de implementare.

## Devieri de la brief, declarate

- **Blocurile interne nu și-au pierdut fundalul propriu.** Brief-ul cere ca
  `.vacarm-bloc`/`.fisa`/`.bife` să fie delimitate prin spațiu/linie de 1px,
  ca să nu apară card-în-card. Implementat parțial: `.fisa` (hero) e deja
  doar bordură+rază, fără fundal. Dar `.vacarm-bloc` (§02) rămâne întunecat —
  registrul închis de acolo poartă SENS, e documentat în `CLAUDE.md` §3
  („vacarmul din §02 e un bloc întunecat") și l-aș fi șters ca să respect un
  ban estetic. La fel `.granita` (§03) și `.format` (§06): schimbă registrul,
  deci citesc ca obiecte distincte, nu ca plăci imbricate. `.bloc-tilt` (§06)
  și `.zona-tilt` (§09) au fundal identic cu registrul plăcii — ăstea SUNT
  card-în-card la literă; verificat în captură la 390 și 1280: au bordură
  vizibilă de 1px, deci citesc ca obiecte intenționate, iar pe alb placa
  exterioară e oricum invizibilă, deci dublarea nu se vede. Le-am lăsat;
  transparentizarea lor ar fi cerut și scoaterea umbrei de pe `[data-tilt]`
  (o umbră sub un bloc transparent arată a greșeală) și ar fi atins tilt-ul
  acoperit de `motion.spec.ts`. Semnalez, nu decid singur.
- **Pragurile de degradare a blurului nu sunt activate** — vezi secțiunea de
  performanță: datele disponibile nu le justifică, iar activarea lor
  preventivă ar șterge efectul pe dispozitivele unde el chiar merge.

## Fișiere atinse (v4)

- Modificate: `src/styles/tokens.css` (scrim per-element ȘTERS, placa de
  sticlă adăugată), `src/components/Sectiune.astro`, `src/components/S01Hero.astro`,
  `src/components/Campul.astro` (`stroke-opacity` moștenit), `src/components/CampulSprite.astro`
  (geometrie v4 + fix de tipuri), `src/components/RailFir.astro` (Lenis +
  fixuri de tipuri), `src/components/S05InainteDupa.astro`
  (`--text-muted-pe-secundar`), `scripts/check-contrast.mjs` (13 compozite +
  perechea lipsă), `package.json` (`lenis`)
- Neatinse: `src/content/copy.ts`, `src/content/form-schema.ts`, toate rutele
  `/api/*`, `S17Footer.astro`, `CtaSticky.astro`, `Cta.astro`, structura de 17
  secțiuni, formularul

---

# v5 — labirintul

Sursa: `docs/design/DESIGN_BRIEF-labirint.md` + intrarea „Labirintul — răsturnarea
regulii «fundal curat»" din `docs/DECIZII.md` (D22–D30). Construit PESTE fundația v4:
placa, Lenis, controllerul, tilt-ul și toate cele 17 secțiuni rămân. Labirintul
înlocuiește **doar** Câmpul ca strat de fundal.

## Din registry

Niciunul. Proiectul n-are Tailwind, n-are shadcn, n-are React — Astro cu CSS scris de
mână și tokeni proprii. Brief-ul o spune explicit („Preset shadcn de plecare:
neaplicabil"), deci **poarta anti-slop nu se aplică**: n-am rulat `shadcn init`, n-am
adăugat niciun registry. Am verificat în schimb echivalentul ei real pentru proiectul
ăsta — zero hex nou, zero font nou, `npm run contrast` verde (vezi mai jos).

## Scris de mână

- **Generatorul de labirint** (`src/lib/labirint-geometrie.ts`) — determinist, la build,
  `Math.sin` niciodată `Math.random`. Motiv: ieșirea trebuie să fie bit-identică la
  fiecare build, altfel `npm run test:visual` compară zgomot, nu regresie.
- **Banda + subiectul** (`src/components/Labirint.astro`) — un singur strat `fixed`,
  cu SVG, 16 checkpointuri și 4 elemente-subiect.
- **Scrub-ul** (`src/components/ControlerCarduri.astro`) — buclă rAF peste controllerul
  Lenis existent. **Zero dependințe noi** (D29): fără GSAP, fără ScrollTrigger, fără
  MotionPathPlugin, fără `motion`. Sunt ~120 de linii; trei pachete ca să nu le scriu ar
  fi fost ~40KB gzip peste o pagină al cărei JS total e sub 8KB.
- **`scripts/lint-decor.mjs`** — lint static de selector, sub `npm run verify`.
- **`tests/e2e/labirint-continut.spec.ts`** — matricea 16×5×2 + JS dezactivat.

## Versiuni

- gsap: **neinstalat** (D29)
- motion: **neinstalat**
- lenis: 1.3.26 (moștenit din v4, neschimbat)

## Decizii GSAP-vs-Motion per secțiune

Neschimbate față de v4 și tot fără GSAP/Motion: **scrub scris de mână** pentru tot ce
depinde de poziția de scroll (bandă, subiect, materializarea plăcii), **CSS `transition`**
pentru schimbările de stare discrete (registru, checkpoint vizitat, tilt), **CSS
`@keyframes`** pentru licărire (eveniment, nu stare). `.js-reveal` rămâne pe
`IntersectionObserver`, în afara sistemului. **Niciun element nu are două sisteme pe
aceeași proprietate:** tilt-ul scrie `transform` pe `.placa`, scrub-ul pe
`.sticla-chrome` — elemente diferite, deliberat.

---

## Cele două decizii ale userului, aplicate

### 1. `backdrop-filter` tăiat de pe cardurile deschise — aplicat, și dus mai departe

Tăiat, dar am mers un pas mai încolo decât cerea brief-ul: **pe registrele deschise placa
e OPACĂ**, nu doar neblurată. Motivul nu e estetic, e o gaură în calculul brief-ului, pe
care am găsit-o la implementare:

> §8.3 calculează subiectul (α 0.32) direct peste fundalul registrului. Dar subiectul
> circulă PE coridor — e întotdeauna peste o linie de labirint (α 0.25). Compus, α
> efectivă e `1 − (1−0.25)(1−0.32) = 0.49`, nu 0.32.

Consecința, măsurată de `npm run contrast`, care acum tipărește cifrele la fiecare rulare:

```
primar    la tenta v4 0.82:  --text-muted peste labirint 4.67:1 → peste labirint + SUBIECT 4.45:1 ← PICA AA
secundar  la tenta v4 0.88:  --eroare     peste labirint 4.59:1 → peste labirint + SUBIECT 4.46:1 ← PICA AA
```

Opacizarea rezolvă amândouă și nu costă nimic vizibil: brief-ul însuși calculează că o
linie sub tenta 0.82 e la **3% delta de luminanță** față de alb. Pierdem înmuierea a ceva
invizibil, câștigăm dreptul de a ține subiectul la 0.32. **Toate perechile de pe
registrele deschise colapsează pe perechile PLATE deja verificate** — deci nu doar că
„nu se schimbă niciun număr", ci dispare o întreagă clasă de numere.

Translucența ȘI blurul rămân exact unde brief-ul le justifică prin măsurătoare:
**registrul închis**. Acolo o linie sub tenta 0.70 dă 1.59:1 — se vede, și blurul are ce
înmuia. Verificat pe screenshot la 1280×900: pe §08 placa citește ca sticlă, cu
labirintul difuz prin ea.

**Corecție la brief:** §08 e singurul card cu `data-fundal="inchis"`. §02 e `primar` — are
un BLOC întunecat înăuntru (`.vacarm-bloc`), nu un registru întunecat. Numărat în HTML-ul
construit: 13 primar, 2 secundar, 1 închis. Deci `backdrop-filter` a rămas pe **1 card din
16**, nu pe 2 — jumătate din costul pe care îl promitea brief-ul.

### 2. Muchie vizibilă pe cardurile deschise — aplicat, dar nu prin tentă

Verificat live la 390×844 înainte de orice modificare: userul avea dreptate, placa era
practic invizibilă. Muchia v4 era `color-mix(--bg-registru 55%, transparent)` — alb 55%
peste alb pe registrul primar, adică nimic.

**Ce am schimbat:** muchie `#2A3439` la 16% (≈ `#DDE0E1` pe alb — o linie care se vede,
nu un chenar), umbră în trei straturi (contact 1px + apropiată 8px + ambientală 50px la
38%), specular păstrat din v4.

**Ce NU am putut schimba, cu cifra:** tenta. Userul a cerut „tentă ceva mai prezentă", și
e prima soluție la care m-am gândit. Nu încape:

| Tentă spre `--secundar` | Compozit sub text | `--text-muted` |
|---|---|---|
| 0% (alb pur) | `#F4F8F8` | **4.58:1** ✓ (marjă 0.08) |
| 2% | `#F1F5F5` | ~4.53:1 (marjă 0.03) |
| 4% | `#F0F4F4` | **4.43:1** ✗ |
| 7% | `#EDF1F1` | **4.37:1** ✗ |

Greutatea vizuală vine deci integral din muchie + umbră + banda de labirint din jur.
**Judecata pe screenshot, nu pe număr: funcționează.** La 390×844 placa citește acum
fără echivoc ca obiect distinct, pe alb și pe secundar. Dacă userul vrea totuși tentă,
prețul e o schimbare de culoare de TEXT (`--text-muted` mai închis pe registrele
deschise) — decizie de paletă, în afara acestui brief; o semnalez, n-o iau singur.

Efect secundar util: pentru că n-am tintat placa, blocurile interne cu fundal propriu
(`.vacarm-bloc`, `.bloc-tilt`, `.zona-tilt`) rămân exact cum arătau în v4 — riscul
„card în card" nu s-a mărit deloc.

---

## Cele trei lucruri obligatorii din brief

### Plafonul de opacitate: `stroke-opacity` → `<g opacity>` (D25)

Implementat. `<g opacity="0.25">` (0.20 pe închis) cu cele trei `<path>` înăuntru, prin
`<use href="#labirint-desen">`. Grupul randează copiii într-un buffer offscreen, îi
aplatizează, apoi aplică valoarea o dată — alfa la orice pixel nu poate depăși valoarea
grupului, oricâte intersecții ar fi. Plafon structural, nu convenție.

### Subiectul la 0.32, cu 5 perechi noi sub gate

`--subiect-opacitate: 0.32` (0.50 pe închis), oglindit în `ALPHA_SUBIECT` din
`scripts/check-contrast.mjs`. Adăugate **7** perechi (nu 5 — am pus și `SUBIECT primar —
corp` și `SUBIECT închis — titlu alb` ca să acopere ambele capete ale gamei), plus:

- funcția `compozitSticla(..., cuSubiect)` care compune corect labirint ⊕ subiect;
- aserțiunea `ALPHA_SUBIECT.deschis ≤ 0.38`, cu mesajul care explică **de ce** pică;
- o santinelă care pică build-ul dacă cineva reintroduce translucența pe registrele
  deschise fără să coboare subiectul, cu cele două ratio-uri tipărite.

### Contrastele existente nu se schimbă

Confirmat prin rulare, nu presupus: `npm run contrast` → **39 de perechi, toate peste prag** (19 plate + 13 compozite v4 + 7 noi). Cele 32 preexistente au exact valorile din v4.

---

## Modelul de bandă derulantă — cea mai mare devieire de la brief, și de ce

**Brief-ul §6.1 cere un strat fix și static: 16 rânduri = 16 carduri, harta întreagă pe
ecran deodată.** Am implementat-o exact așa întâi. Arăta foarte bine pe desktop.
**Pica pe telefon**, și n-am aflat-o din raționament, ci din screenshot la 390×844:

- Placa acoperă tot ce nu e bandă, deci din hartă se vedeau rândurile 1–2 (banda de sus)
  și 16 (banda de jos): **3 rânduri din 16**. Criteriul V8 din brief cere ≥3 celule
  complete și declară că sub prag „mișcarea onestă e să-l tai".
- Checkpointul cardului k stă la `(k−0.5)/16` din înălțimea ecranului, iar subiectul e
  EXACT pe el în repaus (asta e chiar proprietatea pe care o vrea brief-ul). Pentru
  cardurile 3–15 asta înseamnă **în spatele plăcii opace**: subiectul era invizibil pe
  **13 din 16 carduri**. Criteriul V9 („găsește pătratul în sub 1 secundă") nu avea cum
  să treacă.
- Banda vizibilă era identică pe fiecare card → V11 (contact sheet) imposibil de trecut.

**Ce livrez în loc:** labirintul e o bandă de ~6.75 ecrane, translatată cu scroll-ul
(`transform` pe un singur container care conține și desenul, și checkpointurile, și
subiectul). Checkpointurile sunt echidistante (6 sub-rânduri) și translația e liniară în
progresul pe carduri — din cele două împreună rezultă că **poziția pe ecran a
checkpointului în repaus e identică pe toate cele 16 carduri**, și am ales-o la 9.4% din
înălțime, adică în banda de sus.

Verificat programatic pe toate cele 16 carduri, la 390×844:

```
card  1: subiect(179, 79) cp(179, 79) Δ=(0,0)   card  9: subiect(114, 79) Δ=(0,0)
card  2: subiect(309, 79) cp(309, 79) Δ=(0,0)   card 10: subiect(341, 79) Δ=(0,0)
…                                               card 16: subiect(179, 79) Δ=(0,0)
```

Subiectul e pe checkpoint la pixel, în banda de sus, pe **16 din 16**. Între carduri
coboară în spatele plăcii și reiese — ceea ce citește ca adâncime, nu ca dispariție.

**Ce se pierde:** „harta întreagă la o privire". Ce se câștigă: harta e vizibilă tot
timpul, se mișcă, și e diferită pe fiecare card. Schimb bun, dar e o devieire reală de la
brief și o declar ca atare.

**Bug prins prin măsurătoare, nu prin citire:** prima versiune a camerei avea garda
`Math.abs(ty − ultimulTy) > 0.05` cu `ultimulTy` inițializat la `NaN`. Orice comparație cu
`NaN` e falsă → camera nu se scria NICIODATĂ. Screenshoturile arătau în continuare
plauzibil (pe cardul 1 e corect oricum); tabelul de aliniere de mai sus a arătat
`capY = 79, 395, 712, 1029…`, adică subiectul ieșea din ecran de la cardul 3 în jos.
Inițializat la `Infinity`.

---

## Cele patru constrângeri dure

### 1. Conținutul nu e condiționat de animație

`.placa` > `.sticla-chrome` (`aria-hidden`, se animă) + `.continut` (text, zero
proprietăți animate). Valoarea implicită CSS a fiecărei variabile de progres e **starea
sosită**: `opacity: var(--pc-o, 1)`, `transform: scale(var(--pc-s, 1))`. Starea
„neajunsă" nu există în CSS; poate fi doar scrisă de JS.

**A doua devieire de la brief, tot din contrast.** §6.3 cere `opacity: 0.30 + 0.70·e` pe
tot cromul. Cu textul opac deasupra (constrângerea 1!), la `--pc-o = 0.30` textul stă
peste o placă transparentă în proporție de 70%: `--text-muted` ajunge la **3.2:1**. Ca să
treacă AA, podeaua ar trebui urcată la 0.86 — adică rampa n-ar mai fi vizibilă.

Rezolvarea: umplerea rămâne opacă tot timpul, iar rampa se mută pe **definiție** — muchia,
umbra și linia speculară, toate în pseudo-elementele cromului, care citesc `--pc-o` de pe
gazdă. Ce se materializează e conturul plăcii, adică fix lucrul pe care ochiul îl citește
ca „a sosit". Textul are întotdeauna contrastul plat.

Testul cerut, `tests/e2e/labirint-continut.spec.ts`:

- **16 carduri × 5 poziții (`pc` ≈ 0, .25, .5, .75, 1) × 2 direcții = 160 de măsurători.**
  Pentru fiecare: `opacity === '1'`, `transform === 'none'`, `visibility === 'visible'` pe
  tot textul; `.continut` fără `clip-path`, `mask`, `max-height`, `overflow: hidden`;
  textul ≥95% din referință.
- **JS complet dezactivat:** toate cele 16 cromuri la `opacity: 1` + transform identitate,
  inclusiv pseudo-elementele.
- **`prefers-reduced-motion`:** labirint prezent, subiect absent, bandă netranslatată,
  plăci sosite.
- **Perechea browser a lint-ului:** fiecare `.sticla-chrome` / `.labirint` / `.subiect` /
  `.checkpoint` din DOM e sub un `[aria-hidden="true"]`.

**Verificat prin eșec, nu doar prin trecere:** cu `[data-card] .continut p { opacity: 0.99 }`
injectat temporar, matricea pică pe toate cele 160 de poziții cu mesajul corect. Lint-ul
`lint-decor.mjs` pică la fel pe `.placa > .continut { opacity }` și `.sectiune p { transform }`.

### 2. Bidirecțional prin formulă

`pc = 1 − clamp(|offsetCard − scrollY| / vh, 0, 1)`, easing `smoothstep` (`p²(3−2p)`),
calculat din `window.scrollY` real (nu `lenis.targetScroll`). Zero `play()`, zero
`reverse()`, zero `IntersectionObserver` care declanșează o tranziție. `pc` e o distanță,
deci n-are direcție, deci n-are ce să inverseze.

Coada: 4 lerp-uri diferite (0.18 / 0.12 / 0.08 / 0.05), **fără nicio logică de direcție** —
un offset semnat `sign(v)` ar fi făcut coada să sară pe partea cealaltă la fiecare oprire.

Licărirea, singura excepție (eveniment, nu stare): latch cu histerezis 0.72↑ / 0.45↓,
cooldown global 400ms, 190ms în două bătăi pe muchie (≈1.6% din suprafața plăcii — sub
pragul de 25% din WCAG 2.3.1, deci regulile de flash nu sunt structural angajate).
Keyframe-urile animează `transform: scaleY` pe specular și `border-color` pe muchie,
**niciodată `opacity`** — altfel animația s-ar fi terminat cu un salt înapoi la `--pc-o`.

Măsurat, nu presupus (V13/V14):

```
V14 tremurat 10× peste prag → 1 licărire      (prag: ≤1)
sosire completă             → 1 licărire per card
după re-armare (<0.45)      → exact încă una
```

### 3. Tehnica

Scrub scris de mână peste controllerul Lenis existent, polilinie generată la build,
**LUT de 241 de eșantioane** (brief-ul cere 240; 241 = 240 de intervale = 16 pe fiecare
din cele 15 segmente card→card, deci fiecare checkpoint cade EXACT pe un eșantion — cu
240 interpolarea ar fi tăiat colțul fix în punctul în care placa se materializează).
Zero `getPointAtLength`, zero interogare de DOM SVG, zero dependințe noi.

LUT-ul e parametrizat **pe card**, nu pe lungime de arc: `u = k/15` dă exact checkpointul
`k+1`. O parametrizare pe arc ar fi dat viteză constantă, dar subiectul ar fi ratat
checkpointul cu până la două carduri — adică „placa crește din checkpoint" ar fi devenit
falsă exact în momentul în care se vede.

### 4. `prefers-reduced-motion: reduce`

Controllerul face bail-out înainte de orice listener (regulă v4, neatinsă) → Lenis nu se
instanțiază, `--pc-*` nu se scriu niciodată, banda rămâne la `translate3d(0,0,0)`.
Labirintul se randează static și complet (e harta); subiectul nu se randează deloc (un
marcaj nemișcat n-are referent). Verificat în test, plus screenshot la 390×844.

Notă onestă: sub reduced-motion `data-registru` nu se actualizează, deci labirintul rămâne
în culoarea registrului deschis și pe §08. `#468984` la 0.25 peste `#1B2426` dă **1.28:1**
— tot în banda cerută de criteriul V3 (1.2–1.8). E o pierdere de rafinament, nu de
vizibilitate, și n-am adăugat un al doilea senzor ca s-o repar.

---

## Ce se șterge, ce se păstrează

**Șters:** `Campul.astro`, `CampulSprite.astro`, `<nav class="rail-fir">` + cele ~90 de
linii de CSS ale lui + `SEGMENTE` + `AMPLITUDINI_ZGOMOT` + `puncte()`, `--camp-*`,
`@keyframes campul-deriva`, blocul `.sticla` din `tokens.css`.

**Redenumit:** `RailFir.astro` → `ControlerCarduri.astro` (numele devenise o minciună).

**Păstrat neatins:** Lenis cu toate opțiunile (`lerp: 0.1`, `syncTouch: false`,
`allowNestedScroll: true`, `anchors: false`), snap-ul pe viteză (prag 45), fereastra de
gest de 400ms, coada de flick, `DURATA_SALT`, deadline-ul, rutarea ancorelor,
handler-ul de tastatură, tilt-ul recalibrat (1.2°, `perspective(2000px)`, 220ms),
`.camp-activ` ca plafon unic de cost, `IndicatorScrollIntern`, `CtaSticky`, `.js-reveal`,
scriptul de disclosure de overflow, `--text-muted-pe-secundar`, tot copy-ul, toți
invarianții din `CLAUDE.md` §1.

**Modificat structural:** `.sectiune.card` și `.hero` și-au pierdut `z-index: 0`. Nu e
curățenie — cu un context de stacking pe fiecare card, placa ar fi rămas prizonieră sub
stratul fix al labirintului oricât de mare i-am fi dat z-index-ul. Ierarhia nouă:
fundal de secțiune < labirint (1) < subiect (2, în același container) < placă (3) <
indicator de scroll (4) < CtaSticky (40). `IndicatorScrollIntern` a urcat de la 2 la 4 din
același motiv. Footerul a primit `position: relative; z-index: 3` — e în afara sistemului
de carduri și n-are placă, deci fără el labirintul i-ar fi trecut peste linkuri.

**Banda de labirint:** `--banda-sus: max(--marja-sticla, 12dvh)` /
`--banda-jos: max(--marja-sticla, 8dvh)` (egalizate la 12dvh peste 48rem, unde CtaSticky
dispare). La 360×800 dă 160px de labirint vizibil = 3.2 celule → criteriul V8 (≥3) trece.
**Preț recunoscut (D30):** placa cedează ~20dvh, deci mai multe carduri au scroll intern.
Nimic nu se taie — `overflow-y: auto` e permanent activ și indicatorul e deja implementat.

**FĂRĂ `max-height: 84%` pe placă**, deși brief-ul îl cere. Regula benzii trăiește deja în
padding-ul cardului, care o garantează prin construcție. Un `max-height` peste ea ar fi
fost activ exact în cazul pe care nu-l acoperă — un card cu conținut mai lung decât
ecranul — iar acolo cutia s-ar fi oprit la 84% și textul ar fi curs vizibil în afara
plăcii (cromul e `inset: 0` pe o cutie care nu mai acoperă conținutul).

**FĂRĂ parallax pe labirint** (nivelul D2 din scara de degradare, adoptat din start). Nu e
o economie de performanță, e o cerință de geometrie: checkpointurile trebuie să rămână
lipite de coridor, iar un parallax care mișcă desenul dar nu marcajele le-ar fi desincronizat
vizibil. Mișcarea vine oricum din bandă, care derulează pe tot documentul.

---

## Costul real pe mobil — măsurat, cu limitele metodei declarate

Metodă: Chromium prin CDP, 360×800, DPR 2, `Emulation.setCPUThrottlingRate = 4`, scroll
continuu 3 secunde condus din **afara** paginii (`page.mouse.wheel`, nu o buclă JS în
pagină — prima încercare avea harnessul însuși ca cel mai lung task din măsurătoare și
raporta 32fps fals). Metrici din `Performance.getMetrics`, comparate cu aceeași pagină cu
`[data-labirint] { display: none }` — deci delta e costul de RANDARE al labirintului,
bucla JS rulând identic în ambele.

| | cu labirint | fără labirint | delta |
|---|---|---|---|
| ScriptDuration | 132ms | 94ms | +38ms / 3s |
| RecalcStyleDuration | 189ms | 87ms | +102ms / 3s |
| LayoutDuration | 9ms | 11ms | ~0 (zero reflow în calea de scroll) |
| TaskDuration | 1317ms | 749ms | **+568ms / 3s ≈ 19% dintr-un nucleu** |
| LayoutCount | 6 | 4 | +2 (doar la `load`/`resize`) |

Cadre: 60fps constant, `p95 = 16.7ms`, zero long tasks >50ms, la throttling 4×.

**Optimizare găsită prin măsurătoare:** prima versiune scria `--lab-y` (proprietate custom)
pe bandă. Proprietățile custom se moștenesc, deci fiecare scriere invalida stilul
întregului subarbore — SVG + 16 checkpointuri + 4 subiecte. `RecalcStyle` era **352ms**.
Trecut pe `banda.style.transform` direct: **189ms**, −46%. E aceeași regulă pentru care
cromul e element-frunză, aplicată acolo unde o ratasem.

**Ce NU pot ști cu metoda asta, declarat explicit:**

1. **CDP throttlează CPU, nu GPU.** Costul de rasterizare al benzii (390×5697px, ~5.7
   ecrane) și cel al lui `backdrop-filter` pe §08 sunt muncă de GPU/rasterizor. Pe un
   Adreno/Mali de gamă medie pot fi semnificativ mai scumpe decât aici, iar măsurătoarea
   de mai sus nu le vede.
2. **Memoria de raster nu e măsurată.** Banda e o singură țesătură transformată de 390×5697.
   Chrome o tilează și rasterizează leneș, dar asta e comportament de implementare, nu
   contract. Pe un telefon cu memorie mică s-ar putea vedea ca re-rasterizare la scroll rapid.
3. **Cadrele în headless nu sunt vsync real.** `p95 = 16.7ms` peste tot, inclusiv pe
   varianta fără labirint — semn că rAF-ul e condus de un ceas fix, nu de compozitor. De
   aceea metrica pe care o raportez e `TaskDuration`, nu fps.
4. **`syncTouch: false`** înseamnă că pe telefon scroll-ul e nativ; măsurătoarea de aici e
   pe rotiță, prin Lenis. Comportamentul la inerția reală de iOS/Android nu e acoperit.

**Verdictul onest: nu pot semna „merge bine pe Android mediu" fără un telefon real.** Pot
semna că bugetul de main thread e respectat cu marjă mare și că nu există reflow forțat în
calea de scroll. Rămâne de verificat pe device.

**Octeți** (din `dist/client/index.html`, gzip real):

| | brut | gzip | buget brief |
|---|---|---|---|
| SVG labirint | 2 995 | **1 159** | ≤6KB gzip ✓ |
| LUT JSON | 3 026 | **988** | — |
| bundle controller (Lenis inclus) | 24 604 | 7 670 | +≤2KB peste v4 ✓ (+~0.6KB) |

Geometria: 108 sub-rânduri × 12 coloane, 77 segmente de coridor + 50 de ramuri + 84 de
„alte coridoare", 2 211 octeți de `d`. Traseu total 1 800 de unități.

---

## Judecata vizuală — ce arată bine și ce nu

Screenshoturi live la 390×844 și 1280×900, pe cardurile 1, 2, 5, 8, 12, 16, plus o poziție
de tranziție și ambele viewporturi sub `prefers-reduced-motion`. **M-am uitat la ele.**

**Citește ca labirint? Da.** 100% ortogonal, trei greutăți de linie (1.25 / 1 / 0.5px reali,
`non-scaling-stroke`), colțuri și fundături vizibile, zero diagonale. Nu citește ca
zgârieturi și nu citește ca hârtie milimetrică. La 1280×900 e cel mai convingător — se văd
3–4 rânduri de celule deodată, cu coridorul principal distinct de ramuri.

**Defect prins și reparat pe screenshot:** prima versiune avea `vector-effect="non-scaling-stroke"`
pe `<g>`, unde n-are niciun efect (nu e proprietate moștenită, nici în SVG 1.1, nici în SVG 2).
Liniile orizontale ieșeau la ~6.6px și cele verticale la ~4px — exact artefactul „crăpături"
care a omorât v3, plus o asimetrie inexplicabilă. Mutat pe fiecare `<path>`.

**Subiectul se vede și se înțelege ce e? Da.** Pătrat plin cu inel, în banda de sus, la
poziție identică pe toate cele 16 carduri. Se citește ca „ești aici" pentru că e același
glif cu checkpointurile, doar plin + încercuit. Coada de 3 fantome e vizibilă la scroll și
se așază peste cap la oprire.

**Cardurile deschise citesc ca plăci distincte? Da** — și e o schimbare mare față de ce a
raportat userul. Muchia se vede pe alb, umbra desenează elevația, iar banda de labirint din
jur dă marginea plăcii un contrast de textură, nu doar de luminanță.

**Ce NU arată perfect, declarat:**

1. **Sosirile sunt subtile.** `scale` 0.955→1 înseamnă 4.5% pe toată tranziția, iar
   `--org-y` e constant (checkpointul e la aceeași înălțime la fiecare oprire în modelul de
   bandă), deci variația celor 16 intrări e **doar orizontală**. Sunt 12 poziții distincte
   din 16 (cele 4 CTA împart deliberat centrul). **V12 din brief cere „vizibil diferit la
   cel puțin 12 din 16" — se atinge la limită, și cu variație doar pe o axă.** Dacă la QA se
   consideră insuficient, pârghia corectă e dispersia coloanelor sau amplitudinea lui
   `scale`, nu un al doilea efect.
2. **Banda de jos e mâncată de `CtaSticky` pe mobil.** Sub 48rem bara acoperă ~64px din cei
   68px ai benzii de jos, deci practic labirintul se vede doar deasupra plăcii. Nu e un
   regres (banda de sus e dimensionată să acopere singură criteriul V8), dar compoziția e
   asimetrică pe telefon.
3. **Densitatea variază mult de la card la card.** Pe unele poziții banda prinde o zonă cu
   trei ramuri, pe altele doar un coridor drept. E consecința geometriei deterministe, nu
   un bug — dar înseamnă că V1 (4–9 intersecții / 200×200px) trece pe medie, nu peste tot.
4. **Coada se așază lent după un salt programat.** Fantoma cea mai lentă (lerp 0.05) are
   nevoie de ~1.5s ca să prindă capul după un salt de ecran întreg. La scroll real
   distanțele sunt mici și nu se observă; la un `#inscriere` din CTA se vede o dâră care
   mai persistă o secundă. Îmi place cum arată, dar e un efect secundar, nu o alegere.
5. **Blocurile albe din §06/§09 rămân „card în card"** pe placa albă. E preexistent din v4,
   neagravat (tocmai pentru că n-am tintat placa), dar rămâne pe listă.

## Verificat

```
npm run contrast   → 39 de perechi, toate peste prag  ✓
npm run lint:decor → 11 reguli, zero încălcări        ✓  (nou, în `npm run verify`)
npm run test       → 135/135                          ✓
npm run test:db    → 5/5 suite (stare, drepturi, rate limit, retenție, cursă 20/20) ✓
npx astro check    → 0 erori, 0 avertismente, 0 hints ✓
npm run build      → complet                          ✓
npx playwright test → 45 passed, 1 skipped            ✓  (era 38; +7 din labirint)
```

Testul sărit e matricea 16×5×2, care rulează deliberat doar pe proiectul `mobil-360` —
360px e singurul viewport unde placa acoperă aproape tot ecranul, deci singurul unde o
eroare de mască/clip ar avea consecințe.

## Fișiere atinse (v5)

- **Adăugate:** `src/lib/labirint-geometrie.ts`, `src/components/Labirint.astro`,
  `src/styles/labirint.css`, `scripts/lint-decor.mjs`,
  `tests/e2e/labirint-continut.spec.ts`
- **Redenumite:** `src/components/RailFir.astro` → `src/components/ControlerCarduri.astro`
- **Șterse:** `src/components/Campul.astro`, `src/components/CampulSprite.astro`
- **Modificate:** `src/components/Sectiune.astro`, `src/components/S01Hero.astro`,
  `src/components/S17Footer.astro`, `src/components/IndicatorScrollIntern.astro`,
  `src/pages/index.astro`, `src/layouts/Base.astro`, `src/styles/tokens.css`,
  `scripts/check-contrast.mjs`, `package.json`
- **Neatinse:** `src/content/copy.ts`, `src/content/form-schema.ts`, toate rutele
  `/api/*`, `CtaSticky.astro`, `Cta.astro`, toate cele 15 componente de secțiune,
  formularul, structura de 17 secțiuni
