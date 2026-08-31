# Progres — workshop.deeplogic.ro

Evenimentul e pe **16 septembrie 2026**. Țintă internă de lansare: **5 septembrie**,
ca să rămână ~11 zile de distribuție prin WhatsApp.

Legendă: `[ ]` de făcut · `[~]` în lucru · `[x]` gata **și verificat** · `[!]` blocat

---

## F0 — Fundație

- [x] Structura de directoare
- [x] `package.json` — Astro 7.2.8, Cloudflare adapter 14.2.5, Inngest 4.18.1, Zod 4.4.3
- [x] `astro.config.mjs` — `astro:env` cu schema de secrete, `prerenderEnvironment: 'node'`
- [x] `wrangler.jsonc` — `nodejs_compat` activat
- [x] `tsconfig.json` — strict, `noUncheckedIndexedAccess`
- [x] `.gitignore`, `.env.example`
- [x] `CLAUDE.md` — reguli de producție
- [x] `git init` + primul commit
- [x] **Cloudflare**: Custom Domain `workshop.deeplogic.ro` legat de worker-ul
      `workshop-deeplogic`, certificat emis, DNS gestionat automat. Site key Turnstile de
      producție pusă în `wrangler.jsonc` → `vars.PUBLIC_TURNSTILE_SITE_KEY` (publică prin
      design). Domeniul răspunde acum cu eroarea standard Cloudflare, nu cu pagina —
      **așteptat**: worker-ul e gol până la primul `wrangler deploy` cu F4+ scrise. Nu e regresie.
- [x] **Resend**: domeniu `deeplogic.ro` verificat. SPF+DKIM+DMARC toate verzi
      (`_dmarc.deeplogic.ro`, `p=none`, monitorizare). Cheie API `sending_access`, în `.env`.
- [x] **Supabase**: proiect `leeds-deeplogic` (eu-central-1), migrația `0001_init.sql`
      aplicată. `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` în `.env`. Gaura de securitate
      găsită pe loc (grant implicit `PUBLIC` pe funcțiile RPC) — reparată live ȘI în
      `supabase/migrations/0001_init.sql` (vezi commit `bc2323c`), cu `tests/db/permissions.sql`
      care o prinde dacă revine. `get_advisors`: zero avertismente.
- [x] **Turnstile**: widget real creat pentru `workshop.deeplogic.ro`. Site key în
      `wrangler.jsonc` (vars, public), secret key în `.env`/`.dev.vars`.
- [x] **Inngest**: signing key + event key de producție generate și puse în `.env`/`.dev.vars`
      — verificat local: ambele goale încă (`INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`), corect
      pentru dev, unde nu sunt cerute. Dev Server local rulează deja pe portul 8288, ca proces
      persistent. **Nuanță de reținut**: spre deosebire de Resend/Cloudflare/Supabase, nu există
      acces API/MCP direct la Inngest Cloud — nu se pot vedea rulările de producție sau declanșa
      sync de acolo. Sync-ul cu Inngest Cloud la deploy rămâne manual (dashboard) sau pas de CI.

## F1 — Date

- [x] `supabase/migrations/0001_init.sql` — cu `anulat`, `welcome_sent_at`, index (B8/B11/B15)
- [x] Toată logica atomică în funcții Postgres, nu în handler — `supabase-js` **nu are
      tranzacții**, deci `pg_advisory_xact_lock` din spec, implementat literal în handler,
      s-ar fi eliberat între apeluri și n-ar fi protejat nimic
- [x] RLS pornit fără politici + `revoke all` → `anon` n-are acces la nimic
- [x] Tokenii se generează prin `DEFAULT gen_token()`, deci calea care picase pe
      `not null` la walk-in nu mai există
