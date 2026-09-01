/**
 * Tot copy-ul paginii, într-un singur loc.
 *
 * Sursa: docs/landing-workshop-16-09.md — copy final, aprobat.
 * Nicio componentă nu-și scrie textul inline. Motivul practic: „în aceeași zi" →
 * „în 24 de ore" apărea în trei secțiuni diferite; ținut aici, e o singură editare
 * și tests/copy-invariants.test.ts poate verifica automat regulile din
 * „CE NU APARE PE PAGINĂ — DELIBERAT".
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * PIVOT DE PRODUS (2026-08-31): „Prima Mutare spre un Asistent Digital" →
 * „PRIMUL PAS". Rescriere completă, pe baza landing-page-ului V2 primit de la
 * Ciprian (PDF). Decizii explicite ale acestei rescrieri:
 *
 *   — Capacitate: 25 → 30. Contorul live de locuri (interzis explicit înainte,
 *     vezi istoricul CLAUDE.md) devine sursa de onestitate; cifra STATĂ pe
 *     pagină (30) e acum și cifra HARD aplicată în bază — vezi
 *     supabase/migrations/0007_capacitate_unificata.sql. Nu mai există buffer
 *     ascuns 25↔30.
 *   — Countdown + contor de locuri: reversare deliberată a interdicției vechi,
 *     confirmată explicit de Ciprian. Regula PDF-ului rămâne literă de lege:
 *     „fără deficit fals; afișează doar date reale" — vezi BaraScarcity.astro.
 *   — §06 CeFacem și §10 DespreDeepLogic au fost despărțite dintr-o singură
 *     secțiune a sursei (§08 METODOLOGIA DEEP LOGIC): S06 ia cei 5 pași
 *     numerotați, S10 ia prefața „de ce lucrăm invers". Nu e o eroare de
 *     copiere — e o alegere structurală ca să încapă în arhitectura existentă
 *     de componente (S06 randează blocuri numerotate, S10 doar proză).
 *   — §07 NuDoarTeorie și §12 Precedent nu mai aveau conținut sursă (vechea
 *     poveste „demo You Protect" / „Ardudana" e explicit INTERZISĂ de noua
 *     listă „ce nu apare deliberat"). Realocate: §07 ← §10 din sursă („Dar eu
 *     nici măcar nu știu ce aș putea face cu AI"), §12 ← §06 din sursă
 *     („Formatul", aplatizat din listă cu buline în proză, ca să încapă în
 *     forma existentă a componentei).
 *   — Peste 20 de propoziții erau tăiate la marginea paginii în PDF-ul sursă
 *     (defect de randare a blocurilor de cod, nu al citirii). Completate de
 *     Claude, ancorate în vocabularul restului documentului — fiecare
 *     marcată `[completare]` mai jos. Ciprian le revizuiește înainte de
 *     publicare.
 *   — Titluri adăugate acolo unde PDF-ul avea proză fără propriul H3, ca să
 *     încapă în componente care cer un titlu per bloc — marcate
 *     `[titlu adăugat]`.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Modificări față de documentul sursă „Prima Mutare" (vezi docs/DECIZII.md;
 * rămân valabile ca precedent metodologic, chiar dacă produsul s-a schimbat):
 *   D5 — „în aceeași zi" → „în 24 de ore" — nu se mai aplică: PRIMUL PAS
 *        promite un roadmap „pe email", fără angajament de timp explicit.
 *   D6 — adresa exactă intră pe pagină (§13 → acum §14 „Detalii practice")
 *   D9 — fără testimoniale (rămâne valabil — nicio secțiune din PRIMUL PAS
 *        nu introduce testimoniale)
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
  capacitate: 30,
  cost: 'Gratuit',
} as const;

export const CTA = {
  text: 'Rezervă-ți locul',
  ancora: '#inscriere',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   SCARCITY — bara fixă (BaraScarcity.astro) și insigna de pe fiecare CTA.
   Regula PDF-ului: „fără deficit fals; afișează doar date reale". Fără JS,
   bara arată fallback-ul static de mai jos — niciodată un număr inventat.
   ═══════════════════════════════════════════════════════════════════════════ */

