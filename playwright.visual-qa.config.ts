import { defineConfig } from '@playwright/test';

/**
 * Config dedicat harness-ului de regresie vizuala din visual-qa (Pasul 2).
 * Separat de playwright.config.ts (care are testDir: tests/e2e si nu preia
 * tests/visual-regression.spec.ts) - nu modifica fisierul de config al
 * proiectului, doar il completeaza pentru aceasta rulare.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: 'visual-regression.spec.ts',
  fullyParallel: true,
  reporter: [['list']],
  use: { trace: 'off' },
});
