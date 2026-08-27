import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // E2E-urile rulează cu Playwright, nu cu Vitest.
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'tests/visual/**', 'node_modules/**'],
    environment: 'node',
  },
});
