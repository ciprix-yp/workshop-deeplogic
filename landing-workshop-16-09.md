# Landing page — „Prima Mutare spre un Asistent Digital"
**Workshop gratuit · miercuri, 16 septembrie 2026 · Satu Mare**

> Fișier de producție pentru Claude Code. Conține **copy final** + **spec de implementare**.
> Copy-ul din blocurile `COPY` se folosește ca atare. Comentariile `<!-- NOTĂ -->` sunt instrucțiuni de build, nu text pentru pagină.
> Secțiunile marcate `⚠ DECIZIE` au nevoie de input de la Ciprian înainte de publicare — vezi lista de la final.

---

## META — tokens & reguli globale

```yaml
brand: Deep Logic
produs: "Prima Mutare spre un Asistent Digital"
limba: ro
ton: direct, practic, fără fluff, fără corporatism

culori:
  fundal_primar: "#FFFFFF"
  fundal_secundar: "#E4E7E7"
  text: "#2A3439"
  accent_cta: "#468984"
  secundar: "#2F4F4F"
  succes: "#C9E3D0"
  eroare: "#B85C5C"

fonturi:
  titluri: "Inter, Work Sans, sans-serif"
  corp: "Source Sans Pro, Nunito Sans, sans-serif"
  date_cod: "IBM Plex Mono, monospace"

cta_text: "Rezervă-ți locul"
cta_ancora: "#inscriere"
cta_repetat_la: [hero, dupa_sectiunea_5, dupa_sectiunea_8, sectiunea_16]
```

**Reguli de build:**
- Mobile-first. Cel puțin 40% din trafic vine din link trimis pe WhatsApp de un membru BIZZ.CLUB.
- Un singur CTA pe toată pagina. Fără CTA secundar, fără „află mai multe".
- Fără countdown, fără „ultimele locuri" animat, fără popup de exit-intent. Rarefierea e reală (25 de locuri), se spune o dată, calm.
- Fără logo-uri de clienți, fără badge-uri, fără cifre de piață.
- Secțiunile 2 și 8 sunt cele mai importante. Dacă tai ceva la mobil, nu de acolo.

---
---

<!-- ================= §01 HERO ================= -->

## §01 — HERO

**Scop:** îl oprește din scroll numind problema lui, nu soluția mea.

```COPY
[EYEBROW]
PRIMA MUTARE SPRE UN ASISTENT DIGITAL

[H1]
Toată lumea îți spune să adopți AI.
Nimeni nu-ți spune de unde să începi.

[SUBHEADLINE]
În trei ore nu implementezi AI. Decizi unde merită — și pleci cu prima ta ipoteză, scrisă.

[PENTRU CINE]
Pentru antreprenori și decidenți din firme de 7–50 de oameni.

[META]
Miercuri, 16 septembrie 2026 · 14:00–17:00 · Satu Mare

[CTA]
Rezervă-ți locul

[MICRO-PROOF]
25 de locuri. Fără laptop, fără cont, fără instalări — vii cu un pix.
Demo live pe sisteme care rulează azi, nu slide-uri despre viitor.
```

<!-- NOTĂ: H1 pe două rânduri, break forțat înainte de „Nimeni". Contrastul e mesajul. -->
<!-- NOTĂ: eyebrow-ul e numele produsului, cu literă mică ca greutate vizuală. Nu concurează cu H1. -->
<!-- NOTĂ: fără imagine de fundal generică cu roboți/creiere/rețele neuronale. Fundal curat #FFFFFF. -->

---

<!-- ================= §02 PROBLEMA ================= -->

## §02 — PROBLEMA

**Scop:** îi recunosc vacarmul cu cuvintele lui, apoi îi numesc problema reală. Cea mai importantă secțiune a paginii.

