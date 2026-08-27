# Spec tehnic — Înscriere, reconfirmare, listă de așteptare, check-in
**Workshop „Prima Mutare spre un Asistent Digital" · 16 septembrie 2026 · Deep Logic**

> Fișier de producție pentru Claude Code. Complementar la `landing-workshop-16-09.md`
> (care conține copy-ul paginii). Aici e arhitectura tehnică completă. Conținutul exact
> al emailurilor (subiect + body) nu e aici — se scrie separat, ca și copy.

---

## Stack

| Componentă | Alegere |
|---|---|
| Landing | Astro, deploy pe Cloudflare (domeniu `deeplogic.ro`) |
| Bază de date | Supabase (Postgres) |
| Workflow durabil | Inngest — funcție nativă via `inngest/astro` |
| Email | Resend |
| Anti-spam formular | Cloudflare Turnstile |

## Date fixe eveniment

```yaml
data: 2026-09-16
ora: "14:00–17:00"
timezone: Europe/Bucharest  # UTC+3 (EEST) pe 16 septembrie
locatie: "Casa Dăinuirii, Strada 1 Decembrie 1918 nr. 1, 440010 Satu Mare"
capacitate_reala: 25        # cap dur — protejat cu lock la cursa din waitlist
prag_waitlist: 30           # cap soft la înscriere — buffer asumat pt. no-show
reconfirmare_trimisa: 2026-09-14T09:00:00+03:00
cutoff_reconfirmare: 2026-09-16T11:00:00+03:00
checkin_trimis: 2026-09-16T14:00:00+03:00
```

**De ce două praguri diferite, tratate diferit:** 30 e un buffer *asumat*, nu impus
tehnic — decizia originală a fost să accepți suprarezervare bazată pe rata de no-show,
fără blocaj dur. 25 e capacitatea fizică reală a sălii — acolo, la cursa din waitlist,
blocajul trebuie să fie strict, pentru că alocăm un loc concret, nu o estimare.

---

## Schema Supabase

Scriere **doar** prin API routes cu service role key — `anon key` nu are drepturi
pe niciun tabel.

### `contacts`
```sql
id                          uuid primary key default gen_random_uuid()
email                       text unique not null
nume                        text not null
firma_rol                   text
consimtamant_marketing      boolean not null default false   -- opțional
created_at                  timestamptz default now()
```

### `event_registrations`
```sql
id                          uuid primary key default gen_random_uuid()
contact_id                  uuid references contacts(id) not null
event_slug                  text not null default 'workshop-2026-09-16'
status                      text not null default 'inscris'
                            check (status in
                              ('inscris','asteptare','reconfirmat','no_show','prezent'))
sursa                       text
sursa_detaliu               text
nivel_ai                    text
proces                      text
qualification_answers       jsonb default '{}'::jsonb
consimtamant_comunicare     boolean not null   -- OBLIGATORIU, strict pt. workshop
confirm_token                text unique not null
checkin_token                 text unique not null
created_at                    timestamptz default now()
reconfirmed_at                 timestamptz
checked_in_at                  timestamptz
unique (contact_id, event_slug)
```

**Tokenii se generează la insert, pentru toată lumea, indiferent de status** —
inclusiv pentru walk-in-uri prin QR care intră direct cu `status='prezent'`.
Fără asta, insert-ul pică pe constraint `not null` (bug identificat runda trecută).

**`confirm_token` are acum dublu rol:** reconfirmare normală (status `inscris`)
ȘI revendicare de loc din waitlist (status `asteptare`) — vezi mai jos. Nu mai
generăm un token separat pentru cursa din waitlist; e același, comportamentul
diferă în funcție de statusul curent al rândului.

---

## Capacitate și listă de așteptare

### La înscriere
```
POST /api/register:
  count = SELECT count(*) FROM event_registrations
          WHERE event_slug=... AND status IN ('inscris','asteptare','reconfirmat','prezent')

  IF count < prag_waitlist (30):
      status = 'inscris'  → emit "workshop/registered"
  ELSE:
      status = 'asteptare' → emit "workshop/waitlisted"
```

**Funcție Inngest — `workshop/waitlisted`** (la intrarea în listă)
```
1. poziție = count(*) WHERE status='asteptare' AND created_at < a lui (informativ)
2. send email — "ești pe lista de așteptare, ~N persoane înaintea ta la înscriere;
   dacă se eliberează un loc, ești anunțat imediat, primul care confirmă îl ia"
```
Poziția e informativă, nu o garanție de ordine — alocarea reală e prin cursă
(primul confirmat), nu prin ordinea de înscriere pe listă. Textul emailului
trebuie să reflecte asta corect, nu promisiune de FIFO strict.

