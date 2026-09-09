/**
 * Tot copy-ul paginii, într-un singur loc.
 *
 * Nicio componentă nu-și scrie textul inline. Motivul practic: „în aceeași zi" →
 * „în 24 de ore" apărea în trei secțiuni diferite; ținut aici, e o singură editare
 * și tests/copy-invariants.test.ts poate verifica automat regulile din
 * „CE NU APARE PE PAGINĂ — DELIBERAT".
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * PIVOT DE STRUCTURĂ (2026-09-02, Ciprian): 16 secțiuni → 10, cadru clasic
 * Hero → Trust bar → Problemă → Agravare → Soluție → Facilitator → Cui i se
 * adresează → Cui nu i se adresează → Ce rezultat promitem → FAQ. Motivul
 * declarat: structura veche „prea stufos, diluăm mesajul". Bazat pe un al
 * doilea draft primit de la Ciprian („PRIMUL-PAS-landing-page-v4.md").
 *
 * Ce s-a retras ca secțiune de sine stătătoare (conținutul absorbit, nu
 * pierdut — vezi mai jos unde a migrat fiecare):
 *   — „Înainte → După" (tabel) — fără echivalent în v4, retras fără absorbție.
 *   — „Dar eu nici măcar nu știu ce aș putea face cu AI" (obiecția) — absorbit
 *     implicit în `pentruCine.da` („nu știi de unde să începi" e deja acolo
 *     ca motiv de calificare) și în FAQ.
 *   — „Poate problema ta arată așa" (grid de 6 exemple) — absorbit în
 *     `problema`, care acum deschide direct cu exemple concrete.
 *   — „De ce este gratuit" (secțiune separată) — absorbit în ultimul răspuns
 *     din FAQ.
 *   — „20% context, 80% lucru aplicat" (fostă secțiune separată) — absorbit
 *     ca subsecțiune în `rezultatul.cumLucram`.
 *   — „Detalii practice" (tabel) — absorbit: adresa completă trăiește acum
 *     în `detalii` (folosit de TrustBar), fără componentă proprie.
 *
 * A rămas o vreme, deliberat, deși nu apărea explicit în cele 10 puncte ale
 * lui Ciprian: `ceFacem` (cei cinci pași ai metodologiei, pin/scrub GSAP) —
 * confirmat explicit prin AskUserQuestion („păstrez secțiunea GSAP separat"),
 * poziționat după Soluție, înainte de Facilitator (Soluția explica mecanismul
 * conceptual, CeFacem îl arăta ca pași concreți).
 *
 * **Retrasă (2026-09-08), explicit:** „renunțăm la metodologie... explicăm
 * cum ajungem la rezultat" — §05 Soluție a căpătat între timp propria metodă
 * (6 pași, titlu+descriere, D73–D75), scrisă chiar în ziua precedentă. O
 * secțiune separată care repeta aceeași idee, cu alți 5 pași, devenise
 * dublură, nu întărire. Retragerea a scos și SINGURUL consumator al Lenis+
 * GSAP de pe pagină (~49KB gzip) — apparatus-ul a ieșit odată cu ea, vezi
 * `Base.astro` și `docs/DECIZII.md` D78.
 *
 * Istoricul complet al deciziilor de narativă (H1, mecanismul owner→echipă→
 * date, etc.) rămâne în `docs/DECIZII.md` (D31–D36, pivotul de narativă din
 * aceeași zi) — acest pivot de STRUCTURĂ e separat, D37+.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const EVENIMENT = {
  slug: 'workshop-2026-09-16',
  titlu: 'PRIMUL PAS',
  organizator: 'Deep Logic',
  data: '2026-09-16',
  dataText: 'Miercuri, 16 septembrie 2026',
  dataScurt: 'Miercuri, 16 septembrie',
  ora: '14:00–17:00',
  oraStart: '14:00',
  timezone: 'Europe/Bucharest',
  oras: 'Satu Mare',
  locatie: 'Casa Dăinuirii',
  adresa: 'Strada 1 Decembrie 1918 nr. 1, 440010 Satu Mare',
  // Link scurt Google Maps către locație — cerut explicit (2026-09-02), inserat
  // în `.ics` (src/lib/ics.ts) ca proprietate URL + în DESCRIPTION, ca „Adaugă
  // în calendar" să deschidă și harta, nu doar textul adresei.
  mapsUrl: 'https://maps.app.goo.gl/QZP2Cs7owkZktZMh6',
  capacitate: 30,
  cost: 'Gratuit',
} as const;

export const CTA = {
  text: 'Rezervă-ți locul',
  ancora: '#inscriere',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   SCARCITY — bara fixă (BaraScarcity.astro), insigna de sub fiecare CTA și
   butonul flotant. Regula sursei: „fără deficit fals; afișează doar date
   reale". Fără JS, orice element de scarcity arată fallback-ul static de mai
   jos — niciodată un număr inventat.
   ═══════════════════════════════════════════════════════════════════════════ */

