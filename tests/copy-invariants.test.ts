/**
 * Invarianți de copy — regulile din „CE NU APARE PE PAGINĂ — DELIBERAT",
 * transformate în aserțiuni.
 *
 * De ce există: lista aia e cea mai fragilă parte a documentului sursă. E
 * disciplină, iar disciplina se erodează la a treia editare făcută în grabă —
 * cineva adaugă „valoare 2000 lei" ca să întărească secțiunea și nimeni nu
 * observă că tocmai a contrazis motivul pentru care nu există preț pe pagină.
 * Ca test, nu se mai poate pierde: build-ul pică.
 *
 * Testele verifică DOUĂ lucruri:
 *   1. ce NU trebuie să apară (regulile deliberate)
 *   2. ce TREBUIE să apară (deciziile D5–D7, aplicate peste tot)
 */

import { describe, it, expect } from 'vitest';
import * as copy from '../src/content/copy';
import { BLOCURI, BIFE, SURSA, LIMITE } from '../src/content/form-schema';

/** Aplatizează tot copy-ul exportat într-un singur șir, ca să căutăm în el. */
function totCopy(): string {
  const bucati: string[] = [];
  const vizitat = new WeakSet<object>();

  function mergi(v: unknown): void {
    if (typeof v === 'string') {
      bucati.push(v);
      return;
    }
    if (typeof v === 'number') {
      bucati.push(String(v));
      return;
    }
    if (v && typeof v === 'object') {
      if (vizitat.has(v)) return;
      vizitat.add(v);
      for (const val of Object.values(v)) mergi(val);
    }
  }

  mergi(copy);
  mergi(BLOCURI);
  mergi(BIFE);
  return bucati.join('\n');
}

const TEXT = totCopy();
const TEXT_LOWER = TEXT.toLowerCase();

/* ═══════════════════════════════════════════════════════════════════════════
   1. Ce NU apare — deliberat
   ═══════════════════════════════════════════════════════════════════════════ */

describe('fără preț sau ancoră de preț', () => {
  // Workshopul public și cel in-company nu sunt același produs. O ancoră de preț
  // ar revendica o echivalență falsă, iar primul om care compară cele două
  // agende o vede.
  it.each([
    [/\blei\b/i, 'suma în lei'],
    [/\beuro?\b/i, 'suma în euro'],
    [/€|\$/, 'simbol de monedă'],
    [/\bron\b/i, 'RON'],
    [/valoare(a)? de\b/i, '„valoare de X"'],
    [/normal ar costa/i, '„normal ar costa"'],
    [/în mod normal costă/i, 'ancoră de preț'],
  ])('nu conține %s (%s)', (tipar) => {
    expect(TEXT).not.toMatch(tipar);
  });

  it('„gratuit" apare în corpul paginii de exact trei ori', () => {
    // Recalculat la pivotul de structură (2026-09-02, 16→10 secțiuni):
    // Trust bar (formatul evenimentului), întrebarea din FAQ „Este
    // participarea cu adevărat gratuită?" și rândul din CTA final. Fosta
    // secțiune dedicată „De ce este gratuit" a fost retrasă — conținutul ei
    // a migrat în răspunsul din FAQ. Repetat peste atât, cuvântul scade
    // valoarea percepută — aceeași regulă ca la textul de distribuire.
    const corpPagina = [copy.trustBar, copy.faq, copy.ctaFinal]
      .map((s) => JSON.stringify(s))
      .join(' ')
      .toLowerCase();
    expect((corpPagina.match(/gratuit/g) ?? []).length).toBe(3);
  });

  it('cardul de partajare nu începe cu „gratuit"', () => {
    // Cardul se randează direct sub mesajul personal al membrului BIZZ.CLUB.
    // Pornit cu „gratuit", mută încadrarea de la privilegiu personal la
    // eveniment gratuit oarecare — și strică mecanismul de distribuție.
    expect(copy.meta.ogDescriere.toLowerCase()).not.toMatch(/^\s*(workshop\s+)?gratuit/);
    expect(copy.meta.ogTitlu.toLowerCase()).not.toMatch(/gratuit/);
  });
});

