import { test, expect } from '@playwright/test';
import { EVENIMENT, CTA, stari, footer } from '../../src/content/copy';

/**
 * Înscrierile închise (D119, 2026-10-05). După ediția din 16.09, pagina nu mai
 * invită la un eveniment trecut și nu mai strânge date personale fără scop.
 * Oglinda testelor de landing: rulează doar cât comutatorul e pe `false`.
 */
test.skip(EVENIMENT.inscrieriDeschise, 'înscrierile sunt deschise: landing-ul are propriile teste');

const ORIGINE = process.env.URL_BAZA ?? 'http://localhost:4321';

test('pagina principală spune că înscrierile s-au închis, fără formular, CTA sau bară de locuri', async ({ page }) => {
  const cereriLocuri: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/api/locuri-disponibile')) cereriLocuri.push(r.url());
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(stari.inscrieriInchise.titlu);
  await expect(page.getByText(stari.inscrieriInchise.corp[0] ?? '')).toBeVisible();
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.getByText(CTA.text)).toHaveCount(0);
  await expect(page.locator('[data-sitekey]')).toHaveCount(0);
  // Linkul „înapoi” ar duce la aceeași pagină.
  await expect(page.getByText('Înapoi la pagina workshopului')).toHaveCount(0);
  expect(cereriLocuri).toHaveLength(0);

  // Paginile legale rămân la un click: instrumentul de autoevaluare trimite la ele.
  for (const l of footer.legal) {
    await expect(page.getByRole('link', { name: l.text })).toHaveAttribute('href', l.href);
  }

  const latimi = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(latimi[0]).toBeLessThanOrEqual(latimi[1] ?? 0);
});

test('/api/register refuză cu 410 și mesajul de închidere, pentru clientul cu JS', async ({ request }) => {
  const r = await request.post('/api/register', {
    headers: { Accept: 'application/json', Origin: ORIGINE },
    form: { email: 'test@example.com', nume: 'Test' },
  });
  expect(r.status()).toBe(410);
  const corp = (await r.json()) as { ok: boolean; mesaj: string };
  expect(corp.ok).toBe(false);
  expect(corp.mesaj).toContain(stari.inscrieriInchise.titlu);
});

test('fără JS, un submit ajunge pe /rezultat, care spune că înscrierile s-au închis', async ({ request, page }) => {
  const r = await request.post('/api/register', {
    headers: { Origin: ORIGINE },
    form: { email: 'test@example.com', nume: 'Test' },
    maxRedirects: 0,
  });
  expect(r.status()).toBe(303);
  expect(r.headers()['location']).toBe('/rezultat?stare=inscrieriInchise');

  await page.goto('/rezultat?stare=inscrieriInchise');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(stari.inscrieriInchise.titlu);
});
