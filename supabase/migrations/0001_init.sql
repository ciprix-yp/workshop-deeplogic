-- ════════════════════════════════════════════════════════════════════════════
-- Workshop „Prima Mutare spre un Asistent Digital" — 16 septembrie 2026
--
-- Sursa: docs/spec-tehnic-inscriere-16-09.md, cu corecțiile din docs/DECIZII.md.
--
-- Principiul de bază: toată logica ce trebuie să fie atomică trăiește în funcții
-- Postgres, nu în handlerul Astro. Motivul e concret — `supabase-js` nu are
-- tranzacții explicite: fiecare apel PostgREST e propria tranzacție. Un
-- `pg_advisory_xact_lock` luat într-un apel se eliberează înainte de următorul,
-- deci lock-ul din spec, implementat literal în handler, n-ar proteja nimic —
-- și ar părea că protejează.
-- ════════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Token-uri ───────────────────────────────────────────────────────────────
-- 32 bytes criptografic random, base64url (fără `+`, `/`, `=` — trec prin
-- orice client de email fără să fie rupte sau escapate).
--
-- Generarea stă în DEFAULT, nu în cod: spec-ul notează un bug prins runda
-- trecută, unde insert-urile de walk-in picau pe `not null` pentru că tokenii
-- se generau doar pe calea normală. Ca DEFAULT, calea aia nu mai există.

create or replace function gen_token()
returns text
language sql
volatile
as $$
  select translate(encode(gen_random_bytes(32), 'base64'), '+/=', '-_');
$$;

-- ── contacts ────────────────────────────────────────────────────────────────

create table contacts (
  id                     uuid primary key default gen_random_uuid(),
  email                  text not null unique,
  nume                   text not null,
  firma_rol              text,
  -- Bifa opțională din formular: „Vreau o discuție despre procesele mele."
  -- FAQ-ul promite explicit: „Dacă n-o bifezi, nu te caută nimeni."
  consimtamant_marketing boolean not null default false,
  created_at             timestamptz not null default now()
);

-- Email-ul se normalizează la lowercase în aplicație (Zod `.transform`), dar
-- indexul îl impune și aici: două înscrieri cu „Ion@x.ro" și „ion@x.ro" sunt
-- același om.
create unique index contacts_email_lower_idx on contacts (lower(email));

-- ── event_registrations ─────────────────────────────────────────────────────

create table event_registrations (
  id                      uuid primary key default gen_random_uuid(),
  contact_id              uuid not null references contacts(id) on delete cascade,
  event_slug              text not null default 'workshop-2026-09-16',

  -- `anulat` e nou față de spec (B8). Spec-ul folosea `no_show` și pentru cine
  -- anunță că nu vine, și pentru cine dispare fără răspuns. Ambele eliberează
  -- locul, dar pe primul îl inviți la workshopul următor, pe al doilea nu —
  -- iar după eveniment nu mai poți reconstrui diferența.
  status                  text not null default 'inscris'
                          check (status in ('inscris','asteptare','reconfirmat',
                                            'anulat','no_show','prezent')),

  sursa                   text,
  sursa_detaliu           text,
  nivel_ai                text,
  proces                  text,
  -- Setul de calificare Q1–Q5 (D4). jsonb ca să nu blocheze schema dacă setul
  -- se schimbă la workshopul următor.
  qualification_answers   jsonb not null default '{}'::jsonb,

  -- Obligatoriu, strict pentru prelucrarea datelor în scopul workshopului.
  consimtamant_comunicare boolean not null,

  confirm_token           text not null unique default gen_token(),
  checkin_token           text not null unique default gen_token(),

  created_at              timestamptz not null default now(),
  -- B11: dacă Supabase reușește și Inngest eșuează definitiv, omul e în bază
  -- fără să primească niciun email și nimeni nu află. Coloana asta face
  -- starea vizibilă pentru jobul de reconciliere.
  welcome_sent_at         timestamptz,
  reconfirmed_at          timestamptz,
  cancelled_at            timestamptz,
  checked_in_at           timestamptz,

  unique (contact_id, event_slug)
);

-- B15: query-ul de capacitate rulează la fiecare înscriere.
create index event_registrations_slug_status_idx
  on event_registrations (event_slug, status);

-- Jobul de reconciliere caută exact rândurile astea.
create index event_registrations_welcome_pending_idx
  on event_registrations (event_slug, created_at)
  where welcome_sent_at is null;

-- ── Securitate: RLS pornit, zero politici ───────────────────────────────────
-- Spec: „Scriere doar prin API routes cu service role key — anon key nu are
-- drepturi pe niciun tabel." RLS activat fără nicio politică înseamnă exact
-- asta: `anon` și `authenticated` nu văd și nu scriu nimic. Service role
-- ocolește RLS prin design.

