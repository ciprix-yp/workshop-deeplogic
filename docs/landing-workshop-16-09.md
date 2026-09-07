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

[ÎNTREBĂRI INTRO]
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
au devenit o listă `<ul><li>` reală, cu marcajul deja stabilit pe pagină (em-dash „—",
`--accent-decor`), nu un glif de bulă nou — vezi `docs/DECIZII.md` D66–D70.

---

## 04 — AGRAVARE *(secțiune nouă)*

```COPY
[H2]
Cel mai scump început este cel făcut fără o problemă clară.

[CORP]
De obicei nu arată dramatic.
Alegi o unealtă înainte să alegi problema. Cineva din echipă o testează. Primele zile par
promițătoare.
Apoi apar excepțiile, lipsesc datele, procesul real e mai complicat decât părea, iar oamenii
revin la vechiul mod de lucru.
Ai consumat timp și bani. Și, uneori, ai întărit ideea că „la noi nu merge".

[ALTERNATIVA]
Cealaltă variantă e să amâni.
Mai citești. Mai vezi o demonstrație. Mai salvezi un articol. Dar în afacere nu se schimbă
nimic.

[H3 + CORP FINAL — card]
De aceea merită cele 3 ore.
Nu pentru că în 3 ore îți rezolvăm afacerea. Nu îți promit asta.
Merită pentru că nu petrecem timpul pe trenduri, predicții sau liste de instrumente.
Îl folosim ca să scoatem din ceață un lucru concret: ce vrei să schimbi, de ce contează și
ce trebuie verificat înainte să mergi mai departe.
```

---

## 05 — SOLUȚIA

```COPY
[H2]
PRIMUL PAS este munca de dinaintea implementării.

[INTRO]
Pornim de la perspectiva ta, ca antreprenor sau persoană de decizie.

[ÎNTREBĂRI]
Ce ai vrea să funcționeze diferit?
Unde simți că se pierde timp, atenție, bani sau oportunitate?
De ce contează?
Cine trăiește problema în fiecare zi?
Ce ar trebui să vedem înainte să spunem că merită construit ceva?

[CONCLUZIE INTRO]
Din răspunsurile tale formulăm o primă ipoteză și construim un roadmap de validare.
Nu un plan final de implementare. Nu o soluție aleasă dinainte.
Un punct de plecare suficient de clar încât să poată fi verificat.

[H3]
Afacerea ta nu are o singură realitate.

[PERSPECTIVA]
Ownerul vede direcția și rezultatul pe care îl dorește.
Managerul vede dependențele și blocajele.
Omul care lucrează în proces vede excepțiile și realitatea de zi cu zi.
Datele și cifrele arată dacă problema e suficient de importantă.

[MECANISM]
De aceea, la Deep Logic:
Pornim de la nevoia ownerului.
O verificăm în realitatea echipei.
Analizăm procesul, impactul și ROI-ul.
Implementăm doar dacă există motive reale.

[SINTEZA — card]
Perspectiva ownerului este punctul de plecare. Nu verdictul.

[H3]
Asta înseamnă pentru mine noua eră digitală.

[CORP]
Până acum, cumpăram un software și ne adaptam modul de lucru la el.
Astăzi putem începe să construim instrumente mai apropiate de felul în care funcționează
afacerea în realitate.
Tocmai de aceea alegerea primei probleme contează atât de mult.
```

**Notă de implementare:** diferențiatorul central al paginii, poziționat devreme (după
Problemă și Agravare), nu o prefață despre firmă. Fostă `despreDeepLogic`/S10Deeplogic.astro —
vezi `docs/DECIZII.md` D31–D33 pentru istoricul mecanismului.

---

## *(metodologia cu cinci pași — păstrată separat, pin/scrub GSAP)*

```COPY
[H2]
Cei cinci pași ai metodologiei Deep Logic

[01] PRIMUL PAS — Clarificăm nevoia pe care tu, ca owner sau decident, vrei să o explorezi și
construim ipoteze inițiale de lucru.

[02] WORKSHOP CU ECHIPA — Descoperim nevoile oamenilor care lucrează efectiv în procese,
analizăm blocajele și verificăm ipoteza ta în realitatea de zi cu zi.

[03] PROCESE + IMPACT + ROI — Suprapunem perspectiva managementului cu realitatea echipei,
procesele și datele disponibile.

[04] DECIZIA — Stabilim ce merită făcut, ce nu merită și ce trebuie prioritizat.

[05] IMPLEMENTAREA — Construim doar acolo unde există suficiente motive să o facem.

[NOTĂ FORMAT]
Nu pornim de la „Ce putem face cu AI?"

[FINAL]
Pornim de la: „Ce merită să rezolvăm?"
```