### Când se eliberează un loc — broadcast, nu dequeue

Se declanșează la orice tranziție către `no_show`: buton „nu pot veni" pe email 2,
buton „nu pot veni" pe email 3 (nou, vezi mai jos), sau cutoff automat la 11:00.

**Funcție Inngest — `workshop/seat_freed`**
```
1. query toți cu status='asteptare' pentru acest event_slug
2. dacă lista e goală → nu face nimic
3. altfel → send email către TOȚI simultan:
   "S-a eliberat un loc. Primul care confirmă îl ia."
   link: /raspuns?token={confirm_token}&r=da   (tokenul lor existent, reutilizat)
```

### Revendicarea locului — cursă cu blocaj real

Mai mulți oameni pot da click aproape simultan. Fără blocaj la nivel de bază de
date, doi oameni pot „câștiga" același loc. Postgres advisory lock rezolvă asta
curat, fără tabel nou de capacitate:

```sql
-- în handler-ul /raspuns, DOAR când statusul curent e 'asteptare':
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('workshop-2026-09-16-seats'));

confirmati := SELECT count(*) FROM event_registrations
              WHERE event_slug='workshop-2026-09-16'
              AND status IN ('reconfirmat','prezent');

IF confirmati < 25 THEN
    UPDATE event_registrations SET status='reconfirmat', reconfirmed_at=now()
    WHERE confirm_token=$1 AND status='asteptare';
    -- pagină: "Felicitări, locul e al tău!" + oră/adresă/.ics + link check-in
    -- direct pe pagina de confirmare, nu prin alt email — timpul poate fi scurt
    -- dacă locul s-a eliberat aproape de ora evenimentului.
ELSE
    -- pagină: "Ne pare rău, locul a fost luat de altcineva. Rămâi pe listă."
END IF;

COMMIT;  -- eliberează lock-ul
```

Lock-ul serializează *doar* cursele din waitlist — nu se aplică la reconfirmarea
normală din status `inscris` (aia rămâne pe modelul de buffer soft de 30, decizia
originală, neschimbată).

### Cei rămași pe listă la final

**Funcție Inngest — `workshop/leftover-waitlist-notice`** (o singură rulare, batch,
nu per-persoană — trigger: scheduled, ex. 17 septembrie dimineața, sau manual)
```
1. query toți cu status='asteptare' rămas neschimbat
2. send email — "nu s-a eliberat loc de data asta; mai programăm un workshop
   unde ai prioritate la înscriere, înainte de lansarea oficială"
```
Conținutul exact al mesajului — TBD, ca și celelalte texte de email. Structura
e gata, doar corpul mesajului lipsește.

---

## Funcția Inngest principală — `workshop/registered`

Trigger: emis din `POST /api/register` pentru cei cu status inițial `inscris`
(nu pentru cei intrați direct pe `asteptare`).

```
1. send email 1 — confirmare imediată

2. step.sleepUntil("2026-09-14T09:00:00+03:00")

3. send email 2 — reconfirmare, deadline 11:00 pe 16 sept
   - buton [Confirm că vin] → /raspuns?token={confirm_token}&r=da
   - buton [Nu pot veni]    → /raspuns?token={confirm_token}&r=nu → emit seat_freed

4. step.sleepUntil("2026-09-16T11:00:00+03:00")

5. step.run("check-status")

6. branch:
   ├─ reconfirmat → send email 3 — "ne vedem azi" + oră/adresă/.ics
   │                 - buton [Nu pot veni] → /raspuns?token=xxx&r=nu → emit seat_freed
   │                   (NOU — cale de anulare și după reconfirmare, nu doar pe email 2)
   │
   └─ inscris (n-a răspuns) →
        UPDATE ... SET status='no_show' WHERE status='inscris'  -- condiționat
        → emit "workshop/seat_freed"

7. step.sleepUntil("2026-09-16T14:00:00+03:00")

8. step.run("check-status-again")   -- poate s-a schimbat între timp (pas 6, ramura "nu pot veni")

9. branch:
   ├─ reconfirmat → send email 4 — link de check-in (checkin_token)
   └─ orice alt status → nu trimite nimic
```

---

## Check-in ziua evenimentului

### Ruta A — persoane înscrise, cu link din email 4
`GET /checkin?token={checkin_token}`
1. `UPDATE ... SET status='prezent', checked_in_at=now() WHERE status='reconfirmat'`
   (condiționat)
2. pagină de mulțumire, brand-uită — atât, nimic declanșat automat

