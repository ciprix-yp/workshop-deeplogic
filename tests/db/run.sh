#!/usr/bin/env bash
#
# Suita de bază de date: migrația + mașina de stări + cursa de concurență.
#
# Pornește un Postgres temporar, aplică migrația de la zero, rulează testele,
# oprește și curăță. Nu atinge Supabase și nu cere credențiale — de asta poate
# rula la fiecare commit.
#
#   bash tests/db/run.sh
#   RUNDE=50 bash tests/db/run.sh     # cursa, mai insistent
#
# Cere PostgreSQL local (client + server). Pe macOS: brew install postgresql@15

set -euo pipefail

RADACINA="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PORT="${PGTEST_PORT:-55433}"
DATADIR="${TMPDIR:-/tmp}/wsdl-pgtest-$$"

# Găsește binarele Postgres — Homebrew nu le pune în PATH implicit.
if ! command -v initdb >/dev/null 2>&1; then
  for c in /usr/local/opt/postgresql@1[5-9]/bin /opt/homebrew/opt/postgresql@1[5-9]/bin; do
    [ -d "$c" ] && export PATH="$c:$PATH" && break
  done
fi
command -v initdb >/dev/null 2>&1 || {
  echo "✗ PostgreSQL nu e instalat. brew install postgresql@15"; exit 1; }

curata() {
  pg_ctl -D "$DATADIR/data" stop -m immediate >/dev/null 2>&1 || true
  rm -rf "$DATADIR"
}
trap curata EXIT

# Acoladele sunt obligatorii: o elipsă tipografică lipită de `$PORT` intră în
# numele variabilei, iar sub `set -u` scriptul pică cu „unbound variable".
echo "Pornesc Postgres temporar pe portul ${PORT}…"
mkdir -p "$DATADIR"
initdb -D "$DATADIR/data" -U postgres --auth=trust >/dev/null 2>&1
# Socket în /tmp: calea din TMPDIR depășește limita de 103 bytes a socket-urilor
# Unix pe macOS, iar eroarea nu spune asta clar.
pg_ctl -D "$DATADIR/data" \
  -o "-p $PORT -k /tmp -c listen_addresses=127.0.0.1 -c fsync=off" \
  -l "$DATADIR/log" start >/dev/null 2>&1

export PGHOST=127.0.0.1 PGPORT="$PORT" PGUSER=postgres DB=wsdl

for _ in $(seq 1 20); do
  psql -tAc 'select 1' >/dev/null 2>&1 && break
  sleep 0.5
done

psql -tAc "create database $DB;" >/dev/null

# Reproduce configurația de roluri a Supabase, ca testele de drepturi să spună
# ceva despre producție, nu despre un Postgres gol.
#
# `service_role` primește grant EXPLICIT prin default privileges — exact cum
# face platforma. Contează pentru că revoke-ul din migrație închide accesul
# public; testul trebuie să dovedească și că NU taie rolul de care depinde
# aplicația. Un lockdown care rupe backend-ul nu e o remediere.
psql -d "$DB" -tAc "
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  alter default privileges in schema public
    grant all on routines to service_role;
  alter default privileges in schema public
    grant all on tables to service_role;
" >/dev/null

echo "Aplic migrația pe o bază goală…"
psql -d "$DB" -q -v ON_ERROR_STOP=1 -f "$RADACINA/supabase/migrations/0001_init.sql"
echo "  ok  migrația se aplică curat"

echo
psql -d "$DB" -v ON_ERROR_STOP=1 -f "$RADACINA/tests/db/state-machine.sql" 2>&1 \
  | grep -E 'NOTICE|PICA|──|✓' | sed 's/^psql:[^ ]* //; s/^NOTICE: *//'

psql -d "$DB" -v ON_ERROR_STOP=1 -f "$RADACINA/tests/db/permissions.sql" 2>&1 \
  | grep -E "NOTICE|PICA|──|✓" | sed "s/^psql:[^ ]* //; s/^NOTICE: *//"

echo
bash "$RADACINA/tests/db/race.sh"