```COPY
[H2]
AI-ul e peste tot. În firma ta, încă nu e nicăieri.

[CORP]
Vezi reclame despre AI în fiecare zi. Auzi despre „agenți" — și nu-ți e clar ce naiba sunt ăia. Ți se spune că dacă nu adopți AI, rămâi în urmă.

Între timp:

— Angajații tăi se tem că vine să-i înlocuiască. Așa că îl evită.
— Legislatorul îți spune să ai grijă: AI Act, GDPR.
— Furnizorii de soluții nu-ți garantează confidențialitatea. Cei de sisteme nu-ți garantează securitatea.
— Iar tu, ca antreprenor, știi că vrei AI.

Bun. Am stabilit. Hai să începem.

Exact… începem ce? De unde? Ce presupune? Ce riscuri am? Ce costuri? Ce ROI?

[H3]
Problema ta nu e că nu vrei AI. E că n-ai o hartă.

[CORP]
Nu știi unde are sens în firma ta și unde sunt bani aruncați. Nu știi ce presupune, ce riști, cât costă, ce iese la capăt.

Și cât timp n-ai harta, nu iei nicio decizie. Mai citești un articol.

[H3]
Sau poate n-ai vacarmul ăsta deloc.

[CORP]
Poate ai deschis ChatGPT o dată, ți-a scos o prostie, și ai închis subiectul.
Poate ai decis deja că AI-ul e pentru firme de software și agenții de marketing, nu pentru una ca a ta.

Workshopul ăsta e și pentru tine. O să vezi exact unde s-a rupt treaba.

[H3]
Costul nu e că începi greșit. E că nu începi deloc.

[CORP]
Trec lunile. Citești despre AI, te uiți la reclame, îți pui aceleași întrebări. În firmă nu se schimbă nimic.

Trei ore de miercuri după-amiază, o dată, ca să iasă din buclă.
```

