-- ════════════════════════════════════════════════════════════════════════════
-- Retenția de 1 an (Politica de Confidențialitate §5) — automatizare reală,
-- nu doar promisiune în text. Vezi docs/DECIZII.md § „F9 — Politica de
-- Confidențialitate" pentru discrepanța găsită și decizia lui Ciprian de a
-- construi mecanismul, nu doar reformula copy-ul.
--
-- Scop pe rând din `contacts`, nu pe `event_registrations`: politica promite
-- ștergerea DATELOR PERSONALE (nume, email, firma_rol), care trăiesc pe
-- contact, nu pe o înregistrare de eveniment anume. `on delete cascade` de pe
-- `event_registrations.contact_id` (0001_init.sql) șterge automat și
-- înscrierile asociate.
--
-- LIMITARE CUNOSCUTĂ, deliberat neadresată acum: dacă Deep Logic organizează
-- vreodată un AL DOILEA eveniment, ștergerea unui contact la 1 an de la
-- PRIMA lui înscriere ar lua cu ea și o înscriere recentă la al doilea
-- eveniment. Sistemul de azi are un singur eveniment (`EVENT_SLUG` hardcodat
-- peste tot) — arhitectura de multi-eveniment e explicit în afara scopului
-- (docs/DECIZII.md § „Ce a rămas deliberat în afara scopului"). Revizuit
-- atunci, nu acum.
-- ════════════════════════════════════════════════════════════════════════════

alter table contacts
  add column retention_notice_sent_at  timestamptz,
  add column retention_reconfirmed_at  timestamptz,
  add column retention_token           text not null unique default gen_token();

-- Interogarea zilnică (sweep-ul Inngest) caută exact rândurile astea.
create index contacts_retention_pending_idx
  on contacts (created_at)
  where retention_notice_sent_at is null;

-- ── Contactele scadente pentru notificare ────────────────────────────────────
-- „Scadent" = 1 an de la ultima confirmare (sau de la colectare, dacă nu s-a
-- reconfirmat niciodată) ȘI nicio notificare trimisă încă pentru ciclul curent.
--
-- `coalesce(retention_reconfirmed_at, created_at)`: o reconfirmare repornește
-- ceasul de la momentul ei, nu de la înscrierea originală — exact cum
-- promite politica („veți fi contactat pentru reconfirmarea dorinței... ").

create or replace function find_contacts_due_for_retention_notice(
  p_prag_retentie interval default '1 year'
)
returns table (
  contact_id      uuid,
  email           text,
  nume            text,
  retention_token text
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select c.id, c.email, c.nume, c.retention_token
  from contacts c
  where c.retention_notice_sent_at is null
    and coalesce(c.retention_reconfirmed_at, c.created_at) <= now() - p_prag_retentie;
$$;

create or replace function mark_retention_notice_sent(p_contact_id uuid)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update contacts set retention_notice_sent_at = now() where id = p_contact_id;
$$;

-- ── Reconfirmare — link din emailul de retenție ─────────────────────────────
-- Prin GET nu se mută nicio stare (regula B2 generală din CLAUDE.md e
-- scopată la tot proiectul, nu doar la /raspuns) — pagina randează, ruta
-- POST /api/pastreaza-datele apelează funcția asta.
--
-- Returnează: 'reconfirmat' | 'invalid'

create or replace function reconfirm_retention(p_token text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_updated int;
begin
  update contacts
     set retention_reconfirmed_at = now(),
         retention_notice_sent_at = null
   where retention_token = p_token;

  get diagnostics v_updated = row_count;
  return case when v_updated = 1 then 'reconfirmat' else 'invalid' end;
end;
$$;

-- ── Curățenia efectivă ───────────────────────────────────────────────────────
-- Șterge contactele notificate acum mai mult de `p_fereastra_raspuns` fără
-- reconfirmare. Întoarce DOAR un număr, niciodată emailuri/nume — jurnalul
-- unui job care șterge date personale n-are voie să rețină exact ce a șters.

create or replace function purge_expired_retention(
  p_fereastra_raspuns interval default '30 days'
)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count int;
begin
  delete from contacts
   where retention_notice_sent_at is not null
     and retention_notice_sent_at <= now() - p_fereastra_raspuns;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ── Drepturi de execuție ──────────────────────────────────────────────────────
-- Aceeași capcană documentată în 0001_init.sql: EXECUTE se acordă implicit
-- lui PUBLIC la creare. Fără revoke explicit, oricine cu anon key ar putea
-- goli tabelul `contacts` direct prin PostgREST.

revoke all on function find_contacts_due_for_retention_notice from public, anon, authenticated;
revoke all on function mark_retention_notice_sent              from public, anon, authenticated;
revoke all on function reconfirm_retention                     from public, anon, authenticated;
revoke all on function purge_expired_retention                 from public, anon, authenticated;
