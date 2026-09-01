# Landing page — „PRIMUL PAS"
**Workshop gratuit by Deep Logic · miercuri, 16 septembrie 2026 · 14:00–17:00 · Satu Mare**

> Sursă de adevăr pentru copy — vezi CLAUDE.md, secțiunea „Sursele de adevăr". Implementarea
> completă trăiește în [`src/content/copy.ts`](../src/content/copy.ts); acest fișier descrie
> INTENȚIA, copy.ts descrie STAREA EXACTĂ (inclusiv completările de propoziții tăiate și
> titlurile adăugate, marcate acolo).

---

## PIVOT DE PRODUS (2026-08-31)

Landing page-ul „Prima Mutare spre un Asistent Digital" (25 de locuri, poziționare pe
demonstrații live — ofertare You Protect, agent de monitorizare a sănătății) e înlocuit
integral de „PRIMUL PAS" (30 de locuri, poziționare pe lucru propriu al participantului pe
compania lui, fără demo-uri personale ale lui Ciprian).

Sursa acestei rescrieri: un PDF de producție trimis de Ciprian („PRIMULPASLandingPageV2"),
cu propriul format §01–§17. Arhitectura tehnică a paginii (17 componente `Sxx*.astro`,
motor de scroll custom, dialog modal de înscriere) **nu s-a schimbat** — doar conținutul.
Fiindcă PDF-ul sursă are alt număr de secțiuni cu altă formă decât arhitectura existentă de
componente, maparea de mai jos e **pe conținut, nu pe poziție**:

| Componentă (poziție pe pagină) | Conținut sursă (secțiunea PDF) |
|---|---|
| S01 Hero | §01 Hero |
| S02 Problema | §02 Problema |
| S03 Rezultatul | §04 Cu ce pleci + §05 Ce nu vei ști |
| S04 PentruCine | §09 Pentru cine este |
| S05 InainteDupa | §03 Ce se schimbă (tabel) |
| S06 CeFacem | §08 Metodologia Deep Logic — jumătatea „cei 5 pași" |
| S07 NuDoarTeorie | §10 „Dar eu nu știu ce aș putea face cu AI" |
| S08 CePleciCuTine (scena-semnătură „harta") | §07 Poate problema ta arată așa (5 din 6 categorii) |
| S09 UseCases | §07 Poate problema ta arată așa (grid complet, 6 categorii) |
| S10 DespreDeepLogic | §08 Metodologia Deep Logic — jumătatea „de ce lucrăm invers" |
| S11 Facilitator | §11 Despre Ciprian Micu |
| S12 Precedent | §06 Formatul (20%/80%) |
| S13 Detalii | §14 Detalii practice |
| S14 DeCeGratuit | §12 De ce este gratuit |
| S15 Faq | §13 Întrebări frecvente |
| DialogInscriere (antet) | §15 Înscriere |
| S16 Inscriere (CTA final + antet-fallback dialog) | §16 CTA final |
| S17 Footer | §17 Footer |

Două componente (S07, S12) nu mai aveau conținut sursă — vechile lor teme („trei sisteme
care rulează azi", „nu e prima dată / Ardudana") sunt acum interzise explicit de noua listă
„ce nu apare deliberat" mai jos. Realocate din secțiuni PDF care altfel n-ar fi avut casă în
arhitectura existentă de componente.

Peste 20 de propoziții erau tăiate la marginea paginii în PDF-ul sursă (blocurile de cod nu
se înfășoară la randare) — completate în `copy.ts`, marcate `[completare]`, ancorate în
vocabularul restului documentului. Revizuire de Ciprian înainte de publicare.

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
cta_repetat_la: [hero, dupa_sectiunea_5, dupa_sectiunea_8, sectiunea_16]
```

**Reguli de copy și build:**
- Un singur CTA pe toată pagina: „Rezervă-ți locul". Mobile-first, scanabil din WhatsApp.
- Nu transformăm pagina într-un curs despre AI. Vindem claritatea și primul pas, nu tehnologia.
- Nu promitem că în 3 ore găsim implementarea corectă. Promitem că participantul își
  clarifică nevoia, începe să-i estimeze impactul și pleacă cu un roadmap de validare.
- Nu promitem agenți, automatizări, prompturi sau tool-uri. Nu menționăm demo-uri-surpriză.
- AI apare unde e necesar pentru claritate, nu în fiecare titlu.
- Ordinea Deep Logic se simte în toată pagina: business → problemă → oameni → proces →
  impact → tehnologie.
- **Countdown-ul și numărul de locuri rămase sunt alimentate din date reale** — vezi
  `BaraScarcity.astro` și `src/pages/api/locuri-disponibile.ts`. Regula: „fără deficit fals".
- Locația exactă rămâne pe pagină (decizie D6, moștenită din documentul precedent).

---
---

## §01 — HERO

```COPY
[EYEBROW]
PRIMUL PAS · Workshop by Deep Logic

[H1]
Toată lumea îți spune să folosești AI.
Dar în compania ta, de unde începi?

[SUBHEADLINE]
În 3 ore lucrezi pe propria companie ca să formulezi nevoia pe care vrei s-o rezolvi, să-i
estimezi impactul și să pleci cu un prim pas concret.

[MICROCOPY]
Nu este încă un curs despre AI.
Nu trebuie să fii IT-ist.
Și nu trebuie să știi deja ce ai putea face cu AI.

[META]
Miercuri, 16 septembrie 2026 · 14:00–17:00 · Satu Mare
20% context · 80% lucru aplicat · Participare gratuită · Maximum 30 de locuri

[CTA]
Rezervă-ți locul

[SCARCITY REALĂ]
[X locuri disponibile din 30]
[COUNTDOWN până la 16 septembrie 2026, 14:00]
```

<!-- NOTĂ: H1 pe două rânduri, break forțat înainte de „Dar". Contrastul e mesajul. -->
<!-- NOTĂ: fără imagine de fundal generică cu roboți/creiere/rețele neuronale. -->

---

## §02 — PROBLEMA

```COPY
[H2]
AI-ul e peste tot. În compania ta, întrebarea încă rămâne.

[CORP]
ChatGPT. Copiloți. Agenți. Automatizări. Demo-uri care par să facă totul în câteva secunde.

În același timp apar alte întrebări:

— Ce date pot folosi și ce date nu?
— Ce va spune echipa?
— Cât costă cu adevărat?
— Ce merită construit și ce este doar o jucărie interesantă?
— Cum îmi dau seama dacă există un ROI înainte să investesc?

Și, după tot zgomotul, rămâne o întrebare mult mai simplă:

[H3]
„Bun. Eu de unde încep?"

[CORP]
Poate ai încercat deja câteva instrumente și ai rămas cu o utilizare ocazională.
Poate ai văzut lucruri impresionante, dar nu le-ai putut traduce în realitatea companiei tale.
Sau poate n-ai început deloc pentru că nu ești IT-ist și nu știi ce ai putea face concret.

Toate trei sunt puncte de plecare normale.

Problema nu este că nu ai adoptat suficient AI.
Problema este că, fără o întrebare bună de business, poți pierde luni testând unelte,
cumpărând licențe și citind materiale care nu duc nicăieri.

[H3]
PRIMUL PAS începe înainte de tool.

[CORP]
Începe cu ce vrei să schimbi în compania ta.
```

<!-- NOTĂ: 5 întrebări, nu 4 — vacarmul de business (date/echipă/cost/scop/ROI), nu frica
     angajaților sau legislația. -->

---

## §03 — CE SE SCHIMBĂ

```COPY
[H2]
De la o senzație difuză la un punct de plecare concret

[TABEL]
ÎNAINTE | DUPĂ PRIMUL PAS
„Ar trebui să fac ceva cu AI." | „Asta este nevoia pe care vreau s-o explorez."
Nu știi de unde să începi. | Ai un punct de plecare clar.
Problema este mai mult o senzație. | Ai început să-i estimezi impactul în business.
Te gândești direct la soluție. | Știi ce mai trebuie validat înainte de soluție.
Nu știi cine trebuie implicat. | Ai oamenii-cheie identificați.
Ai o idee în cap. | Ai un roadmap digital pe care îl poți deschide și continua.

[CTA] Rezervă-ți locul
```

---

## §04 — CU CE PLECI

```COPY
[H2]
Nu pleci cu o listă de tool-uri. Pleci cu o direcție.

[ITEM 01] O nevoie clar formulată
Nu „vreau să folosesc AI". Ci: „Asta este problema sau oportunitatea pe care vreau s-o
explorez în compania mea."

[ITEM 02] O primă estimare a impactului
Cât de des apare problema, câți oameni implică, cât timp consumă. Nu inventăm ROI —
vedem dacă merită investigată.

[ITEM 03] O ipoteză despre ce ai putea delega
„Ce parte din acest proces ar putea fi delegată unui coleg digital — și ce trebuie să
rămână sub controlul tău?"

[ITEM 04] Oamenii pe care trebuie să-i implici
Cei care execută procesul, îl coordonează, primesc rezultatul sau trăiesc consecințele lui.

[ITEM 05] Roadmap-ul tău personalizat
Nevoia identificată, impactul preliminar, ce mai trebuie validat, oamenii de implicat și
recomandarea Deep Logic privind continuarea — pe email.
```

---

## §05 — CE NU VEI ȘTI DUPĂ CELE 3 ORE

```COPY
[H2]
Ce NU vei ști la final

[H3]
Dacă ipoteza ta este corectă.

[CORP]
Și ar fi incorect să pretind că putem afla asta într-o sală, în trei ore, doar din
perspectiva ta. Pentru un verdict real trebuie să vorbim cu oamenii care lucrează în
proces, să vedem cum funcționează lucrurile de fapt, nu doar cum par de la nivelul tău.

PRIMUL PAS îți spune ce merită investigat. Nu pretinde că îți dă răspunsul înainte de
investigație.
```

<!-- NOTĂ: tratat vizual ca element de credibilitate, nu avertisment. Fundal secundar,
     fără chenar roșu, fără iconiță de alertă. -->

---

## §06 — FORMATUL

```COPY
[H2]
20% context. 80% lucru pe compania ta.

[CORP]
Nu vreau să petrecem trei ore vorbind despre tehnologie. Contextul e acolo doar cât să
punem întrebările corecte. Restul timpului lucrezi pe propria companie: ce vrei să
schimbi, unde se consumă timp sau atenție, cine e implicat, ce valoare ar avea dacă
problema s-ar rezolva, ce ai putea delega și ce trebuie verificat înainte să construiești
ceva. Nu pe un business imaginar. Pe al tău.

[H3]
Nu trebuie să fii IT-ist.

[CORP]
Rolul tău nu este să știi ce model, API sau arhitectură trebuie folosită. Rolul tău este
să înțelegi ce merită rezolvat și de ce. Tehnologia vine după.
```

---

## §07 — POATE PROBLEMA TA ARATĂ AȘA

```COPY
[H2]
De unde pornesc, de obicei, întrebările bune

[INTRO]
Nu înseamnă că vom acoperi toate zonele de mai jos. Sunt doar exemple care te pot ajuta
să recunoști o problemă reală din compania ta.

[GRID]
VÂNZĂRI ȘI OFERTARE
Ofertele sau devizele se fac greu, manual sau depind prea mult de o singură persoană.

CLIENȚI
Echipa răspunde din nou și din nou la aceleași întrebări sau follow-up-ul se pierde.

DOCUMENTE ȘI RAPOARTE
Oamenii mută informații între PDF-uri, emailuri, tabele și sisteme care nu vorbesc între ele.

OPERAȚIONAL
Informația există, dar ajunge greu la omul care trebuie să ia o decizie.

ONBOARDING, PROCESE ȘI PROCEDURI
O parte importantă din „cum facem lucrurile aici" există mai mult în capul oamenilor
decât în vreun document.

VÂNZARE ȘI DEZVOLTARE
Știi că există oportunități, dar oamenii potriviți sunt greu de identificat, prioritizat
sau urmărit în timp.

[OUTRO]
Poate problema ta nu seamănă cu nimic de aici. Și asta este în regulă.
Nu trebuie să vii cu problema perfect formulată. Pentru asta lucrăm.
```

<!-- NOTĂ implementare: grila completă (6 categorii) e la S09UseCases. Primele 5 categorii
     (Vânzări+Dezvoltare combinate) alimentează și scena-semnătură „harta" la S08
     CePleciCuTine — vezi copy.ts pentru cum s-au despărțit. -->

---

## §08 — METODOLOGIA DEEP LOGIC

```COPY
[H2]
Înainte de soluție, trebuie să înțelegem problema.

[CORP]
Când apare o tehnologie nouă, tentația este să începem cu unealta. Să vedem ce poate face
și apoi să căutăm unde să o folosim. La Deep Logic facem invers.

[STATEMENT]
Business → problemă → oameni → proces → impact → tehnologie.

[CORP]
Începem cu perspectiva ownerului. Apoi o verificăm în realitatea echipei. Ne uităm la
procese și proceduri. La date. La efort. La risc. La impact și ROI.
Și abia după aceea decidem dacă tehnologia are sens.

[STEP 1] PRIMUL PAS
Clarificăm nevoia pe care tu, ca owner sau decident, vrei să o explorezi și construim
ipoteze inițiale de lucru.

[STEP 2] REALITATEA ECHIPEI
Descoperim nevoile oamenilor care lucrează efectiv în procese și înțelegem ce se întâmplă
în realitate, nu doar pe hârtie.

[STEP 3] PROCESE + IMPACT + ROI
Suprapunem perspectiva managementului cu realitatea echipei, procesele și datele disponibile.

[STEP 4] DECIZIA
Stabilim ce merită făcut, ce nu merită și ce trebuie prioritizat.

[STEP 5] IMPLEMENTAREA
Construim doar acolo unde există suficiente motive să o facem.

[STATEMENT FINAL]
Nu pornim de la „Ce putem face cu AI?"
Pornim de la: „Ce merită să rezolvăm?"

[CTA] Rezervă-ți locul
```

<!-- NOTĂ implementare: secțiunea s-a despărțit în două componente — S06 CeFacem ia
     STEP 1-5 (numerotare 01-05, IBM Plex Mono), S10 DespreDeepLogic ia prefața +
     STATEMENT. Motiv: S06 randează blocuri numerotate, S10 doar proză; niciuna singură
     n-avea forma pentru tot conținutul. Vezi copy.ts. -->

---

## §09 — PENTRU CINE ESTE

```COPY
[H2]
Este pentru tine dacă...

— ești antreprenor, owner, CEO, manager sau iei decizii care influențează felul în care
  funcționează compania ta;
— ai senzația că anumite lucruri ar putea funcționa mai bine, dar nu știi încă unde
  tehnologia ar avea sens;
— folosești deja AI ocazional, dar nu l-ai legat de un proces real de business;
— n-ai folosit aproape deloc AI și nu știi de unde să începi;
— vrei să înțelegi problema înainte să cumperi soluția;
— ești dispus să lucrezi trei ore pe realitatea propriei companii.

[H2]
Nu este pentru tine dacă...

— cauți o listă cu cele mai bune prompturi;
— vrei o prezentare cu zeci de tool-uri;
— te aștepți să construim un agent sau o automatizare completă în trei ore;
— cauți o rețetă universală pe care s-o copiezi în companie;
— vrei ca cineva să-ți spună ce trebuie automatizat fără să înțeleagă mai întâi businessul;
— ai deja o strategie AI matură și cauți arhitectură tehnică avansată.

[OUTRO]
PRIMUL PAS nu este despre a face mai mult cu AI.
Este despre a decide mai bine unde merită să începi.
```

---

## §10 — „DAR EU NU ȘTIU CE AȘ PUTEA FACE CU AI"

```COPY
[H2]
„Dar eu nici măcar nu știu ce aș putea face cu AI."

[H3]
Perfect.

[CORP]
Nu trebuie să vii cu răspunsul. Pentru asta există PRIMUL PAS.
Nu trebuie să fii IT-ist. Nu trebuie să cunoști automatizări. Nu trebuie să știi ce este
un agent sau un API.

Ai nevoie doar să-ți cunoști compania suficient cât să poți spune:

„Aici simt că pierdem timp."
„Aici depindem prea mult de un om."
„Aici nu avem vizibilitate."
„Aici aș vrea să funcționăm mai bine."

De acolo începem.
```

<!-- NOTĂ implementare: realocat la S07 NuDoarTeorie (vechiul conținut, „trei sisteme
     care rulează azi", e interzis de noua listă „ce nu apare deliberat"). -->

---

## §11 — DESPRE CIPRIAN MICU

```COPY
[H2]
De ce eu?

[CORP]
La patru ani am legat mobilierul din camera părinților mei cu elastic. În mintea mea,
făceam obiectele să comunice.

Mult mai târziu, în decembrie 2022, am început să explorez serios AI. Nu pentru că voiam
să devin „expert în AI" — eram antreprenor și căutam soluții pentru probleme reale din
propriul business.

În anii care au urmat am trecut de la a folosi instrumente făcute de alții la a-mi
construi propriile sisteme. Asta mi-a schimbat perspectiva.

[H3]
După piatră, am descoperit ciocanul.

[CORP]
Cu un ciocan poți construi multe lucruri. Dar ciocanul nu îți spune ce trebuie construit.

Și exact asta mi se pare astăzi întrebarea importantă în AI. Nu „ce poate tehnologia?".
Ci „ce merită să rezolvăm cu ea?". Din întrebarea asta s-a construit și metodologia
Deep Logic.

— Ciprian Micu, Founder, Deep Logic
```

<!-- ASSET NECESAR: fotografie reală cu Ciprian la lucru / workshop / conversație cu
     antreprenori. Fără stock, fără estetică „guru tech". Vezi S11Facilitator.astro —
     secțiunea se autoascunde de imagine dacă fișierul lipsește din public/. -->

---

## §12 — DE CE ESTE GRATUIT

```COPY
[H2]
De ce este gratuit?

[CORP]
Pentru că vreau să fac metodologia Deep Logic cunoscută și, în același timp, să o
validez în situații reale. Nu pe exemple inventate. Pe situații reale aduse de
antreprenori și oameni de decizie.

Tu vii cu realitatea companiei tale și cu trei ore de atenție. Eu vin cu metodologia,
facilitarea și roadmap-ul personalizat.

La final îmi doresc ceva foarte simplu de la tine:

[H3]
feedback sincer.

[CORP]
Atât.

De aceea această ediție este gratuită și limitată la maximum 30 de participanți.
```

---

## §13 — ÎNTREBĂRI FRECVENTE

```COPY
[Q] Trebuie să am experiență cu AI?
[A] Nu. Poți veni și dacă ai folosit doar de câteva ori ChatGPT sau dacă n-ai făcut încă
    nimic similar.

[Q] Trebuie să vin cu problema deja identificată?
[A] Nu. Este suficient să știi că există lucruri pe care ai vrea să le faci mai bine.
    O parte importantă din workshop e chiar clarificarea problemei.

[Q] Trebuie să fiu IT-ist ca să înțeleg?
[A] Nu. Nu discutăm arhitecturi tehnice și nu trebuie să știi să programezi. Rolul tău
    este să înțelegi ce merită rezolvat, nu cum se construiește tehnic.

[Q] Este potrivit pentru domeniul meu?
[A] Dacă ai procese, oameni, informații, clienți sau decizii care se repetă, există
    suficient material de lucru, indiferent de domeniu.

[Q] Trebuie să aduc laptop?
[A] Laptopul nu este obligatoriu pentru participare. Dacă va fi util pentru un exercițiu,
    poți veni cu el, dar nu ai nevoie de el ca să participi.

[Q] Ce primesc după workshop?
[A] Un roadmap digital personalizat pe email: nevoia identificată, impactul preliminar,
    ce trebuie validat, oamenii de implicat și pașii concreți pentru următorul pas.

[Q] Ce se întâmplă dacă mă înscriu și nu pot ajunge?
[A] Anunță-mă și eliberez locul pentru altcineva. Sunt 30 și, la mine, chiar sunt 30.
```

---

## §14 — DETALII PRACTICE

```COPY
[TABEL]
Data | Miercuri, 16 septembrie 2026
Ora | 14:00–17:00
Durata | 3 ore de lucru
Locația | Satu Mare — adresa exactă pe pagină (decizie D6)
Participanți | Maximum 30
Format | 20% context · 80% lucru aplicat
Nivel necesar | Zero cunoștințe tehnice
Laptop | Nu este obligatoriu
Cost | Gratuit

[SCARCITY]
[X locuri disponibile din 30]
[COUNTDOWN REAL până la 16 septembrie 2026, 14:00]

[CTA] Rezervă-ți locul
```

---

## §15 — ÎNSCRIERE

```COPY
[H2]
Rezervă-ți locul la PRIMUL PAS

[CORP]
Înscrierea durează câteva minute. Pe lângă datele de contact, îți voi pune câteva
întrebări despre compania ta. Nu trebuie să ai răspunsurile perfecte.

Întrebările mă ajută să înțeleg cine vine în sală și să pregătesc workshopul pe probleme
reale, nu pe una imaginară.

[CTA / SUBMIT] Rezervă-ți locul

[MICROCOPY]
Maximum 30 de locuri. După înscriere primești confirmarea și detaliile de participare pe
email.
```

**Formular:** se folosește formularul final deja aprobat (Q1–Q5 de calificare,
`src/content/form-schema.ts`). Doar numele workshopului s-a schimbat la PRIMUL PAS —
conținutul întrebărilor rămâne neschimbat.

---

## §16 — CTA FINAL

```COPY
[H2]
3 ore. Compania ta. Primul pas.

[CORP]
Nu ca să implementezi AI într-o după-amiază. Ci ca să treci de la „Ar trebui să fac ceva
cu AI." la o nevoie numită, cu impact estimat și cu primul pas scris.

Miercuri, 16 septembrie · 14:00–17:00 · Satu Mare · 30 de locuri

[SCARCITY]
[X locuri disponibile din 30]
[COUNTDOWN REAL]

[CTA] Rezervă-ți locul

[CLOSING]
Peste tot se vorbește despre ce poate face AI.
Pentru compania ta, întrebarea mai importantă este: „Ce merită să rezolv?"
Dacă încă nu ai un răspuns clar, e în regulă. Acesta este PRIMUL PAS.
```

---

## §17 — FOOTER

```COPY
Deep Logic
Satu Mare, România

[Contact — email] · [LinkedIn] · [Website]

Termeni · Politica de confidențialitate
```

---
---

# NOTE DE IMPLEMENTARE

**CTA-uri.** Repetă „Rezervă-ți locul" în: 1. Hero, 2. După §03 (tabel), 3. După §08
(metodologie), 4. §14 (detalii), 5. Formular (submit), 6. §16 (CTA final). Fără CTA
secundar de tip „Află mai multe". Insigna de locuri live e un element separat, ascuns
implicit — nu schimbă textul butonului.

**Countdown și locuri.** Countdown real până la 16.09.2026, 14:00, Europe/Bucharest.
„X locuri disponibile din 30" alimentat din `locuriDisponibilePublic()` — exact același
prag pe care `register_participant` îl folosește ca să decidă inscris-vs-așteptare. La 0
locuri, CTA-ul nu se dezactivează — mecanismul de listă de așteptare există deja
(`/lista-asteptare`). Fără notificări false de tip „cineva tocmai s-a înscris".

**Distribuție/invitație.** Formulare recomandată: „30 de locuri, distribuite în principal
prin invitații în comunitate."

---

# CE NU APARE PE PAGINĂ — DELIBERAT

- **Preț sau ancoră de preț.** Workshopul public și cel in-company nu sunt același produs.
- **Cifre de piață, procente, statistici.** Niciuna verificată, deci niciuna pe pagină.
- **Cifre de ROI fără date.** Zero, până la primul pilot documentat.
- **Promisiuni de conformitate legală.** AI Act, GDPR, NIS2 apar o singură dată, în §02.
- **Testimoniale.** Nu există pe formatul ăsta. Nu se inventează.
- **Logo-uri de clienți sau badge-uri de autoritate.**
- **Demo-ul You Protect, agentul personal de sănătate.** Poziționarea veche („trei sisteme
  care rulează azi") nu mai există — PRIMUL PAS nu promite demo-uri personale ale lui Ciprian.
- **Liste de tool-uri, cheat-sheet de prompturi.** Nu mai sunt livrabile ale acestei ediții.
- **Notificări false de tip „cineva tocmai s-a înscris".**
- **Valoare artificială de tip „997 € / azi 0 €".** Fără ancoră de preț, nici indirectă.
- **Promisiunea că ipoteza ownerului este automat și nevoia reală a companiei.** PRIMUL PAS
  spune explicit ce NU vei ști la final (§05) — validarea reală cere acces la echipă și date.

**Ideea centrală care trebuie protejată în orice rescriere viitoare:** PRIMUL PAS nu
încearcă să dovedească faptul că ai nevoie de AI. Te ajută să formulezi ce vrei să rezolvi
și să afli ce trebuie verificat înainte să decizi dacă AI merită folosit.
