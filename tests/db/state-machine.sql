-- ════════════════════════════════════════════════════════════════════════════
-- Mașina de stări — toate tranzițiile, valide și invalide.
--
-- Rulează:  psql -d wsdl -v ON_ERROR_STOP=1 -f tests/db/state-machine.sql
--
-- Fiecare aserțiune ridică excepție la eșec, deci ON_ERROR_STOP oprește la
-- primul defect. Nu e nevoie de framework — SQL-ul testează SQL.
-- ════════════════════════════════════════════════════════════════════════════

\set QUIET on
\timing off

create or replace function assert_eq(actual anyelement, expected anyelement, eticheta text)
returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception 'PICA: % — am primit %, așteptam %', eticheta, actual, expected;
  end if;
  raise notice '  ok  %', eticheta;
end; $$;

/* Înscrie un om de test și returnează statusul. */
create or replace function t_register(p_email text, p_prag int default 30)
returns text language plpgsql as $$
declare v_status text;
begin
  select status into v_status from register_participant(
    p_email, 'Test ' || p_email, 'Firma SRL', 'Sunt membru DRW', null,
    'Fac ofertele de mână și îmi ia o oră fiecare.', 'Din când în când',
    '{"q1_unealta":"ChatGPT"}'::jsonb, true, false,
    'workshop-2026-09-16', p_prag
  );
  return v_status;
end; $$;

/* La fel, dar returnează `este_nou` — pentru testul de reînscriere (B4),
   unde diferența dintre „rând nou" și „rând existent, status real" e chiar
   ce s-a reparat în migrația 0003. */
create or replace function t_register_este_nou(p_email text, p_prag int default 30)
returns boolean language plpgsql as $$
declare v_este_nou boolean;
begin
  select este_nou into v_este_nou from register_participant(
    p_email, 'Test ' || p_email, 'Firma SRL', 'Sunt membru DRW', null,
    'Fac ofertele de mână și îmi ia o oră fiecare.', 'Din când în când',
    '{"q1_unealta":"ChatGPT"}'::jsonb, true, false,
    'workshop-2026-09-16', p_prag
  );
  return v_este_nou;
end; $$;

create or replace function t_token(p_email text)
returns text language sql as $$
  select r.confirm_token from event_registrations r
  join contacts c on c.id = r.contact_id where c.email = lower(p_email);
$$;

create or replace function t_status(p_email text)
returns text language sql as $$
  select r.status from event_registrations r
  join contacts c on c.id = r.contact_id where c.email = lower(p_email);
$$;

truncate event_registrations, contacts cascade;

\echo ''
\echo '── Praguri de capacitate ──────────────────────────────────────────────'

do $$
declare i int;
begin
  for i in 1..30 loop
    perform t_register('p' || i || '@t.ro');
  end loop;
  perform assert_eq(
    (select count(*)::int from event_registrations where status = 'inscris'),
    30, 'primii 30 intră ca `inscris`');
end $$;

select assert_eq(t_register('p31@t.ro'), 'asteptare', 'al 31-lea intră pe `asteptare`');
select assert_eq(t_register('p32@t.ro'), 'asteptare', 'al 32-lea la fel');

\echo ''
\echo '── B4: double-submit ──────────────────────────────────────────────────'

-- Migrația 0003: statusul întors la reînscriere e cel REAL al rândului
-- existent, nu un 'duplicat' sintetic — apelantul are nevoie de starea
-- adevărată ca să aleagă ecranul corect (cineva `reconfirmat` care redeschide
-- link-ul de înscriere nu trebuie să vadă „te-ai înscris", ci „ne vedem miercuri").
select assert_eq(t_register('p5@t.ro'), 'inscris',
  'reînscrierea aceleiași adrese → statusul REAL (`inscris`), nu „duplicat"');
select assert_eq(t_register_este_nou('p5@t.ro'), false,
  '`este_nou` = false pe reînscriere — asta marchează duplicatul, nu statusul');
select assert_eq(t_register('P5@T.RO'), 'inscris', 'majusculele nu creează un om nou');
select assert_eq(
  (select count(*)::int from event_registrations), 32,
  'niciun rând nou din duplicate');

\echo ''
\echo '── Reconfirmare și anulare ────────────────────────────────────────────'

select assert_eq(respond_to_invite(t_token('p1@t.ro'), true), 'reconfirmat',
  '`inscris` + „vin" → `reconfirmat`');
select assert_eq(respond_to_invite(t_token('p1@t.ro'), true), 'deja',
  'al doilea click pe același buton → `deja`, nu eroare');

