import { test, expect } from '@playwright/test';

/**
 * BaraScarcity.astro — bara fixă de locuri + countdown (reversare deliberată
 * a interdicției vechi, 2026-08-31). Regula care rămâne: „fără deficit fals;
 * afișează doar date reale" — niciun test de-aici nu verifică un NUMĂR
 * inventat, ci exact comportamentul care garantează asta: fallback static
 * fără JS, date reale (mock-uite prin `page.route()`) cu JS.
 */

test('fără JavaScript, bara arată fallback-ul static, fără niciun număr de locuri', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');

  const bara = page.locator('#bara-scarcity');
  await expect(bara).toBeVisible();
  await expect(bara).toContainText('Maximum 30 de locuri');
  const text = await bara.textContent();
  expect(text ?? '').not.toMatch(/\d+ locuri disponibile din/);

  await ctx.close();
});

test('cu JS, bara citește /api/locuri-disponibile și arată numărul real', async ({ page }) => {
  await page.route('**/api/locuri-disponibile', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ramase: 12, maxime: 30 }),
    }),
  );

  await page.goto('/');
  const bara = page.locator('#bara-scarcity');
  await expect(bara).toContainText('12 locuri disponibile din 30', { timeout: 3000 });
});

test('la 0 locuri, bara arată mesajul de listă de așteptare, nu „0 locuri disponibile"', async ({ page }) => {
  await page.route('**/api/locuri-disponibile', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ramase: 0, maxime: 30 }),
    }),
  );

  await page.goto('/');
  const bara = page.locator('#bara-scarcity');
  await expect(bara).toContainText('lista de așteptare', { timeout: 3000 });
});

test('insigna de pe CTA se completează cu numărul real, doar după răspunsul API', async ({ page }) => {
  await page.route('**/api/locuri-disponibile', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ramase: 7, maxime: 30 }),
    }),
  );

  await page.goto('/');
  // Ascunsă implicit (fără atribut `hidden`, badge-ul ar apărea gol o clipă
  // la fiecare încărcare) — dar mock-ul rezolvă prea rapid ca să prindem
  // starea intermediară în mod fiabil; starea inițială e verificată separat,
  // în testul „fără JS"/„fetch eșuat" de mai jos. Aici verificăm STAREA
  // FINALĂ: vizibilă, cu numărul real din mock, nu unul inventat.
  const insigna = page.locator('.hero [data-locuri-cta]');
  // Format „Disponibil X/Y" — pivot 2026-09-02 (cerut explicit sub CTA).
  await expect(insigna).toContainText('Disponibil 7/30', { timeout: 3000 });
  await expect(insigna).toBeVisible();
});

test('dacă fetch-ul eșuează, CTA-ul rămâne exact „Rezervă-ți locul", fără insignă', async ({ page }) => {
  await page.route('**/api/locuri-disponibile', (route) => route.abort());

  await page.goto('/');
  await page.waitForTimeout(500);

  const cta = page.locator('.hero .cta');
  await expect(cta).toContainText('Rezervă-ți locul');
  await expect(page.locator('.hero [data-locuri-cta]')).toBeHidden();
});

test('numărul de locuri apare și în dialogul de înscriere, conectat la aceeași sursă ca bara', async ({ page }) => {
  await page.route('**/api/locuri-disponibile', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ramase: 4, maxime: 30 }),
    }),
  );

  await page.goto('/');
  await page.locator('.hero .cta').click();

  const rand = page.locator('#inscriere [data-locuri-live]');
  await expect(rand).toContainText('Mai sunt 4 locuri disponibile din 30.', { timeout: 3000 });
  await expect(rand).toBeVisible();

  // Aceeași cifră ca bara de sus — o singură sursă de adevăr, nu două
  // fetch-uri care ar putea, o clipă, arăta numere diferite.
  await expect(page.locator('#bara-scarcity')).toContainText('4 locuri disponibile din 30');
});

test('la 0 locuri, rândul din dialog arată mesajul de listă de așteptare, nu „0 locuri disponibile"', async ({ page }) => {
  await page.route('**/api/locuri-disponibile', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ramase: 0, maxime: 30 }),
    }),
  );

  await page.goto('/');
  await page.locator('.hero .cta').click();

  const rand = page.locator('#inscriere [data-locuri-live]');
  await expect(rand).toContainText('lista de așteptare', { timeout: 3000 });
});

test('dacă fetch-ul eșuează, rândul de locuri din dialog rămâne ascuns, nu un număr ghicit', async ({ page }) => {
  await page.route('**/api/locuri-disponibile', (route) => route.abort());

  await page.goto('/');
  await page.locator('.hero .cta').click();
  await page.waitForTimeout(500);

  await expect(page.locator('#inscriere [data-locuri-live]')).toBeHidden();
});

test('numărul se reîmprospătează periodic, nu doar la încărcare — nu rămâne înghețat pe durata vizitei', async ({ page }) => {
  // Fix pentru un defect real de audit (impeccable critique, 2026-09-01): un
  // singur fetch la load înseamnă că cineva care ține pagina deschisă în timp
  // ce se mai înscriu oameni vede un număr vechi la nesfârșit. Verificăm că
  // bara chiar cere din nou datele — nu doar că bifează un `setInterval` care
  // n-ar face nimic vizibil.
  // Pe timp, nu pe numărul de apeluri: unele browsere/medii pot declanșa mai
  // mult de un request la încărcare (prefetch, HMR etc.), deci un contor de
  // apeluri e fragil. Ce contează e proprietatea reală: valoarea AFIȘATĂ se
  // schimbă după ~20s, fără nicio acțiune a vizitatorului — dovadă că bara
  // chiar reface fetch-ul, nu doar setează un `setInterval` decorativ.
  let apeluri = 0;
  const start = Date.now();
  await page.route('**/api/locuri-disponibile', (route) => {
    apeluri += 1;
    const vechi = Date.now() - start < 10000;
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ramase: vechi ? 20 : 5, maxime: 30 }),
    });
  });

  await page.goto('/');
  await expect(page.locator('#bara-scarcity')).toContainText('20 locuri disponibile din 30', { timeout: 3000 });

  await page.waitForTimeout(21000);
  await expect(page.locator('#bara-scarcity')).toContainText('5 locuri disponibile din 30');
  expect(apeluri).toBeGreaterThanOrEqual(2);
});