export const scarcity = {
  fallbackStatic: `Maximum ${EVENIMENT.capacitate} de locuri · ${EVENIMENT.dataText}, ${EVENIMENT.oraStart}`,
  // Folosită DOAR de rândul de locuri live din formular (propoziție completă,
  // spațiu suficient) — nu și de bara fixă, prea îngustă pentru ea (vezi
  // `etichetaBara` mai jos, a șasea rundă, 2026-09-02).
  etichetaLocuri: 'locuri disponibile din',
  plin: 'Locurile s-au ocupat — te trec pe lista de așteptare.',
  aInceput: 'a început',
  // Sub CTA (Cta.astro, CtaFloating.astro) — format „Disponibil 25/30",
  // cerut explicit (pivot 2026-09-02). Șablon, nu propoziție: scriptul din
  // BaraScarcity.astro completează cifrele.
  etichetaDisponibil: 'Disponibil',
  // Bara fixă (a șasea rundă, 2026-09-02 — „nu încape countdown-ul"): format
  // compact „Locuri 30/30 · 13z 23:45:03", nu mai propoziția lungă de mai
  // sus — la textul +20% din runda anterioară, aceea trecea de lățimea barei
  // și se tăia cu „…" înainte să apuce să arate ora din countdown.
  etichetaBara: 'Locuri',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   01 — HERO
   Scop: îl oprește din scroll numind decizia lui, nu tehnologia noastră.
   Fișa evenimentului (dată/oră/loc) a fost retrasă de-aici — Trust bar, chiar
   dedesubt, o acoperă deja; păstrată și în hero ar fi fost dublură exact în
   punctul unde pagina trebuie să fie cea mai tăiată.
   ═══════════════════════════════════════════════════════════════════════════ */

export const hero = {
  eyebrow: 'PRIMUL PAS · Workshop by Deep Logic',
  /*
   * H1 pe trei rânduri, cu roluri diferite — a șaptea rundă (2026-09-07).
   * Runda a cincea forțase trei `span` de mărime egală; pe 360px fiecare se
   * rupea în două, deci H1-ul ocupa cinci rânduri vizuale, nu trei. Acum
   * rândul e o unitate: `rand1` e afirmația de deschidere (corp mai mic),
   * `rand2` + `rand3` sunt întrebarea (corp mare, identic între ele).
   * Fragmentul `accent` din `rand2` e singura bucată colorată din H1.
   *
   * Regula care ține construcția: fiecare rând se randează cu `nowrap` și
   * primește o mărime calculată din lățimea reală a containerului (vezi
   * S01Hero.astro), deci textul de aici nu poate depăși un rând — dar poate
   * să scadă sub pragul lizibil dacă se lungește mult. Dacă schimbi copy-ul,
   * rulează `npm run test:e2e -- tests/e2e/hero.spec.ts`.
   */
  h1: {
    rand1: 'Afacerea ta este diferită.',
    rand2: { inainte: 'Cum faci ', accent: 'PRIMUL PAS' },
    rand3: 'în noua eră digitală?',
  },
  /*
   * Subheadline pe două paragrafe (a șaptea rundă, 2026-09-07) — text primit
   * de la Ciprian. Schimbarea importantă nu e lungimea, ci cuvântul:
   * „roadmap de IMPLEMENTARE" (varianta veche) a devenit „roadmap
   * personalizat de VALIDARE" — exact ce spun deja §Rezultatul
   * („Un roadmap personalizat de validare") și `meta.descriere`. Hero-ul era
   * singurul loc din pagină care promitea implementare într-un workshop de
   * trei ore; pe pagina asta, un copy care promite altceva decât livrează e
   * un bug (CLAUDE.md §5).
   */
  subheadline: [
    'Vino să descoperi, alături de alți antreprenori ca tine, ce merită făcut mai întâi pentru a aduce automatizările și AI-ul în compania ta.',
    'Lucrăm timp de 3 ore, fiecare pe propria afacere. La final, pleci cu un roadmap personalizat de validare — ca să știi ce merită investigat, ce procese sau sarcini ar putea fi automatizate ori delegate AI-ului și care este, pe bune, PRIMUL PAS.',
  ],
  // Linia de închidere a hero-ului: contrastul care spune ce NU e workshopul.
  // Înainte erau două propoziții („Nu vii la un curs despre tehnologie." /
  // „Vii să lucrezi pe o problemă reală din afacerea ta."); strânse la una
  // singură, cu aceeași treabă.
  corp: ['Nu discutăm tehnic, discutăm soluții la probleme reale.'],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   02 — TRUST BAR
   Strip compact, imediat sub hero: tot ce trebuie știut dintr-o privire,
   inclusiv adresa completă (D6 — obligatorie pe pagină, vezi copy-invariants).
   Distinctă de BaraScarcity.astro (bara fixă, permanent vizibilă la scroll) —
   asta e un bloc din flux, o singură dată, cu mai mult context.
   ═══════════════════════════════════════════════════════════════════════════ */

export const trustBar = {
  /*
   * BILETUL (a șaptea rundă, 2026-09-07, Ciprian: „acum mi se pare doar
   * aglomerat"). Înainte: patru propoziții de aceeași mărime, aproape tot
   * textul în IBM Plex Mono la 13px — inclusiv adresa, care e proză, nu date.
   * Nimic nu ancora privirea, deci cardul se citea rând cu rând, nu dintr-o
   * privire.
   *
   * Acum e un bilet: un titlu (data), patru rânduri cu pictogramă, o
   * perforație și un talon. Fiecare rând are o `valoare` (ce citești întâi)
   * și, opțional, un `detaliu` (ce citești doar dacă te interesează rândul).
   * Pictograma e ancora de scanare; eticheta rămâne doar pentru cititoarele
   * de ecran, fiindcă valoarea se descrie deja singură („Maximum 30 de
   * participanți" nu are nevoie de eticheta „Grup").
   *
   * `meta` (propoziția-rezumat de dinainte) a dispărut: era text doar pentru
   * cititoarele de ecran care dubla exact ce scrie acum vizibil în rânduri.
   * D6 (adresa completă pe pagină) e acoperit de rândul `loc`, vizibil —
   * mai bine decât ascuns.
   */
  titlu: EVENIMENT.dataText,
  randuri: [
    {
      cheie: 'ora',
      eticheta: 'Ora',
      valoare: EVENIMENT.ora,
      // „20% context" și „80% lucru" sunt singurele procente permise pe
      // pagină (excepție explicită în tests/copy-invariants.test.ts) —
      // formulările astea două trebuie păstrate literal, altfel invariantul
      // „fără procente" prinde restul.
      detaliu: '3 ore: 20% context · 80% lucru pe propria afacere',
    },
    {
      cheie: 'loc',
      eticheta: 'Locul',
      valoare: EVENIMENT.locatie,
      detaliu: EVENIMENT.adresa,
    },
    {
      cheie: 'grup',
      eticheta: 'Grupul',
      valoare: `Maximum ${EVENIMENT.capacitate} de participanți`,
      detaliu: null,
    },
    {
      cheie: 'roadmap',
      eticheta: 'Ce pleacă cu tine',
      valoare: 'Roadmap digital personalizat',
      detaliu: 'Primit pe email, la final.',
    },
  ],
  /*
   * Talonul. Cerut explicit roșu (2026-09-07) — singurul roșu din fluxul
   * paginii, în afara mesajelor de validare și a barei fixe. Absoarbe și
   * fostul rând italic de sub card („Workshop restrâns, distribuit în
   * principal prin invitații.") și cuvântul „Gratuit" din fostul `format`:
   * amândouă spuneau bucăți din aceeași condiție de acces, în două locuri.
   *
   * ATENȚIE la invariantul „«gratuit» apare de exact trei ori în corpul
   * paginii" (trust bar + FAQ + CTA final): rândul ăsta e unicul „gratuit"
   * din trustBar. Dacă mai apare unul aici, testul pică — corect.
   */
  acces: 'Participarea este gratuită, pe bază de invitație.',
  calendar: 'Adaugă în calendar',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   03 — PROBLEMA
   Deschide direct cu exemple concrete, nu cu „AI-ul e peste tot" — absoarbe
   spiritul fostului grid de exemple (§09 vechi). Nu se taie la mobil,
   indiferent ce (regulă neschimbată de pivotul de structură).
   ═══════════════════════════════════════════════════════════════════════════ */

export const problema = {
  // Text nou, primit de la Ciprian (2026-09-07, a treia rundă) — înlocuiește
  // integral varianta de mai sus (`sauPoate`/`intreTimp`/`intrebare` au
  // dispărut, niciuna nu mai apare în textul nou). Structură: două liste
  // scurte (simptome → întrebări care blochează), apoi o concluzie de trei
  // propoziții care numește costul emoțional — nu se mai închide cu o
  // întrebare mare, ci cu o afirmație („presiunea... crește"), care se leagă
  // direct de h2-ul din Agravare, chiar dedesubt („Cel mai scump început...").
  h2: 'Simți că unele aspecte ale afacerii tale ar putea funcționa mai bine:',
  exemple: [
    'Gestionarea și procesarea informațiilor din documente',
    'Viteza de răspuns la solicitările de ofertă venite din partea prospecților sau clienților',
    'Raportările către management sau direct către tine, pe baza cărora poți lua decizii informate',
  ],
  intrebariIntro: 'Iar întrebările care nu-ți dau pace sunt:',
  intrebari: ['De unde să încep?', 'Ce arde mai tare?', 'Cine urlă mai tare?'],
  // Trei propoziții la aceeași greutate, fără nicio linie de separare între
  // liste și ele: textul primit e O secțiune, nu două (corectat pe loc, la
  // feedback direct — prima variantă punea ultima propoziție la corp mare,
  // bold, iar împreună cu bara de deasupra citea ca o secțiune NOUĂ).
  // Nu tăia „FOMO": e cuvântul cerut explicit.
  concluzie: [
    'Rezultatul acestor incertitudini? Te blochezi. Apar anxietatea și frica de a pierde oportunități — FOMO.',
    'Unde mai pui că tehnologia avansează rapid și, sincer, devine copleșitoare chiar și pentru experții din domeniu.',
    'În tot zgomotul acesta, presiunea de a face ceva crește înainte să fie clar ce merită făcut.',
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   04 — AGRAVARE
   Secțiune nouă (pivot 2026-09-02). Costul de a începe fără o problemă
   clară — nu dramatic, ci un cost tăcut, recognoscibil.
   ═══════════════════════════════════════════════════════════════════════════ */

export const agravare = {
  /*
   * Text nou, primit de la Ciprian (2026-09-07, a patra rundă) — înlocuiește
   * integral varianta anterioară (`alternativa`, `corpFinal` și `concluzie`
   * au dispărut, niciuna nu mai apare în textul nou). Secțiunea se strânge
   * de la trei blocuri de proză + un card bogat la: titlu, UN paragraf, card.
   *
   * Paragraful e deliberat o singură frază lungă, cu patru propoziții
   * înlănțuite — acumularea E mesajul („toate acestea se adună"). Nu-l tăia
   * în propoziții separate: efectul de îngrămădire dispare.
   */
  h2: 'Ambiguitatea are un cost. Și poate ți-e groază să-l calculezi.',
  corp: [
    'Presiunea pusă pe echipă crește până când nu mai rămâne nicio marjă de înțelegere, compania se mișcă prea încet față de piață și așteptările clienților, iar concurența folosește deja instrumente moderne — simți că rămâi în urmă, iar toate acestea se adună în costuri ascunse care apasă sănătatea financiară a companiei.',
  ],
  /*
   * Cardul de quick-win (numit așa explicit de Ciprian) — singura întoarcere
   * pozitivă din secțiune, după acumularea de mai sus. Cele două rânduri sunt
   * o pereche de contrast (nu X / ci Y) și rămân la ACEEAȘI greutate: textul
   * primit nu marchează niciun accent, iar ierarhia neinventată e regula
   * după corecția din §02 („nu trebuie divizată").
   */
  card: {
    h3: 'De aceea merită cele 3 ore.',
    linii: ['Nu ca să alegi încă o unealtă.', 'Ci ca să clarifici ce merită rezolvat mai întâi.'],
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   05 — SOLUȚIA
   Fostă `despreDeepLogic` (mutată devreme la pivotul de narativă din aceeași
   zi, D31–D36) — redenumită `solutie`, conținut rescris după v4. Mecanismul
   central al paginii: perspectiva ownerului e punctul de plecare, nu verdictul.
   ═══════════════════════════════════════════════════════════════════════════ */

export const solutie = {
  /*
   * Text nou, primit de la Ciprian (2026-09-08) — înlocuiește integral
   * varianta anterioară. `intrebari`, `concluzieIntro`, fostul `h3`
   * („Afacerea ta nu are o singură realitate.”) + `perspectiva`,
   * `mecanismIntro`, vechiul `mecanism` (4 rânduri) și `h3Era` + `eraCorp`
   * au dispărut — niciunul nu mai apare în textul nou.
   *
   * Structură nouă, mult mai lungă: intro (2 paragrafe) → metodă (h3 +
   * 6 pași, titlu+descriere fiecare) → card „la finalul celor trei ore" →
   * afterlife (h3 + intro + 6 bullets + 2 paragrafe de închidere) → card
   * final, o singură propoziție.
   */
  h2: 'Soluția este PRIMUL PAS, munca dinaintea implementării.',
  intro: [
    'În AI și automatizări, blocajul nu vine din lipsa de informații. Vine din faptul că prea multe arii ale afacerii par să merite atenție în același timp. Fără o metodă, fie amâni, fie alegi după ce pare urgent astăzi.',
    'În cele trei ore punem perspectiva ta de owner într-o ordine de lucru și stabilim ce arie merită investigată prima.',
  ],
  /*
   * Titlul metodei — deliberat NU un heading (rămâne `<p>`, stilizat): cele
   * șase titluri de pași de mai jos sunt `h3`, direct sub `h2`-ul secțiunii,
   * la fel ca la S06CeFacem.astro (h2 → h3 pe fiecare pas, fără o treaptă
   * intermediară). O pagină care are STRICT h1→h2→h3 (verificat runda
   * trecută) nu capătă acum primul h4 doar pentru eticheta asta.
   */
  h3Metoda: 'Cum lucrăm, concret',
  /*
   * Numerotare ca la `ceFacem.blocuri` — șiruri zero-padded în date
   * (`'01'`…`'06'`), nu `counter()` CSS: textul primit are exact formatul
   * „01 — Titlu", iar `counter()` ar fi dat „1", nu „01".
   */
  pasi: [
    {
      numar: '01',
      titlu: 'Punem pe masă ce te apasă',
      corp: 'Inventariem ariile în care simți că se pierd timp, bani sau oportunități. Fără să alegem și fără să căutăm încă soluții.',
    },
    {
      numar: '02',
      titlu: 'Clarificăm ce vrei să fie diferit',
      corp: 'Pentru fiecare arie, definim ce se întâmplă acum, ce rezultat ai vrea să obții și după ce ai recunoaște o schimbare reală.',
    },
    {
      numar: '03',
      titlu: 'Le punem una lângă alta',
      corp: 'Le comparăm pe baza a ceea ce știi astăzi: cât de des apar blocajele, ce consumă, ce întârzie și cât de mult contează pentru direcția companiei.',
    },
    {
      numar: '04',
      titlu: 'Prioritizăm o singură arie',
      corp: 'Nu alegem ce sună mai spectaculos pentru AI. Alegem aria pentru care există cele mai bune motive să începi investigația.',
    },
    {
      numar: '05',
      titlu: 'Separăm ce știi de ce presupui',
      corp: 'Notăm ce este fapt, ce este estimare și ce trebuie verificat. Așa vedem ce presupunere ar putea confirma sau răsturna alegerea făcută.',
    },
    {
      numar: '06',
      titlu: 'Construim roadmap-ul de validare',
      corp: 'Stabilim ce trebuie să afli mai departe, cu cine din companie trebuie să vorbești, la ce date merită să te uiți și care este primul pas concret după workshop.',
    },
  ],
  // Card „quickwin" #1 — ce pleacă acasă cu tine, imediat după cele 6 etape.
  cardFinal: {
    eyebrow: 'La finalul celor trei ore',
    corp: 'Pleci cu aria prioritară, prima ipoteză de business și un roadmap de validare: ce verifici, cu cine, în ce ordine și care este primul pas.',
  },
  h3Afterlife: 'Ce poți face, concret, cu roadmap-ul?',
  afterlifeIntro: 'A doua zi, nu te întorci în companie cu „ar trebui să facem și noi ceva cu AI”. Ai un punct clar de pornire:',
  // Bullete reale, cerute explicit — aceeași bulină (`•`) ca în §02, nu
  // liniuțe și nu un al doilea limbaj vizual de marcaj pe pagină.
  afterlifePasi: [
    'Îl prezinți partenerului sau managerilor ca perspectivă a ta de owner — nu ca verdict.',
    'Organizezi un workshop de discovery cu oamenii care lucrează în aria respectivă.',
    'Compari ceea ce vezi tu cu realitatea lor: blocajele, excepțiile și munca nevăzută din proces.',
    'Identifici ce procese trebuie analizate și ce proceduri, informații sau date lipsesc ori trebuie actualizate.',
    'Transformi concluziile în următoarea acțiune: ce verifici, cine se ocupă și ce dovadă cauți.',
    'Folosești rezultatul ca filtru pentru orice soluție de AI sau automatizare care îți este propusă.',
  ],
  afterlifeConcluzie: [
    'Poți parcurge pașii cu echipa ta. Sau putem continua împreună: facilităm discovery-ul, mapăm procesul real și stabilim dacă există motive suficiente pentru o implementare.',
    'Abia atunci decidem ce trebuie construit — și dacă AI-ul este, într-adevăr, soluția potrivită.',
  ],
  // Card „quickwin" #2 — închiderea secțiunii, o singură propoziție (aceeași
  // rețetă vizuală ca fostul `sinteza`: o frază, `.card-depth`).
  cardInchidere:
    'PRIMUL PAS nu este implementarea. Este prima acțiune concretă care face o implementare bună posibilă.',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   06 — CEI CINCI PAȘI AI METODOLOGIEI — RETRASĂ (2026-09-08)
   Era păstrată explicit (AskUserQuestion, 2026-09-02) deși nu apărea ca
   secțiune separată în v4 — singurul moment de pin/scrub GSAP de pe pagină,
   cost aprobat special pentru el (D38). Retrasă acum, explicit: „renunțăm la
   metodologie... pentru că explicăm cum ajungem la rezultat" — §05 Soluție
   acoperă deja același teritoriu, cu metodă proprie (6 pași, titlu+
   descriere, D73–D75, scrisă chiar în ziua precedentă). O secțiune separată
   care repeta aceeași idee, cu alți 5 pași, era dublură, nu întărire.
   Retragerea a scos și SINGURUL consumator al Lenis+GSAP de pe pagină —
   vezi `Base.astro` și `docs/DECIZII.md` D78. `S06CeFacem.astro` a fost
   șters, nu doar dezactivat.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   07 — DESPRE CIPRIAN MICU (FACILITATOR)
   Bio rescrisă după v4 — mai multă autoritate practică (15 ani, decembrie
   2022), fără blocul despre faliment (D8, neschimbat).

   Ultimele două propoziții înlocuite (2026-09-08, D80) — povestea personală
   („la patru ani legam mobilierul cu elastic... după piatră, am descoperit
   ciocanul") a devenit metafora ciocanului ca unealtă civilizațională:
   descoperirea lui a dus la toate uneltele care au urmat, așa cum AI-ul e
   azi unealta cu care construim uneltele digitale următoare. Text primit
   brut de la Ciprian („Consider ca azi ne aflăm...!"), adaptat la vocea
   stabilită (fără semne de exclamare — zero în tot fișierul, verificat;
   „Cred că" în loc de „Consider că", mai simplu) și legat explicit de
   propoziția de dinainte prin cuvântul „unelte digitale", deja prezent
   acolo — nu un salt de subiect, o continuare.
   ═══════════════════════════════════════════════════════════════════════════ */

export const facilitator = {
  h2: 'Cine ține workshopul?',
  nume: 'Ciprian Micu',
  rol: 'Fondator Deep Logic',
  corp: [
    'Lucrez de peste 15 ani în antreprenoriat, operațiuni și procese.',
    'În decembrie 2022 am început să lucrez serios cu inteligența artificială dintr-un motiv simplu: aveam o afacere și căutam soluții pentru probleme reale.',
    'N-am pornit din IT. Și nu țin workshopul ca să-ți arăt cât de complicată e tehnologia. Mă interesează ce poate schimba ea într-o companie reală, ce merită construit și ce nu merită.',
    'Astăzi pot să-mi construiesc propriile unelte digitale în jurul problemelor pe care le am. De aici vine Deep Logic și ordinea în care lucrăm: business → oameni → procese → impact → tehnologie.',
    'Cred că trăim un moment asemănător cu cel în care omenirea a descoperit prima unealtă — piatra cioplită, apoi ciocanul. De-acolo au apărut, una după alta, toate celelalte unelte.',
    'AI-ul e, pentru mine, „ciocanul” de azi: nu scopul, ci unealta cu care construim următoarele unelte digitale.',
  ],
  foto: {
    src: '/ciprian-micu.jpg',
    alt: 'Ciprian Micu, fondator Deep Logic',
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   08 — CUI I SE ADRESEAZĂ / CUI NU I SE ADRESEAZĂ
   Filtru real, nu politețe. Cele două liste rămân VIZUAL EGALE (regulă
   neschimbată). Conținut rescris după v4.
   ═══════════════════════════════════════════════════════════════════════════ */

/*
 * Strânsă la top 3 pe listă (2026-09-09, cerut explicit: „alege ce este mai
 * relevant pentru profilul și promisiunea workshopului") — de la 7+7 la 3+3.
 * Cele 4+4 scoase din fiecare listă rămân în `docs/landing-workshop-16-09.md`
 * ca istoric (D81), nu doar șterse tăcut.
 *
 * Criteriul de selecție, explicit: fiecare rând rămas trebuie să facă o
 * treabă DISTINCTĂ — profil (cine ești) SAU promisiune (ce primești/ce nu) —
 * nu doar „încă un motiv plauzibil". Rândurile scoase erau fie redundante cu
 * unul păstrat (echipă/procese repetitive ≈ „afacere funcțională"; „ai
 * testat unelte" + „n-ai explorat deloc" sunt cele două capete ale aceleiași
 * idei — oricine se regăsește undeva între ele), fie deja acoperite explicit
 * altundeva pe pagină (formatul „lucrezi 3 ore pe propria afacere" e în
 * Trust bar și Hero; „nu vii doar să privești" e reversul aceluiași lucru).
 *
 * Cele trei rânduri păstrate pe `da` și `nu` se oglindesc intenționat:
 * — DA „știi că ceva ar putea funcționa mai bine, dar nu știi de unde să
 *   începi" ↔ NU „vrei să ți se spună ce trebuie implementat fără să
 *   discutăm mai întâi despre business" — unul vine curios, celălalt vrea
 *   un scurtcircuit peste proces.
 * — DA „vrei să înțelegi problema înainte să cumperi soluția" ↔ NU „cauți o
 *   listă de tool-uri" + NU „te aștepți la o soluție completă în trei ore"
 *   — amândouă contrazic direct exact ce cere rândul DA.
 * Ambele ecouă `outro`, neschimbat: „a decide mai bine ce merită schimbat și
 * de unde merită să începi" — nu „a introduce mai multă tehnologie".
 */
export const pentruCine = {
  da: {
    h2: 'Este pentru tine dacă',
    lista: [
      'Ai o afacere funcțională sau iei decizii importante într-o companie',
      'Știi că unele lucruri ar putea funcționa mai bine, dar nu știi de unde să începi',
      'Vrei să înțelegi problema înainte să cumperi soluția',
    ],
  },
  nu: {
    h2: 'Nu este pentru tine dacă',
    lista: [
      'Cauți o listă cu cele mai bune tool-uri sau prompturi',
      'Te aștepți să construim o soluție completă în trei ore',
      'Vrei să ți se spună ce trebuie implementat fără să discutăm mai întâi despre business',
    ],
  },
  outro: [
    'PRIMUL PAS nu este despre a introduce cât mai multă tehnologie în companie.',
    'Este despre a decide mai bine ce merită schimbat și de unde merită să începi.',
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   09 — CE REZULTAT PROMITEM
   Fostă `rezultatul` — extinsă să absoarbă „cum lucrăm" (fost §12 Precedent,
   20/80) și „de ce să mai chemi pe cineva" (conținut nou din v4), plus
   blocul de onestitate „ce NU îți promit" (fostă `rezultatul.granita`).
   ═══════════════════════════════════════════════════════════════════════════ */

export const rezultatul = {
  h2: 'Ce primești pentru cele 3 ore?',
  lista: [
    {
      titlu: 'O nevoie clar formulată',
      corp: 'Nu „Ar trebui să facem și noi ceva.” Ci: „Asta este problema sau oportunitatea pe care vreau s-o investighez.”',
    },
    {
      titlu: 'O primă estimare a impactului',
      corp: 'Cât de des apare, câți oameni implică, cât timp consumă. Nu inventăm ROI — vedem dacă merită investigată.',
    },
    {
      titlu: 'Oamenii care trebuie implicați',
      corp: 'Identifici cine execută procesul, cine îl coordonează, cine primește rezultatul și cine trăiește blocajele lui zi de zi.',
    },
    {
      titlu: 'Un roadmap personalizat de validare',
      corp: 'Nevoia identificată, de ce contează, impactul preliminar, ce trebuie verificat, cine trebuie implicat, acțiunile concrete pentru următorul pas și recomandarea Deep Logic privind continuarea — pe email.',
    },
  ],
  granita: {
    h3: 'Ce nu îți promit',
    corp: [
      'Nu îți promit că, după trei ore, știm dacă ipoteza e corectă. Ar fi incorect.',
      'Pentru asta trebuie să vorbim cu oamenii care lucrează în proces, să vedem cum funcționează în realitate și să analizăm datele, impactul, efortul și riscurile.',
      'PRIMUL PAS îți arată ce merită investigat. Nu pretinde că îți dă verdictul înainte de investigație.',
    ],
  },
  cumLucram: {
    h3: 'Cum lucrăm',
    intro: '20% context. 80% lucru aplicat.',
    corp: [
      'Contextul există doar cât să punem întrebările corecte.',
    ],
    lista: [
      'Ce ai vrea să funcționeze diferit',
      'Unde se consumă timp, bani, energie sau atenție',
      'Cine este implicat',
      'Ce valoare ar avea schimbarea',
      'Ce ar putea fi delegat sau construit diferit',
      'Ce trebuie validat înainte să implementezi',
    ],
    outro: [
      'Nu lucrăm pe un business imaginar. Lucrăm pe al tău.',
      'Nu trebuie să fii IT-ist. Nu trebuie să știi să programezi. Laptopul nu este obligatoriu.',
    ],
  },
  chemaCineva: {
    h3: 'De ce să mai chemi pe cineva?',
    corp: [
      'Pentru că un singur om vede doar o parte din afacere.',
      'Tu poți vedea obiectivul. Un partener, un manager sau un coleg-cheie poate vedea procesul altfel. Un alt antreprenor îți poate pune întrebarea pe care tu nu ți-o mai pui.',
      'Dacă vii împreună cu cineva în care ai încredere, nu dublezi informația.',
    ],
    accent: 'Dublezi perspectiva.',
    corpFinal: [
      'Și plecați cu un pas pe care îl puteți continua și după workshop, nu doar cu o idee care rămâne într-un carnețel.',
      'Poate fi cineva din compania ta sau un alt antreprenor cu care ai o relație bună.',
    ],
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   DETALII — nu mai e secțiune proprie (fostă §13). Adresa completă (D6) trăiește
   aici, consumată de TrustBar.astro. Păstrat ca export pentru consistență cu
   restul datelor factuale, chiar dacă nu mai are componentă dedicată.
   ═══════════════════════════════════════════════════════════════════════════ */

export const detalii = {
  adresaCompleta: `${EVENIMENT.locatie}, ${EVENIMENT.adresa}`,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   10 — FAQ
   Rescrisă după v4 (7 întrebări) + o a 8-a păstrată din structura veche —
   „O să-mi vindeți ceva la final?" nu mai apare în draftul lui Ciprian, dar
   explică mecanismul bifei opționale de discuție din formular
   (form-schema.ts, BIFE.discutie) — fără ea rămâne un mecanism de încredere
   netestat de cititor. Adăugată ca a 8-a, nu forțată în locul alteia.
   ═══════════════════════════════════════════════════════════════════════════ */

export const faq = {
  h2: 'Întrebări directe',
  intrebari: [
    {
      q: 'De ce să-mi dau 3 ore pentru asta?',
      a: 'Pentru că trecerea de la „ceva nu merge bine” la o nevoie clară cere mai mult decât o prezentare de 30 de minute. Avem nevoie de timp ca să formulăm problema, să-i estimăm miza, să identificăm oamenii implicați și să construim următorii pași. Mai puțin ar însemna să vorbesc eu mai mult — scopul e să lucrezi tu.',
    },
    {
      q: 'De ce aș invita și pe altcineva?',
      a: 'Pentru că discuția continuă mai ușor după workshop când mai există cineva care a trecut prin același proces — un co-owner, un manager, un coleg-cheie sau un alt antreprenor. Vă puteți provoca ipotezele și vă puteți ține responsabili pentru pasul pe care spuneți că îl veți face. Fiecare persoană trebuie să-și rezerve propriul loc.',
    },
    {
      q: 'Trebuie să am experiență cu AI sau cu instrumente digitale noi?',
      a: 'Nu. Poți veni și dacă ai folosit doar de câteva ori ChatGPT sau dacă n-ai explorat serios zona. Workshopul pornește de la afacerea ta, nu de la tehnologie.',
    },
    {
      q: 'Trebuie să vin cu problema deja identificată?',
      a: 'Nu. Este suficient să știi că există lucruri pe care ai vrea să le faci mai bine. O parte importantă din workshop e chiar formularea nevoii.',
    },
    {
      q: 'Este potrivit pentru domeniul meu?',
      a: 'Dacă ai procese, oameni, informații, clienți sau decizii care se repetă, ai suficient material de lucru. Nu venim cu același caz pentru toate firmele — lucrăm pornind de la situația ta.',
    },
    {
      q: 'Trebuie să aduc laptop?',
      a: 'Nu. Laptopul nu este obligatoriu și nu trebuie să te pregătești tehnic înainte.',
    },
    {
      q: 'Ce primesc după workshop?',
      a: 'Un roadmap digital personalizat pe email: nevoia identificată, impactul preliminar, ce trebuie validat, cine trebuie implicat și acțiunile recomandate pentru următorul pas.',
    },
    {
      q: 'O să-mi vindeți ceva la final?',
      a: 'Nu de la microfon. Pe formularul de la final există o singură bifă, prin care poți cere o discuție dacă vrei. Dacă n-o bifezi, nu te caută nimeni.',
    },
    {
      q: 'Este participarea cu adevărat gratuită?',
      a: `Da. Vreau să fac metodologia Deep Logic cunoscută și să o validez în sală, pe situații reale aduse de antreprenori și oameni de decizie. Tu vii cu realitatea afacerii tale și cu trei ore de atenție. Eu vin cu metodologia, facilitarea și roadmap-ul personalizat. La final, îți voi cere feedback sincer.`,
    },
    {
      // Nu e în draftul lui Ciprian (v4) — păstrată din structura veche.
      // Singurul loc de pe pagină care spune explicit că cifra de capacitate
      // nu e umflată; fără ea, promisiunea trăiește doar în backend, nu și
      // în ce vede cititorul.
      q: 'Ce se întâmplă dacă mă înscriu și nu pot ajunge?',
      a: `Anunță-mă și eliberez locul pentru altcineva. Sunt ${EVENIMENT.capacitate} și, la mine, chiar sunt ${EVENIMENT.capacitate}.`,
    },
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   ÎNSCRIERE (antetul dialogului de înscriere, DialogInscriere.astro)
   ═══════════════════════════════════════════════════════════════════════════ */

export const inscriere = {
  h2: `Rezervă-ți locul la ${EVENIMENT.titlu}`,
  corp: 'Înscrierea durează câteva minute. Pe lângă datele de contact, îți voi pune câteva întrebări despre afacerea ta. Nu trebuie să ai răspunsurile perfecte.',
  meta: `${EVENIMENT.dataText} · ${EVENIMENT.ora} · ${EVENIMENT.oras}`,
  microcopy:
    'Întrebările mă ajută să înțeleg cine vine în sală și să pregătesc workshopul pe probleme reale, nu pe una imaginară. După înscriere primești confirmarea și detaliile de participare pe email.',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   CTA FINAL
   ═══════════════════════════════════════════════════════════════════════════ */

export const ctaFinal = {
  h2: ['Afacerea ta este diferită.', 'Primul pas ar trebui să fie al ei.'],
  meta: `${EVENIMENT.dataText} · ${EVENIMENT.ora} · ${EVENIMENT.oras} · Participare gratuită · Maximum ${EVENIMENT.capacitate} de locuri`,
  corp: [
    'Noua eră digitală vine cu mai multe posibilități.',
    'Dar posibilitățile nu sunt un plan.',
    'Dacă încă nu știi care este primul pas care merită făcut în afacerea ta, este în regulă.',
  ],
  accent: 'Pentru asta există PRIMUL PAS.',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   FOOTER
   Minimalist. Fără newsletter signup, fără social icons multiple, fără sitemap.
   ═══════════════════════════════════════════════════════════════════════════ */

export const footer = {
  brand: 'Deep Logic',
  locatie: 'Satu Mare, România',
  email: 'contact@deeplogic.ro',
  linkedin: 'https://www.linkedin.com/company/deep-logic-ro',
  website: 'https://deeplogic.ro',
  legal: [
    { text: 'Termeni', href: '/termeni' },
    { text: 'Politica de confidențialitate', href: '/confidentialitate' },
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   STĂRI DE RĂSPUNS — ecrane post-submit
   ═══════════════════════════════════════════════════════════════════════════ */

export const stari = {
  inscris: {
    titlu: 'Gata. Locul e al tău.',
    corp: [
      'Îți trimit confirmarea pe email, cu adresa exactă.',
      'Cu două zile înainte îți scriu să confirmi că vii — dacă nu poți, eliberez locul.',
    ],
  },

  asteptare: {
    titlu: 'Ești pe lista de așteptare.',
    corp: [
      `Cele ${EVENIMENT.capacitate} de locuri sunt luate. Ți-am trimis un email cu poziția ta.`,
      'Se eliberează locuri aproape întotdeauna — oameni care anunță că nu mai pot veni. Când se întâmplă, primești un mesaj și primul care confirmă ia locul.',
      'Nu e ordine de așteptare, e cine răspunde primul. Ține telefonul la îndemână pe 14 și 16 septembrie.',
    ],
  },

  dejaInscris: {
    titlu: 'Ești deja înscris.',
    corp: [
      'Am găsit adresa asta pe listă. Nu te-am înscris de două ori.',
      'Ți-am retrimis confirmarea pe email, în caz că prima s-a pierdut.',
    ],
  },

  anulatAnterior: {
    titlu: 'Ai anulat locul ăsta mai devreme.',
    corp: [
      'Dacă vrei totuși să vii, scrie-mi la contact@deeplogic.ro și te bag înapoi manual.',
      'Așa mă asigur că nu se dublează nimic în evidență.',
    ],
  },

  eroare: {
    titlu: 'N-a mers.',
    corp: [
      'Ceva s-a rupt la mine, nu la tine. Datele tale n-au fost salvate.',
      'Încearcă din nou peste un minut. Dacă tot nu merge, scrie-mi direct la contact@deeplogic.ro și te înscriu manual.',
    ],
  },

  reconfirmat: {
    titlu: 'Perfect. Ne vedem miercuri.',
    corp: [
      `${EVENIMENT.locatie}, ${EVENIMENT.adresa}.`,
      `${EVENIMENT.dataText}, ${EVENIMENT.ora}.`,
      'Vino cu un pix. Atât.',
    ],
  },

  anulat: {
    titlu: 'Am înțeles. Locul e eliberat.',
    corp: [
      'Mersi că ai anunțat — chiar contează, pentru că îl ia altcineva de pe lista de așteptare.',
      'Când mai țin unul, îți scriu.',
    ],
  },

  locRevendicat: {
    titlu: 'Locul e al tău.',
    corp: [
      'Ai fost primul care a confirmat. Te-am mutat de pe lista de așteptare pe listă.',
      `${EVENIMENT.locatie}, ${EVENIMENT.adresa} — ${EVENIMENT.dataText}, ${EVENIMENT.ora}.`,
      'Adaugă-l în calendar cu butonul de mai jos, ca să nu-l pierzi.',
    ],
  },

  locLuat: {
    titlu: 'Locul a fost luat.',
    corp: [
      'Cineva a confirmat înaintea ta. Îmi pare rău — chiar a fost o chestiune de minute.',
      'Rămâi pe listă. Dacă se mai eliberează unul, primești din nou mesaj.',
    ],
  },

  tokenInvalid: {
    titlu: 'Linkul ăsta nu mai e valabil.',
    corp: [
      'Ori a fost folosit deja, ori s-a stricat pe drum — unele programe de email rup linkurile lungi.',
      'Scrie-mi la contact@deeplogic.ro și rezolv eu manual.',
    ],
  },

  checkinReusit: {
    titlu: 'Bine ai venit.',
    corp: ['Te-am bifat. Ia loc unde vrei.'],
  },

  datePastrate: {
    titlu: 'Gata. Îți păstrez datele.',
    corp: ['Ceasul repornește de azi — te caut din nou peste un an.'],
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   META — SEO și carduri de partajare
   ═══════════════════════════════════════════════════════════════════════════ */

export const meta = {
  titlu: 'PRIMUL PAS — workshop gratuit Deep Logic, Satu Mare',
  descriere: `Trei ore, miercuri 16 septembrie. Nu implementezi AI — formulezi nevoia, estimezi impactul și pleci cu un roadmap de validare. ${EVENIMENT.capacitate} de locuri.`,
  ogTitlu: 'PRIMUL PAS — workshop Deep Logic',
  ogDescriere: `16 septembrie · Satu Mare · trei ore. Pleci cu un roadmap digital, nu cu notițe. ${EVENIMENT.capacitate} de locuri.`,
  ogImagine: '/og-workshop-16-09.png',
  locale: 'ro_RO',
} as const;
