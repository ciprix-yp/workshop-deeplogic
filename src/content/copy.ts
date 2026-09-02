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
 * Ce a rămas, deliberat, deși nu apare explicit în cele 10 puncte ale lui
 * Ciprian: `ceFacem` (cei cinci pași ai metodologiei, pin/scrub GSAP) —
 * confirmat explicit prin AskUserQuestion („păstrez secțiunea GSAP separat")
 * — e singurul moment de mișcare semnificativă de pe pagină și costul GSAP
 * (~49KB gzip) fusese deja aprobat special pentru el (pivotul Lenis/GSAP,
 * 2026-09-01). Poziționat după Soluție, înainte de Facilitator: Soluția
 * explică mecanismul conceptual, CeFacem îl arată ca pași concreți.
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
  // 3 rânduri forțate, nu 2 — cerut explicit (a cincea rundă, 2026-09-02),
  // ca „Cum faci PRIMUL PAS" să nu depindă de unde încape textul la wrap.
  h1: ['Afacerea ta este diferită.', 'Cum faci PRIMUL PAS', 'în noua eră digitală?'],
  // Tagline rescris (2026-09-02, la cererea lui Ciprian) — text brut primit,
  // strâns fără să piardă mecanismul: invitația, ce faci timp de 3 ore, ce
  // pleci cu tine (roadmap-ul), de ce contează (știi exact care e PRIMUL PAS).
  subheadline:
    'Vino să descoperi, alături de ceilalți din sală, primii pași care chiar merită făcuți ca să aduci AI în compania ta. Lucrezi 3 ore pe propria afacere și pleci cu un roadmap de implementare — ca să știi exact ce ai de făcut și care e, pe bune, PRIMUL PAS.',
  corp: ['Nu vii la un curs despre tehnologie.', 'Vii să lucrezi pe o problemă reală din afacerea ta.'],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   02 — TRUST BAR
   Strip compact, imediat sub hero: tot ce trebuie știut dintr-o privire,
   inclusiv adresa completă (D6 — obligatorie pe pagină, vezi copy-invariants).
   Distinctă de BaraScarcity.astro (bara fixă, permanent vizibilă la scroll) —
   asta e un bloc din flux, o singură dată, cu mai mult context.
   ═══════════════════════════════════════════════════════════════════════════ */

export const trustBar = {
  meta: `${EVENIMENT.dataText} · ${EVENIMENT.ora} · ${EVENIMENT.locatie}, ${EVENIMENT.adresa}`,
  format: `20% context · 80% lucru aplicat · Maximum ${EVENIMENT.capacitate} de participanți · ${EVENIMENT.cost}`,
  roadmap: 'Roadmap digital personalizat, primit pe email la final.',
  invitatie: 'Workshop restrâns, distribuit în principal prin invitații.',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   03 — PROBLEMA
   Deschide direct cu exemple concrete, nu cu „AI-ul e peste tot" — absoarbe
   spiritul fostului grid de exemple (§09 vechi). Nu se taie la mobil,
   indiferent ce (regulă neschimbată de pivotul de structură).
   ═══════════════════════════════════════════════════════════════════════════ */

export const problema = {
  h2: 'Știi că unele lucruri ar putea funcționa mai bine. Dar cu ce începi?',
  exemple: [
    'Poate ofertele durează prea mult.',
    'Poate informația e împrăștiată prin emailuri, tabele și oameni.',
    'Poate follow-up-ul se pierde.',
    'Poate colegii repetă aceeași muncă în fiecare săptămână.',
    'Poate prea multe lucruri depind de un singur om.',
  ],
  sauPoate:
    'Sau poate n-ai încă o problemă clar formulată. Doar simți că afacerea s-ar putea mișca mai bine decât o face acum.',
  intreTimp: [
    'În același timp apar tot mai multe instrumente și tot mai multe promisiuni.',
    'Fiecare pare să rezolve ceva.',
    'Dar nu ai nevoie, în primul rând, de încă un cont, încă un abonament sau încă o demonstrație.',
  ],
  intrebare: 'Ce problemă merită atenția ta acum?',
  intrebareSub: 'Și ce trebuie să afli înainte să investești timp, bani și energie în ea?',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   04 — AGRAVARE
   Secțiune nouă (pivot 2026-09-02). Costul de a începe fără o problemă
   clară — nu dramatic, ci un cost tăcut, recognoscibil.
   ═══════════════════════════════════════════════════════════════════════════ */

export const agravare = {
  h2: 'Cel mai scump început este cel făcut fără o problemă clară.',
  corp: [
    'De obicei nu arată dramatic.',
    'Alegi o unealtă înainte să alegi problema. Cineva din echipă o testează. Primele zile par promițătoare.',
    'Apoi apar excepțiile, lipsesc datele, procesul real e mai complicat decât părea, iar oamenii revin la vechiul mod de lucru.',
    'Ai consumat timp și bani. Și, uneori, ai întărit ideea că „la noi nu merge”.',
  ],
  alternativa: [
    'Cealaltă variantă e să amâni.',
    'Mai citești. Mai vezi o demonstrație. Mai salvezi un articol. Dar în afacere nu se schimbă nimic.',
  ],
  h3: 'De aceea merită cele 3 ore.',
  corpFinal: [
    'Nu pentru că în 3 ore îți rezolvăm afacerea. Nu îți promit asta.',
    'Merită pentru că nu petrecem timpul pe trenduri, predicții sau liste de instrumente.',
  ],
  concluzie: 'Îl folosim ca să scoatem din ceață un lucru concret: ce vrei să schimbi, de ce contează și ce trebuie verificat înainte să mergi mai departe.',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   05 — SOLUȚIA
   Fostă `despreDeepLogic` (mutată devreme la pivotul de narativă din aceeași
   zi, D31–D36) — redenumită `solutie`, conținut rescris după v4. Mecanismul
   central al paginii: perspectiva ownerului e punctul de plecare, nu verdictul.
   ═══════════════════════════════════════════════════════════════════════════ */

export const solutie = {
  h2: 'PRIMUL PAS este munca de dinaintea implementării.',
  intro: [
    'Pornim de la perspectiva ta, ca antreprenor sau persoană de decizie.',
  ],
  intrebari: [
    'Ce ai vrea să funcționeze diferit?',
    'Unde simți că se pierde timp, atenție, bani sau oportunitate?',
    'De ce contează?',
    'Cine trăiește problema în fiecare zi?',
    'Ce ar trebui să vedem înainte să spunem că merită construit ceva?',
  ],
  concluzieIntro: [
    'Din răspunsurile tale formulăm o primă ipoteză și construim un roadmap de validare.',
    'Nu un plan final de implementare. Nu o soluție aleasă dinainte.',
    'Un punct de plecare suficient de clar încât să poată fi verificat.',
  ],
  h3: 'Afacerea ta nu are o singură realitate.',
  perspectiva: [
    { cine: 'Ownerul', ce: 'vede direcția și rezultatul pe care îl dorește.' },
    { cine: 'Managerul', ce: 'vede dependențele și blocajele.' },
    { cine: 'Omul care lucrează în proces', ce: 'vede excepțiile și realitatea de zi cu zi.' },
    { cine: 'Datele și cifrele', ce: 'arată dacă problema e suficient de importantă.' },
  ],
  mecanismIntro: 'De aceea, la Deep Logic:',
  mecanism: [
    'Pornim de la nevoia ownerului.',
    'O verificăm în realitatea echipei.',
    'Analizăm procesul, impactul și ROI-ul.',
    'Implementăm doar dacă există motive reale.',
  ],
  sinteza: 'Perspectiva ownerului este punctul de plecare. Nu verdictul.',
  h3Era: 'Asta înseamnă pentru mine noua eră digitală.',
  eraCorp: [
    'Până acum, cumpăram un software și ne adaptam modul de lucru la el.',
    'Astăzi putem începe să construim instrumente mai apropiate de felul în care funcționează afacerea în realitate.',
    'Tocmai de aceea alegerea primei probleme contează atât de mult.',
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   06 — CEI CINCI PAȘI AI METODOLOGIEI
   Păstrată explicit (AskUserQuestion, 2026-09-02) deși nu apare ca secțiune
   separată în v4 — singurul moment de pin/scrub GSAP de pe pagină, cost deja
   aprobat special pentru el. Neschimbată de pivotul de structură, doar
   redenumirea „02 REALITATEA ECHIPEI" → „WORKSHOP CU ECHIPA" rămâne
   (pivot de narativă, D34).
   ═══════════════════════════════════════════════════════════════════════════ */

export const ceFacem = {
  h2: 'Cei cinci pași ai metodologiei Deep Logic',
  blocuri: [
    {
      numar: '01',
      titlu: 'PRIMUL PAS',
      corp: [
        'Clarificăm nevoia pe care tu, ca owner sau decident, vrei să o explorezi și construim ipoteze inițiale de lucru.',
      ],
    },
    {
      numar: '02',
      titlu: 'WORKSHOP CU ECHIPA',
      corp: [
        'Descoperim nevoile oamenilor care lucrează efectiv în procese, analizăm blocajele și verificăm ipoteza ta în realitatea de zi cu zi.',
      ],
    },
    {
      numar: '03',
      titlu: 'PROCESE + IMPACT + ROI',
      corp: [
        'Suprapunem perspectiva managementului cu realitatea echipei, procesele și datele disponibile.',
      ],
    },
    {
      numar: '04',
      titlu: 'DECIZIA',
      corp: ['Stabilim ce merită făcut, ce nu merită și ce trebuie prioritizat.'],
    },
    {
      numar: '05',
      titlu: 'IMPLEMENTAREA',
      corp: ['Construim doar acolo unde există suficiente motive să o facem.'],
    },
  ],
  notaFormat: ['Nu pornim de la „Ce putem face cu AI?”'],
  final: 'Pornim de la: „Ce merită să rezolvăm?”',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   07 — DESPRE CIPRIAN MICU (FACILITATOR)
   Bio rescrisă după v4 — mai multă autoritate practică (15 ani, decembrie
   2022), aceeași poveste (elasticul, ciocanul), fără blocul despre faliment
   (D8, neschimbat).
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
    'La patru ani legam mobilierul din camera părinților mei cu elastic. În mintea mea, făceam obiectele să comunice.',
    'După piatră, am descoperit ciocanul. Dar ciocanul nu îți spune ce trebuie construit. Pentru asta ai nevoie de primul pas.',
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

export const pentruCine = {
  da: {
    h2: 'Este pentru tine dacă',
    lista: [
      'Ai o afacere funcțională sau iei decizii importante într-o companie',
      'Știi că unele lucruri ar putea funcționa mai bine, dar nu știi de unde să începi',
      'Ai o echipă, procese, informații sau decizii care se repetă',
      'Ai testat instrumente noi, dar nu le-ai legat încă de o nevoie clară de business',
      'N-ai explorat aproape deloc zona și vrei să înțelegi ce ar putea avea sens pentru tine',
      'Vrei să înțelegi problema înainte să cumperi soluția',
      'Ești dispus să lucrezi trei ore pe propria afacere, nu doar să asculți',
    ],
  },
  nu: {
    h2: 'Nu este pentru tine dacă',
    lista: [
      'Cauți o listă cu cele mai bune tool-uri sau prompturi',
      'Vrei o prezentare despre ce va face tehnologia peste cinci ani',
      'Te aștepți să construim o soluție completă în trei ore',
      'Vrei o rețetă universală pe care s-o copiezi în companie',
      'Vrei să ți se spună ce trebuie implementat fără să discutăm mai întâi despre business',
      'Vii doar să privești și nu vrei să lucrezi pe cazul tău',
      'Ai deja o strategie digitală matură și cauți arhitectură tehnică avansată',
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
