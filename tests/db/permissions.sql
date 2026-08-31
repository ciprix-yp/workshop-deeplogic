-- ════════════════════════════════════════════════════════════════════════════
-- Drepturi — cine poate apela ce.
--
-- Testul ăsta există pentru că lipsa lui a lăsat o gaură reală în producție:
-- `revoke ... from anon, authenticated` pare că închide accesul, dar Postgres
-- acordă EXECUTE lui `PUBLIC` la crearea funcției, iar `anon` e membru al lui
-- `PUBLIC`. Rezultatul: oricine putea apela
--   POST /rest/v1/rpc/register_participant
-- cu anon key (publică, e în bundle-ul de client) și insera înscrieri direct,
-- ocolind și validarea Zod, și Turnstile.
--
-- Aserțiunile de aici sunt despre PRIVILEGII, nu despre comportament — de asta
-- nu le prindea niciun test funcțional: totul mergea perfect, doar că mergea
-- și pentru cine nu trebuia.
--
-- Rulează:  psql -d wsdl -v ON_ERROR_STOP=1 -f tests/db/permissions.sql
-- ════════════════════════════════════════════════════════════════════════════

\set QUIET on

create or replace function assert_true(cond boolean, eticheta text)
returns void language plpgsql as $$
begin
  if not cond then
    raise exception 'PICA: %', eticheta;
  end if;
  raise notice '  ok  %', eticheta;
end; $$;

\echo ''
\echo '── Funcții RPC: nimeni în afară de service role ───────────────────────'

do $$
declare
  r record;
  rol text;
  nr int := 0;
begin
  -- Prin OID, nu prin semnătură text: `pg_get_function_identity_arguments`
  -- include numele parametrilor („p_email text"), iar has_function_privilege
  -- așteaptă doar tipurile — construită ca șir, aserțiunea pică pe sintaxă
  -- în loc să testeze ceva.
  -- Enumerare DINAMICĂ, nu listă fixă. Asta e esențial: Postgres nu are cum
  -- să împiedice declarativ grantul implicit către PUBLIC pe funcțiile
  -- viitoare (verificat — `alter default privileges` nu-l acoperă). Singura
  -- plasă reală e ca testul să vadă tot ce există în schemă, inclusiv o
  -- funcție scrisă mâine de cineva care n-a citit comentariul din migrație.
  --
  -- Se exclud funcțiile din extensii (pgcrypto), care nu ne aparțin.
  for r in
    select p.oid, p.proname
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and not exists (
        select 1 from pg_depend d
        where d.objid = p.oid and d.deptype = 'e'
      )
      -- Funcțiile ajutătoare create de suita de teste, nu de migrație.
      and p.proname not like 'assert\_%'
      and p.proname not like 't\_%'
  loop
    nr := nr + 1;
    foreach rol in array array['public', 'anon', 'authenticated'] loop
      -- has_function_privilege rezolvă și moștenirea prin PUBLIC, deci prinde
      -- exact cazul pe care revoke-ul incomplet îl rata.
      if has_function_privilege(rol, r.oid, 'EXECUTE') then
        raise exception 'PICA: rolul % poate executa %() — lipsește `revoke ... from public` pentru ea', rol, r.proname;
      end if;
    end loop;
  end loop;

  if nr < 8 then
    raise exception 'PICA: am găsit doar % funcții proprii, așteptam cel puțin 8', nr;
  end if;
  raise notice '  ok  toate cele % funcții proprii sunt inaccesibile pentru public / anon / authenticated', nr;
end $$;

\echo ''
\echo '── …dar service_role trebuie să rămână funcțional ─────────────────────'

-- Un lockdown care rupe backend-ul nu e o remediere. Rutele API apelează
-- funcțiile astea cu service role key; dacă revoke-ul le-ar prinde și pe ele,
-- înscrierea ar pica în producție — și ar pica tăcut, la prima cerere reală.
do $$
declare r record;
begin
  for r in
    select p.oid, p.proname
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('register_participant','claim_waitlist_seat','respond_to_invite',
                        'expire_if_unconfirmed','check_in','walk_in_check_in','mark_welcome_sent',
                        'find_contacts_due_for_retention_notice','mark_retention_notice_sent',
                        'reconfirm_retention','purge_expired_retention')
  loop
    if not has_function_privilege('service_role', r.oid, 'EXECUTE') then
      raise exception 'PICA: service_role NU poate executa %() — revoke-ul a mers prea departe', r.proname;
    end if;
  end loop;
  raise notice '  ok  service_role execută toate cele 11 funcții de aplicație';
end $$;

\echo ''
\echo '── Tabele: RLS pornit, zero acces pentru rolurile publice ─────────────'

select assert_true(
  (select bool_and(rowsecurity) from pg_tables
    where schemaname = 'public' and tablename in ('contacts','event_registrations')),
  'RLS activat pe ambele tabele');

select assert_true(
  (select count(*) = 0 from pg_policies where schemaname = 'public'),
  'zero politici RLS — deci zero acces prin anon key');

do $$
declare t text; rol text; priv text;
begin
  foreach t in array array['contacts','event_registrations'] loop
    foreach rol in array array['public','anon','authenticated'] loop
      foreach priv in array array['SELECT','INSERT','UPDATE','DELETE'] loop
        if has_table_privilege(rol, t, priv) then
          raise exception 'PICA: rolul % are % pe tabelul %', rol, priv, t;
        end if;
      end loop;
    end loop;
  end loop;
  raise notice '  ok  niciun rol public n-are SELECT/INSERT/UPDATE/DELETE pe tabele';
end $$;

\echo ''
\echo '✓ Drepturi: suprafața de atac prin anon key e închisă.'
\echo ''
