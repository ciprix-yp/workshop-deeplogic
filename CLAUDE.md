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

---

## 2. Reguli de build

- **Mobile-first, fără excepție.** ≥40% din trafic vine dintr-un link trimis pe WhatsApp de
  un membru BIZZ.CLUB. Breakpoint-ul de referință e **360px**, nu 375px.
- **Un singur CTA pe toată pagina.** Text: „Rezervă-ți locul". Ancoră: `#inscriere`.
  Sub el, numărul real de locuri („Disponibil X/30", niciodată inventat — vezi §1).
  Repetat la: hero, la finalul secțiunii „Ce rezultat promitem", în CTA final — plus
  un buton flotant (`CtaFloating.astro`, cerut explicit 2026-09-02) mereu vizibil după
  ce iese hero-ul din cadru, pe toate viewport-urile. Fără CTA secundar, fără „află mai multe".
- **Problema și „Ce rezultat promitem" nu se taie la mobil.** Sunt cele mai importante
  două secțiuni ale structurii lean din 2026-09-02 (10 secțiuni: Hero → Trust bar →
  Problemă → Agravare → Soluție → Facilitator → Cui i se adresează/nu →
  Ce rezultat promitem → FAQ, plus metodologia cu pin GSAP, păstrată separat).
  Dacă tai ceva, nu de-acolo.
- **Fundal curat.** Fără imagini generice cu roboți, creiere sau rețele neuronale.
- **Tot copy-ul trăiește în [`src/content/copy.ts`](src/content/copy.ts).** Un singur loc,
  tipat. Nicio secțiune nu-și scrie textul inline.

**Motion — pivot de arhitectură (2026-09-01, Ciprian, împotriva recomandării inițiale):**
motorul de scroll custom (vanilla TS, opt scene coregrafiate individual, 0KB dependințe) a
fost retras în favoarea **Lenis + GSAP ScrollTrigger**. Reversează `docs/DECIZII.md` D29
(„zero dependințe noi... ~40KB gzip peste o pagină al cărei JS total e azi ~6KB") — decizia
veche rămâne corectă ca istoric, nu ca regulă curentă. Cost măsurat după swap: **~49KB gzip
JS total pe pagină** (Lenis + GSAP core + ScrollTrigger + scripturile proprii). Regulile care
rămân, neschimbate de pivot:

- **GSAP ScrollTrigger trăiește STRICT în `S06CeFacem.astro`** (pin + scrub pe cei cinci pași
  ai metodologiei) — nicio altă secțiune. Restul paginii e static prin construcție, nu doar
  „fără JS": nu există niciun alt mecanism de reveal-la-scroll sau hover de dezactivat.
- **Lenis global, o singură dată, în `Base.astro`**, cu `anchors: true` — CTA-urile ancorează
  spre `#inscriere`/`#continut`; fără opțiunea asta, Lenis blochează exact acel scroll.
- **Guard obligatoriu `prefers-reduced-motion` pe pin/scrub-ul din §06** (GSAP nu îl respectă
  singur, spre deosebire de Lenis). Cu mișcare redusă, cei cinci pași rămân direct vizibili.
- **Fără parallax pe fundal, cursor custom, particule, WebGL, React/Vue.** Astro rulează
  Lenis/GSAP nativ, ca `<script>` de modul — n-a fost nevoie de framework UI ca să le pornească.

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
- **Cursa din waitlist trece prin `pg_advisory_xact_lock`.** Cap dur 30 (unificat cu bufferul
  de la înscriere — vezi §1), verificat *în interiorul* tranzacției.
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
· `B2` (prefetch nu schimbă starea) · `CONTRAST` · `DIACRITICE` · `.ics` (14:00 EEST în
Google + Apple + Outlook) · `COPY` (invarianții trec automat)
