# CLAUDE.md — Workshop „PRIMUL PAS"

Landing + înscriere. Deep Logic · miercuri, 16 septembrie 2026 · Satu Mare.
Live pe `workshop.deeplogic.ro`. Pivot de produs (2026-08-31): fostul „Prima Mutare
spre un Asistent Digital" devine „PRIMUL PAS" — copy nou, 30 de locuri (nu 25),
contor live de locuri activat deliberat. Vezi §1 pentru istoricul deciziei.

**Sursele de adevăr:** [`docs/landing-workshop-16-09.md`](docs/landing-workshop-16-09.md) (copy)
și [`docs/spec-tehnic-inscriere-16-09.md`](docs/spec-tehnic-inscriere-16-09.md) (arhitectură).
Deciziile luate după ele: [`docs/DECIZII.md`](docs/DECIZII.md). Când codul și documentele
diverg, documentele se actualizează — nu se abandonează.

---

## 1. Invarianți de copy — netransgresabili

Nu apar pe pagină, **deliberat**. Sunt verificați automat de
[`tests/copy-invariants.test.ts`](tests/copy-invariants.test.ts) — build-ul pică dacă reapar.

- **Preț sau ancoră de preț.** Fără „valoare X lei", fără „normal ar costa". Workshopul
  public și cel in-company nu sunt același produs.
- **Cifre de piață, procente, statistici, ROI.** Niciuna verificată de Ciprian, deci
  niciuna pe pagină.
