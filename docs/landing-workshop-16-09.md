# Landing page — „PRIMUL PAS"
**Workshop gratuit by Deep Logic · miercuri, 16 septembrie 2026 · 14:00–17:00 · Satu Mare**

> Sursă de adevăr pentru copy — vezi CLAUDE.md, secțiunea „Sursele de adevăr". Implementarea
> completă trăiește în [`src/content/copy.ts`](../src/content/copy.ts); acest fișier descrie
> INTENȚIA (structura, mesajul, ordinea), copy.ts descrie STAREA EXACTĂ (fiecare propoziție,
> tipată). Dacă cele două diverg vreodată, `copy.ts` e cel corect — dar divergența e un bug de
> documentare, nu o stare acceptabilă; se resincronizează, nu se ignoră.

---

## Resincronizare (2 septembrie 2026) — al doilea pivot al zilei

Acest document a fost rescris integral odată cu **pivotul de structură**: 16 secțiuni
(§01–§17) → 10 (Hero → Trust bar → Problemă → Agravare → Soluție → Facilitator → Cui i se
adresează → Cui nu i se adresează → Ce rezultat promitem → FAQ), plus metodologia cu cei cinci
pași (pin/scrub GSAP) păstrată separat, explicit, dincolo de cele 10 numărate de Ciprian.
Motivul declarat: structura veche „prea stufos, diluăm mesajul".

În aceeași zi, cu câteva ore înainte, avusese loc și un **pivot de narativă** — H1 nou,
mecanismul owner→echipă→date mutat devreme în pagină. Istoricul complet al ambelor pivoturi,
decizie cu decizie, e în [`docs/DECIZII.md`](DECIZII.md) (D31–D54). Mapare veche→nouă, pe
conținut (7 secțiuni retrase ca atare, conținutul absorbit, nu pierdut):