- [x] `tests/db/state-machine.sql` — **26/26 aserțiuni trec**
- [x] `tests/db/race.sh` — **20/20 runde**, un singur câștigător per loc
- [x] Verificat că testul de cursă are dinți: fără lock → 10 câștigători pe 1 loc, 34 confirmați
- [x] `tests/db/run.sh` — Postgres temporar, migrație de la zero, suita completă (`npm run test:db`)
- [ ] `src/lib/supabase.ts` — client cu service role, tipat pe funcțiile RPC
- [ ] Aplicat pe proiectul Supabase real

## F2 — Copy și tokens

- [x] `src/content/copy.ts` — toate cele 17 secțiuni + stările de răspuns + meta
- [x] `src/content/form-schema.ts` — 6 câmpuri de bază + Set B (Q1–Q5) + bife
- [x] `src/styles/tokens.css` — paletă corectată, scală fluidă ancorată la 360px
- [x] `scripts/check-contrast.mjs` — **13/13 perechi trec**
- [x] `tests/copy-invariants.test.ts` — **50/50 trec**
- [x] Fonturi self-hostate, subset `latin` + `latin-ext` (B7) — `scripts/fetch-fonts.mjs`
- [x] Fonturi **variabile**, nu statice: 236 KB în loc de 453 KB, toate greutățile

## F3 — Pagina

- [x] `src/layouts/Base.astro` — meta, OG absolut, JSON-LD Event cu offset EEST explicit
- [x] §01–§17, componentă per secțiune, tot textul din `copy.ts`
- [x] `scripts/screenshots.mjs` — 5 breakpoint-uri + audit automat
- [x] **Zero defecte**: fără scroll orizontal, fără erori de consolă, 1× H1,
      221 diacritice cu virgulă, 0 cu sedilă, toate țintele ≥44px
- [x] `tests/e2e/formular.spec.ts` — **16/16** pe mobil-360 și desktop
- [x] `astro check` — 0 erori, 0 avertismente, 0 sugestii
- [x] Build: 68 KB HTML cu CSS inline
- [x] **OG image 1200×630, sub 300KB (B5)** — construit, vezi „Gate-urile OG, B2, .ics"
- [x] Foto `public/ciprian-micu.jpg` — reală, la un eveniment, primită de la Ciprian
      (28 august 2026). Rotată automat (EXIF orientation 8), decupată 4:5 cu
      detecție de atenție (libvips), 880×1100, 94KB. §11 randează complet acum.

### Design vizual — 3D și motion (28 august 2026, cerut explicit de Ciprian)

