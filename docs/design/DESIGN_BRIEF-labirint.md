# Design Brief — Labirintul (variantă alternativă la v4)

**Document separat, deliberat.** `docs/design/DESIGN_BRIEF.md` (v4 — cardul de sticlă) e în
curs de implementare chiar acum. Fișierul ăsta nu îl atinge și nu îl înlocuiește: e o direcție
alternativă, construită PESTE aceeași fundație, care poate fi citită, respinsă sau adoptată
fără să blocheze nimic din ce se scrie în paralel. Dacă e adoptat, v4 rămâne în istoric ca
etapă, exact cum v1–v3 sunt deja.

**Cerința, în cuvintele userului:** fundalul devine un labirint animat de scroll; un „subiect"
se deplasează prin labirint și ajunge la un checkpoint; de acolo se expandează și crește un
card 3D, cu un efect de licărire statică, pe care e scris un segment de conținut; acțiunea
continuă înainte ȘI înapoi. Animație cinematică, motion graphics moderne.

---

## 0. Verdictul, sus, înainte de orice altceva

Trei lucruri pe care coordonatorul le-a cerut explicit și pe care nu le ascund la pagina 9:

1. **Labirintul încape în buget. Sticla mată nu mai încape lângă el.** Nu se pot avea
   simultan, pe un Android mediu, la 360px: labirint + `backdrop-filter` pe trei plăci de
   ecran plin + Lenis + tilt. Ce tai: `backdrop-filter` pe cele 14 carduri deschise. Motivul
   nu e estetic, e măsurat — vezi §7. Blurul rămâne **doar pe registrul închis** (§02 și §08),
   unde e singurul loc în care are ce să înmoaie. Dacă userul refuză să renunțe la sticla mată
   pe cardurile deschise, **atunci labirintul trebuie să pice** — nu încap amândouă, iar un
   plan care pretinde altceva pică pe telefon, nu în review.
2. **„Licărirea statică" o reinterpretez, și spun exact cum.** Vezi §6.4. Varianta literală
   (pâlpâire de luminozitate pe toată placa) e simultan risc de fotosensibilitate WCAG 2.3.1
   și cel mai ieftin mod de a face pagina să arate ca un template. O înlocuiesc cu o
   **descărcare pe muchia plăcii**, două bătăi, 190ms, sub 2% din suprafață.
3. **Firul dispare ca widget și devine subiectul.** Nu e o ștergere, e o mărire: railul era
   16 segmente verticale în stânga; coridorul e aceleași 16 segmente, la scara ecranului.
   Vezi §5.

---

## Sursă

**De la zero** — fără sursă Figma. Nu s-a dat niciun URL Figma cu `node-id`, deci nu există
`fileKey`/`nodeId` de notat.

Construit peste evidența existentă, citită direct, nu presupusă: `docs/design/DESIGN_BRIEF.md`
(v4), `docs/DECIZII.md`, `CLAUDE.md`, `src/styles/tokens.css`, `src/components/RailFir.astro`,
`Campul.astro`, `CampulSprite.astro`, `Sectiune.astro`, `src/pages/index.astro`,
`src/content/copy.ts`, `scripts/check-contrast.mjs`, `package.json`.

**Note de proces, onest raportate:**

- `ui-ux-pro-max/scripts/search.py` a rulat (`--design-system --motion 7`). **Ieșirea e
  respinsă integral** și n-a influențat nimic din document: a recomandat „Recording red
  #DC2626 + waveform blue #2563EB" și perechea Outfit/Work Sans, adică exact slopul generic
  pentru care paleta asta a fost calculată de mână și verificată WCAG. Paleta și tipografia
  acestui proiect sunt înghețate din `CLAUDE.md` §3. Singurul lucru reținut din rulare:
  confirmarea că pattern-ul „parallax scroll, scrub, linear, `matchMedia` reduced-motion" e
  registrul corect — ceea ce știam.
- `/impeccable init` **tot n-a rulat** (`.impeccable/` conține doar `config.json`; `PRODUCT.md`
  lipsește). Am făcut manual trecerea prin `impeccable/reference/craft-floor.md`. Rezultatul
  contează și e în §9 — inclusiv **un anti-pattern pe care brief-ul ăsta chiar îl atinge** și
  pe care îl rezolv, nu îl ocolesc.

---

## Paletă

**Zero hex nou.** Toată direcția se construiește din tokenii existenți, la alfe calculate.

| Token | Hex | Unde apare în labirint | Justificarea prezenței |
|---|---|---|---|
| `--accent-decor` | `#468984` | pereții labirintului, ramurile-fundătură, grila slabă, **subiectul**, conturul celor 16 checkpointuri | licențiat explicit pentru decor non-text (`CLAUDE.md` §3). Nimic din labirint nu poartă text. |
| `--accent-clar` | `#7FD1C4` | aceleași, pe registrul închis (§02, §08) | deja folosit pe Fir pe fundal închis; aceeași regulă, alt registru |
| `--accent` | `#376A66` | **doar** conturul celor 4 checkpointuri-CTA (rândurile 1, 5, 8, 16) | păstrează gramatica railului, unde `--accent` era rezervat exclusiv nodurilor-CTA. Un al cincilea punct de acțiune n-ar exista nici acum. |
| `--bg` / `--bg-secundar` / `--bg-inchis` | `#FFFFFF` / `#E4E7E7` / `#1B2426` | tenta plăcii, per registru | mecanismul de contrast, moștenit neschimbat din v4 |
| `--secundar` | `#2F4F4F` | nefolosit de labirint | rămâne exclusiv pentru text |
| `--text-muted-pe-secundar` | `#576565` | nefolosit de labirint | fixul preexistent din v4 rămâne, e independent |

**Alfele, calculate, nu alese:**

| Element | Alpha deschis | Alpha închis | De unde vine numărul |
|---|---|---|---|
| Câmpul de labirint (grup întreg) | **0.25** | **0.20** | plafonul v4, păstrat — vezi §8 pentru de ce mecanismul se schimbă din `stroke-opacity` în `opacity` de grup |
| Subiectul + fantomele lui | **0.32** | **0.50** | **calculat aici**, §8.3: la 0.32, cel mai slab text al paginii (`--text-muted` `#637474` peste tenta 0.82) rămâne la **4.60:1**. La 0.39 pică sub 4.5. |
| Tenta plăcii | 0.82 / 0.88 / 0.70 | — | neschimbate din v4, și **rămân valide** — vezi §8.1 |

---

## Tipografie

**Neschimbată.** Inter (titluri) / Source Sans 3 (corp) / IBM Plex Mono (date, numerotare),
self-hostate, subset `latin` + `latin-ext`, scală `clamp()` ancorată la 360px.

Labirintul, subiectul, checkpointurile și cromul plăcii sunt toate `aria-hidden="true"` și
niciunul nu poartă un glif. Nu există niciun text nou pe pagină în tot documentul ăsta.

---

## Layout

Neschimbat structural: `§01`–`§16` = 16 carduri `100dvh`, `§17` (footer) în afara sistemului.
Ce se schimbă e **numărul de straturi de fundal**: de la 16 (câte un `<Campul>` absolut per
card) la **unul singur, `position: fixed`, pe toată pagina**.

```
  ┌─ viewport ─────────────────────────────────────────────────┐
  │ ░░░░░░░░░░░░░░░░ banda de labirint (≥8vh) ░░░░░░░░░░░░░░░░ │  ← se vede labirintul
  │  ┌──────────────────────────────────────────────────────┐  │
  │  │ ▒ crom (border 1px + specular + umbră) ── se animă ▒ │  │  ← .sticla-chrome (aria-hidden)
  │  │                                                      │  │
  │  │   H2 ...............................................│  │  ← .continut — ZERO proprietăți
  │  │   corp .............................................│  │     animate, niciodată
  │  │   corp .............................................│  │
  │  │                                                      │  │
  │  └──────────────────────────────────────────────────────┘  │
  │ ░░░░░░░░░░░ ● subiectul trece prin bandă ░░░░░░░░░░░░░░░░░ │
  └────────────────────────────────────────────────────────────┘
     strat 0: <Labirint /> — fixed, static, o singură rasterizare
     strat 1: <Subiect />   — fixed, 4 elemente, singurul lucru care se mișcă continuu
     strat 2: .sticla-chrome — 3 elemente active, scale+opacity
     strat 3: .continut     — textul. Static. Întotdeauna.
```

