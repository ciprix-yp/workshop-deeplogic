/**
 * Formularul de înscriere — definiție unică pentru randare ȘI validare.
 *
 * De ce într-un singur fișier: opțiunile de radio randate în HTML și enum-ul din
 * schema de validare trebuie să fie aceleași. Ținute separat, prima schimbare de
 * formulare le desincronizează și primești respingeri pe răspunsuri valide —
 * un bug care se vede abia în producție, pe un om care voia să se înscrie.
 *
 * Câmpurile de bază vin din §16 al documentului sursă.
 * Q1–Q5 sunt setul de calificare (decizia D4), toate cu răspuns predefinit:
 * un textarea obligatoriu e deja cel mai mare punct de abandon pe mobil, iar
 * încă cinci câmpuri de text liber l-ar dubla.
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

export const Q1_UNEALTA = ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Alta', 'Niciuna'] as const;

export const Q2_BLOCAJ = [
  'Nu știu de unde să încep',
  'Am încercat și n-a ieșit',
  'Nu știu ce e sigur să pun acolo',
  'Echipa mea nu e pregătită',
  'N-am avut timp',
] as const;

export const Q3_DOMENIU = [
  'Producție',
  'Servicii',
  'Comerț',
  'Construcții',
  'IT / software',
  'Altul',
] as const;

export const Q4_PREGATIRE = [
  'Da, știu exact care',
  'Da, dar vag',
  'Nu încă — vin să văd',
] as const;

export const Q5_ANVERGURA = [
  'Doar eu',
  'Eu și încă cineva',
  'O echipă întreagă',
  'Nu știu încă',
] as const;

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

    // Setul de calificare (D4).
    q1_unealta: z.enum(Q1_UNEALTA, { error: M.alege }),
    q2_blocaj: z.enum(Q2_BLOCAJ, { error: M.alege }),
    q3_domeniu: z.enum(Q3_DOMENIU, { error: M.alege }),
    q4_pregatire: z.enum(Q4_PREGATIRE, { error: M.alege }),
    q5_anvergura: z.enum(Q5_ANVERGURA, { error: M.alege }),

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
    const cerut = SURSA_CONDITIONAL[val.sursa];
    if (cerut && !val.sursa_detaliu?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['sursa_detaliu'],
        message: M.sursaDetaliu,
      });
    }
  });

export type InscriereInput = z.input<typeof inscriereSchema>;
export type Inscriere = z.output<typeof inscriereSchema>;

/* ── Structura vizuală a formularului ────────────────────────────────────── */
/*
 * Un singur pas, nu multi-step: o stare pierdută în browserul in-app din
 * WhatsApp costă mai mult decât câștigi din formularul mai scurt pe ecran.
 * Blocurile sunt doar grupare vizuală, cu un heading care justifică de ce se
 * pun întrebările din al doilea.
 */

export type CampTip = 'text' | 'email' | 'textarea' | 'radio' | 'select';

export interface Camp {
  id: string;
  label: string;
  tip: CampTip;
  obligatoriu: boolean;
  optiuni?: readonly string[];
  microcopy?: string;
  placeholder?: string;
  autocomplete?: string;
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
        id: 'q1_unealta',
        label: 'Ce unealtă ai deschis ultima dată?',
        tip: 'radio',
        obligatoriu: true,
        optiuni: Q1_UNEALTA,
      },
      {
        id: 'q2_blocaj',
        label: 'Ce te-a oprit până acum?',
        tip: 'radio',
        obligatoriu: true,
        optiuni: Q2_BLOCAJ,
      },
      {
        id: 'q3_domeniu',
        label: 'Domeniul firmei',
        tip: 'radio',
        obligatoriu: true,
        optiuni: Q3_DOMENIU,
      },
      {
        id: 'q4_pregatire',
        label: 'Ai deja în cap un proces la care vrei să lucrezi în sală?',
        tip: 'radio',
        obligatoriu: true,
        optiuni: Q4_PREGATIRE,
      },
      {
        id: 'q5_anvergura',
        label: 'Cine mai atinge procesul ăsta, în afară de tine?',
        tip: 'radio',
        obligatoriu: true,
        optiuni: Q5_ANVERGURA,
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
    linkPolitica: { text: 'Politica de confidențialitate', href: '/confidentialitate' },
  },
  discutie: {
    id: 'vrea_discutie',
    label: 'Vreau o discuție despre procesele mele, după workshop.',
    obligatoriu: false,
    microcopy: 'Opțional. Dacă n-o bifezi, nu te caută nimeni.',
  },
} as const;
