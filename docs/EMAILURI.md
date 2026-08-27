# Emailuri — Workshop „Prima Mutare spre un Asistent Digital"

**Draft pentru review-ul lui Ciprian, înainte să intre în cod (F5 → F6).**
Șapte texte: 4 din ciclul principal de înscriere + 3 din ciclul de waitlist.

## Cum se citește documentul ăsta

- Ton: același ca landing page-ul — direct, la persoana I (Ciprian scrie, nu
  „echipa Deep Logic"), fără fluff, fără corporatism. Fiecare email e semnat
  „Ciprian", nu „Echipa Deep Logic".
- **Variabile** în `{{acolade duble}}` — se completează la trimitere.
- **[Buton]** = link stilizat ca buton, nu text simplu — vezi nota tehnică
  de la fiecare email pentru URL-ul exact.
- Aceleași invarianți ca pagina: fără preț, fără urgență fabricată, fără
  cifre neverificate. Un email care minte e la fel de grav ca o secțiune
  de pe pagină care minte.
- **De modificat înainte de trimitere reală:** orice paranteză marcată
  `⚠ DE CONFIRMAT`.

---

## Email 1 — Confirmare imediată

**Trimis:** imediat după `POST /api/register`, pentru status `inscris`.
**Subiect:** `Ești înscris — Prima Mutare spre un Asistent Digital`

```
Salut, {{nume}},

Ești pe listă. Miercuri, 16 septembrie, 14:00–17:00, la Casa Dăinuirii —
Strada 1 Decembrie 1918 nr. 1, Satu Mare.

Nu trebuie să faci nimic acum. Cu două zile înainte îți scriu din nou, să
confirmi că vii — abia atunci contează locul rezervat.

Un singur lucru dacă se schimbă ceva: dacă știi deja acum că nu mai poți
veni, spune-mi, ca să dau locul mai departe din timp, nu în ultima clipă.

[Nu mai pot veni] → {{link_anulare}}

Ne vedem miercuri,
Ciprian

—
Ce aduci: un pix. Atât.
Întrebări? Răspunde direct la mailul ăsta.
```

**Notă tehnică:** `{{link_anulare}}` = `/raspuns?token={{confirm_token}}&r=nu`.
E linkul nou din B3 — nu exista în spec-ul original, adăugat ca să nu stea un
loc blocat 17 din 20 de zile dacă cineva știe din prima zi că nu poate veni.

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

Ciprian

—
Dacă ai bifat că vrei o discuție separată, nu ține de mailul ăsta — te caut
eu, separat.
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
Ciprian
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
Ciprian
```

**Notă tehnică:** `{{link_checkin}}` = `/checkin?token={{checkin_token}}`.

---

## Email 5 — Ai intrat pe lista de așteptare

**Trimis:** imediat după `POST /api/register`, pentru status `asteptare`
(funcția `workshop/waitlisted`).
**Subiect:** `Ești pe lista de așteptare — Prima Mutare spre un Asistent Digital`

```
Salut, {{nume}},

Cele 25 de locuri sunt ocupate. Te-am trecut pe lista de așteptare —
{{pozitie}} înaintea ta la înscriere ⚠ DE CONFIRMAT: păstrăm afișarea
poziției? E informativă, nu o garanție de ordine.

Aproape mereu se eliberează locuri — oameni care anunță că nu mai pot veni.
Când se întâmplă, primești imediat un mail. Primul care confirmă îl ia, nu
contează poziția de pe listă.

Nu trebuie să faci nimic acum. Dacă se eliberează un loc, afli direct de
la mine.

Ciprian
```

**Notă tehnică:** `{{pozitie}}` = `count(*) where status='asteptare' and
created_at < a lui`. Textul de mai sus reflectă corect că e informativ, nu
FIFO — vezi spec, secțiunea „workshop/waitlisted".

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

Ciprian
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
**Subiect:** `N-a fost loc de data asta — dar ții minte pentru următorul`

```
Salut, {{nume}},

N-am reușit să-ți fac loc la workshopul de miercuri — n-a plecat nimeni
de pe listă la timp cât să-ți pot da vestea bună.

Mai organizez un workshop. Când stabilesc data, tu ești primul anunțat,
înainte de lansarea oficială — și ai prioritate la înscriere, nu mai treci
prin coadă.

Îmi pare rău că nu s-a potrivit de data asta.

Ciprian
```

**Notă tehnică:** spec-ul marca acest text ca „TBD" — e primul draft.
⚠ DE CONFIRMAT: chiar există un workshop următor planificat, sau formularea
„mai organizez" e prematură? Dacă nu-i decis, aș înmuia în „dacă mai
organizez un workshop similar, ești primul anunțat".

---

## Rezumat — ce rămâne de decis înainte de F6

| # | Unde | Întrebare |
|---|---|---|
| 1 | Email 5 | Păstrăm poziția pe listă (`{{pozitie}}`) sau o scoatem, ca să nu sugereze FIFO din greșeală? |
| 2 | Email 7 | Există un workshop următor real, sau formulăm condițional? |
| 3 | toate | Semnătura „Ciprian" simplă, sau `Ciprian Micu · Deep Logic`? |
| 4 | toate | Confirmi `EMAIL_FROM` deja setat: `Ciprian Micu · Deep Logic <ciprian@deeplogic.ro>` — rămâne? |
