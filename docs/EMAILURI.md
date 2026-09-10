# Emailuri — Workshop „PRIMUL PAS"

**Aprobat de Ciprian pe 28 august 2026.** Toate cele 4 puncte deschise din
prima variantă sunt tranșate — vezi „Decizii" la final. Gata pentru F6.

**Bug real, găsit la testarea end-to-end (2026-09-09):** denumirea veche a
produsului, „Prima Mutare spre un Asistent Digital", rămăsese hardcodată în
două subiecte de email și în subsolul comun (`src/emails/render.ts`,
`src/emails/templates.ts`), plus în ambele pagini legale — pivotul de produs
din 31 august (→ „PRIMUL PAS") actualizase `src/content/copy.ts` (pagina),
dar niciunul din aceste fișiere nu citea de-acolo. Corectat aici ȘI în cod;
subsolul comun citește acum `EVENIMENT.titlu` dinamic, nu un șir fix — un
pivot viitor de produs nu mai poate uita locul ăsta.

## Cum se citește documentul ăsta

- Ton: același ca landing page-ul — direct, la persoana I, fără fluff, fără
  corporatism. Fiecare email semnat **„Ciprian Micu - Deep Logic"**.
- **Variabile** în `{{acolade duble}}` — se completează la trimitere.
- **[Buton]** = link stilizat ca buton, nu text simplu.
- Aceleași invarianți ca pagina: fără preț, fără urgență fabricată, fără
  cifre neverificate. Un email care minte e la fel de grav ca o secțiune
  de pe pagină care minte.
- Fiecare email are un subsol identic (adresă + organizator) — vezi
  „Subsol comun" mai jos. Nu se repetă în fiecare bloc.

## Verificare de deliverability (28 august 2026)

Cerut explicit de Ciprian — verificat, nu presupus:

- **SPF/DKIM/DMARC** — toate verificate, confirmat direct din contul Resend
  și din DNS live. DKIM pe `deeplogic.ro`, SPF pe `send.deeplogic.ro`
  (subdomeniul dedicat al Resend — modelul lor standard, izolează reputația
  de trimitere de domeniul principal), DMARC `p=none` (monitorizare — poziția
  corectă înainte de lansare; nu trecem la `reject` acum).
- **List-Unsubscribe header — NU se adaugă.** E cerut de Gmail/Yahoo pentru
  expeditori de volum mare (mii de mailuri/zi). Aici: sub 200 de mailuri în
  toată campania, secvență tranzacțională legată de o înscriere concretă.
  Opt-out real, funcțional, prin „Nu mai pot veni" din email 2 și 3 (D101 —
  10 septembrie 2026 — a scos butonul din email 1, ton mai ferm) și prin
  răspuns direct la orice mail din secvență.
- **Subiectele** — verificate manual pe cuvinte care declanșează filtre
  (CAPS, „gratuit", „urgent", „garantat", semne de exclamare, simboluri de
  bani). Niciunul nu le conține.
- **Volum de trimitere** — batch-urile cele mai mari sunt ~25-30 mailuri
  simultan (email 2, la reconfirmare). Nu e un „vârf de volum" în sensul
  care afectează reputația la scara asta, prin infrastructura Resend.

---

## Email 1 — Confirmare imediată

**Trimis:** imediat după `POST /api/register`, pentru status `inscris`.
**Subiect:** `Locul tău e rezervat — PRIMUL PAS`

**Rescris 10 septembrie 2026 (D101), cerut explicit — ton mai ferm:** „ești
pe listă" suna condiționat; varianta nouă afirmă direct că locul e al
cititorului, nu-l lasă să se întrebe dacă rezervarea contează deja. Fără
mențiunea „ce aduci" (dacă vrea laptop, aduce; dacă nu, nu — nu prescriem).
Butonul „Nu mai pot veni" a ieșit — vezi nota tehnică de mai jos pentru
compromisul asumat față de B3.

```
Salut, {{nume}},

Ai un loc la PRIMUL PAS — te aștept miercuri.

Toate detaliile sunt mai jos — adaugă-le direct în calendar, ca să nu le
mai cauți.

──────────────────────────────
PRIMUL PAS
Miercuri, 16 septembrie 2026 · 14:00–17:00
Casa Dăinuirii
Strada 1 Decembrie 1918 nr. 1, 440010 Satu Mare — hartă: {{maps_url}}
──────────────────────────────

[Adaugă în calendar] → {{link_calendar}}

Cu două zile înainte îți scriu să-mi confirmi prezența — un răspuns rapid,
atât.
Întrebări? Răspunde direct la mailul ăsta.

Ne vedem miercuri,
Ciprian Micu - Deep Logic

{{subsol}}
```

**Notă tehnică:** `{{link_calendar}}` = `/eveniment.ics` (același fișier
static ca butonul de pe pagină/`/multumesc`/`/rezultat`). `{{maps_url}}` =
`EVENIMENT.mapsUrl`.

