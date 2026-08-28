# Decizii — workshop.deeplogic.ro

Log viu. Fiecare decizie care nu se poate deduce din cod sau din cele două documente sursă.
Când o decizie se schimbă, se editează rândul și se notează data — nu se șterge.

---

## Deciziile de produs (27 august 2026)

| # | Decizie | Motiv | Unde s-a aplicat |
|---|---|---|---|
| **D1** | Stack = spec-ul tehnic, nu nota din landing | `landing-*.md` §16 spunea „n8n → Baserow"; `spec-tehnic-*.md` (scris ulterior, cu 9 decizii confirmate) spune Astro + Supabase + Inngest + Resend. Nota e rămășiță. | tot proiectul |
| **D2** | Un singur release, nu lansare fazată | Alegerea lui Ciprian. Build-ul rămâne secvențiat intern. | vezi `PROGRES.md` |
| **D3** | Subdomeniu `workshop.deeplogic.ro`, proiect nou | Izolare completă față de site-ul existent. | `astro.config.mjs`, `wrangler.jsonc` |
| **D4** | Set B de calificare — 5 întrebări, toate radio | Alegerea lui Ciprian. Radio, nu text: un textarea obligatoriu e deja cel mai mare punct de abandon pe mobil. | `src/content/form-schema.ts` |
| **D5** | „în 24 de ore" înlocuiește „în aceeași zi" | Angajament operațional real: 25 de documente de produs după 3 ore de workshop. Pe pagina în care miza declarată e credibilitatea, o promisiune ratată pe primul livrabil costă mai mult decât câștigi din formularea tare. | §08, §14, §15 |
| **D6** | Adresa exactă intră pe pagină | Spec-ul o avea deja. Redusă fricțiune la înscriere; alimentează și `.ics` și JSON-LD. | §13 |
| **D7** | Cheat-sheet tipărit = ITEM 5 în §08 | Ieftin de produs, întărește a doua cea mai importantă secțiune. | §08, §14 |
| **D8** | Blocul despre faliment (§11) — **nu** se activează | Decizia lui Ciprian. Expunere personală. | §11 |
| **D9** | Fără testimoniale | Nu există pe formatul ăsta. §12 rămâne exact cum e scris, inclusiv ultima propoziție. | §12 |
| **D10** | Textele celor 7 emailuri — scrise de Claude, revizuite de Ciprian | Punct deschis #2 din spec. | `docs/EMAILURI.md` |
| **D11** | Pagini legale — lipsesc, se generează draft | Singurul asset absent. Gate de lansare. | `/termeni`, `/confidentialitate` |

---

## Deciziile tehnice — corecții față de spec

Fiecare rezolvă un defect găsit la analiza documentelor. Numerotarea `B*` e cea din planul de producție.

| # | Defect în spec | Decizie |
|---|---|---|
| **B1** | La cutoff-ul de 11:00, fiecare tranziție spre `no_show` emite separat `seat_freed` → cu 8 nereconfirmați, fiecare om de pe waitlist primește 8 emailuri identice | `debounce: { period: '2m', key: event_slug }` + `singleton` pe aceeași cheie. Emailul spune câte locuri s-au eliberat, nu „un loc". |
| **B2** | `GET /raspuns?…&r=nu` mută stare — Outlook Safe Links și scanerele antivirus fac prefetch | `GET` randează doar o pagină de confirmare; starea se mută exclusiv prin `POST /api/raspuns`. |
| **B3** | Nicio cale de anulare între email 1 și email 2 → un loc poate sta blocat 17 din 20 de zile | Email 1 conține și linkul „nu mai pot veni". |
| **B4** | Double-submit protejat în DB, dar fără UX definit → eroare 500 pe un om deja înscris | Conflict detectat → 200 cu ecranul `stari.dejaInscris` + retrimitere idempotentă a emailului 1. |
| **B5** | OG image / meta tags absente din ambele documente, deși >40% din trafic vine din WhatsApp | `meta` în `copy.ts`; OG image 1200×630 sub 300KB; testat prin trimitere reală. |
| **B6** | Paleta pica WCAG AA în patru puncte | Valori corectate, verificate cu `npm run contrast`. Vezi tabelul de mai jos. |
| **B7** | Diacritice: ș/ț cu virgulă sunt în `latin-ext`, nu în `latin` default | Fonturi self-hostate, subset `latin` + `latin-ext`. Test de invarianți respinge sedila. |
| **B8** | `no_show` acoperea și „a anunțat" și „a dispărut" | Status `anulat` nou în check constraint. |
| **B9** | `.ics` fără `VTIMEZONE` → oră greșită în calendarele cu alt fus | `DTSTART;TZID=Europe/Bucharest` + bloc `VTIMEZONE` complet. |
| **B10** | Retry pe `inngest.send()` putea produce două emailuri de confirmare | `id` de idempotență pe event: `reg-${registration.id}`. |
| **B11** | Supabase reușit + Inngest eșuat definitiv = om în DB fără niciun email, tăcut | Coloană `welcome_sent_at` + job de reconciliere + alertă. |
| **B12** | Lipsea copy pentru starea waitlist — al 31-lea om vedea „Gata, îți trimit confirmarea" | `stari.asteptare` în `copy.ts`. |
| **B13** | Turnstile absent pe `/checkin-loc` | Adăugat. |
| **B14** | Email 4 (check-in) la 14:00 fix, ora de start — oamenii ajung la 13:45 | Mutat la 13:30. |
| **B15** | Fără index pe query-ul de capacitate | `index on event_registrations (event_slug, status)`. |
| **B16** | „Îți iau 60 de secunde" devenea neadevărat cu 11 câmpuri | „Îți ia două minute". |
| **B17** | `proces` textarea obligatoriu fără prag → primești „." | `minLength: 15` + mesaj de eroare cu exemplu. |
| **B18** | Fără analytics — nicio măsurătoare pentru workshopul următor | Cloudflare Web Analytics: cookieless, fără banner. |

