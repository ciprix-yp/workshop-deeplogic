import { test, expect } from '@playwright/test';

/**
 * B2 — GET nu mută nicio stare, pe /raspuns și /checkin.
 *
 * Verificat live (manual, contra Supabase real) în aceeași sesiune: 5 cereri
 * GET, inclusiv cu user-agent Outlook Safe Links, n-au schimbat statusul unei
 * înscrieri reale. Testul ăsta prinde regresia opusă — dacă cineva adaugă
 * vreodată un auto-submit sau un `fetch()` la încărcarea paginii, intercepția
 * de rețea de mai jos pică, fără nevoie de bază de date conectată.
 */

test('GET /raspuns nu declanșează niciun request către /api/raspuns', async ({ page }) => {
  const ceruriMutante: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/api/raspuns')) ceruriMutante.push(r.method());
  });

  await page.goto('/raspuns?token=orice-token-de-test&r=nu');

  // Pagina trebuie să randeze butonul explicit, nu să fi acționat deja.
  await expect(page.getByRole('button', { name: /anulează locul/i })).toBeVisible();
  expect(ceruriMutante).toEqual([]);
});

test('GET /checkin nu declanșează niciun request către /api/checkin', async ({ page }) => {
  const ceruriMutante: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/api/checkin')) ceruriMutante.push(r.method());
  });

  await page.goto('/checkin?token=orice-token-de-test');

  await expect(page.getByRole('button', { name: /sunt aici/i })).toBeVisible();
  expect(ceruriMutante).toEqual([]);
});

test('GET /pastreaza-datele nu declanșează niciun request către /api/pastreaza-datele', async ({ page }) => {
  const ceruriMutante: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/api/pastreaza-datele')) ceruriMutante.push(r.method());
  });

  await page.goto('/pastreaza-datele?token=orice-token-de-test');

  await expect(page.getByRole('button', { name: /păstrează-mi datele/i })).toBeVisible();
  expect(ceruriMutante).toEqual([]);
});
