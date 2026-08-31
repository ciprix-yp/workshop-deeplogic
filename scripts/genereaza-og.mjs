/**
 * Capturează src/pages/og-card.astro la 1200×630 și scrie
 * public/og-workshop-16-09.png. Rulează manual, nu la fiecare build — cardul
 * se schimbă doar când se schimbă titlul/data evenimentului.
 *
 *   npm run dev &   (serverul trebuie să ruleze pe :4321)
 *   node scripts/genereaza-og.mjs
 */
import { chromium } from 'playwright';
import { writeFileSync, statSync } from 'node:fs';

const urlSursa = process.env.URL_OG ?? 'http://localhost:4321/og-card';
const IESIRE = new URL('../public/og-workshop-16-09.png', import.meta.url);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.goto(urlSursa, { waitUntil: 'networkidle' });

// `astro dev` injectează `<astro-dev-toolbar>` (pilula cu iconițe din
// colțul de jos) în FIECARE pagină — nu există în producție, dar strică o
// captură luată împotriva serverului de dezvoltare. Eliminat din DOM
// înainte de screenshot, nu doar ascuns — un `display:none` tot ar ocupa
// timp de layout dacă elementul are animații proprii.
await page.evaluate(() => {
  document.querySelector('astro-dev-toolbar')?.remove();
});

const buffer = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
writeFileSync(IESIRE, buffer);
await browser.close();

const { size } = statSync(IESIRE);
console.log(`Scris ${IESIRE.pathname} — ${(size / 1024).toFixed(1)} KB`);
if (size > 300 * 1024) {
  console.error('✗ Peste 300KB — WhatsApp nu-l randează inline. Recomprimă.');
  process.exit(1);
}
console.log('✓ Sub 300KB.');
