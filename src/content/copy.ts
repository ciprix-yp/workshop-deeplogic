/**
 * Tot copy-ul paginii, într-un singur loc.
 *
 * Sursa: docs/landing-workshop-16-09.md — copy final, aprobat.
 * Nicio componentă nu-și scrie textul inline. Motivul practic: „în aceeași zi" →
 * „în 24 de ore" apărea în trei secțiuni diferite; ținut aici, e o singură editare
 * și tests/copy-invariants.test.ts poate verifica automat regulile din
 * „CE NU APARE PE PAGINĂ — DELIBERAT".
 *
 * Modificări față de documentul sursă (vezi docs/DECIZII.md):
 *   D5 — „în aceeași zi" → „în 24 de ore" (§08 ITEM 2, §14, §15)
 *   D6 — adresa exactă intră pe pagină (§13)
 *   D7 — cheat-sheet tipărit adăugat ca ITEM 5 (§08)
 *   D8 — blocul despre faliment NU e inclus (§11)
 *   D9 — fără testimoniale (§12 rămâne neschimbat)
 *  B16 — microcopy §16: „60 de secunde" → „două minute", pentru că formularul
 *        are acum și cele cinci întrebări de calificare
 */

export const EVENIMENT = {
  slug: 'workshop-2026-09-16',
  titlu: 'Prima Mutare spre un Asistent Digital',
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
  capacitate: 25,
  cost: 'Gratuit',
} as const;

