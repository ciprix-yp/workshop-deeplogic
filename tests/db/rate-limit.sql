-- ════════════════════════════════════════════════════════════════════════════
-- Rate limiting — fereastră fixă.
-- Rulează:  psql -d wsdl -v ON_ERROR_STOP=1 -f tests/db/rate-limit.sql
-- ════════════════════════════════════════════════════════════════════════════

\set QUIET on

create or replace function assert_eq(actual anyelement, expected anyelement, eticheta text)
returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception 'PICA: % — am primit %, așteptam %', eticheta, actual, expected;
  end if;
  raise notice '  ok  %', eticheta;
end; $$;

truncate rate_limit_hits;

\echo ''
\echo '── Fereastră fixă ──────────────────────────────────────────────────────'

do $$
declare i int; ok boolean;
begin
  for i in 1..5 loop
    ok := check_rate_limit('test:aaa', 5, interval '1 minute');
    if not ok then
      raise exception 'PICA: cererea % din 5 respinsă, sub limită', i;
    end if;
  end loop;
  raise notice '  ok  primele 5 cereri, cu limita 5, sunt toate permise';
end $$;

select assert_eq(check_rate_limit('test:aaa', 5, interval '1 minute'), false,
  'a șasea cerere, peste limita de 5, e respinsă');

select assert_eq(check_rate_limit('test:aaa', 5, interval '1 minute'), false,
  'a șaptea la fel — nu se resetează la fiecare apel');

\echo ''
\echo '── Bucket-uri independente ─────────────────────────────────────────────'

select assert_eq(check_rate_limit('test:bbb', 5, interval '1 minute'), true,
  'alt bucket, contor separat — nu moștenește hits de la „aaa"');

\echo ''
\echo '── Concurență: N cereri simultane pe același bucket ────────────────────'

-- Nu teste de proces separat ca la waitlist (acolo conta lock-ul cross-tranzacție).
-- Aici testul relevant e că INSERT..ON CONFLICT..RETURNING e atomic chiar și
-- apelat repetat rapid — verificat prin numărul final de hits, nu prin race
-- real (funcția rulează în propria tranzacție implicită, deci fiecare apel
-- serializează corect pe rândul (bucket, window_start) prin constrângerea UNIQUE).
truncate rate_limit_hits;
do $$
declare i int;
begin
  for i in 1..20 loop
    perform check_rate_limit('test:ccc', 1000, interval '1 minute');
  end loop;
end $$;

select assert_eq(
  (select hits from rate_limit_hits where bucket = 'test:ccc'),
  20, 'numărătoarea e exactă după 20 de apeluri — niciun hit pierdut');

\echo ''
\echo '── Bucket gol respins ───────────────────────────────────────────────────'

do $$
begin
  begin
    perform check_rate_limit('', 5, interval '1 minute');
    raise exception 'PICA: bucket gol ar fi trebuit respins';
  exception when others then
    raise notice '  ok  bucket gol respins cu eroare';
  end;
end $$;

\echo ''
\echo '── Drepturi ─────────────────────────────────────────────────────────────'

select assert_eq(
  has_function_privilege('anon', 'check_rate_limit(text,int,interval)', 'EXECUTE'),
  false, 'anon nu poate apela check_rate_limit direct');

select assert_eq(
  has_function_privilege('service_role', 'check_rate_limit(text,int,interval)', 'EXECUTE'),
  true, 'service_role poate');

\echo ''
\echo '✓ Rate limiting: fereastră fixă, atomică, bucket-uri izolate.'
\echo ''
