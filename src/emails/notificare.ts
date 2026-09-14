/**
 * Notificarea către ORGANIZATOR la fiecare înscriere — cerută explicit
 * (2026-09-11): „vreau să îmi trimiți mail și mie pentru fiecare înscriere".
 *
 * Deliberat separată de `render.ts`: emailurile de-acolo au subsolul
 * „ai primit mailul ăsta pentru că te-ai înscris la…", corect pentru
 * participanți și absurd pentru un email intern. Aici contează densitatea de
 * informație, nu tonul.
 *
 * Include răspunsurile de calificare, nu doar numele: formularul există exact
 * ca să se pregătească materialul („Le folosesc ca să construiesc workshopul
 * pentru sala care vine efectiv" — `copy.ts`, legenda blocului). Cu ele în
 * email, pregătirea se poate face incremental, fără interogat baza.
 */

import type { InscriereCompleta } from '../lib/supabase';
import type { EmailGata } from './templates';

const ETICHETE: Record<string, string> = {
  asteptari: 'Cu ce vrea să plece',
  frica_principala: 'Ce-l oprește',
  provocare_business: 'Problema de rezolvat',
  provocare_business_altceva: 'Altceva (text liber)',
  blocaj_istoric: 'Ce l-a ținut pe loc',
  interes_incompany: 'Workshop in-company',
};

/** Lățimea coloanei de etichete în versiunea text — cea mai lungă e
 *  „Procesul care-i ia timp" (23). Sub atât, valorile ies nealiniate. */
const COLOANA = 23;

function valoare(v: unknown): string {
  if (v == null || v === '') return '—';
  if (Array.isArray(v)) return v.length ? v.map((x) => `• ${x}`).join('\n' + ' '.repeat(COLOANA + 1)) : '—';
  return String(v);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function emailNotificareInscriere(d: InscriereCompleta): EmailGata {
  const peListaDeAsteptare = d.status === 'asteptare';
  const ora = new Date(d.creat).toLocaleString('ro-RO', {
    timeZone: 'Europe/Bucharest',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  const randuri: [string, string][] = [
    ['Nume', d.nume],
    ['Email', d.email],
    ['Firmă / rol', valoare(d.firma_rol)],
    ['Status', peListaDeAsteptare ? 'LISTĂ DE AȘTEPTARE' : 'înscris'],
    ['Înscris la', ora],
    ['Cum a aflat', d.sursa_detaliu ? `${valoare(d.sursa)} — ${d.sursa_detaliu}` : valoare(d.sursa)],
    ['Folosește AI azi', valoare(d.nivel_ai)],
    ['Procesul care-i ia timp', valoare(d.proces)],
  ];

  for (const [cheie, eticheta] of Object.entries(ETICHETE)) {
    const v = d.qualification_answers[cheie];
    if (v == null || (Array.isArray(v) && v.length === 0)) continue;
    randuri.push([eticheta, valoare(v)]);
  }

  randuri.push(['Vrea discuție separată', d.vrea_discutie ? 'DA — te caută pe tine' : 'nu']);

  const text = randuri.map(([k, v]) => `${k.padEnd(COLOANA)} ${v}`).join('\n');

  const html = `<!doctype html>
<html lang="ro">
<body style="margin:0;padding:24px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#2A3439;">
  <p style="margin:0 0 4px;font-size:18px;font-weight:700;">${escapeHtml(d.nume)}</p>
  <p style="margin:0 0 20px;font-size:14px;color:#5A6B6B;">
    ${peListaDeAsteptare ? 'Listă de așteptare' : 'Înscriere nouă'} · ${escapeHtml(ora)}
  </p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;border-collapse:collapse;font-size:15px;">
    ${randuri
      .map(
        ([k, v]) => `<tr>
      <td style="padding:7px 14px 7px 0;vertical-align:top;color:#5A6B6B;white-space:nowrap;border-bottom:1px solid #EAEFEE;">${escapeHtml(k)}</td>
      <td style="padding:7px 0;vertical-align:top;border-bottom:1px solid #EAEFEE;white-space:pre-line;">${escapeHtml(v)}</td>
    </tr>`,
      )
      .join('\n    ')}
  </table>
</body>
</html>`;

  return {
    subject: `${peListaDeAsteptare ? 'Listă de așteptare' : 'Înscriere nouă'}: ${d.nume}${
      d.firma_rol ? ` (${d.firma_rol})` : ''
    }`,
    text,
    html,
  };
}
