/**
 * Formularul de înscriere — definiție unică pentru randare ȘI validare.
 *
 * De ce într-un singur fișier: opțiunile de radio randate în HTML și enum-ul din
 * schema de validare trebuie să fie aceleași. Ținute separat, prima schimbare de
 * formulare le desincronizează și primești respingeri pe răspunsuri valide —
 * un bug care se vede abia în producție, pe un om care voia să se înscrie.
 *
 * Câmpurile de bază vin din §16 al documentului sursă.
 * Cele 5 întrebări de calificare vin din `formular-calificare-workshop.md`
 * (2026-09-03, înlocuiește decizia D4 din docs/DECIZII.md — vezi D55 acolo).
 * Toate cu răspuns predefinit, niciuna text liber: un textarea obligatoriu e
 * deja cel mai mare punct de abandon pe mobil.
 */

import { z } from 'zod';

/* ── Opțiuni ─────────────────────────────────────────────────────────────── */

export const SURSA = [
  'Sunt membru BIZZ.CLUB Satu Mare',
  'Am primit invitația de la un membru BIZZ.CLUB',
  'Sunt membru DRW',
  'Altfel',
] as const;

/** Care valori din SURSA deschid un câmp text suplimentar, și cu ce etichetă. */
export const SURSA_CONDITIONAL: Partial<Record<(typeof SURSA)[number], string>> = {
  'Am primit invitația de la un membru BIZZ.CLUB': 'De la cine?',
  Altfel: 'Cum ai aflat?',
};

export const NIVEL_AI = [
  'Zilnic, e parte din cum lucrez',
  'Din când în când',
  'Am încercat și am renunțat',
  'Niciodată',
] as const;

/**
 * Set de calificare (2026-09-03, înlocuiește D4 — vezi docs/DECIZII.md): 5
 * întrebări conform `formular-calificare-workshop.md`, sursa de adevăr
 * pentru acest bloc. 3 din 5 sunt checkbox (nu radio) — decizia D4 veche
 * ("Set B... toate radio") nu mai e literă de lege, era o alegere anterioară
 * respinsă acum explicit de Ciprian în favoarea acestui set ("Set A").
 */
export const ASTEPTARI = [
  'Să înțeleg în sfârșit ce poate și ce nu poate AI-ul, concret',
  'Să știu de unde încep în firma mea',
  'Să văd cu ochii mei un sistem care chiar funcționează, nu promisiuni',
  'Să pot da direcție echipei mele pentru implementare',
  'Să știu ce riscuri îmi asum dacă încep',
] as const;

export const FRICA = [
  'Că investesc timp și bani și nu iese nimic',
  'Că nu am pe cineva care să-mi spună obiectiv ce merită și ce nu, în cazul meu',
  'Că oamenii mei se vor simți amenințați',
  'Că datele firmei ajung unde nu trebuie',
  'Că nu știu dacă e momentul potrivit',
  'Nu mă oprește nimic, doar n-am prioritizat asta',
] as const;

/** Opțiune specială în `PROVOCARE_BUSINESS` — bifarea ei dezvăluie un câmp text companion. */
export const PROVOCARE_ALTCEVA = 'Altceva:';

export const PROVOCARE_BUSINESS = [
  'Ofertele și devizele — durează prea mult, se fac manual',
  'Răspunsurile către clienți — aceleași întrebări, iar și iar',
  'Procesare documente și rapoarte — pierdem prea mult timp cu asta',
  'Vânzarea — nu ajung la destui oameni potriviți',
  'Inducția oamenilor noi, precum și dezvoltarea proceselor și procedurilor',
  PROVOCARE_ALTCEVA,
] as const;

export const BLOCAJ_ISTORIC = [
  'N-am știut de unde să încep',
  'N-am avut cu cine să vorbesc — pe cineva care înțelege și afacerea, nu doar tehnologia',
  'Am crezut că e pentru firme mai mari decât a mea',
  'Am încercat și n-am fost impresionat',
  'N-am avut timp să mă uit serios',
  'Nu m-a ținut nimic pe loc, abia acum devine relevant',
] as const;

export const INTERES_INCOMPANY = [
  'Da — oamenii mei ar avea nevoie de asta mai mult decât mine',
  'Poate — vreau întâi să văd formatul pe 16',
  'Nu — ajunge să înțeleg eu',
  'Nu e cazul, lucrez singur sau cu foarte puțini oameni',
] as const;

/**
 * Tipuri derivate din array-urile de mai sus, nu declarate separat — o
 * opțiune adăugată în array intră automat și în tip. Folosite de
 * src/lib/supabase.ts pentru a tipa `qualification_answers`.
 */
