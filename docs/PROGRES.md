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
- [ ] **OG image 1200×630, sub 300KB (B5)** — referențiat în `copy.ts`, fișierul lipsește
- [ ] Foto `public/ciprian-micu.jpg` — §11 rulează text-only până apare

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

- [ ] `/termeni`, `/confidentialitate` — draft de validat

## F10 — QA și code review

- [ ] R1 (după F4) — suprafața de intrare
- [ ] R2 (după F7) — mașina de stări și concurența
- [ ] R3 (după F9) — fluxul complet, cross-check de copy

---

## Gates de lansare

- [ ] `LEGAL` — Termeni + Confidențialitate publicate și linkate din bifă
- [x] `EMAIL` — SPF/DKIM/DMARC verzi + cele 4 emailuri din ciclul principal livrate real,
      cu succes, conținut verificat. Rămâne doar deschiderea vizuală pe Gmail mobil/Outlook
      (test cosmetic, nu funcțional).
- [ ] `OG` — card randat corect pe un telefon real, prin WhatsApp
- [x] `CONCURENȚĂ` — 20/20 rulări, un singur câștigător; verificat că testul pică fără lock
- [x] `B1` — complet: `debounce`+`singleton` pe `seat-freed.ts`, verificat live (no-show la
      cutoff → un singur `seat_freed` → broadcast).
- [ ] `B2` — prefetch pe linkul de anulare nu schimbă nicio stare
- [x] `CONTRAST` — 13/13 perechi peste prag
- [x] `DIACRITICE` — 221 caractere ș/ț cu virgulă randate corect pe toate cele 5 breakpoint-uri, 0 cu sedilă
- [ ] `.ics` — 14:00 EEST în Google + Apple + Outlook
- [x] `COPY` — 49/49 invarianți trec

---

## Blocat pe Ciprian

Toate cele 5 credențiale sunt rezolvate (Resend, Cloudflare, Supabase, Turnstile, Inngest —
vezi F0). Rămân doar assets și decizii de conținut:

1. **Pagini legale** (D11) — singurul asset absent. Propun draft în F9.
2. **Foto** `public/ciprian-micu.jpg` — reală, la lucru sau la un eveniment.
3. **Review `docs/EMAILURI.md`** înainte să intre în cod.
4. **Verificat** în `copy.ts`: `footer.linkedin` e o presupunere — confirmă URL-ul real.
5. **`ALERT_EMAIL`** gol în `.env` — unde ajung alertele de reconciliere (B11)? Nu mai
   blochează (F4 l-a făcut opțional), dar tot trebuie completat înainte de F6.
6. **Cloudflare re-autorizare** — tokenul MCP a expirat în sesiunea asta. N-a blocat F4
   (rate limiting mutat în Postgres), dar va fi nevoie de el pentru deploy (F6+).