### Ruta B — walk-in, cod QR
Cod QR generic, afișat fizic (poster/ecran) → `https://deeplogic.ro/checkin-loc`

`GET+POST /checkin-loc` — formular minim: nume, email, **bifă consimțământ
comunicare** (obligatorie).
```
1. caută event_registrations JOIN contacts pe email
2. găsit  → UPDATE status='prezent', checked_in_at=now()
3. negăsit → INSERT contact + event_registration nou, status='prezent' direct
             (tokeni generați și aici, chiar dacă neutilizați)
4. pagină de mulțumire, brand-uită
```

**Materialele post-workshop:** nu se trimit automat la check-in. Separat, manual,
către segmentul `status='prezent'`, după eveniment.

---

## Securitate

**1. Entropia token-urilor** — criptografic random, minim 32 bytes, base64url sau UUID v4.

**2. Anti-spam** — Cloudflare Turnstile pe `POST /api/register`.

**3. Update condiționat, nu read-then-write** — toate tranzițiile de status prin
`UPDATE ... WHERE status = '<starea așteptată>'`.

**4. Advisory lock pe cursa din waitlist** — vezi secțiunea dedicată mai sus.
Fără el, două confirmări simultane pot aloca același loc de două ori.

**5. Constraint unic** — `unique (contact_id, event_slug)`, previne double-submit.

**6. Retry pe `inngest.send()`** — 2-3 încercări, apoi log/alertă dacă tot eșuează.
Fără asta, cineva poate rămâne înscris în Supabase fără să primească niciun email.

---

## Rute Astro — sumar

| Rută | Scop |
|---|---|
| `POST /api/register` | înscriere — validare, Turnstile, capacitate, insert, trigger Inngest |
| `GET /raspuns?token=xxx&r=da\|nu` | reconfirmare / anulare — **și** cursă de revendicare loc din waitlist |
| `GET /checkin?token=xxx` | bifare prezență din email 4 |
| `GET+POST /checkin-loc` | check-in walk-in, din QR |
| `GET/POST/PUT /api/inngest` | handler standard `inngest/astro` |

---

## Note de build — Cloudflare

- Activează `nodejs_compat` (Inngest are nevoie de `AsyncLocalStorage`)
- Variabile de mediu prin argumentul `env`, nu `process.env`
- SPF/DKIM/DMARC pe `deeplogic.ro` — le configurați dacă nu există deja

---

## Conținut `.ics` (atașat la emailul 3 și pe pagina de revendicare din waitlist)

```
SUMMARY: Prima Mutare spre un Asistent Digital — Deep Logic
DTSTART: 20260916T140000 (Europe/Bucharest)
DTEND:   20260916T170000 (Europe/Bucharest)
LOCATION: Casa Dăinuirii, Strada 1 Decembrie 1918 nr. 1, 440010 Satu Mare
```

---

## Decizii confirmate

| # | Decizie |
|---|---|
| 1 | Waitlist: broadcast la toată lista, primul confirmat ia locul — nu FIFO pe ordinea de înscriere |
| 2 | Cursa de revendicare: advisory lock Postgres, cap dur 25, separat de bufferul soft de 30 la înscriere |
| 3 | Buton „nu pot veni" pe email 2 ȘI pe email 3 (dimineața evenimentului) |
| 4 | Consimțământ: o singură bifă obligatorie, strict pt. prelucrarea datelor în scopul workshopului |
| 5 | Cei rămași pe listă la final primesc anunț despre viitorul workshop, cu prioritate la înscriere |
| 6 | Check-in = update status + ecran de mulțumire, fără trigger automat de email |
| 7 | Materialele post-workshop = manual, separat, către segmentul `prezent` |
| 8 | Token-uri: entropie criptografică, fără expirare, generate pentru toți la insert (inclusiv walk-in) |
| 9 | Cloudflare Turnstile, update condiționat, constraint unic pe double-submit, retry pe `inngest.send()` |

---

## Puncte deschise

| # | Punct |
|---|---|
| 1 | Cele 3–5 întrebări de calificare — discutate separat, nu blochează schema (jsonb) |
| 2 | Textele exacte ale celor 4 emailuri + mesajul pentru cei rămași pe waitlist la final |

---

## Ce NU e în scopul acestui document (deliberat)

- Arhitectura de replicare/read-only pentru viitorii agenți (sănătate, personal,
  business) conectați la acest Supabase — propose-then-commit, când va fi relevant.
- Interfața Notion peste `contacts`/`event_registrations` — integrare viitoare.
- Trimiterea materialelor post-workshop — manual, deocamdată.
- Formularul de închidere din sală (offline, la finalul workshopului) — alt artefact.
