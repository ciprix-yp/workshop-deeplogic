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

-- Curăț și construiesc o stare cu exact un loc liber sub capacitatea de 30
-- (unificată cu bufferul de la înscriere — migrația 0007).
truncate event_registrations, contacts cascade;
do $$
declare i int;
begin
  for i in 1..29 loop
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
  'al doilea găsește sala plină la 30');
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

-- PER RÂND, nu sweep în bloc (migrația 0005) — fiecare instanță Inngest se
-- trezește la cutoff pentru PROPRIA înscriere și trebuie să știe dacă TOCMAI
-- a marcat-o no-show, ca să decidă dacă emite `workshop/seat_freed`. Un
-- sweep în bloc nu-i spune asta unei instanțe individuale.
do $$
declare i int; v_flip boolean;
begin
  for i in 1..8 loop
    select expire_if_unconfirmed(
      (select r.id from event_registrations r join contacts c on c.id=r.contact_id
        where c.email = 'n' || i || '@t.ro')
    ) into v_flip;
    if i <= 3 then
      if v_flip then raise exception 'PICA: n%@t.ro era reconfirmat, n-ar fi trebuit atins', i; end if;
    else
      if not v_flip then raise exception 'PICA: n%@t.ro era inscris, ar fi trebuit marcat no_show', i; end if;
    end if;
  end loop;
  raise notice '  ok  expire_if_unconfirmed(): fiecare instanță știe dacă PROPRIUL rând s-a schimbat';
end $$;

select assert_eq(
  (select count(*)::int from event_registrations where status = 'no_show'),
  5, 'exact 5 din 8 devin no_show — restul erau deja reconfirmați');

do $$
declare v_flip boolean;
begin
  select expire_if_unconfirmed(
    (select r.id from event_registrations r join contacts c on c.id=r.contact_id where c.email='n4@t.ro')
  ) into v_flip;
  if v_flip then raise exception 'PICA: a doua chemare pe un rând deja no_show ar fi trebuit să fie no-op'; end if;
  raise notice '  ok  a doua chemare pe același rând e no-op (idempotent)';
end $$;

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
\echo '── 0008: poarta de „loc ocupat" (B-1, B-2 din auditul din 10 sep) ─────'

-- Starea de dinainte de 14 septembrie: 30 de oameni `inscris`, NIMENI
-- reconfirmat — fiindcă reconfirmarea nici nu s-a cerut încă. Exact fereastra
-- în care bug-ul era declanșabil.
truncate contacts cascade;

do $$
begin
  for i in 1..30 loop
    perform t_register('ocupat' || i || '@test.ro');
  end loop;
end $$;

select assert_eq(
  (select count(*)::int from event_registrations where status = 'inscris'),
  30, '30 de oameni `inscris`, niciunul reconfirmat');

select assert_eq(t_register('wait31@test.ro'), 'asteptare', 'al 31-lea intră pe listă');

-- B-1: revendicarea trebuie REFUZATĂ. Cele 30 de locuri sunt ținute de oameni
-- `inscris`. Înainte de 0008, poarta număra doar `reconfirmat`/`prezent`,
-- vedea 0 din 30 ocupate și aproba fiecare revendicare — o singură anulare
-- putea produce ~59 de oameni pentru 30 de scaune.
select assert_eq(
  claim_waitlist_seat(t_token('wait31@test.ro')),
  'plin', 'B-1: revendicarea e refuzată când locurile sunt ținute de `inscris`');
select assert_eq(
  t_status('wait31@test.ro'), 'asteptare', 'B-1: a rămas pe listă, n-a intrat');

-- Non-regresie CRITICĂ: reconfirmarea normală nu e gardată de capacitate.
-- Omul `inscris` ocupă deja locul pe care poarta l-ar verifica — gardat aici,
-- fiecare reconfirmare legitimă ar fi refuzată exact la sală plină, adică
-- exact când toți reconfirmă.
select assert_eq(
  respond_to_invite(t_token('ocupat1@test.ro'), true),
  'reconfirmat', 'inscris → reconfirmat trece la sală plină (poarta NU se aplică)');

-- B-2: cine anulează și se răzgândește, la sală plină, ajunge pe listă.
select assert_eq(
  respond_to_invite(t_token('ocupat2@test.ro'), false), 'anulat', 'anulare reușită');
select assert_eq(
  claim_waitlist_seat(t_token('wait31@test.ro')),
  'revendicat', 'locul eliberat e luat de pe listă');
select assert_eq(
  respond_to_invite(t_token('ocupat2@test.ro'), true),
  'pe_asteptare', 'B-2: revenirea la sală plină → pe lista de așteptare');
select assert_eq(
  t_status('ocupat2@test.ro'), 'asteptare', 'B-2: chiar a fost mutat pe listă');

select assert_eq(
  (select count(*)::int from event_registrations
    where status in ('inscris','reconfirmat','prezent')),
  30, 'B-1+B-2: exact 30 de locuri ocupate, niciodată 31');

-- Aceeași revenire, dar CU loc liber: duce în `reconfirmat`, nu pe listă.
select assert_eq(
  respond_to_invite(t_token('ocupat3@test.ro'), false), 'anulat', 'încă o anulare');
select assert_eq(
  respond_to_invite(t_token('ocupat3@test.ro'), true),
  'reconfirmat', 'revenirea cu loc liber → reconfirmat');

-- `no_show` se comportă identic cu `anulat` la revenire — omul care ratează
-- cutoff-ul de 11:00 și apasă „Confirm că vin" la 11:30, după ce locul lui a
-- fost deja difuzat pe waitlist.
update event_registrations set status = 'no_show'
 where confirm_token = t_token('ocupat4@test.ro');
select assert_eq(
  claim_waitlist_seat(t_token('ocupat2@test.ro')),
  'revendicat', 'locul rămas no_show e luat de pe listă');
select assert_eq(
  respond_to_invite(t_token('ocupat4@test.ro'), true),
  'pe_asteptare', 'B-2: revenirea din `no_show` la sală plină → pe listă');

select assert_eq(
  (select count(*)::int from event_registrations
    where status in ('inscris','reconfirmat','prezent')),
  30, 'B-2: capacitatea ține și pe calea `no_show`');

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