**Compromisul asumat față de B3 (linkul de anulare din email 1):** B3 exista
ca să nu stea un loc blocat 17 din 20 de zile dacă cineva știe din prima zi
că nu poate veni. Scoaterea butonului de aici reintroduce parțial riscul
ăla — asumat deliberat, ca preț pentru tonul ferm cerut („nu vreau să le dăm
ocazia să se sucească"). Calea de anulare rămâne funcțională prin email 2 și
3 (ambele o păstrează) și prin răspuns direct la orice mail din secvență —
doar nu mai e un buton dedicat, vizibil, chiar în primul mail.

---

## Email 2 — Reconfirmare

**Trimis:** luni, 14 septembrie, 09:00, pentru status `inscris`.
**Subiect:** `Vii miercuri? Am nevoie de un răspuns până la 11:00`

```
Salut, {{nume}},

Miercuri e workshopul. Am nevoie să știu sigur cine vine, ca să nu țin
locuri goale în timp ce alții așteaptă pe listă.

Răspunde până miercuri, 16 septembrie, ora 11:00 — după ora asta, dacă n-am
auzit nimic de la tine, dau locul mai departe.

[Confirm că vin]  → {{link_confirmare}}
[Nu pot veni]     → {{link_anulare}}

Detalii, ca să le ai la îndemână:
Miercuri, 16 septembrie · 14:00–17:00
Casa Dăinuirii, Strada 1 Decembrie 1918 nr. 1, Satu Mare

Ciprian Micu - Deep Logic

—
Dacă ai bifat că vrei o discuție separată, nu ține de mailul ăsta — te caut
eu, separat.

{{subsol}}
```

**Notă tehnică:** `{{link_confirmare}}` = `/raspuns?token={{confirm_token}}&r=da`,
`{{link_anulare}}` = `...&r=nu`. Cutoff automat la 11:00 pe 16 septembrie —
vezi `expire_unconfirmed()`.

---

## Email 3 — „Ne vedem azi"

**Trimis:** miercuri, 16 septembrie, 11:00, doar pentru status `reconfirmat`.
**Subiect:** `Azi, 14:00 — Casa Dăinuirii`

```
Salut, {{nume}},

Azi ne vedem. 14:00, Casa Dăinuirii, Strada 1 Decembrie 1918 nr. 1, Satu
Mare. Am atașat evenimentul, ca să-l ai direct în calendar.

Un pix. Atât ai nevoie.

Dacă între timp chiar nu mai poți ajunge, spune-mi acum, nu la ușă — ia
altcineva locul.

[Nu mai pot veni] → {{link_anulare}}

Pe curând,
Ciprian Micu - Deep Logic

{{subsol}}
```

**Fișier atașat:** `.ics`, conform `docs/spec-tehnic-inscriere-16-09.md` §
„Conținut .ics". **Notă tehnică:** `{{link_anulare}}` folosește ACELAȘI
`confirm_token` — calea de anulare există și după reconfirmare (decizia 3
din spec), nu doar pe email 2.

---

## Email 4 — Link de check-in

**Trimis:** miercuri, 16 septembrie, 13:30 (B14 — nu 14:00 fix; oamenii ajung
mai devreme), doar pentru status `reconfirmat`.
**Subiect:** `Te aștept — check-in rapid la sosire`

```
Salut, {{nume}},

Peste puțin timp începem. Când ajungi, apasă linkul de mai jos — te bifez
pe listă și gata, nu mai pierdem timp la intrare.

[Sunt aici] → {{link_checkin}}

Dacă nu apuci să-l apeși, nicio problemă — te bifez oricum la intrare.

Ne vedem imediat,
Ciprian Micu - Deep Logic

{{subsol}}
```

**Notă tehnică:** `{{link_checkin}}` = `/checkin?token={{checkin_token}}`.

---

## Email 5 — Ai intrat pe lista de așteptare

**Trimis:** imediat după `POST /api/register`, pentru status `asteptare`
(funcția `workshop/waitlisted`).
**Subiect:** `Ești pe lista de așteptare — PRIMUL PAS`

```
Salut, {{nume}},

Cele 30 de locuri sunt ocupate. Te-am trecut pe lista de așteptare.

Aproape mereu se eliberează locuri — oameni care anunță că nu mai pot veni.
Când se întâmplă, primești imediat un mail, împreună cu toți ceilalți de pe
listă. Primul care confirmă îl ia.

Nu trebuie să faci nimic acum. Dacă se eliberează un loc, afli direct de
la mine.

Ciprian Micu - Deep Logic

{{subsol}}
```

**Notă tehnică — de ce fără poziție pe listă (decizie 28 august):** sistemul
nu e FIFO — la eliberare, TOȚI cei de pe listă sunt anunțați simultan, câștigă
primul care apasă butonul, nu ordinea de înscriere. „Ești al 5-lea" ar implica
o coadă care se mișcă în ordine, care nu există — cineva de pe poziția 8 poate
lua locul înaintea celui de pe poziția 1. Scos ca să nu promitem ceva ce
mecanismul nu respectă.

---

## Email 6 — S-a eliberat un loc

**Trimis:** broadcast către toți cu status `asteptare`, la orice tranziție
spre `no_show`/`anulat` (funcția `workshop/seat_freed`, cu debounce — B1).
**Subiect:** `S-a eliberat un loc — primul care confirmă îl ia`

```
Salut, {{nume}},

{{mesaj_locuri}}

Dacă vrei să vii, apasă acum — primul care confirmă îl ia. Dacă ajungi al
doilea, rămâi pe listă și te anunț din nou dacă se mai eliberează ceva.

[Confirm că vin] → {{link_revendicare}}

Ciprian Micu - Deep Logic

{{subsol}}
```

**Notă tehnică — pluralul, nu „un loc" mereu (B1):**
`{{mesaj_locuri}}` variază după câte locuri s-au eliberat în fereastra de
debounce (2 minute):
- 1 loc: „S-a eliberat un loc."
- N locuri: „S-au eliberat {{n}} locuri."

`{{link_revendicare}}` = `/raspuns?token={{confirm_token}}&r=da` — **același
token**, reutilizat; comportamentul diferă în funcție de statusul curent al
rândului (`claim_waitlist_seat`, cu advisory lock). Dacă locul s-a ocupat
între timp, pagina de răspuns arată „Locul a fost luat" (`stari.locLuat`),
nu o eroare.

---

## Email 7 — Rămași pe listă la final

**Trimis:** o singură rulare, batch, ~17 septembrie dimineața (funcția
`workshop/leftover-waitlist-notice`), către toți cu status `asteptare`
neschimbat.
**Subiect:** `N-a fost loc de data asta`

```
Salut, {{nume}},

N-am reușit să-ți fac loc la workshopul de miercuri — n-a plecat nimeni
de pe listă la timp cât să-ți pot da vestea bună.

Dacă mai organizez un workshop similar, ești primul anunțat, înainte de
lansarea oficială — și ai prioritate la înscriere, nu mai treci prin coadă.

Îmi pare rău că nu s-a potrivit de data asta.

Ciprian Micu - Deep Logic

{{subsol}}
```

**Notă:** formulare condițională (decizie 28 august) — „dacă mai organizez",
nu „mai organizez". Spec-ul marca acest text ca TBD; nu există încă un
workshop următor confirmat.

---

## Email 8 — Retenție date, la 1 an

**Trimis:** de sweep-ul zilnic Inngest (`retention-sweep.ts`), către orice contact
cu 1 an de la ultima (re)confirmare, o singură dată per ciclu.
**Subiect:** `Vrei să-ți păstrez datele de contact?`

```
Salut, {{nume}},

A trecut un an de când mi-ai lăsat datele de contact, la înscrierea la un
eveniment Deep Logic. Le păstrez maximum un an, apoi le șterg — așa am promis
în politica de confidențialitate.

Dacă vrei să le păstrez în continuare, apasă linkul de mai jos.

[Păstrează-mi datele] → {{link_reconfirmare}}

Dacă nu răspunzi în 30 de zile, le șterg automat din bază — nu trebuie să
faci nimic ca să se întâmple asta.

Ciprian Micu - Deep Logic

{{subsol}}
```

**Notă tehnică:** `{{link_reconfirmare}}` = `/pastreaza-datele?token={{retention_token}}`.
Fereastra de 30 de zile trăiește ca DEFAULT în `purge_expired_retention()`
(migrația 0006) — dacă se schimbă acolo, textul de mai sus trebuie actualizat
manual, nu se citește dinamic din SQL.

**Aprobat de Ciprian pe 28 august 2026**, fără modificări față de draft — același
proces ca emailurile 1-7. A apărut din decizia din aceeași zi de a construi
automatizarea de retenție promisă în Politica de Confidențialitate (vezi
`docs/DECIZII.md`), nu dintr-un text scris de el de la zero, dar a trecut prin
aceeași aprobare explicită înainte de producție.

---

## Subsol comun

Aceeași linie, la finalul fiecărui email — semnal de legitimitate pentru
filtrele de spam, gratis, și consistent cu footer-ul de pe pagină:

```
—
Deep Logic · Satu Mare, România
Ai primit mailul ăsta pentru că te-ai înscris la „PRIMUL PAS" pe workshop.deeplogic.ro.
```

---

## Decizii (28 august 2026)

| # | Decizie | Rezultat |
|---|---|---|
| 1 | Poziția pe listă în email 5 | **Scoasă.** Sistemul nu e FIFO — cifra ar fi implicat o promisiune falsă de ordine. |
| 2 | „Workshop următor" în email 7 | **Formulare condițională** — „dacă mai organizez", nu „mai organizez". |
| 3 | Semnătura | **„Ciprian Micu - Deep Logic"**, cratimă simplă, peste tot. |
| 4 | `EMAIL_FROM` + spam-safety | **Verificat live**: SPF/DKIM/DMARC corecte, subiecte curate, List-Unsubscribe nu e necesar la volumul ăsta. `EMAIL_FROM` actualizat să reflecte semnătura din #3. |