Feedback inițial („sterilă, doar text, nimic grafic") rezolvat într-o primă trecere
(fonturi, tokens, structură §01-§17). A doua cerere, separată: efect 3D pe fiecare
secțiune/card + animații de scroll mai prezente. **Obiecție ridicată explicit înainte de
implementare** (risc de performanță pe 4G/WhatsApp in-app, risc de clișeu „AI-generated" —
tilt 3D universal e la fel de comun ca glassmorphism-ul), propusă o variantă calibrată.
**Ciprian a ales explicit varianta cerută inițial**, nu cea recomandată — vezi
`docs/DECIZII.md` § „Efecte 3D pe carduri și secțiuni" pentru argumentul complet.

- [x] `tokens.css` — reveal-ul global (`data-reveal`) trecut de la `translateY(8px)` la
      intrare cu perspectivă 3D reală (`perspective(900px) translateY(22px) rotateX(7deg)`)
- [x] `data-reveal` extins la 13 din 17 secțiuni (S02-S15, minus S01 hero/S16 formular/S17
      footer — excluse deliberat, vezi motivele în `DECIZII.md`)
- [x] Tilt 3D interactiv (`data-tilt`, urmărește cursorul) pe cele două grile de carduri
      reale — S09 (zonele de use-case) și S06 (blocurile numerotate, restilizate ca
      oarde cu bordură+umbră ca să aibă unde să „poarte" efectul)
- [x] **Capcană tehnică găsită și reparată înainte să ajungă pe ecran**: reveal (560ms) și
      tilt (150ms) ar fi concurat pe `transform`/`transition` pe ACELAȘI element — regula
      CSS mai specifică ar fi câștigat tot lanțul, iar tilt-ul ar fi devenit la fel de lent
      ca intrarea. Fix: separate pe două elemente DOM (`.zona`/`.bloc` cu data-reveal,
      `.zona-tilt`/`.bloc-tilt` cu data-tilt), nu prin trucuri de specificitate.
- [x] **Al doilea bug găsit după raportarea lui Ciprian** („încă tot nu e acolo"): tilt-ul
      era dezactivat deliberat pe touch (corect, ca să nu ceară `touchmove`+`preventDefault`
      și să blocheze scroll-ul) — dar rezultatul practic era că efectul cerut explicit
      era invizibil pe telefonul lui, dispozitivul de test. Fix: tilt scurt la
      `touchstart`/`touchend` (`{ passive: true }`, nu blochează scroll-ul niciodată).
- [x] Verificat cu evenimente touch REALE prin CDP (`Input.dispatchTouchEvent`), nu
      `locator.tap()` — acela e prea rapid ca să prindă starea din timpul atingerii.
- [x] `tests/e2e/motion.spec.ts` — 4 teste noi (tilt pe hover desktop, tilt pe touch,
      revine curat la ieșire/ridicare deget) + toate cele 5 teste vechi tot verzi
      (reduced-motion, fără JS, non-repetare la scroll înapoi)
- [x] Trecere de critică vizuală, secțiune cu secțiune, la cererea lui Ciprian („vezi ai cu
      front end designer ce se mai poate ajusta"): singurul gol vizual real identificat era
      §11 fără fotografie — restul paginii e deliberat fără carduri (decizie originală de
      design, nu omisiune), confirmat corect să rămână așa.
- [x] Verificat: `npm run check` (0 erori/66 fișiere), 38/38 teste e2e (Playwright,
      mobil-360 + desktop), 135/135 teste unitare, `npm run contrast` (18/18), build de
      producție complet, screenshot-uri mobil 390px + desktop 1280px.

## F4 — Înscriere — GATA, verificat end-to-end pe stack-ul real

- [x] `src/lib/supabase.ts` — client + înveliș tipat peste toate funcțiile RPC
- [x] `src/lib/turnstile.ts` — siteverify, verificat manual cu ambele chei de test
      Cloudflare (always-pass ȘI always-block — confirmat că respinge real)
- [x] `src/lib/rate-limit.ts` — IP hash-uit (SHA-256, în Worker) → bucket Postgres opac
- [x] `supabase/migrations/0002_rate_limit.sql` — fereastră fixă, atomică (`INSERT..ON
      CONFLICT..RETURNING`). Cloudflare KV nu era accesibil în sesiune (token expirat) —
      mutat în Postgres, mai consistent cu restul proiectului oricum.
- [x] `src/inngest/client.ts` — evenimente tipate (Zod = StandardSchemaV1, nativ în Zod 4),
      `isDev: import.meta.env.DEV` (nu `INNGEST_DEV` — determinist, fără variabilă în plus)
- [x] `POST /api/register` — ordinea: rate limit → Zod → Turnstile → Supabase → Inngest,
      cea mai ieftină verificare prima. JSON pentru fetch, redirect 303 pentru no-JS.
- [x] `/multumesc`, `/lista-asteptare` — `CardRaspuns.astro` extras după al doilea duplicat
- [x] Idempotency pe `inngest.send()` (B10) — `id: reg-${registration_id}` /
      `wait-${registration_id}`; dovedește și B4 „retrimite email idempotent" gratis:
      re-emiterea pe duplicat e no-op dacă a rulat deja, recuperare dacă nu

**Trei bug-uri reale, găsite DOAR prin testul end-to-end prin API (nu de local/SQL):**

1. `ALERT_EMAIL` obligatoriu în schema `astro:env`, dar gol → bloca ÎNTREAGA aplicație,
   nu doar reconcilierea B11 care-l va folosi. Făcut opțional; verificarea corectă se
   face la punctul unde chiar contează (F6), nu la pornire.
2. `register_participant` întorcea status sintetic `'duplicat'` pentru orice reînscriere,
   indiferent de starea reală. Cineva `reconfirmat` care redeschide link-ul de înscriere
   ar fi văzut „te-ai înscris" în loc de „ne vedem miercuri" — migrația 0003 întoarce
   starea REALĂ + `este_nou`, ruta API decide ecranul din ambele.
3. `gen_token()` nu găsea `gen_random_bytes` pe Supabase real — pgcrypto e instalat în
   schema `extensions` acolo, nu `public` ca pe Postgres-ul vanilla local. Migrația 0004
   dă funcției propriul `search_path`, independent de search_path-ul apelantului.
   Test dedicat care verifică asta cu `search_path = pg_temp`, nu doar cu valoarea corectă.

**Verificat prin API real, împotriva Supabase de producție** (date de test șterse după):
înscriere reușită → rând corect + eveniment livrat la Inngest Dev Server cu id-ul de
idempotență corect · dublă înscriere → un singur rând, status real · Turnstile respinge
cu cheia „always-block" · rate limit: 12 treceau, a 13-a → 429 · validare Zod pe câmpuri
lipsă/invalide → mesaje corecte, în vocea paginii.

- [x] `tests/form-schema.test.ts` — 18 teste, validare pură (fără `astro:env`)
- [ ] E2E automat prin `/api/register` — **decizie deliberată, nu omisiune**: ar polua
      Supabase-ul real cu rânduri de test la fiecare rulare. Logica SQL e acoperită de
      `tests/db/`, logica de graniță (Turnstile/rate-limit) verificată manual mai sus.

## F5 — Emailuri — GATA, textele aprobate

- [x] `docs/EMAILURI.md` — toate cele 7 texte, **aprobate de Ciprian pe 28 august**.
      Cele 4 puncte deschise, tranșate: poziția pe listă scoasă din email 5 (sistemul
      nu e FIFO — cifra ar fi promis o ordine care nu există), email 7 formulare
      condițională („dacă mai organizez"), semnătura „Ciprian Micu - Deep Logic"
      peste tot, `EMAIL_FROM` actualizat în `.env`/`.dev.vars`/`.env.example` să
      corespundă.
- [x] **Verificare de deliverability, live** (cerută explicit): SPF pe
      `send.deeplogic.ro`, DKIM pe `deeplogic.ro`, DMARC `p=none` — toate confirmate
      din contul Resend + DNS live, nu presupuse. Subiectele celor 7 emailuri
      verificate manual pe cuvinte-declanșator de spam — curate. List-Unsubscribe
      header: decis să NU se adauge (sub pragul de „bulk sender", opt-out real deja
      prin „Nu mai pot veni" în fiecare email).
- [x] Subsol comun adăugat la toate cele 7 (organizator + motiv pentru care a
      primit mailul) — semnal de legitimitate pentru filtre, gratis.
- [x] `src/emails/templates.ts` — toate cele 7, transcrise fidel din `docs/EMAILURI.md`
- [x] `src/emails/render.ts` — text + HTML, CSS inline, fără fonturi externe
- [x] `src/lib/resend.ts` — idempotency key pe fiecare trimitere, batch pentru broadcast
- [x] **Trimitere reală, verificată** — toate cele 4 emailuri din ciclul principal livrate
      cu succes (`delivered@resend.dev`), la momentele corecte, conținut corect (verificat
      prin descărcarea efectivă a corpului email-ului din Resend)

## F6 — Ciclul Inngest — GATA, verificat end-to-end pe stack-ul real

- [x] `src/inngest/schedule.ts` — sursă unică pentru cele 3 momente fixe
- [x] `src/inngest/functions/registered.ts` — 4 × `sleepUntil`, cu verificare de stare
      înainte de fiecare pas (cineva poate anula prin linkul din orice email anterior)
- [x] `workshop/registered` conține linkul de anulare încă din email 1 (B3)
- [x] `markWelcomeSent()` apelat după email 1 — coloana pentru reconcilierea B11 (F-viitor)
- [x] **Rulat cu date comprimate, live, pe Supabase + Resend + Inngest Dev Server reale** —
      nu doar local/mockuit. Ciclul complet (înscriere → email1 → reconfirmare → email2 →
      cutoff → email3+.ics → check-in-send → email4) verificat cap-coadă, cu emailuri
      livrate real și conținut inspectat.

**Un bug real găsit DOAR la verificarea live, cu conținutul efectiv al atașamentului:**
API-ul Resend cere `content` codificat base64 pentru atașamente — SDK-ul NU convertește,
doar transmite mai departe orice primește. Codul trimitea `.ics`-ul ca text brut; Resend
l-a interpretat CA base64 și l-a „decodat", producând un fișier de 162 de octeți, garbage
binar, în loc de cei ~929 reali — fără nicio eroare, livrare marcată „delivered". S-ar fi
văzut abia când cineva deschidea efectiv atașamentul. Fix: `src/lib/attachments.ts`,
codificare centralizată, cu test care reproduce exact garbage-ul găsit dacă encoding-ul
lipsește (`tests/attachments.test.ts`). Reverificat live după fix: 929 octeți, `.ics` valid,
recunoscut ca atare de `file`.

## F7 — Waitlist — GATA, verificat end-to-end

- [x] `src/inngest/functions/waitlisted.ts` — trimite email 5, fără poziție pe listă
      (decizia din 28 august — sistemul nu e FIFO)
- [x] `src/inngest/functions/seat-freed.ts` — `debounce` (2min) + `singleton`, ambele pe
      `event_slug` (B1). Interoghează starea reală (nu numără evenimente) pentru numărul
      corect de locuri.
- [x] `src/inngest/functions/leftover-waitlist-notice.ts` — declanșat manual (event-based,
      nu cron — e o rulare unică, nu recurentă)
- [x] **Verificat live**: no-show la cutoff → `seat_freed` emis → broadcast către waitlist
      (`workshop/seat_freed` → `email6SeatFreed`, confirmat în log-urile Inngest cu
      `external_id` de idempotență corect)
- [x] Cursa cu `pg_advisory_xact_lock` — deja verificată în F1 (20/20 runde)

**Corecție de design, găsită înainte să fie scrisă funcția, nu după:** `expire_unconfirmed()`
original (migrația 0001) era un sweep în bloc — dar arhitectura reală are o instanță Inngest
PER înscriere, care are nevoie să știe dacă PROPRIUL rând s-a schimbat, nu un total agregat.
Migrația 0005 înlocuiește cu `expire_if_unconfirmed(registration_id)`, per rând.

## F8 — Răspuns și check-in (parțial — fără `/checkin-loc`, amânat deliberat)

- [x] `GET /raspuns` (doar pagină, cu buton de confirmare) + `POST /api/raspuns` (mută
      starea) — B2 aplicat, verificat: reconfirmare reală prin API, funcțională
- [x] `/api/raspuns` emite `workshop/seat_freed` la anulare REALĂ (nu la `deja`) — a doua
      jumătate a fixului B1, cea care lipsea din F4
- [x] `GET /checkin` + `POST /api/checkin` — ACEEAȘI regulă B2 aplicată, deliberat, deși
      spec-ul original lista `GET /checkin` ca rută unică mutantă (risc mai mic, dar
      consecvența cu regula generală bate o excepție motivată „doar de data asta")
- [x] `src/pages/rezultat.astro` — ecran generic, un singur fișier pentru toate cele 6 stări
      posibile (reconfirmat/anulat/locRevendicat/locLuat/tokenInvalid/checkinReusit),
      cu link de calendar pe ecranele care-l cer
- [ ] `/checkin-loc` (walk-in QR) — **amânat deliberat**, zero interacțiune cu ciclul
      Inngest, funcționalitate strict de ziua evenimentului

## F9 — Legal

- [x] `/termeni`, `/confidentialitate` — construite din `legal/*.md` (texte deja redactate
      de Ciprian, găsite în proiect, nu draft nou). Layout comun `src/layouts/Legal.astro`.
- [x] Cross-check copy vs. cod, înainte de publicare — 4 mismatch-uri găsite și corectate în
      `legal/Politica_de_Confidentialitate_DeepLogic.md`:
      - §2.1 nu declara setul de 5 întrebări de calificare (Q1–Q5) pe care formularul chiar
        le colectează — adăugat.
      - §2.2 descria două bife opționale („marketing" + „newsletter") — formularul are UNA
        singură (`vrea_discutie`, „Vreau o discuție"), și încă din F4 decizia fusese explicit
        să evităm semnalul „urmează un apel de vânzare". Rescris ca să reflecte bifa reală.
      - §2.4 declara WhatsApp ca și canal Deep Logic → participant — fals: formularul nu
        colectează telefon, ciclul Inngest trimite exclusiv email. Corectat + eliminat
        „WhatsApp Business" din tabelul de procesatori (§3), transferul internațional (§4) și
        securitate (§8). WhatsApp rămâne documentat corect ca și canal de DISTRIBUIRE
        peer-to-peer a linkului, nu de comunicare inițiată de Deep Logic.
      - §5 declara la timpul prezent o „automatizare dedicată" de ștergere a datelor la
        expirarea termenului de 1 an — verificat, nu exista în cod. Decizia lui Ciprian
        (după ce i s-a semnalat): **construim automatizarea reală**, nu doar reformulăm
        textul. Vezi „Retenția de 1 an — construită și verificată" mai jos. §5 a rămas la
        timpul prezent, corect din nou, pentru că acum chiar e adevărat.
      `Termeni_si_Conditii_DeepLogic.md` — o singură observație, nu corectată: §3 declară
      „minimum 18 ani, confirmat prin înscriere", fără câmp sau bifă de vârstă în formular.
      Formulare juridică standard (confirmare implicită prin actul înscrierii), nu o
      contradicție tehnică precum celelalte — semnalată lui Ciprian, nu schimbată unilateral.
- [x] Verificat: `npm run check` (0 erori/64 fișiere), `npm run build` (toate rutele
      prerandate static compilează), `npm run contrast` (18/18 perechi peste prag), 0 erori
      consolă Playwright pe /termeni + /confidentialitate la 360px și 1280px.
- [x] Tabelul de procesatori (§3 confidențialitate) — verificat prin DOM, nu vizual: la
      360px scrolează intern (`scrollWidth` 512 > `clientWidth` 319, `overflow-x: auto`),
      iar `body.scrollWidth` rămâne egal cu viewport-ul — zero scroll orizontal pe pagină.

### Retenția de 1 an — construită și verificată, nu doar reformulată

Migrația `0006_retention.sql`: 3 coloane noi pe `contacts` (`retention_notice_sent_at`,
`retention_reconfirmed_at`, `retention_token`) + 4 funcții atomice
(`find_contacts_due_for_retention_notice`, `mark_retention_notice_sent`,
`reconfirm_retention`, `purge_expired_retention`), toate cu `security definer` +
`revoke ... from public, anon, authenticated`, exact tiparul din 0001. Scop pe `contacts`,
nu pe `event_registrations` — politica promite ștergerea datelor personale, care trăiesc pe
contact; `on delete cascade` ia cu el și înscrierile. **Limitare cunoscută, deliberat
neadresată**: la un al doilea eveniment viitor, ștergerea unui contact ar lua cu ea și o
înscriere recentă la evenimentul nou — arhitectura multi-eveniment e explicit în afara
scopului (vezi „Ce a rămas deliberat în afara scopului").

- [x] `src/inngest/functions/retention-sweep.ts` — cron zilnic, `TZ=Europe/Bucharest 0 9 * * *`,
      nu event-triggered (spre deosebire de restul ciclului, legat de datele fixe ale
      evenimentului — retenția n-are ancoră de calendar). Curăță expirații, apoi notifică
      scadenții, un `step.run` per contact (idempotency key `email8/${contact_id}`).
- [x] `GET /pastreaza-datele` + `POST /api/pastreaza-datele` — regula B2, identică cu
      `/raspuns` și `/checkin`: GET doar randează, POST mută starea. Rate limiting propriu
      (`pastreaza-datele`, 20/15min).
- [x] Stare nouă `datePastrate` în `copy.ts` / `rezultat.astro`.
- [x] `tests/db/retention.sql` — scadență, notificare-o-singură-dată, reconfirmare care
      repornește ceasul, curățenie doar după fereastra de răspuns, cascadă către
      înscrieri. Rulează în `tests/db/run.sh`, alături de restul suitei DB.
- [x] `tests/emails.test.ts` — 7 teste noi pentru email 8, separate deliberat de `TOATE`
      (array-ul „cele 7 aprobate"), ca distincția draft/aprobat să rămână vizibilă și în teste.
- [x] **Verificat LIVE, pe proiectul Supabase real** (`mwmkggktwlxlrokbvgwx`), nu doar local:
      migrația aplicată, `get_advisors` — doar cele 3 notice-uri INFO deja cunoscute, nimic
      nou; contact de test cu `created_at` vechi de 400 de zile → apare corect ca scadent;
      `POST /api/pastreaza-datele` cu tokenul lui, prin dev server real → `retention_reconfirmed_at`
      setat, dispare din lista de scadenți; `purge_expired_retention()` șterge exact contactul
      notificat acum 40 de zile, lasă neatinse cel reconfirmat și cel nenotificat.
- [x] **Emailul 8 trimis real** prin Resend (`delivered@resend.dev`) — status confirmat
      **„delivered"** (nu doar acceptat de API), conținut byte-identic cu ce randează codul.
      **Aprobat de Ciprian pe 28 august 2026**, fără modificări — vezi `docs/EMAILURI.md` § Email 8.
- [x] Toate datele de test șterse din Supabase după verificare — 0 contacte, 0 înscrieri
      rămase în proiectul real.

## F10 — QA și code review

- [ ] R1 (după F4) — suprafața de intrare
- [ ] R2 (după F7) — mașina de stări și concurența
- [ ] R3 (după F9) — fluxul complet, cross-check de copy

---

## Gates de lansare

- [x] `LEGAL` — Termeni + Confidențialitate publicate și linkate din bifă (F9), inclusiv
      automatizarea de retenție de 1 an promisă în §5, construită și verificată live — nu
      mai e doar text. Politica de Confidențialitate corectată, confirmată de Ciprian
      (28 august 2026). Emailul 8 aprobat, fără modificări (28 august 2026). **Gate complet.**
- [x] `EMAIL` — SPF/DKIM/DMARC verzi + cele 4 emailuri din ciclul principal livrate real,
      cu succes, conținut verificat. Rămâne doar deschiderea vizuală pe Gmail mobil/Outlook
      (test cosmetic, nu funcțional).
- [x] `OG` — imaginea `public/og-workshop-16-09.png` (1200×630, 39.8KB, sub pragul de 300KB)
      construită și livrată — nu mai lipsea doar textul, lipsea fișierul. Randată din
      `src/pages/og-card.astro` (fonturile reale ale site-ului, nu o aproximare) prin
      `scripts/genereaza-og.mjs` (Playwright, screenshot 1200×630). Verificat prin pixeli,
      nu vizual: zero artefacte în fișierul final. Rămâne un singur pas, imposibil de făcut
      din acest scaun: trimis efectiv pe WhatsApp către un telefon real, de către Ciprian.
- [x] `CONCURENȚĂ` — 20/20 rulări, un singur câștigător; verificat că testul pică fără lock
- [x] `B1` — complet: `debounce`+`singleton` pe `seat-freed.ts`, verificat live (no-show la
      cutoff → un singur `seat_freed` → broadcast).
- [x] `B2` — verificat LIVE pe Supabase real: 5 cereri GET pe `/raspuns?...&r=nu` (inclusiv cu
      user-agent Outlook Safe Links) → status neschimbat; `POST` ulterior → mută corect starea.
      Aceeași verificare pe `/checkin`. Plus test automat de regresie,
      `tests/e2e/b2-siguranta-get.spec.ts` (intercepție de rețea: zero cereri către rutele
      API doar din încărcarea paginii), acoperă și `/pastreaza-datele`.
- [x] `CONTRAST` — 13/13 perechi peste prag
- [x] `DIACRITICE` — 221 caractere ș/ț cu virgulă randate corect pe toate cele 5 breakpoint-uri, 0 cu sedilă
- [x] `.ics` — RFC 5545 verificat de `tests/ics.test.ts` (12 teste: VTIMEZONE, TZID, regula
      EU de schimbare a orei, line-folding). Cross-check independent cu `node-ical` (bibliotecă
      terță, nu codul propriu care generează fișierul) pe `public/eveniment.ics` real: rezolvă
      exact la 14:00 Europe/Bucharest = 11:00 UTC. Rămâne, ca și la OG, un pas de mână: import
      real în Google/Apple/Outlook — solid acoperit programatic, dar nedeschis fizic în cele
      trei aplicații.
- [x] `COPY` — 49/49 invarianți trec

---

## Blocat pe Ciprian

Toate cele 5 credențiale sunt rezolvate (Resend, Cloudflare, Supabase, Turnstile, Inngest —
vezi F0). Rămân doar assets și decizii de conținut:

1. **Review `docs/EMAILURI.md`** (emailurile 1-7) înainte să intre în cod.
2. **Verificat** în `copy.ts`: `footer.linkedin` e o presupunere — confirmă URL-ul real.
3. **`ALERT_EMAIL`** gol în `.env` — unde ajung alertele de reconciliere (B11)? Nu mai
   blochează (F4 l-a făcut opțional), dar tot trebuie completat înainte de F6.
4. **Decizia de a publica pe `workshop.deeplogic.ro`** — tehnic posibil oricând: `wrangler`
   CLI e autentificat (`ciprian.micu@gmail.com`, drepturi de scriere pe Workers), verificat
   28 august. Domeniul arată încă eroarea veche („Worker threw exception", niciodată
   publicat cu codul real) până la un `wrangler deploy` explicit. Ciprian a ales să rămână
   pe tunel (`cloudflared`) până sunt gata toate gate-urile — nepublicat DELIBERAT, nu blocat
   tehnic. (Notă separată: tokenul plugin-ului MCP Cloudflare din Claude Code a expirat —
   irelevant pentru deploy, care merge prin `wrangler` CLI, autentificat separat.)

**Rezolvat**: foto `public/ciprian-micu.jpg` (28 august) — reală, la un eveniment, decupată
4:5 automat. §11 randează complet.

**Rezolvat**: Politica de Confidențialitate (corectată, confirmată 28 august) și emailul 8
(aprobat, fără modificări, 28 august) — vezi F9 și `docs/DECIZII.md`. Opțional, netratat:
`Termeni_si_Conditii` §3 („minimum 18 ani") n-are verificare de vârstă în formular —
formulare juridică standard, semnalată, nu schimbată unilateral.