| Secțiune nouă | Absoarbe (structura veche, §01–§17) |
|---|---|
| Hero | §01 Hero — fișa evenimentului retrasă, acoperită de Trust bar |
| Trust bar *(nouă)* | Adresa completă (fostă §13 Detalii), formatul 20/80, capacitate |
| Problemă | §02 Problema, plus spiritul grid-ului de exemple (fostă §09 UseCases) |
| Agravare *(nouă)* | — |
| Soluție | §10 DespreDeepLogic — mecanismul, rescris și extins |
| *(metodologia, păstrată separat)* | §06 CeFacem, neschimbată de acest pivot |
| Facilitator | §11 Facilitator |
| Cui i se adresează / nu | §04 PentruCine |
| Ce rezultat promitem | §03 Rezultatul + §12 Precedent („20/80") + conținut nou |
| FAQ | §15 Faq |
| CTA final | §16 Inscriere |

Retrase ca secțiuni proprii, fără echivalent nou: §05 InainteDupa (tabel), §07 NuDoarTeorie
(obiecția), §14 DeCeGratuit (absorbită în răspunsul FAQ „Este participarea cu adevărat
gratuită?"). `CtaSticky.astro` (bară fixă doar-mobil) înlocuită de `CtaFloating.astro`
(buton flotant, toate viewport-urile).

---

## META — reguli globale

```yaml
brand: Deep Logic
produs: "PRIMUL PAS"
limba: ro
ton: direct, matur, curios, aplicat, fără hype și fără jargon gratuit

eveniment:
  data: "16 septembrie 2026"
  ora: "14:00–17:00"
  oras: "Satu Mare"
  locatie: "Casa Dăinuirii, Strada 1 Decembrie 1918 nr. 1, 440010 Satu Mare"
  locuri_maxime: 30
  cost: "Gratuit"

format:
  context: "20%"
  lucru_aplicat: "80%"

scarcity:
  countdown: real
  locuri_ramase: dinamic
  regula: "fără deficit fals; afișează doar date reale"

cta_text: "Rezervă-ți locul"
cta_ancora: "#inscriere"
cta_sub_text: "Disponibil X/30 — numărul real, din locuriDisponibilePublic()"
cta_repetat_la: [hero, finalul_sectiunii_rezultat, cta_final]
cta_flotant: "vizibil pe toate viewport-urile după ce iese hero-ul din cadru"

vizual:
  accent_lime: "#84CC16 — DOAR fundal (CTA-uri, buton calendar), text pe el mereu închis"
  radius_cta: "14px fix, nu procent"
  carduri: "sticlă mată (gradient de culoare în propriul fundal + backdrop-filter blur)"
```

**Reguli de copy și build:**
- Un singur CTA pe toată pagina: „Rezervă-ți locul". Mobile-first, scanabil din WhatsApp.
- Sub CTA, numărul real de locuri disponibile — niciodată inventat.
- Nu transformăm pagina într-un curs despre AI. Vindem claritatea și primul pas, nu tehnologia.
- Nu promitem că în 3 ore găsim implementarea corectă. Promitem că participantul își
  clarifică nevoia, începe să-i estimeze impactul și pleacă cu un roadmap personalizat de
  validare.
- Nu promitem agenți, automatizări, prompturi sau tool-uri. Nu menționăm demo-uri-surpriză.
- AI apare unde e necesar pentru claritate, nu în fiecare titlu.
- Ordinea Deep Logic se simte în toată pagina: business → oameni → procese → impact →
  tehnologie.
- **Countdown-ul și numărul de locuri rămase sunt alimentate din date reale** — vezi
  `BaraScarcity.astro` și `src/pages/api/locuri-disponibile.ts`. Regula: „fără deficit fals".
- Locația exactă rămâne pe pagină (decizie D6) — acum în Trust bar, nu într-o secțiune
  „Detalii practice" separată.

---

## 01 — HERO

```COPY
[EYEBROW]
PRIMUL PAS · Workshop by Deep Logic

[H1]  — trei rânduri cu roluri diferite, nu trei fragmente egale
Afacerea ta este diferită.                 ← afirmația de deschidere, corp mai mic (0,75×)
Cum faci PRIMUL PAS                        ← întrebarea, corp mare; „PRIMUL PAS" accentuat
în noua eră digitală?                      ← întrebarea, exact aceeași mărime ca rândul 2

[SUBHEADLINE]  — două paragrafe
Vino să descoperi, alături de alți antreprenori ca tine, ce merită făcut mai întâi pentru a
aduce automatizările și AI-ul în compania ta.

Lucrăm timp de 3 ore, fiecare pe propria afacere. La final, pleci cu un roadmap personalizat
de validare — ca să știi ce merită investigat, ce procese sau sarcini ar putea fi automatizate
ori delegate AI-ului și care este, pe bune, PRIMUL PAS.

[CORP]
Nu discutăm tehnic, discutăm soluții la probleme reale.

[CTA]
Rezervă-ți locul
```

**Notă de implementare:** fișa evenimentului (dată/oră/loc) a fost retrasă de-aici la pivotul
de structură — Trust bar, chiar dedesubt, o acoperă deja. Hero rămâne strict: titlu,
promisiune, CTA.

**Resincronizat 7 septembrie 2026 (runda 7).** Două schimbări, ambele cerute direct:

1. **H1-ul e o structură, nu o listă.** Fiecare rând trebuie să ocupe EXACT un rând vizual pe
   orice ecran — de aici mărimea calculată din lățimea containerului (`cqi`) și
   `white-space: nowrap`, nu `clamp()` pe viewport. Vezi CLAUDE.md §1, runda a șaptea, și
   `tests/e2e/hero.spec.ts` (alarma pentru un copy viitor care nu mai încape).
2. **„roadmap de implementare" → „roadmap personalizat de validare".** Hero-ul era singurul
   loc din pagină care promitea implementare într-un workshop de trei ore; §09 și
   `meta.descriere` spuneau deja „validare". Divergența era o promisiune, nu o nuanță.

---

## 02 — TRUST BAR *(secțiune nouă)*

```COPY
[TITLU]
Miercuri, 16 septembrie 2026

[RÂNDURI]  — fiecare: pictogramă + valoare + detaliu opțional
⏱  14:00–17:00
   3 ore: 20% context · 80% lucru pe propria afacere
⌖  Casa Dăinuirii
   Strada 1 Decembrie 1918 nr. 1, 440010 Satu Mare
⚇  Maximum 30 de participanți
▤  Roadmap digital personalizat
   Primit pe email, la final.

── perforație ──

[TALON — ACCES]  (roșu)
Participarea este gratuită, pe bază de invitație.

[TALON — CTA CALENDAR]
Adaugă în calendar → /eveniment.ics (precompletat: locație, dată, oră, alertă 24h înainte)
```

**Resincronizat 7 septembrie 2026 (runda 7) — cardul a devenit BILET.** Motivul declarat:
„acum mi se pare doar aglomerat". Ce s-a schimbat la nivel de copy, nu doar de formă:

- **`[META]` a dispărut.** Era o propoziție-rezumat doar pentru cititoarele de ecran, care
  dubla exact rândurile vizibile. D6 (adresa completă pe pagină) e acoperit acum de rândul
  vizibil „Casa Dăinuirii / Strada 1 Decembrie 1918…", nu de text ascuns.
- **`[FORMAT]` s-a spart în rânduri.** „20% context · 80% lucru" a devenit detaliul rândului
  de oră (unde înseamnă ceva: cum se împart cele 3 ore), „Maximum 30" e rând propriu.
  Formulările „20% context" și „80% lucru" trebuie păstrate LITERAL — sunt singura excepție
  din invariantul „fără procente pe pagină" (`tests/copy-invariants.test.ts`).
- **`[INVITAȚIE]` + „Gratuit" s-au unit în `[TALON — ACCES]`**, în roșu, cerut explicit.
  Spuneau bucăți din aceeași condiție de acces, în două locuri diferite. Atenție:
  invariantul „«gratuit» apare de exact trei ori în corpul paginii" (Trust bar + FAQ + CTA
  final) — rândul ăsta e unicul „gratuit" din Trust bar.
- **Semnalat lui Ciprian, decizia lui:** „pe bază de invitație" e mai tare decât ce face
  sistemul — formularul e deschis pe o pagină publică, deci cine ajunge pe link fără
  invitație se poate înscrie. Formularea veche („distribuit **în principal** prin invitații")
  exista exact din motivul ăsta.

**Resincronizat 7 septembrie 2026 (a doua rundă a aceleiași zile) — bilet +20%, talon
centrat.** Cerut explicit: „cardul... cu 20% mai mare" și „textul cu roșu... pe mijlocul
paginii, inclus în card". Prima variantă a biletului (mai sus) rotea structura pe orizontală
peste 46rem — corp stânga, talon dreapta — ca să evite un gol în jumătatea dreaptă a unui
card lat. Rezultatul împingea vizual `[TALON — ACCES]` spre marginea paginii, opusul cerinței.
Corectat: biletul rămâne pe o singură coloană, pe verticală, la orice lățime; talonul (roșu +
buton) e centrat. Mărimea (+20%) e o scară locală peste tot ce ține de bilet — text,
pictograme, spațiere — nu o schimbare a tipografiei globale a paginii.

**Notă de implementare:** distinct de `BaraScarcity.astro` (bara fixă, mereu vizibilă la
scroll) — Trust bar e un bloc din flux, o singură dată. Cardul „Adaugă în calendar" e o
funcție reală (nu doar link static): deschide aplicația de calendar a telefonului
precompletată, un singur tap.

---

## 03 — PROBLEMA

```COPY
[H2]
Simți că unele aspecte ale afacerii tale ar putea funcționa mai bine:

[EXEMPLE — listă]
Gestionarea și procesarea informațiilor din documente
Viteza de răspuns la solicitările de ofertă venite din partea prospecților sau clienților
Raportările către management sau direct către tine, pe baza cărora poți lua decizii informate

[H2 — al doilea, la ACELAȘI nivel cu primul]
Iar întrebările care nu-ți dau pace sunt:

[ÎNTREBĂRI — listă]
De unde să încep?
Ce arde mai tare?
Cine urlă mai tare?

[CONCLUZIE]
Rezultatul acestor incertitudini? Te blochezi. Apar anxietatea și frica de a pierde
oportunități — FOMO.
Unde mai pui că tehnologia avansează rapid și, sincer, devine copleșitoare chiar și pentru
experții din domeniu.
În tot zgomotul acesta, presiunea de a face ceva crește înainte să fie clar ce merită făcut.
```

**Notă de implementare:** cea mai importantă secțiune a paginii. Nu se taie la mobil,
indiferent ce — regulă neschimbată de pivotul de structură. Deschide direct cu exemple
concrete, nu cu un bloc de „vacarm" separat.

**Resincronizat 7 septembrie 2026 (a treia rundă a aceleiași zile) — copy nou, primit de la
Ciprian.** Înlocuiește integral varianta de mai sus: `[SAU POATE]` și `[ÎNTRE TIMP]` au
dispărut, niciuna din cele două nu mai apare în textul nou. Structura devine două liste
scurte (simptome, apoi întrebările care blochează) urmate de o concluzie de trei propoziții
care NU se mai închide cu o întrebare mare, ci cu o afirmație — legată narativ de h2-ul din
§04 Agravare, chiar dedesubt („Cel mai scump început..."). Ierarhia de titluri a fost
verificată înainte de implementare (cerut explicit): `h1` STRICT în hero, fiecare altă
secțiune de top pe `h2` — niciun salt găsit, §03 rămâne `h2`. Liniuțele din textul brut trimis
au devenit o listă `<ul><li>` reală, cu marcaj **bulină** (`•`, `--accent-decor`) — vezi
`docs/DECIZII.md` D66–D70.

**Două corecții pe loc, la feedback direct, în aceeași rundă:** (1) marcajul livrat prima dată
era em-dash, nu bulină („am cerut bulets nu linii"); (2) blocul de concluzie fusese separat
printr-o linie orizontală, cu ultima propoziție la corp mare — împreună, cele două citeau ca o
secțiune NOUĂ („ce ți-am dat este o secțiune, nu trebuie divizată"). Textul de mai sus e UN
bloc: h2, listă, al doilea h2, listă, concluzie — fără nicio ruptură vizuală.

**A treia corecție, aceeași rundă:** „Iar întrebările care nu-ți dau pace sunt:" a trecut de la
paragraf mic, gri, la `h2` — la același nivel cu primul intro, cerut direct. Cele două perechi
titlu+listă stau una lângă alta peste 52rem, ca secțiunea să folosească lățimea `larg` pe care
o declara deja. Vezi `docs/DECIZII.md` D71.

---

## 04 — AGRAVARE *(secțiune nouă)*

```COPY
[H2]
Ambiguitatea are un cost. Și poate ți-e groază să-l calculezi.

[CORP — o singură frază]
Presiunea pusă pe echipă crește până când nu mai rămâne nicio marjă de înțelegere, compania se
mișcă prea încet față de piață și așteptările clienților, iar concurența folosește deja
instrumente moderne — simți că rămâi în urmă, iar toate acestea se adună în costuri ascunse
care apasă sănătatea financiară a companiei.

[CARD — quickwin]
De aceea merită cele 3 ore.
Nu ca să alegi încă o unealtă.
Ci ca să clarifici ce merită rezolvat mai întâi.
```

**Resincronizat 7 septembrie 2026 (a patra rundă a aceleiași zile) — copy nou, primit de la
Ciprian.** Înlocuiește integral varianta de mai sus: `[ALTERNATIVA]` a dispărut, iar cardul s-a
strâns de la trei câmpuri (h3 + corp final + concluzie) la titlu + două rânduri de contrast
(„nu X / ci Y"), numit explicit „quickwin card". Paragraful `[CORP]` e păstrat ca O SINGURĂ
frază — patru propoziții înlănțuite, nu tăiate separat: acumularea („toate acestea se adună")
e mesajul, nu doar conținutul lui. Cardul refolosește `.card-depth` (aceeași sticlă mată ca
biletul din Trust bar) — vezi `docs/DECIZII.md` D72.

---

## 05 — SOLUȚIA

```COPY
[H2]
Soluția este PRIMUL PAS, munca dinaintea implementării.

[INTRO]
În AI și automatizări, blocajul nu vine din lipsa de informații. Vine din faptul că prea multe
arii ale afacerii par să merite atenție în același timp. Fără o metodă, fie amâni, fie alegi
după ce pare urgent astăzi.

În cele trei ore punem perspectiva ta de owner într-o ordine de lucru și stabilim ce arie
merită investigată prima.

[METODĂ — etichetă, nu heading]
Cum lucrăm, concret

[01] Punem pe masă ce te apasă — Inventariem ariile în care simți că se pierd timp, bani sau
oportunități. Fără să alegem și fără să căutăm încă soluții.

[02] Clarificăm ce vrei să fie diferit — Pentru fiecare arie, definim ce se întâmplă acum, ce
rezultat ai vrea să obții și după ce ai recunoaște o schimbare reală.

[03] Le punem una lângă alta — Le comparăm pe baza a ceea ce știi astăzi: cât de des apar
blocajele, ce consumă, ce întârzie și cât de mult contează pentru direcția companiei.

[04] Prioritizăm o singură arie — Nu alegem ce sună mai spectaculos pentru AI. Alegem aria
pentru care există cele mai bune motive să începi investigația.

[05] Separăm ce știi de ce presupui — Notăm ce este fapt, ce este estimare și ce trebuie
verificat. Așa vedem ce presupunere ar putea confirma sau răsturna alegerea făcută.

[06] Construim roadmap-ul de validare — Stabilim ce trebuie să afli mai departe, cu cine din
companie trebuie să vorbești, la ce date merită să te uiți și care este primul pas concret
după workshop.

[CARD — quickwin #1]
La finalul celor trei ore
Pleci cu aria prioritară, prima ipoteză de business și un roadmap de validare: ce verifici,
cu cine, în ce ordine și care este primul pas.

[H3]
Ce poți face, concret, cu roadmap-ul?

[AFTERLIFE INTRO]
A doua zi, nu te întorci în companie cu „ar trebui să facem și noi ceva cu AI”. Ai un punct
clar de pornire:

[AFTERLIFE — listă]
Îl prezinți partenerului sau managerilor ca perspectivă a ta de owner — nu ca verdict.
Organizezi un workshop de discovery cu oamenii care lucrează în aria respectivă.
Compari ceea ce vezi tu cu realitatea lor: blocajele, excepțiile și munca nevăzută din proces.
Identifici ce procese trebuie analizate și ce proceduri, informații sau date lipsesc ori
trebuie actualizate.
Transformi concluziile în următoarea acțiune: ce verifici, cine se ocupă și ce dovadă cauți.
Folosești rezultatul ca filtru pentru orice soluție de AI sau automatizare care îți este
propusă.

[AFTERLIFE CONCLUZIE]
Poți parcurge pașii cu echipa ta. Sau putem continua împreună: facilităm discovery-ul, mapăm
procesul real și stabilim dacă există motive suficiente pentru o implementare.

Abia atunci decidem ce trebuie construit — și dacă AI-ul este, într-adevăr, soluția potrivită.

[CARD — quickwin #2, închidere]
PRIMUL PAS nu este implementarea. Este prima acțiune concretă care face o implementare bună
posibilă.
```

**Notă de implementare:** diferențiatorul central al paginii, poziționat devreme (după
Problemă și Agravare), nu o prefață despre firmă. Fostă `despreDeepLogic`/S10Deeplogic.astro —
vezi `docs/DECIZII.md` D31–D33 pentru istoricul mecanismului.

**Resincronizat 8 septembrie 2026 — copy nou, primit de la Ciprian.** Înlocuiește integral
varianta de mai sus: `[ÎNTREBĂRI]`, `[CONCLUZIE INTRO]`, fostul `[H3]` „Afacerea ta nu are o
singură realitate" + `[PERSPECTIVA]`, `[MECANISM]` (vechiul, 4 rânduri) și al doilea `[H3]`
„Asta înseamnă pentru mine noua eră digitală" au dispărut integral. Secțiunea crește mult:
intro (2 paragrafe) → metodă (6 pași, titlu+descriere) → card quickwin → afterlife (h3 + intro
+ 6 bullete + 2 paragrafe de închidere) → card final. Ierarhie verificată explicit: cele șase
titluri de pași sunt `h3`, direct sub `h2`-ul secțiunii — eticheta „Cum lucrăm, concret" NU e
heading (altfel ar fi împins titlurile la h4, primul de pe pagină). Bulete reale pe lista
afterlife (aceeași bulină ca la corecția din §02), nu liniuțe. Vezi `docs/DECIZII.md` D73–D77.

---

## *(metodologia cu cinci pași — RETRASĂ 2026-09-08)*

Exista aici, până pe 8 septembrie 2026, un al 11-lea bloc — „Cei cinci pași ai metodologiei
Deep Logic" (PRIMUL PAS / WORKSHOP CU ECHIPA / PROCESE + IMPACT + ROI / DECIZIA /
IMPLEMENTAREA), păstrat deliberat în afara celor 10 secțiuni cerute explicit de Ciprian —
confirmat printr-o decizie separată (`AskUserQuestion`, D38), singurul pin/scrub GSAP de pe
pagină, poziționat după Soluție, înainte de Facilitator.

**Retras, explicit:** „renunțăm la metodologie, secțiunea mai jos, pentru că explicăm cum
ajungem la rezultat" — §05 Soluție a căpătat între timp propria metodă (6 pași, titlu+
descriere, D73–D75), scrisă chiar în ziua precedentă. O secțiune separată care repeta aceeași
idee, cu alți 5 pași diferiți, era dublură, nu întărire — reversează D38. Pagina revine astfel
la exact cele 10 secțiuni din framework-ul anunțat inițial, fără nicio secțiune în plus.

Retragerea a scos și singurul consumator al Lenis+GSAP de pe pagină (~49KB gzip JS) —
apparatus-ul a ieșit odată cu ea (`npm uninstall gsap lenis`, `S06CeFacem.astro` șters). Vezi
`docs/DECIZII.md` D78–D79 pentru cascada completă.

---

## 06 — FACILITATOR

```COPY
[H2]
Cine ține workshopul?

[BYLINE]
Ciprian Micu
FONDATOR DEEP LOGIC
[poză rotundă, medie, dreapta]

[CORP]
Lucrez de peste 15 ani în antreprenoriat, operațiuni și procese.
În decembrie 2022 am început să lucrez serios cu inteligența artificială dintr-un motiv
simplu: aveam o afacere și căutam soluții pentru probleme reale.
N-am pornit din IT. Și nu țin workshopul ca să-ți arăt cât de complicată e tehnologia. Mă
interesează ce poate schimba ea într-o companie reală, ce merită construit și ce nu merită.
Astăzi pot să-mi construiesc propriile unelte digitale în jurul problemelor pe care le am.
De aici vine Deep Logic și ordinea în care lucrăm: business → oameni → procese → impact →
tehnologie.
Cred că trăim un moment asemănător cu cel în care omenirea a descoperit prima unealtă —
piatra cioplită, apoi ciocanul. De-acolo au apărut, una după alta, toate celelalte unelte.
AI-ul e, pentru mine, „ciocanul” de azi: nu scopul, ci unealta cu care construim următoarele
unelte digitale.
```

**Notă de implementare:** layout byline — poză rotundă (112px), nume+rol în stânga, poză în
dreapta, bio pe toată lățimea dedesubt. Poza (`public/ciprian-micu.jpg`) — verificată la
`existsSync` la build (cale stabilă via `process.cwd()`, nu `import.meta.url` — vezi D51);
fără fișier, secțiunea randează fără poză, fără iconiță ruptă.

**Resincronizat 8 septembrie 2026 — ultimele două propoziții înlocuite.** Povestea personală
(„la patru ani legam mobilierul... după piatră, am descoperit ciocanul") a devenit metafora
ciocanului ca unealtă civilizațională — cerut explicit, text brut adaptat la vocea paginii
(zero semne de exclamare) și legat de propoziția anterioară prin cuvântul „unelte digitale",
deja prezent acolo. Vezi `docs/DECIZII.md` D80.

---

## 07 — CUI I SE ADRESEAZĂ / CUI NU I SE ADRESEAZĂ

```COPY
[H2 DA]
Este pentru tine dacă

• Ai o afacere funcțională sau iei decizii importante într-o companie
• Știi că unele lucruri ar putea funcționa mai bine, dar nu știi de unde să începi
• Vrei să înțelegi problema înainte să cumperi soluția

[H2 NU]
Nu este pentru tine dacă

• Cauți o listă cu cele mai bune tool-uri sau prompturi
• Te aștepți să construim o soluție completă în trei ore
• Vrei să ți se spună ce trebuie implementat fără să discutăm mai întâi despre business

[OUTRO]
PRIMUL PAS nu este despre a introduce cât mai multă tehnologie în companie.
Este despre a decide mai bine ce merită schimbat și de unde merită să începi.
```

**Notă de implementare:** cele două coloane rămân VIZUAL EGALE — aceeași dimensiune de titlu,
aceeași culoare de text, aceeași greutate. Regulă neschimbată de niciun pivot. Marcajul e
bulină (`•`), nu em-dash — migrat 2026-09-09, vezi mai jos.

**Resincronizat 9 septembrie 2026 — 7 → 3 rânduri pe fiecare listă**, cerut explicit: „alege
ce este mai relevant pentru profilul și promisiunea workshopului". Rândurile scoase (istoric,
nu mai apar pe pagină):

*Din „Este pentru tine dacă":* „Ai o echipă, procese, informații sau decizii care se repetă"
(redundant cu „afacere funcțională") · „Ai testat instrumente noi, dar nu le-ai legat încă de
o nevoie clară de business" și „N-ai explorat aproape deloc zona..." (cele două capete ale
aceleiași idei — experiență cu unelte AI, oricare ar fi ea) · „Ești dispus să lucrezi trei ore
pe propria afacere, nu doar să asculți" (formatul e deja în Trust bar și Hero).

*Din „Nu este pentru tine dacă":* „Vrei o prezentare despre ce va face tehnologia peste cinci
ani" · „Vrei o rețetă universală pe care s-o copiezi în companie" (redundant cu „listă de
tool-uri") · „Vii doar să privești și nu vrei să lucrezi pe cazul tău" (reversul formatului,
deja acoperit) · „Ai deja o strategie digitală matură și cauți arhitectură tehnică avansată".

Criteriul: fiecare rând rămas face o treabă distinctă — profil sau promisiune, nu doar „încă
un motiv plauzibil". Cele trei rânduri de pe fiecare parte se oglindesc intenționat — vezi
`docs/DECIZII.md` D81 pentru maparea completă.

**A doua corecție, aceeași zi — `[OUTRO]` devine quickwin box.** Textul rămâne neschimbat;
containerul trece la aceeași rețetă `.card-depth` (sticlă mată) ca biletul din Trust bar și
cardurile din Agravare/Soluție. Cele două propoziții rămân la aceeași greutate tipografică —
niciun accent inventat între ele, aceeași disciplină ca la cardurile „nu X / ci Y" de-acolo.

---

## 08 — CE REZULTAT PROMITEM *(retrasă parțial 2026-09-09 — vezi mai jos)*

```COPY
[H2 — fost „Cum lucrăm" ca h3, promovat]
Cum lucrăm

20% context. 80% lucru aplicat.
Contextul există doar cât să punem întrebările corecte.
• Ce ai vrea să funcționeze diferit
• Unde se consumă timp, bani, energie sau atenție
• Ce proceduri sau procese există deja și ce lipsește
Nu lucrăm pe un business imaginar. Lucrăm pe al tău.
Nu trebuie să fii IT-ist. Nu trebuie să știi să programezi. Laptopul nu este obligatoriu.

[H3 — „De ce să mai chemi pe cineva?"]
Ai fost invitat la acest workshop — și poți, la rândul tău, să aduci o persoană. Vezi-o ca
pe un cadou pe care îl faci unui partener, unui client sau unui colaborator: un plus de
valoare, prin relația pe care o aveți deja. Sunt șanse mari să se regăsească în aceeași
situație — și să găsească, în cele trei ore, răspuns la propriile întrebări.

[CTA]
Rezervă-ți locul
```

**Notă de implementare:** absoarbe fostul §12 Precedent („20/80", acum subsecțiunea „Cum
lucrăm"). CTA repetat aici — singurul repetaj din mijlocul paginii, după cel mai „cald" moment.

**Resincronizat 9 septembrie 2026 — secțiunea retrasă parțial, cerut explicit.** Textul de
mai sus era, până acum, DOAR subsecțiunea finală a §08 — deasupra lui existau `[H2] Ce
primești pentru cele 3 ore?`, o listă de 4 livrabile numerotate (nevoie clar formulată /
estimare a impactului / oamenii implicați / roadmap personalizat de validare) și un bloc de
onestitate „Ce nu îți promit" (3 propoziții). Toate trei au dispărut integral — Ciprian a
citat exact acest text ca „secțiunea [care] trebuie ștearsă". `[SUB — „Cum lucrăm"]` și
`[SUB — „De ce să mai chemi pe cineva?"]` NU au fost citate pentru ștergere și au primit, în
aceeași rundă, propriile instrucțiuni de editare — dovadă că rămân, promovate la conținutul
principal al secțiunii.

**Semnalat lui Ciprian, decizia lui:** blocul „Ce nu îți promit" avea un comentariu
„obligatoriu" direct în cod (`S03Rezultatul.astro`: „singura formă de credibilitate care
funcționează la un om saturat de promisiuni"), iar CLAUDE.md §2 marca secțiunea asta drept
una din cele două „cele mai importante" ale paginii. Cerința a fost menținută după semnalare.

**„Cum lucrăm" strânsă la 3 puncte** (6→3, aceeași metodă ca §07/D81) — păstrate „ce ai vrea
să funcționeze diferit" (întrebarea de deschidere) și „unde se consumă timp, bani, energie
sau atenție" (diagnostic de cost concret); adăugată explicit o întrebare nouă despre
existența proceselor/procedurilor în zona respectivă.

**„De ce să mai chemi pe cineva?" rescrisă**: de la trei propoziții + o linie de accent
(„Dublezi perspectiva.") + două propoziții de încheiere, la UN paragraf — cerut explicit
(„răspunsul trebuie dat într-un paragraf"). Unghi nou: nu „o a doua perspectivă vede ce tu nu
vezi" (vechiul unghi funcțional), ci „ai fost invitat, poți la rândul tău invita — vezi-o ca
pe un cadou de valoare pentru cineva din relațiile tale" (unghi relațional). O corectare de
acuratețe pe parcurs: textul dictat spunea „invitat direct de speaker" — schimbat în „ai fost
invitat", fără atribuire la o persoană anume, fiindcă pagina spune deja că invitațiile
circulă „în principal" prin distribuire (`trustBar.acces`), nu mereu direct de la Ciprian.

Vezi `docs/DECIZII.md` D82b–D86 pentru toate deciziile acestei runde.

---

## 09 — FAQ *(strânsă la top 5, 2026-09-09 — vezi mai jos)*

```COPY
[H2]
Întrebări directe

[Q1] De ce să-mi dau 3 ore pentru asta?
[A1] Pentru că trecerea de la „ceva nu merge bine" la o nevoie clară cere mai mult decât o
prezentare de 30 de minute. Avem nevoie de timp ca să formulăm problema, să-i estimăm miza,
să identificăm oamenii implicați și să construim următorii pași. Mai puțin ar însemna să
vorbesc eu mai mult — scopul e să lucrezi tu.

[Q2] Trebuie să vin cu problema deja identificată?
[A2] Nu. Este suficient să știi că există lucruri pe care ai vrea să le faci mai bine. O parte
importantă din workshop e chiar formularea nevoii.

[Q3] O să-mi vindeți ceva la final?
[A3] Nu de la microfon. Pe formularul de la final există o singură bifă, prin care poți cere
o discuție dacă vrei. Dacă n-o bifezi, nu te caută nimeni.

[Q4] Este participarea cu adevărat gratuită?
[A4] Da. Vreau să fac metodologia Deep Logic cunoscută și să o validez în sală, pe situații
reale aduse de antreprenori și oameni de decizie. Tu vii cu realitatea afacerii tale și cu
trei ore de atenție. Eu vin cu metodologia, facilitarea și roadmap-ul personalizat. La final,
îți voi cere feedback sincer.

[Q5] Ce se întâmplă dacă mă înscriu și nu pot ajunge?
[A5] Anunță-mă și eliberez locul pentru altcineva. Sunt 30 și, la mine, chiar sunt 30.
```

**Notă de implementare:** accordion (`<details>`/`<summary>`, CSS-only, fără JS) — reversare
deliberată a regulii anterioare „fără accordion" (D54). Q3 și Q5 nu erau în draftul v4 —
păstrate din structura veche: Q3 explică mecanismul bifei opționale din formular, Q5 e
singurul loc de pe pagină care spune explicit că cifra de capacitate nu e umflată — trebuie
să rămână ULTIMA, verificat automat de `tests/copy-invariants.test.ts`.

**Resincronizat 9 septembrie 2026 — 10 → 5 întrebări, cerut explicit:** „top 5, selectează tu
ce vezi important pentru contextul întregului eveniment. Poți să adaugi alta dacă cumva este
relevantă și s-a omis." Scoase, cu motivul:

- **„De ce aș invita și pe altcineva?"** — unghiul ei (continuitate/responsabilizare după
  workshop) rămâne acoperit de `chemaCineva`, rescris chiar în runda precedentă cu alt unghi
  (invitația ca gest de valoare) — vezi §08 mai sus.
- **„Trebuie să am experiență cu AI...?"** și **„Trebuie să aduc laptop?"** — ambele
  redundante, cuvânt cu cuvânt, cu `cumLucram.outro`: „Nu trebuie să fii IT-ist. Nu trebuie
  să știi să programezi. Laptopul nu este obligatoriu."
- **„Ce primesc după workshop?"** — redundant cu biletul din Trust bar („Roadmap digital
  personalizat, primit pe email") ȘI cu cardul `solutie.cardFinal`.
- **„Este potrivit pentru domeniul meu?"** — cea mai generică dintre toate, fără fapt unic.

**Candidat de adăugat, semnalat, nu adăugat:** „Ce se întâmplă dacă locurile sunt deja
ocupate?" — mecanismul de listă de așteptare (`stari.asteptare`) e complet scris, dar n-are
nicio vizibilitate înainte de submit. Rămâne sugestie pentru o rundă viitoare — adăugarea ar
fi depășit ținta explicită de „top 5" fără o cerere clară de a scoate una din cele cinci deja
alese pentru ea. Vezi `docs/DECIZII.md` D87–D88.

---

## CTA FINAL

```COPY
[H2]
Afacerea ta este diferită.
Primul pas ar trebui să fie al ei.

[META]
Miercuri, 16 septembrie 2026 · 14:00–17:00 · Satu Mare · Participare gratuită · Maximum 30
de locuri

[CORP]
Noua eră digitală vine cu mai multe posibilități.
Dar posibilitățile nu sunt un plan.
Dacă încă nu știi care este primul pas care merită făcut în afacerea ta, este în regulă.

[ACCENT]
Pentru asta există PRIMUL PAS.

[CTA]
Rezervă-ți locul
```

---

## FOOTER

```COPY
Deep Logic
Satu Mare, România

[Website] · [LinkedIn] · [Email]

Termeni · Politica de confidențialitate
```

---

# NOTE DE IMPLEMENTARE — sistem vizual (2 septembrie 2026)

Cerut explicit, în continuarea pivotului de structură: CTA-uri lime puternic, sticlă mată pe
carduri, rotunjime pe butoane, buton CTA flotant. Detalii complete și motivele fiecărei
corecții: `docs/DECIZII.md` D42–D54.

- **Accent lime** (`#84CC16`) — DOAR ca fundal (CTA-uri, buton calendar, buton flotant), text
  pe el mereu `--pe-lime` (= `--bg-inchis`, 8.01:1) — niciodată alb (~1.6:1, verificat, respins).
- **Rotunjime CTA** — px fix (14px), nu procent (15% dădea un oval alungit pe butoane late).
- **Sticlă mată** — gradient de culoare (lime + accent) direct în fundalul cardului, nu doar
  `backdrop-filter` peste un fundal extern plat (prima variantă era invizibilă practic).
- **Buton CTA flotant** (`CtaFloating.astro`) — înlocuiește bara sticky doar-mobil, vizibil pe
  toate viewport-urile, se ascunde lângă orice `.cta` din flux (nu doar CTA-ul final).
- **Reveal la scroll** — per paragraf/listă/card (`data-reveal`), nu la nivel de secțiune
  întreagă; cascadă mică (60ms/pas) pentru frați care intră în cadru simultan.
- **Delimitare de secțiune** — bară subțire, globală (`Sectiune.astro`).

## Ce nu apare deliberat

- demo-ul You Protect;
- agentul personal de sănătate;
- promisiuni că participantul își construiește un agent sau o automatizare;
- liste de tool-uri;
- cheat-sheet-uri de prompturi;
- cifre de ROI fără date;
- social proof inventat;
- valoare artificială de tip „997 € / azi 0 €";
- povestea despre falimentul businessului anterior;
- promisiunea că perspectiva ownerului este automat și nevoia reală a companiei;
- prețul sau ancora de preț (workshopul public și cel in-company nu sunt același produs);
- AI Act/GDPR/NIS2 (dacă apar vreodată, doar în Problemă, ca zgomot, niciodată ca promisiune).

## Ideea centrală care trebuie protejată în orice rescriere

> **Afacerea ta este diferită. PRIMUL PAS te ajută să identifici ce merită schimbat, ce
> impact ar putea avea și ce trebuie verificat înainte să implementezi — pornind de la
> perspectiva ta, verificată în realitatea echipei, evaluată prin procese, date și ROI.**
