#!/usr/bin/env node
/**
 * Verificare vizuală: screenshots pe breakpoint-uri reale + audit automat.
 *
 * Ancora e 360px, nu 375px — Android-ul tipic din care se deschide un link de
 * WhatsApp e mai îngust decât un iPhone, iar acolo se rup lucrurile întâi.
 *
 * Pe lângă capturi, verifică lucrurile care nu se văd într-un screenshot:
 * erori de consolă, scroll orizontal, ținte de atingere sub 44px, imagini
 * fără alt, ierarhie de headinguri, diacritice.
 *
 * Rulează:  node scripts/screenshots.mjs
 * Scrie:    tests/visual/__screenshots__/
 */

import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RADACINA = fileURLToPath(new URL('..', import.meta.url));
const IESIRE = join(RADACINA, 'tests/visual/__screenshots__');
const URL_BAZA = process.env.URL_BAZA ?? 'http://localhost:4321';

const ECRANE = [
  { nume: '360-android', width: 360, height: 800, mobil: true },
  { nume: '390-iphone', width: 390, height: 844, mobil: true },
  { nume: '768-tableta', width: 768, height: 1024, mobil: false },
  { nume: '1280-laptop', width: 1280, height: 900, mobil: false },
  { nume: '1920-desktop', width: 1920, height: 1080, mobil: false },
];

await mkdir(IESIRE, { recursive: true });

const browser = await chromium.launch();
const probleme = [];
const raport = [];