**Notă de implementare:** nu apare ca secțiune de sine stătătoare în cadrul celor 10 cerute
explicit de Ciprian — păstrată printr-o decizie separată, confirmată prin `AskUserQuestion`
(D38): singurul pin/scrub GSAP de pe pagină, cost deja aprobat special pentru el. Poziționată
după Soluție, înainte de Facilitator.

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
La patru ani legam mobilierul din camera părinților mei cu elastic. În mintea mea, făceam
obiectele să comunice.
După piatră, am descoperit ciocanul. Dar ciocanul nu îți spune ce trebuie construit. Pentru
asta ai nevoie de primul pas.
```

**Notă de implementare:** layout byline — poză rotundă (112px), nume+rol în stânga, poză în
dreapta, bio pe toată lățimea dedesubt. Poza (`public/ciprian-micu.jpg`) — verificată la
`existsSync` la build (cale stabilă via `process.cwd()`, nu `import.meta.url` — vezi D51);
fără fișier, secțiunea randează fără poză, fără iconiță ruptă.

---

## 07 — CUI I SE ADRESEAZĂ / CUI NU I SE ADRESEAZĂ

```COPY
[H2 DA]
Este pentru tine dacă

— Ai o afacere funcțională sau iei decizii importante într-o companie
— Știi că unele lucruri ar putea funcționa mai bine, dar nu știi de unde să începi
— Ai o echipă, procese, informații sau decizii care se repetă
— Ai testat instrumente noi, dar nu le-ai legat încă de o nevoie clară de business
— N-ai explorat aproape deloc zona și vrei să înțelegi ce ar putea avea sens pentru tine
— Vrei să înțelegi problema înainte să cumperi soluția
— Ești dispus să lucrezi trei ore pe propria afacere, nu doar să asculți

[H2 NU]
Nu este pentru tine dacă

— Cauți o listă cu cele mai bune tool-uri sau prompturi
— Vrei o prezentare despre ce va face tehnologia peste cinci ani
— Te aștepți să construim o soluție completă în trei ore
— Vrei o rețetă universală pe care s-o copiezi în companie
— Vrei să ți se spună ce trebuie implementat fără să discutăm mai întâi despre business
— Vii doar să privești și nu vrei să lucrezi pe cazul tău
— Ai deja o strategie digitală matură și cauți arhitectură tehnică avansată

[OUTRO]
PRIMUL PAS nu este despre a introduce cât mai multă tehnologie în companie.
Este despre a decide mai bine ce merită schimbat și de unde merită să începi.
```

**Notă de implementare:** cele două coloane rămân VIZUAL EGALE — aceeași dimensiune de titlu,
aceeași culoare de text, aceeași greutate. Regulă neschimbată de niciun pivot.

---

## 08 — CE REZULTAT PROMITEM

```COPY
[H2]
Ce primești pentru cele 3 ore?

[1] O nevoie clar formulată — Nu „Ar trebui să facem și noi ceva." Ci: „Asta este problema
sau oportunitatea pe care vreau s-o investighez."

[2] O primă estimare a impactului — Cât de des apare, câți oameni implică, cât timp consumă.
Nu inventăm ROI — vedem dacă merită investigată.

[3] Oamenii care trebuie implicați — Identifici cine execută procesul, cine îl coordonează,
cine primește rezultatul și cine trăiește blocajele lui zi de zi.

[4] Un roadmap personalizat de validare — Nevoia identificată, de ce contează, impactul
preliminar, ce trebuie verificat, cine trebuie implicat, acțiunile concrete pentru următorul
pas și recomandarea Deep Logic privind continuarea — pe email.