export const scarcity = {
  fallbackStatic: `Maximum ${EVENIMENT.capacitate} de locuri · ${EVENIMENT.dataText}, ${EVENIMENT.oraStart}`,
  etichetaLocuri: 'locuri disponibile din',
  etichetaCountdown: 'până la începere',
  plin: 'Locurile s-au ocupat — te trec pe lista de așteptare.',
  // [fix — audit impeccable, 2026-09-01] Era hardcodat direct în scriptul din
  // BaraScarcity.astro, încălcând regula „tot copy-ul trăiește în copy.ts".
  aInceput: 'a început',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §01 — HERO
   Scop: îl oprește din scroll numind problema lui, nu soluția noastră.
   ═══════════════════════════════════════════════════════════════════════════ */

export const hero = {
  eyebrow: 'PRIMUL PAS · Workshop by Deep Logic',
  // Break forțat înainte de „Dar" — contrastul dintre cele două rânduri E mesajul.
  h1: ['Toată lumea îți spune să folosești AI.', 'Dar în compania ta, de unde începi?'],
  // [completare] — „...ca să formulezi nevoia pe care vrei s-o rezolvi, să-i e"
  // Completat aliniat cu promisiunea explicită din regulile globale ale
  // documentului sursă: „își clarifică nevoia... începe să-i estimeze
  // impactul... pleacă cu un roadmap de validare".
  subheadline:
    'În 3 ore lucrezi pe propria companie ca să formulezi nevoia pe care vrei s-o rezolvi, să-i estimezi impactul și să pleci cu un prim pas concret.',
  pentruCine: 'Pentru antreprenori, owneri și decidenți din companii de orice mărime.',
  meta: `${EVENIMENT.dataText} · ${EVENIMENT.ora} · ${EVENIMENT.oras}`,
  // Înlocuiește vechiul „demo live pe sisteme care rulează azi" — interzis
  // acum explicit („Nu menționăm demo-urile-surpriză din sală").
  microProof: [
    'Nu este încă un curs despre AI.',
    'Nu trebuie să fii IT-ist.',
    'Și nu trebuie să știi deja ce ai putea face cu AI.',
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §02 — PROBLEMA
   Cea mai importantă secțiune a paginii. Nu se taie la mobil, indiferent ce.
   ═══════════════════════════════════════════════════════════════════════════ */

export const problema = {
  h2: 'AI-ul e peste tot. În compania ta, întrebarea încă rămâne.',
  intro:
    'ChatGPT. Copiloți. Agenți. Automatizări. Demo-uri care par să facă totul în câteva secunde.',
  intreTimp: 'În același timp apar alte întrebări:',
  // 5 întrebări reale, nu 4 — vacarmul de business, nu frica angajaților.
  vacarm: [
    'Ce date pot folosi și ce date nu?',
    'Ce va spune echipa?',
    'Cât costă cu adevărat?',
    'Ce merită construit și ce este doar o jucărie interesantă?',
    'Cum îmi dau seama dacă există un ROI înainte să investesc?',
  ],
  pivot: 'Și, după tot zgomotul, rămâne o întrebare mult mai simplă:',
  pivotIntrebari: '„Bun. Eu de unde încep?”',

  blocuri: [
    {
      // [titlu adăugat] — PDF-ul nu dă un H3 propriu pentru cele trei
      // propoziții de mai jos (vin direct sub „Bun. Eu de unde încep?").
      h3: 'Trei puncte de plecare, la fel de normale.',
      corp: [
        'Poate ai încercat deja câteva instrumente și ai rămas cu o utilizare ocazională.',
        // [completare] — „...nu le-ai putut traduce în realitatea companiei tal"
        'Poate ai văzut lucruri impresionante, dar nu le-ai putut traduce în realitatea companiei tale.',
        // [completare] — „...nu știi ce ai putea face concret cu"
        'Sau poate n-ai început deloc pentru că nu ești IT-ist și nu știi ce ai putea face concret cu ce ai la îndemână.',
        'Toate trei sunt puncte de plecare normale.',
      ],
    },
    {
      // [titlu adăugat] — parafrazează prima propoziție a paragrafului PDF.
      h3: 'Problema nu e că n-ai adoptat AI.',
      corp: [
        // [completare] — „...poți pierde luni testând unelte, cumpăr"
        'Problema este că, fără o întrebare bună de business, poți pierde luni testând unelte, cumpărând licențe și citind materiale care nu duc nicăieri.',
      ],
    },
    {
      h3: 'PRIMUL PAS începe înainte de tool.',
      corp: ['Începe cu ce vrei să schimbi în compania ta.'],
    },
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §03 — REZULTATUL
   Combină §04 „Cu ce pleci" (5 livrabile) și §05 „Ce NU vei ști" din sursă —
   aceeași formă (listă de 5 + bloc de graniță onestă) pe care o avea deja
   componenta S03Rezultatul, deci fără nicio schimbare de arhitectură.
   ═══════════════════════════════════════════════════════════════════════════ */

export const rezultatul = {
  h2: 'Nu pleci cu o listă de tool-uri. Pleci cu o direcție.',
  lista: [
    {
      titlu: 'O nevoie clar formulată',
      corp: 'Nu „vreau să folosesc AI”. Ci: „Asta este problema sau oportunitatea pe care vreau s-o explorez în compania mea.”',
    },
    {
      titlu: 'O primă estimare a impactului',
      corp: 'Cât de des apare problema, câți oameni implică, cât timp consumă. Nu inventăm ROI — vedem dacă merită investigată.',
    },
    {
      titlu: 'O ipoteză despre ce ai putea delega',
      // [completare] — „...și ce trebuie să rămână"
      corp: '„Ce parte din acest proces ar putea fi delegată unui coleg digital — și ce trebuie să rămână sub controlul tău?”',
    },
    {
      titlu: 'Oamenii pe care trebuie să-i implici',
      // [completare] — „...sau trăiesc"
      corp: 'Cei care execută procesul, îl coordonează, primesc rezultatul sau trăiesc consecințele lui — nu doar perspectiva ta.',
    },
    {
      titlu: 'Roadmap-ul tău personalizat',
      corp: 'Nevoia identificată, impactul preliminar, ce mai trebuie validat, oamenii de implicat și recomandarea Deep Logic privind continuarea — pe email.',
    },
  ],
  granita: {
    h3: 'Ce NU vei ști la final',
    corp: [
      'Dacă ipoteza ta este corectă.',
      // [completare] — „...doar din perspecti" / „...să vedem cum fu"
      'Și ar fi incorect să pretind că putem afla asta într-o sală, în trei ore, doar din perspectiva ta.',
      'Pentru un verdict real trebuie să vorbim cu oamenii care lucrează în proces, să vedem cum funcționează lucrurile de fapt, nu doar cum par de la nivelul tău.',
      'PRIMUL PAS îți spune ce merită investigat. Nu pretinde că îți dă răspunsul înainte de investigație.',
    ],
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §04 — PENTRU CINE ESTE
   Filtru real, nu politețe. Cele două liste rămân VIZUAL EGALE.
   ═══════════════════════════════════════════════════════════════════════════ */

export const pentruCine = {
  da: {
    h2: 'Este pentru tine dacă',
    lista: [
      // [completare] — „...felul în care func"
      'Ești antreprenor, owner, CEO, manager sau iei decizii care influențează felul în care funcționează compania ta',
      // [completare] — „...nu știi încă unde tehnolog"
      'Ai senzația că anumite lucruri ar putea funcționa mai bine, dar nu știi încă unde tehnologia ar avea sens',
      'Folosești deja AI ocazional, dar nu l-ai legat de un proces real de business',
      'N-ai folosit aproape deloc AI și nu știi de unde să începi',
      'Vrei să înțelegi problema înainte să cumperi soluția',
      'Ești dispus să lucrezi trei ore pe realitatea propriei companii',
    ],
  },
  nu: {
    h2: 'Nu este pentru tine dacă',
    lista: [
      'Cauți o listă cu cele mai bune prompturi',
      'Vrei o prezentare cu zeci de tool-uri',
      'Te aștepți să construim un agent sau o automatizare completă în trei ore',
      'Cauți o rețetă universală pe care s-o copiezi în companie',
      'Vrei ca cineva să-ți spună ce trebuie automatizat fără să înțeleagă mai întâi businessul',
      'Ai deja o strategie AI matură și cauți arhitectură tehnică avansată',
    ],
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §05 — ÎNAINTE → DUPĂ
   Primul punct din pagină în care omul e „cald". CTA repetat imediat după.
   ═══════════════════════════════════════════════════════════════════════════ */

export const inainteDupa = {
  h2: 'De la o senzație difuză la un punct de plecare concret',
  capIntai: 'Înainte',
  capAlDoilea: 'După PRIMUL PAS',
  randuri: [
    ['„Ar trebui să fac ceva cu AI.”', '„Asta este nevoia pe care vreau s-o explorez.”'],
    ['Nu știi de unde să începi.', 'Ai un punct de plecare clar.'],
    ['Problema este mai mult o senzație.', 'Ai început să-i estimezi impactul în business.'],
    ['Te gândești direct la soluție.', 'Știi ce mai trebuie validat înainte de soluție.'],
    ['Nu știi cine trebuie implicat.', 'Ai oamenii-cheie identificați.'],
    ['Ai o idee în cap.', 'Ai un roadmap digital pe care îl poți deschide și continua.'],
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §06 — CEI CINCI PAȘI AI METODOLOGIEI
   Jumătatea „concretă" a §08 din sursă (METODOLOGIA DEEP LOGIC) — cealaltă
   jumătate (prefața „de ce lucrăm invers") e la §10 DespreDeepLogic, mai
   jos. Numerotare 01–05 cu IBM Plex Mono, ca înainte cu 01/02/03.
   ═══════════════════════════════════════════════════════════════════════════ */

export const ceFacem = {
  // [titlu adăugat] — H2 autonom pentru cei 5 pași; „această logică" din
  // sursă ([]§08]) trimitea la STATEMENT-ul care, în arhitectura paginii,
  // ajunge abia la §10, mai jos.
  h2: 'Cei cinci pași ai metodologiei Deep Logic',
  blocuri: [
    {
      numar: '01',
      titlu: 'PRIMUL PAS',
      // [completare] — „...construim ipotez"
      corp: [
        'Clarificăm nevoia pe care tu, ca owner sau decident, vrei să o explorezi și construim ipoteze inițiale de lucru.',
      ],
    },
    {
      numar: '02',
      titlu: 'REALITATEA ECHIPEI',
      // [completare] — „...ce se întâmplă în"
      corp: [
        'Descoperim nevoile oamenilor care lucrează efectiv în procese și înțelegem ce se întâmplă în realitate, nu doar pe hârtie.',
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
   §07 — „DAR EU NU ȘTIU CE AȘ PUTEA FACE CU AI"
   Realocat din §10 al sursei — vechiul §07 („trei sisteme care rulează azi")
   descria exact ce e acum interzis (demo You Protect, agent de sănătate).
   Componenta S07NuDoarTeorie a primit `intro`/`outro` opționale, ca să
   încapă H3-ul „Perfect." și linia de închidere fără să piardă conținut.
   ═══════════════════════════════════════════════════════════════════════════ */

export const nuDoarTeorie = {
  h2: '„Dar eu nici măcar nu știu ce aș putea face cu AI.”',
  intro: [
    'Perfect.',
    'Nu trebuie să vii cu răspunsul. Pentru asta există PRIMUL PAS.',
    'Nu trebuie să fii IT-ist. Nu trebuie să cunoști automatizări. Nu trebuie să știi ce este un agent sau un API.',
    'Ai nevoie doar să-ți cunoști compania suficient cât să poți spune:',
  ],
  lista: [
    'Aici simt că pierdem timp.',
    'Aici depindem prea mult de un om.',
    'Aici nu avem vizibilitate.',
    'Aici aș vrea să funcționăm mai bine.',
  ],
  outro: 'De acolo începem.',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §08 — CU CE PLECI
   ATENȚIE: numele exportului rămâne `cePleciCuTine` din motive de compatibi-
   litate cu S08CePleciCuTine.astro, dar conținutul e acum lista „poate
   problema ta arată așa" din sursă (§07) — a doua cea mai importantă
   secțiune păstrează forma de 5 „livrabile", doar că sursa PRIMUL PAS n-are
   un echivalent de „5 lucruri fizice primite" separat de §04 (deja folosit
   la §03 Rezultatul mai sus). Aici folosim de fapt grila de 6 categorii din
   §07 al sursei, restrânsă la 5. A șasea categorie („Vânzare și dezvoltare")
   a fost combinată cu prima („Vânzări și ofertare"), fiindcă cele două se
   suprapun tematic.
   ═══════════════════════════════════════════════════════════════════════════ */

export const cePleciCuTine = {
  h2: 'De unde pornesc, de obicei, întrebările bune',
  itemi: [
    {
      titlu: 'Vânzări, ofertare și dezvoltare',
      corp: [
        'Ofertele sau devizele se fac greu, manual, sau depind prea mult de o singură persoană.',
        'Există oportunități, dar oamenii potriviți sunt greu de identificat, prioritizat sau urmărit în timp.',
      ],
    },
    {
      titlu: 'Clienți',
      corp: ['Echipa răspunde din nou și din nou la aceleași întrebări sau follow-up-ul se pierde.'],
    },
    {
      titlu: 'Documente și rapoarte',
      corp: ['Oamenii mută informații între PDF-uri, emailuri, tabele și sisteme care nu vorbesc între ele.'],
    },
    {
      titlu: 'Operațional',
      corp: ['Informația există, dar ajunge greu la omul care trebuie să ia o decizie.'],
    },
    {
      titlu: 'Onboarding, procese și proceduri',
      // [completare] — „...decât î"
      corp: ['O parte importantă din „cum facem lucrurile aici” există mai mult în capul oamenilor decât în vreun document.'],
    },
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §09 — DE UNDE PORNESC OAMENII (grid, 5→6 categorii ale sursei §07,
   nefolosite deja mai sus). Notă: sursa are un singur grid de „unde pornesc
   întrebările bune" (§07); l-am despărțit deliberat între §08 (mai sus,
   forma scurtă din 5) și aici (aceeași listă, cu intro/outro complete,
   fiindcă S09UseCases are deja componenta pentru un grid + disclaimer +
   încheiere, iar S08 n-ar fi avut loc pentru cele două paragrafe de cadru).
   ═══════════════════════════════════════════════════════════════════════════ */

export const useCases = {
  h2: 'Poate problema ta arată așa',
  disclaimer:
    'Nu înseamnă că vom acoperi toate zonele de mai jos. Sunt doar exemple care te pot ajuta să recunoști o problemă reală din compania ta.',
  grid: [
    {
      titlu: 'Vânzări și ofertare',
      corp: 'Ofertele sau devizele se fac greu, manual sau depind prea mult de o singură persoană.',
    },
    {
      titlu: 'Clienți',
      corp: 'Echipa răspunde din nou și din nou la aceleași întrebări sau follow-up-ul se pierde.',
    },
    {
      titlu: 'Documente și rapoarte',
      corp: 'Oamenii mută informații între PDF-uri, emailuri, tabele și sisteme care nu vorbesc între ele.',
    },
    {
      titlu: 'Operațional',
      corp: 'Informația există, dar ajunge greu la omul care trebuie să ia o decizie.',
    },
    {
      titlu: 'Onboarding, procese și proceduri',
      corp: 'O parte importantă din „cum facem lucrurile aici” există mai mult în capul oamenilor decât în vreun document.',
    },
    {
      titlu: 'Vânzare și dezvoltare',
      corp: 'Știi că există oportunități, dar oamenii potriviți sunt greu de identificat, prioritizat sau urmărit în timp.',
    },
  ],
  incheiere: [
    'Poate problema ta nu seamănă cu nimic de aici. Și asta este în regulă.',
    'Nu trebuie să vii cu problema perfect formulată. Pentru asta lucrăm.',
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §10 — DESPRE DEEP LOGIC
   Prefața lui §08 din sursă („de ce lucrăm invers") — cealaltă jumătate,
   cei 5 pași, e la §06 mai sus. Fără cifre — poziția se afirmă, nu se
   cuantifică.
   ═══════════════════════════════════════════════════════════════════════════ */

export const despreDeepLogic = {
  h2: 'Înainte de soluție, trebuie să înțelegem problema.',
  corp: [
    'Când apare o tehnologie nouă, tentația este să începem cu unealta. Să vedem ce poate face și apoi să căutăm unde să o folosim. La Deep Logic facem invers.',
    'Business → problemă → oameni → proces → impact → tehnologie.',
    'Începem cu perspectiva ownerului. Apoi o verificăm în realitatea echipei. Ne uităm la procese și proceduri. La date. La efort. La risc. La impact și ROI.',
    'Și abia după aceea decidem dacă tehnologia are sens.',
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §11 — DESPRE CIPRIAN MICU
   Bio nouă, din sursă. Blocul despre firma de transport și faliment nu
   există în noua sursă (nu a fost reintrodus).
   ═══════════════════════════════════════════════════════════════════════════ */

export const facilitator = {
  h2: 'De ce eu?',
  nume: 'Ciprian Micu',
  rol: 'Fondator Deep Logic',
  corp: [
    'La patru ani am legat mobilierul din camera părinților mei cu elastic. În mintea mea, făceam obiectele să comunice.',
    'Mult mai târziu, în decembrie 2022, am început să explorez serios AI. Nu pentru că voiam să devin „expert în AI” — eram antreprenor și căutam soluții pentru probleme reale din propriul business.',
    // [completare] — „...la a-mi construi"
    'În anii care au urmat am trecut de la a folosi instrumente făcute de alții la a-mi construi propriile sisteme. Asta mi-a schimbat perspectiva.',
    'După piatră, am descoperit ciocanul. Cu un ciocan poți construi multe lucruri. Dar ciocanul nu îți spune ce trebuie construit.',
    'Și exact asta mi se pare astăzi întrebarea importantă în AI. Nu „ce poate tehnologia?”. Ci „ce merită să rezolvăm cu ea?”. Din întrebarea asta s-a construit și metodologia Deep Logic.',
  ],
  foto: {
    src: '/ciprian-micu.jpg',
    alt: 'Ciprian Micu, fondator Deep Logic',
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §12 — FORMATUL
   Realocat din §06 al sursei — vechea secțiune „Precedent"/Ardudana nu mai
   are conținut sursă (produsul PRIMUL PAS nu e prezentat ca o continuare a
   workshopului precedent). Grila cu buline din sursă a fost aplatizată în
   proză, ca să încapă în forma existentă a componentei (h2 + paragrafe).
   ═══════════════════════════════════════════════════════════════════════════ */

export const precedent = {
  h2: '20% context. 80% lucru pe compania ta.',
  corp: [
    'Nu vreau să petrecem trei ore vorbind despre tehnologie. Contextul e acolo doar cât să punem întrebările corecte.',
    'Restul timpului lucrezi pe propria companie: ce vrei să schimbi, unde se consumă timp sau atenție, cine e implicat, ce valoare ar avea dacă problema s-ar rezolva, ce ai putea delega și ce trebuie verificat înainte să construiești ceva.',
    'Nu pe un business imaginar. Pe al tău.',
    'Nu trebuie să fii IT-ist. Rolul tău nu este să știi ce model, API sau arhitectură trebuie folosită. Rolul tău este să înțelegi ce merită rezolvat și de ce. Tehnologia vine după.',
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §13 — DETALII PRACTICE
   ═══════════════════════════════════════════════════════════════════════════ */

export const detalii = {
  h2: 'Detalii practice',
  randuri: [
    ['Data', EVENIMENT.dataText],
    ['Ora', `${EVENIMENT.ora}`],
    ['Durata', '3 ore de lucru'],
    ['Locația', `${EVENIMENT.locatie}, ${EVENIMENT.adresa}`],
    ['Participanți', `Maximum ${EVENIMENT.capacitate}`],
    ['Format', '20% context · 80% lucru aplicat'],
    ['Nivel necesar', 'Zero cunoștințe tehnice'],
    ['Laptop', 'Nu este obligatoriu'],
    ['Cost', EVENIMENT.cost],
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §14 — DE CE ESTE GRATUIT
   Fără preț, fără „valoare X lei", fără ancoră de preț.
   ═══════════════════════════════════════════════════════════════════════════ */

export const deCeGratuit = {
  h2: 'De ce este gratuit',
  corp: [
    'Pentru că vreau să fac metodologia Deep Logic cunoscută și, în același timp, să o validez în situații reale.',
    'Nu pe exemple inventate. Pe situații reale aduse de antreprenori și oameni de decizie.',
    'Tu vii cu realitatea companiei tale și cu trei ore de atenție. Eu vin cu metodologia, facilitarea și roadmap-ul personalizat.',
    'La final îmi doresc ceva foarte simplu de la tine: feedback sincer. Atât.',
  ],
  include: {
    h3: 'Ce include',
    lista: [
      'Trei ore de lucru pe compania ta, cu metodologia Deep Logic',
      'Roadmap-ul tău digital personalizat, pe email',
      'Recomandarea Deep Logic privind continuarea',
    ],
  },
  deCeLimitat: {
    h3: `De ce doar ${EVENIMENT.capacitate} de locuri`,
    // „gratuit" nu se repetă aici — apare deja o dată în h2-ul de mai sus și o
    // dată la rândul „Cost" din §13; peste atât, cuvântul scade valoarea
    // percepută, aceeași regulă ca la textul de distribuire.
    corp: `Această ediție e limitată la maximum ${EVENIMENT.capacitate} de participanți — peste atât nu mai pot lucra cu fiecare din sală, iar workshopul devine prezentare.`,
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §15 — ÎNTREBĂRI FRECVENTE
   ═══════════════════════════════════════════════════════════════════════════ */

export const faq = {
  h2: 'Întrebări',
  intrebari: [
    {
      q: 'Trebuie să am experiență cu AI?',
      // [completare] — „...doar de câteva ori ChatGPT sau dacă n-ai făcut încă nimic s"
      a: 'Nu. Poți veni și dacă ai folosit doar de câteva ori ChatGPT sau dacă n-ai făcut încă nimic similar.',
    },
    {
      q: 'Trebuie să vin cu problema deja identificată?',
      // [completare] — „...O parte im"
      a: 'Nu. Este suficient să știi că există lucruri pe care ai vrea să le faci mai bine. O parte importantă din workshop e chiar clarificarea problemei, nu presupunerea că vii cu ea gata formulată.',
    },
    {
      q: 'Trebuie să fiu IT-ist ca să înțeleg?',
      // [completare] — „...Rolul tău este să î"
      a: 'Nu. Nu discutăm arhitecturi tehnice și nu trebuie să știi să programezi. Rolul tău este să înțelegi ce merită rezolvat, nu cum se construiește tehnic.',
    },
    {
      q: 'Este potrivit pentru domeniul meu?',
      // [completare] — „...există suficient ma"
      a: 'Dacă ai procese, oameni, informații, clienți sau decizii care se repetă, există suficient material de lucru, indiferent de domeniu.',
    },
    {
      q: 'Trebuie să aduc laptop?',
      // [completare] — „...Dacă va fi util pentru un exercițiu, poți v"
      a: 'Laptopul nu este obligatoriu pentru participare. Dacă va fi util pentru un exercițiu, poți veni cu el, dar nu ai nevoie de el ca să participi.',
    },
    {
      q: 'Ce primesc după workshop?',
      // [completare] — „...ce trebu"
      a: 'Un roadmap digital personalizat pe email: nevoia identificată, impactul preliminar, ce trebuie validat, oamenii de implicat și pașii concreți pentru următorul pas.',
    },
    {
      // Nu e în PDF-ul sursă (§13 are doar 6 întrebări) — reintrodusă din
      // documentul precedent: mecanismul bifei opționale de discuție
      // (form-schema.ts, BIFE.discutie) n-a dispărut, și fără explicația asta
      // în FAQ rămâne un mecanism de încredere netestat de cititor.
      q: 'O să-mi vindeți ceva la final?',
      a: 'Nu de la microfon. Pe formularul de la final există o singură bifă, prin care poți cere o discuție dacă vrei. Dacă n-o bifezi, nu te caută nimeni.',
    },
    {
      q: 'Ce se întâmplă dacă mă înscriu și nu pot ajunge?',
      a: `Anunță-mă și eliberez locul pentru altcineva. Sunt ${EVENIMENT.capacitate} și, la mine, chiar sunt ${EVENIMENT.capacitate}.`,
    },
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §16 — ÎNSCRIERE (antetul dialogului de înscriere, DialogInscriere.astro)
   Distinct de `ctaFinal` (mai jos) — sursa dă text separat pentru „ÎNSCRIERE"
   (procedural, direct sub formular) față de „CTA FINAL" (motivațional,
   ultima secțiune de pe pagină). Înainte, ambele foloseau `ctaFinal`.
   ═══════════════════════════════════════════════════════════════════════════ */

export const inscriere = {
  h2: `Rezervă-ți locul la ${EVENIMENT.titlu}`,
  corp: 'Înscrierea durează câteva minute. Pe lângă datele de contact, îți voi pune câteva întrebări despre compania ta. Nu trebuie să ai răspunsurile perfecte.',
  meta: `${EVENIMENT.dataText} · ${EVENIMENT.ora} · ${EVENIMENT.oras}`,
  // [completare] — „...pe probleme rea" / „...pe email primești confirmarea și detaliile de participare pe ema"
  microcopy:
    'Întrebările mă ajută să înțeleg cine vine în sală și să pregătesc workshopul pe probleme reale, nu pe una imaginară. După înscriere primești confirmarea și detaliile de participare pe email.',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §17 — CTA FINAL
   Repetă rezultatul, nu argumentul. Apare a doua oară ca antet-fallback al
   dialogului doar dacă cineva ajunge acolo fără să fi trecut prin §16.
   ═══════════════════════════════════════════════════════════════════════════ */

export const ctaFinal = {
  h2: '3 ore. Compania ta. Primul pas.',
  corp: 'Nu ca să implementezi AI într-o după-amiază. Ci ca să treci de la „Ar trebui să fac ceva cu AI.” la o nevoie numită, cu impact estimat și cu primul pas scris.',
  meta: `${EVENIMENT.dataScurt} · ${EVENIMENT.ora} · ${EVENIMENT.oras} · ${EVENIMENT.capacitate} de locuri`,
  // [completare] — „...Și știu ce trebuie să ve"
  microcopy:
    '„Asta este nevoia pe care vreau s-o rezolv. Asta cred că valorează. Și știu ce trebuie să verific înainte să merg mai departe.”',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   §18 — FOOTER
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
  descriere: `Trei ore, miercuri 16 septembrie. Nu implementezi AI — formulezi nevoia, estimezi impactul și pleci cu un prim pas concret. ${EVENIMENT.capacitate} de locuri.`,
  ogTitlu: 'PRIMUL PAS — workshop Deep Logic',
  ogDescriere: `16 septembrie · Satu Mare · trei ore. Pleci cu un roadmap digital, nu cu notițe. ${EVENIMENT.capacitate} de locuri.`,
  ogImagine: '/og-workshop-16-09.png',
  locale: 'ro_RO',
} as const;