export const CTA = {
  text: 'Rezervă-ți locul',
  ancora: '#inscriere',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §01 — HERO
   Scop: îl oprește din scroll numind problema lui, nu soluția noastră.
   ═══════════════════════════════════════════════════════════════════════════ */

export const hero = {
  eyebrow: 'Prima Mutare spre un Asistent Digital',
  // Break forțat înainte de „Nimeni" — contrastul dintre cele două rânduri E mesajul.
  h1: ['Toată lumea îți spune să adopți AI.', 'Nimeni nu-ți spune de unde să începi.'],
  subheadline:
    'În trei ore nu implementezi AI. Decizi unde merită — și pleci cu prima ta ipoteză, scrisă.',
  pentruCine: 'Pentru antreprenori și decidenți din firme de 7–50 de oameni.',
  meta: `${EVENIMENT.dataText} · ${EVENIMENT.ora} · ${EVENIMENT.oras}`,
  microProof: [
    '25 de locuri. Fără laptop, fără cont, fără instalări — vii cu un pix.',
    'Demo live pe sisteme care rulează azi, nu slide-uri despre viitor.',
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §02 — PROBLEMA
   Cea mai importantă secțiune a paginii. Nu se taie la mobil, indiferent ce.
   Legislația apare AICI ca zgomot pe care îl aude el — niciodată ca promisiune.
   ═══════════════════════════════════════════════════════════════════════════ */

export const problema = {
  h2: 'AI-ul e peste tot. În firma ta, încă nu e nicăieri.',
  // Ghilimelele românești sunt „…” — deschidere jos (U+201E), închidere sus
  // (U+201D). Nu „…" cu ghilimea dreaptă: pe o pagină premium, amestecul se
  // vede. Verificat de tests/copy-invariants.test.ts.
  intro:
    'Vezi reclame despre AI în fiecare zi. Auzi despre „agenți” — și nu-ți e clar ce naiba sunt ăia. Ți se spune că dacă nu adopți AI, rămâi în urmă.',
  intreTimp: 'Între timp:',
  // Listă vizuală cu „—", nu bullet-uri rotunde. Păstrează ritmul de vorbire.
  vacarm: [
    'Angajații tăi se tem că vine să-i înlocuiască. Așa că îl evită.',
    'Legislatorul îți spune să ai grijă: AI Act, GDPR.',
    'Furnizorii de soluții nu-ți garantează confidențialitatea. Cei de sisteme nu-ți garantează securitatea.',
    'Iar tu, ca antreprenor, știi că vrei AI.',
  ],
  pivot: 'Bun. Am stabilit. Hai să începem.',
  pivotIntrebari: 'Exact… începem ce? De unde? Ce presupune? Ce riscuri am? Ce costuri? Ce ROI?',

  blocuri: [
    {
      h3: 'Problema ta nu e că nu vrei AI. E că n-ai o hartă.',
      corp: [
        'Nu știi unde are sens în firma ta și unde sunt bani aruncați. Nu știi ce presupune, ce riști, cât costă, ce iese la capăt.',
        'Și cât timp n-ai harta, nu iei nicio decizie. Mai citești un articol.',
      ],
    },
    {
      // Prinde cititorul care a decis deja că nu i se aplică. E felia cea mai
      // greu de convertit — nu se taie.
      h3: 'Sau poate n-ai vacarmul ăsta deloc.',
      corp: [
        'Poate ai deschis ChatGPT o dată, ți-a scos o prostie, și ai închis subiectul.',
        'Poate ai decis deja că AI-ul e pentru firme de software și agenții de marketing, nu pentru una ca a ta.',
        'Workshopul ăsta e și pentru tine. O să vezi exact unde s-a rupt treaba.',
      ],
    },
    {
      h3: 'Costul nu e că începi greșit. E că nu începi deloc.',
      corp: [
        'Trec lunile. Citești despre AI, te uiți la reclame, îți pui aceleași întrebări. În firmă nu se schimbă nimic.',
        'Trei ore de miercuri după-amiază, o dată, ca să iasă din buclă.',
      ],
    },
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §03 — REZULTATUL
   Blocul „Ce NU vei ști" e obligatoriu. E singura formă de credibilitate care
   funcționează la un om saturat de promisiuni. Fundal #E4E7E7, fără chenar roșu,
   fără iconiță de avertizare — e onestitate, nu alertă.
   ═══════════════════════════════════════════════════════════════════════════ */

export const rezultatul = {
  h2: 'La final vei ști să faci cinci lucruri pe care azi nu le poți face',
  lista: [
    {
      titlu: 'Distingi între ce poate face AI-ul azi și ce doar pare că poate.',
      corp: 'Pentru că îl vei prinde greșind. Cu mâna ta, nu pentru că ți-am spus eu.',
    },
    {
      titlu: 'Ceri altfel — și primești altceva.',
      corp: 'Există o structură. Când o folosești, se vede imediat în ce iese.',
    },
    {
      titlu: 'Spui ce e un agent AI și ce nu e.',
      corp: 'După ce vezi unul funcționând, nu după ce ți se explică pe slide.',
    },
    {
      titlu: 'Tragi linia dintre ce poate ieși din firmă și ce nu iese niciodată.',
      corp: 'Prețuri, date de client, contracte — unde stau și cum le ții acolo.',
    },
    {
      titlu: 'Numești primul proces din firma ta care merită atins. Și pe cel care nu.',
      corp: 'Scris, nu în cap.',
    },
  ],
  granita: {
    h3: 'Ce NU vei ști la final',
    corp: [
      'Dacă ipoteza ta e corectă.',
      'Asta cere acces la procesele și datele tale reale, la oamenii tăi, la cifrele tale. E o zi de lucru împreună, nu o după-amiază într-o sală cu 25 de oameni.',
      'Ți-o spun acum, nu la final.',
    ],
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §04 — PENTRU CINE ESTE
   Filtru real, nu politețe. Cu 25 de locuri, o pagină care convinge pe toată
   lumea e un eșec. Cele două liste rămân VIZUAL EGALE — dacă „nu e pentru tine"
   arată mai mic sau mai gri, filtrul devine decorativ.
   ═══════════════════════════════════════════════════════════════════════════ */

export const pentruCine = {
  da: {
    h2: 'E pentru tine dacă',
    lista: [
      'Ești antreprenor, patron sau decident într-o firmă de 7–50 de oameni',
      'Ai auzit de AI de o mie de ori și n-ai făcut încă nimic concret cu el',
      'Folosești deja ChatGPT, dar haotic: ceva ce deschizi când îți amintești, nu ceva care ține de un proces',
      'Ai încercat o dată, n-a mers, și ai lăsat-o baltă',
      'Ai o echipă și te întrebi cum reacționează dacă aduci AI în firmă',
    ],
  },
  nu: {
    h2: 'Nu e pentru tine dacă',
    lista: [
      'Cauți o soluție gata făcută, pe care s-o cumperi azi și să meargă mâine',
      'Vrei să afli ce va face AI-ul în 2030',
      'Nu ai în cap niciun proces al tău la care să te gândești — vii doar să te uiți',
      // Filtrează în SUS, nu doar în jos. Semnalează că există un nivel peste
      // ce se face azi în sală.
      'Ai deja agenți în producție și cauți arhitectură avansată',
    ],
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §05 — ÎNAINTE → DUPĂ
   Primul punct din pagină în care omul e „cald". CTA repetat imediat după.
   ═══════════════════════════════════════════════════════════════════════════ */

export const inainteDupa = {
  h2: 'Ce se schimbă efectiv',
  capIntai: 'Înainte',
  capAlDoilea: 'După',
  randuri: [
    ['Deschizi ChatGPT când îți amintești', 'Știi în ce situații merită deschis'],
    ['Ceri ceva vag, primești ceva vag, te enervezi', 'Știi de ce a ieșit prost data trecută'],
    ['Nu știi ce e sigur să pui acolo', 'Ai o linie clară: asta iese din firmă, asta nu'],
    ['„Agent AI” e un cuvânt din reclame', 'Ai văzut unul funcționând și știi ce face'],
    ['O senzație difuză că rămâi în urmă', 'Un proces numit, scris, cu prima mutare pe el'],
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §06 — CE FACEM EFECTIV
   Numerotarea 01/02/03 cu IBM Plex Mono, accent decorativ.
   Nota de format răspunde direct fricii „n-o să știu ce să întreb, o să par
   prost" — nu se îngroapă vizual.
   ═══════════════════════════════════════════════════════════════════════════ */

export const ceFacem = {
  h2: 'Trei blocuri, două ore, zero teorie fără demonstrație',
  blocuri: [
    {
      numar: '01',
      titlu: 'CONVERSAȚIA — ce poate și ce nu poate',
      corp: [
        'Cum ceri, ca să primești ce ai nevoie. Apoi îl prinzi greșind — cu mâna ta, pe telefonul tău.',
        'La final: ce deschid eu personal și când. ChatGPT, Claude, Gemini, Perplexity — care, pentru ce.',
      ],
    },
    {
      numar: '02',
      titlu: 'DELEGAREA — de la conversație la proces',
      corp: [
        'Demo live: îmi construiesc o ofertă You Protect în fața ta, de la zero.',
        'Și îți arăt unde stau datele: fișierele rămân pe calculatorul meu, prețurile nu călătoresc nicăieri.',
      ],
    },
    {
      numar: '03',
      titlu: 'AGENTUL — ce e și, mai ales, ce nu e',
      corp: [
        'Agentul meu de monitorizare a sănătății. Complet, cum rulează el azi.',
        'Inclusiv partea care contează: propune, eu aprob. Nu poate scrie singur în date.',
      ],
    },
  ],
  notaFormat: [
    'După fiecare bloc scrii — individual, pe foaia ta.',
    'Nu discuție de grup. Nu trebuie să vorbești în fața nimănui dacă nu vrei.',
  ],
  final: 'De la 16:00, o oră de discuții libere. Fără agendă, fără prezentare.',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §07 — NU DOAR TEORIE
   Linia 3 e deliberată: un demo live care poate pica, admis dinainte, e mai
   credibil decât o promisiune de perfecțiune.
   ═══════════════════════════════════════════════════════════════════════════ */

export const nuDoarTeorie = {
  h2: 'Ce face workshopul ăsta diferit',
  lista: [
    'Trei sisteme care rulează azi. Nu mockup-uri, nu înregistrări, nu capturi de ecran.',
    'Îmi expun propriile procese: ofertele mele și sănătatea mea. Nimeni din sală nu e subiect de demo.',
    'Construiesc în fața ta, live. Dacă se blochează ceva, vezi și asta — și vezi ce fac cu ea.',
    'Ieși cu un document, nu cu notițe.',
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §08 — CE PLECI CU TINE
   A doua cea mai importantă secțiune. Răspunsul direct la „am mai fost la unul
   și n-am plecat cu nimic". CTA repetat după. Nu se taie la mobil.
   ITEM 5 e nou — decizia D7.
   ═══════════════════════════════════════════════════════════════════════════ */

export const cePleciCuTine = {
  h2: 'Ce pleacă acasă cu tine',
  itemi: [
    {
      titlu: 'Harta ta, scrisă în sală',
      corp: [
        'În ultimele 15 minute completăm împreună. Nu de la zero — transcrii ce ai scris deja după fiecare bloc.',
        'Iese: procesele tale, ce e confidențial în ele, ce s-ar putea delega, și prima ta mutare.',
      ],
    },
    {
      // D5: „în aceeași zi" → „în 24 de ore". Angajament operațional, nu formulare.
      titlu: 'Un document personalizat, pe email, în 24 de ore',
      corp: [
        'Nu un PDF generic trimis la toată lumea. Al tău: harta ta, prima ta mutare, și prompturile configurate pentru ce faci tu efectiv.',
        'Ăsta e lucrul pe care îl deschizi joi dimineață.',
      ],
    },
    {
      titlu: 'Structura de prompt',
      corp: [
        'Formula pe care o folosesc eu. Patru părți. Funcționează în orice unealtă de chat, indiferent care.',
      ],
    },
    {
      titlu: 'Regula de confidențialitate',
      corp: [
        'O singură propoziție care îți spune ce urci și ce nu urci niciodată. Simplă cât s-o ții minte fără s-o cauți.',
      ],
    },
    {
      // D7 — nou pe pagină.
      titlu: 'Cheat-sheet-ul, tipărit',
      corp: [
        'O foaie. Prompturile care se repetă cel mai des, gata scrise.',
        'O pui lângă tastatură și n-o mai cauți în telefon.',
      ],
    },
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §09 — DE UNDE PORNESC DE OBICEI FIRMELE
   Prima linie de corp e OBLIGATORIE. Fără ea, secțiunea promite cinci domenii
   acoperite în trei ore — și pagina minte.
   „AI agents" NU apare aici ca use case; apare la §06 bloc 3, ca demonstrație.
   ═══════════════════════════════════════════════════════════════════════════ */

export const useCases = {
  h2: 'Unde caută oamenii, de obicei',
  disclaimer:
    'Nu acoperim toate zonele astea în trei ore. Le pun aici ca să ai de unde începe când îți cartografiezi propriul proces.',
  grid: [
    {
      titlu: 'Vânzări și ofertare',
      corp: 'Oferte, devize, propuneri. Răspunsuri la cereri repetitive.',
    },
    {
      titlu: 'Relația cu clienții',
      corp: 'Răspunsuri standard, follow-up, întrebări care se repetă de zece ori pe lună.',
    },
    {
      titlu: 'Operațional',
      corp: 'Rapoarte interne, sinteze, informația care trece de la un om la altul și se pierde pe drum.',
    },
    {
      titlu: 'Documente și date',
      corp: 'Ce e îngropat în PDF-uri, contracte și tabele pe care nu le mai deschide nimeni.',
    },
    {
      titlu: 'Monitorizare continuă',
      corp: 'Lucruri care ar trebui urmărite permanent și pe care le observi doar când e prea târziu.',
    },
  ],
  incheiere: [
    'Demonstrația live e pe ofertare, pentru că e procesul pe care îl am eu și pot să-l expun fără să expun pe altcineva.',
    'Mecanismul e același indiferent de zonă.',
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §10 — DESPRE DEEP LOGIC
   Zero cifre. Fără „X clienți", fără „Y proiecte". Când vor exista date
   documentate, se adaugă.
   ═══════════════════════════════════════════════════════════════════════════ */

export const despreDeepLogic = {
  h2: 'Deep Logic',
  corp: [
    'Consultanță AI pentru firme românești de 7–50 de oameni.',
    'Poziția noastră: infrastructură, nu automatizări.',
    'Diferența e cine deține ce se construiește. Arhitectura rămâne a clientului, nu a furnizorului. Iar sistemele se construiesc pe realitatea fiscală de aici — e-Factura, ANAF — nu pe un model importat care merge în altă parte.',
    'Ordinea în care lucrăm: întâi strategia, apoi procesul, apoi tehnologia.',
    'Nu punem AI peste orice. Căutăm unde produce efect economic real — și spunem când nu produce.',
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §11 — DESPRE CIPRIAN MICU
   D8: blocul despre firma de transport și faliment NU e inclus. Decizie luată.
   ═══════════════════════════════════════════════════════════════════════════ */

export const facilitator = {
  h2: 'Cine ține workshopul',
  nume: 'Ciprian Micu',
  rol: 'Fondator Deep Logic',
  corp: [
    'Lucrez cu AI din decembrie 2022. Am sisteme în producție din 2023 — inclusiv cele pe care ți le arăt pe 16 septembrie. Sunt practician, nu lector: tot ce demonstrez e ceva ce folosesc eu.',
    'În paralel, sunt Business Developer la You Protect, unde vând echipamente de protecție în B2B. De acolo vine demonstrația de ofertare — e procesul meu, pot să-l deschid fără să expun pe nimeni altcineva.',
    'Fac parte din echipa de leadership BIZZ.CLUB Satu Mare.',
  ],
  foto: {
    src: '/ciprian-micu.jpg',
    alt: 'Ciprian Micu, fondator Deep Logic',
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §12 — PRECEDENT
   D9: fără testimoniale. Ultima propoziție PARE că slăbește pagina — nu o
   slăbește. La un cititor saturat de promisiuni, e cel mai puternic semnal de
   onestitate de pe toată pagina. Nu se taie.
   ═══════════════════════════════════════════════════════════════════════════ */

export const precedent = {
  h2: 'Nu e prima dată',
  corp: [
    'Am ținut o versiune a acestui workshop în iulie, la Ardudana.',
    'Versiunea din septembrie e construită pe ce am învățat acolo: mai puțină prezentare, mai multe demonstrații pe sisteme reale, și un material personalizat după eveniment — care atunci nu exista.',
    'Nu pun testimoniale pentru că n-am colectat pe formatul ăsta. Când voi avea, le voi pune.',
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §13 — FORMAT ȘI DETALII
   D6: adresa exactă intră pe pagină. Alimentează și .ics și JSON-LD.
   ═══════════════════════════════════════════════════════════════════════════ */

export const detalii = {
  h2: 'Detalii practice',
  randuri: [
    ['Data', EVENIMENT.dataText],
    ['Ora', `${EVENIMENT.ora}`],
    ['Structura', 'Două ore de workshop, o oră de discuții libere'],
    ['Locația', `${EVENIMENT.locatie}, ${EVENIMENT.adresa}`],
    ['Participanți', `Maximum ${EVENIMENT.capacitate}`],
    ['Ce aduci', 'Un pix. Atât.'],
    ['Laptop', 'Nu e nevoie. Dacă vrei să lucrezi în paralel, adu-l — dar nu e obligatoriu.'],
    ['Nivel necesar', 'Zero. Dacă n-ai deschis niciodată ChatGPT, e în regulă.'],
    ['Cost', EVENIMENT.cost],
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §14 — CE INCLUDE ȘI DE CE E GRATUIT
   Fără preț, fără „valoare 2000 lei", fără „normal ar costa X". Workshopul
   public și cel in-company nu sunt același produs — o ancoră de preț ar
   revendica o echivalență falsă.
   „Nu vinde nimeni nimic de la microfon" e un angajament public.
   ═══════════════════════════════════════════════════════════════════════════ */

export const deCeGratuit = {
  h2: 'De ce e gratuit',
  corp: [
    'Pentru că am nevoie de repetiții și de feedback real.',
    'E prima dată când țin workshopul ăsta în forma asta. Vreau să văd pe ce se blochează firmele din Satu Mare când pun mâna pe instrumentele astea — nu ce cred eu că le trebuie.',
    'Deci da, am un interes. Interesul meu e să învăț din sala asta și, dacă mai încolo cineva vrea să lucrăm împreună pe procesele lui, cu atât mai bine. Nu vinde nimeni nimic de la microfon pe 16 septembrie.',
  ],
  include: {
    h3: 'Ce include',
    lista: [
      'Două ore de workshop cu demonstrații live pe sisteme reale',
      'O oră de discuții libere, după',
      'Harta ta, completată în sală',
      // D5
      'Documentul tău personalizat, pe email, în 24 de ore',
      // D7
      'Cheat-sheet-ul tipărit cu prompturi',
    ],
  },
  deCe25: {
    h3: 'De ce doar 25 de locuri',
    corp: 'Pentru că peste atât nu mai pot lucra cu fiecare din sală, iar workshopul devine prezentare. Nu e o cifră aleasă ca să sune bine.',
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §15 — ÎNTREBĂRI
   Întrebarea despre vânzare e cea mai importantă din FAQ. Nu se mută mai jos
   și nu se înmoaie.
   ═══════════════════════════════════════════════════════════════════════════ */

export const faq = {
  h2: 'Întrebări',
  intrebari: [
    {
      q: 'Trebuie să am experiență cu AI?',
      a: 'Nu. Dacă n-ai deschis niciodată ChatGPT, e în regulă — începem de la conversație. Dacă îl folosești zilnic, blocurile 2 și 3 sunt oricum peste ce faci acum.',
    },
    {
      q: 'Trebuie laptop?',
      a: 'Nu. Demonstrațiile rulează pe ecranul meu. Ai nevoie doar de telefon, pentru un singur exercițiu. Dacă vrei să lucrezi în paralel pe laptopul tău, adu-l — dar nu-ți trebuie.',
    },
    {
      q: 'E potrivit pentru domeniul meu?',
      a: 'Demonstrația live e pe ofertare, dar mecanismul nu ține de industrie. În sală vin oameni din producție, servicii, comerț, construcții. Ce cartografiezi tu e propriul proces, nu al meu.',
    },
    {
      q: 'Pot să vin cu o problemă reală din firmă?',
      a: 'Da — și ăsta e scopul. Nu trebuie s-o spui cu voce tare în fața nimănui. Lucrezi pe ea individual, pe foaia ta.',
    },
    {
      q: 'O să-mi vindeți ceva la final?',
      a: 'Nu de la microfon. Pe formularul de la final există o singură bifă, prin care poți cere o discuție dacă vrei. Dacă n-o bifezi, nu te caută nimeni.',
    },
    {
      q: 'Ce primesc după workshop?',
      // D5
      a: 'Un document personalizat pe email, în 24 de ore: harta ta, prima ta mutare și prompturile configurate pentru ce faci tu.',
    },
    {
      q: 'Ce se întâmplă dacă mă înscriu și nu pot ajunge?',
      a: 'Anunță-mă și eliberez locul pentru altcineva. Sunt 25 și, la mine, chiar sunt 25.',
    },
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §16 — CTA FINAL
   Repetă rezultatul, nu argumentul.
   B16: microcopy-ul spunea „60 de secunde". Cu cele cinci întrebări de
   calificare adăugate, nu mai e adevărat. Pe pagina asta, un copy care minte
   e un bug — deci se schimbă, nu se ignoră.
   ═══════════════════════════════════════════════════════════════════════════ */

export const ctaFinal = {
  h2: 'Trei ore, miercuri după-amiază',
  corp: 'Nu ca să implementezi AI. Ca să știi unde merită și unde nu merită, în firma ta — și să pleci cu prima ta mutare, scrisă.',
  meta: `${EVENIMENT.dataScurt} · ${EVENIMENT.ora} · ${EVENIMENT.oras} · ${EVENIMENT.capacitate} de locuri`,
  microcopy:
    'Îți ia două minute. Întreb și ce proces îți mănâncă cel mai mult timp — ca să pot pregăti materialul pentru sala care vine efectiv, nu pentru una imaginară.',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §17 — FOOTER
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
   Al doilea ecran (waitlist) e nou: documentul sursă avea un singur mesaj de
   confirmare, deci al 31-lea om ar fi văzut „Gata, îți trimit confirmarea"
   fiind de fapt pe listă de așteptare.
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
      'Cele 25 de locuri sunt luate. Ți-am trimis un email cu poziția ta.',
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

  eroare: {
    titlu: 'N-a mers.',
    corp: [
      'Ceva s-a rupt la mine, nu la tine. Datele tale n-au fost salvate.',
      'Încearcă din nou peste un minut. Dacă tot nu merge, scrie-mi direct la contact@deeplogic.ro și te înscriu manual.',
    ],
  },

  // Reconfirmare din email 2 sau 3 (status `inscris` → `reconfirmat`)
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

  // Cursa din waitlist, câștigată
  locRevendicat: {
    titlu: 'Locul e al tău.',
    corp: [
      'Ai fost primul care a confirmat. Te-am mutat de pe lista de așteptare pe listă.',
      `${EVENIMENT.locatie}, ${EVENIMENT.adresa} — ${EVENIMENT.dataText}, ${EVENIMENT.ora}.`,
      'Adaugă-l în calendar cu butonul de mai jos, ca să nu-l pierzi.',
    ],
  },

  // Cursa din waitlist, pierdută
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
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   META — SEO și carduri de partajare
   Peste 40% din trafic vine dintr-un link lipit în WhatsApp de un membru
   BIZZ.CLUB. Cardul de preview e primul lucru pe care îl vede invitatul — și
   e momentul în care membrul își pune reputația la bătaie („ți-o dau ție").
   Un link fără card arată a spam.
   ═══════════════════════════════════════════════════════════════════════════ */

export const meta = {
  titlu: 'Prima Mutare spre un Asistent Digital — workshop gratuit, Satu Mare',
  descriere:
    'Trei ore, miercuri 16 septembrie. Nu implementezi AI — decizi unde merită în firma ta și pleci cu prima ta mutare, scrisă. 25 de locuri.',
  // Titlu separat pentru card: mai scurt, pentru că WhatsApp taie pe la ~65 de caractere.
  ogTitlu: 'Prima Mutare spre un Asistent Digital',
  /**
   * Cardul se randează DIRECT SUB mesajul personal al membrului BIZZ.CLUB
   * („Am o invitație... ți-o dau ție"). Vizual, e parte din același mesaj.
   * De aceea nu începe cu „gratuit": ar muta încadrarea de la privilegiu
   * personal la eveniment gratuit oarecare — exact mecanismul de încredere
   * pe care se sprijină toată distribuția. Aceeași regulă ca la textul de
   * distribuire din documentul sursă.
   */
  ogDescriere:
    '16 septembrie · Satu Mare · trei ore. Pleci cu o hartă scrisă, nu cu notițe. 25 de locuri.',
  ogImagine: '/og-workshop-16-09.png',
  locale: 'ro_RO',
} as const;
