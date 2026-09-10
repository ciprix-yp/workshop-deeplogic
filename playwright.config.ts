import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  // Compilează la rece fiecare rută înainte de prima aserțiune — vezi
  // `tests/e2e-incalzire.ts` pentru cursa pe care o elimină.
  globalSetup: './tests/e2e-incalzire.ts',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: process.env.URL_BAZA ?? 'http://localhost:4321',
    trace: 'on-first-retry',
    locale: 'ro-RO',
  },
  projects: [
    // Ancora e Android la 360px — de acolo vine linkul din WhatsApp, și acolo
    // se rup lucrurile întâi.
    {
      name: 'mobil-360',
      use: { ...devices['Pixel 5'], viewport: { width: 360, height: 800 } },
    },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // Notă (2026-09-10): în terminal normal, `astro dev` rulează în prim-plan și
    // `webServer` îl gestionează singur. Într-un mediu de agent AI, Astro îl
    // daemonizează automat (procesul din prim-plan iese imediat), iar Playwright
    // raportează „Process from config.webServer exited early". Acolo, pornește
    // întâi `npm run dev`: `reuseExistingServer` îl preia.
    command: 'npx astro dev --port 4321 --host 127.0.0.1',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
