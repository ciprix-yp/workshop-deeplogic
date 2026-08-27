-- ════════════════════════════════════════════════════════════════════════════
-- Rate limiting — fereastră fixă, numărată atomic în Postgres.
--
-- De ce aici și nu în Cloudflare KV/Rate Limiting binding: la momentul scrierii,
-- accesul Cloudflare din sesiune a expirat (token MCP), deci nu s-a putut
-- provizona un namespace nou. Mai important, e și alegerea mai consistentă cu
-- restul proiectului — toată logica atomică trăiește deja în funcții Postgres
-- (§ CLAUDE.md), nu împrăștiată în handler. Dacă Cloudflare Rate Limiting
-- devine disponibil mai târziu, asta rămâne oricum linia a doua de apărare,
-- nu singura — Turnstile e prima.
--
-- IP-ul brut NU ajunge niciodată aici: se dă hash-uit din Worker (unde e
-- disponibil din request), înainte de a intra în Postgres. Vezi src/lib/rate-limit.ts.
-- ════════════════════════════════════════════════════════════════════════════

create table rate_limit_hits (
  bucket        text not null,
  window_start  timestamptz not null,
  hits          int not null default 1,
  primary key (bucket, window_start)
);

alter table rate_limit_hits enable row level security;
revoke all on rate_limit_hits from public, anon, authenticated;

-- Fereastra curentă e citită des (la fiecare cerere); ferestrele vechi, aproape
-- deloc. Un index pe window_start ajută eventuala curățare periodică — la
-- volumul evenimentului ăsta (sub 100 de înscrieri așteptate), tabelul rămâne
-- oricum mic, deci curățarea nu e urgentă pentru 16 septembrie.
create index rate_limit_hits_window_idx on rate_limit_hits (window_start);

-- ── Funcția ──────────────────────────────────────────────────────────────────
--
-- Fereastră FIXĂ, nu culisantă: simplu de raționat, suficient pentru abuz de
-- bot. Dezavantajul cunoscut — cineva chiar la marginea ferestrei poate atinge
-- până la 2× limita într-un interval scurt — e acceptabil aici, unde Turnstile
-- e oricum prima linie de apărare.
--
-- `insert ... on conflict do update returning hits` e atomic: două cereri
-- simultane din același bucket nu pot amândouă citi hits=0 și scrie hits=1.

create or replace function check_rate_limit(
  p_bucket    text,
  p_limita    int,
  p_fereastra interval
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_secunde_fereastra double precision := extract(epoch from p_fereastra);
  v_window timestamptz;
  v_hits   int;
begin
  if p_bucket is null or length(p_bucket) = 0 then
    raise exception 'check_rate_limit: bucket gol';
  end if;

  v_window := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / v_secunde_fereastra) * v_secunde_fereastra
  );

  insert into rate_limit_hits (bucket, window_start, hits)
  values (p_bucket, v_window, 1)
  on conflict (bucket, window_start) do update
    set hits = rate_limit_hits.hits + 1
  returning hits into v_hits;

  return v_hits <= p_limita;
end;
$$;

revoke all on function check_rate_limit from public, anon, authenticated;