export type Asteptare = (typeof ASTEPTARI)[number];
export type Frica = (typeof FRICA)[number];
export type ProvocareBusiness = (typeof PROVOCARE_BUSINESS)[number];
export type BlocajIstoric = (typeof BLOCAJ_ISTORIC)[number];
export type IntereseIncompany = (typeof INTERES_INCOMPANY)[number];

/* ── Lungimi ─────────────────────────────────────────────────────────────── */

export const LIMITE = {
  numeMin: 2,
  numeMax: 120,
  emailMax: 254, // RFC 5321
  firmaRolMin: 2,
  firmaRolMax: 160,
  /**
   * 15 caractere. Fără prag, câmpul primește „." sau „x" și n-ai nimic de
   * pregătit — exact ce promite microcopy-ul că vei face cu răspunsul.
   * Peste 15 devine agasant pentru cineva care scrie scurt și la obiect.
   */
  procesMin: 15,
  procesMax: 2000,
  sursaDetaliuMax: 200,
} as const;

/* ── Mesaje de eroare ────────────────────────────────────────────────────── */
/* Aceeași voce ca pagina: direct, fără „vă rugăm", fără „câmp obligatoriu". */

const M = {
  nume: 'Scrie-ți numele.',
  numeScurt: 'Pare prea scurt. Numele întreg.',
  email: 'Adresa asta nu arată a email. Verific-o.',
  emailLipsa: 'Am nevoie de email ca să-ți trimit confirmarea.',
  firmaRol: 'Firma și ce faci acolo.',
  sursa: 'Alege una.',
  sursaDetaliu: 'Completează și asta.',
  proces: 'Scrie un proces concret. Fără el n-am ce pregăti pentru tine.',
  procesScurt:
    'Prea scurt ca să însemne ceva. Un exemplu: „fac ofertele de mână, fiecare îmi ia 40 de minute".',
  alege: 'Alege una.',
  alegeCelPutinUna: 'Alege cel puțin una.',
  // Text exact din formular-calificare-workshop.md — folosit ȘI ca mesaj de
  // blocaj UI (client, la a 3-a bifă), ȘI ca eroare de validare (server).
  alegeDoarDoua: 'Alege doar 2 — cele mai importante pentru tine',
  altcevaDetaliu: 'Spune pe scurt ce anume.',
  consimtamant: 'Fără bifa asta nu pot să-ți prelucrez datele. E singura obligatorie.',
  turnstile: 'Verificarea anti-spam n-a trecut. Reîncarcă pagina și încearcă din nou.',
} as const;

/* ── Schema ──────────────────────────────────────────────────────────────── */

export const inscriereSchema = z
  .object({
    nume: z
      .string({ error: M.nume })
      .trim()
      .min(LIMITE.numeMin, M.numeScurt)
      .max(LIMITE.numeMax, 'Prea lung.'),

    email: z
      .email({ error: M.email })
      .trim()
      .max(LIMITE.emailMax, 'Prea lung.')
      .transform((v) => v.toLowerCase()),

    firma_rol: z
      .string({ error: M.firmaRol })
      .trim()
      .min(LIMITE.firmaRolMin, M.firmaRol)
      .max(LIMITE.firmaRolMax, 'Prea lung.'),

    sursa: z.enum(SURSA, { error: M.sursa }),

    sursa_detaliu: z
      .string()
      .trim()
      .max(LIMITE.sursaDetaliuMax, 'Prea lung.')
      .optional()
      .or(z.literal('')),

    proces: z
      .string({ error: M.proces })
      .trim()
      .min(LIMITE.procesMin, M.procesScurt)
      .max(LIMITE.procesMax, 'Prea lung — rezumă în câteva propoziții.'),

    nivel_ai: z.enum(NIVEL_AI, { error: M.alege }),

    // Setul de calificare — formular-calificare-workshop.md (2026-09-03).
    asteptari: z.array(z.enum(ASTEPTARI)).min(1, M.alegeCelPutinUna).max(2, M.alegeDoarDoua),
    frica_principala: z.enum(FRICA, { error: M.alege }),
    provocare_business: z.array(z.enum(PROVOCARE_BUSINESS)).min(1, M.alegeCelPutinUna).max(2, M.alegeDoarDoua),
    provocare_business_altceva: z
      .string()
      .trim()
      .max(LIMITE.sursaDetaliuMax, 'Prea lung.')
      .optional()
      .or(z.literal('')),
    blocaj_istoric: z.array(z.enum(BLOCAJ_ISTORIC)).min(1, M.alegeCelPutinUna),
    interes_incompany: z.enum(INTERES_INCOMPANY, { error: M.alege }),

    /**
     * Singura bifă obligatorie. Strict pentru prelucrarea datelor în scopul
     * workshopului — nu marketing, nu newsletter.
     */
    consimtamant_comunicare: z.literal(true, { error: M.consimtamant }),

    /**
     * Bifa opțională promisă explicit în FAQ: „Pe formularul de la final există
     * o singură bifă, prin care poți cere o discuție dacă vrei. Dacă n-o
     * bifezi, nu te caută nimeni."
     * Se mapează pe `contacts.consimtamant_marketing`.
     */
    vrea_discutie: z.boolean().default(false),

    'cf-turnstile-response': z.string({ error: M.turnstile }).min(1, M.turnstile),
  })
  /**
   * Regula condițională: dacă sursa cere un detaliu, detaliul e obligatoriu.
   * Ținută aici, nu în componentă — altfel cineva cu JS blocat trece de ea.
   */
  .superRefine((val, ctx) => {
    // Aceeași regulă ca la `sursa_detaliu`, aplicată la Q3: dacă „Altceva:" e
    // printre opțiunile bifate, detaliul devine obligatoriu.
    if (val.provocare_business.includes(PROVOCARE_ALTCEVA) && !val.provocare_business_altceva?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['provocare_business_altceva'],
        message: M.altcevaDetaliu,
      });
    }

    const cerut = SURSA_CONDITIONAL[val.sursa];
    if (cerut && !val.sursa_detaliu?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['sursa_detaliu'],
        message: M.sursaDetaliu,
      });
    }
  });


