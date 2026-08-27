#!/usr/bin/env node
/**
 * Capturi pe secțiune, la scară lizibilă.
 *
 * Captura full-page a paginii are ~38.000px la 360px lățime — redusă ca să
 * încapă, nu se mai poate judeca nimic din ea. Astea sunt capturi per secțiune,
 * la dimensiunea reală, pentru evaluare vizuală efectivă.
 *
 *   node scripts/sectiuni.mjs [360|1280] [id-sectiune]
 */

import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RADACINA = fileURLToPath(new URL('..', import.meta.url));
const IESIRE = join(RADACINA, 'tests/visual/__screenshots__/sectiuni');
const URL_BAZA = process.env.URL_BAZA ?? 'http://localhost:4321';

const latime = Number(process.argv[2] ?? 360);
const doarUna = process.argv[3];

const SECTIUNI = [
  'hero',
  'problema',
  'rezultatul',
  'pentru-cine',
  'inainte-dupa',
  'ce-facem',
  'nu-doar-teorie',
  'ce-pleci-cu-tine',
  'use-cases',
  'deep-logic',
  'facilitator',
  'precedent',
  'detalii',
  'de-ce-gratuit',
  'intrebari',
  'inscriere',
  'footer',
];

await mkdir(IESIRE, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: latime, height: 900 },
  deviceScaleFactor: 2,
  isMobile: latime < 700,
  hasTouch: latime < 700,
  locale: 'ro-RO',
});
const page = await ctx.newPage();
await page.goto(URL_BAZA, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

for (const id of SECTIUNI) {
  if (doarUna && id !== doarUna) continue;
  const el =
    (await page.$(`#${id}`)) ??
    (id === 'hero' ? await page.$('header.hero') : null) ??
    (id === 'footer' ? await page.$('footer') : null);
  if (!el) {
    console.log(`  (lipsă) ${id}`);
    continue;
  }
  const box = await el.boundingBox();
  await el.screenshot({ path: join(IESIRE, `${latime}-${id}.png`) });
  console.log(`  ${String(latime).padStart(4)}-${id.padEnd(18)} ${Math.round(box.height)}px`);
}

await browser.close();
console.log(`\n→ ${IESIRE}\n`);
