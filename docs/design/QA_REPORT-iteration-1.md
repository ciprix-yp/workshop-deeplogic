# QA Report — iterația 1

Redesign „cartonaș + scroll hijack" (v2), peste `docs/design/DESIGN_BRIEF.md` și
`docs/design/IMPLEMENTATION_NOTES.md`. Server verificat pe `http://localhost:4321`
(portul real de `astro dev`/`playwright.config.ts` — nu 3000).

## Verificare live (Playwright MCP)

**Indisponibilă.** `ToolSearch` + system-reminder confirmă `plugin:playwright:playwright`
în stare `ConnectionRefused`/cache de eșec recent (necesită restart de sesiune). Am trecut
pe harness-ul din Pasul 2 (`npx playwright test`, executat direct prin Bash — nu prin
tool-uri MCP) plus scripturi Playwright ad-hoc (chromium API directă, ca `scripts/screenshots.mjs`
din proiect) pentru toate verificările de comportament (hijack, tastatură, reduced-motion,
overflow). Toate rezultatele de mai jos vin din rulare reală, nu din citirea codului.

## Regresie vizuală

**Baseline creată** (prima trecere a acestui harness pe acest proiect/design). Detalii:

- Template generic copiat în `tests/visual-regression.spec.ts`, cu o singură corecție
  necesară: `waitUntil: 'networkidle'` → `'load'` + `document.fonts.ready`. Motiv:
  pe `astro dev`, websocket-ul de HMR ține conexiunea deschisă la nesfârșit — `networkidle`
  nu se atinge niciodată (timeout 30s pe fiecare test, 4/5 teste picau din acest motiv,
  nu din regresie reală). Același defect e deja documentat, cu același fix, în
  `scripts/screenshots.mjs` al proiectului. Am adăugat `playwright.visual-qa.config.ts`
  (nou, la rădăcina proiectului) doar ca să pot rula spec-ul din afara `testDir: './tests/e2e'`
  din `playwright.config.ts`-ul proiectului — nu am atins acel fișier.
- Baseline: 5/5 (`--update-snapshots`). Re-rulare fără flag: 5/5, zero diff — determinist.
- Suplimentar, am rulat tool-ul vizual **nativ al proiectului**, `node scripts/screenshots.mjs`
  (360/390/768/1280/1920, exact breakpoint-urile cerute) — **zero defecte** pe auditul lui
  determinist (scroll orizontal, erori consolă, țintă <44px, alt text, ierarhie de headinguri,
  diacritice ș/ț, etichete de formular) pe toate cele 5 ecrane. Asta a suprascris screenshot-urile
  vechi (v1, pre-cartonaș) din `tests/visual/__screenshots__/` — inevitabil, dat fiind că
  scriptul e chiar mecanismul de referință al proiectului pentru acest audit, nu o unealtă
  externă adusă de mine.
- Suita `tests/e2e/*.spec.ts` existentă (formular, b2-siguranță-GET, motion): **38/38**,
  confirmă independent cifra din `IMPLEMENTATION_NOTES.md`. Notă: niciunul din aceste teste
  nu exercită sistemul de hijack/carduri direct — motiv pentru care defectul #1 de mai jos
  a scăpat neacoperit de suita automată.

## Anti-slop (`impeccable detect .`)

