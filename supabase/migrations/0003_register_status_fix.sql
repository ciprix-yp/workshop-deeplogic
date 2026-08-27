-- ════════════════════════════════════════════════════════════════════════════
-- Fix: register_participant returna un status SINTETIC ('duplicat') pentru
-- orice reînscriere, indiferent de starea reală a rândului existent.
--
-- Găsit înainte să fie folosit: ruta /api/register are nevoie de starea REALĂ
-- ca să aleagă ecranul corect. Cineva deja `reconfirmat` care completează din
-- nou formularul (link vechi redeschis, obicei) ar fi văzut ecranul de
-- înscriere nouă — o minciună mică, dar pe pagina asta orice text care nu
-- corespunde stării reale e exact genul de defect pe care CLAUDE.md îl
-- interzice explicit.
--
-- `create or replace function` cu aceeași semnătură — sigur, nu necesită drop.
-- ════════════════════════════════════════════════════════════════════════════

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
declare
  v_contact_id uuid;
  v_existing   event_registrations%rowtype;
  v_ocupate    int;
  v_status     text;
begin
  insert into contacts (email, nume, firma_rol, consimtamant_marketing)
  values (lower(trim(p_email)), p_nume, p_firma_rol, coalesce(p_vrea_discutie, false))
  on conflict (email) do update
    set nume      = excluded.nume,
        firma_rol = excluded.firma_rol,
        consimtamant_marketing = contacts.consimtamant_marketing
                                 or excluded.consimtamant_marketing
  returning id into v_contact_id;

  select er.* into v_existing
  from event_registrations er
  where er.contact_id = v_contact_id and er.event_slug = p_event_slug;

  if found then
    -- STAREA REALĂ, nu 'duplicat'. Apelantul decide ecranul corect din ea:
    -- `inscris`/`asteptare` → continuă fluxul normal; `reconfirmat`/`prezent`
    -- → „ne vedem miercuri", nu „gata, te-ai înscris"; `anulat`/`no_show` →
    -- îndrumare separată, fără să reactiveze silențios o înscriere anulată.
    return query select v_existing.id, v_existing.status, false,
                        v_existing.confirm_token, v_existing.checkin_token;
    return;
  end if;

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

revoke all on function register_participant from public, anon, authenticated;