describe('fără cifre de piață, procente sau ROI', () => {
  it('nu conține procente — cu excepția formatului propriu al sesiunii', () => {
    // „20% context · 80% lucru aplicat" descrie STRUCTURA PROPRIE a sesiunii
    // (decizia lui Ciprian asupra propriului format), nu o statistică de
    // piață externă și neverificată — genul pe care regula interzice.
    // Testul verifică absența oricărui ALT procent, nu a acestei perechi.
    // Apare în două formulări ușor diferite („80% lucru aplicat" la §01/§14,
    // „80% lucru pe compania ta" la §12/Formatul) — ambele descriu același
    // raport 20/80, deci ambele intră în excepție.
    const faraFormat = TEXT.replace(/20%\s*context/gi, '').replace(/80%\s*lucru\b/gi, '');
    expect(faraFormat).not.toMatch(/\d+\s*%/);
    expect(TEXT_LOWER).not.toMatch(/\d+\s*la sută/);
  });

  it('nu promite ROI cuantificat', () => {
    // „Ce ROI?" apare în §02 ca întrebare pe care și-o pune cititorul — aia e
    // permisă. Ce nu e permis: o cifră atașată.
    expect(TEXT).not.toMatch(/ROI\s*(de|:)?\s*\d/i);
    expect(TEXT_LOWER).not.toMatch(/de \d+ ori mai (rapid|repede|eficient|productiv)/);
    expect(TEXT_LOWER).not.toMatch(/econom(isești|ie de)\s*\d/);
  });

  it('nu citează studii sau statistici', () => {
    expect(TEXT_LOWER).not.toMatch(/potrivit unui studiu/);
    expect(TEXT_LOWER).not.toMatch(/cercetările arată/);
    expect(TEXT_LOWER).not.toMatch(/\d+\s*(din|dintre)\s*\d+\s*(firme|companii|antreprenori)/);
  });
});

describe('legislația, dacă apare, apare o singură dată, ca zgomot — niciodată ca promisiune', () => {
  it('AI Act/GDPR/NIS2, dacă apar undeva, apar doar în §02', () => {
    // PRIMUL PAS (pivot 2026-08-31) nu mai menționează AI Act/GDPR în §02 —
    // vacarmul de business (date/echipă/cost/ROI) a înlocuit unghiul legislativ
    // din „Prima Mutare". Regula rămâne o constrângere de LOCAȚIE, nu un
    // mandat de prezență: dacă cineva reintroduce o mențiune legislativă
    // oriunde altundeva decât §02, testul pică.
    const restul = [
      copy.hero, copy.trustBar, copy.agravare, copy.rezultatul, copy.pentruCine,
      copy.ceFacem, copy.solutie, copy.facilitator, copy.detalii,
      copy.faq, copy.ctaFinal, copy.stari, copy.meta,
    ];
    for (const sectiune of restul) {
      expect(JSON.stringify(sectiune)).not.toMatch(/AI Act|NIS2|GDPR/i);
    }
  });

  it('nu promite conformitate legală', () => {
    expect(TEXT_LOWER).not.toMatch(/te (facem|aducem) conform/);
    expect(TEXT_LOWER).not.toMatch(/conformitate garantată/);
    expect(TEXT_LOWER).not.toMatch(/(respectă|conform cu) (ai act|gdpr|nis2)/);
  });
});

