-- ════════════════════════════════════════════════════════════════════════════
-- Fix: gen_token() nu găsea gen_random_bytes() pe Supabase real.
--
-- Descoperit la primul test end-to-end prin ruta API, nu local — motivul e
-- chiar diferența de mediu pe care testul local n-o poate reproduce:
--   • Postgres 15 vanilla (harness-ul local): `create extension pgcrypto`
--     instalează funcțiile în schema `public`.
--   • Supabase: pgcrypto e deja instalat, în schema `extensions` (convenție
--     de platformă), NU `public`.
--
-- `gen_token()` n-avea `search_path` propriu — moștenea search_path-ul
-- funcției apelante (INSERT-ul din `register_participant`, care rulează cu
-- `search_path = public, pg_temp`). Pe Supabase, `extensions` nu era în lista
-- aia, deci `gen_random_bytes` nu se găsea.
--
-- Fix: `gen_token()` primește propriul search_path, cu `extensions` inclus.
-- Merge pe ambele medii — dacă schema `extensions` nu există (local), e pur
-- și simplu sărită din search_path, nu produce eroare.
-- ════════════════════════════════════════════════════════════════════════════

create or replace function gen_token()
returns text
language sql
volatile
set search_path = public, extensions, pg_temp
as $$
  select translate(encode(gen_random_bytes(32), 'base64'), '+/=', '-_');
$$;

revoke all on function gen_token from public, anon, authenticated;
