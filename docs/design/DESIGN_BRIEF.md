# Design Brief — Workshop „Prima Mutare spre un Asistent Digital"

Redesign vizual peste o pagină deja live. Nu se ating: copy-ul (`src/content/copy.ts`),
structura de 17 secțiuni, formularul, regulile de stare din backend.

**Istoric de revizii:** v1 (Firul, rail decorativ în gutter) → v2 (carduri `100dvh` +
hijack pe viteză) → v3 (Câmpul, layer de fundal pe toată lățimea) → **v4 (curent):
cardul de sticlă**.

## Notă de revizuire (v4)

Userul a văzut v3 live pe telefon. Respins, dar cu direcție clară. Coordonatorul a
verificat el însuși la 390×844 (screenshot + `getComputedStyle`), deci findings-urile sunt
măsurate, nu presupuse:

1. **Câmpul citește ca zgârieturi/crăpături, nu ca atmosferă** — linii prea groase, prea
   puține, unghiuri arbitrare, contrast prea mare. Traversează H1-ul ca defect de randare.
2. **Scrim-urile solide per-element taie vizibil liniile** — o linie intră din stânga, se
   oprește brut la marginea paragrafului, reapare dincolo. Nu se văd chenare, dar forma
   dreptunghiulară se citește ca gol în linii: același artefact „cutie", pe negativ.
3. **Nu există niciun card vizual** — măsurat: `border-radius: 0px` pe toate cele 16, zero
   elevație, zero separare. „Cardul" e doar `100dvh` conceptual.

**Ce cere userul acum:** fundal animat la scroll (rămâne, redesenat); carduri vizuale reale
cu efect 3D; aspect **„liquid glass" (Apple)**; scroll **super fluid** la gest normal, gest
rapid → sare la segmentul următor.

**Trei decizii luate de coordonator, încorporate mai jos, nerenegociate:**

- **A. Cardul de sticlă înlocuiește scrim-urile per-element.** Rezolvă simultan #2 și #3:
  conținutul stă pe UN card de sticlă; scrim-urile per-paragraf din `tokens.css` se șterg
  complet; liniile Câmpului nu mai sunt tăiate — se văd *prin* sticlă, difuz, exact ce face
  efectul să citească drept sticlă. Un mecanism unificat, nu două sisteme.
- **B. Contrastul rămâne garantat mecanic** — vezi „Garanția de contrast (v4)", cu alpha
  minimă calculată per registru.
- **C. Lenis, de data asta DA** — schimbare de poziție, motivată de dovadă, în „Nivel de
  motion".

**Rămân neschimbate din v1–v3:** paletă, tipografie, layout `100dvh` + praguri de fallback,
guardrails de accesibilitate (tastatură, `prefers-reduced-motion`), structura de conversie.

---

## ⚠ Defect de contrast preexistent, găsit la calculele v4 — independent de acest redesign

Calculând compozitele pentru sticlă, am verificat fiecare pereche text/registru reală și am
găsit un **defect AA care există AZI, în producție**, fără nicio legătură cu redesign-ul:

> **`--text-muted` `#637474` pe `--bg-secundar` `#E4E7E7` = 3.94:1 — sub pragul AA de 4.5.**

`S05InainteDupa.astro` este `fundal="secundar"` (verificat, linia 7) și colorează coloana
ÎNAINTE, etichetele `td::before` și `thead th` cu `--text-muted` (liniile 86, 90, 115).
Comentariul din cod spune „4.91:1" — corect **pe alb**, dar secțiunea nu e pe alb.