describe('fără presiune fabricată — dar scarcity-ul REAL e permis (reversare 2026-08-31)', () => {
  // Interdicția veche ("nu punem contor live") a fost reversată deliberat de
  // Ciprian — vezi CLAUDE.md §1. Ce rămâne interzis, neschimbat de reversare:
  // urgență FABRICATĂ, nu scarcity real alimentat din date reale.
  it.each([
    [/se apropie termenul/i, 'urgență fabricată'],
    [/grăbește-te/i, '„grăbește-te"'],
    [/ofertă limitată/i, '„ofertă limitată"'],
    [/doar azi/i, '„doar azi"'],
    [/cineva tocmai s-a înscris/i, 'notificare falsă de înscriere'],
  ])('nu conține %s (%s)', (tipar) => {
    expect(TEXT).not.toMatch(tipar);
  });

  it('capacitatea (30) e afirmată static în copy — numărul LIVE nu e niciodată hardcodat', () => {
    expect(TEXT).toMatch(/30 de locuri|Maximum 30/);
    // Regula sursei: „fără deficit fals; afișează doar date reale". Un număr
    // de locuri rămase scris direct în copy.ts (ex. „12 locuri disponibile")
    // ar fi exact deficitul fals interzis — cifra reală vine STRICT din
    // /api/locuri-disponibile (BaraScarcity.astro), niciodată din text static.
    // `[ \t]+`, nu `\s+`: valorile aplatizate sunt unite cu `\n`, deci un
    // număr terminând o valoare (ex. „14:00") urmat întâmplător de eticheta
    // DIN ALT câmp n-are voie să conteze ca potrivire — trebuie să fie
    // aceeași frază, nu doi vecini de-a-ntâmplarea.
    expect(TEXT_LOWER).not.toMatch(/\d+[ \t]+locuri[ \t]+(rămase|disponibile|libere)/);
  });

  it('eticheta de scarcity e un șablon generic, fără cifră scrisă de mână', () => {
    expect(copy.scarcity.etichetaLocuri).not.toMatch(/\d/);
    expect(copy.scarcity.etichetaBara).not.toMatch(/\d/);
  });
});

