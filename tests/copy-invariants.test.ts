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

  it('„gratuit" apare în corpul paginii de exact două ori', () => {
    // Cele două locuri legitime: rândul „Cost" din §13 și titlul §14 („De ce e
    // gratuit"), secțiunea care dezamorsează întrebarea. Repetat peste atât,
    // cuvântul scade valoarea percepută — aceeași regulă ca la textul de
    // distribuire. Se numără DOAR corpul paginii; meta-tagurile se testează
    // separat, iar EVENIMENT.cost e o constantă, nu text randat.
    const corpPagina = [copy.detalii, copy.deCeGratuit, copy.hero, copy.faq, copy.ctaFinal]
      .map((s) => JSON.stringify(s))
      .join(' ')
      .toLowerCase();
    expect((corpPagina.match(/gratuit/g) ?? []).length).toBe(2);
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
  it('nu conține procente', () => {
    // Niciuna verificată de Ciprian, deci niciuna pe pagină.
    expect(TEXT).not.toMatch(/\d+\s*%/);
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

describe('legislația apare o singură dată, ca zgomot — niciodată ca promisiune', () => {
  it('AI Act și GDPR apar doar în §02', () => {
    const inProblema = JSON.stringify(copy.problema);
    expect(inProblema).toMatch(/AI Act/);
    expect(inProblema).toMatch(/GDPR/);

    // Restul paginii: curat. Excepție legitimă — linkul din footer și eticheta
    // bifei de consimțământ, care sunt obligații legale, nu promisiuni de marketing.
    const restul = [
      copy.hero, copy.rezultatul, copy.pentruCine, copy.inainteDupa,
      copy.ceFacem, copy.nuDoarTeorie, copy.cePleciCuTine, copy.useCases,
      copy.despreDeepLogic, copy.facilitator, copy.precedent, copy.detalii,
      copy.deCeGratuit, copy.faq, copy.ctaFinal, copy.stari, copy.meta,
    ];
    for (const sectiune of restul) {
      expect(JSON.stringify(sectiune)).not.toMatch(/AI Act|NIS2/i);
    }
  });

  it('nu promite conformitate legală', () => {
    expect(TEXT_LOWER).not.toMatch(/te (facem|aducem) conform/);
    expect(TEXT_LOWER).not.toMatch(/conformitate garantată/);
    expect(TEXT_LOWER).not.toMatch(/(respectă|conform cu) (ai act|gdpr|nis2)/);
  });
});

describe('fără presiune artificială', () => {
  it.each([
    [/ultimele?\s+locuri/i, '„ultimele locuri"'],
    [/mai (sunt|rămân)\s+\d+\s+locuri/i, 'contor de locuri'],
    [/se apropie termenul/i, 'urgență fabricată'],
    [/grăbește-te/i, '„grăbește-te"'],
    [/ofertă limitată/i, '„ofertă limitată"'],
    [/doar azi/i, '„doar azi"'],
    [/countdown/i, 'countdown'],
  ])('nu conține %s (%s)', (tipar) => {
    expect(TEXT).not.toMatch(tipar);
  });

  it('rarefierea se afirmă calm — „25 de locuri", nu un contor', () => {
    expect(TEXT).toMatch(/25 de locuri/);
    // Cifra e statică. Dacă apare o formulare care implică actualizare live,
    // bufferul de 30 din spate devine vizibil și pagina se contrazice.
    expect(TEXT_LOWER).not.toMatch(/locuri (rămase|disponibile|libere)/);
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

  it('§12 păstrează propoziția care explică absența lor', () => {
    // Pare că slăbește pagina. Nu o slăbește — la un cititor saturat de
    // promisiuni e cel mai puternic semnal de onestitate de pe toată pagina.
    expect(copy.precedent.corp.join(' ')).toMatch(
      /nu pun testimoniale pentru că n-am colectat pe formatul ăsta/i,
    );
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

describe('D5 — „în 24 de ore", nu „în aceeași zi"', () => {
  it('formularea veche a dispărut complet', () => {
    // Era în trei locuri: §08 ITEM 2, §14 „Ce include", §15 FAQ. Un angajament
    // operațional ratat pe primul livrabil de după eveniment costă mai mult
    // decât câștigi din formularea mai tare.
    expect(TEXT_LOWER).not.toMatch(/în aceeași zi/);
  });

  it('apare în toate cele trei locuri', () => {
    expect(JSON.stringify(copy.cePleciCuTine)).toMatch(/în 24 de ore/);
    expect(JSON.stringify(copy.deCeGratuit)).toMatch(/în 24 de ore/);
    expect(JSON.stringify(copy.faq)).toMatch(/în 24 de ore/);
  });
});

describe('D6 — adresa exactă e pe pagină', () => {
  it('§13 conține adresa, nu trimiterea la email', () => {
    const detalii = JSON.stringify(copy.detalii);
    expect(detalii).toMatch(/Casa Dăinuirii/);
    expect(detalii).toMatch(/Strada 1 Decembrie 1918/);
    expect(detalii).not.toMatch(/adresa exactă, în emailul de confirmare/);
  });

  it('adresa e consistentă între §13, .ics și ecranele de confirmare', () => {
    // Trei locuri care trebuie să spună același lucru. Divergența aici trimite
    // oameni la altă adresă în ziua evenimentului.
    const adresa = copy.EVENIMENT.adresa;
    expect(JSON.stringify(copy.detalii)).toContain(adresa);
    expect(JSON.stringify(copy.stari.reconfirmat)).toContain(adresa);
    expect(JSON.stringify(copy.stari.locRevendicat)).toContain(adresa);
  });
});

describe('D7 — cheat-sheet-ul tipărit e ITEM 5 în §08', () => {
  it('§08 are cinci livrabile', () => {
    expect(copy.cePleciCuTine.itemi).toHaveLength(5);
    expect(copy.cePleciCuTine.itemi[4]!.titlu).toMatch(/cheat-sheet/i);
  });

  it('apare și în lista „ce include" din §14', () => {
    expect(copy.deCeGratuit.include.lista.join(' ')).toMatch(/cheat-sheet/i);
  });
});

describe('D8 / D9 — ce a rămas în afara paginii', () => {
  it('blocul despre faliment nu e inclus', () => {
    expect(TEXT_LOWER).not.toMatch(/faliment/);
    expect(TEXT_LOWER).not.toMatch(/firmă de transport/);
  });
});

describe('consistență internă', () => {
  it('capacitatea e aceeași peste tot', () => {
    expect(copy.EVENIMENT.capacitate).toBe(25);
    expect(copy.hero.microProof.join(' ')).toMatch(/25 de locuri/);
    expect(JSON.stringify(copy.detalii)).toMatch(/Maximum 25/);
    expect(copy.ctaFinal.meta).toMatch(/25 de locuri/);
    expect(copy.faq.intrebari.at(-1)!.a).toMatch(/Sunt 25/);
  });

  it('data e miercuri, 16 septembrie 2026 — peste tot', () => {
    const zi = new Date(copy.EVENIMENT.data + 'T00:00:00Z').getUTCDay();
    expect(zi).toBe(3); // 0 = duminică, 3 = miercuri
    expect(copy.EVENIMENT.dataText).toMatch(/^Miercuri, 16 septembrie 2026$/);
    expect(copy.hero.meta).toContain('16 septembrie 2026');
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

  it('microcopy-ul de sub CTA nu mai promite 60 de secunde', () => {
    // Cu cele cinci întrebări de calificare adăugate, „60 de secunde" a devenit
    // neadevărat. Pe pagina asta, un copy care minte e un bug.
    expect(copy.ctaFinal.microcopy).not.toMatch(/60 de secunde/);
    expect(copy.ctaFinal.microcopy).toMatch(/două minute/);
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
      copy.hero, copy.problema, copy.rezultatul, copy.pentruCine,
      copy.inainteDupa, copy.ceFacem, copy.nuDoarTeorie, copy.cePleciCuTine,
      copy.useCases, copy.despreDeepLogic, copy.facilitator, copy.precedent,
      copy.detalii, copy.deCeGratuit, copy.faq, copy.ctaFinal, copy.stari,
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
