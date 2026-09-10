/**
 * Randor comun pentru cele 7 emailuri — un singur loc care produce
 * versiunea `text` ȘI `html`, ca să nu diverg accidental între ele.
 *
 * Deliberat FĂRĂ fonturi web, FĂRĂ CSS extern: clienții de mail ignoră sau
 * blochează ambele, iar încărcarea unui font extern e chiar un antipattern
 * de deliverability (semnal de tracking pentru unele filtre). CSS inline,
 * sistem de fonturi, o singură coloană — exact cum arată un email scris de
 * o persoană, nu un buletin de marketing.
 */

import { footer as siteFooter, EVENIMENT } from '../content/copy';

export interface Buton {
  text: string;
  href: string;
}

export interface EmailContinut {
  salut: string;
  paragrafe: string[];
  /**
   * Bloc „bilet" — titlu, dată+oră, locație, adresă cu link către hartă.
   * Un singur eveniment pe tot proiectul, deci citește direct din
   * `EVENIMENT`, nu ia parametri — cerut explicit (2026-09-10), ca
   * emailul de confirmare să nu îngroape logistica în proză.
   */
  bilet?: boolean;
  butoane?: Buton[];
  /** Paragrafe mici, după butoane — note, PS-uri. */
  notePicior?: string[];
  /**
   * Acțiune secundară, mai jos în email, randată vizibil MAI MIC decât
   * `butoane` (outline, nu umplut) — cerut explicit (2026-09-10): CTA-ul
   * principal (calendar) domină, acțiunea secundară (anulare) rămâne
   * disponibilă, dar nu concurează vizual cu prima.
   */
  butonSecundar?: Buton;
  semnatura?: string;
}

const ACCENT = '#376A66'; // verificat: 6.15:1 pe alb — npm run contrast
const TEXT = '#2A3439';
const MUTED = '#637474';

/*
 * Bug real, găsit la testarea end-to-end (2026-09-09): denumirea veche a
 * produsului, „Prima Mutare spre un Asistent Digital", rămăsese hardcodată
 * aici — pivotul de produs (2026-08-31, → „PRIMUL PAS") actualizase
 * `copy.ts` (pagina), dar nu și emailurile, care nu citesc din același
 * fișier de-atunci. Fix la rădăcină: `EVENIMENT.titlu`, nu un șir fix — un
 * pivot viitor de produs nu mai poate uita locul ăsta, fiindcă nu-l mai
 * atinge deloc.
 */
const SUBSOL_TEXT = `—\n${siteFooter.brand} · Satu Mare, România\nAi primit mailul ăsta pentru că te-ai înscris la „${EVENIMENT.titlu}" pe workshop.deeplogic.ro.`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const BILET_TEXT = [
  '──────────────────────────────',
  EVENIMENT.titlu,
  `${EVENIMENT.dataText} · ${EVENIMENT.ora}`,
  EVENIMENT.locatie,
  `${EVENIMENT.adresa} — hartă: ${EVENIMENT.mapsUrl}`,
  '──────────────────────────────',
].join('\n');

export function randeazaText(c: EmailContinut): string {
  const parti = [
    `Salut, ${c.salut},`,
    '',
    c.paragrafe.join('\n\n'),
  ];

  if (c.bilet) {
    parti.push('', BILET_TEXT);
  }
  if (c.butoane?.length) {
    parti.push('', c.butoane.map((b) => `[${b.text}] → ${b.href}`).join('\n'));
  }
  if (c.notePicior?.length) {
    parti.push('', c.notePicior.join('\n'));
  }
  if (c.butonSecundar) {
    parti.push('', `[${c.butonSecundar.text}] → ${c.butonSecundar.href}`);
  }
  parti.push('', c.semnatura ?? 'Ciprian Micu - Deep Logic');
  parti.push('', SUBSOL_TEXT);

  return parti.join('\n');
}

const BILET_HTML = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;border:1px solid #E4E7E7;border-radius:10px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 6px;color:${TEXT};font-size:17px;font-weight:700;">${escapeHtml(EVENIMENT.titlu)}</p>
        <p style="margin:0 0 14px;color:${ACCENT};font-size:14px;font-weight:600;font-family:'Courier New',Courier,monospace;">${escapeHtml(EVENIMENT.dataText)} · ${escapeHtml(EVENIMENT.ora)}</p>
        <p style="margin:0;color:${TEXT};font-size:15px;line-height:1.5;">
          ${escapeHtml(EVENIMENT.locatie)}<br/>
          <a href="${EVENIMENT.mapsUrl}" style="color:${ACCENT};">${escapeHtml(EVENIMENT.adresa)}</a>
        </p>
      </td></tr>
    </table>`;

export function randeazaHtml(c: EmailContinut): string {
  const p = (text: string) =>
    `<p style="margin:0 0 16px;color:${TEXT};font-size:16px;line-height:1.5;">${escapeHtml(text)}</p>`;

  const butoane = (c.butoane ?? [])
    .map(
      (b) => `
    <a href="${b.href}" style="display:inline-block;margin:8px 12px 8px 0;padding:12px 24px;
      background:${ACCENT};color:#ffffff;text-decoration:none;border-radius:4px;
      font-weight:600;font-size:15px;">${escapeHtml(b.text)}</a>`,
    )
    .join('');

  const notePicior = (c.notePicior ?? [])
    .map(
      (n) =>
        `<p style="margin:0 0 8px;color:${MUTED};font-size:14px;line-height:1.5;">${escapeHtml(n)}</p>`,
    )
    .join('');

  const butonSecundar = c.butonSecundar
    ? `<a href="${c.butonSecundar.href}" style="display:inline-block;margin:4px 0 0;padding:8px 16px;
      border:1px solid ${MUTED};color:${MUTED};text-decoration:none;border-radius:4px;
      font-weight:600;font-size:13px;">${escapeHtml(c.butonSecundar.text)}</a>`
    : '';

  return `<!doctype html>
<html lang="ro">
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
        <tr><td>
          ${p(`Salut, ${c.salut},`)}
          ${c.paragrafe.map(p).join('')}
          ${c.bilet ? BILET_HTML : ''}
          ${butoane ? `<div style="margin:24px 0;">${butoane}</div>` : ''}
          ${notePicior}
          ${butonSecundar}
          <p style="margin:24px 0 0;color:${TEXT};font-size:16px;">${escapeHtml(c.semnatura ?? 'Ciprian Micu - Deep Logic')}</p>
          <hr style="border:none;border-top:1px solid #E4E7E7;margin:32px 0 16px;" />
          <p style="margin:0;color:${MUTED};font-size:12px;line-height:1.6;">
            ${siteFooter.brand} · Satu Mare, România<br/>
            Ai primit mailul ăsta pentru că te-ai înscris la „${EVENIMENT.titlu}" pe workshop.deeplogic.ro.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
