#!/usr/bin/env node
/**
 * Deploy — `astro build` cu `.dev.vars`/`.env` ASCUNSE, apoi `wrangler deploy`.
 *
 * Bug real, găsit 2026-09-02 („widget-ul Turnstile arată roșu, «numai pentru
 * testare»"): `PUBLIC_TURNSTILE_SITE_KEY` e `context: 'client'` în schema
 * `astro:env` (astro.config.mjs) — valoarea trebuie inlinată în HTML-ul
 * static la BUILD TIME, pe mașina care rulează `astro build`. `wrangler.jsonc`
 * → `vars` (unde stă cheia REALĂ) e vizibil abia la RUNTIME, în Workers —
 * mult după ce pagina a fost deja generată. Verificat empiric (`grep
 * data-sitekey` pe `dist/client/index.html` cu fiecare sursă rând pe rând):
 * `@cloudflare/vite-plugin` rezolvă `astro:env` client-context din
 * `.dev.vars` → `.env` → abia apoi `wrangler.jsonc` → `vars`, în ordinea
 * asta — ambele fișiere locale au cheia de TEST (corect pentru `astro dev`),
 * deci un build rulat de pe ACEEAȘI mașină (fără CI, fără remote git —
 * deploy-ul e `wrangler deploy` local) o clona direct în producție.
 *
 * Fix: pentru DOAR durata lui `astro build`, `.dev.vars` și `.env` sunt mutate
 * deoparte — build-ul cade prin la `wrangler.jsonc` → `vars` (cheia reală).
 * Restaurate ÎNTOTDEAUNA după (try/finally + handler pe SIGINT/SIGTERM), ca
 * `astro dev`/`wrangler dev` să rămână neatinse pentru sesiunea următoare de
 * lucru local.
 *
 * Rulează:  npm run deploy  (înlocuiește `astro build && wrangler deploy`)
 */

import { existsSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const RADACINA = fileURLToPath(new URL('..', import.meta.url));

const FISIERE = ['.dev.vars', '.env'].map((nume) => ({
  nume,
  cale: join(RADACINA, nume),
  caleAscunsa: join(RADACINA, `${nume}.deploy-tmp`),
}));

function ascunde() {
  for (const f of FISIERE) {
    if (existsSync(f.cale)) renameSync(f.cale, f.caleAscunsa);
  }
}

function restaureaza() {
  for (const f of FISIERE) {
    if (existsSync(f.caleAscunsa)) renameSync(f.caleAscunsa, f.cale);
  }
}

// Restaurare și pe Ctrl+C / kill — nu doar pe finalizare normală. Fără asta,
// o întrerupere în mijlocul build-ului ar lăsa `.dev.vars`/`.env` ascunse,
// și `astro dev` ar pica la următoarea pornire cu variabile lipsă.
process.on('SIGINT', () => {
  restaureaza();
  process.exit(130);
});
process.on('SIGTERM', () => {
  restaureaza();
  process.exit(143);
});

function ruleaza(comanda, argumente) {
  const rezultat = spawnSync(comanda, argumente, { stdio: 'inherit', cwd: RADACINA, shell: process.platform === 'win32' });
  if (rezultat.status !== 0) {
    throw new Error(`${comanda} ${argumente.join(' ')} a eșuat (cod ${rezultat.status})`);
  }
}

ascunde();
try {
  // `npm run build`, nu `npx astro build` direct — trebuie să declanșeze și
  // hook-ul `prebuild` (generarea `.ics`), pe care npm îl leagă doar de
  // scriptul cu numele exact, nu de un apel direct al `astro build`.
  ruleaza('npm', ['run', 'build']);
} finally {
  // Restaurat ÎNAINTE de `wrangler deploy`: deploy-ul citește doar `dist/`,
  // deja construit — nu mai are nevoie de fișierele ascunse, iar dacă build-ul
  // a picat, developerul revine imediat la un `.dev.vars`/`.env` funcțional.
  restaureaza();
}

ruleaza('npx', ['wrangler', 'deploy']);
