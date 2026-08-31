-- ════════════════════════════════════════════════════════════════════════════
-- Retenția de 1 an — găsirea contactelor scadente, reconfirmarea care
-- repornește ceasul, și curățenia efectivă după fereastra de răspuns.
--
-- Rulează:  psql -d wsdl -v ON_ERROR_STOP=1 -f tests/db/retention.sql
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

truncate contacts cascade;

\echo ''
\echo '── Cine e scadent pentru notificare ────────────────────────────────────'

insert into contacts (email, nume, created_at) values
  ('vechi-nenotificat@test.ro',   'Vechi Nenotificat',   now() - interval '400 days'),
  ('recent@test.ro',              'Recent',              now() - interval '200 days'),
  ('la-limita@test.ro',           'La Limită',           now() - interval '366 days');

select assert_eq(
  (select count(*)::int from find_contacts_due_for_retention_notice('1 year')),
  2, 'exact 2 contacte peste pragul de 1 an (400 și 366 zile), nu cel de 200');

select assert_eq(
  (select bool_or(email = 'recent@test.ro') from find_contacts_due_for_retention_notice('1 year')),
  false, 'contactul de 200 de zile nu apare în lista de scadenți');

\echo ''
\echo '── O dată notificat, nu reapare la următoarea rulare a sweep-ului ──────'

do $$
declare v_id uuid;
begin
  select id into v_id from contacts where email = 'vechi-nenotificat@test.ro';
  perform mark_retention_notice_sent(v_id);
end $$;

select assert_eq(
  (select count(*)::int from find_contacts_due_for_retention_notice('1 year')),
  1, 'după notificare, rămâne doar contactul „la limită", nemarcat încă');

\echo ''
\echo '── Reconfirmarea repornește ceasul ─────────────────────────────────────'

do $$
declare v_token text; v_rezultat text;
begin
  select retention_token into v_token from contacts where email = 'la-limita@test.ro';
  v_rezultat := reconfirm_retention(v_token);
  if v_rezultat is distinct from 'reconfirmat' then
    raise exception 'PICA: reconfirm_retention cu token valid ar fi trebuit să întoarcă reconfirmat, a întors %', v_rezultat;
  end if;
  raise notice '  ok  reconfirm_retention cu token valid întoarce reconfirmat';
end $$;

select assert_eq(
  (select count(*)::int from find_contacts_due_for_retention_notice('1 year')),
  0, 'contactul reconfirmat nu mai e scadent — ceasul a repornit de la reconfirmare, nu de la created_at');

select assert_eq(
  (select retention_notice_sent_at is null from contacts where email = 'la-limita@test.ro'),
  true, 'reconfirmarea golește retention_notice_sent_at — pregătit pentru ciclul următor');

select assert_eq(
  reconfirm_retention('token-care-nu-exista'),
  'invalid', 'token necunoscut → invalid, nicio schimbare de stare');

\echo ''
\echo '── Curățenia — doar după fereastra de răspuns, doar cei notificați ─────'

truncate contacts cascade;

insert into contacts (email, nume, created_at, retention_notice_sent_at) values
  ('notificat-de-mult@test.ro',  'Notificat De Mult',  now() - interval '400 days', now() - interval '40 days'),
  ('notificat-recent@test.ro',   'Notificat Recent',   now() - interval '400 days', now() - interval '5 days'),
  ('nenotificat-inca@test.ro',   'Nenotificat Încă',   now() - interval '400 days', null);

select assert_eq(purge_expired_retention('30 days'), 1,
  'exact 1 contact șters — cel notificat acum 40 de zile, peste fereastra de 30');

select assert_eq(
  (select count(*)::int from contacts),
  2, 'ceilalți doi rămân: notificat recent (încă în fereastră) și nenotificat (fără ceas pornit)');

select assert_eq(
  (select count(*)::int from contacts where email = 'notificat-de-mult@test.ro'),
  0, 'contactul șters chiar a dispărut');

\echo ''
\echo '── Cascadă: ștergerea contactului ia cu ea și înscrierile lui ──────────'

do $$
declare v_id uuid; v_ramase int;
begin
  insert into contacts (email, nume, created_at, retention_notice_sent_at)
    values ('cu-inscriere@test.ro', 'Cu Înscriere', now() - interval '400 days', now() - interval '40 days')
    returning id into v_id;

  insert into event_registrations (contact_id, consimtamant_comunicare)
    values (v_id, true);

  perform purge_expired_retention('30 days');

  select count(*) into v_ramase from event_registrations where contact_id = v_id;
  if v_ramase <> 0 then
    raise exception 'PICA: înscrierea a supraviețuit ștergerii contactului — cascada nu a funcționat';
  end if;
  raise notice '  ok  ștergerea contactului cascadează și asupra înscrierii lui la eveniment';
end $$;

\echo ''
\echo '✓ Retenție: scadența, reconfirmarea și curățenia se comportă exact cum promite politica.'
\echo ''