- **Promisiuni de conformitate legală.** Copy-ul PRIMUL PAS (pivot 2026-08-31) nu mai
  menționează AI Act/GDPR/NIS2 deloc — sursa nouă n-are unghiul legislativ pe care-l avea
  „Prima Mutare". Regula rămâne o constrângere de LOCAȚIE, nu un mandat de prezență: **dacă**
  vreuna reapare, are voie doar în §02, ca zgomot pe care îl aude cititorul — niciodată ca
  promisiune că le rezolvă Deep Logic. [fix — audit impeccable, 2026-09-01: varianta veche
  spunea „apar o singură dată", ca și cum ar fi încă pe pagină.]
- **Testimoniale.** Nu există pe formatul ăsta. Nu se inventează.
- **Logo-uri de clienți, badge-uri de autoritate.**
- **Telefon, cifră de afaceri, număr de angajați în formular.** Toate trei semnalează
  „urmează un apel de vânzare" către exact cititorul care nu te cunoaște încă.
- **Notificări false de tip „cineva tocmai s-a înscris".** Interzis explicit de sursă,
  chiar și după reversarea de mai jos — vezi corolarul.

**Reversare deliberată (2026-08-31, Ciprian):** înainte, countdown-ul, „ultimele locuri" și
orice contor live erau interzise — regula veche era „rarefierea e reală (25 de locuri) și se
spune o dată, calm". Motivul declarat al reversării: pagina nouă (PRIMUL PAS) capătă o bară
fixă (`BaraScarcity.astro`) cu locuri disponibile + countdown real, plus o insignă pe fiecare
CTA cu numărul de locuri rămase. **Regula care rămâne literă de lege, neschimbată de reversare:
„fără deficit fals; afișează doar date reale"** (din sursa PRIMUL PAS, secțiunea
„Countdown și locuri"). Corolarul practic:

- **Capacitatea e unificată la 30, peste tot** — pagină ȘI bază de date. Vechea asimetrie
  (pagina afirma 25, sistemul accepta 30, ca buffer ascuns de no-show) nu mai există: un
  contor live ar fi expus-o direct, deci a fost eliminată la sursă
  (`supabase/migrations/0007_capacitate_unificata.sql`, `CAPACITATE` în `src/lib/supabase.ts`).
- **Numărul afișat trebuie calculat din exact același prag pe care îl aplică
  `register_participant`** la decizia inscris-vs-așteptare (`locuriDisponibilePublic()` în
  `src/lib/supabase.ts`) — altfel bara ar putea arăta „N locuri disponibile" chiar în
  momentul în care un submit real ar fi trimis pe listă de așteptare.
- **Fără JS, bara arată STRICT fallback-ul static** (capacitate maximă + data/ora din
  `copy.ts`), niciodată un număr ghicit. Fără fetch reușit, la fel.
- **CTA-ul rămâne textual fix** („Rezervă-ți locul") — insigna cu numărul de locuri e un
  element separat, ascuns implicit, completat doar după un fetch reușit (vezi `Cta.astro`,
  `data-locuri-cta`). Nu schimbă regula de mai jos, „un singur CTA, text fix".

**A patra rundă de polish (2026-09-02, Ciprian):** textul barei fixe e roșu, nu doar aproape
de capacitate plină. Insigna „Disponibil X/30" s-a mutat **ÎN** interiorul butonului CTA (nu
mai stă dedesubt) — regula de mai sus, „element separat, ascuns implicit", rămâne neschimbată,
doar poziția.

**A cincea rundă (2026-09-02, Ciprian — „nu e roșu, e roz"):** gradientul roșu al rundei a
patra (`#F0B3B3` → `--eroare-clar`) era prea desaturat pe fundalul foarte închis al barei și
se citea ca roz. Înlocuit cu un roșu fix, `--eroare-bara` (`#FA6262`, 5.27:1 pe `--bg-inchis`
— cel mai saturat roșu găsit care încă trece 4.5:1; roșu pur, `#FF0000`, pică la 3.96:1) —
bara nu mai variază culoarea cu ocuparea. Textul barei e și **20% mai mare**
(`calc(var(--t-mic) * 1.2)`).

Aceeași rundă, două fix-uri fără legătură cu bara:
- **H1 din hero, pe 3 rânduri forțate, nu 2** (`copy.ts` → `hero.h1`) — linia
  „Cum faci PRIMUL PAS în noua eră digitală?" depindea de unde încăpea la wrap; acum fiecare
  propoziție/frază e propriul `span.rand`, ca la rândul 1. [Forma structurii a fost înlocuită
  la runda a șaptea, mai jos — pe atunci era un array de 3 șiruri de mărime egală, ceea ce
  rezolva unde CADE ruptura, nu și faptul că fiecare rând se rupea în două pe 360px.]
- **Butonul flotant (`CtaFloating.astro`) se suprapunea cu CTA-ul din flux.** Cauza: un
  `rootMargin` NEGATIV (`-25%`) ÎNGUSTEAZĂ zona în care un `.cta` contează ca „vizibil" —
  un CTA era detectat abia după ce intra adânc în ecran, mult după ce ajunsese deja la poziția
  fixă a butonului flotant. Fix: `rootMargin: '0px 0px 200px 0px'` (POZITIV) — un `.cta` e
  detectat cu până la 200px înainte să apară fizic, timp suficient pentru tranziția de 250ms a
  butonului flotant. Verificat programatic (scroll simulat prin toată pagina, la fiecare CTA):
  zero suprapuneri.

**A șasea rundă (2026-09-02, Ciprian — „nu încape countdown-ul"):** textul barei, la +20% din
runda a cincea, trecea de lățimea barei pe 360px și se tăia cu „…" înainte de countdown.
Format nou, mult mai compact: `Locuri 30/30 · 13z 23:45:03` — șablon separat,
`scarcity.etichetaBara` (rândul de locuri LIVE din formular, propoziția completă „Mai sunt N
locuri disponibile din M.", rămâne pe `etichetaLocuri`, spațiu suficient acolo). Countdown-ul
însuși e acum ceas complet, zero-padded (`HH:MM:SS`, cu „Nz " în față doar cât mai e cel puțin
o zi întreagă) — mai precis ȘI mai scurt decât fostul „13z 20h până la începere"
(`etichetaCountdown` a fost eliminat din `copy.ts`, nu mai are utilizare).

**A șaptea rundă (2026-09-07, Ciprian — hero, „să încapă pe primul rând pe orice ecran"):**
cele trei rânduri ale H1-ului aveau aceeași mărime și se rupeau singure la wrap — pe 360px
H1-ul ocupa **cinci** rânduri vizuale, nu trei. Acum rândul e o unitate garantată, cu roluri
diferite (`hero.h1` e obiect, nu array: `rand1` / `rand2{inainte,accent}` / `rand3`):

- **Rândul 1 („Afacerea ta este diferită.") e afirmația de deschidere**, la 0,75 din mărimea
  întrebării. **Rândurile 2 și 3 sunt întrebarea, la mărime identică între ele**, cu „PRIMUL
  PAS" în `--accent` — singura bucată colorată din H1 (nu `--lime`: pe fundal deschis dă ~2:1
  și e culoare de FUNDAL pentru CTA, vezi §3).
- **Mărimea vine din lățimea CONTAINERULUI (`cqi`), nu din `vw`.** Lățimea în care încape
  textul e fereastra minus două rame de padding fluide, plafonată pe desktop de `--max-proza`
  — un `vw` nu vede niciuna dintre cele trei. `white-space: nowrap` + `min(plafon, 100cqi /
  factor)`, unde factorii sunt lățimile textului MĂSURATE în browser cu Inter încărcat.
  Prima declarație `font-size` din fiecare regulă rămâne un `clamp()` — fallback pentru
  browserele fără unități de container, unde `min()` cu `cqi` e invalid la parsare.
- **Sub 480px, ramele hero-ului s-au strâns** (12px secțiune + 16px cadru de sticlă, de la
  ~21+21): pe 360px containerul urcă de la 275 la 302px, adică ~10% mărime de titlu. Când
  titlul își ia mărimea din container, fiecare pixel de ramă e mărime de titlu pierdută.
- **`tests/e2e/hero.spec.ts` e alarma:** verifică la 9 lățimi că niciun rând nu depășește
  containerul și că nu coboară sub 18px. Factorii măsurați sunt singura piesă care poate
  rămâne în urmă — un copy nou de H1 fără remăsurare iese din container tăcut, sub
  `overflow-x: hidden` de pe body.

Aceeași rundă, copy nou în hero (text primit de la Ciprian): `subheadline` e acum două
paragrafe, `corp` o singură propoziție („Nu discutăm tehnic, discutăm soluții la probleme
reale."). Schimbarea care contează: **„roadmap de IMPLEMENTARE" → „roadmap personalizat de
VALIDARE"** — hero-ul era singurul loc din pagină care promitea implementare într-un workshop
de trei ore, restul paginii (§Rezultatul, `meta.descriere`) spunea deja „validare".

**Cardul de logistică → BILET (aceeași rundă, „acum mi se pare doar aglomerat"):**
`TrustBar.astro` era patru propoziții de aceeași greutate, aproape toate în IBM Plex Mono la
13px — inclusiv adresa, care e proză, nu date. Nimic nu ancora privirea. Acum e un bilet:

- **Pictograme desenate ca ancore de scanare** — patru, aceeași familie (viewBox 24, stroke
  1.7, capete rotunde), `--accent`. Nu emoji, nu glife Unicode.
- **Mono STRICT pe date** („14:00–17:00"). Adresa și restul au trecut pe fontul de corp.
- **Fiecare rând = `valoare` + `detaliu` opțional** — ce citești întâi și ce citești doar dacă
  te interesează rândul. Eticheta („Ora", „Locul") rămâne DOAR pentru cititoarele de ecran:
  vizual, valoarea se descrie singură.
- **Forma de bilet, cu perforație și crestături.** Crestăturile sunt două cercuri în culoarea
  secțiunii, tăiate de `overflow: hidden` al lui `.card-depth` — nu au nevoie de `mask`, deci
  funcționează și peste `backdrop-filter`. Perforația e orizontală (corp deasupra / talon
  dedesubt), la orice lățime — **corectat la a doua rundă a aceleiași zile, vezi mai jos**;
  varianta inițială (biletul rotit pe orizontală peste 46rem) a fost reversată.
- **Talonul poartă condiția de acces, în roșu** (`--eroare`, cerut explicit): „Participarea
  este gratuită, pe bază de invitație." Absoarbe fostul rând italic de sub card ȘI cuvântul
  „Gratuit" din fostul `trustBar.format` — atenție la invariantul „«gratuit» de exact trei
  ori pe pagină": rândul ăsta e unicul din trustBar.
- **`trustBar.meta` a dispărut** (era rezumat doar-pentru-cititoare-de-ecran care dubla exact
  rândurile vizibile). D6 — adresa completă pe pagină — e acoperit acum de rândul `loc`,
  vizibil. Cele două aserțiuni din `copy-invariants` care se agățau de `meta`/`format` au fost
  mutate pe `JSON.stringify(copy.trustBar)`: verifică același fapt, nu forma câmpului.

**A doua rundă a aceleiași zile (2026-09-07, Ciprian — „cardul cu 20% mai mare", „roșul la
mijloc") — două corecții punctuale pe bilet, plus butonul flotant:**

- **Biletul, +20%, prin `--scala: 1.2` LOCAL pe `.bilet`** — nu tokenii globali
  `--t-h3`/`--t-corp`/`--t-mic`, folosiți și în restul paginii; schimbați global, ar fi umflat
  fiecare titlu de pe site, nu doar biletul. `--scala` înmulțește (`calc()`) lățimea maximă
  (52rem → 62,4rem), padding-ul, spațiile dintre rânduri, mărimea pictogramelor (atribute
  `width`/`height` pe fiecare `<svg>`, suprascrise prin CSS — specificitate mai mare decât un
  atribut de prezentare) și toate mărimile de font locale ale biletului.
- **Talonul (textul roșu + butonul) — CENTRAT, nu într-o coloană dreapta.** Reversează decizia
  de mai sus („peste 46rem biletul se rotește pe orizontală"): pe desktop, talonul ajungea
  vizual împins spre marginea paginii, nu la mijloc — exact opusul cerinței. Biletul a revenit
  la o singură coloană, pe verticală, la orice lățime; doar talonul e centrat
  (`justify-items: center` + `text-align: center`), ca în imaginea de referință trimisă.
- **Butonul flotant (`CtaFloating.astro`) — a doua condiție de ascundere, independentă de
  suprapunerea cu alt `.cta`:** dispare la **1000ms** de la ULTIMUL eveniment `scroll` (nu
  concurează vizual cu conținutul cât timp cineva citește static), reapare la **500ms** de la
  PRIMUL eveniment de scroll după inactivitate. Cele două valori sunt debounce-uri (cât se
  așteaptă după evenimentul declanșator), nu durate de animație — tranziția CSS
  (opacitate/transform, 250ms) rămâne neschimbată. Vizibilitatea finală e ȘI cele două condiții
  simultan (fără suprapunere ȘI scroll activ recent).
  - **Capcana de verificat, dacă se schimbă din nou:** Lenis amortizează wheel-ul (`lerp: 0.1`
    implicit — `damp()`, nu o animație cu durată fixă), deci un `page.mouse.wheel()` continuă
    să producă evenimente `scroll` REALE o vreme după ultimul tick — timpul depinde de istoricul
    de input, nedeterminist pentru un test. `tests/e2e/motion.spec.ts` verifică timing-ul cu
    salturi INSTANTE (`window.scrollTo({behavior:'instant'})`, câștigă în fața CSS-ului
    `scroll-behavior: smooth`), repetate la ~150ms ca să simuleze scroll continuu, nu un singur
    gest izolat — un singur salt izolat produce o fereastră de vizibilitate îngustă și corectă
    (apare la 500ms, dispare la 1000ms de la ACEEAȘI mișcare), dar nereprezentativă pentru
    „rămâne vizibil cât timp chiar se scrollează".
  - **Cele două teste PREEXISTENTE** („apare după hero", mobil și desktop) foloseau
    `scrollIntoViewIfNeeded()` (scroll animat, `scroll-behavior: smooth`) urmat direct de un
    `expect(...).toBeVisible()` — fereastra de vizibilitate de mai sus (500ms–1000ms de la
    finalul glisării, care poate fi scurtă) era ocazional prea îngustă pentru polling-ul lui
    `expect`. Fix: un ghiont mic (`page.mouse.wheel(0, 30)` — **nu (0, 1)**, prea mic ca să
    treacă de rotunjirea la pixel a lui Lenis, verificat empiric: zero evenimente `scroll`
    produse) imediat după, care resetează debounce-ul de ascundere și lărgește fereastra.

---

## 2. Reguli de build

- **Mobile-first, fără excepție.** ≥40% din trafic vine dintr-un link trimis pe WhatsApp de
  un membru BIZZ.CLUB. Breakpoint-ul de referință e **360px**, nu 375px.
- **Un singur CTA pe toată pagina.** Text: „Rezervă-ți locul". Ancoră: `#inscriere`.
  În interiorul butonului, numărul real de locuri („Disponibil X/30", niciodată inventat —
  vezi §1; mutat ÎN buton la a patra rundă de polish, 2026-09-02 — înainte stătea dedesubt).
  Repetat la: hero, la finalul secțiunii „Ce rezultat promitem", în CTA final — plus
  un buton flotant (`CtaFloating.astro`, cerut explicit 2026-09-02) mereu vizibil după
  ce iese hero-ul din cadru, pe toate viewport-urile. Fără CTA secundar, fără „află mai multe".
- **Problema și „Ce rezultat promitem" nu se taie la mobil.** Sunt cele mai importante
  două secțiuni ale structurii lean din 2026-09-02 (10 secțiuni, mai jos). Dacă tai ceva,
  nu de-acolo. Regula e despre TĂIERE pe motiv de spațiu pe ecrane înguste, nu despre
  imutabilitatea conținutului — „Ce rezultat promitem" a fost retrasă parțial deliberat pe
  9 septembrie 2026 (D83, mai jos), la cerere explicită, repetată după semnalare. Ce rămâne
  din ea (`Cum lucrăm` + `De ce să mai chemi pe cineva?`) tot nu se taie la mobil.
- **Exact 10 secțiuni, nici una în plus.** Hero → Trust bar → Problemă → Agravare →
  Soluție → Facilitator → Cui i se adresează → Cui nu i se adresează →
  Ce rezultat promitem → FAQ. Până pe 8 septembrie 2026 mai exista o a 11-a, ținută
  deliberat separat de numărătoare — „Cei cinci pași ai metodologiei" (`S06CeFacem.astro`,
  singurul pin/scrub GSAP de pe pagină). **Retrasă**, explicit: „renunțăm la metodologie...
  pentru că explicăm cum ajungem la rezultat" — §05 Soluție capătase între timp propria
  metodă (6 pași, titlu+descriere), scrisă chiar în ziua precedentă; o secțiune separată
  care repeta aceeași idee, cu alți 5 pași, devenise dublură, nu întărire. Vezi §Motion
  mai jos pentru ce a scos retragerea odată cu ea.
- **Fundal curat.** Fără imagini generice cu roboți, creiere sau rețele neuronale.
- **Fără parallax pe fundal, cursor custom, particule, WebGL, React/Vue.** Regulă evergreen,
  independentă de ce bibliotecă de motion rulează la un moment dat (inclusiv acum, când nu
  rulează niciuna — vezi §Motion) — Astro randează totul nativ, ca `<script>` de modul, fără
  niciun framework UI.
- **Tot copy-ul trăiește în [`src/content/copy.ts`](src/content/copy.ts).** Un singur loc,
  tipat. Nicio secțiune nu-și scrie textul inline.

**Motion — pivot de arhitectură (2026-09-01, Ciprian, împotriva recomandării inițiale),
REVERSAT (2026-09-08):** motorul de scroll custom (vanilla TS, opt scene coregrafiate
individual, 0KB dependințe) fusese retras în favoarea **Lenis + GSAP ScrollTrigger** —
reversând atunci `docs/DECIZII.md` D29 („zero dependințe noi... ~40KB gzip peste o pagină al
cărei JS total e azi ~6KB"). Cost măsurat după acel swap: **~49KB gzip JS total pe pagină**
(Lenis + GSAP core + ScrollTrigger + scripturile proprii), justificat STRICT de pin/scrub-ul
din `S06CeFacem.astro` (cei cinci pași ai metodologiei) — singurul consumator al lor pe toată
pagina, scris explicit așa în regulile de-atunci („GSAP trăiește STRICT în S06CeFacem, nicio
altă secțiune").

**§06 CeFacem a fost retrasă (2026-09-08, vezi §2 mai sus)** — și, cu ea, a dispărut și
singurul motiv pentru Lenis+GSAP. Pachetele au ieșit din `package.json`
(`npm uninstall gsap lenis`), scriptul de modul din `Base.astro` (fostul prop `motion`) a
fost șters, nu doar dezactivat. Pagina revine, de fapt, la poziția lui D29 — nu prin
reversare manuală a deciziei, ci pentru că motivul care o depășise a dispărut. **Dacă apare
vreodată un motiv nou** pentru scroll cu inerție sau pin/scrub, decizia se ia din nou,
informat, cu propriul cost măsurat — nu se reintroduce tăcut.

**Reveal la scroll + tilt 3D — pivot ulterior (2026-09-02), independent de motorul Lenis+GSAP
de mai sus (și, la retragerea lui, 2026-09-08, singurul mecanism de mișcare rămas pe
pagină):** pagina NU e static prin construcție. Fiecare paragraf/listă/card care poartă
`data-reveal` (pus explicit, per componentă — vezi `tokens.css` `[data-reveal]`) fade+ridică la
intrarea în viewport; cardurile cu profunzime (`.card-depth`/`.card-3d`, `data-tilt`) înclină la
cursor pe pointer fin. Vanilla, fără nicio bibliotecă (`Base.astro`, prop `depth`) — mecanismul
e simplu (IntersectionObserver + tranziție CSS), n-a avut niciodată nevoie de un motor de
scroll dedicat. Reguli:

- **`data-reveal` la nivel de element, nu de secțiune întreagă.** Un fade pe tot blocul unei
  secțiuni bogate (Soluție, Rezultatul) își pierde relevanța — secțiunea e deja pe jumătate
  vizibilă când pornește tranziția.
- **Dublu `requestAnimationFrame` înainte de a porni `IntersectionObserver`-ul** (`Base.astro`).
  Fără el, elementele deja pe ecran la încărcare (hero, Trust bar) trec direct la starea
  finală înainte ca browserul să picteze starea ascunsă măcar o dată — par neanimate.
- **Fără JS, `[data-reveal]` e mereu vizibil** — clasa `html.js` (adăugată sincron, înainte de
  primul paint) e condiția, nu prezența atributului.

**Cadru „frozen glass" pe hero — a patra rundă (2026-09-02):** toată zona hero e încadrată de
`.hero-glass` (`S01Hero.astro`) — aceeași rețetă ca `.card-depth` (gradient lime+accent
PROPRIU fundalului, sub `backdrop-filter: blur()`, altfel blurul n-are ce înmuia peste un
fundal alb plat), dar la **70% transparență** (alpha `0.3`, nu `0.6` ca `--sticla-fundal`) —
cerut explicit, ca efectul de gheață blurată să se citească, nu un card gri aproape opac.

---

## 3. Tokens — cu contrastele calculate

Valorile marcate ⚠ au fost corectate față de documentul original pentru că **picau WCAG AA**.
Ratio-ul e scris lângă fiecare ca să nu fie reintroduse din greșeală.
Rulează `npm run contrast` după orice schimbare de culoare.

| Rol | Valoare | Contrast (alb / `#E4E7E7`) | Unde |
|---|---|---|---|
| fundal primar | `#FFFFFF` | — | pagina |
| fundal secundar | `#E4E7E7` | — | §03 „ce NU vei ști", footer |
| text | `#2A3439` | 12.74 / 10.24 | tot corpul |
| **accent CTA** ⚠ | `#376A66` | **6.15 / 4.94** | butoane, linkuri, text mic |
| accent decorativ | `#468984` | 4.06 — **doar ≥24px sau non-text** | numerotare §06, accente §05 |
| secundar | `#2F4F4F` | 8.93 / 7.18 | headinguri secundare, footer |
| „înainte" (§05) ⚠ | `#637474` | 4.91 pe alb | coloana ÎNAINTE — **nu** opacitate 70% |
| **eroare** ⚠ | `#9E4B4B` | 5.90 / 4.74 | mesaje de validare |
| succes | `#C9E3D0` | — | doar ca fundal; text pe el rămâne `#2A3439` (9.33) |

**Valori respinse, cu motivul** — scriptul le listează la fiecare rulare ca să nu revină:
`#468984` (4.06, CTA original) · `#B85C5C` (4.45, eroare originală) · `#6B7F7F`
(4.23, ≈ opacitate 70%) · `#3A716D` (4.49 pe fundal secundar — trecea pe alb, pica în §03).

**Accent lime + sticlă mată (pivot 2026-09-02) — CTA-urile nu mai folosesc `--accent`:**

| Rol | Valoare | Contrast | Unde |
|---|---|---|---|
| **lime** | `#84CC16` | — (fundal, nu text) | CTA-uri, buton flotant, buton calendar |
| **text pe lime** ⚠ | `--pe-lime` = `--bg-inchis` (`#1B2426`) | **8.01:1** pe lime | text pe orice fundal lime — **niciodată alb** (~1.6:1, verificat, respins) |
| lime hover | `#6BA812` | — | `:hover`/`:focus-visible` pe CTA-uri |
| `--radius-cta` | `14px` fix, **nu procent** | — | toate butoanele CTA — vezi nota de mai jos |
| `--sticla-fundal` | `rgba(228,231,231,0.6)` | — | `.card-depth` — presupune `backdrop-filter: blur()` alături |

**De ce `--radius-cta` e px fix, nu procent:** cerut inițial ca 15%, dar `border-radius`
procentual se calculează SEPARAT pe orizontală/verticală — pe un buton lat și scurt dă un
oval alungit, nu un dreptunghi rotunjit curat. Corectat după feedback direct („forma e nasol").

**De ce sticla mată e vopsită în cardul însuși, nu doar `backdrop-filter`:** `backdrop-filter`
blurează ce e ÎN SPATE — peste un fundal plat (alb sau gri uniform), o culoare uniformă rămâne
aceeași culoare, blurată sau nu. Prima variantă (blur peste un strat decorativ fix, extern) era
tehnic corectă dar vizual invizibilă ori de câte ori cardul nu cădea peste o pată de culoare.
`.card-depth` are acum un gradient lime+accent direct în propriul fundal — sticla arată
colorată indiferent unde ajunge cardul pe parcursul scroll-ului.

**Variantă mai transparentă pe hero (a patra rundă, 2026-09-02):** `.hero-glass`
(`S01Hero.astro`) refolosește aceeași rețetă, dar la alpha `0.3` (70% transparență) în loc de
`0.6` — cerut explicit, ca zona hero să citească clar efectul de sticlă înghețată/blurată, nu
un panou aproape opac.

**Fonturi:** Inter (titluri), Source Sans 3 (corp), IBM Plex Mono (date/numerotare).
Self-hostate din `public/fonts/`, subset **`latin` + `latin-ext`**.
`latin-ext` e obligatoriu: româna folosește ș/ț cu **virgulă dedesubt** (U+0219/U+021B),
care nu sunt în subsetul `latin` default. Fără el, ș și ț cad pe fontul de sistem și se
văd diferit în mijlocul cuvântului.

---

## 4. Reguli de stare — backend

Mașina de stări e partea care poate aloca fizic același scaun de două ori. Regulile nu sunt opționale.

- **Nicio tranziție de stare printr-un GET.** `GET /raspuns` randează doar o pagină de
  confirmare; starea se mută exclusiv prin `POST /api/raspuns`. Motivul: Outlook Safe Links
  și scanerele antivirus fac prefetch pe linkurile din email — un GET care anulează
  înseamnă oameni marcați absenți fără să fi dat click, cu locul plecat instant prin broadcast.
- **Toate `UPDATE`-urile sunt condiționate pe starea așteptată:** `WHERE ... AND status = '<starea de plecare>'`.
  Niciodată read-then-write.
- **Un singur predicat de „loc ocupat", pe toate porțile care alocă un scaun:**
  `inscris`, `reconfirmat`, `prezent`. `asteptare` NU ocupă loc (sunt exact cei care
  revendică); `anulat` și `no_show` l-au eliberat. Cap dur 30, verificat *în interiorul*
  tranzacției, sub `pg_advisory_xact_lock` — atât la revendicarea din waitlist, cât și la
  **revenirea din `anulat`/`no_show`** (migrația `0008_loc_ocupat.sql`).
  - **Poarta NU se aplică pe `inscris → reconfirmat`.** Omul ocupă deja locul pe care poarta
    l-ar verifica; gardată acolo, ar refuza fiecare reconfirmare legitimă exact la sală
    plină — adică exact când toți reconfirmă. Testat explicit ca non-regresie.
  - **`register_participant` și contorul public numără DELIBERAT și `asteptare`** — ele
    răspund la altă întrebare („un om NOU intră direct sau pe listă?") și trebuie să vadă
    waitlist-ul, altfel pagina ar arăta locuri libere exact când un submit real ar fi trimis
    pe listă. Asimetria e corectă; ce era greșit (bug real, 2026-09-10) era ca porțile de
    ALOCARE să numere mai puțin decât ocupă cineva.
  - **Capacitatea 30 stă literal în trei locuri** (`respond_to_invite`,
    `claim_waitlist_seat.p_capacitate`, `register_participant.p_prag_waitlist`). O sursă
    unică în SQL rămâne de făcut; până atunci, schimbi în toate trei.
- **Nicio funcție SQL existentă nu-și schimbă semnătura într-o migrație.** `create or replace`
  cu o listă de parametri diferită NU înlocuiește funcția — adaugă o supraîncărcare, iar
  apelul aplicației devine ambiguu („function ... is not unique") și pică *tot* fluxul,
  imediat după migrație. Prins de suita SQL înainte de deploy la 0008; dacă chiar trebuie
  schimbată semnătura, `drop function` explicit pe cea veche, în aceeași tranzacție.
- **Ciclul de emailuri se ramifică pe fereastra în care a picat înscrierea**
  (`fereastraInscrierii()` în `src/inngest/schedule.ts`): `normala` → ciclul complet;
  `tarziu` (după 14 sep 09:00) → marcat `reconfirmat` direct, fără email 2, iar emailul 1
  nu mai promite o reconfirmare care n-ar mai veni; `same_day` (după cutoff-ul de 11:00) →
  un singur email cu detaliile practice + `.ics`, fără marcare automată ca `no_show`;
  `dupa_eveniment` → niciun email. Motivul: `step.sleepUntil()` cu o țintă din TRECUT se
  rezolvă instant, deci fără poarta asta o înscriere de după cutoff era marcată absentă și
  își vedea locul difuzat pe waitlist la câteva secunde după înscriere. Clasificarea e
  memoizată în `step.run` — o reluare nu reevaluează ceasul.
- **`workshop/seat_freed` are `debounce` + `singleton` pe `event_slug`.** La cutoff-ul de
  11:00 pe 16 septembrie, toți nereconfirmații devin `no_show` în același moment. Fără
  coalescing, fiecare om de pe waitlist primește câte un email pentru fiecare loc eliberat.
- **`inngest.send()` are întotdeauna `id` de idempotență.** Retry-ul pe o cerere reușită
  parțial produce altfel două emailuri de confirmare.
- **`anulat` ≠ `no_show`.** Primul a anunțat, al doilea a dispărut. Ambele eliberează locul,
  dar pe primul îl inviți la workshopul următor.
- **Service role key nu ajunge niciodată la client.** Impus mecanic prin `astro:env`
  (`access: 'secret'`), nu prin disciplină.
- **Orice funcție SQL care apelează `gen_random_bytes`/pgcrypto își dă propriul
  `search_path`, cu `extensions` inclus.** Pe Supabase, pgcrypto stă în `extensions`,
  nu `public` — spre deosebire de Postgres vanilla local. O funcție care moștenește
  search_path-ul apelantului trece testele locale și pică doar pe stack-ul real.
- **Câmpuri `astro:env` obligatorii doar dacă sunt cerute de codul care rulează ACUM.**
  Schema se validează integral la fiecare cerere — un câmp gol dar `required` blochează
  toată aplicația, nu doar funcția care încă nu-l folosește (vezi `ALERT_EMAIL`, F4).
  `optional: true` până când funcția reală ajunge în cod.

**Bug real, găsit 2026-09-02 („widget-ul Turnstile arată roșu, «numai pentru testare»"):**
`DialogInscriere.astro` citea cheia publică prin `import.meta.env.PUBLIC_TURNSTILE_SITE_KEY`
(cu fallback la cheia de TEST Cloudflare) — proiectul NU expune variabilele așa, ci prin
`astro:env/client` (fix acum, la fel ca restul fișierelor). Dar fix-ul de cod singur NU e
suficient — verificat empiric (`grep data-sitekey` pe HTML-ul din `dist/`, cu fiecare sursă
rând pe rând): pentru câmpurile `context: 'client'`, `@cloudflare/vite-plugin` rezolvă
`astro:env` din `.dev.vars` → `.env` → abia apoi `wrangler.jsonc` → `vars`. `.dev.vars`/`.env`
au (corect, pentru `astro dev`) cheia de TEST — dar `npm run deploy` rulează `astro build` PE
ACEEAȘI MAȘINĂ (fără CI, fără remote git), deci build-ul de producție citea tot cheia de test,
niciodată cheia reală din `wrangler.jsonc`. Fix la rădăcină: `scripts/deploy.mjs` (înlocuiește
`astro build && wrangler deploy` din `npm run deploy`) ascunde `.dev.vars`/`.env` STRICT pe
durata lui `astro build`, apoi le restaurează necondiționat (try/finally + SIGINT/SIGTERM) —
build-ul de deploy cade prin la `wrangler.jsonc` (cheia reală), `astro dev` local rămâne
neatins. **Orice altă variabilă `context: 'client'` viitoare are aceeași capcană** — dacă
`.dev.vars`/`.env` îi dau o valoare de dev, un `wrangler deploy` local o va clona în producție
dacă nu trece prin `scripts/deploy.mjs`.

---

## 5. „Gata" = verificat, nu = scris

Nicio secțiune nu e terminată fără:

```bash
npm run verify          # astro check + vitest + build
npm run contrast        # zero perechi sub 4.5:1
npm run test:visual     # screenshots 360 / 390 / 768 / 1280 / 1920
```

Plus, pentru orice atinge emailuri sau stare: emailul trimis **real** și deschis pe Gmail
mobil + Outlook; fluxul parcurs end-to-end, nu doar testat unitar.

**După orice `npm run deploy`:** `curl -s https://workshop.deeplogic.ro/ | grep data-sitekey` —
trebuie să arate `0x4AAAAAAEd91eLSLyQCvsIL` (cheia reală), niciodată `1x00000000000000000000AA`
(cheia de test Cloudflare — vezi bug-ul din §4, „widget-ul Turnstile arată roșu").

**Cross-check de copy, la fiecare rundă:** fiecare afirmație din pagină verificată împotriva
a ce face sistemul efectiv. „30 și, la mine, chiar sunt 30" — sistemul respectă?
„Dacă n-o bifezi, nu te caută nimeni" — bifa e chiar opțională? Contorul de locuri de pe bară
și de pe CTA — vine din `locuriDisponibilePublic()`, sau ar putea vreodată să fie un număr
scris de mână?
**Pe pagina asta, un copy care minte e un bug.**

---

## 6. Gates de lansare

Vezi [`docs/PROGRES.md`](docs/PROGRES.md) pentru starea curentă. Niciunul negociabil:

`LEGAL` (Termeni + Confidențialitate linkate din bifă) · `EMAIL` (SPF/DKIM/DMARC verzi,
aterizare în inbox) · `OG` (card randat pe un telefon real, prin WhatsApp) · `CONCURENȚĂ`
(20 de rulări, un singur câștigător) · `B1` (cutoff cu 8 nereconfirmați → un singur email)
· `B2` (prefetch nu schimbă starea) · `CONTRAST` · `DIACRITICE` · `.ics` (14:00 EEST + link
Google Maps în `URL`/`DESCRIPTION`, verificat în Google + Apple + Outlook) · `COPY`
(invarianții trec automat)