-- Scenariul exact reparat de migrația 0003: p1 e deja `reconfirmat`. Dacă
-- redeschide vechiul link și completează din nou formularul de înscriere,
-- API-ul trebuie să știe că e `reconfirmat`, nu să-l trateze ca înscriere nouă.
select assert_eq(t_register('p1@t.ro'), 'reconfirmat',
  'reînscrierea unui `reconfirmat` întoarce statusul real, nu „inscris"');

-- B3 + decizia 3 din spec: se poate anula ȘI după reconfirmare (butonul de pe
-- emailul din dimineața evenimentului).
select assert_eq(respond_to_invite(t_token('p1@t.ro'), false), 'anulat',
  '`reconfirmat` + „nu pot veni" → `anulat`');
select assert_eq(respond_to_invite(t_token('p2@t.ro'), false), 'anulat',
  '`inscris` + „nu pot veni" → `anulat`');
select assert_eq(respond_to_invite(t_token('p2@t.ro'), false), 'deja',
  'anulare repetată → `deja`');

-- B8: `anulat` e distinct de `no_show`. După eveniment trebuie să poți spune
-- cine a anunțat și cine a dispărut.
select assert_eq(t_status('p2@t.ro'), 'anulat', '`anulat` ≠ `no_show`');

select assert_eq(respond_to_invite('token-inexistent', true), 'invalid',
  'token invalid → `invalid`');

\echo ''
\echo '── Anularea eliberează loc în bufferul de 30 ──────────────────────────'

-- Doi oameni au anulat (p1, p2), deci sunt 30 de locuri ocupate din 32 de rânduri.
select assert_eq(
  (select count(*)::int from event_registrations
    where status in ('inscris','asteptare','reconfirmat','prezent')),
  30, 'anulările nu mai ocupă loc');

\echo ''
\echo '── Cursa din waitlist ─────────────────────────────────────────────────'

-- Curăț și construiesc o stare cu exact un loc liber sub capacitatea de 25.
truncate event_registrations, contacts cascade;
do $$
declare i int;
begin
  for i in 1..24 loop
    insert into contacts (email, nume) values ('c' || i || '@t.ro', 'C' || i);
    insert into event_registrations (contact_id, status, consimtamant_comunicare)
    select id, 'reconfirmat', true from contacts where email = 'c' || i || '@t.ro';
  end loop;
  insert into contacts (email, nume) values ('w1@t.ro', 'W1'), ('w2@t.ro', 'W2');
  insert into event_registrations (contact_id, status, consimtamant_comunicare)
  select id, 'asteptare', true from contacts where email in ('w1@t.ro','w2@t.ro');
end $$;

select assert_eq(claim_waitlist_seat(t_token('w1@t.ro')), 'revendicat',
  'primul de pe waitlist ia locul liber');
select assert_eq(claim_waitlist_seat(t_token('w2@t.ro')), 'plin',
  'al doilea găsește sala plină la 25');
select assert_eq(t_status('w2@t.ro'), 'asteptare',
  'cel care a pierdut rămâne pe listă, nu e degradat');

-- Reconfirmarea normală NU trebuie să scoată pe cineva din waitlist —
-- pentru asta există cursa cu lock.
select assert_eq(respond_to_invite(t_token('w2@t.ro'), true), 'invalid',
  '`asteptare` nu se poate reconfirma prin calea normală');

\echo ''
\echo '── B1: cutoff-ul de la 11:00 ──────────────────────────────────────────'

truncate event_registrations, contacts cascade;
do $$
declare i int;
begin
  for i in 1..8 loop
    perform t_register('n' || i || '@t.ro');
  end loop;
  for i in 1..3 loop
    perform respond_to_invite(t_token('n' || i || '@t.ro'), true);
  end loop;
end $$;

-- O SINGURĂ rulare care marchează toți nereconfirmații și returnează câte
-- locuri s-au eliberat. Jumătatea de bază de date a fixului B1 — cealaltă e
-- `debounce` pe funcția Inngest.
select assert_eq(expire_unconfirmed(), 5, 'cutoff-ul marchează 5 no-show într-o singură rulare');
select assert_eq(expire_unconfirmed(), 0, 'a doua rulare nu mai găsește nimic (idempotent)');
select assert_eq(t_status('n1@t.ro'), 'reconfirmat', 'cei reconfirmați nu sunt atinși');

\echo ''
\echo '── Check-in ───────────────────────────────────────────────────────────'

select assert_eq(
  check_in((select checkin_token from event_registrations r
            join contacts c on c.id=r.contact_id where c.email='n1@t.ro')),
  'prezent', 'reconfirmat → prezent');

