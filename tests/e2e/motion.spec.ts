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

/**
 * Tilt 3D pe carduri — decizie explicită (Ciprian, 28 august), împotriva
 * recomandării inițiale de restrângere. Verificat aici ca regresia să nu
 * depindă de memorie: tilt-ul chiar mișcă, revine curat la ieșire, și nu
 * intră în conflict cu tranziția de 560ms a dezvăluirii la scroll (cele
 * două trăiesc pe elemente DOM separate — `.zona`/`.bloc` cu data-reveal,
 * `.zona-tilt`/`.bloc-tilt` cu data-tilt — vezi comentariul din
 * S09UseCases.astro pentru motiv).
 */
test('cardurile cu tilt răspund la cursor și revin curat la ieșire', async ({ browser }) => {
  // Context explicit, non-touch: proiectul `mobil-360` rulează pe profilul
  // Pixel 5 (`hasTouch: true`), unde scriptul de tilt NU se atașează deloc —
  // pe bună dreptate, e ghidul `(hover:hover) and (pointer:fine)` din
  // Base.astro. Testul ăsta verifică ramura cu mouse real, nu touch.
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, hasTouch: false });
  const page = await ctx.newPage();
  await page.goto('/');
  const card = page.locator('#use-cases [data-tilt]').first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveCSS('transform', 'none');

  const box = await card.boundingBox();
  if (!box) throw new Error('cardul nu are boundingBox — nu poate fi vizibil');
  await page.mouse.move(box.x + box.width * 0.15, box.y + box.height * 0.15);
  await page.waitForTimeout(250);
  await expect(card).not.toHaveCSS('transform', 'none');

  await page.mouse.move(5, 5);
  await page.waitForTimeout(250);
  await expect(card).toHaveCSS('transform', 'none');

  await ctx.close();
});

/**
 * Pe touch, tilt-ul se activează SCURT, la apăsare — nu urmărește degetul
 * continuu (asta ar cere `touchmove` cu `preventDefault`, care ar bloca
 * scroll-ul paginii). Verificat cu evenimente touch reale, prin CDP, nu
 * `locator.tap()` — acela trimite touchstart+touchend prea rapid ca să
 * apuci starea DIN TIMPUL atingerii, exact ce trebuie dovedit aici.
 */
test('pe touch, tilt-ul răspunde scurt la apăsare și revine curat la ridicarea degetului', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const erori: string[] = [];
  page.on('pageerror', (e) => erori.push(e.message));

  await page.goto('/');
  const card = page.locator('#use-cases [data-tilt]').first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveCSS('transform', 'none');

  const box = await card.boundingBox();
  if (!box) throw new Error('cardul nu are boundingBox — nu poate fi vizibil');
  const x = box.x + box.width * 0.15;
  const y = box.y + box.height * 0.15;

  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y }],
  });
  await page.waitForTimeout(150);
  await expect(card).not.toHaveCSS('transform', 'none');

  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(150);
  await expect(card).toHaveCSS('transform', 'none');

  expect(erori).toEqual([]);
  await ctx.close();
});
