import { test, expect } from '@playwright/test';

/**
 * Comportamentul formularului, în browser.
 *
 * Testele de invarianți verifică textul, cele de bază de date verifică starea.
 * Nimic din ele n-ar fi prins că un câmp condiționat rămâne vizibil pentru că
 * `display: grid` din CSS-ul componentei învinge `[hidden]`. Doar un browser
 * real vede asta.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Formularul trăiește într-un <dialog> (DialogInscriere.astro), închis
  // implicit — orice CTA îl deschide. Cel din hero e mereu pe ecran la
  // scroll 0, deci e ținta cea mai directă pentru teste.
  await page.locator('.hero .cta').click();
  await expect(page.locator('#inscriere')).toBeVisible();
});

test('câmpul condiționat e ascuns până când sursa îl cere', async ({ page }) => {
  const wrap = page.locator('#camp-sursa-detaliu');
  const input = page.locator('#sursa_detaliu');

  await expect(wrap).toBeHidden();

  await page.selectOption('#sursa', 'Am primit invitația de la un membru BIZZ.CLUB');
  await expect(wrap).toBeVisible();
  await expect(page.locator('#eticheta-sursa-detaliu')).toHaveText('De la cine?');
  // Devine obligatoriu doar când e vizibil — altfel un câmp ascuns blochează
  // submit-ul fără ca omul să vadă vreodată ce l-a oprit.
  await expect(input).toHaveAttribute('required', '');

  await page.selectOption('#sursa', 'Altfel');
  await expect(wrap).toBeVisible();
  await expect(page.locator('#eticheta-sursa-detaliu')).toHaveText('Cum ai aflat?');

  await page.selectOption('#sursa', 'Sunt membru DRW');
  await expect(wrap).toBeHidden();
  await expect(input).not.toHaveAttribute('required', '');
});

test('valoarea câmpului condiționat se golește când devine irelevantă', async ({ page }) => {
  await page.selectOption('#sursa', 'Altfel');
  await page.fill('#sursa_detaliu', 'De pe LinkedIn');
  await page.selectOption('#sursa', 'Sunt membru DRW');
  // Altfel s-ar trimite un detaliu care nu mai corespunde sursei alese.
  await expect(page.locator('#sursa_detaliu')).toHaveValue('');
});

test('linkul către politică nu comută bifa de consimțământ', async ({ page }) => {
  // Un <a> înăuntrul unui <label> ar face ambele lucruri dintr-un singur tap:
  // omul își schimbă consimțământul încercând să citească ce semnează.
  const bifa = page.locator('input[name="consimtamant_comunicare"]');
  await expect(bifa).not.toBeChecked();

  // Restrâns la formular: footer-ul are propriul link către aceeași pagină.
  const link = page.locator('#form-inscriere a[href="/confidentialitate"]');
  await expect(link).toBeVisible();
  // Linkul nu are voie să aibă un <label> printre strămoși.
  await expect(link.locator('xpath=ancestor::label')).toHaveCount(0);

  // Și dovada comportamentală: un click pe link lasă bifa neatinsă.
  await link.click({ modifiers: ['Alt'] }).catch(() => {});
  await expect(bifa).not.toBeChecked();
});

test('eticheta bifei comută bifa (zona de click e tot rândul)', async ({ page }) => {
  const bifa = page.locator('input[name="vrea_discutie"]');
  await expect(bifa).not.toBeChecked();
  await page.getByText('Vreau o discuție despre procesele mele').click();
  await expect(bifa).toBeChecked();
});

test('formularul are exact o bifă obligatorie', async ({ page }) => {
  const obligatorii = page.locator('#form-inscriere input[type="checkbox"][required]');
  await expect(obligatorii).toHaveCount(1);
  await expect(obligatorii).toHaveAttribute('name', 'consimtamant_comunicare');
});

test('toate întrebările de calificare au răspunsuri predefinite', async ({ page }) => {
  // Decizia D4: radio, nu text liber. Un câmp de text în plus pe mobil, într-un
  // formular deja lung, costă înscrieri.
  for (const nume of ['nivel_ai', 'q1_unealta', 'q2_blocaj', 'q3_domeniu', 'q4_pregatire', 'q5_anvergura']) {
    const optiuni = page.locator(`input[type="radio"][name="${nume}"]`);
    expect(await optiuni.count(), `${nume} trebuie să aibă opțiuni radio`).toBeGreaterThan(1);
  }
  // Un singur textarea pe tot formularul: „ce proces îți mănâncă timpul".
  await expect(page.locator('#form-inscriere textarea')).toHaveCount(1);
});

test('nu cere telefon, cifră de afaceri sau număr de angajați', async ({ page }) => {
  // Toate trei semnalează „urmează un apel de vânzare" către exact cititorul
  // care nu-l cunoaște încă pe Ciprian.
  const html = (await page.locator('#form-inscriere').innerHTML()).toLowerCase();
  expect(html).not.toMatch(/telefon|mobil"/);
  expect(html).not.toMatch(/cifr[ăa] de afaceri/);
  expect(html).not.toMatch(/num[ăa]r de angajați|c[âa]ți angajați/);
  await expect(page.locator('input[type="tel"]')).toHaveCount(0);
});

test('câmpurile de text au minim 16px — altfel iOS face zoom la focus', async ({ page }) => {
  // Zoom-ul automat din Safari mută layout-ul sub deget. Pe un formular deschis
  // din WhatsApp, e dezorientant fix în momentul completării.
  for (const sel of ['#nume', '#email', '#firma_rol', '#proces']) {
    const px = await page.locator(sel).evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(px, `${sel} are ${px}px`).toBeGreaterThanOrEqual(16);
  }
});