[GRANIȚA — „Ce nu îți promit"]
Nu îți promit că, după trei ore, știm dacă ipoteza e corectă. Ar fi incorect.
Pentru asta trebuie să vorbim cu oamenii care lucrează în proces, să vedem cum funcționează
în realitate și să analizăm datele, impactul, efortul și riscurile.
PRIMUL PAS îți arată ce merită investigat. Nu pretinde că îți dă verdictul înainte de
investigație.

[SUB — „Cum lucrăm"]
20% context. 80% lucru aplicat.
Contextul există doar cât să punem întrebările corecte.
— Ce ai vrea să funcționeze diferit
— Unde se consumă timp, bani, energie sau atenție
— Cine este implicat
— Ce valoare ar avea schimbarea
— Ce ar putea fi delegat sau construit diferit
— Ce trebuie validat înainte să implementezi
Nu lucrăm pe un business imaginar. Lucrăm pe al tău.
Nu trebuie să fii IT-ist. Nu trebuie să știi să programezi. Laptopul nu este obligatoriu.

[SUB — „De ce să mai chemi pe cineva?"]
Pentru că un singur om vede doar o parte din afacere.
Tu poți vedea obiectivul. Un partener, un manager sau un coleg-cheie poate vedea procesul
altfel. Un alt antreprenor îți poate pune întrebarea pe care tu nu ți-o mai pui.
Dacă vii împreună cu cineva în care ai încredere, nu dublezi informația.
Dublezi perspectiva.
Și plecați cu un pas pe care îl puteți continua și după workshop, nu doar cu o idee care
rămâne într-un carnețel. Poate fi cineva din compania ta sau un alt antreprenor cu care ai
o relație bună.

[CTA]
Rezervă-ți locul
```

**Notă de implementare:** absoarbe fostul §12 Precedent („20/80", acum subsecțiunea „Cum
lucrăm") și conținut nou din draftul v4 („De ce să mai chemi pe cineva"). CTA repetat aici —
singurul repetaj din mijlocul paginii, după cel mai „cald" moment.

---

## 09 — FAQ

```COPY
[H2]
Întrebări directe

[Q1] De ce să-mi dau 3 ore pentru asta?
[A1] Pentru că trecerea de la „ceva nu merge bine" la o nevoie clară cere mai mult decât o
prezentare de 30 de minute. Avem nevoie de timp ca să formulăm problema, să-i estimăm miza,
să identificăm oamenii implicați și să construim următorii pași. Mai puțin ar însemna să
vorbesc eu mai mult — scopul e să lucrezi tu.

[Q2] De ce aș invita și pe altcineva?
[A2] Pentru că discuția continuă mai ușor după workshop când mai există cineva care a trecut
prin același proces — un co-owner, un manager, un coleg-cheie sau un alt antreprenor. Vă
puteți provoca ipotezele și vă puteți ține responsabili pentru pasul pe care spuneți că îl
veți face. Fiecare persoană trebuie să-și rezerve propriul loc.

[Q3] Trebuie să am experiență cu AI sau cu instrumente digitale noi?
[A3] Nu. Poți veni și dacă ai folosit doar de câteva ori ChatGPT sau dacă n-ai explorat serios
zona. Workshopul pornește de la afacerea ta, nu de la tehnologie.

[Q4] Trebuie să vin cu problema deja identificată?
[A4] Nu. Este suficient să știi că există lucruri pe care ai vrea să le faci mai bine. O parte
importantă din workshop e chiar formularea nevoii.

[Q5] Este potrivit pentru domeniul meu?
[A5] Dacă ai procese, oameni, informații, clienți sau decizii care se repetă, ai suficient
material de lucru. Nu venim cu același caz pentru toate firmele — lucrăm pornind de la
situația ta.

[Q6] Trebuie să aduc laptop?
[A6] Nu. Laptopul nu este obligatoriu și nu trebuie să te pregătești tehnic înainte.

[Q7] Ce primesc după workshop?
[A7] Un roadmap digital personalizat pe email: nevoia identificată, impactul preliminar, ce
trebuie validat, cine trebuie implicat și acțiunile recomandate pentru următorul pas.

[Q8] O să-mi vindeți ceva la final?
[A8] Nu de la microfon. Pe formularul de la final există o singură bifă, prin care poți cere
o discuție dacă vrei. Dacă n-o bifezi, nu te caută nimeni.

[Q9] Este participarea cu adevărat gratuită?
[A9] Da. Vreau să fac metodologia Deep Logic cunoscută și să o validez în sală, pe situații
reale aduse de antreprenori și oameni de decizie. Tu vii cu realitatea afacerii tale și cu
trei ore de atenție. Eu vin cu metodologia, facilitarea și roadmap-ul personalizat. La final,
îți voi cere feedback sincer.

[Q10] Ce se întâmplă dacă mă înscriu și nu pot ajunge?
[A10] Anunță-mă și eliberez locul pentru altcineva. Sunt 30 și, la mine, chiar sunt 30.
```

**Notă de implementare:** accordion (`<details>`/`<summary>`, CSS-only, fără JS) — reversare
deliberată a regulii anterioare „fără accordion" (D54). Q8 și Q10 nu erau în draftul v4 —
păstrate din structura veche: Q8 explică mecanismul bifei opționale din formular, Q10 e
singurul loc de pe pagină care spune explicit că cifra de capacitate nu e umflată.

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
