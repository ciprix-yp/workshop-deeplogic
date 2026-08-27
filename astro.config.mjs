// @ts-check
import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Landing „Prima Mutare spre un Asistent Digital" — Deep Logic
//
// Output: `static` (implicit în Astro 7). Pagina de landing e prerandată integral
// și servită de pe CDN-ul Cloudflare. Doar rutele care ating baza de date optează
// pentru randare la cerere, prin `export const prerender = false` în fiecare fișier.
// Motivul: §01–§17 nu au nimic dinamic, iar 40%+ din trafic vine de pe mobil, prin
// browserul in-app din WhatsApp — acolo fiecare milisecundă de TTFB se vede.

export default defineConfig({
  site: 'https://workshop.deeplogic.ro',
  adapter: cloudflare({
    // Prerandarea rulează pe Node, nu pe workerd: generarea .ics și subsetarea
    // fonturilor la build folosesc API-uri Node care nu există în workerd.
    prerenderEnvironment: 'node',
    imageService: 'compile',
  }),

  // Schema de variabile de mediu. `access: 'secret'` face imposibil, la build,
  // ca vreuna din astea să ajungă în bundle-ul de client — spec-ul cerea
  // disciplină manuală pe `process.env`, asta o impune mecanic.
  env: {
    schema: {
      SUPABASE_URL: envField.string({ context: 'server', access: 'secret' }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({ context: 'server', access: 'secret' }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
      TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret' }),
      INNGEST_EVENT_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      INNGEST_SIGNING_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),

      // Unde ajung alertele când ceva se rupe tăcut (B11 — reconciliere).
      ALERT_EMAIL: envField.string({ context: 'server', access: 'secret' }),
      EMAIL_FROM: envField.string({ context: 'server', access: 'secret' }),

      // Publice — ajung în client, deliberat.
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_SITE_URL: envField.string({
        context: 'client',
        access: 'public',
        default: 'https://workshop.deeplogic.ro',
      }),
    },
  },

  build: {
    // Un singur fișier CSS inline pentru pagina statică — pe 4G, o cerere HTTP
    // în minus contează mai mult decât cache-ul separat al unui CSS mic.
    inlineStylesheets: 'always',
  },

  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