alter table contacts enable row level security;
alter table event_registrations enable row level security;

revoke all on contacts from anon, authenticated;
revoke all on event_registrations from anon, authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- FUNCȚII
-- Toate `security definer` cu `search_path` fixat — altfel un search_path
-- controlat de apelant poate redirecta un nume de tabel către altceva.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Înscriere ───────────────────────────────────────────────────────────────
-- Numără, decide `inscris` vs `asteptare`, inserează — într-o singură tranzacție.
--
-- Nu ia advisory lock, deliberat: pragul de 30 e un buffer *asumat* pentru
-- no-show, nu o capacitate fizică. Dacă doi oameni intră simultan la 29 și ies
-- 31 înscriși, nu s-a rupt nimic. Capacitatea reală (25) se protejează dur în
-- `claim_waitlist_seat`, unde se alocă un scaun concret.
--
-- Returnează:
--   status     — 'inscris' | 'asteptare' | 'duplicat'
--   este_nou   — false dacă adresa era deja pe listă (B4)

create or replace function register_participant(
  p_email                   text,
  p_nume                    text,
  p_firma_rol               text,
  p_sursa                   text,
  p_sursa_detaliu           text,
  p_proces                  text,
  p_nivel_ai                text,
  p_qualification           jsonb,
  p_consimtamant_comunicare boolean,
  p_vrea_discutie           boolean,
  p_event_slug              text default 'workshop-2026-09-16',
  p_prag_waitlist           int  default 30
)
returns table (
  registration_id uuid,
  status          text,
  este_nou        boolean,
  confirm_token   text,
  checkin_token   text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
-- Numele coloanelor de ieșire (`status`, `confirm_token`, `checkin_token`) intră
-- în domeniu ca variabile plpgsql și umbresc coloanele omonime din tabel.
-- Postgres refuză să ghicească și ridică „column reference is ambiguous" — la
-- RUNTIME, nu la creare. Toate referințele la coloane de aici încolo sunt
-- calificate cu alias.
declare
  v_contact_id uuid;
  v_existing   event_registrations%rowtype;
  v_ocupate    int;
  v_status     text;
begin
  -- Contactul: upsert pe email normalizat.
  insert into contacts (email, nume, firma_rol, consimtamant_marketing)
  values (lower(trim(p_email)), p_nume, p_firma_rol, coalesce(p_vrea_discutie, false))
  on conflict (email) do update
    set nume      = excluded.nume,
        firma_rol = excluded.firma_rol,
        -- Consimțământul se poate acorda, nu retrage tăcut printr-o
        -- reînscriere. Retragerea e o acțiune explicită, separată.
        consimtamant_marketing = contacts.consimtamant_marketing
                                 or excluded.consimtamant_marketing
  returning id into v_contact_id;

  -- B4: deja înscris? Nu e o eroare — e un om care a dat submit de două ori
  -- sau a uitat. Returnăm starea existentă, ca handlerul să-i arate ecranul
  -- corect și să retrimită confirmarea, în loc să dea 500.
  select er.* into v_existing
  from event_registrations er
  where er.contact_id = v_contact_id and er.event_slug = p_event_slug;

  if found then
    return query select v_existing.id, 'duplicat'::text, false,
                        v_existing.confirm_token, v_existing.checkin_token;
    return;
  end if;

  -- `no_show` și `anulat` nu ocupă loc — cine a anunțat că nu vine eliberează
  -- efectiv spațiu în bufferul de 30.
  select count(*) into v_ocupate
  from event_registrations er
  where er.event_slug = p_event_slug
    and er.status in ('inscris','asteptare','reconfirmat','prezent');

  v_status := case when v_ocupate < p_prag_waitlist then 'inscris' else 'asteptare' end;

  return query
  insert into event_registrations as er (
    contact_id, event_slug, status, sursa, sursa_detaliu, proces, nivel_ai,
    qualification_answers, consimtamant_comunicare
  )
  values (
    v_contact_id, p_event_slug, v_status, p_sursa, nullif(trim(coalesce(p_sursa_detaliu,'')), ''),
    p_proces, p_nivel_ai, coalesce(p_qualification, '{}'::jsonb), p_consimtamant_comunicare
  )
  returning er.id, er.status, true, er.confirm_token, er.checkin_token;
end;
$$;

-- ── Revendicarea unui loc din waitlist ──────────────────────────────────────
-- AICI e singurul punct din sistem care alocă un scaun fizic. Mai mulți oameni
-- primesc simultan „s-a eliberat un loc" și dau click în aceeași secundă.
--
-- Lock-ul, numărătoarea și UPDATE-ul trebuie să fie în ACEEAȘI tranzacție.
-- Corpul unei funcții plpgsql rulează într-o tranzacție implicită, deci
-- `pg_advisory_xact_lock` ține până la return. Prin `supabase-js`, în trei
-- apeluri separate, nu ar ține.
--
-- Returnează: 'revendicat' | 'plin' | 'invalid'

create or replace function claim_waitlist_seat(
  p_token      text,
  p_event_slug text default 'workshop-2026-09-16',
  p_capacitate int  default 25
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_confirmati int;
  v_updated    int;
begin
  -- Serializează toate revendicările pentru acest eveniment. Se eliberează
  -- automat la commit-ul tranzacției implicite a funcției.
  perform pg_advisory_xact_lock(hashtext(p_event_slug || '-seats'));

  -- Cap DUR pe capacitatea fizică a sălii — nu pe bufferul soft de 30.
  select count(*) into v_confirmati
  from event_registrations
  where event_slug = p_event_slug
    and status in ('reconfirmat','prezent');

  if v_confirmati >= p_capacitate then
    return 'plin';
  end if;

  -- Condiționat pe `asteptare`: dacă rândul a fost deja mutat între timp,
  -- nu se întâmplă nimic și nu alocăm de două ori.
  update event_registrations
     set status = 'reconfirmat', reconfirmed_at = now()
   where confirm_token = p_token
     and event_slug = p_event_slug
     and status = 'asteptare';

  get diagnostics v_updated = row_count;
  return case when v_updated = 1 then 'revendicat' else 'invalid' end;
end;
$$;

-- ── Reconfirmare / anulare ──────────────────────────────────────────────────
-- Toate tranzițiile condiționate pe starea de plecare, niciodată read-then-write.
--
-- Returnează: 'reconfirmat' | 'anulat' | 'deja' | 'invalid'
-- ('deja' = tokenul e valid, dar rândul e deja în starea cerută — cineva a dat
--  click de două ori pe același buton din email. Nu e o eroare.)

create or replace function respond_to_invite(
  p_token      text,
  p_vine       boolean,
  p_event_slug text default 'workshop-2026-09-16'
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status  text;
  v_updated int;
begin
  select status into v_status
  from event_registrations
  where confirm_token = p_token and event_slug = p_event_slug;

  if not found then
    return 'invalid';
  end if;

  if p_vine then
    -- Din waitlist se revendică prin `claim_waitlist_seat`, care are lock.
    -- Aici tratăm doar reconfirmarea normală.
    if v_status = 'asteptare' then
      return 'invalid';
    end if;
    if v_status in ('reconfirmat','prezent') then
      return 'deja';
    end if;

    update event_registrations
       set status = 'reconfirmat', reconfirmed_at = now()
     where confirm_token = p_token
       and status in ('inscris','anulat','no_show');

    get diagnostics v_updated = row_count;
    return case when v_updated = 1 then 'reconfirmat' else 'invalid' end;
  end if;

  -- Anulare. Se poate anula și după reconfirmare (B3 + decizia 3 din spec:
  -- buton „nu pot veni" și pe emailul din dimineața evenimentului).
  if v_status in ('anulat','no_show') then
    return 'deja';
  end if;
  if v_status = 'prezent' then
    -- E deja în sală. Nu-l scoatem.
    return 'invalid';
  end if;

  update event_registrations
     set status = 'anulat', cancelled_at = now()
   where confirm_token = p_token
     and status in ('inscris','reconfirmat','asteptare');

  get diagnostics v_updated = row_count;
  return case when v_updated = 1 then 'anulat' else 'invalid' end;
end;
$$;

-- ── Cutoff-ul de la 11:00 ───────────────────────────────────────────────────
-- Marchează no-show pe toți cei rămași `inscris` și returnează câte locuri
-- s-au eliberat. O singură rulare, un singur eveniment `seat_freed` — asta e
-- jumătatea de DB a fixului B1; cealaltă e `debounce` pe funcția Inngest.

create or replace function expire_unconfirmed(
  p_event_slug text default 'workshop-2026-09-16'
)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count int;
begin
  update event_registrations
     set status = 'no_show'
   where event_slug = p_event_slug
     and status = 'inscris';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ── Check-in ────────────────────────────────────────────────────────────────
-- Returnează: 'prezent' | 'deja' | 'invalid'

create or replace function check_in(
  p_token      text,
  p_event_slug text default 'workshop-2026-09-16'
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status  text;
  v_updated int;
begin
  select status into v_status
  from event_registrations
  where checkin_token = p_token and event_slug = p_event_slug;

  if not found then return 'invalid'; end if;
  if v_status = 'prezent' then return 'deja'; end if;

  -- Cineva care a anulat și totuși vine: îl bifăm. Sala are prioritate în fața
  -- consistenței de status — refuzul la ușă e mai scump decât un rând ciudat.
  update event_registrations
     set status = 'prezent', checked_in_at = now()
   where checkin_token = p_token
     and status in ('reconfirmat','inscris','anulat','no_show','asteptare');

  get diagnostics v_updated = row_count;
  return case when v_updated = 1 then 'prezent' else 'invalid' end;
end;
$$;

-- ── Check-in walk-in (din QR) ───────────────────────────────────────────────
-- Găsit → bifează. Negăsit → creează contact + înregistrare direct pe `prezent`.
-- Tokenii se generează prin DEFAULT și aici, chiar dacă nu vor fi folosiți.

create or replace function walk_in_check_in(
  p_email                   text,
  p_nume                    text,
  p_consimtamant_comunicare boolean,
  p_event_slug              text default 'workshop-2026-09-16'
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_contact_id uuid;
  v_updated    int;
begin
  insert into contacts (email, nume)
  values (lower(trim(p_email)), p_nume)
  on conflict (email) do update set nume = excluded.nume
  returning id into v_contact_id;

  update event_registrations
     set status = 'prezent', checked_in_at = now()
   where contact_id = v_contact_id
     and event_slug = p_event_slug
     and status <> 'prezent';

  get diagnostics v_updated = row_count;
  if v_updated = 1 then
    return 'prezent';
  end if;

  insert into event_registrations (
    contact_id, event_slug, status, sursa, consimtamant_comunicare, checked_in_at
  )
  values (
    v_contact_id, p_event_slug, 'prezent', 'walk-in', p_consimtamant_comunicare, now()
  )
  on conflict (contact_id, event_slug) do update
    set status = 'prezent', checked_in_at = now();

  return 'prezent';
end;
$$;

-- ── Utilitare ───────────────────────────────────────────────────────────────

create or replace function mark_welcome_sent(p_registration_id uuid)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update event_registrations set welcome_sent_at = now() where id = $1;
$$;

-- ── Drepturi de execuție ────────────────────────────────────────────────────
--
-- ATENȚIE, capcană Postgres: la `create function`, EXECUTE se acordă IMPLICIT
-- rolului `PUBLIC`. `revoke ... from anon, authenticated` NU atinge grantul
-- ăla — iar `anon` e membru al `PUBLIC`, deci rămâne cu drept de execuție.
--
-- Consecința concretă, dacă lipsește revoke-ul de mai jos: oricine cunoaște
-- URL-ul proiectului poate apela `POST /rest/v1/rpc/register_participant` cu
-- anon key (care e publică, e în bundle-ul de client) și poate insera înscrieri
-- direct — ocolind complet validarea Zod ȘI Turnstile. Practic, formularul
-- devine decorativ.
--
-- `revoke from PUBLIC` trebuie să vină PRIMUL; abia apoi se acordă explicit
-- cui trebuie. Verificat de tests/db/permissions.sql.

revoke all on function register_participant  from public, anon, authenticated;
revoke all on function claim_waitlist_seat   from public, anon, authenticated;
revoke all on function respond_to_invite     from public, anon, authenticated;
revoke all on function expire_unconfirmed    from public, anon, authenticated;
revoke all on function check_in              from public, anon, authenticated;
revoke all on function walk_in_check_in      from public, anon, authenticated;
revoke all on function mark_welcome_sent     from public, anon, authenticated;
revoke all on function gen_token             from public, anon, authenticated;

-- Pentru funcțiile VIITOARE nu există o soluție declarativă.
--
-- `alter default privileges ... revoke execute on functions from public` pare
-- răspunsul, dar nu funcționează: verificat pe Postgres 15, în toate ordinile.
-- Un revoke „pur" nu se stochează deloc în `pg_default_acl`, iar când există
-- și un grant, ACL-ul funcției nou create conține tot `=X/postgres` — adică
-- exact grantul către PUBLIC pe care încercam să-l prevenim.
--
-- Deci regula rămâne umană: ORICE funcție nouă adăugată aici are nevoie de
-- propriul `revoke ... from public`. Plasa de siguranță e în
-- tests/db/permissions.sql, care enumeră dinamic toate funcțiile din schemă
-- și pică dacă vreuna e executabilă de public — inclusiv una scrisă mâine,
-- de cineva care n-a citit comentariul ăsta.