for (const ecran of ECRANE) {
  const ctx = await browser.newContext({
    viewport: { width: ecran.width, height: ecran.height },
    deviceScaleFactor: 2,
    isMobile: ecran.mobil,
    hasTouch: ecran.mobil,
    locale: 'ro-RO',
  });
  const page = await ctx.newPage();

  const eroriConsola = [];
  page.on('console', (m) => {
    if (m.type() === 'error') eroriConsola.push(m.text());
  });
  page.on('pageerror', (e) => eroriConsola.push(`pageerror: ${e.message}`));

  /* `networkidle` nu se atinge niciodată pe serverul de dev: websocket-ul de
     HMR ține conexiunea deschisă la nesfârșit. Așteptăm `load`, apoi explicit
     fonturile — care sunt oricum singurul asset care contează vizual aici. */
  await page.goto(URL_BAZA, { waitUntil: 'load', timeout: 30_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400); // așezarea layout-ului după swap-ul de font

  await page.screenshot({
    path: join(IESIRE, `${ecran.nume}.png`),
    fullPage: true,
  });

  /* ── Verificări care nu se văd în captură ───────────────────────────── */

  const audit = await page.evaluate(() => {
    const r = {};

    // Scroll orizontal: cel mai frecvent defect de mobil, și cel mai enervant.
    r.latimeDocument = document.documentElement.scrollWidth;
    r.latimeViewport = document.documentElement.clientWidth;

    // Ce element depășește, dacă depășește.
    r.vinovati = [];
    if (r.latimeDocument > r.latimeViewport + 1) {
      for (const el of document.querySelectorAll('*')) {
        const box = el.getBoundingClientRect();
        if (box.right > r.latimeViewport + 1 || box.left < -1) {
          r.vinovati.push(
            `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''} → ${Math.round(box.left)}…${Math.round(box.right)}px`,
          );
        }
      }
      r.vinovati = r.vinovati.slice(0, 6);
    }

    /*
     * Ținte de atingere sub 44×44 (WCAG 2.2 SC 2.5.8).
     *
     * Se măsoară ținta EFECTIVĂ, nu elementul. Un radio de 18px învelit
     * într-un <label> de 44px e o țintă de 44px — tot dreptunghiul e
     * clicabil. Iar un <label for=...> care doar denumește un câmp nu e o
     * țintă în sine; câmpul lui e măsurat separat.
     */
    r.tinteMici = [];
    const esteBifa = (el) =>
      el.tagName === 'INPUT' && (el.type === 'radio' || el.type === 'checkbox');

    for (const el of document.querySelectorAll('a, button, input, select, textarea, label')) {
      if (el.closest('footer')) continue;

      // Etichetă-titlu: nu conține control, deci nu e ținta — e denumirea ei.
      if (el.tagName === 'LABEL' && !el.querySelector('input, select, textarea')) continue;

      // Pentru bife/radio, ținta reală e eticheta care le învelește.
      const tinta = esteBifa(el) ? (el.closest('label') ?? el) : el;

      const b = tinta.getBoundingClientRect();
      if (b.width === 0 && b.height === 0) continue;
      if (b.height < 44) {
        const nume = `${tinta.tagName.toLowerCase()}${tinta.id ? '#' + tinta.id : ''}`;
        const desc = `${nume} → ${Math.round(b.width)}×${Math.round(b.height)}`;
        if (!r.tinteMici.includes(desc)) r.tinteMici.push(desc);
      }
    }
    r.tinteMici = r.tinteMici.slice(0, 8);

    /*
     * Controale interactive imbricate — clasă de defect separată, mai gravă
     * decât o țintă mică.
     *
     * Un <a> înăuntrul unui <label>: clickul navighează, dar bubble-uiește la
     * etichetă și comută controlul asociat. Utilizatorul face două lucruri
     * când voia unul — și de obicei nu observă pe al doilea.
     */
    r.interactiveImbricate = [];
    for (const el of document.querySelectorAll('a, button')) {
      const parinte = el.parentElement?.closest('label, button, a');
      if (parinte) {
        r.interactiveImbricate.push(
          `<${el.tagName.toLowerCase()}> „${el.textContent.trim().slice(0, 32)}" în <${parinte.tagName.toLowerCase()}>`,
        );
      }
    }

    // Imagini fără alt.
    r.imgFaraAlt = [...document.querySelectorAll('img')]
      .filter((i) => !i.hasAttribute('alt'))
      .map((i) => i.src);

    // Ierarhia de headinguri: un singur H1, fără salturi de nivel.
    const nivele = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) =>
      Number(h.tagName[1]),
    );
    r.numarH1 = nivele.filter((n) => n === 1).length;
    r.salturi = [];
    for (let i = 1; i < nivele.length; i++) {
      if (nivele[i] - nivele[i - 1] > 1) r.salturi.push(`h${nivele[i - 1]} → h${nivele[i]}`);
    }

    // Diacritice: sedila (ş/ţ) e forma turcească; româna cere virgula (ș/ț).
    const text = document.body.innerText;
    r.cuSedila = (text.match(/[şţŞŢ]/g) ?? []).length;
    r.cuVirgula = (text.match(/[șțȘȚ]/g) ?? []).length;

    // Câmpuri de formular fără etichetă asociată.
    r.faraEticheta = [];
    for (const c of document.querySelectorAll('input:not([type=hidden]), select, textarea')) {
      const areLabel =
        (c.id && document.querySelector(`label[for="${c.id}"]`)) ||
        c.closest('label') ||
        c.getAttribute('aria-label') ||
        c.getAttribute('aria-labelledby');
      if (!areLabel) r.faraEticheta.push(c.name || c.type);
    }

    return r;
  });

  const scrollOrizontal = audit.latimeDocument > audit.latimeViewport + 1;

  raport.push({ ecran: ecran.nume, audit, eroriConsola, scrollOrizontal });

  if (scrollOrizontal) {
    probleme.push(
      `[${ecran.nume}] scroll orizontal: ${audit.latimeDocument}px > ${audit.latimeViewport}px\n` +
        audit.vinovati.map((v) => `        ${v}`).join('\n'),
    );
  }
  if (eroriConsola.length) probleme.push(`[${ecran.nume}] erori consolă:\n        ${eroriConsola.join('\n        ')}`);
  if (audit.imgFaraAlt.length) probleme.push(`[${ecran.nume}] imagini fără alt: ${audit.imgFaraAlt.join(', ')}`);
  if (audit.numarH1 !== 1) probleme.push(`[${ecran.nume}] ${audit.numarH1} elemente H1 (așteptat: 1)`);
  if (audit.salturi.length) probleme.push(`[${ecran.nume}] salturi de nivel: ${audit.salturi.join(', ')}`);
  if (audit.cuSedila > 0) probleme.push(`[${ecran.nume}] ${audit.cuSedila} caractere cu sedilă (ş/ţ) — româna cere virgulă`);
  if (audit.faraEticheta.length) probleme.push(`[${ecran.nume}] câmpuri fără etichetă: ${audit.faraEticheta.join(', ')}`);
  if (audit.interactiveImbricate?.length)
    probleme.push(
      `[${ecran.nume}] control interactiv imbricat (clickul face două lucruri):\n        ${audit.interactiveImbricate.join('\n        ')}`,
    );
  if (ecran.mobil && audit.tinteMici.length)
    probleme.push(`[${ecran.nume}] ținte sub 44px:\n        ${audit.tinteMici.join('\n        ')}`);

  console.log(
    `  ${ecran.nume.padEnd(14)} ${String(audit.latimeDocument).padStart(5)}px doc / ${audit.latimeViewport}px vp` +
      `  · h1=${audit.numarH1} · ș/ț=${audit.cuVirgula} · erori=${eroriConsola.length}`,
  );

  await ctx.close();
}

await browser.close();
await writeFile(join(IESIRE, 'audit.json'), JSON.stringify(raport, null, 2));

console.log(`\nCapturi în tests/visual/__screenshots__/`);

if (probleme.length) {
  console.error(`\n✗ ${probleme.length} problemă(e):\n`);
  probleme.forEach((p) => console.error(`  • ${p}`));
  process.exit(1);
}
console.log('\n✓ Zero defecte pe toate breakpoint-urile.\n');
