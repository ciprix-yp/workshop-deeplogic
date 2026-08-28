-- ════════════════════════════════════════════════════════════════════════════
-- Înlocuiește expire_unconfirmed() (sweep în bloc) cu expire_if_unconfirmed()
-- (per rând) — greșeală de design prinsă înainte să fie folosită, la scrierea
-- funcției Inngest care o apelează efectiv.
--
-- Motivul: fiecare persoană înscrisă are propria instanță de funcție Inngest
-- (`workshop/registered`), care doarme până la cutoff-ul de 11:00 și ATUNCI
-- decide dacă trimite email 3 sau marchează no-show. Un sweep în bloc
-- ("marchează TOATE rândurile încă `inscris`") nu spune fiecărei instanțe
-- dacă rândul EI ANUME tocmai s-a schimbat — iar fără informația aia,
-- instanța nu poate decide corect dacă emite `workshop/seat_freed`.
--
-- Varianta per-rând rezolvă asta natural: fiecare instanță marchează DOAR
-- rândul ei, condiționat. Până la 25-30 de instanțe se trezesc în aceeași
-- secundă la cutoff — fiecare emite propriul eveniment `seat_freed`, iar
-- `debounce` + `singleton` de pe funcția care le procesează (B1) le
-- coalesează într-un singur email către waitlist, exact ca la anulările
-- individuale prin /raspuns. Nu mai e nevoie de o funcție cron separată
-- doar pentru sweep-ul de la cutoff.
-- ════════════════════════════════════════════════════════════════════════════

drop function if exists expire_unconfirmed(text);

create or replace function expire_if_unconfirmed(
  p_registration_id uuid,
  p_event_slug       text default 'workshop-2026-09-16'
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_updated int;
begin
  update event_registrations
     set status = 'no_show'
   where id = p_registration_id
     and event_slug = p_event_slug
     and status = 'inscris';

  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

revoke all on function expire_if_unconfirmed from public, anon, authenticated;
