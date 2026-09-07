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
| **D4** | ~~Set B de calificare — 5 întrebări, toate radio~~ — **înlocuită de D55** (2026-09-03) | Alegerea lui Ciprian, la momentul respectiv. Radio, nu text: un textarea obligatoriu e deja cel mai mare punct de abandon pe mobil. | `src/content/form-schema.ts` |
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

### F9 — Politica de Confidențialitate găsită gata scrisă, corectată pe 3 puncte

Ciprian avea deja `legal/Termeni_si_Conditii_DeepLogic.md` și
`legal/Politica_de_Confidentialitate_DeepLogic.md`, redactate complet (identitate operator,
GDPR, drepturi, procesatori). Documente scrise ca șablon general Deep Logic (acoperă și
site-ul principal deeplogic.ro), nu specific pentru workshop — corect ca atare pentru
secțiunile despre companie.

Cross-check obligatoriu (§6.4 din planul original: „un copy care minte e un bug") a găsit
4 afirmații concret false despre ce colectează și ce face sistemul CHIAR construit în
sesiunea asta:

1. **§2.1** nu declara cele 5 întrebări de calificare (Q1–Q5, `form-schema.ts`) — formularul
   colectează mai multe date decât recunoștea politica.
2. **§2.2** descria două bife opționale distincte („marketing" + „newsletter"). Formularul
   are UNA (`BIFE.discutie`, id `vrea_discutie`, label „Vreau o discuție despre procesele
   mele") — și, mai important, decizia de la F4 fusese explicit să NU semnalăm „apel de
   vânzare" (§16 din spec-ul de copy). Cuvântul „marketing" în politică contrazicea propria
   decizie de produs.
3. **§2.4** declara WhatsApp ca și canal de comunicare Deep Logic → participant. Fals pe
   toată linia: formularul nu are câmp de telefon, iar ciclul Inngest (F6) trimite exclusiv
   email prin Resend. WhatsApp e corect doar ca și canal de DISTRIBUIRE a linkului între
   membri BIZZ.CLUB — Deep Logic nu-l folosește și nu-l poate folosi, neavând numărul
   nimănui. Eliminat și din tabelul de procesatori (§3), transferul internațional (§4) și
   securitate (§8) din același motiv.
4. **§5** declara la timpul prezent: „Curățenia bazei de date la expirarea termenului
   [1 an] este realizată printr-o automatizare dedicată." Verificat: nu există — cele 4
   funcții Inngest (`registered`, `waitlisted`, `seat-freed`, `leftover-waitlist-notice`)
   acoperă doar ciclul scurt al evenimentului, zero `pg_cron` sau job de retenție pe termen
   lung în migrațiile Supabase. Mai grav decât punctele 1–3: nu doar formulare descrisă
   greșit, ci un mecanism de ștergere promis public care, dacă lipsește, contrazice direct
   principiul de limitare a stocării din GDPR (art. 5.1.e).

   Prima mișcare a fost rapidă — trecut la viitor („va fi realizată"), automatizarea reală
   amânată în backlog (termenul natural era ~august 2027, primele date ajungând atunci la
   1 an). **Ciprian a respins soluția rapidă**: „O să construim automatizarea, promisiunea
   rămâne, cere și gdpr" — nu doar o corecție de copy, o cerere explicită de construi
   mecanismul real, acum, nu la termen.

   **Construit și verificat același ciclu**: migrația `0006_retention.sql` (3 coloane pe
   `contacts`, 4 funcții atomice `security definer`), `src/inngest/functions/retention-sweep.ts`
   (cron zilnic `TZ=Europe/Bucharest 0 9 * * *` — primul job din proiect care nu e legat de
   datele fixe ale evenimentului), rutele `/pastreaza-datele` + `/api/pastreaza-datele` (regula
   B2, identică cu restul), email 8 (draft, nesemnat de Ciprian — vezi mai jos). Verificat
   LIVE pe proiectul Supabase real (`mwmkggktwlxlrokbvgwx`), nu doar pe Postgres local:
   contact de test cu `created_at` backdatat 400 de zile → apare corect scadent → reconfirmat
   prin dev server real → dispare din listă → un al doilea contact, notificat acum 40 de
   zile, șters corect de `purge_expired_retention()`. Emailul 8 trimis real prin Resend către
   `delivered@resend.dev`, status confirmat „delivered". Toate datele de test șterse din
   Supabase după verificare. §5 a rămas la timpul prezent — de data asta chiar e adevărat.

   **De reținut**: distincția dintre „corectăm ce spune textul" și „construim ce promite
   textul" nu e întotdeauna a mea de decis — la text cu greutate juridică (GDPR, nu copy de
   conversie), implicația corectă e să ofer opțiunea, nu s-o aleg eu. Aici a fost oferită
   explicit (AskUserQuestion, recomandare pe varianta rapidă) — Ciprian a ales cealaltă.

5. **A doua rundă pe §2.1 — o sursă externă, nu codul.** Ciprian a încărcat o versiune
   revizuită a Politicii, produsă într-o altă conversație, fără acces la `form-schema.ts`.
   Acea revizuire a înlocuit lista corectă de la punctul 1 cu întrebări inventate
   („așteptările de la eveniment", „interesul pentru un workshop in-company", o pretinsă
   opțiune de text liber) — niciuna reală. Verificat: documentul „Bloc 2" care a produs
   confuzia nu există nicăieri în acest repo, deci nu era o notă de plan veche rătăcită
   aici, ci ceva extern conversației. Corectat din nou, linie cu linie față de schema
   reală, păstrând restul îmbunătățirilor din versiunea încărcată (§2.2, §2.4, §6, §3 —
   toate corecte). **Confirmat de Ciprian: „Politica e ok!"**

   De reținut, complementar la punctul 4 de mai sus: verificarea „împotriva sursei" nu e
   suficientă dacă sursa însăși e stală. Un cross-check corect ca proces poate produce un
   rezultat greșit dacă referința lui nu e codul.

6. **Emailul 8 aprobat**, fără modificări față de draft — 28 august 2026. Confirmat de
   Ciprian: „E ok acum". Marcat aprobat în `docs/EMAILURI.md`, `templates.ts`,
   `tests/emails.test.ts`. Gate-ul `LEGAL` e complet.

`Termeni_si_Conditii_DeepLogic.md` — o singură observație, nesemnalată ca discrepanță
tehnică: §3 declară „minimum 18 ani, confirmat prin înscriere", dar formularul n-are niciun
câmp sau bifă de vârstă. E formulare juridică standard (confirmare implicită prin actul
înscrierii) — spre deosebire de punctele 1–4, nu contrazice un comportament de sistem
existent, doar nu-l operaționalizează explicit. Semnalat lui Ciprian, netins.

**De reținut pentru sesiuni viitoare**: documentele legale nu sunt copy obișnuit — corecțiile
de mai sus sunt verificabile obiectiv (câmp există/nu există în schema Zod, canal
implementat/nu implementat), dar au greutate juridică. Publicate, dar Ciprian trebuie să le
confirme explicit înainte de lansare (vezi „Blocat pe Ciprian" în PROGRES.md), la fel cum a
confirmat cele 7 texte de email la F5.

---

## Efecte 3D pe carduri și secțiuni — decizie împotriva recomandării

Ciprian a cerut efect 3D pe fiecare secțiune și card, plus animații de scroll mai
prezente. Obiecție ridicată explicit, înainte de implementare: risc de performanță pe
publicul țintă (4G, browser in-app WhatsApp, Android) și risc de „clișeu AI-generated"
(tilt 3D pe toate cardurile e la fel de universal ca glassmorphism-ul). Propusă o
variantă calibrată (un singur moment bold, micro-interacțiuni discrete). **Ciprian a ales
explicit varianta cerută inițial**, nu cea recomandată — implementată ca atare, cu grijă
la exact riscurile semnalate.

**Ce s-a construit:**
- Sistemul global de reveal (`data-reveal`, `tokens.css`) trecut de la translateY(8px) la
  o intrare cu perspectivă 3D reală (`perspective(900px) translateY(22px) rotateX(7deg)`)
  — acoperă automat tot ce avea deja `data-reveal` (S02, S03, S05, S08) și tot ce s-a
  adăugat acum (S04, S06, S07, S09, S10-S15) — 13 din 17 secțiuni. Rămase neatinse
  deliberat: S01 (hero, vizibil imediat, fără scroll), S16 (formular — nu i se aplică
  decor, e singurul lucru care contează pe ecran), S17 (footer).
- Tilt 3D interactiv real (`data-tilt`, urmărește cursorul prin `pointermove`) pe
  singurele două grile de carduri autentice din pagină: S09 (zonele de use-case) și S06
  (blocurile numerotate ale demonstrației, restilizate ca oarde cu bordură+umbră ca să
  aibă unde să „poarte" efectul). Dezactivat explicit pe touch
  (`(hover:hover) and (pointer:fine)`) — pe telefon nu există `pointermove` continuu, deci
  un tilt care rămâne blocat la ultima atingere ar arăta ca un bug, nu ca un efect; cardul
  rămâne „ridicat" static prin umbră.

**Capcană găsită înainte să ajungă pe ecran, nu după**: reveal-ul (560ms) și tilt-ul
(150ms) manipulează amândouă `transform` — pe ACELAȘI element, regula CSS mai specifică
ar câștiga tot lanțul de tranziție, iar tilt-ul ar deveni la fel de lent ca intrarea la
scroll (inacceptabil pentru un efect care trebuie să simtă cursorul, nu să-l urmeze cu
întârziere). Fix: separate pe DOUĂ elemente DOM (`.zona`/`.bloc` cu `data-reveal`,
`.zona-tilt`/`.bloc-tilt` cu `data-tilt`), nu prin trucuri de specificitate CSS.

**Verificat**: `npm run check` (0 erori/66 fișiere), toate cele 135 teste unitare, 38
teste e2e (Playwright, incluzând 2 noi dedicate tilt-ului — răspunde la cursor pe
desktop, rămâne static pe touch fără erori), `npm run contrast` (18/18), build de
producție complet. Screenshot-uri mobil 360px + desktop confirmă vizual.

---

## Tilt pe touch, apoi foto reală — ultimele goluri vizuale închise

Ciprian a testat tunelul pe telefonul propriu (dispozitivul real de test) și a raportat
„încă tot nu e acolo". Cauza: tilt-ul 3D era dezactivat deliberat pe touch (motivul B2-like
din decizia inițială — fără `pointermove` continuu, ar fi rămas blocat la ultima atingere).
Rezultat practic: efectul cerut explicit era invizibil pe exact dispozitivul pe care-l
verifica. Fix: `touchstart`/`touchend` cu `{ passive: true }` — tilt scurt la apăsare, fără
să blocheze scroll-ul (asta ar fi cerut `touchmove` + `preventDefault`). Verificat cu
evenimente touch reale prin CDP (`Input.dispatchTouchEvent`), nu `locator.tap()` (prea rapid
ca să prindă starea DIN TIMPUL atingerii).

Cerut apoi o trecere de critică vizuală („front end designer"). Verdict: restul paginii
(§02-05, §07, §10, §12-15) e deliberat fără carduri — corect, nu o omisiune — iar singurul
gol vizual real era §11 (Cine ține workshopul), complet gol de imagine. Ciprian a trimis o
fotografie reală, la un eveniment (gest animat, context de local, nu portret corporate).
Procesată: rotație automată după EXIF (orientation 8 — fișierul brut era culcat 90°),
decupare 4:5 cu detecție de atenție a libvips (`sharp.strategy.attention`, centrează automat
pe zona cu cea mai multă „saliență" — aici, fața), 880×1100, 94KB. §11 randează complet.

---

## Gate-urile OG, B2, `.ics` — verificate

### OG — cardul lipsea fizic, nu doar textul

`copy.ts` referenția `/og-workshop-16-09.png` de la F3, dar fișierul nu exista niciodată —
gate-ul era blocat pe un asset, nu pe cod. Construit `src/pages/og-card.astro` (pagină reală,
nu un SVG separat, ca să folosească exact fonturile self-hostate ale site-ului) +
`scripts/genereaza-og.mjs` (Playwright, capturează la 1200×630).

**Capcană găsită la prima captură**: o pilulă cu iconițe apărea în colțul de jos al fiecărei
imagini generate. Diagnosticat prin eliminare, nu presupunere — o pagină complet goală,
randată fără server Astro (`page.setContent`), nu avea artefactul; pagina reală, servită de
`astro dev`, îl avea. Concluzie: **`<astro-dev-toolbar>`**, injectat automat de Astro în
FIECARE pagină în modul dev, absent din producție. Fixul: eliminat elementul din DOM
(`page.evaluate`) înainte de screenshot. **De reținut pentru orice captură viitoare a unei
pagini din acest proiect, prin `astro dev`**: toolbar-ul e acolo, invizibil cu ochiul liber pe
un ecran normal (se auto-ascunde pe interacțiune), dar apare pe un screenshot automat.

### B2 — verificat live, apoi acoperit permanent

Verificare manuală, contra Supabase real: 5 cereri GET pe `/raspuns?...&r=nu`, inclusiv cu
user-agent Outlook Safe Links, status neschimbat; `POST` imediat după, mută corect. Aceeași
verificare pe `/checkin`. Plus, ca regresia să nu depindă de memorie: test Playwright nou
(`tests/e2e/b2-siguranta-get.spec.ts`) care interceptează rețeaua și cere zero cereri către
rutele `/api/*` doar din încărcarea paginii — acoperă `/raspuns`, `/checkin` și
`/pastreaza-datele`.

### `.ics` — cross-check cu un parser independent

`tests/ics.test.ts` verifica deja structura RFC 5545 (12 teste). Adăugat un cross-check cu
`node-ical` (bibliotecă terță, instalată temporar cu `--no-save`, nu intră în `package.json`)
pe fișierul REAL generat, nu pe cod — parserul independent rezolvă DTSTART-ul la exact 14:00
Europe/Bucharest (11:00 UTC). Rămâne, ca și la OG, un pas fizic imposibil de la acest scaun:
import real în Google/Apple/Outlook. Verificarea programatică e solidă; deschiderea în cele
trei aplicații rămâne a lui Ciprian.

### Link public pentru verificare vizuală

Ciprian a cerut un link, nu de pe aceeași mașină. Instalat `cloudflared` (tunel rapid,
fără cont), adăugat `vite.server.allowedHosts: true` în `astro.config.mjs` (Vite blochează
implicit host-uri necunoscute — protecție DNS-rebinding; afectează DOAR `astro dev`, zero
impact pe build-ul de producție). **Atenționare dată explicit**: tunelul expune server-ul de
dev conectat la Supabase și Resend REALE — cineva care ar completa formularul prin acel link
ar crea o înscriere reală și ar trimite un email real. Link temporar, netrimis mai departe.

---

## Layout „cartonaș" + scroll hijack real — decizie împotriva recomandării (faza de design)

Ciprian a cerut, după livrarea primei variante a brief-ului de design: (1) fiecare
secțiune să devină un „card" de `100dvh`, cu efectul 3D deja existent (`data-tilt`)
extins la nivel de card; (2) un scroll hijack real, dependent de viteza gestului — scroll
rapid sare direct la cardul următor, scroll lent rămâne liber, ca un feed social (gen
TikTok/Reels).

Obiecție ridicată explicit, înainte de a actualiza brief-ul: liniile 116-117 din
`src/layouts/Base.astro` declară textual „zero scroll deturnat" ca principiu deliberat al
codebase-ului; ce se cere acum e exact opusul — necesită JS custom care ascultă viteza
gestului (wheel/touch) și decide, per gest, dacă preia controlul de la scroll-ul nativ.
Oferită explicit alternativa non-hijack (`scroll-snap-type: y proximity`, fără JS), cu
downside-urile ei declarate (rupe trackpad/tastatură fin-controlate, risc de motion
sickness, e un pattern deja documentat, nu un anti-pattern nou de evitat cu orice preț).
**Ciprian a ales explicit hijack-ul real, cu bună știință despre trade-off.**

Principiul „zero scroll deturnat" din `Base.astro` e **suprascris pentru acest layer**,
nu abandonat ca valoare generală — rămâne default pentru orice altă interacțiune viitoare
care nu a cerut explicit altfel. Constrângeri obligatorii, negociate ca parte a acordului:
`prefers-reduced-motion: reduce` dezactivează hijack-ul complet (bail-out înainte de orice
`addEventListener`, ca în cele două scripturi `is:inline` deja existente din `Base.astro`)
și cade pe scroll nativ plat; navigarea de tastatură (Page Down/Space/săgeți) trebuie să
avanseze coerent la cardul următor, implementată ca handler separat de sistemul de viteză,
cu excepție explicită când focusul e într-un câmp de formular (`§16` are 5 blocuri radio —
Space/săgețile trebuie să rămână ale câmpului, nu ale navigării de pagină).

Aspect ratio: fiecare card trebuie să încapă fără tăiere pe intervalul real de dispozitive,
via tipografie fluidă; sub `100dvh` = 560px (practic, telefon în landscape), cardul
primește scroll intern cu indicator vizibil — nu încalcă regula „`§02`/`§08` nu se taie la
mobil" din `CLAUDE.md` §2, pentru că nimic nu se taie, doar devine derulabil.

Mecanismul de viteză (hand-rolled vs. Lenis ca senzor de fallback), recalibrarea
`data-tilt` pentru scara de card, și reconcilierea firului cu structura de carduri:
`docs/design/DESIGN_BRIEF.md`, secțiunile „Nivel de motion" și „Element-semnătură".

---

## Cardul de sticlă + Lenis — schimbare de poziție pe bază de dovadă (v4 de design)

Ciprian a testat live pe telefon varianta v3 (carduri `100dvh` + Câmpul, layer de linii pe
fundal, scrim-uri solide per-paragraf pentru contrast). Respinsă, cu trei defecte
confirmate prin măsurare la 390×844 (screenshot + `getComputedStyle`), nu prin impresie:
Câmpul citea ca zgârieturi (linii prea groase, prea rare, contrast prea mare, traversând
H1-ul); scrim-urile solide tăiau vizibil liniile, producând același artefact „cutie" pe
negativ; și nu exista niciun card vizual (`border-radius: 0px` măsurat pe toate cele 16,
zero elevație, zero separare între secțiuni).

Cerut explicit: carduri vizuale reale cu aspect „liquid glass" (Apple) și scroll super
fluid la gest normal, cu salt la segmentul următor pe gest rapid.

**Cardul de sticlă înlocuiește scrim-urile per-element** — un singur mecanism în locul a
două: conținutul fiecărei secțiuni stă pe o placă translucidă, scrim-urile per-paragraf din
`tokens.css` se șterg complet, iar liniile Câmpului nu mai sunt tăiate — se văd difuz *prin*
sticlă, ceea ce e chiar mecanismul care face efectul să citească drept sticlă.

**Contrastul rămâne garantat mecanic, nu prin speranță.** Ce e sub sticlă e cunoscut și
mărginit (doar liniile Câmpului peste fundalul registrului), deci compozitul worst-case e
calculabil exact cu formula din `scripts/check-contrast.mjs`. Alpha minimă a tentei,
calculată per registru: 0.707 pe primar, 0.804 pe secundar, 0.000 pe închis (registrul
închis n-are constrângere). Recomandate cu marjă: 0.82 / 0.88 / 0.70. Costul sticlei e
mărginit la ~0.3 puncte de ratio. `check-contrast.mjs` trebuie extins cu perechile
compozite, altfel gate-ul `CONTRAST` din CLAUDE.md §6 nu mai acoperă ce e efectiv pe ecran.

**Lenis — poziție schimbată, a treia oară fiind cea bună.** Recomandasem împotriva lui în
v1 și v2, cu rezerva scrisă explicit: „fallback acceptabil dacă dovada empirică o cere".
Dovada a venit — argumentul principal de atunci era că majoritatea gesturilor trebuie să
rămână 100% native, deci virtualizarea întregului scroll e disproporționată. Premisa a
căzut: Ciprian nu mai vrea scroll nativ la gest lent, vrea scroll interpolat, exact ce
livrează Lenis. În plus, `lenis.velocity` rezolvă senzorul de viteză cross-browser
(trackpad vs. rotiță vs. inerție iOS) — o slăbiciune pe care o numisem eu însumi în v2 ca
fiind greu de rezolvat de mână. Contractul de accesibilitate rămâne neatins:
`prefers-reduced-motion` face bail-out înainte de `new Lenis()`, tastatura rămâne handler
separat, ancorele `#inscriere` se rutează prin `lenis.scrollTo`.

**Defect preexistent găsit la recalcularea perechilor**, fără legătură cu redesign-ul:
`--text-muted` `#637474` pe `--bg-secundar` `#E4E7E7` dă **3.94:1**, sub pragul AA. §05
(`S05InainteDupa.astro`) e `fundal="secundar"` și colorează coloana ÎNAINTE, etichetele
`td::before` și `thead th` cu exact acest token; comentariul din cod spune „4.91:1", corect
pe alb, dar secțiunea nu e pe alb. `npm run contrast` nu îl prinde pentru că perechea e
declarată doar contra `bgPrimar`. E exact capcana pentru care `#3A716D` a fost respins mai
sus în acest document — același tipar, alt token. Nu poate fi reparat de sticlă (pică deja
la 0% sticlă). Opțiuni măsurate: `#576565` (4.89 plat / 4.73 sub sticlă, păstrează intenția
„muted", hex nou) sau `#2F4F4F` (7.18 / 6.95, zero hex nou, vizual mai puțin stins).
Semnalat lui Ciprian, nedecis unilateral — introducerea unui hex nou în paletă e decizia
lui.

Anatomia plăcii de sticlă, geometria redesenată a Câmpului, pragurile de performanță pentru
`backdrop-filter` și recalibrarea tilt-ului (1.2°, de la 2° — un tilt pe placă cu margini
vizibile citește mai puternic decât pe conținut fără contur):
`docs/design/DESIGN_BRIEF.md`, v4.

---

## Labirintul — răsturnarea regulii „fundal curat" (29 august 2026)

**Statut: decizie asumată, luată informat, după avertisment explicit.** Se documentează ca
răsturnare, nu ca omisiune — regula veche n-a fost uitată, a fost cântărită și schimbată.

### Ce s-a întâmplat, în ordine

La începutul sesiunii Ciprian a cerut un fundal cu temă de labirint. **A fost avertizat
explicit, atunci, că intră în conflict cu propria lui regulă din `CLAUDE.md` §2** — „Fundal
curat. Fără imagini generice cu roboți, creiere sau rețele neuronale." A ales, în acel moment,
varianta abstractă. Din ea au ieșit patru iterații: v1 (Firul, rail decorativ), v2 (carduri
`100dvh`), v3 (Câmpul — respins pe telefon: „zgârieturi/crăpături"), v4 (cardul de sticlă, în
implementare).

După ce le-a văzut pe toate patru, s-a întors la labirint. **Nu e aceeași cerere repetată** —
e aceeași cerere cu patru iterații de dovadă în spate, inclusiv o respingere măsurată a
alternativei abstracte. Asta schimbă calitatea deciziei, nu doar frecvența ei.

### Regula nouă — formulare propusă pentru `CLAUDE.md` §2

Se înlocuiește rândul „**Fundal curat.** Fără imagini generice cu roboți, creiere sau rețele
neuronale." cu:

> - **Fundal autorat, nu procurat.** Fundalul are voie să poarte un motiv geometric abstract,
>   desenat de noi, dacă motivul e cerut de copy-ul paginii și nu doar de gust. **Rămân
>   interzise:** roboți, creiere, rețele neuronale, circuite, „AI brain", particule
>   plutitoare, stock art de orice fel, orice imagine rasterizată procurată din afară, orice
>   gradient mesh generic. **Devine permis:** un motiv vectorial autorat, ortogonal, de
>   contrast scăzut, care trece criteriile vizuale V1–V14 din
>   `docs/design/DESIGN_BRIEF-labirint.md` §14 și plafonul de opacitate din §8.2.
>   Testul: *motivul citează un cuvânt din copy-ul paginii, sau doar umple spațiul?* Dacă doar
>   umple, cade sub regula veche.

**Motivul răsturnării, nu doar faptul ei.** Regula veche a fost scrisă împotriva **fundalului
procurat** — imaginea de stoc cu creierul-circuit, care semnalează „pagină de AI generică" și
n-a fost desenată pentru pagina asta. Un labirint desenat de noi, ortogonal, la 1.2–1.8:1
contrast, e categoria opusă: **nu e o imagine pusă în spate, e o figură din text mutată în
geometrie.** §02 spune de patru ori „n-ai o hartă" (`copy.ts` liniile 87, 90, 282, 486, 661).
Un labirint e definiția vizuală a absenței hărții. Regula veche nu-l acoperea; îl prindea din
greșeală, pentru că era formulată prin subiect („roboți, creiere") în loc de prin proveniență
(„procurat vs. autorat"). **Formularea nouă mută testul de la ce reprezintă motivul la de
unde vine și ce muncă face.**

### Ce s-a decis odată cu el

| # | Decizie | Motiv |
|---|---|---|
| **D22** | Fundalul de labirint e o **direcție alternativă documentată separat** (`docs/design/DESIGN_BRIEF-labirint.md`), nu o editare a v4 | v4 se implementează în paralel chiar acum. Două documente care coexistă fără conflict de fișiere; adoptarea e o decizie ulterioară, nu un fapt împlinit. |
| **D23** | `backdrop-filter` **dispare de pe cele 14 carduri deschise**, rămâne doar pe registrul închis (§02, §08), pe cardul activ | Măsurat, nu preferat: la tenta pe care o cere contrastul (0.82/0.88), backdropul e spălat la ~3% delta de luminanță — blurul cheltuia 4–10ms/cadru înmuind ceva deja invizibil. Pe registrul închis (tentă 0.70) delta e vizibilă (1.59:1), acolo blurul își plătește costul. **Niciun număr de contrast nu se schimbă**, pentru că v4 calculase deja totul presupunând că blurul nu contribuie. |
| **D24** | **Labirintul și sticla mată nu încap amândouă pe mobil.** Dacă D23 se refuză, labirintul pică. | Android mediu, 4G, browser in-app WhatsApp, 360px. Trei plăci de ecran plin cu `backdrop-filter` + Lenis + tilt + un element care se mișcă permanent în backdrop (ceea ce împiedică definitiv cache-uirea blurului). Trade-ul se declară acum, nu se improvizează la QA — asta s-a plătit deja în iterațiile 1–3. |
| **D25** | Plafonul de opacitate al fundalului trece de la `stroke-opacity` moștenit la **`<g opacity>`** | **Obligatoriu, nu cosmetic.** Câmpul v4 e format din verticale paralele care nu se intersectează niciodată, deci `stroke-opacity` era un plafon corect. Un labirint se intersectează prin definiție: două stroke-uri la 0.25 care se suprapun compun la 0.4375 — cu 75% peste plafon, exact în punctele cele mai numeroase ale desenului, iar `npm run contrast` ar fi raportat verde peste el (citește constanta, nu pixelii). `opacity` de grup aplatizează întâi și aplică valoarea o dată: maximul devine structural imposibil de depășit. |
| **D26** | Opacitatea subiectului: **0.32** pe registrele deschise, **0.50** pe cel închis | Calculat, nu ales. La 0.39, `--text-muted` `#637474` sub tenta primară pică la **3.99:1**. La 0.32 rămâne la **4.60:1**. Marja e de 0.10 — subțire, deci pusă sub gate: `ALPHA_SUBIECT` + 5 perechi noi în `scripts/check-contrast.mjs`, cu o aserțiune care explică *de ce* pică, nu doar *că* pică. |
| **D27** | **Firul se absoarbe în labirint.** `<nav class="rail-fir">` se șterge; controller-ul (`actualizeazaRail` + Lenis + tastatură + ancore) supraviețuiește intact, fișierul se redenumește `ControlerCarduri.astro`. | Railul și coridorul spun exact același lucru (unde ești din 16, care 4 sunt CTA). Justificarea din v4 — „trei scări diferite, nu concurează" — funcționa cât timp fundalul purta zero informație; labirintul poartă, deci expiră. Coridorul spune în plus și *forma* a ce urmează. Zero cost pe accesibilitate: railul era `aria-hidden` + `pointer-events: none`. |
| **D28** | „Licitare statică" **reinterpretată**: nu pâlpâire de luminozitate pe placă, ci **descărcare pe muchie** — 2 bătăi, 190ms, <2% din suprafață | Trei motive independente: (1) WCAG 2.3.1 — un flash mare, repetabil, pe >25% din aria de 10° e risc de fotosensibilitate, iar o placă de ecran plin e exact acel caz; (2) o pâlpâire e un *eveniment*, nu o *stare* — scrubată la scroll, stroboscopează la tremuratul degetului, contra cerinței „înainte și înapoi"; (3) un flash alb pe card e cel mai rapid mod de a face pagina să arate ieftin. Rezolvarea: latch cu histerezis 0.72↑/0.45↓ (≈216px), cooldown 400ms, plafon 2 bătăi, zero sub `prefers-reduced-motion`. Refolosește linia speculară pe care v4 o are deja. |
| **D29** | **Zero dependințe noi.** Fără GSAP, fără ScrollTrigger, fără MotionPathPlugin. | ~40KB gzip peste o pagină al cărei JS total e azi ~6KB. `scrub` e primitiva corectă conceptual, dar aici înseamnă 8 elemente și o singură funcție de progres — ~40 de linii. Aceeași disciplină prin care `lenis` a fost admis abia la a treia rundă, după ce a justificat **două** funcții. CSS scroll-driven rămâne candidat pentru o iterație viitoare, respins acum pentru că ar introduce o a doua sursă de progres (contra principiului „un senzor în loc de două", deja scris în controller). |
| **D30** | **Placa cedează ≥16vh** (nu depășește 84% din înălțimea cardului) | Fără bandă vizibilă, labirintul e invizibil pe mobil (placa acoperă azi ~95% din ecran la 360×800). Preț recunoscut: mai multe carduri vor avea scroll intern. Nimic nu se taie (`overflow-y: auto` e permanent), deci „§02/§08 nu se taie la mobil" rămâne respectat — dar e o degradare reală de fit, declarată ca preț, nu ascunsă. |

### Criteriu de renunțare, scris înainte, nu după

Dacă la QA, la 360×800 cu CPU throttled 4×, se ajunge la nivelul **D4 sau mai jos** din scara
de degradare (`DESIGN_BRIEF-labirint.md` §10.2), direcția nu se susține pe mobil. Mișcarea
corectă atunci **nu** e să se livreze podeaua pentru toți — e fallback-ul de reduced-motion sub
48rem și varianta completă doar peste. Un labirint la podea e un fundal static cu overhead de
JS: plătești costul fără să primești efectul.

Al doilea criteriu, vizual: dacă la 360×800, în repaus, se văd **sub 3 celule complete** de
labirint (criteriul V8), labirintul e decor pe care nu-l poți citi și se taie.

### Lecția de proces, pentru rundele următoare

Iterația 3 a trecut QA-ul ca „gata de livrare" fiind în același timp urâtă, pentru că
verificarea a măsurat contrast, performanță și regresii — dar nimeni n-a dat verdict pe
imagine. `DESIGN_BRIEF-labirint.md` §14 conține 14 criterii vizuale cu prag numeric (densitate,
grosime, contrast de câmp, ortogonalitate, testul de mijire, contact sheet 4×4, testul de
inversare, testul de tremurat). **Regulă nouă de QA: un raport nu are voie să spună „gata de
livrare" fără o secțiune estetică separată, cu verdict individual pe V1–V14 și screenshot
lângă fiecare.** „Contrast OK, perf OK, zero regresii" e exact propoziția care a trecut o
pagină urâtă mai departe.

---

## Ce a rămas deliberat în afara scopului

Din spec, plus deciziile de mai sus: arhitectura de replicare pentru agenții viitori · interfața
Notion peste `contacts` · trimiterea automată a materialelor post-workshop (rămâne manuală, către
segmentul `prezent`) · formularul de închidere din sală · blocul despre faliment (D8) · testimonialele
(D9) · textul de distribuire pentru membrii BIZZ.CLUB (**există deja scris** în `landing-*.md`,
secțiunea finală — e livrabil separat, nu intră pe pagină) · `/checkin-loc` walk-in prin QR (D21).

---

## Pivot de narativă (2 septembrie 2026)

Ciprian a trimis un draft alternativ de copy (`PRIMUL-PAS-landing-page-v3.md` — H1 și structură
diferite de ce era live) plus un audit scris al lui: diferențiatorul Deep Logic (mecanismul
owner → echipă → proces/date → decizie) era prezent în pagină, dar abia la §10, după ce
cititorul putea percepe deja pagina drept „încă un workshop despre AI". Decizia, confirmată
explicit prin `AskUserQuestion` (opțiunea „rescriu pagina după v3 + critică", nu varianta mai
mică de a doar aplica ideile pe structura existentă): rescriere de narativă, nu doar de propoziții.

| # | Decizie | Motiv | Unde s-a aplicat |
|---|---|---|---|
| **D31** | H1 nou — „Afacerea ta este diferită. Care este PRIMUL PAS în noua eră digitală?" | Vechiul H1 („Toată lumea îți spune să folosești AI...") centra anxietatea de adoptare. Noul H1 centrează decizia de business — coerent cu mecanismul care urmează imediat după. | `copy.ts` (`hero.h1`), `S01Hero.astro` neschimbat |
| **D32** | §10 DespreDeepLogic mutată devreme — imediat după §02 Problema, înainte de §03 Rezultatul | Draftul v3 + audit cereau explicit ca mecanismul „business → nevoie → oameni → proces → impact → tehnologie" să fie în prima treime a paginii, nu îngropat la poziția 9 din 15. Numele exportului (`despreDeepLogic`) și al fișierului (`S10Deeplogic.astro`) rămân neschimbate — numărul din nume e acum istoric, nu poziția reală, același precedent ca despărțirea §06/§10 din pivotul PRIMUL PAS (31 august). | `index.astro`, `S10Deeplogic.astro` |
| **D33** | Mecanismul, rescris explicit: perspectiva ta / realitatea echipei / procesele și datele → cele trei afirmații paralele → sinteza „Deep Logic caută punctul în care nevoia ta, realitatea echipei și valoarea pentru companie se întâlnesc." | Componentele existau deja ca proză continuă („Business → problemă → oameni → proces → impact → tehnologie"), dar nu erau articulate ca mecanism memorabil — ideea centrală citea ca una dintre mai multe, nu ca teza paginii. | `copy.ts` (`despreDeepLogic`), `S10Deeplogic.astro` |
| **D34** | Pasul 2 al metodologiei (§06): „REALITATEA ECHIPEI" → „WORKSHOP CU ECHIPA" | Spune explicit CUM se verifică ipoteza ownerului (printr-un workshop cu echipa), nu doar CE se descoperă. Ecou deliberat cu limbajul mecanismului de la D33. | `copy.ts` (`ceFacem.blocuri[1]`) |
| **D35** | „Roadmap" → „roadmap personalizat de validare" la promisiunile principale (§03 item 5, §14 „ce include", ultimul FAQ despre livrabil) | Cuvântul simplu, singur, se putea citi ca plan de implementare gata de execuție. „De validare" protejează limita onestă din §03 „Ce NU vei ști" — nu se schimbă în restul paginii (ex. tabelul §05), unde forma scurtă păstrează ritmul frazei. | `copy.ts` (`rezultatul`, `deCeGratuit`, `faq`) |
| **D36** | §11 Facilitator capătă o propoziție de autoritate practică: „Nu predau o metodă învățată pentru acest workshop..." | Închide obiecția „încă un trainer care vorbește despre tehnologie" fără să dezvăluie exemplele interzise explicit (You Protect, agentul de sănătate — D8/lista „ce nu apare deliberat"). | `copy.ts` (`facilitator.corp`) |

**Ce n-a fost atins, deliberat:** §02 Problema rămâne exact cum era — e secțiunea cu regula
„nu se taie la mobil, indiferent ce", și mecanismul nou (D32/D33) acoperă deja ideea de paradigmă
fără să adauge risc pe secțiunea cea mai protejată a paginii. `docs/landing-workshop-16-09.md`
(sursa PDF originală) **nu a fost rescrisă** să reflecte acest pivot — antetul din `copy.ts` și
această intrare rămân sursa de adevăr pentru narativa curentă până la o resincronizare completă.

---

## Pivot de structură: 16 secțiuni → 10 (2 septembrie 2026, aceeași zi)

Al doilea draft de copy primit de la Ciprian, în aceeași zi ca pivotul de narativă de mai sus
(„PRIMUL-PAS-landing-page-v4.md"), plus un cadru anunțat separat, înainte de draft, prin
`AskUserQuestion`: structura veche „prea stufos, diluăm mesajul". Cadrul cerut explicit: Hero →
Trust bar → Problemă → Agravare → Soluție → Facilitator → Cui i se adresează → Cui nu i se
adresează → Ce rezultat promitem → FAQ.

| # | Decizie | Motiv | Unde s-a aplicat |
|---|---|---|---|
| **D37** | 7 componente retrase ca secțiuni proprii: Înainte→După, obiecția „nu știu ce aș putea face", grid-ul de exemple, „De ce e gratuit", Detalii practice, „20/80" (Precedent), CtaSticky | Fiecare are conținutul absorbit în altă parte, nu pierdut — vezi antetul `copy.ts` pentru harta exactă (ex. grid-ul de exemple → intro-ul din Problemă; „20/80" → subsecțiune în Rezultatul; adresa completă → Trust bar). Regula D6 (adresa pe pagină) verificată să rămână trează după absorbție — `tests/copy-invariants.test.ts` actualizat să caute adresa în `trustBar`, nu în fosta `detalii`. | `index.astro`, `copy.ts`, 7 fișiere `.astro` șterse |
| **D38** | Metodologia cu 5 pași (pin/scrub GSAP, fostă §06) **păstrată explicit**, deși draftul v4 n-o mai are ca secțiune separată — doar 4 bullet-uri scurte în Soluție | Confirmat prin `AskUserQuestion`, nu presupus: costul Lenis+GSAP (~49KB gzip) fusese deja aprobat special pentru acest pin/scrub (pivotul Motion, 1 septembrie) — retragerea secțiunii ar fi lăsat dependența fără justificare rămasă. E acum al 11-lea moment, în afara celor 10 numărate explicit de Ciprian, poziționat după Soluție (mecanismul conceptual), înainte de Facilitator. | `S06CeFacem.astro` neschimbat, doar repoziționat |
| **D39** | Trust bar (secțiune nouă) — strip compact sub hero, DISTINCT de `BaraScarcity.astro` (bara fixă) | Cele două nu concurează: bara fixă e mereu vizibilă la scroll, Trust bar e un bloc din flux, o singură dată, cu mai mult context (adresă completă — D6 — + format 20/80 + capacitate + roadmap). | `TrustBar.astro` (nou) |
| **D40** | Rezultatul (fostă §03) absoarbe „cum lucrăm" (fost Precedent) și „de ce să mai chemi pe cineva" (conținut nou din v4) ca subsecțiuni, nu ca secțiuni separate | Cadrul lui Ciprian numără 10 secțiuni de top nivel — subsecțiunile țin conținutul viu fără să mai adauge o secțiune. CTA repetat o singură dată în mijlocul paginii, la finalul acestui bloc (cel mai „cald" moment), față de patru repetiții pe structura veche. | `S03Rezultatul.astro` |
| **D41** | Fișierele de componente NU au fost renumerotate să se potrivească poziției reale | Precedent din pivotul de narativă (D32): numărul din nume e istoric, ordinea reală e cea din `index.astro`. Renumerotarea tuturor fișierelor la fiecare schimbare de ordine ar fi zgomot pur, fără beneficiu funcțional — Astro nu leagă nimic de numele fișierului. | — |

---

## Sistem vizual: accent lime, sticlă mată, butoane, buton flotant (2 septembrie 2026)

Cerut explicit, în continuarea pivotului de structură: CTA-uri lime puternic, gradient
gri→lime, carduri 3D păstrate, rotunjime pe butoane, buton CTA flotant, numărul real de
locuri sub CTA. Trei runde de corecție ulterioare, toate pe live, cu feedback direct.

| # | Decizie | Motiv | Unde s-a aplicat |
|---|---|---|---|
| **D42** | CTA-uri (buton, buton flotant, buton calendar) — fundal lime solid, text `--pe-lime` (= `--bg-inchis`, 8.01:1) | Alb pe lime dă ~1.6:1 — verificat înainte de implementare, nu descoperit după. `--accent` (teal) rămâne folosit în altă parte a paletei (linkuri, accente decorative). | `Cta.astro`, `CtaFloating.astro`, `tokens.css` |
| **D43** | Rotunjime CTA — `--radius-cta`, cerut inițial ca procent (15%) | Corectat la px fix (14px) după feedback („forma e nasol") — `border-radius` procentual se calculează separat pe orizontală/verticală; pe un buton lat și scurt dă un oval alungit, nu un dreptunghi rotunjit. | `tokens.css` |
| **D44** | Buton CTA flotant — înlocuiește bara sticky doar-mobil, vizibil pe toate viewport-urile | Cerut explicit. Formă corectată în runda 2 (pastilă → dreptunghi rotunjit, aceeași `--radius-cta`) și tratată cu sticlă mată (backdrop-filter + lime translucid la opacitate ținută sus, 88%, ca marja de contrast să rămână aproape neschimbată). | `CtaFloating.astro` (nou), `CtaSticky.astro` șters |
| **D45** | Card „Miercuri, 16 septembrie" + „Adaugă în calendar" — funcție nouă, nu doar copy | Un tap deschide aplicația de calendar a telefonului precompletată (locație, dată, oră, alertă 24h înainte). Reutilizează generatorul `.ics` existent (deja folosit pe `/rezultat`) — doar `VALARM` a fost adăugat, nou. | `TrustBar.astro`, `src/lib/ics.ts` |
| **D46** | Toate cardurile (`.card-depth`) — sticlă mată gri, nu alb opac | Cerut explicit. Corectat de două ori: prima variantă (gri translucid + blur peste un fundal FIX, extern, cu pete de culoare) era tehnic corectă dar vizual invizibilă ori de câte ori cardul nu cădea peste o pată — a doua variantă pune gradientul de culoare (lime + accent) direct în propriul fundal al cardului, vizibil indiferent de poziția de scroll. | `tokens.css` (`.card-depth`) |
| **D47** | Delimitare clară între secțiuni — bară subțire, la nivel de `Sectiune.astro`, global | Cerut explicit („fiecare secțiune să aibă delimitare clară"). O singură regulă, nu per-componentă — se aplică automat oricărei secțiuni viitoare. | `Sectiune.astro` |
| **D48** | Reveal la scroll mutat de la nivel de secțiune la nivel de paragraf/listă/card | Feedback: pe secțiunile mari (Soluție, Rezultatul), un fade pe tot blocul își pierde relevanța — secțiunea e deja pe jumătate vizibilă când pornește tranziția. Fiecare componentă pune acum `data-reveal` explicit, per element, cu o cascadă mică (`nth-child`, 60ms/pas) pentru frați care intră în cadru simultan. | Toate componentele de conținut, `tokens.css` |
| **D49** | Bug real, găsit la verificare: reveal-ul nu anima deloc conținutul deasupra fold-ului (hero, Trust bar) | `IntersectionObserver` raportează `isIntersecting: true` la primul callback pentru orice e deja pe ecran — dacă acela ajunge înainte ca browserul să fi pictat MĂCAR O DATĂ starea ascunsă, tranziția CSS n-are de la ce stare să pornească și sare direct la finală. Fix: dublu `requestAnimationFrame` înainte de a porni observarea, ca să garanteze un ciclu complet de picture cu starea ascunsă. | `Base.astro` |
| **D50** | Bug real, găsit la verificare: butonul flotant rămânea vizibil suprapus peste CTA-ul din mijlocul secțiunii Rezultatul | Logica veche observa doar hero-ul și CTA-ul final. Acum observă orice `.cta` din pagină, generic, cu un `Set` (nu un contor incrementat/decrementat — un contor simplu a rămas blocat, verificat empiric). | `CtaFloating.astro` |
| **D51** | Bug real, găsit la verificare: poza lui Ciprian nu apărea pe live, deși fișierul era încărcat corect | `existsSync` verifica o cale relativă la `import.meta.url` — corectă în `astro dev` (rulează din sursă), greșită la build de producție (Vite mută componenta în bundle-ul de server, unde calea relativă nu mai duce spre `public/`). Înlocuit cu `process.cwd()`, stabil în ambele cazuri. Verificat direct în `dist/`, nu doar „build-ul trece". | `S11Facilitator.astro` |
| **D52** | Header (`BaraScarcity.astro`) — experiment cu fundal lime, REVERSAT la negru, dar cu sticlă mată | Testat lime (aliniat vizual cu CTA-urile), respins explicit („lasă header-ul negru, doar textul roșu"). Fundalul revine la `--bg-inchis`, dar translucid + blur (nu opac plat) — păstrează efectul „floating" cerut alături de revenirea la negru. Gradientul de text revine la alb→roșu (varianta pentru fundal închis, dinainte de experimentul lime). | `BaraScarcity.astro` |
| **D53** | Facilitator — layout nou: poză rotundă, medie, în dreapta; nume + rol în stânga; bio pe toată lățimea dedesubt | Cerut explicit, înlocuiește coloana veche (poză mare dreptunghiulară stânga, text lung dreapta). | `S11Facilitator.astro` |
| **D54** | FAQ → accordion (`<details>`/`<summary>`) — reversare deliberată a regulii anterioare „fără accordion" | Regula veche („un click în plus pe obiecția decisivă e un click pe care mulți nu-l fac") a fost scrisă pentru o listă de 7 întrebări, toate vizibile deodată. Cerută explicit acum, la 10 întrebări. Animație CSS-only (`grid-template-rows`), fără JS, funcțională și fără JavaScript. | `S15Faq.astro` |
| **D55** | Set de calificare — **înlocuiește D4** cu setul din `formular-calificare-workshop.md` | D4 alesese „Set B", toate radio, ca să evite fricțiunea de multi-select pe mobil. Ciprian a semnalat că formularul „nu respectă cerințele" și a indicat explicit acest fișier ca sursă de adevăr — 3 din 5 întrebări sunt acum checkbox (max 2 la Q1/Q3, fără limită la Q4), cu blocaj de UI la a 3-a bifă (mesaj exact din spec) și un câmp text condiționat („Altceva:" la Q3, aceeași regulă ca `sursa_detaliu`). Verificat interactiv, în browser real (nu doar Zod izolat): blocajul de bifă și reveal-ul câmpului text funcționează, iar un submit real prin `/api/register` nu mai produce nicio eroare pe câmpurile de calificare. | `form-schema.ts`, `DialogInscriere.astro`, `src/lib/supabase.ts`, `src/pages/api/register.ts` |

**Notă despre poza lui Ciprian:** varianta anterioară din repo (înlocuită la cererea explicită
a lui Ciprian, care a trimis un fișier nou) era deja o fotografie reală, la un eveniment —
exact regula din documentul sursă („nu portret corporate pe fundal alb"). Cea nouă e un
headshot de studio pe fundal gri. Semnalat explicit lui Ciprian în momentul schimbării;
decizia rămâne a lui.

**Ce n-a fost atins:** `docs/landing-workshop-16-09.md` a fost resincronizat odată cu acest
pivot (vezi antetul documentului) — nu mai există o divergență cunoscută între el și
`copy.ts` la data acestei intrări.

---

## Runda 7 de revizuire, secțiune cu secțiune (7 septembrie 2026)

Sesiune de review pe live, pe telefon: Ciprian trimite câte un screenshot per secțiune și
descrie ce trebuie schimbat. Fiecare rundă se închide cu commit + push + `npm run deploy` +
verificare pe domeniul real.

| # | Decizie | Motiv | Unde s-a aplicat |
|---|---|---|---|
| **D56** | H1-ul din hero — fiecare rând ocupă EXACT un rând vizual, pe orice ecran, cu mărime derivată din lățimea containerului (`cqi` + `white-space: nowrap`), nu din `clamp()` pe viewport | Cerut explicit („font mai mic să încapă în primul rând pe orice ecran, dinamic adaptabil la telefonul pe care e afișat"). D-ul care se reversează parțial e runda a cincea (3 `span`-uri de mărime egală): aceea rezolva UNDE cade ruptura, nu faptul că fiecare rând se rupea în două pe 360px — H1-ul ajungea la cinci rânduri vizuale. `vw` nu putea rezolva: lățimea în care încape textul e fereastra minus două rame de padding fluide, plafonată pe desktop de `--max-proza`. Factorii de lățime sunt MĂSURAȚI în browser cu Inter încărcat (10,19em / 9,37em / 11,39em), nu estimați. Rolurile s-au despărțit: rândul 1 e afirmația de deschidere (0,75×), rândurile 2–3 sunt întrebarea, egale între ele, cu „PRIMUL PAS" în `--accent`. | `S01Hero.astro`, `copy.ts` (`hero.h1` devine obiect), `tests/e2e/hero.spec.ts` (nou) |
| **D57** | Sub 480px, ramele hero-ului și ale secțiunii Trust bar se strâng (12px + 16px, de la ~21+21) | Când titlul își ia mărimea din lățimea containerului, fiecare pixel de padding e mărime de titlu pierdută: pe 360px containerul urcă de la 275 la 302px, adică ~10% titlu mai mare, fără să pierzi cadrul de sticlă. | `S01Hero.astro`, `TrustBar.astro` |
| **D58** | Copy nou în hero: `subheadline` pe două paragrafe, `corp` pe o propoziție; **„roadmap de implementare" → „roadmap personalizat de validare"** | Text primit de la Ciprian. Schimbarea care contează nu e lungimea, ci promisiunea: hero-ul era singurul loc din pagină care promitea implementare într-un workshop de trei ore, în timp ce §09 și `meta.descriere` spuneau deja „validare". Un copy care promite altceva decât livrează sistemul e un bug (CLAUDE.md §5). | `copy.ts` (`hero`) |
| **D59** | Cardul de logistică → **BILET**: titlu (data), patru rânduri cu pictogramă desenată, perforație cu crestături, talon | Cerut explicit („mi se pare doar aglomerat... vreau un bilet premium, ușor de parcurs cognitiv"). Diagnosticul mecanic: patru propoziții de aceeași greutate, aproape toate în IBM Plex Mono la 13px — inclusiv adresa, care e proză, nu date. Nicio ancoră de scanare, deci se citea rând cu rând. Fix: pictograme desenate ca ancore (aceeași familie — viewBox 24, stroke 1.7, `--accent`; nu emoji, nu glife Unicode), mono STRICT pe date, fiecare rând = valoare + detaliu opțional. Crestăturile sunt cercuri în culoarea secțiunii tăiate de `overflow: hidden` al lui `.card-depth` — nu au nevoie de `mask`, deci merg și peste `backdrop-filter`. | `TrustBar.astro`, `copy.ts` (`trustBar`) |
| **D60** | Peste 46rem, biletul se rotește: corp la stânga, talon la dreapta, perforație VERTICALĂ. Plafonat la 52rem, nu `--max-continut` (62rem) | La 62rem, cu tot conținutul aliniat la stânga, jumătatea dreaptă a cardului rămânea gol pur — un gol pe care nimic nu-l justifica. 52rem îl face un obiect pe pagină, nu o bandă. | `TrustBar.astro` |
| **D61** | Talonul poartă condiția de acces în roșu (`--eroare`): „Participarea este gratuită, pe bază de invitație." Absoarbe fostul rând italic de sub card ȘI cuvântul „Gratuit" din `trustBar.format` | Cerut explicit („vreau să scrie clar cu roșu"). Cele două spuneau bucăți din aceeași condiție de acces, în două locuri diferite. Contrast măsurat pe fundalul REAL al biletului (sub tenta de sticlă, nu pe alb teoretic): 4,74:1 la 360px. **Semnalat, decizia lui Ciprian:** „pe bază de invitație" e mai tare decât ce face sistemul — formularul e deschis pe o pagină publică; formularea veche („distribuit *în principal* prin invitații") exista exact din motivul ăsta. | `TrustBar.astro`, `copy.ts` |
| **D62** | `trustBar.meta` eliminat; cele două aserțiuni din `copy-invariants` care se agățau de `meta`/`format` mutate pe `JSON.stringify(copy.trustBar)` | `meta` era un rezumat doar pentru cititoarele de ecran care dubla exact rândurile devenite vizibile — D6 (adresa completă pe pagină) e acoperit acum vizibil, nu prin text ascuns. Aserțiunile verifică un FAPT (capacitatea e 30, data e 16 septembrie peste tot), nu forma câmpului — mutate, nu slăbite. | `copy.ts`, `tests/copy-invariants.test.ts` |

**Verificare, la fiecare rundă:** `astro check` (0 erori), 139 teste unitare, `npm run contrast`,
build, e2e (hero + motion), contrast măsurat în browser pe fundalul real al fiecărui element
nou, screenshot pe 360 și pe desktop, apoi `curl` pe domeniul real după deploy (inclusiv
verificarea de sitekey Turnstile din CLAUDE.md §5).
