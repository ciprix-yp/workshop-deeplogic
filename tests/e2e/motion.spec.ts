import { test, expect } from '@playwright/test';

/**
 * Mișcarea, verificată în browser.
 *
 * Pivot de arhitectură (2026-09-01, Ciprian): motorul de scroll custom
 * (MotionEngine.astro + storyboard.json, opt de scene) a fost retras în
 * favoarea Lenis + GSAP ScrollTrigger — folosit STRICT în §06 CeFacem (cei
 * cinci pași ai metodologiei), singurul pin/scrub de pe pagină.
 *
 * Pivot ulterior (2026-09-02, „carduri 3D" + accente): restul paginii NU mai
 * e static prin construcție — există un reveal la scroll (fade + ridicare,
 * vanilla, fără GSAP) pe fiecare `<Sectiune>` cu `reveal` implicit `true`,
 * plus tilt 3D la cursor pe cardurile cu profunzime. Ambele opt-in prin
 * `depth` (Base.astro), niciodată vizibile fără JS — vezi tokens.css
 * `[data-reveal]`/`.card-3d`.
 *
 * Cel mai important test rămâne cel fără JS: o pagină care se bazează pe un
 * script ca să-și arate textul e o pagină care uneori nu-l arată deloc.
 */

test('fără JavaScript, tot conținutul rămâne vizibil', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');

  for (const sel of ['#problema .exemple li', '#agravare p', '#rezultatul li', '#ce-facem .bloc']) {
    const el = page.locator(sel).first();
    await expect(el).toBeVisible();
    await expect(el).toHaveCSS('opacity', '1');
  }

  await ctx.close();
});

test('fără JavaScript, formularul rămâne un bloc normal în flux, nu un dialog închis', async ({ browser }) => {
  // DialogInscriere.astro randează `<dialog open>` static pe server. Fără JS
  // ca să cheme `.close()`, browserul îl arată exact ca un bloc obișnuit —
  // niciun `showModal()`, niciun backdrop, niciun element ascuns. Un
  // formular care are nevoie de JS ca să existe e un formular care pierde
  // înscrieri fără să știi.
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');

  const dialog = page.locator('#inscriere');
  await dialog.scrollIntoViewIfNeeded();
  await expect(dialog).toBeVisible();
  await expect(page.locator('#form-inscriere')).toBeVisible();
  await expect(page.locator('#form-inscriere')).toHaveAttribute('action', '/api/register');
  await expect(page.locator('#form-inscriere')).toHaveAttribute('method', 'POST');
  // NU verificăm `.cf-turnstile` vizibil — widget-ul e randat de scriptul
  // Cloudflare (api.js), inaccesibil fără JS prin definiție.
  await expect(page.locator('input[name="nume"]')).toBeVisible();
  await expect(page.locator('button.cta-submit')).toBeVisible();

  await ctx.close();
});

test('§06: pașii metodologiei se dezvăluie prin pin/scrub GSAP', async ({ page }) => {
  await page.goto('/');
  const ultimulPas = page.locator('#ce-facem [data-pas]').last();

  // Scroll incremental de la vârful paginii — mai robust decât
  // `scrollIntoViewIfNeeded()`, care poate sări direct peste punctul de
  // start al pin-ului în funcție de înălțimea viewport-ului (confirmat: pe
  // desktop, jump-ul direct ateriza deja după reveal complet). Urmărim
  // traiectoria opacității ultimului pas de-a lungul scroll-ului: trebuie
  // să existe un punct jos (dovadă că `gsap.set(opacity:0)` chiar rulează,
  // nu doar există în cod) urmat de o revenire la 1 (dovadă că scrub-ul
  // chiar avansează, nu rămâne blocat).
  // Apropiere rapidă mai întâi (pagina stivuită pe mobil e mult mai înaltă
  // decât pe desktop — 60 de pași de 200px nu ajungeau mereu la secțiune),
  // apoi urmărirea fină prin scroll incremental, de-aici încolo.
  await page.locator('#ce-facem').scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, -600); // înapoi puțin, să prindem și punctul de start al pin-ului

  const opacitati: number[] = [];
  for (let i = 0; i < 60; i++) {
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(30);
    if (await ultimulPas.count()) {
      opacitati.push(parseFloat(await ultimulPas.evaluate((n) => getComputedStyle(n).opacity)));
    }
  }

  expect(Math.min(...opacitati), `traiectorie opacitate: ${opacitati.join(',')}`).toBeLessThan(0.5);
  expect(opacitati.at(-1)).toBeGreaterThan(0.95);
});

test('cu prefers-reduced-motion, pașii metodologiei sunt vizibili direct, fără pin', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');

  const pasi = page.locator('#ce-facem [data-pas]');
  await page.locator('#ce-facem').scrollIntoViewIfNeeded();
  // Guard-ul din S06CeFacem.astro: cu mișcare redusă, `gsap.set`/pin nu
  // rulează deloc — pașii rămân la starea lor naturală din CSS.
  await expect(pasi.first()).toHaveCSS('opacity', '1');
  await expect(pasi.last()).toHaveCSS('opacity', '1');

  await ctx.close();
});

test('butonul CTA flotant apare după hero și dispare la formular — pe mobil', async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 360, height: 800 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto('/');

  const buton = page.locator('#cta-floating');
  // În hero, CTA-ul e deja pe ecran — un buton flotant ar dubla același buton.
  await expect(buton).toBeHidden();

  await page.locator('#ce-facem').scrollIntoViewIfNeeded();
  await expect(buton).toBeVisible({ timeout: 3000 });

  // La chemarea finală dispare: ar dubla exact CTA-ul de-acolo.
  await page.locator('#inscriere-cta').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(buton).toBeHidden();

  await ctx.close();
});

test('butonul CTA flotant apare și pe desktop (pivot 2026-09-02 — nu mai e doar-mobil)', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 1280, height: 900 });

  const buton = page.locator('#cta-floating');
  await expect(buton).toBeHidden();

  await page.locator('#ce-facem').scrollIntoViewIfNeeded();
  await expect(buton).toBeVisible({ timeout: 3000 });

  await page.locator('#inscriere-cta').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(buton).toBeHidden();
});