<!-- NOTĂ: liniile cu „—" sunt listă vizuală, nu bullet-uri rotunde. Păstrează ritmul de vorbire. -->
<!-- NOTĂ: legislația apare AICI ca zgomot pe care el îl aude. NU apare nicăieri în pagină ca promisiune că o rezolv eu. -->
<!-- NOTĂ: al doilea H3 („sau poate n-ai vacarmul") prinde cititorul care a decis deja că nu i se aplică. Nu-l tăia — e felia cea mai greu de convertit. -->

---

<!-- ================= §03 REZULTATUL ================= -->

## §03 — REZULTATUL

**Scop:** ce poate face participantul după, nu ce predau eu. Include granița onestă.

```COPY
[H2]
La final vei ști să faci cinci lucruri pe care azi nu le poți face

[LISTĂ]

1. Distingi între ce poate face AI-ul azi și ce doar pare că poate.
   Pentru că îl vei prinde greșind. Cu mâna ta, nu pentru că ți-am spus eu.

2. Ceri altfel — și primești altceva.
   Există o structură. Când o folosești, se vede imediat în ce iese.

3. Spui ce e un agent AI și ce nu e.
   După ce vezi unul funcționând, nu după ce ți se explică pe slide.

4. Tragi linia dintre ce poate ieși din firmă și ce nu iese niciodată.
   Prețuri, date de client, contracte — unde stau și cum le ții acolo.

5. Numești primul proces din firma ta care merită atins. Și pe cel care nu.
   Scris, nu în cap.

[H3]
Ce NU vei ști la final

[CORP]
Dacă ipoteza ta e corectă.

Asta cere acces la procesele și datele tale reale, la oamenii tăi, la cifrele tale. E o zi de lucru împreună, nu o după-amiază într-o sală cu 25 de oameni.

Ți-o spun acum, nu la final.
```

<!-- NOTĂ: blocul „Ce NU vei ști" e obligatoriu. E singura formă de credibilitate care funcționează la un om saturat de promisiuni. Stilizare: fundal #E4E7E7, fără chenar roșu, fără iconiță de avertizare. E onestitate, nu alertă. -->

---

<!-- ================= §04 PENTRU CINE ================= -->

## §04 — PENTRU CINE ESTE

**Scop:** filtru real, nu politețe. Cu 25 de locuri, o pagină care convinge pe toată lumea e un eșec.

```COPY
[H2]
E pentru tine dacă

[LISTĂ-DA]
— Ești antreprenor, patron sau decident într-o firmă de 7–50 de oameni
— Ai auzit de AI de o mie de ori și n-ai făcut încă nimic concret cu el
— Folosești deja ChatGPT, dar haotic: ceva ce deschizi când îți amintești, nu ceva care ține de un proces
— Ai încercat o dată, n-a mers, și ai lăsat-o baltă
— Ai o echipă și te întrebi cum reacționează dacă aduci AI în firmă

[H2]
Nu e pentru tine dacă

[LISTĂ-NU]
— Cauți o soluție gata făcută, pe care s-o cumperi azi și să meargă mâine
— Vrei să afli ce va face AI-ul în 2030
— Nu ai în cap niciun proces al tău la care să te gândești — vii doar să te uiți
— Ai deja agenți în producție și cauți arhitectură avansată
```

<!-- NOTĂ: ultima linie din „nu e pentru tine" filtrează în SUS, nu doar în jos. Semnalează că știu că există un nivel peste ce fac azi în sală. -->
<!-- NOTĂ: cele două liste, vizual egale. Dacă „nu e pentru tine" arată mai mic sau mai gri, filtrul devine decorativ. -->

---

<!-- ================= §05 BEFORE → AFTER ================= -->

## §05 — ÎNAINTE → DUPĂ

**Scop:** face concret ce înseamnă „ai o hartă". Tabel, nu proză.

```COPY
[H2]
Ce se schimbă efectiv

[TABEL]
ÎNAINTE                                          | DUPĂ
-------------------------------------------------|--------------------------------------------------
Deschizi ChatGPT când îți amintești              | Știi în ce situații merită deschis
Ceri ceva vag, primești ceva vag, te enervezi    | Știi de ce a ieșit prost data trecută
Nu știi ce e sigur să pui acolo                  | Ai o linie clară: asta iese din firmă, asta nu
„Agent AI" e un cuvânt din reclame               | Ai văzut unul funcționând și știi ce face
O senzație difuză că rămâi în urmă               | Un proces numit, scris, cu prima mutare pe el
```

<!-- NOTĂ: coloana ÎNAINTE cu text #2F4F4F la 70% opacitate. Coloana DUPĂ cu accent #468984 pe primul cuvânt. -->
<!-- NOTĂ: CTA repetat imediat după acest bloc. E primul punct din pagină în care omul e „cald". -->

---

<!-- ================= §06 CE FACEM EFECTIV ================= -->

## §06 — CE FACEM EFECTIV

**Scop:** structura reală a celor două ore de conținut. Scurt, fără jargon de curs.

```COPY
[H2]
Trei blocuri, două ore, zero teorie fără demonstrație

[BLOC 1]
01 · CONVERSAȚIA — ce poate și ce nu poate
Cum ceri, ca să primești ce ai nevoie. Apoi îl prinzi greșind — cu mâna ta, pe telefonul tău.
La final: ce deschid eu personal și când. ChatGPT, Claude, Gemini, Perplexity — care, pentru ce.

[BLOC 2]
02 · DELEGAREA — de la conversație la proces
Demo live: îmi construiesc o ofertă You Protect în fața ta, de la zero.
Și îți arăt unde stau datele: fișierele rămân pe calculatorul meu, prețurile nu călătoresc nicăieri.

[BLOC 3]
03 · AGENTUL — ce e și, mai ales, ce nu e
Agentul meu de monitorizare a sănătății. Complet, cum rulează el azi.
Inclusiv partea care contează: propune, eu aprob. Nu poate scrie singur în date.

[NOTĂ DE FORMAT]
După fiecare bloc scrii — individual, pe foaia ta.
Nu discuție de grup. Nu trebuie să vorbești în fața nimănui dacă nu vrei.

[CORP]
De la 16:00, o oră de discuții libere. Fără agendă, fără prezentare.
```

<!-- NOTĂ: numerotare 01/02/03 cu IBM Plex Mono, accent #468984. -->
<!-- NOTĂ: [NOTĂ DE FORMAT] răspunde direct fricii „n-o să știu ce să întreb, o să par prost". Nu o îngropa vizual. -->

---

<!-- ================= §07 NU DOAR TEORIE ================= -->

## §07 — NU DOAR TEORIE

**Scop:** dovada că e demonstrație, nu prezentare. Scurtă, patru linii.

```COPY
[H2]
Ce face workshopul ăsta diferit

[LISTĂ]
— Trei sisteme care rulează azi. Nu mockup-uri, nu înregistrări, nu capturi de ecran.
— Îmi expun propriile procese: ofertele mele și sănătatea mea. Nimeni din sală nu e subiect de demo.
— Construiesc în fața ta, live. Dacă se blochează ceva, vezi și asta — și vezi ce fac cu ea.
— Ieși cu un document, nu cu notițe.
```

<!-- NOTĂ: linia 3 e deliberată. Un demo live care poate pica, admis dinainte, e mai credibil decât o promisiune de perfecțiune. -->

---

<!-- ================= §08 CE PLECI CU TINE ================= -->

## §08 — CE PLECI CU TINE

**Scop:** răspunsul direct la „am mai fost la unul și n-am plecat cu nimic". A doua cea mai importantă secțiune.

```COPY
[H2]
Ce pleacă acasă cu tine

[ITEM 1]
Harta ta, scrisă în sală
În ultimele 15 minute completăm împreună. Nu de la zero — transcrii ce ai scris deja după fiecare bloc.
Iese: procesele tale, ce e confidențial în ele, ce s-ar putea delega, și prima ta mutare.

[ITEM 2]
Un document personalizat, pe email, în aceeași zi
Nu un PDF generic trimis la toată lumea. Al tău: harta ta, prima ta mutare, și prompturile configurate pentru ce faci tu efectiv.
Ăsta e lucrul pe care îl deschizi joi dimineață.

[ITEM 3]
Structura de prompt
Formula pe care o folosesc eu. Patru părți. Funcționează în orice unealtă de chat, indiferent care.

[ITEM 4]
Regula de confidențialitate
O singură propoziție care îți spune ce urci și ce nu urci niciodată. Simplă cât s-o ții minte fără s-o cauți.
```

<!-- ⚠ DECIZIE 1: itemii 1–4 sunt confirmați. Dacă vrei și un cheat-sheet tipărit de prompturi (ieftin de produs, întărește secțiunea), spune și îl adaug ca ITEM 5. Deocamdată NU e pe pagină, pentru că nu e decis. -->
<!-- NOTĂ: „în aceeași zi" e un angajament operațional. Dacă nu poți garanta livrarea în ziua evenimentului, schimbă în „în 24 de ore" ÎNAINTE de publicare. Nu promite ce nu livrezi — e fix pagina pe care miza e credibilitatea. -->
<!-- NOTĂ: CTA repetat după acest bloc. -->

---

<!-- ================= §09 USE CASES ================= -->

## §09 — DE UNDE PORNESC DE OBICEI FIRMELE

**Scop:** îl ajută să se proiecteze. NU e o listă cu ce acoperă workshopul — e lista de categorii pe care el își mapează propriile procese.

```COPY
[H2]
Unde caută oamenii, de obicei

[CORP]
Nu acoperim toate zonele astea în trei ore. Le pun aici ca să ai de unde începe când îți cartografiezi propriul proces.

[GRID]
VÂNZĂRI ȘI OFERTARE
Oferte, devize, propuneri. Răspunsuri la cereri repetitive.

RELAȚIA CU CLIENȚII
Răspunsuri standard, follow-up, întrebări care se repetă de zece ori pe lună.

OPERAȚIONAL
Rapoarte interne, sinteze, informația care trece de la un om la altul și se pierde pe drum.

DOCUMENTE ȘI DATE
Ce e îngropat în PDF-uri, contracte și tabele pe care nu le mai deschide nimeni.

MONITORIZARE CONTINUĂ
Lucruri care ar trebui urmărite permanent și pe care le observi doar când e prea târziu.

[CORP]
Demonstrația live e pe ofertare, pentru că e procesul pe care îl am eu și pot să-l expun fără să expun pe altcineva.
Mecanismul e același indiferent de zonă.
```

<!-- NOTĂ: prima linie de corp e obligatorie. Fără ea, secțiunea promite șapte domenii acoperite în trei ore — și pagina minte. -->
<!-- NOTĂ: „AI agents" NU apare ca use case separat aici. Apare la §06 bloc 3, ca demonstrație. Aici ar suna a buzzword. -->

---

<!-- ================= §10 DEEP LOGIC ================= -->

## §10 — DESPRE DEEP LOGIC

**Scop:** cine ține workshopul, la nivel de firmă. Scurt.

```COPY
[H2]
Deep Logic

[CORP]
Consultanță AI pentru firme românești de 7–50 de oameni.

Poziția noastră: infrastructură, nu automatizări.
Diferența e cine deține ce se construiește. Arhitectura rămâne a clientului, nu a furnizorului. Iar sistemele se construiesc pe realitatea fiscală de aici — e-Factura, ANAF — nu pe un model importat care merge în altă parte.

Ordinea în care lucrăm: întâi strategia, apoi procesul, apoi tehnologia.
Nu punem AI peste orice. Căutăm unde produce efect economic real — și spunem când nu produce.
```

<!-- NOTĂ: zero cifre aici. Fără „X clienți", fără „Y proiecte". Când vor exista date documentate, se adaugă. -->

---

<!-- ================= §11 FACILITATOR ================= -->

## §11 — DESPRE CIPRIAN MICU

**Scop:** de ce merită să-l asculți. Pentru cititorul care nu-l cunoaște deloc.

```COPY
[H2]
Cine ține workshopul

[CORP]
Ciprian Micu. Fondator Deep Logic.

Lucrez cu AI din decembrie 2022. Am sisteme în producție din 2023 — inclusiv cele pe care ți le arăt pe 16 septembrie. Sunt practician, nu lector: tot ce demonstrez e ceva ce folosesc eu.

În paralel, sunt Business Developer la You Protect, unde vând echipamente de protecție în B2B. De acolo vine demonstrația de ofertare — e procesul meu, pot să-l deschid fără să expun pe nimeni altcineva.

Fac parte din echipa de leadership BIZZ.CLUB Satu Mare.

[OPȚIONAL — vezi DECIZIA 2]
Înainte de asta am construit o firmă de transport de la zero la aproape 4 milioane de euro în șapte ani. Apoi am dat faliment. De acolo mi-a rămas realismul: știu cum arată o decizie proastă luată cu entuziasm.
```

<!-- ⚠ DECIZIE 2: blocul [OPȚIONAL] e cel mai puternic element de credibilitate de pe toată pagina pentru audiența asta — un antreprenor care a construit și a pierdut vorbește altfel decât un consultant care n-a riscat nimic. Dar e decizia ta dacă îl pui public. Îl las marcat, nu-l activez singur. -->
<!-- ASSET NECESAR: fotografie reală, la lucru sau la un eveniment anterior. NU portret corporate pe fundal alb, NU stock. -->

---

<!-- ================= §12 PRECEDENT ================= -->

## §12 — PRECEDENT

**Scop:** înlocuiește „social proof". Nu am testimoniale pe formatul ăsta și nu inventez.

```COPY
[H2]
Nu e prima dată

[CORP]
Am ținut o versiune a acestui workshop în iulie, la Ardudana.

Versiunea din septembrie e construită pe ce am învățat acolo: mai puțină prezentare, mai multe demonstrații pe sisteme reale, și un material personalizat după eveniment — care atunci nu exista.

Nu pun testimoniale pentru că n-am colectat pe formatul ăsta. Când voi avea, le voi pune.
```

<!-- ⚠ DECIZIE 3: dacă ai chiar și două reacții scrise de la Ardudana, secțiunea devine de trei ori mai puternică. Trimite-mi-le și rescriu. Până atunci rămâne așa — precedentul e adevărat, testimonialele nu există. -->
<!-- NOTĂ: ultima propoziție („nu pun testimoniale pentru că...") pare că slăbește pagina. Nu o slăbește. La un cititor saturat de promisiuni, e cel mai puternic semnal de onestitate de pe toată pagina. Nu o tăia. -->

---

<!-- ================= §13 FORMAT ================= -->

## §13 — FORMAT ȘI DETALII

**Scop:** toate informațiile practice, într-un singur loc scanabil.

```COPY
[H2]
Detalii practice

[TABEL]
Data              | Miercuri, 16 septembrie 2026
Ora               | 14:00 – 17:00
Structura         | Două ore de workshop, o oră de discuții libere
Locația           | Satu Mare — adresa exactă, în emailul de confirmare
Participanți      | Maximum 25
Ce aduci          | Un pix. Atât.
Laptop            | Nu e nevoie. Dacă vrei să lucrezi în paralel, adu-l — dar nu e obligatoriu.
Nivel necesar     | Zero. Dacă n-ai deschis niciodată ChatGPT, e în regulă.
Cost              | Gratuit
```

<!-- ASSET NECESAR: adresa sălii. Momentan e „în emailul de confirmare" — funcționează, dar dacă o ai, pune-o direct. Reduce fricțiunea. -->

---

<!-- ================= §14 CE INCLUDE / DE CE E GRATUIT ================= -->

## §14 — CE INCLUDE ȘI DE CE E GRATUIT

**Scop:** dezamorsează „e gratuit, deci e un pitch de 3 ore". Fără preț, fără ancoră de preț.

```COPY
[H2]
De ce e gratuit

[CORP]
Pentru că am nevoie de repetiții și de feedback real.

E prima dată când țin workshopul ăsta în forma asta. Vreau să văd pe ce se blochează firmele din Satu Mare când pun mâna pe instrumentele astea — nu ce cred eu că le trebuie.

Deci da, am un interes. Interesul meu e să învăț din sala asta și, dacă mai încolo cineva vrea să lucrăm împreună pe procesele lui, cu atât mai bine. Nu vinde nimeni nimic de la microfon pe 16 septembrie.

[H3]
Ce include

[LISTĂ]
— Două ore de workshop cu demonstrații live pe sisteme reale
— O oră de discuții libere, după
— Harta ta, completată în sală
— Documentul tău personalizat, pe email, în aceeași zi

[H3]
De ce doar 25 de locuri

[CORP]
Pentru că peste atât nu mai pot lucra cu fiecare din sală, iar workshopul devine prezentare. Nu e o cifră aleasă ca să sune bine.
```

<!-- NOTĂ: fără preț, fără „valoare 2000 lei", fără „normal ar costa X". Workshopul public și cel in-company nu sunt același produs — o ancoră de preț ar revendica o echivalență falsă, iar primul om care compară cele două agende o vede. -->
<!-- NOTĂ: „Nu vinde nimeni nimic de la microfon" e un angajament public. Respectă-l în sală. -->

---

<!-- ================= §15 FAQ ================= -->

## §15 — ÎNTREBĂRI

**Scop:** ultimele obiecții, înainte de CTA final.

```COPY
[H2]
Întrebări

[Q] Trebuie să am experiență cu AI?
[A] Nu. Dacă n-ai deschis niciodată ChatGPT, e în regulă — începem de la conversație. Dacă îl folosești zilnic, blocurile 2 și 3 sunt oricum peste ce faci acum.

[Q] Trebuie laptop?
[A] Nu. Demonstrațiile rulează pe ecranul meu. Ai nevoie doar de telefon, pentru un singur exercițiu. Dacă vrei să lucrezi în paralel pe laptopul tău, adu-l — dar nu-ți trebuie.

[Q] E potrivit pentru domeniul meu?
[A] Demonstrația live e pe ofertare, dar mecanismul nu ține de industrie. În sală vin oameni din producție, servicii, comerț, construcții. Ce cartografiezi tu e propriul proces, nu al meu.

[Q] Pot să vin cu o problemă reală din firmă?
[A] Da — și ăsta e scopul. Nu trebuie s-o spui cu voce tare în fața nimănui. Lucrezi pe ea individual, pe foaia ta.

[Q] O să-mi vindeți ceva la final?
[A] Nu de la microfon. Pe formularul de la final există o singură bifă, prin care poți cere o discuție dacă vrei. Dacă n-o bifezi, nu te caută nimeni.

[Q] Ce primesc după workshop?
[A] Un document personalizat pe email, în aceeași zi: harta ta, prima ta mutare și prompturile configurate pentru ce faci tu.

[Q] Ce se întâmplă dacă mă înscriu și nu pot ajunge?
[A] Anunță-mă și eliberez locul pentru altcineva. Sunt 25 și, la mine, chiar sunt 25.
```

<!-- NOTĂ: întrebarea despre vânzare e cea mai importantă din FAQ. Nu o muta mai jos și nu o înmuia. -->

---

<!-- ================= §16 CTA FINAL ================= -->

## §16 — CTA FINAL + FORMULAR

**Scop:** închiderea. Repetă rezultatul, nu argumentul.

```COPY
[H2]
Trei ore, miercuri după-amiază

[CORP]
Nu ca să implementezi AI. Ca să știi unde merită și unde nu merită, în firma ta — și să pleci cu prima ta mutare, scrisă.

Miercuri, 16 septembrie · 14:00–17:00 · Satu Mare · 25 de locuri

[CTA]
Rezervă-ți locul

[MICROCOPY SUB CTA]
Îți iau 60 de secunde. Întreb și ce proces îți mănâncă cel mai mult timp — ca să pot pregăti materialul pentru sala care vine efectiv, nu pentru una imaginară.
```

### Formular — 6 câmpuri

```yaml
campuri:
  - id: nume
    label: "Nume și prenume"
    tip: text
    obligatoriu: true

  - id: email
    label: "Email"
    tip: email
    obligatoriu: true
    microcopy: "Aici primești confirmarea și, după workshop, materialul tău."

  - id: firma_rol
    label: "Firma și rolul tău"
    tip: text
    obligatoriu: true

  - id: sursa
    label: "Cine te-a invitat?"
    tip: select
    obligatoriu: true
    optiuni:
      - "Sunt membru BIZZ.CLUB Satu Mare"
      - "Am primit invitația de la un membru BIZZ.CLUB"
      - "Sunt membru DRW"
      - "Altfel"
    conditional:
      trigger: "Am primit invitația de la un membru BIZZ.CLUB"
      camp: "De la cine?"
      tip: text
    conditional_2:
      trigger: "Altfel"
      camp: "Cum ai aflat?"
      tip: text

  - id: proces
    label: "Ce proces din firma ta îți mănâncă cel mai mult timp?"
    tip: textarea
    obligatoriu: true
    placeholder: "Ex.: fac ofertele de mână, fiecare îmi ia 40 de minute și trimit 15 pe săptămână."

  - id: nivel_ai
    label: "Folosești AI azi?"
    tip: select
    obligatoriu: true
    optiuni:
      - "Zilnic, e parte din cum lucrez"
      - "Din când în când"
      - "Am încercat și am renunțat"
      - "Niciodată"

confirmare:
  mesaj: "Gata. Îți trimit confirmarea pe email, cu adresa exactă. Cu două zile înainte îți scriu să confirmi că vii — dacă nu poți, eliberez locul."
```

<!-- NOTĂ: fără telefon, fără cifră de afaceri, fără număr de angajați. Toate trei semnalează „urmează un apel de vânzare" către exact cititorul care nu te cunoaște încă. Telefonul se ia în sală. -->
<!-- NOTĂ: placeholder-ul de la câmpul „proces" e obligatoriu. Fără exemplu concret primești „administrația" și n-ai nimic. -->
<!-- NOTĂ TEHNICĂ: formular → n8n → Baserow. Secvența anti-no-show: confirmare imediată, reconfirmare activă la 48h (buton „Confirm că vin"), reminder în dimineața zilei. Acceptă ~30 înscrieri pentru 25 de locuri. -->

---

<!-- ================= §17 FOOTER ================= -->

## §17 — FOOTER

```COPY
Deep Logic
Satu Mare, România

[Contact — email]
[LinkedIn]
[Website]

Termeni · Politica de confidențialitate
```

<!-- NOTĂ: footer minimalist, fundal #E4E7E7, text #2F4F4F. Fără newsletter signup, fără social icons multiple, fără sitemap. -->
<!-- ASSET NECESAR: email de contact, URL LinkedIn, URL website, pagini Termeni + GDPR. -->

---
---

# TEXT DE DISTRIBUIRE — pentru membri BIZZ.CLUB

**Nu e pe landing page. E mesajul pe care membrul îl trimite personal invitatului lui, pe WhatsApp sau email.**

## Logica

Fiecare membru BIZZ.CLUB are o invitație gratuită la eveniment, pe care o oferă unui colaborator — personal, nu prin club. Nu e un link redirecționat. E un privilegiu pe care membrul îl acordă cuiva.

Textul trebuie să vorbească **la persoana I**, ca și cum membrul scrie chiar el, nu ca și cum retransmite un anunț. Dacă sună a flyer copy-paste, mecanismul de încredere moare — invitatul simte diferența dintre „mi-a scris X" și „am primit un forward".

De-asta variantele de mai jos n-au nimic din vocabularul landing page-ului (eyebrow, CTA, micro-proof). Sunt scrise ca mesaj, nu ca reclamă.

## Varianta A — scurtă (WhatsApp)

```COPY
Salut, [Nume]!

Am o invitație la un workshop despre AI, pe 16 septembrie, în Satu Mare — trei ore, de la 14:00, urmate de discuții libere. Ține Ciprian Micu de la Deep Logic, pe procese reale de-ale lui, nu pe slide-uri.

Mă gândeam la tine pentru ea. Ți-o dau ție.

Detalii și înscriere aici: [link]

Locurile sunt limitate, deci dacă te tentează, nu lăsa pe mai încolo.
```

## Varianta B — cu context (email sau WhatsApp mai lung)

```COPY
Salut, [Nume],

Am o invitație gratuită la un workshop despre AI, pe 16 septembrie, la Satu Mare — și m-am gândit la tine.

Îl ține Ciprian Micu, de la Deep Logic. Nu e o prezentare despre AI — arată live cum face el ofertele cu Claude și cum și-a construit un agent care-i urmărește sănătatea. Ideea e să pleci cu o hartă scrisă: unde ar avea sens AI-ul în firma ta și de unde ai începe.

Trei ore, 14:00–17:00, plus o oră de discuții libere după. Fără laptop, fără cont, fără pregătire dinainte.

Sunt doar 25 de locuri, deci dacă vrei să vii, aplică cât mai repede: [link]
```

## Notă de utilizare

- **[Nume]** și **[link]** se completează manual sau prin merge tag, dacă mesajul e trimis din CRM/Baserow.
- Varianta A pentru WhatsApp direct. Varianta B unde membrul vrea să dea mai mult context (email, sau invitat mai reticent).
- Nu adăuga „gratuit" ca prim cuvânt vizibil — apare o singură dată, natural, în propoziție. Cuvântul repetat scade valoarea percepută, exact ca pe landing page.

---

# DECIZII DESCHISE

| # | Decizie | Impact | Unde |
|---|---|---|---|
| 1 | Adaugi un cheat-sheet tipărit cu prompturi ca ITEM 5? | Întărește §08, care e a doua cea mai importantă secțiune. Ieftin de produs. | §08 |
| 2 | Activezi blocul despre firma de transport și faliment? | Cel mai puternic element de credibilitate pentru audiența asta. Dar e expunere personală — decizia e a ta. | §11 |
| 3 | Ai reacții scrise de la Ardudana? | Ar transforma §12 din „precedent" în dovadă socială reală. | §12 |
| 4 | Confirmi „în aceeași zi" pentru documentul personalizat? | Dacă nu poți garanta, schimbă în „în 24 de ore" înainte de publicare. | §08, §14, §15 |
| 5 | Adresa sălii — o pui pe pagină sau rămâne în email? | Pusă direct, reduce fricțiunea la înscriere. | §13 |

---

# ASSETS NECESARE

- [ ] Fotografie Ciprian — reală, la lucru sau la un eveniment. Nu stock, nu portret corporate.
- [ ] Adresa exactă a locației
- [ ] Email de contact
- [ ] URL LinkedIn + website
- [ ] Pagini Termeni și Politica de confidențialitate
- [ ] Text scurt de distribuire (2–3 propoziții) pe care membrii BIZZ.CLUB să-l trimită mai departe pe WhatsApp către invitatul lor. **Nu e pe pagină — e livrabil separat, dar e canalul principal de distribuție. Fără el, pagina nu ajunge la cititorul pentru care a fost scrisă.**

---

# CE NU APARE PE PAGINĂ — DELIBERAT

- **Preț sau ancoră de preț.** Workshopul public și cel in-company nu sunt același produs.
- **Cifre de piață, procente, statistici.** Niciuna verificată de tine, deci niciuna pe pagină.
- **Cifre de ROI.** Zero, până la primul pilot documentat.
- **Promisiuni de conformitate legală.** AI Act, GDPR, NIS2 apar o singură dată, în §02, ca zgomot pe care îl aude el. Niciodată ca promisiune.
- **Countdown, „ultimele locuri", exit-intent, fals deficit.** Rarefierea e reală și se spune o dată.
- **Testimoniale.** Nu există pe formatul ăsta. Nu se inventează.
- **Logo-uri de clienți sau badge-uri de autoritate.**