/**
 * `FormData` → obiectul pe care îl așteaptă `inscriereSchema`.
 *
 * Singura conversie reală: bifele. Un checkbox nebifat e ABSENT din FormData
 * (comportament HTML standard), nu `"false"` — dacă am lăsat Zod să vadă
 * `undefined` direct, mesajul de eroare ar fi fost genericul „Required" al
 * Zod, nu M.consimtamant din schema noastră. Coerciția explicită la boolean
 * face ca eroarea corectă, în vocea paginii, să ajungă la validare.
 *
 * `request.formData()` din Fetch API parsează la fel de bine
 * `application/x-www-form-urlencoded` (submit nativ, fără JS) și
 * `multipart/form-data` (submit prin fetch, cu JS) — nu trebuie ramificat pe
 * content-type în ruta API.
 */
export function formDataInSchema(fd: FormData): Record<string, unknown> {
  /*
   * Câmpurile `tip: 'checkbox'` (asteptari, provocare_business, blocaj_istoric)
   * trimit MAI MULTE valori sub același `name` — `fd.entries()` le-ar
   * suprascrie pe rând, păstrând doar ultima bifă. Colectate separat, cu
   * `fd.getAll()`, ca array — chiar și o singură bifă (sau nicio bifă)
   * trebuie să ajungă tot ca array la Zod (`.min(1)`/`.max(2)` operează pe
   * lungime, nu pe un string).
   */
  const campuriCheckbox = new Set(
    BLOCURI.flatMap((b) => b.campuri)
      .filter((c) => c.tip === 'checkbox')
      .map((c) => c.id),
  );

  const obiect: Record<string, unknown> = {};
  for (const [cheie, valoare] of fd.entries()) {
    if (typeof valoare !== 'string' || campuriCheckbox.has(cheie)) continue;
    obiect[cheie] = valoare;
  }
  for (const cheie of campuriCheckbox) {
    obiect[cheie] = fd.getAll(cheie).filter((v): v is string => typeof v === 'string');
  }
  obiect.consimtamant_comunicare = fd.get(BIFE.consimtamant.id) === 'true';
  obiect.vrea_discutie = fd.get(BIFE.discutie.id) === 'true';
  return obiect;
}

/* ── Structura vizuală a formularului ────────────────────────────────────── */
/*
 * Un singur pas, nu multi-step: o stare pierdută în browserul in-app din
 * WhatsApp costă mai mult decât câștigi din formularul mai scurt pe ecran.
 * Blocurile sunt doar grupare vizuală, cu un heading care justifică de ce se
 * pun întrebările din al doilea.
 */

export type CampTip = 'text' | 'email' | 'textarea' | 'radio' | 'select' | 'checkbox';

export interface Camp {
  id: string;
  label: string;
  tip: CampTip;
  obligatoriu: boolean;
  optiuni?: readonly string[];
  microcopy?: string;
  placeholder?: string;
  autocomplete?: string;
  /** Doar `tip: 'checkbox'`. `maxSelectii` absent = fără limită (vezi Q4/blocaj_istoric). */
  maxSelectii?: number;
  /** Doar checkbox cu `maxSelectii`: mesaj afișat când se încearcă o bifă peste limită. */
  mesajLimita?: string;
  /** Doar checkbox: valoarea a cărei bifare dezvăluie un câmp text companion. */
  optiuneText?: { valoare: string; idCamp: string; label: string };
}

