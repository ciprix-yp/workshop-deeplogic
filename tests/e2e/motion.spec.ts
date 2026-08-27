import { test, expect } from '@playwright/test';

/**
 * Mișcarea, verificată în browser.
 *
 * Capturile forțează dezvăluirea ca să auditeze layout-ul determinist, deci
 * NU acoperă animația — testele astea o acoperă. Cel mai important e ultimul:
 * fără JS, conținutul trebuie să fie vizibil. O pagină care se bazează pe un
 * script ca să-și arate textul e o pagină care uneori nu-l arată deloc.
 */

test('elementele se dezvăluie la scroll', async ({ page }) => {
  await page.goto('/');

  const tinta = page.locator('#ce-pleci-cu-tine [data-reveal]').first();
  await expect(tinta).toHaveCSS('opacity', '0');

  await tinta.scrollIntoViewIfNeeded();
  await expect(tinta).toHaveCSS('opacity', '1', { timeout: 3000 });
});

test('dezvăluirea nu se repetă la scroll înapoi', async ({ page }) => {
  await page.goto('/');
  const tinta = page.locator('#ce-pleci-cu-tine [data-reveal]').first();

  await tinta.scrollIntoViewIfNeeded();
  await expect(tinta).toHaveCSS('opacity', '1', { timeout: 3000 });

  await page.locator('.hero').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  // Elementul rămâne dezvăluit: re-animarea la fiecare trecere e exact genul
  // de mișcare care obosește pe o pagină de 20 de ecrane.
  await expect(tinta).toHaveCSS('opacity', '1');
});

test('cu prefers-reduced-motion, totul e vizibil imediat', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');

  // Scriptul nici nu pornește, deci `.js-reveal` nu se aplică și nimic nu e
  // ascuns vreodată.
  await expect(page.locator('html')).not.toHaveClass(/js-reveal/);
  const tinta = page.locator('#ce-pleci-cu-tine [data-reveal]').first();
  await expect(tinta).toHaveCSS('opacity', '1');

  await ctx.close();
});

test('fără JavaScript, tot conținutul rămâne vizibil', async ({ browser }) => {
  // Ăsta e testul care contează. Browserul in-app din WhatsApp, pe Android
  // vechi, cu conexiune care pică — dacă starea ascunsă ar veni din CSS și
  // dezvăluirea din JS, pagina ar fi goală exact acolo unde vine traficul.
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');

  for (const sel of ['#problema .vacarm-bloc', '#ce-pleci-cu-tine article', '#rezultatul li']) {
    const el = page.locator(sel).first();
    await expect(el).toBeVisible();
    await expect(el).toHaveCSS('opacity', '1');
  }

  await ctx.close();
});

test('bara sticky apare după hero și dispare la formular', async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 360, height: 800 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto('/');

  const bara = page.locator('#cta-sticky');
  // În hero, CTA-ul e deja pe ecran — o bară fixă ar dubla același buton.
  await expect(bara).toBeHidden();

  await page.locator('#ce-facem').scrollIntoViewIfNeeded();
  await expect(bara).toBeVisible({ timeout: 3000 });

  // La formular dispare: ar acoperi exact lucrul spre care trimite.
  await page.locator('#inscriere').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(bara).toBeHidden();

  await ctx.close();
});

test('bara sticky nu apare pe desktop', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.locator('#ce-facem').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await expect(page.locator('#cta-sticky')).toBeHidden();
});
