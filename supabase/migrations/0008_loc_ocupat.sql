-- Predicat unic pentru „loc ocupat", aplicat pe TOATE căile care creează unul.
--
-- Bug real, găsit la review-ul din 10 septembrie 2026 (B-1 și B-2 din audit).
-- Migrația 0007 a unificat CIFRA (25 și 30 au devenit amândouă 30), dar nu
-- NUMITORUL: cele două porți de capacitate numărau seturi diferite de statusuri.
--
--   register_participant  (0003) : inscris, asteptare, reconfirmat, prezent
--   claim_waitlist_seat   (0007) :                     reconfirmat, prezent
--
-- Până pe 14 septembrie 09:00 nimeni nu e `reconfirmat` — reconfirmarea încă
-- nu s-a cerut. Deci poarta de revendicare vedea 0 din 30 ocupate și aproba
-- FIECARE revendicare, peste cei 30 care dețineau deja locuri ca `inscris`.
-- O singură anulare, cu waitlist nevid, putea produce ~59 de oameni pentru 30
-- de scaune. Advisory lock-ul funcționa impecabil: serializa corect o
-- predicație greșită.
--
-- A doua jumătate a aceleiași greșeli: `respond_to_invite` muta în
-- `reconfirmat` plecând și din `anulat`/`no_show` — statusuri care NU ocupă loc
-- — fără lock și fără renumărare. Locul se năștea din nimic.
--
-- ── Predicatul corect ──────────────────────────────────────────────────────
--
-- „Loc ocupat" = `inscris`, `reconfirmat`, `prezent`.
--   · `inscris`    — locul e al lui până anulează sau devine `no_show` la cutoff
--                    (decizie Ciprian, 10 septembrie: „30 înseamnă 30", niciun
--                    buffer ascuns de suprarezervare)
--   · `asteptare`  — NU ocupă loc; sunt exact cei care revendică
--   · `anulat`     — a eliberat locul
--   · `no_show`    — a eliberat locul
--
-- De ce `register_participant` NU se schimbă: el răspunde la o întrebare
-- DIFERITĂ — „un om NOU intră direct sau pe listă?" — și trebuie să numere și
-- waitlist-ul, altfel pagina ar arăta locuri disponibile exact când un submit
-- real ar fi trimis pe listă. Aceeași asimetrie e legitimă pentru contorul
-- public (`locuriDisponibilePublic()`). Bug-ul era doar la porțile care
-- ALOCĂ un scaun fizic.
--
-- ── Unde se aplică poarta, și unde NU ─────────────────────────────────────
--
-- Critic: poarta se aplică DOAR pe revenirea din `anulat`/`no_show`. Pe
-- `inscris → reconfirmat` NU se aplică, fiindcă omul ocupă deja locul pe care
-- l-ar verifica — gardată acolo, fiecare reconfirmare legitimă ar fi refuzată
-- exact când sala e plină, adică exact când toți reconfirmă.

-- ── claim_waitlist_seat: adaugă `inscris` la numărătoare ──────────────────

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
  v_ocupate int;
  v_updated int;
begin
  perform pg_advisory_xact_lock(hashtext(p_event_slug || '-seats'));

  select count(*) into v_ocupate
  from event_registrations
  where event_slug = p_event_slug
    and status in ('inscris','reconfirmat','prezent');

  if v_ocupate >= p_capacitate then
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

-- ── respond_to_invite: poartă pe revenirea din anulat/no_show ─────────────
--
-- Valoare de retur nouă: `pe_asteptare`. Cerută explicit (Ciprian,
-- 10 septembrie): cine revine după ce a anulat, iar sala s-a umplut între
-- timp, nu primește un refuz sec — e trecut automat pe lista de așteptare,
-- deci prinde următorul broadcast de loc eliberat.

-- Semnătura rămâne EXACT cea din 0001 — 3 parametri, fără `p_capacitate`.
-- Capcană reală, prinsă de suita SQL înainte de deploy: `create or replace`
-- cu o semnătură DIFERITĂ nu înlocuiește funcția, ci adaugă o supraîncărcare.
-- Cu ambele variante prezente, apelul aplicației (`p_token`, `p_vine`,
-- `p_event_slug`) devine ambiguu și Postgres refuză: „function ... is not
-- unique". Ar fi picat fiecare reconfirmare și fiecare anulare în producție,
-- imediat după migrație.
--
-- Deci capacitatea e literal aici. Al treilea loc unde stă cifra 30, lângă
-- `claim_waitlist_seat.p_capacitate` și `register_participant.p_prag_waitlist`
-- — o sursă unică în SQL ar fi de făcut, dar nu într-o migrație de urgență cu
-- 6 zile înainte de eveniment.

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
  v_capacitate constant int := 30;
  v_status  text;
  v_ocupate int;
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
    if v_status = 'asteptare' then
      return 'invalid';
    end if;
    if v_status in ('reconfirmat','prezent') then
      return 'deja';
    end if;

    -- `inscris` ocupă deja locul: reconfirmarea nu schimbă ocuparea, deci
    -- nicio poartă de capacitate (vezi nota de sus — gardat aici, ar refuza
    -- fiecare reconfirmare legitimă la sală plină).
    if v_status = 'inscris' then
      update event_registrations
         set status = 'reconfirmat', reconfirmed_at = now()
       where confirm_token = p_token
         and status = 'inscris';

      get diagnostics v_updated = row_count;
      return case when v_updated = 1 then 'reconfirmat' else 'invalid' end;
    end if;

    -- Revenire din `anulat`/`no_show`: locul a fost eliberat și poate fi
    -- plecat deja. Aceeași poartă și același lock ca la revendicarea din
    -- waitlist — altfel omul ar reintra peste capacitate.
    perform pg_advisory_xact_lock(hashtext(p_event_slug || '-seats'));

    select count(*) into v_ocupate
    from event_registrations
    where event_slug = p_event_slug
      and status in ('inscris','reconfirmat','prezent');

    if v_ocupate >= v_capacitate then
      update event_registrations
         set status = 'asteptare'
       where confirm_token = p_token
         and status in ('anulat','no_show');

      get diagnostics v_updated = row_count;
      return case when v_updated = 1 then 'pe_asteptare' else 'invalid' end;
    end if;

    update event_registrations
       set status = 'reconfirmat', reconfirmed_at = now()
     where confirm_token = p_token
       and status in ('anulat','no_show');

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