export interface Bloc {
  id: string;
  titlu?: string;
  intro?: string;
  campuri: Camp[];
}

export const BLOCURI: Bloc[] = [
  {
    id: 'cine',
    campuri: [
      {
        id: 'nume',
        label: 'Nume și prenume',
        tip: 'text',
        obligatoriu: true,
        autocomplete: 'name',
      },
      {
        id: 'email',
        label: 'Email',
        tip: 'email',
        obligatoriu: true,
        autocomplete: 'email',
        microcopy: 'Aici primești confirmarea și, după workshop, materialul tău.',
      },
      {
        id: 'firma_rol',
        label: 'Firma și rolul tău',
        tip: 'text',
        obligatoriu: true,
        autocomplete: 'organization',
      },
      {
        id: 'sursa',
        label: 'Cine te-a invitat?',
        tip: 'select',
        obligatoriu: true,
        optiuni: SURSA,
      },
    ],
  },
  {
    id: 'pregatire',
    titlu: 'Ca să pregătesc materialul',
    intro:
      'Întrebările astea nu ajung nicăieri în afară de mine. Le folosesc ca să construiesc workshopul pentru sala care vine efectiv.',
    campuri: [
      {
        id: 'proces',
        label: 'Ce proces din firma ta îți mănâncă cel mai mult timp?',
        tip: 'textarea',
        obligatoriu: true,
        // Fără exemplu concret primești „administrația" și n-ai nimic.
        placeholder:
          'Ex.: fac ofertele de mână, fiecare îmi ia 40 de minute și trimit 15 pe săptămână.',
      },
      {
        id: 'nivel_ai',
        label: 'Folosești AI azi?',
        tip: 'radio',
        obligatoriu: true,
        optiuni: NIVEL_AI,
      },
      {
        id: 'asteptari',
        label: 'Cu ce ai vrea să pleci din sală pe 16 septembrie?',
        tip: 'checkbox',
        obligatoriu: true,
        optiuni: ASTEPTARI,
        maxSelectii: 2,
        mesajLimita: M.alegeDoarDoua,
      },
      {
        id: 'frica_principala',
        label: 'Când te gândești să introduci AI în firma ta, ce te oprește cel mai mult?',
        tip: 'radio',
        obligatoriu: true,
        optiuni: FRICA,
      },
      {
        id: 'provocare_business',
        label: 'Dacă AI-ul ar rezolva o singură problemă în firma ta anul ăsta, care ar fi?',
        tip: 'checkbox',
        obligatoriu: true,
        optiuni: PROVOCARE_BUSINESS,
        maxSelectii: 2,
        mesajLimita: M.alegeDoarDoua,
        optiuneText: { valoare: PROVOCARE_ALTCEVA, idCamp: 'provocare_business_altceva', label: 'Altceva:' },
      },
      {
        id: 'blocaj_istoric',
        label: 'Ce te-a ținut pe loc până acum?',
        microcopy: 'Bifează tot ce se aplică',
        tip: 'checkbox',
        obligatoriu: true,
        optiuni: BLOCAJ_ISTORIC,
        // Fără maxSelectii — deliberat (formular-calificare-workshop.md): aici
        // vrei tot ce se aplică, nu o prioritizare la 2.
      },
      {
        id: 'interes_incompany',
        label: 'Consideri că ar fi oportun un workshop în compania ta pentru colegii din echipa ta?',
        tip: 'radio',
        obligatoriu: true,
        optiuni: INTERES_INCOMPANY,
      },
    ],
  },
];

export const BIFE = {
  consimtamant: {
    id: 'consimtamant_comunicare',
    label:
      'Sunt de acord ca Deep Logic să-mi prelucreze datele pentru organizarea acestui workshop.',
    obligatoriu: true,
    /*
     * AMBELE documente, nu doar politica (B-4, fix 2026-09-10). Gate-ul
     * `LEGAL` din CLAUDE.md §6 cere literal „Termeni + Confidențialitate
     * linkate din bifă", iar `PROGRES.md` îl marca drept complet — dar
     * `/termeni` nu apărea nicăieri în fluxul de înscriere, doar în footer și
     * între paginile legale. Documentul de Termeni afirmă el însuși că
     * utilizarea site-ului constituie acceptare, ceea ce face absența lui
     * exact în punctul de consimțământ greu de apărat.
     */
    linkuri: [
      { text: 'Politica de confidențialitate', href: '/confidentialitate' },
      { text: 'Termeni și condiții', href: '/termeni' },
    ],
  },
  discutie: {
    id: 'vrea_discutie',
    label: 'Vreau o discuție despre procesele mele, după workshop.',
    obligatoriu: false,
    microcopy: 'Opțional. Dacă n-o bifezi, nu te caută nimeni.',
  },
} as const;