**Banda de labirint e obligatorie, nu opțională.** La 360×800, placa acoperă azi ~95% din
ecran, deci un labirint sub ea ar fi invizibil (vezi calculul din §8.1: o linie sub tenta 0.82
e la ~3% delta de luminanță — practic albul paginii). Prin urmare:

> **Placa nu depășește 84% din înălțimea cardului.** Restul (≥8vh sus, ≥8vh jos) e bandă de
> labirint garantată. Între două plăci consecutive, în timpul scroll-ului, banda vizibilă e
> ≥16vh continuu.

**Costul acestei reguli, spus direct:** cardurile care azi abia încap în `100dvh` vor
declanșa mai des scroll intern. La 360×800, notele de implementare v4 spun că majoritatea
cardurilor deja depășesc `100dvh` — deci practic nu se pierde nimic nou: cardurile care
scrollau intern vor scrolla intern puțin mai mult, cu același indicator vizibil deja
implementat. **Nimic nu se taie** (`overflow-y: auto` e permanent activ), deci regula
„§02/§08 nu se taie la mobil" din `CLAUDE.md` §2 rămâne respectată. Dar e o degradare reală
de fit și trebuie recunoscută ca preț plătit pentru labirint, nu ascunsă.

---

## Element-semnătură — coridorul

**UN element, nu trei.** Nu „labirint + subiect + carduri care cresc" ca trei sisteme
decorative: un singur obiect — **coridorul** — pe care celelalte două sunt stări.

### 5.1 De ce e câștigat de brief, nu lipit peste el

§02 spune, în `src/content/copy.ts`, linia 87, cuvânt cu cuvânt:

> *„Problema ta nu e că nu vrei AI. **E că n-ai o hartă.**"*

și, două linii mai jos: *„Și cât timp n-ai harta, nu iei nicio decizie."* Livrabilul din §08
și răspunsul din §15 sunt amândouă „harta ta". Sub-titlul din OG (`copy.ts:661`): *„Pleci cu o
hartă scrisă, nu cu notițe."*

**Un labirint e definiția vizuală a absenței hărții.** Pagina nu primește un fundal cu temă
de labirint pentru că labirinturile arată interesant; primește exact figura pe care propriul
ei text o numește de patru ori. Un subiect care traversează labirintul checkpoint cu
checkpoint, cu labirintul devenind mai simplu pe măsură ce coboară, e teza paginii desenată
în geometrie: intri în complexitate, ieși cu un traseu.

Testul de onestitate pe care mi-l aplic: *aș livra același element pentru orice alt brief
similar?* Nu. Pentru un workshop de vânzări sau de fiscalitate, labirintul ar fi decor. Aici
e citat.

### 5.2 Ce se întâmplă cu Firul (răspuns la constrângerea 6)

**Firul se absoarbe în labirint. Widget-ul `<nav class="rail-fir">` se șterge. Controller-ul supraviețuiește intact.**

Argumentul, în ordine:

1. **Aceeași informație, de două ori.** Railul spunea „ești la cardul k din 16, iar 4 dintre
   ele sunt CTA-uri". Coridorul spune exact asta — 16 rânduri, 4 marcate `--accent`. Două
   indicatoare pentru un singur fapt e definiția lui „decorez peste tot". Justificarea din v4
   („trei scări diferite, nu concurează") funcționa cât timp fundalul purta **zero**
   informație; labirintul poartă, deci justificarea expiră.
2. **Coridorul spune mai mult.** Railul arăta o poziție într-un șirag. Coridorul arată și
   *forma a ce urmează*: dens și ramificat sus, deschis și drept jos. Progres + caracter, nu
   doar progres.
3. **Recuperează spațiu exact unde e cel mai scump.** Railul e `position: fixed; left: 0.5rem`
   pe mobil, adică fix în banda pe care `--marja-sticla` (12px) o vrea și ea.
4. **Costul e zero pe accesibilitate.** Railul era `aria-hidden="true"` + `pointer-events:
   none` — nu contribuia nimic pentru cititoarele de ecran. Nu se pierde nicio funcție de AT.

**Ce NU se șterge:** cele două `<script>`-uri din `RailFir.astro`. Al doilea conține
`actualizeazaRail`, care e sursa unică de adevăr pentru `.camp-activ` (azi 3 consumatori,
mâine 4), plus Lenis, snap-ul pe viteză, `allowNestedScroll`, rutarea ancorelor și handler-ul
de tastatură. **Fișierul se redenumește în `ControlerCarduri.astro`** (numele „RailFir" devine
o minciună) și pierde doar `<nav>`-ul, `<style>`-ul lui și maparea `SEGMENTE`.

**Riscul, declarat:** dacă labirintul degradează complet (reduced-motion, D5), wayfinding-ul
vizual dispare. Mitigare: sub reduced-motion labirintul se randează **static și complet**, cu
toate cele 16 checkpointuri desenate — harta rămâne, doar traversarea nu. Și, oricum, railul
degrada la fel: `actualizeazaRail` trăiește în scriptul care face bail-out înainte de orice
listener sub reduced-motion, deci railul n-avea nici azi segment activ în acel mod.

---

## 6. Geometrie și mecanică — valori, nu adjective

### 6.1 Labirintul

| Parametru | Valoare | Motiv |
|---|---|---|
| Compoziție | **autorat prin generare deterministă la build** (frontmatter Astro), ca `CampulSprite.astro` azi | ieșire HTML statică, identică la fiecare build → `npm run test:visual` poate compara screenshoturi. `Math.sin`, niciodată `Math.random` — precedentul e deja stabilit în cod. |
| `viewBox` | **`0 0 120 160`**, `preserveAspectRatio="none"` | 12 coloane × 16 rânduri, celulă 10×10 unități. `none` (nu `slice`) pentru că **pozițiile checkpointurilor trebuie să fie cunoscute și necropate la orice viewport** — un `slice` care taie 25% din lățime ar muta jumătate din checkpointuri în afara ecranului. |
| Distorsiunea de aspect | acceptată, cu `vector-effect="non-scaling-stroke"` | `none` întinde celulele, dar `non-scaling-stroke` ține grosimea liniei constantă în px. Celula: 30×50px la 360×800 · 64×64px la 768×1024 · 120×56px la 1440×900. |
| Plafon de lățime | la ≥90rem, labirintul se limitează la **90rem**, centrat, cu fade de 4rem pe flancuri | fără plafon, la 1920px celula ajunge 2.4:1 și coridoarele citesc ca dungi orizontale |
| Rânduri | **16 — unul per card.** Checkpointul `k` stă în rândul `k`. | labirintul **e** harta paginii, nu un ornament peste ea. Poziția verticală a subiectului în viewport e literalmente bara de progres. |
| Grosimi (px reali, `non-scaling-stroke`) | pereți de coridor **1.25px** · ramuri-fundătură **1px** · grila slabă **0.5px** | v3 a eșuat la ~5px efectivi („crăpături"); v4 a corectat la 0.86px. Un labirint are nevoie de puțin mai multă greutate decât un câmp de fire ca să citească drept *pereți* — 1.25px e crisp la DPR 1 și 2. |
| Unghiuri | **100% axiale (0° / 90°). Zero diagonale.** | diagonalele arbitrare sunt cauza #1 diagnosticată a artefactului „zgârieturi" din v3. Un labirint ortogonal nu poate produce acel artefact. |
| Densitate | banda `zgomot` (rândurile 2–7): **2–4 ramuri-fundătură per rând**, 1–3 celule lungime. Banda `clar` (8–16): **0–1 ramură per rând**. Rândul 1 (hero): deschis, zero ramuri. | preia exact gramatica railului (§02–§07 = zigzag, §08–§16 = drept), acum structurală, nu doar cromatică |
| Structură DOM | **un `<g opacity="0.25">`** (0.20 pe închis) conținând 3 `<path>`: coridor, ramuri, grilă | vezi §8.2 — mecanism, nu convenție |
| Buget de octeți | **≤ 24KB brut / ≤ 6KB gzip**, înlocuind cei ~15KB ai `CampulSprite` | ~80 segmente coridor + ~40 ramuri + grilă, coordonate rotunjite la 1 zecimală |

**Coridorul se construiește din traseu spre pereți, nu invers.** Se autorează întâi drumul
continuu de la rândul 1 la rândul 16, apoi se desenează pereții ca frontieră a lui plus
ramurile-momeală. Consecință: traseul subiectului e garantat un coridor legal — imposibil să
treacă printr-un perete, imposibil să fie nevoie de pathfinding.

**Coloana checkpointurilor (tabel de plecare, ajustabil în constrângerile de mai sus):**

```
  rând k :  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
  coloana:  6  9  3 10  6  2  8  6  9  4  8  3  9  5  8  6
  CTA    :  ●              ●        ●                       ●     (§01, §05, §08, §16)
```

Cele patru rânduri-CTA revin în coloana 6 (centrul) — checkpointul stă sub centrul plăcii,
deci cardul crește simetric exact în cele patru momente care contează pentru conversie.
Lungime totală de traseu ≈ **840 de unități**.

### 6.2 Subiectul

| Parametru | Valoare |
|---|---|
| Formă | **pătrat plin**, nerotit, aliniat la grilă — plus un inel de 1px la 40% în jur |
| De ce pătrat | labirintul e ortogonal, construit pe o grilă pătrată. Un cerc ar fi un obiect străin. Pătratul citește ca *„celula ocupată acum"* — exact ce e o poziție într-un labirint. |
| Un glif, două stări | **același pătrat e și checkpointul**: contur gol = nevizitat, plin = vizitat, plin + inel = subiectul. Un singur vocabular. |
| Mărime | element DOM (nu copil SVG), `width: clamp(10px, 2.4vmin, 16px)` | 
| De ce element DOM | (a) mărimea lui nu moștenește scalarea neuniformă a `viewBox`-ului; (b) mișcarea lui **nu murdărește rasterul labirintului** — strat separat, esențial pentru §7 |
| Culoare | `--accent-decor` `#468984` @ **0.32** (deschis) / `--accent-clar` `#7FD1C4` @ **0.50** (închis) |
| De ce nu `--accent` | `--accent` `#376A66` rămâne rezervat celor 4 checkpointuri-CTA, exact ca pe rail. Subiectul nu e un al cincilea punct de acțiune. |
| Coadă | **3 fantome** ale aceluiași pătrat, opacitate 0.40 / 0.22 / 0.10 din a capului |
| Mecanica cozii | fiecare fantomă are propriul lerp: **0.18 / 0.12 / 0.08 / 0.05** (cap → ultima) | 
| De ce lerp diferit, nu offset de traseu | un offset semnat (`p - 0.004 * sign(v)`) ar face coada să sară pe partea cealaltă când `v` trece prin zero — pâlpâie la fiecare oprire. Lerp-urile diferite produc coada **fără nicio logică de direcție**: rămâne mereu în urmă, în orice direcție, și se așază pe cap când te oprești. **Bidirecțional prin construcție, nu prin condiție.** |

### 6.3 Materializarea plăcii la checkpoint

Progresul per card, **definit ca distanță, nu ca direcție** — vezi §7.1 pentru de ce e
esențial:

```
  pc = 1 - clamp( |offsetCard − scrollY| / înălțimeViewport , 0 , 1 )
  e  = pc·pc·(3 − 2·pc)                        // smoothstep: simetric, C¹-continuu
```

| Proprietate | Formulă | Valori la capete |
|---|---|---|
| `scale` (pe `.sticla-chrome`) | `0.955 + 0.045·e`, **clampat la 1 pentru `pc ≥ 0.8`** | 0.955 → 1.0 |
| `opacity` (pe `.sticla-chrome`) | `0.30 + 0.70·e` | 0.30 → 1.0 |
| `transform-origin` | `var(--org-x) var(--org-y)` — poziția checkpointului, autorată per card odată cu labirintul | diferită la fiecare din cele 16 |
| Interval de scroll | **1 viewport pe fiecare parte** | la ~1200px/s de scroll ≈ **660ms de durată percepută** |
| `backdrop-filter` | pornit **doar** la `.camp-activ` ȘI `[data-fundal="inchis"]` | vezi §7 |

**De ce `scale` se oprește la 1 înainte ca blurul să pornească:** la `pc = 0.8`, scale-ul e
deja la 0.9985. Clampând la 1 de acolo, scalarea și `backdrop-filter`-ul sunt **strict
disjuncte în timp** — blurul nu recalculează niciodată o geometrie care se schimbă. Ăsta e
motivul pentru care numărul e 0.8 și nu 0.9.

**De ce `transform-origin` e cel mai important detaliu al secțiunii:** placa crește *din
checkpoint*. Checkpointul e în altă coloană la fiecare rând, deci direcția de creștere e alta
la fiecare din cele 16 carduri, **fără nicio aleatorizare** — variația vine din geometrie.
Vezi §9 pentru de ce contează asta față de `craft-floor.md`.

### 6.4 Licărirea — reinterpretată, explicit

**Ce a cerut userul:** „efect de licitare statică" în momentul materializării. Îl citesc ca
**licărire de electricitate statică** — o pâlpâire scurtă la materializare.

**Îl reinterpretez. Ce am ales, și de ce:**

O pâlpâire de luminozitate pe toată placa e greșită din trei motive independente:
1. **WCAG 2.3.1** — o schimbare mare de luminanță relativă, repetată, pe >25% din aria de
   10° a viewportului, e un risc de fotosensibilitate. O placă de ecran plin e **exact** acel
   caz.
2. **Nu se poate scruba.** O pâlpâire e un *eveniment*, nu o *stare*. Legată de progresul de
   scroll, se redă invers când derulezi înapoi și **stroboscopează** dacă utilizatorul mișcă
   degetul înainte-înapoi. Intră frontal în constrângerea 2.
3. Un flash alb pe card e cel mai rapid mod de a face pagina să arate ieftin.

**Ce livrez în loc — „descărcare pe muchie", 190ms, două bătăi:**

| Bătaie | Durată | Ce se schimbă | Suprafață afectată |
|---|---|---|---|
| 1 | 90ms | linia speculară `.sticla::before` (**deja există în v4**) trece de la gradientul de repaus la o linie de 2px pe toată lățimea, apoi cade | ~0.4% din placă |
| — | 40ms pauză | nimic | — |
| 2 | 60ms | bordura de 1px trece la opacitate 1.0, apoi cade | ~1.2% din placă |

Total **<2% din suprafața plăcii** — sub pragul de 25% din WCAG 2.3.1, deci regulile de flash
nu sunt structural angajate. Citește ca un tub fluorescent care se aprinde: două ezitări, apoi
lumină stabilă. Și **refolosește elementul specular pe care v4 îl are deja**, în loc să adauge
un mecanism nou.

**Cum e latch-uită — singura animație nescrubată din tot sistemul:**

```
  declanșare : pc trece 0.72 în URCARE       (indiferent din ce direcție vine cardul)
  re-armare  : pc scade sub 0.45             (bandă de histerezis = 0.27 ≈ 216px la 800px viewport)
  cooldown   : 400ms global, peste toate cele 16 carduri
  plafon dur : 2 bătăi per sosire, ≤3 bătăi/secundă global
  reduced-motion : nu se declanșează deloc
```

Histerezisul de 216px e ce face imposibil stroboscopajul: ca s-o re-declanșezi, trebuie să
derulezi 216px înapoi și 216px înainte. Nu se poate obține din tremurat.

**Și e cea mai importantă distincție conceptuală a documentului:** licărirea marchează
*evenimentul* sosirii; tot restul (scale, opacity, subiect) exprimă *starea* sosirii. De aceea
unul e latch-uit și celelalte sunt scrubate. Dacă se scrubează și licărirea, tot sistemul
devine urât și periculos în același timp.

---

## 7. Cum se garantează cele două constrângeri dure

### 7.1 Bidirecțional și întreruptibil (constrângerea 2)

**Arhitectura, într-o propoziție: fiecare valoare animată e o funcție pură a poziției de
scroll. Nu există nicio animație „care rulează", deci nu există nimic de întors și nimic de
întrerupt.**

Trei consecințe concrete:

1. **`pc` e o distanță, nu o direcție.** `1 - clamp(|offsetCard − scrollY| / vh, 0, 1)` e
   simetric prin construcție: aceeași formulă produce aceeași valoare venind de sus sau de
   jos. **O distanță n-are direcție, deci n-are ce să inverseze.** Asta e fundația; restul e
   consecință.
2. **Easing simetric și C¹-continuu.** `smoothstep` (`p²(3−2p)`) are derivata zero la ambele
   capete și e continuu în derivată peste tot. Dacă utilizatorul inversează gestul la mijlocul
   tranziției, nu există niciun kink vizibil — viteza aparentă trece prin zero, nu sare. Un
   `cubic-bezier` asimetric (ex. `ease-out`) ar produce o smucitură vizibilă exact la
   inversare. **De aceea nu se folosește curba din `tokens.css` aici.**
3. **Zero `play()`, zero `reverse()`, zero `IntersectionObserver` care declanșează o
   tranziție.** `IntersectionObserver` rămâne folosit doar unde e deja (`.js-reveal`), care e
   un one-shot fără cale de întoarcere — și care e explicit *în afara* sistemului ăsta.

**Capcanele, numite explicit, ca să nu fie descoperite la QA:**

| Capcană | Ce se întâmplă dacă o ratezi | Antidot |
|---|---|---|
| **Coada care sare direcția** | fantomele calculate cu `sign(velocity)` pâlpâie pe partea cealaltă la fiecare oprire | lerp-uri diferite, zero logică de direcție (§6.2) |
| **Licărirea scrubată** | strobo la tremurat + risc WCAG 2.3.1 | latch + histerezis 0.27 + cooldown (§6.4) |
| **Tranziții CSS peste valori scrubate** | `transition: transform 220ms` pe același element care primește `transform` în fiecare cadru = dublă interpolare, întârziere vizibilă și „elastic" la inversare | **`.sticla-chrome` nu are `transition` pe `transform`/`opacity`. Niciodată.** Tilt-ul își păstrează tranziția, dar e pe alt element (wrapper-ul). |
| **rAF permanent** | baterie consumată pe o pagină statică | bucla rAF **se auto-oprește** când toate lerp-urile sunt sub 0.1px de țintă, și repornește la `lenis.on('scroll')` |
| **`will-change` pe toate cele 16** | 16 straturi promovate permanent în memoria video — exact costul pe care v4 îl interzice pentru `backdrop-filter`, plătit pe altă proprietate | `will-change: transform` doar pe grupul-subiect și pe cele ≤3 cromuri active, adăugat/scos de același controller |
| **Citire de layout în cadru** | `offsetTop`/`getBoundingClientRect()` în bucla de scroll = reflow forțat, 60fps devine 20fps | offsets cache-uite, recalculate **doar** la `resize`/`load` — mecanismul există deja în `RailFir.astro` (`recalculeazaOffsets`) și se refolosește ca atare |
| **Lenis vs. `pc`** | `lenis.scrollTo` cu `lock: true` blochează scroll-ul, dar `pc` continuă să se actualizeze din poziția reală — corect, nu e o capcană. Capcana ar fi să calculezi `pc` din `lenis.targetScroll` în loc de `window.scrollY`. | `pc` se calculează **întotdeauna** din poziția reală de scroll |

### 7.2 Conținutul nu depinde de animație (constrângerea 1)

Patru mecanisme, în ordinea puterii. Al treilea e cel care contează.

**M1 — separarea structurală: se animă suprafața, niciodată conținutul.**

`.sticla` se sparge în două elemente frați:

```
  <div class="placa" data-tilt="card">              ← wrapper; primește doar tilt-ul (pointer)
    <div class="sticla-chrome" aria-hidden="true">  ← tentă, bordură, specular, umbră. SE ANIMĂ.
    <div class="continut proza">   …textul…         ← ZERO proprietăți animate. Niciodată.
  </div>
```

Nu „textul nu dispare" — **textul nu e țintă de animație deloc.** Nu e scalat (deci nici nu se
re-rasterizează la scări fracționare, ceea ce e și un câștig de calitate), nu e mascat, nu e
clipat, nu i se atinge opacitatea.

**M2 — valoarea implicită CSS a fiecărei variabile de progres e starea SOSITĂ.**

```css
  .sticla-chrome { opacity: var(--pc-o, 1); transform: scale(var(--pc-s, 1)); }
```

Fără JS, cu JS căzut, cu JS întârziat, cu JS blocat de browserul in-app din WhatsApp: fiecare
placă e la `scale(1) opacity(1)`. **Starea „neajunsă" nu există în CSS — poate fi doar
scrisă de JS.** Ăsta e exact inversul pattern-ului periculos, și e aceeași lecție pe care
`tokens.css` o are deja scrisă pentru `.js-reveal` („fără JS, TOTUL e vizibil"), dusă un pas
mai departe: aici nici măcar clasa de pe `<html>` nu e necesară.

**M3 — invarianți mecanici, verificați automat.** Ăsta e mecanismul, restul sunt precauții.

Un test nou, `tests/labirint-continut.spec.ts`, care rulează în `npm run test:visual` și
afirmă, pentru **fiecare din cele 16 carduri**, la **cinci** poziții de scroll (`pc` ≈ 0,
0.25, 0.5, 0.75, 1) și în **ambele** direcții de parcurgere:

```
  1. getComputedStyle(text).opacity === '1'            pentru h1,h2,h3,p,li,dt,dd,label,legend,td,th
  2. getComputedStyle(text).transform === 'none'       pe .continut și pe toți descendenții direcți
  3. getComputedStyle(text).visibility === 'visible'
  4. .continut nu are clipPath, mask, maxHeight, nici overflow:hidden
  5. textContent al fiecărui card e ≥ 95% din textul din copy.ts pentru acel card
  6. cu JS complet dezactivat (context.setJavaScriptEnabled(false)):
     toate cele 16 .sticla-chrome au opacity 1 și transform none
```

Plus un **lint de selector**: niciun selector din `labirint.css` care setează `opacity`,
`transform`, `clip-path`, `mask`, `filter`, `visibility` sau `display` nu are voie să se
potrivească pe un element din afara mulțimii `[aria-hidden="true"], [data-decor]`. Se poate
verifica static cu o traversare a foii de stil — 30 de linii, rulate în `npm run verify`.

**M4 — argumentul de conversie, transformat în prag numeric.** 40%+ din trafic vine din
WhatsApp pe Android mediu. Pragul: **la 360×800, cu CPU throttled 4×, textul primului card
trebuie să fie lizibil în screenshot la ≤1.5s după `domContentLoaded`, cu JS-ul de animație
încă neexecutat.** Verificabil în același harness. Dacă pică, animația e pe calea critică și
trebuie mutată.

---

## 8. Contrastul — ce rămâne valabil și ce trebuie recalculat (constrângerea 7)

### 8.1 Rezultatul principal: **tabelul de alfe din v4 rămâne valid verbatim**

V4 a calculat compozitele **presupunând că blurul nu contribuie cu nimic** — și a scris-o
explicit: *„Calculul e conservator prin construcție: presupune stroke opac pe 100% din pixelul
de sub text, ignorând că `backdrop-filter: blur(20px)` mediază backdrop-ul."*

Consecința, care e mai importantă decât pare: **dacă scoți `backdrop-filter`, niciun număr din
tabelul v4 nu se schimbă.** Alfele 0.82 / 0.88 / 0.70 rămân, `U` rămâne `#D1E2E0` / `#BDD0CE`
/ `#344F4E`, tot tabelul de verificare rămâne. Blurul nu era în ecuație.

Și mai departe: **un labirint mai dens nu schimbă cazul cel mai rău.** Cazul cel mai rău e
„un stroke acoperă 100% din pixelul de sub text" — o afirmație despre un singur pixel, care
nu depinde de câte linii sunt pe ecran. Densitatea schimbă *media*, nu *maximul*. Deci nici
densitatea nu cere recalculare.

**Verificare de reper, ca să se vadă de ce blurul nu mai are ce face pe registrele deschise:**
o linie de labirint sub tenta primară de 0.82 dă compozitul `#F7FAF9` — față de fundalul
`#FFFFFF`. Delta de luminanță ≈ **3%**. Blurul cheltuia 4–10ms/cadru ca să înmoaie ceva deja
invizibil. Pe registrul închis, aceeași linie sub tenta 0.70 dă `#2F4746` față de `#1B2426`:
raport **1.59:1** — vizibil, și acolo blurul chiar are ce înmuia. **De aceea blurul rămâne
exact pe registrul închis și pe nicăieri altundeva.** Asimetria nu e un compromis, e unde
duce calculul.

Efect secundar plăcut: labirintul se vede cel mai puternic exact pe **§02 (vacarmul) și §08
(livrabilul)** — cele două secțiuni pe care `CLAUDE.md` §2 le declară cele mai importante.
Secțiunea care spune „n-ai o hartă" e și cea în care labirintul e cel mai prezent.

### 8.2 Ce TREBUIE schimbat: plafonul de opacitate trece de la `stroke-opacity` la `<g opacity>`

**Ăsta e singurul defect real pe care labirintul îl introduce, și e obligatoriu.**

Câmpul v4 e format din **linii verticale paralele — care nu se intersectează niciodată**. Deci
`stroke-opacity: 0.25` moștenit pe toate e un plafon corect: nicio suprapunere, nicio stivuire
de alfa.

Un labirint **se intersectează prin definiție**: colțuri, joncțiuni în T, ramuri. Două stroke-uri
separate la 0.25 care se suprapun compun la `1 − (1 − 0.25)² = 0.4375` — **cu 75% peste plafon**,
exact în punctele cele mai numeroase ale desenului. Toate calculele de contrast ar deveni false
tăcut, iar `npm run contrast` ar raporta verde peste el, pentru că scriptul citește constanta,
nu pixelii.

**Mecanismul corect: `<g opacity="0.25">` cu cele 3 path-uri înăuntru.** `opacity` de grup
randează copiii într-un buffer offscreen, aplatizează, apoi aplică valoarea o singură dată —
deci **alfa rezultată la orice pixel nu poate depăși valoarea grupului, oricâte suprapuneri
ar fi.** Plafonul devine structural, nu o convenție care se poate rupe la următoarea ramură
adăugată.

(Alternativa — un singur `<path>` continuu pentru tot labirintul — funcționează la fel de bine
matematic, pentru că un stroke al unui singur path e o regiune umplută o dată; dar face
imposibile cele trei grosimi de linie. Grupul e alegerea corectă.)

### 8.3 Perechi NOI de adăugat în `scripts/check-contrast.mjs`

Subiectul e singurul element care e **mai opac decât plafonul câmpului**, deci e singura
sursă de perechi noi. Calculat, nu estimat — alfa efectivă a subiectului în compozitul final e
`α_tentă_complement × α_subiect`:

| Registru | Subiect | Compozit | Textul cel mai slab | Ratio | Verdict |
|---|---|---|---|---|---|
| primar `#FFFFFF`, tentă 0.82 | `#468984` @ **0.32** | `#F4F8F8` | `--text-muted` `#637474` | **4.60** | ✓ (marjă 0.10) |
| primar, tentă 0.82 | `#468984` @ 0.39 | — | `--text-muted` | **3.99** | ✗ — **ăsta e pragul** |
| secundar `#E4E7E7`, tentă 0.88 | `#468984` @ 0.32 | `#DEE3E3` | `--eroare` `#9E4B4B` | **4.56** | ✓ |
| secundar, tentă 0.88 | `#468984` @ 0.32 | `#DEE3E3` | `--text-muted-pe-secundar` `#576565` | **4.70** | ✓ |
| închis `#1B2426`, tentă 0.70 | `#7FD1C4` @ **0.50** | `#2A3D3E` | `--text-pe-inchis-muted` `#B9C4C4` | **6.33** | ✓ |

**De asta subiectul e la 0.32 și nu la 0.5 sau la 1.** Nu e o alegere de gust — e ultimul
număr rotund sub pragul la care cel mai slab text al paginii pică AA. Marja de 0.10 e subțire
și tocmai de asta trebuie pusă sub gate, nu ținută minte.

**Modificări concrete în `scripts/check-contrast.mjs`:**

1. `ALPHA_LINIE_CAMP` → **`ALPHA_LABIRINT`**, cu comentariul reciproc mutat de pe
   `--camp-opacitate` pe `opacity`-ul grupului din `Labirint.astro`.
2. Constantă nouă **`ALPHA_SUBIECT = { deschis: 0.32, inchis: 0.50 }`**, oglindită în
   `--subiect-opacitate`.
3. Funcție nouă `compozitPesteSubiect(registru, text)` — aceeași structură ca
   `compozitSubSticla`, dar cu `ALPHA_SUBIECT` în loc de `ALPHA_LABIRINT` și culoarea
   subiectului în loc de cea a liniei.
4. Cele **5 perechi** din tabelul de mai sus, ca intrări reale în `PERECHI`.
5. **Verificare de coerență în script**, nu în cap: o aserțiune că
   `ALPHA_SUBIECT.deschis ≤ 0.38`, cu mesajul „peste asta, `--text-muted` pică AA sub tenta
   primară". Scriptul trebuie să explice *de ce* pică, nu doar *că* pică.

**Discrepanță minoră găsită în v4, semnalată, nu corectată de mine:** tabelul v4 dă `U` pe
registrul închis ca `#344F4E`, care corespunde unei alfe de **0.25**, deși textul alături
declară **0.20**. E conservator în direcția bună (0.25 > 0.20, deci numărul publicat e mai
strict decât regula), deci nu e un defect de siguranță — dar cele două trebuie aliniate, altfel
următorul care le citește va crede că una din ele e greșită. De verificat la implementare.

---

## 9. Nivel de motion

**8/10** (de la 7 în v4). Creșterea e reală și o raportez ca atare: apare un element care se
mișcă **continuu** cât timp derulezi (subiectul + coada), pe lângă scroll-ul interpolat și
blurul din v4. Nu o ascund sub numărul vechi.

Ce **nu** urcă odată cu ea: numărul de elemente animate per cadru **scade** față de v4 —
labirintul e un singur strat static, unde v4 avea 16 instanțe de `<Campul>` cu
`@keyframes campul-deriva` (3 rulând simultan). Motion mai *prezent*, cost mai *mic*.

### Trecerea prin `craft-floor.md` — inclusiv anti-pattern-ul pe care brief-ul ăsta chiar îl atinge

| Regulă | Stare |
|---|---|
| „Depth: shadows carry an offset and a soft blur" | ✓ umbra plăcii din v4 e păstrată neschimbată |
| „Hard offset shadows outside a neobrutalist world" | ✓ absente |
| „Glass and blur as decoration rather than as a specific effect" | ✓ **întărit** față de v4: blurul rămâne exclusiv unde e măsurabil vizibil (registrul închis), scos unde nu contribuia. Un blur care rămâne doar acolo unde produce un efect măsurabil e definiția lui „specific effect". |
| „A kicker or eyebrow above a heading — this one is a ban" | ⚠ `--t-eyebrow` există în `tokens.css` și e folosit azi. **În afara scopului acestui brief** (e o decizie de copy/structură, nu de fundal), dar merită semnalat pentru o trecere viitoare. |
| Fără gradient text, fără `border-left` colorat >1px, fără glifuri unicode ca iconițe, fără carduri imbricate | ✓ neatinse |
| **„Motion: one authored moment, not scattered effects and not one identical entrance on every section."** | ⚠ **brief-ul ăsta îl atinge frontal. Vezi mai jos.** |

**Anti-pattern-ul, tratat, nu ocolit.** 16 carduri care se materializează identic **este**
„one identical entrance on every section" — exact ce interzice regula. Două lucruri fac
diferența, și amândouă trebuie să fie adevărate, nu doar afirmate:

1. **Momentul autorat e traversarea, nu materializarea.** Coridorul e un singur gest continuu
   de la §01 la §16 — un traseu, nu 16 intrări. Materializarea e *consecința* ajungerii, la fel
   cum o ușă care se deschide nu e un efect separat de mersul spre ea.
2. **Cele 16 intrări nu sunt identice, și nu din aleatorizare.** `transform-origin` e poziția
   reală a checkpointului `k`, care e în altă coloană la fiecare rând. Cardul 3 crește din
   stânga-jos, cardul 4 din dreapta, cardul 5 din centru. **Direcția e determinată de
   geometrie, deci variația e semantică, nu decorativă.** Un `Math.random()` pe origine ar fi
   fost exact anti-pattern-ul; o coordonată citită din hartă nu e.

Dacă la QA cele 16 sosiri arată totuși la fel, atunci punctul 2 a eșuat în implementare, iar
răspunsul e **de mărit dispersia coloanelor din tabelul §6.1**, nu de adăugat un al doilea
efect.

---

## 10. Buget de performanță și scara de degradare (constrângerea 4)

### 10.1 Bugetul, numeric

**Per cadru, în timpul scroll-ului:**

| Ce | Elemente | Proprietăți |
|---|---|---|
| Subiect: cap + 3 fantome | 4 | `transform` (doar `translate3d`) |
| Crom de placă: activ + 2 vecini | 3 | `transform` (`scale`) + `opacity` |
| Stratul de labirint: parallax | 1 | `transform` (≤6vh de cursă pe tot documentul) |
| **TOTAL** | **8** | **exclusiv `transform` și `opacity`** |

**Niciodată per cadru:** `backdrop-filter`, `filter`, `box-shadow`, `border`, `background`,
`width`/`height`/`top`/`left`, `stroke-dashoffset`, `stroke-width`, `d`.

> **De ce nu există „traseu parcurs luminat".** Prima idee evidentă e `stroke-dashoffset`
> scrubat pe coridor, ca să se vadă cât ai parcurs. E **interzisă**: `stroke-dashoffset`
> forțează **repaint** al stratului de labirint la fiecare cadru — iar acel strat e sursa
> pentru `backdrop-filter`-ul plăcilor, deci ar declanșa și re-blurarea. Raster + upload +
> blur, de 60 de ori pe secundă. Progresul se citește din **poziția verticală a subiectului**
> (care e literalmente bara de progres) și din cele 16 checkpointuri care comută
> vizitat/nevizitat — **≤16 comutări de clasă pe toată pagina**, nu 60 pe secundă.

**Straturi compozitate:** ≤5 (labirint, grup-subiect, ≤3 cromuri). `will-change: transform`
doar pe grupul-subiect și pe cromurile active, adăugat/scos de același controller.

**Invalidare de stil:** `--pc-s` / `--pc-o` se scriu **pe elementul-crom, care e o frunză fără
copii** — nu pe `<section>`. Scrierea unei proprietăți custom pe secțiune ar invalida tot
subarborele ei (~50 de elemente de text × 16 carduri). Pe o frunză, scope-ul de invalidare e
un element. **Ăsta e al doilea motiv structural pentru care cromul e element separat**, pe
lângă garanția din §7.2.

**Poziția pe traseu:** tabel de căutare (LUT) cu **240 de eșantioane echidistante în lungime
de arc**, generat **la build**, în același frontmatter care generează labirintul. Coridorul e
o polilinie cu vârfuri cunoscute, deci reeșantionarea e aritmetică pură — **fără
`getPointAtLength` la runtime, fără DOM SVG interogat, fără citire de layout.** Per cadru:
o căutare în array + un `lerp` + un `translate3d`. Cost neglijabil și determinist.

**Ținte de acceptare:** ≥50fps la 360×800 cu CPU throttled 4×, pe un scroll continuu de 3
secunde · zero reflow forțat în calea de scroll (verificat prin aserțiunea că nici
`offsetTop`, nici `getBoundingClientRect` nu se apelează în callback) · zero long task >50ms ·
buget de octeți: labirint ≤6KB gzip, controller ≤2KB gzip peste ce există.

### 10.2 Scara de degradare — decisă acum, în ordine

| Nivel | Ce se taie | Ce câștigi | Cost vizual |
|---|---|---|---|
| **D0** | *(default livrat)* blur doar pe cardul activ din registrul închis (≤1 placă, 2 din 16) · parallax 6vh · cap + 3 fantome · licărire ON | — | — |
| **D1** | 3 fantome → **1 fantomă** | 2 transformări + jumătate din aria murdărită a stratului-subiect | coada devine scurtă; mișcarea rămâne |
| **D2** | parallax → **0** (labirintul complet static) | rasterul labirintului se cache-uiește permanent | pierzi adâncimea; labirintul rămâne desenat |
| **D3** | scrub de crom **doar pe cardul activ** (vecinii sar direct la starea sosită la granița `.camp-activ`) | 2 elemente × 2 proprietăți | tranziția se simte mai bruscă la vecini |
| **D4** | `backdrop-filter` **complet off**, inclusiv registrul închis | dispare ultimul readback GPU de pe pagină | §02/§08 pierd sticla mată; rămân translucide |
| **D5** *(podea)* | subiect înghețat · labirint static · plăcile ajung cu o tranziție de 200ms doar pe `opacity`, declanșată de `.camp-activ` | pagina devine practic statică | **identică cu fallback-ul de reduced-motion, plus un fade** |

**Regula de decizie, ca să nu se improvizeze:** dacă la QA, la 360×800 cu throttling 4×, se
ajunge la **D4 sau mai jos**, atunci mobilul nu susține direcția. Mișcarea corectă atunci nu e
D5 pentru toți — e **fallback-ul de reduced-motion pentru tot ce e sub 48rem, și varianta
completă doar peste**. Un labirint la D5 e un fundal static cu overhead de JS: cel mai prost
punct de pe curbă, plătești costul fără să primești efectul.

### 10.3 Verdictul onest

**Labirintul singur e ieftin** — un strat static rasterizat o dată + o transformare. E mai
ieftin decât Câmpul v4, care avea 16 instanțe cu keyframes CSS.

**Ce nu încape e `backdrop-filter` pe 3 plăci de ecran plin, și asta era deja adevărat în
v4** — labirintul doar face costul imposibil de mai amânat, pentru că adaugă un element care
se mișcă permanent în backdrop, ceea ce împiedică definitiv cache-uirea blurului.

**Ce tai:** blurul pe cele 14 carduri deschise. **Ce câștigi:** ~90% din costul de blur al
paginii. **Ce pierzi:** sticla mată devine sticlă translucidă pe registrele deschise — și, per
calculul din §8.1, pierzi înmuierea a ceva care e la 3% delta de luminanță, adică aproape
nimic vizibil. **Ce nu se schimbă:** niciun număr de contrast.

**Dacă userul refuză trade-ul:** labirintul pică. Nu încap amândouă, și n-am de gând să scriu
un plan care sună bine și moare pe telefon — asta s-a plătit deja de trei ori în iterațiile
1–3.

---

## 11. `prefers-reduced-motion: reduce` — fallback static complet (constrângerea 5)

| Componentă | Comportament |
|---|---|
| Lenis | **nu se instanțiază** (bail înainte de `new Lenis()`) — contractul v4, neschimbat |
| Controller de scrub | **nu se instanțiază**; niciun listener atașat; `--pc-*` nu se scriu niciodată → CSS cade pe valorile implicite = **starea sosită** |
| Labirintul | **se randează, static, complet desenat.** Toate cele 16 checkpointuri în starea neutră (contur). Zero parallax, zero animație. E harta, și rămâne. |
| Subiectul + coada | **nu se randează deloc.** Un „subiect" nemișcat e un marcaj fără referent — și nu poartă nicio informație pe care harta să n-o poarte deja. |
| Cromul plăcii | `scale(1)`, `opacity: 1`, tentă **opacă** (α = 1), fără `backdrop-filter` — exact regula v4 |
| Licărirea | nu se declanșează niciodată |
| Tilt 3D | dezactivat (regula v4) |
| `.js-reveal` | neschimbat — `opacity: 1; transform: none` (regula existentă din `tokens.css`) |
| Snap pe viteză, tastatură | dezactivate / native (regula v4) |

**Fără JS:** identic cu cele de mai sus, minus faptul că nici măcar bail-out-ul nu rulează.
Rezultatul e același, prin M2 din §7.2: valorile implicite CSS **sunt** starea finală.

---

## 12. Ce se păstrează, ce se înlocuiește, ce se șterge (constrângerea 6)

### Se păstrează neatins

- **Placa de sticlă** ca mecanism de contrast: `--bg-registru`, tentele 0.82/0.88/0.70,
  cascada „opac implicit → translucid pe `.camp-activ`", `@supports` fallback, degradarea
  gratuită a lui `color-mix`.
- **Lenis + controller-ul complet**: `lerp: 0.1`, `syncTouch: false`, `allowNestedScroll: true`,
  `anchors: false`, snap pe `lenis.velocity` (prag 45), fereastra de gest de 400ms, coada de
  flick, `DURATA_SALT`, deadline-ul în locul flag-ului, rutarea ancorelor `#inscriere` prin
  `lenis.scrollTo` + focus programatic, handler-ul separat de tastatură cu excepția
  `SELECTOR_INTERACTIV`.
- **`.camp-activ`** ca plafon unic de cost (max 3 din 16) și sursă unică de adevăr.
- **Layout-ul de card**: `100dvh`, `justify-content: safe center`, `overflow-y: auto`
  permanent, pragul de 560px, `IndicatorScrollIntern`, excepția §16, `--marja-sticla`,
  `--pad-sticla`, compensarea `--max-proza`, `env(safe-area-inset-*)`, rezerva pentru
  `CtaSticky`.
- **Tilt-ul recalibrat**: 1.2°, `perspective(2000px)`, `translateZ: 0`, 220ms
  `cubic-bezier(0.22,0.61,0.36,1)`, doar `(hover:hover) and (pointer:fine)` + pulsul de
  `touchstart`. Se mută de pe `.continut.sticla` pe wrapper-ul `.placa`.
- **Toate cele 17 secțiuni, tot copy-ul, toți invarianții** din `CLAUDE.md` §1.
- **`--text-muted-pe-secundar: #576565`** și redefinirea lui în `.sectiune.secundar` — fix
  independent, rămâne.
- **`.js-reveal`**, `CtaSticky`, `IndicatorScrollIntern`, scriptul `is:inline` de disclosure
  de overflow.
- **Gate-ul `CONTRAST`** ca poartă automată în `npm run verify`.

### Se înlocuiește

| Din | În | Notă |
|---|---|---|
| `Campul.astro` + `CampulSprite.astro` (16 straturi absolute per card) | **`Labirint.astro`** (un strat `fixed`, o rasterizare) + **`labirint-geometrie.ts`** (generator la build) + **`Subiect.astro`** | `Sectiune.astro` nu mai randează `<Campul>`; `index.astro` randează `<Labirint />` o dată |
| `.continut.sticla` cu tot pe un element | `.placa` > `.sticla-chrome` + `.continut` | garanția din §7.2 M1 + scope-ul de invalidare din §10.1 |
| `backdrop-filter` pe `.camp-activ` (orice registru) | `backdrop-filter` pe `.camp-activ[data-fundal="inchis"]` **doar** | §8.1 |
| `stroke-opacity` moștenit ca plafon | `<g opacity>` ca plafon | §8.2 — **obligatoriu**, nu opțional |
| `data-tilt="card"` pe `.continut.sticla` | pe `.placa` | wrapper-ul înclină ambele straturi împreună |
| `RailFir.astro` | `ControlerCarduri.astro` (același conținut, minus `<nav>` și `<style>`) | numele devenea o minciună |

### Se șterge

- `<nav class="rail-fir">` + cele ~90 de linii de CSS ale lui + array-ul `SEGMENTE` +
  `AMPLITUDINI_ZGOMOT` + `puncte()` + `railEl`/`segmente` din controller.
- Cele 3 variante `<symbol>` (`neutru` / `zgomot` / `clar`) — gramatica lor migrează în
  densitatea pe rânduri a labirintului.
- `--camp-culoare`, `--camp-durata`, `--camp-opacitate`, `@keyframes campul-deriva`.
- Scrim-urile per-element — **deja șterse în v4**, menționate ca să nu revină.

---

## 13. Tehnica de implementare — alegerea și alternativele respinse

**ALES: scrub scris de mână, condus de controller-ul Lenis existent, peste o polilinie generată
la build + un LUT de lungime de arc. Zero dependințe noi.**

Bucla, integral:

```
  lenis.on('scroll')  →  pornește bucla rAF dacă e oprită
  în rAF:
    pGlobal = clamp(scrollY / (scrollHeight − innerHeight), 0, 1)
    ținta   = LUT[pGlobal]                             // căutare + lerp, aritmetică pură
    pentru fiecare din cele 4 elemente-subiect:
      poz += (ținta − poz) × lerpul_lui                // 0.18 / 0.12 / 0.08 / 0.05
      el.style.transform = translate3d(...)
    pentru cele ≤3 carduri cu pc > 0:
      scrie --pc-s și --pc-o pe cromul-frunză
      verifică latch-ul de licărire (histerezis + cooldown)
    dacă toate lerp-urile sunt sub 0.1px de țintă → oprește bucla
```

| Alternativă | De ce nu |
|---|---|
| **GSAP + ScrollTrigger + MotionPathPlugin** | ~40KB gzip peste o pagină al cărei JS total e azi ~6KB (Lenis + două scripturi inline). `scrub` e într-adevăr primitiva corectă conceptual — dar aici e nevoie de scrub pe **8 elemente și o singură funcție de progres**, adică ~40 de linii. Trei dependințe noi ca să nu scriu 40 de linii, pe o pagină livrată prin 4G în browserul in-app din WhatsApp, e exact opusul disciplinei de dependințe pe care proiectul o aplică deja (`lenis` a fost admis abia după ce a justificat **două** funcții, la a treia rundă de argumentare). Și ar trebui oricum cablat manual la Lenis (`lenis.on('scroll', ScrollTrigger.update)`). |
| **CSS scroll-driven** (`animation-timeline: scroll()`, `offset-path` + `offset-distance`) | Tentant, și **compatibil cu Lenis** (Lenis mută scroll-ul real, deci timeline-ul nativ îl urmărește). Dar: (a) suportul pentru compozitarea lui `offset-distance` nu e garantat, deci câștigul de „off main thread" e incert exact pe dispozitivul-țintă; (b) ar introduce **o a doua sursă de progres** lângă cea din JS, iar proiectul are deja principiul scris explicit în `RailFir.astro` — *„un senzor în loc de două"*; (c) coada cu lerp și latch-ul de licărire cer oricum JS, deci n-ar elimina bucla, ar dubla-o. **Rămâne candidatul evident pentru o iterație viitoare**, dacă bugetul de main thread se dovedește insuficient la măsurare. |
| **`getPointAtLength()` la runtime** | Corect ca API, dar forțează o citire de geometrie SVG per cadru — exact clasa de operație interzisă de §10.1. Inutil, în plus: coridorul e o polilinie ale cărei vârfuri le **generăm noi**, deci reeșantionarea e o sumă de segmente, nu o interogare de DOM. |
| **Web Animations API cu `currentTime` scrubat** | Funcționează și e reversibil, dar `animation.currentTime = x` pe 8 animații per cadru nu e mai ieftin decât 8 scrieri de `transform`, și adaugă un model mental (timeline-uri suspendate) pentru zero câștig. |
| **Canvas 2D pentru labirint** | Ar cere redesenare la fiecare `resize` și ar pierde `non-scaling-stroke` gratuit din SVG. Un SVG static rasterizat o dată de compozitor e strict mai ieftin decât un canvas pe care îl desenăm noi. |

---

## 14. Criterii vizuale — verdict estetic verificabil prin privire (constrângerea 3)

Iterația 3 a trecut QA-ul ca „gata de livrare" fiind urâtă, pentru că s-a măsurat contrast,
performanță și regresie, dar nimeni n-a judecat imaginea. Următoarele sunt formulate ca să
poată fi **bifate uitându-te**, cu prag, nu cu adjectiv.

### 14.1 Câmpul de labirint

| # | Criteriu | Reușit | Eșuat |
|---|---|---|---|
| V1 | **Densitate.** Într-un crop de 200×200px de labirint vizibil (nu acoperit de placă) | **4–9 intersecții de linii** | <4 → citește ca mâzgălituri răzlețe · >9 → citește ca hârtie milimetrică |
| V2 | **Grosime.** Măsurată pe screenshot 1× la 360px | pereți **1–1.5px**, nicio linie peste **2px** | orice linie citită ca „crăpătură" — defectul v3 |
| V3 | **Contrastul câmpului.** Linie vs. propriul fundal de registru | **între 1.2:1 și 1.8:1** | <1.2 → invizibil, toată ideea e irosită · >1.8 → concurează cu textul (**v3 era la 4.06:1**) |
| V4 | **Ortogonalitate** | **100% segmente la 0°/90°** | orice diagonală — cauza directă a artefactului „zgârieturi" |
| V5 | **Fundături deliberate** | fiecare ramură se termină **pe un nod al grilei** | terminație la jumătate de celulă → citește ca eroare de randare |
| V6 | **Fără „săgeți" spre placă** | nicio linie nu se oprește perpendicular pe muchia plăcii | reintroduce artefactul „cutie" din v3, pe pozitiv |

### 14.2 Compoziția

| # | Criteriu | Reușit | Eșuat |
|---|---|---|---|
| V7 | **Testul de mijire.** Screenshot la 25% zoom | se citesc **exact două obiecte**: o placă și un câmp | orice linie care „sare" din câmp la 25% e prea grea |
| V8 | **Banda vizibilă.** La 360×800, în repaus | **≥3 celule complete de labirint** vizibile vertical | sub 3 → **criteriu de KILL**: labirintul e decor pe care nu-l poți citi și mișcarea onestă e să-l tai |
| V9 | **Găsirea subiectului.** Cuiva i se spune „găsește pătratul care se mișcă" | **sub 1 secundă** | peste → prea mic/palid · dacă nu poți să nu-l observi → prea mare/tare |
| V10 | **Ierarhia atenției.** La citirea unui card întreg | mâna se oprește pe text, subiectul se percepe periferic | dacă privirea urmărește subiectul în loc să citească — subiectul e prea prezent |

### 14.3 Narațiunea — testul care verifică ideea, nu pixelii

| # | Criteriu | Reușit | Eșuat |
|---|---|---|---|
| V11 | **Contact sheet.** 16 screenshoturi la 360×800, într-o grilă 4×4, privite deodată | **poți distinge la prima vedere cardurile timpurii de cele târzii** (dens/ramificat → deschis/drept) | 16 imagini cvasi-identice → labirintul nu face muncă narativă, e tapet |
| V12 | **Cele 16 sosiri.** Screenshot la `pc ≈ 0.5` pe fiecare card | direcția de creștere e **vizibil diferită** la cel puțin 12 din 16 | dacă toate cresc din centru → §6.3 a eșuat; se mărește dispersia coloanelor, **nu se adaugă un al doilea efect** |
| V13 | **Inversarea.** Video: scroll înainte până la mijlocul tranziției cardului 7, apoi imediat înapoi | fără smucitură, fără pâlpâire, fără reluare | orice discontinuitate = easing asimetric sau licărire scrubată (§7.1) |
| V14 | **Tremuratul.** Video: 10 mișcări rapide înainte-înapoi peste un checkpoint | licărirea se declanșează **cel mult o dată** | orice strobo = histerezisul e prea îngust sau lipsește |

### 14.4 Regula de verdict

**Un raport de QA pentru direcția asta nu are voie să spună „gata de livrare" fără o secțiune
estetică separată, care dă verdict pe V1–V14 individual, cu screenshotul atașat lângă
fiecare.** „Contrast OK, perf OK, zero regresii" a fost exact propoziția care a trecut
iterația 3 urâtă mai departe.

---

## 15. Structură de conversie

**Neschimbată.** Un singur CTA pe toată pagina — „Rezervă-ți locul", ancoră `#inscriere`,
aceleași patru poziții: hero (§01), după §05, după §08, în §16. Fără CTA secundar.

Rolul CRO al fiecărei secțiuni rămâne cel din `docs/landing-workshop-16-09.md` și nu e
renegociat aici: §01 promisiune → §02 problema numită (vacarm, registru închis) → §03 ce NU
vei ști (dezescaladare, registru secundar) → §04 calificare → §05 înainte/după (**CTA 2**) →
§06–§07 mecanism → §08 livrabilul (**CTA 3**, registru închis) → §09–§12 dovadă și context →
§13 detalii logistice → §14 de ce e gratuit (tratarea obiecției) → §15 FAQ → §16 formular
(**CTA 4**).

**Cum se leagă labirintul de conversie — și cât de puțin:**

- Cele **4 checkpointuri-CTA** (rândurile 1, 5, 8, 16) poartă `--accent` `#376A66` și un
  contur de 1.5px, restul de 12 poartă `--accent-decor` la 1px. Aceeași gramatică pe care
  railul o avea deja pe `circle`-urile-nod. Nimic nou de învățat pentru cititor.
- La cele 4 rânduri, coridorul revine în coloana 6 (centrul), deci placa crește **simetric**
  exact în momentele de decizie. La restul, crește lateral.
- **Labirintul nu adaugă niciun punct de acțiune.** Nu e clicabil (`pointer-events: none`),
  nu e focusabil, nu e anunțat (`aria-hidden="true"`). Un al cincilea loc unde poți da click
  ar dilua exact regula pe care `CLAUDE.md` §2 o protejează.
- **Zero countdown, zero contor de locuri, zero exit-intent, zero rarefiere vizuală.**
  Invariantul din `CLAUDE.md` §1 e neatins: subiectul care avansează prin labirint e progres
  de citire, **nu** progres spre o limită de timp sau de locuri. Nimic din animație nu poate
  fi citit ca presiune.

## Preset shadcn de plecare

**Neaplicabil.** Proiectul n-are Tailwind, n-are shadcn, n-are React — e Astro cu CSS scris de
mână și tokens proprii. Nu se rulează niciun scaffold și nu se instalează niciun registry.

Pentru evidență, dacă cineva reconstruiește vreodată paleta asta într-un context shadcn:
cea mai apropiată de tonul teal-desaturat + neutru rece + un singur accent este **Nova**.
Nu se aplică aici.

## Copy

**Zero text nou. Zero placeholder.** Toate cele 16 carduri își păstrează exact conținutul din
`src/content/copy.ts`, neatins. Labirintul, subiectul, cele 16 checkpointuri și cromul plăcii
sunt toate `aria-hidden="true"` și nu poartă niciun glif.

Singurul text din tot sistemul rămâne microcopy-ul de accesibilitate al indicatorului de
scroll intern, **deja existent** din v2 (`IndicatorScrollIntern.astro`).

Textul care **justifică** direcția, citat din copy-ul real, nu inventat:

> §02 (`copy.ts:87`) — *„Problema ta nu e că nu vrei AI. E că n-ai o hartă."*
> §02 (`copy.ts:90`) — *„Și cât timp n-ai harta, nu iei nicio decizie. Mai citești un articol."*
> §08 (`copy.ts:282`) — *„Al tău: harta ta, prima ta mutare, și prompturile configurate pentru ce faci tu efectiv."*
> §15 (`copy.ts:486`) — *„…harta ta, prima ta mutare și prompturile configurate pentru ce faci tu."*
> OG (`copy.ts:661`) — *„Pleci cu o hartă scrisă, nu cu notițe."*

Niciun invariant din `CLAUDE.md` §1 nu e atins: fără preț sau ancoră de preț, fără cifre de
piață, fără promisiuni de conformitate, fără countdown/„ultimele locuri"/exit-intent/contor
live, fără testimoniale, fără logo-uri de clienți, fără telefon/cifră de afaceri/număr de
angajați în formular.

---

## 16. Ce trebuie confirmat înainte să se scrie o linie de cod

1. **Trade-ul de blur** (§10.3). `backdrop-filter` dispare de pe 14 din 16 carduri. Da sau nu.
   Dacă nu → labirintul pică. Ăsta e singurul punct care blochează.
2. **Regula benzii de 84%** (§Layout). Placa cedează ≥16vh, deci mai multe carduri vor avea
   scroll intern la 360×800. Acceptabil sau nu.
3. **Ștergerea railului** (§5.2). Widget-ul dispare; controller-ul rămâne.
4. **`--text-muted` la 4.60:1** (§8.3). Marjă de 0.10 peste AA, mecanic verificată. Acceptabil
   sau se coboară subiectul la 0.28 pentru marjă mai mare, cu preț de vizibilitate.
5. **Formularea nouă a `CLAUDE.md` §2** — vezi intrarea nouă din `docs/DECIZII.md`, secțiunea
   „Labirintul — răsturnarea regulii «fundal curat»".