### Paleta — de ce s-a schimbat

Verificat cu `npm run contrast`. Patru valori din documentul original picau pragul WCAG AA de 4.5:1 pentru text normal.

| Original | Ratio | Înlocuit cu | Ratio nou |
|---|---|---|---|
| `#468984` (CTA) | 4.06 pe alb | `#376A66` | 6.15 alb / 4.94 secundar |
| `#B85C5C` (eroare) | 4.45 pe alb | `#9E4B4B` | 5.90 alb / 4.74 secundar |
| `#2F4F4F` @ 70% ≈ `#6B7F7F` | 4.23 pe alb | `#637474` | 4.91 pe alb |
| `#3A716D` (prima corecție a CTA) | 4.49 pe fundal secundar | respinsă | — |

`#3A716D` merită notat: trecea pe alb (5.58) și pica pe `#E4E7E7` (4.49) — fundalul din §03 și footer.
Scriptul de contrast a prins-o; ochiul liber nu ar fi prins-o. `#468984` rămâne în paletă
ca **accent decorativ**, permis doar la ≥24px sau pe elemente non-text.

---

## F4 — Înscriere (27 august 2026, sesiune cu credențiale conectate)

| # | Decizie | Motiv |
|---|---|---|
| **D12** | Rate limiting în Postgres, nu Cloudflare KV | Tokenul MCP Cloudflare a expirat în sesiune — n-am putut provizona un namespace KV nou. Mutat în Postgres, unde toată logica atomică trăiește oricum. Fereastră fixă, `INSERT..ON CONFLICT..RETURNING` atomic. Dacă Cloudflare Rate Limiting devine disponibil mai târziu, rămâne linia a doua de apărare — Turnstile e prima. |
| **D13** | IP-ul hash-uit în Worker, niciodată brut în Postgres | `crypto.subtle.digest` local, Postgres primește doar `register:a3f9…`. Logurile bazei de date nu conțin identificatori personali reutilizabili. |
| **D14** | Pragurile de rate limit: 12/15min (register), 20/15min (răspuns, check-in) | Generoase deliberat — Turnstile e prima linie reală de apărare (token per-cerere, greu de scriptat). Pragurile trebuie să încapă un birou/familie în spatele aceluiași NAT. |
| **D15** | `register_participant` întoarce statusul REAL, nu `'duplicat'` sintetic | Găsit înainte de a fi folosit: API-ul are nevoie de starea reală ca să aleagă ecranul corect. Migrația 0003. |
| **D16** | Idempotency Inngest (`id: reg-${id}`) dublează ca fix pentru B4 | Re-emiterea evenimentului la reînscriere e no-op dacă a rulat deja, recuperare dacă emiterea inițială eșuase (B11). Niciun cod separat de „retrimite email". |
| **D17** | Fără E2E automat prin `/api/register` împotriva Supabase real | Ar polua baza de producție cu rânduri de test la fiecare rulare de CI. Logica SQL: `tests/db/`. Granița de rețea (Turnstile, rate limit): verificată manual, cu date de test șterse după. |

### Trei bug-uri găsite DOAR la testul end-to-end prin API (nu la nivel local/SQL)

1. **`ALERT_EMAIL` obligatoriu bloca toată aplicația.** Schema `astro:env` validează
   toate câmpurile la fiecare cerere, nu doar cele folosite pe calea curentă — un câmp
   necompletat oprea totul, nu doar reconcilierea B11 care încă nu există. Făcut opțional.
2. **`register_participant` → `'duplicat'` sintetic** (vezi D15 mai sus).
3. **`gen_token()` nu găsea `gen_random_bytes` pe Supabase.** pgcrypto e instalat în
   schema `extensions` pe Supabase, `public` pe Postgres vanilla local — diferență de
   mediu pe care testul local n-o putea reproduce fără o schemă `extensions` reală.
   Migrația 0004: `gen_token()` primește propriul `search_path`, independent de
   search_path-ul apelantului. Testul care-l verifică setează `search_path = pg_temp`
   explicit, nu doar rulează cu valoarea implicită corectă.