select assert_eq(
  check_in((select checkin_token from event_registrations r
            join contacts c on c.id=r.contact_id where c.email='n1@t.ro')),
  'deja', 'al doilea scan → `deja`');

-- Cineva marcat no-show care totuși apare la ușă: îl bifăm. Refuzul la ușă e
-- mai scump decât un rând ciudat în raport.
select assert_eq(
  check_in((select checkin_token from event_registrations r
            join contacts c on c.id=r.contact_id where c.email='n5@t.ro')),
  'prezent', 'no-show care totuși vine e primit');

select assert_eq(check_in('token-inexistent'), 'invalid', 'token de check-in invalid');

-- Cine e deja în sală nu mai poate fi „anulat" printr-un link vechi din email.
select assert_eq(respond_to_invite(t_token('n1@t.ro'), false), 'invalid',
  '`prezent` nu poate fi anulat');

\echo ''
\echo '── Walk-in din QR ─────────────────────────────────────────────────────'

select assert_eq(walk_in_check_in('nou@t.ro', 'Om Nou', true), 'prezent',
  'walk-in necunoscut → contact + înregistrare noi');
select assert_eq(t_status('nou@t.ro'), 'prezent', 'walk-in are status `prezent`');
select assert_eq(walk_in_check_in('n2@t.ro', 'N2', true), 'prezent',
  'walk-in cu email deja pe listă → bifează rândul existent');

\echo ''
\echo '── Tokeni ─────────────────────────────────────────────────────────────'

-- Generați prin DEFAULT, pentru toată lumea, inclusiv walk-in. Spec-ul notează
-- un bug prins runda trecută unde insert-ul de walk-in pica pe `not null`.
select assert_eq(
  (select count(*)::int from event_registrations
    where confirm_token is null or checkin_token is null), 0,
  'toate rândurile au ambii tokeni, inclusiv walk-in');

select assert_eq(
  (select count(distinct confirm_token)::int from event_registrations),
  (select count(*)::int from event_registrations),
  'tokenii de confirmare sunt unici');

select assert_eq(
  (select bool_and(length(confirm_token) between 42 and 44) from event_registrations),
  true, 'tokenii au ~43 caractere (32 bytes base64url)');

-- Migrația 0004: gen_token() nu trebuie să depindă de search_path-ul
-- apelantului. Bug real, prins doar pe Supabase (pgcrypto instalat în schema
-- `extensions`, nu `public` ca local) — testul de-l reproduce fără nevoie de
-- o schemă `extensions` reală: dacă gen_token() ar moșteni search_path-ul de
-- sesiune în loc să-l aibă pe al lui, `set search_path = pg_temp` de mai jos
-- l-ar rupe (pg_temp nu conține nici gen_random_bytes, nici pg_catalog
-- implicit garantat înaintea lui pg_temp în unele configurări).
do $$
declare v_token text;
begin
  set local search_path = pg_temp;
  -- Calificat cu `public.` — altfel `search_path = pg_temp` ar împiedica
  -- găsirea FUNCȚIEI, nu doar ar testa corpul ei. Ce verificăm e strict
  -- independența de search_path A CORPULUI funcției (gen_random_bytes se
  -- rezolvă din propriul ei `set search_path`), nu rezoluția numelui la apel.
  select public.gen_token() into v_token;
  if v_token is null or length(v_token) < 40 then
    raise exception 'PICA: gen_token() a eșuat cu search_path minimal — depinde de search_path-ul apelantului';
  end if;
end $$;
select assert_eq(true, true,
  'gen_token() funcționează indiferent de search_path-ul apelantului (nu doar cu public activ)');

select assert_eq(
  (select bool_and(confirm_token !~ '[+/=]') from event_registrations),
  true, 'tokenii sunt URL-safe — fără +, /, =');

\echo ''
\echo '── Constrângeri ───────────────────────────────────────────────────────'

do $$
begin
  begin
    insert into event_registrations (contact_id, status, consimtamant_comunicare)
    values ((select id from contacts limit 1), 'stare-inventata', true);
    raise exception 'PICA: check constraint-ul pe status n-a respins o valoare invalidă';
  exception when check_violation then
    raise notice '  ok  status invalid respins de check constraint';
  end;
end $$;

do $$
begin
  begin
    insert into event_registrations (contact_id, consimtamant_comunicare)
    values ((select id from contacts limit 1), true);
    raise exception 'PICA: unique(contact_id, event_slug) n-a prins duplicatul';
  exception when unique_violation then
    raise notice '  ok  unique(contact_id, event_slug) previne dubla înscriere';
  end;
end $$;

\echo ''
\echo '✓ Mașina de stări: toate tranzițiile se comportă conform spec.'
\echo ''