**0 rezultate noi introduse de această trecere.** 2 rezultate preexistente, deja
disclosed explicit în `DESIGN_BRIEF.md` („2 rezultate neconexe: imagine placeholder §11,
supra-uz de linie"):
- `broken-image` — `src/components/S11Facilitator.astro:9` (placeholder, nu creat de
  motion-engineer).
- `em-dash-overuse` (advisory) — `src/layouts/Base.astro` (agregat pe body text al
  întregii pagini, preexistent).

## Animație (`review-animations` — cele zece standarde)

| Before | After | Why |
| --- | --- | --- |
| `wheel` handler: al doilea flick în timpul saltului (`animand=true`) e complet ignorat (`ev.preventDefault(); return;`, fără efect asupra țintei) — `RailFir.astro:352-355` | acumulează delta-ul noului gest și retarghetează `navigheazaLa` spre ținta actualizată la finalul animației curente, în loc să-l arunce | Standardul 6 (interruptibilitate): gest rapid repetat trebuie să poată redirecționa mișcarea în curs, nu doar să fie înghițit — verificat empiric: 2 flick-uri rapide succesive (al doilea la +150ms în animația de 450ms) aterizează pe **1 card**, nu 2 |
| `.segment { transition: opacity 240ms ease, transform 240ms ease; }` — `RailFir.astro:115` | `ease-out` (sau o curbă custom, ex. `cubic-bezier(0.23,1,0.32,1)`) | Standardul 3: `ease` built-in e slab pentru o schimbare de stare (activ/trecut) — un `ease-out` s-ar simți mai imediat exact în momentul în care utilizatorul se uită la rail după salt |

**Verdict, pe secțiunile animate noi (hijack, tilt de card, rail):**

1. **Feel-breaking regressions** — niciuna. Salturile de hijack (450ms, ease-out cubic
   scris de mână, `1-(1-p)³`) sunt corecte ca curbă și durată (sub pragul de 500ms pentru
   „modale/sertare", categoria cea mai apropiată conceptual de un salt de card).
2. **Missed simplifications** — niciuna; nivelul 6/10 declarat în brief e coerent cu ce
   rulează efectiv (un singur controller, nu mecanisme paralele — verificat: rail-ul,
   tilt-ul de card și hijack-ul citesc/scriu aceeași sursă de adevăr, `indexCurent()`/`offsets`).
3. **Performance** — GPU-only respectat: tilt scrie doar `transform` (prin `card.style.transform`),
   hijack folosește `window.scrollTo` nativ, rail-ul animă `opacity`/`transform`. Zero
   `transition: all`, zero `scale(0)`.
4. **Interruptibility & timing** — un findng (tabelul de mai sus): al doilea gest rapid
   în timpul unui salt e ignorat, nu retarghetat. Impact moderat (fereastra e doar 450ms),
   dar contrazice literal Standardul 6.
5. **Origin, physicality & cohesion** — tilt-ul de card (2°, `perspective(1600px)`) e
   coerent cu tonul editorial/calm al paginii; nu concurează vizual cu tilt-ul de sub-bloc
   (8°, elemente DOM separate, verificat: zero elemente cu ambele atribute `data-tilt`
   ȘI `data-reveal`).
6. **Accessibility** — `prefers-reduced-motion` respectat pe toate cele trei ieșiri
   (verificat live, nu doar citit: vezi secțiunea de mai jos). Tilt-ul e corect închis
   în spatele `(hover: hover) and (pointer: fine)`.

**Decizie: Approve cu observație** — niciun regres „feel-breaking", dar findingul de
interruptibilitate (#1 din tabel) e o corecție mică, cu prioritate reală pentru feel-ul
de „feed social" pe care brief-ul îl cere explicit („scroll rapid = sare la cardul următor").

## Accesibilitate / Performanță

### Defect major nou-descoperit (nu era în lista lui motion-engineer)

**Centrare „unsafe" pe cardurile cu overflow ascunde primul conținut (inclusiv titlul),
irecuperabil prin scroll — pe §02 și §08, exact secțiunile pe care CLAUDE.md le protejează
explicit.**

- Cauză: `.sectiune.card { justify-content: center; overflow-y: auto; height: 100dvh; }`
  (`Sectiune.astro:107-113`). Când conținutul depășește `100dvh`, centrarea „unsafe" (fără
  `safe`) împinge cam tot excedentul **deasupra** ariei vizibile, nu simetric. La încărcare,
  `scrollTop` pornește la `0` (minimul posibil — verificat, `card.scrollTo({top:-500})` nu
  schimbă nimic) — iar acel `0` corespunde deja unei poziții **sub** h2-ul secțiunii.
- **Verificat direct, la 360×800**: `#problema` (h2 „AI-ul e peste tot...") are h2 la
  **-494px** relativ la cardul vizibil, la `scrollTop=0` — complet în afara ariei, fără nicio
  cale de scroll să-l aducă înapoi (nu doar „tăiat", ci **nereachable**). Confirmat cauzal:
  am setat temporar `justify-content: flex-start` pe același card, în același state — h2-ul
  a sărit instant la `top: 20px` (vizibil). Efectul se reproduce identic pe **§08**
  (`ce-pleci-cu-tine`, h2 la -396px la 360×800) — **exact cele două secțiuni pe care
  CLAUDE.md §2 le numește „nu se taie la mobil", „cele mai importante două secțiuni"**.
- **Nu e limitat la mobil**: la 1920×1080 (desktop generos), `#problema` are h2 ascuns la
  -278px; la 1280×800, la -399px. Orice card cu overflow real (vezi tabelul de mai jos)
  suferă de asta, indiferent de breakpoint.
- Discrepanță față de `IMPLEMENTATION_NOTES.md`: „Cardul-mecanism (`overflow-y: auto`,
  permanent activ) tratează corect toate aceste cazuri — nimic nu se taie" — afirmația e
  **falsă** pentru conținutul din capul cardului. Verificarea motion-engineer-ului a confirmat
  că se poate deruala **în jos** pentru a vedea restul, dar n-a verificat dacă vârful
  conținutului rămâne accesibil în sus — nu rămâne.
- **Fix recomandat** (pentru motion-engineer, nu implementat aici — `visual-qa` nu editează
  cod): `justify-content: safe center` pe `.sectiune.card` (fallback nativ la `flex-start`
  exact când centrarea ar cauza pierdere de conținut — suportat Chromium/Firefox/Safari
  actuale), SAU: cardul cu `.deruleaza-real` (clasa deja setată de `RailFir.astro` la
  detectarea overflow-ului real) primește și el `justify-content: flex-start`, la fel cum
  `.scroll-intern` și media query-ul de 559.98px o fac deja — e literalmente același
  mecanism, doar că lipsește regula CSS pentru al treilea declanșator.

### Amploarea reală a overflow-ului la `100dvh` — verificată independent

Motion-engineer a raportat „12 din 16 carduri" la 360×800. **Verificat direct: 13 din 16**
(nu 12) — lista completă, cu pixelii măsurați chiar acum (pot varia ±10-20px față de cifrele
lui, probabil timing/randare fonturi, nu contează pentru concluzie):

| Secțiune | Overflow (360×800) | Indicator vizibil? |
|---|---|---|
| §01 hero | 118px | da |
| §02 problema | 514px | da |
| §03 rezultatul | 258px | da |
| §04 pentru-cine | 25px | da |
| §05 inainte-dupa | 154px | da |
| §06 ce-facem | 439px | da |
| §07 nu-doar-teorie | **0 (încape)** | — |
| §08 ce-pleci-cu-tine | 416px | da |
| §09 use-cases | 187px | da |
| §10 deep-logic | **0 (încape)** | — |
| §11 facilitator | 118px | da |
| §12 precedent | **0 (încape)** | — |
| §13 detalii | 61px | da |
| §14 de-ce-gratuit | 136px | da |
| §15 intrebari | 299px | da |
| §16 inscriere | 2679px (forțat `.scroll-intern`) | da |

**Pe alte breakpoint-uri (câte din 16 depășesc `100dvh`):** 390×844 → 12/16 · 768×1024 → 4/16
(`§02`, `§06`, `§08`, `§16`) · 1280×800 → 6/16 · **1920×1080 → 4/16** (`§02`, `§06`, `§08`,
`§16` — inclusiv pe desktop full-HD generos) · 812×375 (telefon landscape, sub pragul de
560px din brief) → 15/16 · 1280×500 (desktop scund) → 11/16.

Concluzie: amploarea e **mai mare** decât raportat (13 vs 12 la breakpoint-ul de referință),
și — lucru nemenționat de motion-engineer — problema **nu dispare pe desktop**: chiar la
1920×1080, `§02`/`§06`/`§08` tot intră pe fallback. Recomandarea din
`IMPLEMENTATION_NOTES.md` de a retunda tipografia per-secțiune, pentru runda următoare,
rămâne corectă și devine mai urgentă având în vedere bug-ul de centrare de mai sus.

### Fallback de scroll intern — verificat funcțional, cu o excepție

- **Indicator vizibil pe 100% din cardurile cu overflow real**, pe toate breakpoint-urile
  testate (inclusiv 812×375, sub pragul de 560px) — mecanismul `.deruleaza-real` funcționează
  exact cum descrie `IMPLEMENTATION_NOTES.md`.
- **Defect minor nou-găsit**: indicatorul **rămâne vizibil chiar și după ce cardul a fost
  derulat complet până la capăt** (`card.scrollTop = card.scrollHeight` → indicator tot
  `display:flex`) — clasele `.deruleaza-real`/`.scroll-intern` sunt calculate o singură
  dată din geometrie statică (load/resize/fonts.ready), nu se actualizează la scroll. Un
  utilizator care a citit tot conținutul unui card încă vede „mai e conținut mai jos",
  ceea ce e o afirmație falsă. Prioritate joasă (nu ascunde nimic, doar induce în eroare
  un semnal deja văzut), dar merită o linie în runda următoare (togglat pe `scroll`, cu
  prag `scrollTop >= scrollHeight - clientHeight - 1`).
- Verificat: nu există suprapunere fizică între indicator și `CtaSticky` la 360×800
  (indicator se termină la y=723px, `CtaSticky` începe la y=731px — 8px liber).

### Hijack pe viteza gestului — comportament real, nu doar cod

- **Wheel rapid** (4× delta 60, ~15ms apart): sare exact la offset-ul cardului următor,
  animat. Verificat pe un card fără overflow intern (§10, ca să izolez hijack-ul de
  `poateAvansa`).
- **Wheel lent** (o rotiță, 10px): rămâne 100% nativ — scroll de exact 10px, zero interceptare.
- **Touch rapid (flick, 300px/100ms via CDP)**: sare la cardul următor.
- **Touch lent (drag, 80px/900ms via CDP)**: rămâne nativ (65px, sub un card întreg).
- **Stress test**: 18 salturi wheel rapide succesive prin toate cele 16 carduri → aterizează
  corect pe ultimul card (§16), segmentul `activ` de pe rail sincron (index 15), **zero
  erori de consolă/pagină** pe tot parcursul.
- **Interruptibilitate** (vezi și secțiunea Animație): al doilea flick rapid, la +150ms
  într-un salt de 450ms, e complet ignorat — utilizatorul aterizează la 1 card distanță,
  nu 2, și trebuie să reia gestul. Minor, dar reproductibil.

### `prefers-reduced-motion: reduce`

Verificat live, cu context Playwright `reducedMotion: 'reduce'`:
- Space → scroll nativ de 860px (comportament implicit de browser „o pagină", nu exact
  900px = un card) — confirmă că scriptul de hijack **nu s-a atașat deloc**.
- Wheel rapid (4×60px) → scroll de exact 240px (suma deltas trimise) — zero `preventDefault`,
  zero salt animat.
- Tilt de card și aprinderea rail-ului: bail-out complet, `if (reduce.matches) return`
  înainte de orice `addEventListener`, pe ambele scripturi din `RailFir.astro`.

### Tastatura — separarea de formular, verificată (nu doar citită)

Testul inițial (folosind `locator.focus()` din Playwright) arăta fals-pozitiv scroll — cauzat
de `scroll-behavior: smooth` din `tokens.css:103` interacționând cu auto-scroll-ul de
focalizare al Playwright, nu de un bug real. Retestat cu navigare `behavior:'instant'` +
`focus({preventScroll:true})`:
- Focus pe primul radio din `#inscriere`, `ArrowDown` → `window.scrollY` **neschimbat**
  (13500 înainte și după), radio-ul selectat se schimbă corect. `card.scrollTop` intern
  se schimbă (653px) — comportament nativ de „scroll into view" în interiorul containerului
  derulabil, nu efect al hijack-ului (corect, așteptat).
- Focus pe checkbox-ul de consimțământ, `Space` → bifează corect, `window.scrollY`
  neschimbat.
- Focus pe `<body>` (în afara formularului), `Space` → sare exact 900px (un card).

### `§17` (footer) în afara sistemului

Verificat: `footer` nu are `data-card`, nu are `data-tilt`; `document.querySelectorAll('[data-card]').length === 16`
și `document.querySelectorAll('[data-rail-fir] .segment').length === 16` — footer-ul nu
apare nicăieri în sistemul de hijack/rail.

### Contrast — elementele noi (indicator de scroll intern), pe toate cele trei fundaluri

Calculat direct (formula WCAG relative luminance), nu presupus din tabelul din `CLAUDE.md`
(care documentează perechile v1, nu neapărat pe fundalul `secundar`):

| Element | Culoare/fundal | Ratio | Prag aplicabil | Rezultat |
|---|---|---|---|---|
| chevron pe fundal `primar` | `#637474` / `#FFFFFF` | 4.91:1 | 3:1 (non-text UI, WCAG 1.4.11) | trece (trece și pragul de text, 4.5:1) |
| chevron pe fundal `secundar` | `#637474` / `#E4E7E7` | 3.94:1 | 3:1 (non-text UI) | trece (n-ar trece 4.5:1 de text, dar nu se aplică — text-ul asociat e `.vizual-ascuns`, doar iconița e vizibilă) |
| chevron pe fundal `inchis` | `#B9C4C4` / `#1B2426` | 8.86:1 | 3:1 | trece cu marjă mare |

Zero hex nou — tokens reutilizate corect, exact cum cere brief-ul.

### Performanță (aproximativ — chrome-devtools MCP indisponibil)

`ToolSearch` confirmă `plugin:chrome-devtools-mcp:chrome-devtools` în `ConnectionRefused`.
Aproximare via Playwright `PerformanceObserver`, pe server de **dev** (nu build de producție
— cifrele sunt indicative, nu autoritative):
- LCP ≈ 192ms, CLS = 0 (inclusiv după un salt de hijack — `window.scrollTo` nu produce
  layout shift măsurabil), TTFB ≈ 17ms.
- 53 resurse, ~2.1MB transferat — cifră de dev server (include client HMR, fără minificare/
  compresie de producție), nerelevantă direct pentru CWV real; recomand remăsurare pe
  `npm run build && npm run preview` (Cloudflare Workers runtime) într-o rundă viitoare cu
  acces la chrome-devtools MCP.

## Verdict

**Necesită iterația 2**, defecte prioritizate:

1. **[Major, nou-găsit] Centrare „unsafe" ascunde ireversibil vârful conținutului
   (titlu + primele paragrafe) pe orice card cu overflow real — inclusiv §02 și §08,
   secțiunile pe care CLAUDE.md le protejează explicit, pe mobil ȘI pe desktop (1920×1080
   inclus).** Fix propus: `justify-content: safe center` pe `.sectiune.card`, sau
   `justify-content: flex-start` adăugat la selectorul `.deruleaza-real` (paritate cu
   `.scroll-intern` și media query-ul de 559.98px, care deja au regula).
2. **[Amploare, corectare de cifră] 13/16 carduri depășesc `100dvh` la 360×800 (nu 12/16
   cum a raportat motion-engineer), și overflow-ul persistă chiar la 1920×1080 pe 4 carduri
   (`§02`, `§06`, `§08`, `§16`).** Retunare de scală tipografică per-secțiune pentru cardurile
   cele mai lungi (`§02`, `§06`, `§08`, `§15`), cum recomandă deja `IMPLEMENTATION_NOTES.md`
   — acum cu prioritate mai mare, fiindcă defectul #1 face ca overflow-ul necontrolat să
   nu mai fie doar „derulabil", ci parțial irecuperabil.
3. **[Minor] Interruptibilitate hijack**: al doilea flick rapid, declanșat în timpul unui
   salt de 450ms, e ignorat complet (nu retarghetat) — utilizatorul rămâne la 1 card distanță
   după 2 flick-uri rapide succesive.
4. **[Minor] Indicatorul de scroll intern rămâne vizibil după ce cardul a fost derulat
   complet** (nu se ascunde la `scrollTop` maxim) — semnal fals de „mai e conținut".
5. **[Cosmetic] `.segment` de pe rail folosește `ease` în loc de `ease-out`/curbă custom**
   pentru tranziția opacity/transform la activare.

Neafectate, verificate și confirmate corecte, fără necesitate de re-lucru: mecanismul de
hijack pe viteză (wheel + touch, rapid vs lent), separarea completă tastatură-vs-formular,
bail-out-ul de `prefers-reduced-motion`, izolarea §17/footer, contrastul elementelor noi,
absența conflictului tilt/reveal, zero erori de consolă, zero regresii anti-slop.