---

## F6/F7/F8 — Ciclul Inngest (28 august 2026)

| # | Decizie | Motiv |
|---|---|---|
| **D18** | `expire_unconfirmed()` (bulk) înlocuit cu `expire_if_unconfirmed(id)` (per rând) | Găsit înainte de a scrie funcția Inngest care-l apelează: arhitectura reală are o instanță PER înscriere, care are nevoie să știe dacă PROPRIUL rând s-a schimbat, ca să decidă dacă emite `seat_freed`. Un sweep în bloc nu spune asta unei instanțe individuale. Migrația 0005. |
| **D19** | `/checkin` urmează aceeași regulă B2 (GET randează, POST mută) ca `/raspuns` | Spec-ul original lista `GET /checkin` ca rută unică mutantă — risc mai mic decât la anulare (check-in e idempotent, nimic nu se propagă în cascadă). Dar regula din CLAUDE.md e generală. Consecvența costă un tap în plus la ușă; excepțiile „doar de data asta" sunt exact cum se strecoară bug-urile de genul B2. |
| **D20** | `leftover-waitlist-notice` declanșat manual (event), nu cron | E o rulare unică, nu recurentă — sintaxa de cron e făcută pentru recurență, nu pentru „o singură dată, pe 17 septembrie". Mai simplu și mai sigur declanșat explicit din dashboard-ul Inngest. |
| **D21** | `/checkin-loc` (walk-in QR) amânat, nu construit acum | Zero interacțiune cu ciclul Inngest, funcționalitate strict de ziua evenimentului. Scop bine delimitat pentru sesiunea asta, fără să lase o gaură — nimic altceva nu depinde de el. |

### Bug găsit DOAR la verificarea live, cu conținutul efectiv trimis (nu la citirea codului)

**Atașamentele Resend cer `content` base64, SDK-ul nu convertește.** Codul trimitea
conținutul `.ics` ca text brut prin câmpul `content`; API-ul Resend l-a interpretat CA
base64 și l-a „decodat" — rezultatul: un fișier de 162 de octeți, garbage binar complet,
livrat cu succes („delivered"), fără nicio eroare vizibilă în nicio parte a sistemului.
S-ar fi observat abia când cineva ar fi deschis efectiv atașamentul din email 3 — pe
pagina asta, exact genul de defect tăcut pe care testarea manuală, fără verificare de
conținut, nu l-ar fi prins niciodată.

Fix: `src/lib/attachments.ts`, encoding centralizat (o singură funcție, apelată din
`resend.ts`, niciun apelant nu mai poate uita pasul). Test dedicat
(`tests/attachments.test.ts`) care reproduce EXACT garbage-ul găsit dacă cineva scoate
encoding-ul din greșeală — verificat că testul are dinți: reintrodus bug-ul temporar,
testul a picat cu byte-for-byte același rezultat corupt văzut live, apoi restaurat fixul.
Reverificat împotriva Resend real după fix: 929 octeți, recunoscut ca `vCalendar calendar
file` valid de `file`, conținut byte-identic cu generarea locală.

### Metodologie de verificare — programul comprimat temporar

Pentru F6/F7, `src/inngest/schedule.ts` a fost modificat temporar la date apropiate
(secunde/minute, nu zile), ciclul rulat live împotriva Supabase + Resend + Inngest Dev
Server reale, apoi restaurat la datele de producție (14/16 septembrie). Aceeași tehnică
folosită la F5 pentru cheile Turnstile. Emailurile de test au mers către
`delivered@resend.dev` (adresa de test oficială Resend) sau `contact+tag@deeplogic.ro`
— toate datele de test șterse din Supabase după verificare.

**Notă necesară pentru sesiuni viitoare**: adresele `contact+tag@deeplogic.ro` (plus-adresare
pe domeniul propriu Deep Logic) au picat cu bounce în timpul testării — motivul nu ține de
cod, e specific mailbox-ului propriu al lui Ciprian, nu afectează adrese reale de
înscriere (Gmail și majoritatea providerilor suportă plus-adresarea normal pe partea de
RECEPȚIE). Nu s-a investigat mai departe — irelevant pentru producție, unde adresele vin
de la participanți, nu de la testare pe domeniul propriu.

---

## Ce a rămas deliberat în afara scopului

Din spec, plus deciziile de mai sus: arhitectura de replicare pentru agenții viitori · interfața
Notion peste `contacts` · trimiterea automată a materialelor post-workshop (rămâne manuală, către
segmentul `prezent`) · formularul de închidere din sală · blocul despre faliment (D8) · testimonialele
(D9) · textul de distribuire pentru membrii BIZZ.CLUB (**există deja scris** în `landing-*.md`,
secțiunea finală — e livrabil separat, nu intră pe pagină) · `/checkin-loc` walk-in prin QR (D21).
