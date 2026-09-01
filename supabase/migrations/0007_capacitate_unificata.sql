-- Unifică capacitatea: 25 (cap dur, claim_waitlist_seat) și 30 (buffer soft,
-- register_participant) devin AMBELE 30.
--
-- De ce acum: pagina capătă un contor LIVE de locuri disponibile (pivot de
-- produs 2026-08-31, „PRIMUL PAS"). Regula sursei e explicită — „fără deficit
-- fals; afișează doar date reale". Cu vechea asimetrie (pagina afirmă 25,
-- sistemul acceptă 30), un contor live ar fi trebuit fie să mintă („30
-- disponibile" cât timp doar 25 pot fi fizic onorate), fie să dezvăluie
-- bufferul ascuns exact acolo unde promisiunea de onestitate a paginii ar
-- fi cel mai vizibil încălcată. Cifra stată pe pagină e acum și cifra hard
-- aplicată în bază — un singur număr, niciun buffer secret.
--
-- `register_participant` (migrația 0001) avea deja default 30 la
-- `p_prag_waitlist` — nu se schimbă. Doar `claim_waitlist_seat` se modifică,
-- de la 25 la 30, la `p_capacitate`.

create or replace function claim_waitlist_seat(
  p_token      text,
  p_event_slug text default 'workshop-2026-09-16',
  p_capacitate int  default 30
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
  perform pg_advisory_xact_lock(hashtext(p_event_slug || '-seats'));

  select count(*) into v_confirmati
  from event_registrations
  where event_slug = p_event_slug
    and status in ('reconfirmat','prezent');

  if v_confirmati >= p_capacitate then
    return 'plin';
  end if;

  update event_registrations
     set status = 'reconfirmat', reconfirmed_at = now()
   where confirm_token = p_token
     and event_slug = p_event_slug
     and status = 'asteptare';

  get diagnostics v_updated = row_count;
  return case when v_updated = 1 then 'revendicat' else 'invalid' end;
end;
$$;
