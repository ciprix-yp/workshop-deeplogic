import { defineConfig } from 'vitest/config';

/**
 * `defineConfig` simplu, nu `getViteConfig` din `astro/config`.
 *
 * Am încercat `getViteConfig` ca să rezolve `astro:env/server` (folosit în
 * src/lib/supabase.ts, turnstile.ts) — dar plugin-ul Vite al adaptorului
 * Cloudflare respinge explicit combinația: seteaza `resolve.external` pentru
 * mediul SSR, iar `@cloudflare/vite-plugin` refuză să pornească dacă altcineva
 * mai atinge acea opțiune. E o incompatibilitate reală, nu o greșeală de config.
 *
 * De asta modulele care importă `astro:env/server` (turnstile.ts, rate-limit.ts,
 * supabase.ts) NU sunt testate aici — sunt cod la granița de rețea, verificat
 * manual, end-to-end, împotriva stack-ului real (Supabase + Cloudflare
 * Turnstile + Inngest Dev Server), ceea ce dovedește mai mult decât un test
 * cu fetch mockuit. `form-schema.ts` e Zod pur, fără nicio dependință de
 * `astro:env` — testabil direct, fără nimic special.
 */
export default defineConfig({
  test: {
    // E2E-urile rulează cu Playwright, nu cu Vitest.
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'tests/visual/**', 'node_modules/**'],
    environment: 'node',
  },
});
