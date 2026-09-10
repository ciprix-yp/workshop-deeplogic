import { test, expect } from '@playwright/test';

/**
 * Dialogul de înscriere (DialogInscriere.astro) — mecanica de deschidere,
 * închidere și confirmare inline. Nu trimite niciodată prin API-ul real:
 * `/api/register` e mock-uit prin `page.route()`, aceeași decizie ca restul
 * proiectului (vezi docs/PROGRES.md, F4) — un test automat care scrie în
 * Supabase la fiecare rulare ar polua producția.
 */

test('orice CTA deschide dialogul, X-ul îl închide', async ({ page }) => {
  await page.goto('/');
  const dialog = page.locator('#inscriere');
  await expect(dialog).toBeHidden();

  await page.locator('.hero .cta').click();
  await expect(dialog).toBeVisible();

  await page.locator('[data-inchide]').click();
  await expect(dialog).toBeHidden();
});

test('ESC închide dialogul', async ({ page }) => {
  await page.goto('/');
  await page.locator('.hero .cta').click();
  await expect(page.locator('#inscriere')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('#inscriere')).toBeHidden();
});

test('click pe backdrop închide dialogul', async ({ page }) => {
  await page.goto('/');
  await page.locator('.hero .cta').click();
  const dialog = page.locator('#inscriere');
  await expect(dialog).toBeVisible();

  // Click ÎN AFARA cutiei dialogului (pe `::backdrop`) — `.dialog-inscriere`
  // are `padding: 0`, deci orice punct ÎN interiorul cutiei (chiar și la 2px
  // de colț) cade pe `.continut`, nu pe `<dialog>` însuși. Ținta corectă e
  // la câțiva pixeli ÎNAINTE de marginea stângă — sigur pe backdrop, cât timp
  // dialogul e centrat cu spațiu în jur (mereu adevărat sub 100vw lățime).
  // Așteaptă SFÂRȘITUL animației de deschidere înainte de a măsura (220ms,
  // `scale` + `opacity` — vezi `@starting-style` din DialogInscriere.astro).
  // Cursă reală, găsită pe 2026-09-10: `boundingBox()` luat în timpul animației
  // întoarce cutia dialogului la scară intermediară, deci `box.x - 5` putea
  // cădea ÎN interiorul dialogului final, pe `.continut`, care nu închide
  // nimic. Testul trecea „de obicei"; când conținutul formularului a crescut
  // până la plafonul de `max-height: min(90dvh, 52rem)`, a început să pice
  // determinist. Aceeași clasă de capcană ca la butonul flotant (CLAUDE.md §1).
  await expect(dialog).toHaveCSS('opacity', '1');

  const box = await dialog.boundingBox();
  if (!box) throw new Error('dialogul nu are boundingBox — nu e vizibil');
  await page.mouse.click(Math.max(2, box.x - 5), box.y + 10);
  await expect(dialog).toBeHidden();
});

test('al doilea CTA (finalul Rezultatul) deschide același dialog', async ({ page }) => {
  // Pivot de structură (2026-09-02): §05 InainteDupa a fost retras. Al
  // doilea repetaj de CTA e acum la finalul secțiunii Rezultatul.
  await page.goto('/');
  await page.locator('#rezultatul .cta').click();
  await expect(page.locator('#inscriere')).toBeVisible();
});

test('submit reușit arată confirmarea ÎN dialog, fără navigare', async ({ page }) => {
  await page.route('**/api/register', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, redirect: '/multumesc', stare: 'inscris' }),
    }),
  );

  await page.goto('/');
  const urlInainte = page.url();
  await page.locator('.hero .cta').click();

  const dialog = page.locator('#inscriere');
  await expect(dialog).toBeVisible();

  // Nu completăm formularul real (validarea e testată separat, în
  // formular.spec.ts) — mock-ul răspunde `ok:true` indiferent de conținut,
  // exact cât ne trebuie ca să verificăm SCHIMBUL de ecran în dialog.
  await page.locator('#form-inscriere').evaluate((f: HTMLFormElement) => f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));

  await expect(page.locator('[data-pas="confirmare"]')).toBeVisible();
  await expect(page.locator('[data-pas="formular"]')).toBeHidden();
  await expect(page.locator('#dialog-titlu')).toHaveText('Gata. Locul e al tău.');
  expect(page.url()).toBe(urlInainte);
  await expect(dialog).toBeVisible();

  // „Adaugă în calendar" (2026-09-09) — vizibil pentru `stare: 'inscris'`,
  // link corect către .ics-ul generat static. Verifică și culoarea reală a
  // corpului: bug real găsit aici — `.confirmare-corp p`/`.link-calendar`
  // sunt create din JS, fără atributul de scope al Astro, deci selectoarele
  // scopate normal (fără `:global()`) nu se aplicau NICIODATĂ — randau negru
  // implicit, nu `--secundar`. `toHaveCSS` prinde regresia dacă cineva scoate
  // `:global()` la o corectură viitoare.
  const linkCalendar = page.locator('[data-pas="confirmare"] .link-calendar');
  await expect(linkCalendar).toBeVisible();
  await expect(linkCalendar).toHaveAttribute('href', '/eveniment.ics');
  await expect(page.locator('.confirmare-corp p').first()).toHaveCSS('color', 'rgb(47, 79, 79)');
});

test('submit cu erori le arată inline, dialogul rămâne deschis', async ({ page }) => {
  await page.route('**/api/register', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, erori: { email: 'Adresa nu pare validă.' } }),
    }),
  );

  await page.goto('/');
  await page.locator('.hero .cta').click();
  await page.locator('#form-inscriere').evaluate((f: HTMLFormElement) => f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));

  await expect(page.locator('#email-eroare')).toHaveText('Adresa nu pare validă.');
  await expect(page.locator('#inscriere')).toBeVisible();
  await expect(page.locator('[data-pas="formular"]')).toBeVisible();
});