describe('fără testimoniale sau dovadă socială inventată', () => {
  it('nu conține citate atribuite', () => {
    // §12 explică deliberat de ce nu există testimoniale. Aia e permisă;
    // un testimonial propriu-zis, nu.
    expect(TEXT_LOWER).not.toMatch(/„[^"]{20,}"\s*[—–-]\s*[A-ZȘȚĂÎÂ]/);
    expect(TEXT_LOWER).not.toMatch(/ce spun participanții/);
    expect(TEXT_LOWER).not.toMatch(/recomandat de/);
  });

  it('nu conține logo-uri de clienți sau badge-uri de autoritate', () => {
    expect(TEXT_LOWER).not.toMatch(/clienții noștri/);
    expect(TEXT_LOWER).not.toMatch(/parteneri oficiali/);
    expect(TEXT_LOWER).not.toMatch(/certificat (de|în)/);
  });
});

describe('formularul nu cere ce semnalează un apel de vânzare', () => {
  const idCampuri = BLOCURI.flatMap((b) => b.campuri.map((c) => c.id));
  const labelCampuri = BLOCURI.flatMap((b) => b.campuri.map((c) => c.label.toLowerCase()));

  it('nu cere telefon — se ia în sală', () => {
    expect(idCampuri).not.toContain('telefon');
    expect(labelCampuri.join(' ')).not.toMatch(/telefon|mobil/);
  });

  it('nu cere cifră de afaceri', () => {
    expect(labelCampuri.join(' ')).not.toMatch(/cifr[ăa] de afaceri|venit|buget/);
  });

  it('nu cere număr de angajați', () => {
    // Q5 („cine mai atinge procesul") e despre proces, nu despre firmă —
    // formularea contează, iar asta e granița.
    expect(labelCampuri.join(' ')).not.toMatch(/c[âa]ți angajați|num[ăa]r de (angajați|oameni)/);
  });

  it('are exact o bifă obligatorie', () => {
    const obligatorii = Object.values(BIFE).filter((b) => b.obligatoriu);
    expect(obligatorii).toHaveLength(1);
    expect(obligatorii[0]!.id).toBe('consimtamant_comunicare');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   2. Ce TREBUIE să apară — deciziile aplicate peste tot
   ═══════════════════════════════════════════════════════════════════════════ */

describe('D6 — adresa exactă e pe pagină', () => {
  it('`detalii` (consumat de TrustBar) conține adresa, nu trimiterea la email', () => {
    // Pivot de structură (2026-09-02): „Detalii practice" nu mai e secțiune
    // proprie — adresa completă trăiește în `detalii`, randată de TrustBar.
    const detalii = JSON.stringify(copy.detalii);
    expect(detalii).toMatch(/Casa Dăinuirii/);
    expect(detalii).toMatch(/Strada 1 Decembrie 1918/);
    expect(detalii).not.toMatch(/adresa exactă, în emailul de confirmare/);
  });

  it('adresa e consistentă între TrustBar, .ics și ecranele de confirmare', () => {
    // Trei locuri care trebuie să spună același lucru. Divergența aici trimite
    // oameni la altă adresă în ziua evenimentului.
    const adresa = copy.EVENIMENT.adresa;
    expect(JSON.stringify(copy.detalii)).toContain(adresa);
    expect(JSON.stringify(copy.trustBar)).toContain(adresa);
    expect(JSON.stringify(copy.stari.reconfirmat)).toContain(adresa);
    expect(JSON.stringify(copy.stari.locRevendicat)).toContain(adresa);
  });
});

describe('D8 / D9 — ce a rămas în afara paginii', () => {
  it('blocul despre faliment nu e inclus', () => {
    expect(TEXT_LOWER).not.toMatch(/faliment/);
    expect(TEXT_LOWER).not.toMatch(/firmă de transport/);
  });
});

describe('PRIMUL PAS (pivot 2026-08-31) — „ce nu apare deliberat", lista nouă', () => {
  // Sursa: docs/landing-workshop-16-09.md, secțiunea cu același nume. Poziția
  // veche promitea demonstrații live pe sistemele personale ale lui Ciprian
  // (ofertare You Protect, agent de sănătate) și un cheat-sheet tipărit —
  // toate trei explicit interzise acum.
  it.each([
    [/you protect/i, 'demo-ul You Protect'],
    [/agent(ul)? (personal )?de sănătate/i, 'agentul personal de sănătate'],
    [/cheat-sheet/i, 'cheat-sheet de prompturi'],
    [/997\s*€/i, 'valoare artificială de tip 997€/azi 0€'],
  ])('nu conține %s (%s)', (tipar) => {
    expect(TEXT).not.toMatch(tipar);
  });
});

describe('consistență internă', () => {
  it('capacitatea e aceeași peste tot — 30, unificată cu pragul din bază (migrația 0007)', () => {
    expect(copy.EVENIMENT.capacitate).toBe(30);
    // Biletul (2026-09-07) a spart fostul `trustBar.format` în rânduri;
    // capacitatea trăiește acum pe rândul „grup".
    expect(JSON.stringify(copy.trustBar)).toMatch(/Maximum 30/);
    expect(copy.ctaFinal.meta).toMatch(/30 de locuri/);
    expect(copy.faq.intrebari.at(-1)!.a).toMatch(/Sunt 30/);
  });

  it('data e miercuri, 16 septembrie 2026 — peste tot', () => {
    const zi = new Date(copy.EVENIMENT.data + 'T00:00:00Z').getUTCDay();
    expect(zi).toBe(3); // 0 = duminică, 3 = miercuri
    expect(copy.EVENIMENT.dataText).toMatch(/^Miercuri, 16 septembrie 2026$/);
    // Fostul `trustBar.meta` (rezumat doar pentru cititoarele de ecran) a
    // fost eliminat odată cu biletul — data e acum `trustBar.titlu`, vizibilă.
    expect(JSON.stringify(copy.trustBar)).toContain('16 septembrie 2026');
  });

  it('CTA-ul are un singur text pe toată pagina', () => {
    expect(copy.CTA.text).toBe('Rezervă-ți locul');
    // Fără CTA secundar. „Află mai multe" e exact fuga de decizie pe care
    // pagina o refuză.
    expect(TEXT_LOWER).not.toMatch(/află mai multe|vezi detalii|citește mai mult/);
  });

  it('promisiunea din FAQ despre bifă se potrivește cu formularul', () => {
    // FAQ: „există o singură bifă, prin care poți cere o discuție dacă vrei.
    // Dacă n-o bifezi, nu te caută nimeni."
    const raspuns = copy.faq.intrebari.find((i) => i.q.includes('vindeți'))!.a;
    expect(raspuns).toMatch(/o singură bifă/);
    expect(BIFE.discutie.obligatoriu).toBe(false);
    expect(BIFE.discutie.microcopy).toMatch(/nu te caută nimeni/);
  });

  it('microcopy-ul de lângă formular nu promite un timp de completare fals', () => {
    // Nu promitem „60 de secunde" pentru un formular cu 5 întrebări de
    // calificare — pe pagina asta, un copy care minte e un bug.
    expect(copy.inscriere.microcopy).not.toMatch(/60 de secunde/);
    expect(copy.inscriere.microcopy).not.toMatch(/\bun minut\b/);
  });
});

describe('meta pentru partajare — canalul principal e WhatsApp', () => {
  it('titlul de card intră în limita pe care o taie WhatsApp', () => {
    expect(copy.meta.ogTitlu.length).toBeLessThanOrEqual(65);
  });

  it('descrierea de card e completă și scurtă', () => {
    expect(copy.meta.ogDescriere.length).toBeLessThanOrEqual(160);
    expect(copy.meta.ogDescriere).toMatch(/16 septembrie/);
    expect(copy.meta.ogDescriere).toMatch(/Satu Mare/);
  });

  it('imaginea de card e declarată', () => {
    expect(copy.meta.ogImagine).toMatch(/^\/.+\.(png|jpg)$/);
  });
});

describe('diacritice românești — virgulă, nu sedilă', () => {
  it('nu folosește ş/ţ cu sedilă (U+015F, U+0163)', () => {
    // Sedila e forma turcească. Româna corectă folosește virgula dedesubt
    // (U+0219/U+021B). Amestecate, se văd diferit în mijlocul cuvântului.
    const cuSedila = TEXT.match(/[şţŞŢ]/g);
    expect(cuSedila, `găsite ${cuSedila?.length ?? 0} caractere cu sedilă`).toBeNull();
  });

  it('folosește efectiv virgula dedesubt', () => {
    expect(TEXT).toMatch(/[șț]/);
  });
});

describe('ghilimele românești', () => {
  it('orice „ deschis se închide cu ”, nu cu ghilimea dreaptă', () => {
    // Convenția românească e „…” — U+201E jos la deschidere, U+201D sus la
    // închidere. Amestecul cu " se vede pe o pagină premium.
    // Se verifică doar textul randat; comentariile din cod n-au importanță
    // tipografică, dar au aceleași caractere, deci filtrăm pe copy-ul de pagină.
    const paginaText = [
      copy.hero, copy.trustBar, copy.problema, copy.agravare, copy.solutie,
      copy.ceFacem, copy.facilitator, copy.pentruCine, copy.rezultatul,
      copy.detalii, copy.faq, copy.ctaFinal, copy.stari,
    ]
      .map((s) => JSON.stringify(s))
      .join(' ');

    const deschise = (paginaText.match(/„/g) ?? []).length;
    const inchise = (paginaText.match(/”/g) ?? []).length;
    expect(deschise, 'număr de „ față de ”').toBe(inchise);
  });
});

describe('validarea formularului', () => {
  it('câmpul „proces" are prag minim — altfel primești „."', () => {
    expect(LIMITE.procesMin).toBeGreaterThanOrEqual(10);
  });

  it('placeholder-ul de la „proces" dă un exemplu concret', () => {
    // Fără exemplu primești „administrația" și n-ai nimic de pregătit.
    const camp = BLOCURI.flatMap((b) => b.campuri).find((c) => c.id === 'proces')!;
    expect(camp.placeholder).toMatch(/Ex\.:/);
    expect(camp.placeholder!.length).toBeGreaterThan(40);
  });

  it('sursele acoperă ambele canale de distribuție', () => {
    expect(SURSA.join(' ')).toMatch(/BIZZ\.CLUB/);
    expect(SURSA.join(' ')).toMatch(/DRW/);
  });
});