`npm run contrast` nu îl prinde: perechea `coloana ÎNAINTE (§05)` e declarată în
`scripts/check-contrast.mjs` doar contra `bgPrimar`. E **exact capcana pentru care `#3A716D`
a fost respins** în `docs/DECIZII.md` („trecea pe alb, pica pe fundalul secundar din §03 și
footer") — același tipar, alt token, prins de data asta doar pentru că sticla a forțat
recalcularea tuturor perechilor.

**Nu poate fi reparat de sticlă** — ceva ce pică la 0% sticlă pică și sub ea. Trebuie
reparat separat. Opțiuni măsurate (sub sticlă = tenta 0.88 recomandată mai jos):

| Valoare | Plat pe `#E4E7E7` | Sub sticlă | Notă |
|---|---|---|---|
| `#637474` (azi) | **3.94** ✗ | **3.82** ✗ | starea curentă |
| `#576565` (nou) | 4.89 ✓ | 4.73 ✓ | păstrează intenția „muted"; hex nou, justificat de un defect măsurat |
| `#2F4F4F` (`--secundar`, existent) | 7.18 ✓ | 6.95 ✓ | zero hex nou, dar vizual mai puțin „stins" decât cere §05 |

**Recomandarea mea:** token nou `--text-muted-pe-secundar: #576565`, plus extinderea lui
`check-contrast.mjs` cu perechea lipsă. Decizia de a introduce un hex nou e a lui Ciprian —
o semnalez, nu o iau eu, exact ca la punctul 4 din F9 (`docs/DECIZII.md`).

---

## Sursă

De la zero (fără sursă Figma), peste evidență incumbentă: `src/styles/tokens.css`,
`src/layouts/Base.astro`, cele 17 componente, plus componentele adăugate în v2/v3
(`RailFir.astro`, `Campul.astro`, `CampulSprite.astro`, `IndicatorScrollIntern.astro`),
`docs/DECIZII.md`, `CLAUDE.md`.

**Verificare de proces (Impeccable):** `PRODUCT.md` tot nu există; rămâne rafinare
scoping-ată. Recomand în continuare `/impeccable init` separat de acest brief.

## Paletă

**Zero hex nou pentru sticlă și Câmp** — tenta cardului e culoarea proprie a registrului
(`--bg` / `--bg-secundar` / `--bg-inchis`), la o alpha calculată; Câmpul rămâne pe
`--accent-decor` `#468984` (deschis) și `--accent-clar` `#7FD1C4` (închis), ambele deja
licențiate pentru decor non-text.

Singurul hex nou propus în tot documentul e `#576565`, și **nu pentru redesign** — pentru
defectul preexistent de mai sus.

## Tipografie

Neschimbată: Inter, Source Sans 3, IBM Plex Mono, `latin`+`latin-ext`, scală `clamp()`.
Nici Câmpul, nici Firul, nici sticla nu poartă text.

## Layout

*(Neschimbat din v2.)* `§01`–`§16` = 16 carduri `100dvh`; `§17` (footer) în afara
sistemului. Prag de fallback: `100dvh` ≥ 560px → fit garantat prin tipografie fluidă; sub
560px → scroll intern cu indicator vizibil. `§16` — excepție cunoscută, scroll intern
acceptat ca normă. `§02`/`§08` — „nu se taie la mobil" respectat (scroll intern ≠ tăiere).

---

## Element-semnătură — trei straturi

### Ierarhia, explicit (punctul 5 din cerință)

| Strat | `z-index` | Rol | Culoare | Atenție |
|---|---|---|---|---|
| **Câmpul** — fundal | `0` (în cardul `z-index:0`) | atmosferă, zero informație | `--accent-decor` / `--accent-clar` | ultimul; se *simte*, nu se privește |
| **Cardul de sticlă** — conținut | `1` (în același context) | poartă tot textul; separă vizual secțiunile | tenta registrului | primul; e singurul lucru citit |
| **Firul** — rail | `fixed`, peste tot | wayfinding + progres | `--accent` / `--accent-clar` | al doilea; consultat, nu citit |

Regula de atenție: **un singur lucru crisp la un moment dat** — cardul. Câmpul e difuz prin
construcție (fin, dens, low-contrast, plus blurul sticlei peste el). Firul e mic și la
margine. Nu concurează, pentru că operează la trei scări diferite: câmp difuz (mare, moale)
→ placă solidă (mare, crisp) → accent liniar (mic, crisp).

### Câmpul, redesenat (punctul 4 — valori, nu adjective)

Diagnosticul „zgârieturi/crăpături" e corect și are trei cauze măsurabile în
`CampulSprite.astro` de azi: stroke `1` pe `viewBox 240` (≈1.6px la 390px lățime — greu),
doar 3–8 linii pe tot cardul (sparse = fiecare linie citește individual, ca un defect), la
opacitate plină (`--accent-decor` opac = 4.06:1 față de alb, mult prea prezent). Corecția
atacă toate trei:

| Parametru | v3 (azi) | **v4** | De ce |
|---|---|---|---|
| `stroke-width` (pe `viewBox 240`) | `1` | **`0.35`** | ≈0.55px la 390px — fir, nu crăpătură |
| Nr. de linii / variantă | 3–8 | **28–40** | densitate = textură; sparse = defect punctual |
| `stroke-opacity` | 1 (implicit) | **`0.25`** deschis / **`0.20`** închis | plafon folosit ca worst-case în calculul de contrast |
| Geometrie | diagonale arbitrare | **grilă coerentă** (mai jos) | „traseu", nu „spărtură" |
| `viewBox` | `240×240` | **`480×480`** | dublează rezoluția geometrică fără fișier mai mare |

**Geometria coerentă** — nu diagonale random, ci un singur sistem cu trei stări, toate
derivate din aceeași grilă de bază: **linii verticale paralele, echidistante** (pas 12
unități pe `viewBox 480` ≈ 32 de linii), care traversează cardul de sus în jos. Ce diferă
între stări e **doar deviația laterală** a fiecărei linii:

- **`neutru`** (`§01`) — deviație 0. Linii drepte, verticale, calme.
- **`zgomot`** (`§02`–`§07`) — fiecare linie deviază lateral ±8–14 unități, în 5–7
  segmente pe înălțime, cu fazele defazate între linii vecine: câmpul „vibrează", ca
  interferența. Coerent, nu haotic — un observator vede *un sistem perturbat*, nu
  zgârieturi.
- **`clar`** (`§08`–`§16`) — deviație descrescătoare de sus în jos (±6 sus → 0 jos):
  liniile se *îndreaptă* pe parcursul cardului. Metafora („din complexitate spre un
  rezultat clar") devine legibilă în geometrie, nu doar în intenție.

Verticalitatea e alegerea centrală: liniile paralele cu direcția de scroll citesc ca
*traseu*, nu ca fisură — și, în plus, o linie verticală fină e cel mai puțin agresiv lucru
posibil sub o coloană de text orizontal. Cele trei variante rămân **autorate static** în
`CampulSprite.astro` ca `<symbol>` (fără generare procedurală la runtime), buget neschimbat
sub 15KB.

Fiind acum sub sticlă, Câmpul are voie să fie **mai dens** decât în v3 — blurul sticlei îl
transformă într-un wash moale exact acolo unde stă textul, și îl lasă crisp în marginile
cardului. Asta e chiar mecanismul care face sticla să citească drept sticlă.

### Cardul de sticlă (punctul 1 — anatomie cu valori)

Anatomia completă, per registru (`R` = registrul secțiunii):

| Proprietate | Valoare | Motiv |
|---|---|---|
| `background` | `color-mix(in srgb, var(--bg-registru) <α>%, transparent)`, α din tabelul B | tenta = culoarea proprie a registrului → zero hex nou |
| `backdrop-filter` | `blur(20px) saturate(115%)` | 20px ≈ „liquid glass" Apple la scara asta; saturate mic, ca să nu deplaseze luminanța peste marja calculată |
| `border-radius` | **`20px`** | deliberat ≫ `--radius: 4px` — 4px e limbajul controalelor („pagina nu e o aplicație"); placa de sticlă e alt obiect, la altă scară |
| Bordură | `1px solid color-mix(in srgb, var(--bg-registru) 55%, transparent)` | muchia refractată; grosime 1px, nu colorată accent → nu încalcă banul din `craft-floor.md` |
| **Highlight specular** | `::before`, `inset 0 0 auto 0`, înălțime `1px`, `background: linear-gradient(90deg, transparent, color-mix(in srgb, #fff 70%, transparent) 50%, transparent)` | conturul mai luminos *sus*, semnătura Apple; o singură linie de 1px, nu un gradient pe toată suprafața |
| `box-shadow` | `0 1px 2px rgba(27,36,38,.05), 0 18px 40px -20px rgba(27,36,38,.28)` | offset + blur real, cum cere `craft-floor.md`; extinde umbra `[data-tilt]` deja existentă, nu inventează alta |
| Margine față de card | `clamp(12px, 3vw, 28px)` de la marginile lui `100dvh` | ca liniile Câmpului să fie vizibile în jurul plăcii — altfel sticla acoperă tot și efectul dispare |

**De ce nu încalcă banul din `craft-floor.md`.** Textul interzis e: *„Glass and blur as
decoration rather than as a specific effect."* Aici blurul **e** efectul specific, cu trei
funcții structurale, nu ornamentale: (a) e singurul mecanism de contrast al paginii — fără
tentă, textul stă direct peste Câmp; (b) e ce rezolvă defectul #2 (liniile nu mai sunt
tăiate, trec difuz pe sub placă); (c) e ce creează defectul #3 lipsă (granița vizuală între
secțiuni). Un card opac ar rezolva (a) și (c), dar ar reintroduce (b) la scară mai mare.
Blurul e singura soluție care le rezolvă pe toate trei simultan — deci efect specific, nu
decor. În plus, e **cerut nominal de user** („liquid glass"), iar regula de deasupra
ban-urilor din `craft-floor.md` e explicită: *„The brief wins."*

Ban-uri verificate și respectate: fără gradient text; fără `border-left` colorat >1px; fără
hard-offset shadow; fără carduri imbricate (blocurile interne — `.vacarm-bloc`, `.fisa`,
`.bife` — își pierd fundalul propriu și devin delimitate prin spațiu/linie de 1px, ca să nu
apară card-în-card); fără glyphuri unicode ca iconițe.

---

## Garanția de contrast (v4) — punctul 2

### Mecanismul

Sticla e translucidă, deci perechea text/fundal nu mai e una din cele verificate azi. Dar
**ce e dedesubt e cunoscut și mărginit**: doar liniile Câmpului (`--accent-decor` /
`--accent-clar`, plafonate la `stroke-opacity` 0.25/0.20) peste fundalul registrului. Deci
compozitul worst-case e determinabil exact, cu aceeași formulă ca `scripts/check-contrast.mjs`:

```
U (worst-case sub sticlă) = blend(culoare_linie, bg_registru, α_linie)
C (compozit final)        = blend(tenta_registru, U, α_tentă)
cerință:  contrast(text_cel_mai_slab, C) ≥ 4.5
```

Calculul e **conservator prin construcție**: presupune stroke opac pe 100% din pixelul de
sub text, ignorând că `backdrop-filter: blur(20px)` mediază backdrop-ul și slăbește drastic
o linie fină izolată. Realitatea e mai bună decât numărul; numărul e cel care ține gate-ul.

### Alpha minimă calculată, per registru

Cu `α_linie = 0.25` (deschis) / `0.20` (închis):

| Registru | Text cel mai slab | Worst-case sub sticlă | **α_tentă MINIMĂ** | **α RECOMANDATĂ** |
|---|---|---|---|---|
| primar `#FFFFFF` | `--text-muted` `#637474` (4.91 plat) | `#D1E2E0` | 0.707 | **0.82** |
| secundar `#E4E7E7` | `--eroare` `#9E4B4B` (4.74 plat) | `#BDD0CE` | 0.804 | **0.88** |
| închis `#1B2426` | `--text-pe-inchis-muted` `#B9C4C4` (8.86 plat) | `#344F4E` | 0.000 | **0.70** |

Registrul închis nu are constrângere de contrast (linia deschisă peste fundal foarte închis
rămâne mai închisă decât textul) — cei 0.70 sunt aleși **estetic**, pentru o sticlă vizibil
mai translucidă pe întuneric, unde efectul citește cel mai bine.

### Verificare la valorile recomandate — toate textele reale, toate registrele

| Registru → compozit | Text | Sub sticlă | Plat azi |
|---|---|---|---|
| **primar** → `#F7FAF9` | `--text` `#2A3439` | 12.13 ✓ | 12.74 |
| | `--secundar` `#2F4F4F` | 8.50 ✓ | 8.93 |
| | `--accent` `#376A66` | 5.85 ✓ | 6.15 |
| | `--eroare` `#9E4B4B` | 5.61 ✓ | 5.90 |
| | `--text-muted` `#637474` | 4.67 ✓ | 4.91 |
| **secundar** → `#DFE4E4` | `--text` `#2A3439` | 9.92 ✓ | 10.24 |
| | `--secundar` `#2F4F4F` | 6.95 ✓ | 7.18 |
| | `--accent` `#376A66` | 4.79 ✓ | 4.94 |
| | `--eroare` `#9E4B4B` | 4.59 ✓ | 4.74 |
| | `--text-muted` `#637474` | **3.82 ✗** | **3.94 ✗** — defectul preexistent de mai sus |
| **închis** → `#233132` | `--text-pe-inchis` `#FFFFFF` | 13.49 ✓ | 15.83 |
| | `--text-pe-inchis-muted` `#B9C4C4` | 7.55 ✓ | 8.86 |
| | `--accent-clar` `#7FD1C4` | 7.59 ✓ | 8.91 |

Costul sticlei e mic și mărginit: **maximum ~0.3 puncte** de ratio pe registrele deschise.
Singurul ✗ pică deja azi, pe plat — nu e cauzat de sticlă.

### Menținerea automată a gate-ului `CONTRAST`

Gate-ul din `CLAUDE.md` §6 trebuie să rămână automat, altfel următoarea atingere a
opacității îl rupe tăcut. **Extinde `scripts/check-contrast.mjs`** cu:

1. Funcția `blend(fg, bg, alpha)` (compunere sRGB standard).
2. Constantele `ALPHA_LINIE_CAMP` și `ALPHA_TENTA_STICLA` per registru — **importate din
   aceeași sursă ca CSS-ul**, sau cel puțin cu un comentariu reciproc, ca să nu divergă.
3. Perechile compozite din tabelul de verificare de mai sus, ca intrări reale în `PERECHI`.
4. Perechea lipsă găsită azi: `--text-muted` pe `--bg-secundar` (va pica până la fix — și
   trebuie să pice, e un defect real).

Fără pasul 4, scriptul continuă să raporteze 18/18 verde peste un defect real în producție.

---

## Nivel de motion

**7/10** (de la 6). Creșterea vine din scroll-ul interpolat + blur pe compositor; onest
raportată, nu ascunsă sub numărul vechi.

### Lenis — schimbare de poziție, motivată de dovadă

Am recomandat **împotriva** Lenis de două ori (v1, v2), cu rezerva scrisă explicit în v2:
*„dacă `motion-engineer` constată empiric că matematica de viteză scrisă de mână e
inconsistentă pe dispozitivele reale testate, Lenis ca senzor de viteză e un fallback
acceptabil — decis atunci, cu date, nu acum, din comoditate."*

**Dovada a venit.** Userul a testat pe telefonul real și a cerut explicit „mișcare super
fluidă" la gest normal. Asta schimbă premisa pe care se sprijineau ambele recomandări
anterioare:

1. Argumentul meu principal era *„majoritatea gesturilor trebuie să rămână 100% native,
   deci a virtualiza tot scroll-ul e disproporționat."* **Premisa a căzut**: userul nu mai
   vrea scroll nativ la gest lent, vrea scroll *interpolat* — exact ce livrează Lenis. Ce
   era „cost inutil" a devenit cerința.
2. Al doilea argument (senzor de viteză fiabil cross-browser — trackpad vs. rotiță vs.
   inerție iOS) era deja o slăbiciune pe care **eu am numit-o** în v2. `lenis.velocity` o
   rezolvă cu un semnal normalizat, testat pe toate trei clasele de input.
3. Rămâne valid: disciplina de dependințe a proiectului. Dar o dependință care furnizează
   *două* lucruri cerute (fluiditate + senzor) e altă socoteală decât una care furniza zero.

**Nu se schimbă nimic din contract:** `prefers-reduced-motion` face bail-out înainte de
`new Lenis()` (nu doar `lenis.stop()`); tastatura rămâne handler separat, care apelează
`lenis.scrollTo` cu aceleași reguli; gest rapid (peste pragul de `lenis.velocity`) → salt
la cardul următor; gest lent → scroll interpolat liber, fără snap. Anchor-ul `#inscriere`
din cele patru CTA-uri trebuie rutat prin `lenis.scrollTo`, altfel sare instant în mijlocul
scroll-ului interpolat.

### Punctul 3 — efectul 3D pe card, recalibrat din nou

Coordonatorul are dreptate: un tilt pe o placă **cu margini vizibile** citește mult mai
puternic decât pe conținut fără contur, pentru că muchia și umbra dau creierului o
referință de paralaxă pe care v2 n-o avea. Deci **mai puțin, nu mai mult**:

| Parametru | v2 | **v4** |
|---|---|---|
| `MAX_GRADE` | 2° | **1.2°** |
| `perspective()` | 1600px | **2000px** |
| `translateZ` | 6px (moștenit) | **0** — ridicarea o dă umbra, nu translația |
| Tranziție | 150ms ease-out | **220ms** `cubic-bezier(0.22,0.61,0.36,1)` — sticla e grea, nu sare |

Tilt-ul se aplică pe **placa de sticlă**, nu pe `<section>` — altfel ar înclina și Câmpul,
iar paralaxa dispare. Fundalul stă, sticla se mișcă peste el: exact ce vinde efectul.
`data-tilt` rămâne pe alt element decât `data-reveal` (lecția din `docs/DECIZII.md`).

### Punctul 2 — performanța `backdrop-filter`

16 carduri de ecran plin cu `backdrop-filter` pe un Android mediu prin 4G/WhatsApp in-app
e cel mai scump lucru din tot brief-ul. Praguri concrete:

1. **Blur activ doar pe cardul activ + vecinii imediați** (max 3 din 16), prin exact
   controller-ul care comută deja `.camp-activ` în `RailFir.astro` — o clasă în plus pe
   același `actualizeazaRail`, nu un sistem nou. Cardurile inactive: aceeași tentă, dar
   opacă (`α = 1`), zero `backdrop-filter`. Contrastul lor devine **exact perechea plată de
   azi**, deci nu au nevoie de verificare separată.
2. **`@supports not (backdrop-filter: blur(1px))`** → toate cardurile cad pe tenta opacă.
   Fallback identic cu starea „inactiv", deci zero cod în plus.
3. **Plafon dur pe mobil:** sub `48rem` lățime, `blur(20px)` → **`blur(12px)`**. Costul lui
   `backdrop-filter` crește cu raza; 12px păstrează efectul și taie aproape jumătate din
   muncă. Tenta nu se schimbă — calculul de contrast nu depinde de rază.
4. **`will-change: backdrop-filter` interzis** — promovează permanent 16 straturi în memorie
   video. Doar `will-change: transform` pe placa cu tilt, cum e deja.
5. **Poartă de verificare, nu presupunere:** `npm run test:visual` la 360px + o măsurătoare
   de FPS în timpul unui scroll rapid pe throttling mobil. Dacă scade sub ~50fps, primul
   lucru care cade e blurul pe vecini (doar cardul activ), apoi raza la 8px. Ordinea asta e
   parte din brief, ca să nu se improvizeze sub presiune.

### `prefers-reduced-motion: reduce` — comportamentul complet

- Lenis: nu se instanțiază deloc; scroll nativ.
- Hijack: fără listeneri.
- Câmpul: nu se randează (`display: none`) — nu poartă informație.
- Tilt: dezactivat.
- **Sticla: RĂMÂNE**, dar cu `α = 1` (opacă) și fără `backdrop-filter`. E structură
  vizuală, nu mișcare — a o elimina ar șterge granițele dintre secțiuni, adică ar degrada
  lizibilitatea exact pentru cine a cerut mai puțină mișcare.
- Firul: rămâne static, complet desenat.

---

## Structură de conversie

Neschimbată — CTA unic „Rezervă-ți locul", `#inscriere`, aceleași patru locuri (hero, după
`§05`, după `§08`, `§16`), marcate de nodurile Firului. Nici sticla, nici Câmpul nu adaugă
puncte de acțiune. Singura implicație tehnică: ancorele trec prin `lenis.scrollTo`.

## Preset shadcn de plecare

Neaplicabil (proiectul n-are Tailwind/shadcn). `motion-engineer` nu rulează scaffold-ul.

## Copy

Neschimbat. Câmpul, Firul și placa de sticlă sunt toate `aria-hidden="true"`, zero text
propriu. Singura adăugare de text din tot brief-ul rămâne microcopy-ul de accesibilitate
al indicatorului de scroll intern (v2). Niciun invariant din `CLAUDE.md` §1 nu e atins.
