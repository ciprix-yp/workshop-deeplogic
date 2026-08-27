# Progres — workshop.deeplogic.ro

Evenimentul e pe **16 septembrie 2026**. Țintă internă de lansare: **5 septembrie**,
ca să rămână ~11 zile de distribuție prin WhatsApp.

Legendă: `[ ]` de făcut · `[~]` în lucru · `[x]` gata **și verificat** · `[!]` blocat

---

## F0 — Fundație

- [x] Structura de directoare
- [x] `package.json` — Astro 7.2.8, Cloudflare adapter 14.2.5, Inngest 4.18.1, Zod 4.4.3
- [x] `astro.config.mjs` — `astro:env` cu schema de secrete, `prerenderEnvironment: 'node'`
- [x] `wrangler.jsonc` — `nodejs_compat` activat
- [x] `tsconfig.json` — strict, `noUncheckedIndexedAccess`
- [x] `.gitignore`, `.env.example`
- [x] `CLAUDE.md` — reguli de producție
- [ ] `git init` + primul commit
- [ ] **Cont Cloudflare**: DNS record pentru `workshop.deeplogic.ro`
- [ ] **Resend**: domeniu verificat + SPF/DKIM/DMARC — *de pornit primul, are propagare DNS*
- [ ] **Supabase**: proiect creat, service role key
- [ ] **Turnstile**: site key + secret key
- [ ] **Inngest**: cont + signing key

## F1 — Date

- [x] `supabase/migrations/0001_init.sql` — cu `anulat`, `welcome_sent_at`, index (B8/B11/B15)
- [x] Toată logica atomică în funcții Postgres, nu în handler — `supabase-js` **nu are
      tranzacții**, deci `pg_advisory_xact_lock` din spec, implementat literal în handler,
      s-ar fi eliberat între apeluri și n-ar fi protejat nimic
- [x] RLS pornit fără politici + `revoke all` → `anon` n-are acces la nimic
- [x] Tokenii se generează prin `DEFAULT gen_token()`, deci calea care picase pe
      `not null` la walk-in nu mai există
- [x] `tests/db/state-machine.sql` — **26/26 aserțiuni trec**
- [x] `tests/db/race.sh` — **20/20 runde**, un singur câștigător per loc
- [x] Verificat că testul de cursă are dinți: fără lock → 10 câștigători pe 1 loc, 34 confirmați
- [x] `tests/db/run.sh` — Postgres temporar, migrație de la zero, suita completă (`npm run test:db`)
- [ ] `src/lib/supabase.ts` — client cu service role, tipat pe funcțiile RPC
- [ ] Aplicat pe proiectul Supabase real

## F2 — Copy și tokens

- [x] `src/content/copy.ts` — toate cele 17 secțiuni + stările de răspuns + meta
- [x] `src/content/form-schema.ts` — 6 câmpuri de bază + Set B (Q1–Q5) + bife
- [x] `src/styles/tokens.css` — paletă corectată, scală fluidă ancorată la 360px
- [x] `scripts/check-contrast.mjs` — **13/13 perechi trec**
- [x] `tests/copy-invariants.test.ts` — **50/50 trec**
- [x] Fonturi self-hostate, subset `latin` + `latin-ext` (B7) — `scripts/fetch-fonts.mjs`
- [x] Fonturi **variabile**, nu statice: 236 KB în loc de 453 KB, toate greutățile

## F3 — Pagina

- [x] `src/layouts/Base.astro` — meta, OG absolut, JSON-LD Event cu offset EEST explicit
- [x] §01–§17, componentă per secțiune, tot textul din `copy.ts`
- [x] `scripts/screenshots.mjs` — 5 breakpoint-uri + audit automat
- [x] **Zero defecte**: fără scroll orizontal, fără erori de consolă, 1× H1,
      221 diacritice cu virgulă, 0 cu sedilă, toate țintele ≥44px
- [x] `tests/e2e/formular.spec.ts` — **16/16** pe mobil-360 și desktop
- [x] `astro check` — 0 erori, 0 avertismente, 0 sugestii
- [x] Build: 68 KB HTML cu CSS inline
- [ ] **OG image 1200×630, sub 300KB (B5)** — referențiat în `copy.ts`, fișierul lipsește
- [ ] Foto `public/ciprian-micu.jpg` — §11 rulează text-only până apare

## F4 — Înscriere

- [ ] `POST /api/register` — validare, Turnstile, prag capacitate, insert
- [ ] Ecrane: `stari.inscris`, `stari.asteptare`, `stari.dejaInscris`, `stari.eroare`
- [ ] Idempotency pe `inngest.send()` (B10)
- [ ] Rate limiting

## F5 — Emailuri

- [ ] `docs/EMAILURI.md` — cele 7 texte, **review de Ciprian înainte de cod**
- [ ] Template-uri + trimitere reală, verificată pe Gmail mobil + Outlook

## F6 — Ciclul Inngest

- [ ] `workshop/registered` — 4 × `sleepUntil`, cu linkul de anulare în email 1 (B3)
- [ ] Rulat cu date comprimate în dev server

## F7 — Waitlist

- [ ] `workshop/waitlisted`, `workshop/seat_freed` cu `debounce` + `singleton` (B1)
- [ ] Cursa cu `pg_advisory_xact_lock`
- [ ] Test de concurență: 10 simultane pe 1 loc → exact 1 câștigător, ×20 rulări

## F8 — Răspuns și check-in

- [ ] `GET /raspuns` (doar pagină) + `POST /api/raspuns` (mută starea) — B2
- [ ] `/checkin`, `/checkin-loc` + QR, cu Turnstile (B13)

## F9 — Legal

- [ ] `/termeni`, `/confidentialitate` — draft de validat

## F10 — QA și code review

- [ ] R1 (după F4) — suprafața de intrare
- [ ] R2 (după F7) — mașina de stări și concurența
- [ ] R3 (după F9) — fluxul complet, cross-check de copy

---

## Gates de lansare

- [ ] `LEGAL` — Termeni + Confidențialitate publicate și linkate din bifă
- [ ] `EMAIL` — SPF/DKIM/DMARC verzi, email aterizat în inbox (nu spam)
- [ ] `OG` — card randat corect pe un telefon real, prin WhatsApp
- [x] `CONCURENȚĂ` — 20/20 rulări, un singur câștigător; verificat că testul pică fără lock
- [~] `B1` — jumătatea de bază de date gata (`expire_unconfirmed` = o rulare, idempotentă).
      Rămâne `debounce` + `singleton` pe funcția Inngest.
- [ ] `B2` — prefetch pe linkul de anulare nu schimbă nicio stare
- [x] `CONTRAST` — 13/13 perechi peste prag
- [x] `DIACRITICE` — 221 caractere ș/ț cu virgulă randate corect pe toate cele 5 breakpoint-uri, 0 cu sedilă
- [ ] `.ics` — 14:00 EEST în Google + Apple + Outlook
- [x] `COPY` — 49/49 invarianți trec

---

## Blocat pe Ciprian

1. **Pagini legale** (D11) — singurul asset absent. Propun draft în F9.
2. **Credențiale**: Cloudflare, Supabase, Resend, Turnstile, Inngest.
3. **Resend/DNS** — de pornit primul, propagarea nu se grăbește.
4. **Foto** `public/ciprian-micu.jpg` — reală, la lucru sau la un eveniment.
5. **Review `docs/EMAILURI.md`** înainte să intre în cod.
6. **Verificat** în `copy.ts`: `footer.linkedin` e o presupunere — confirmă URL-ul real.
