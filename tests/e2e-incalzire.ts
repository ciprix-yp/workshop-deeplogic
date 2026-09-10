/**
 * `globalSetup` pentru Playwright: cere o dată fiecare rută pe care o ating
 * testele, ÎNAINTE de prima aserțiune.
 *
 * De ce e nevoie (găsit 2026-09-10, la introducerea lui `test:e2e` în
 * `npm run verify`): `astro dev` compilează fiecare rută la PRIMA cerere.
 * `webServer` din `playwright.config.ts` așteaptă doar ca `/` să răspundă,
 * deci primul test care atinge `/raspuns`, `/checkin` sau `/pastreaza-datele`
 * plătește compilarea la rece — 5-30 de secunde — și depășește timeout-ul
 * propriu al aserțiunii. Rulat pe un server deja cald, aceeași suită trecea
 * 70/70; rulat la rece, în lanțul `verify`, picau 11 teste, toate primele din
 * workerul lor. Simptomul arăta ca o regresie de cod; era o cursă de pornire.
 *
 * Încălzirea e secvențială, deliberat: în paralel, cererile concurente pe
 * rute necompilate se blochează una pe alta și durează mai mult decât una
 * după alta.
 */

import type { FullConfig } from '@playwright/test';

const RUTE = [
  '/',
  '/raspuns?token=incalzire&r=da',
  '/checkin?token=incalzire',
  '/pastreaza-datele?token=incalzire',
  '/rezultat?stare=tokenInvalid',
  '/multumesc',
  '/lista-asteptare',
  '/api/locuri-disponibile',
];

export default async function incalzeste(config: FullConfig) {
  const baza =
    (config.projects[0]?.use?.baseURL as string | undefined) ??
    process.env.URL_BAZA ??
    'http://localhost:4321';

  for (const ruta of RUTE) {
    try {
      await fetch(new URL(ruta, baza), { signal: AbortSignal.timeout(60_000) });
    } catch (eroare) {
      // Nu oprim suita: dacă o rută chiar e ruptă, testul care o atinge o va
      // raporta mult mai clar decât o eroare din globalSetup.
      console.warn(`  încălzire: ${ruta} n-a răspuns —`, (eroare as Error).message);
    }
  }
}
