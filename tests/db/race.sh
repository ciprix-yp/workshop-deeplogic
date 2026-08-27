#!/usr/bin/env bash
#
# Test de concurență pe cursa din waitlist.
#
# Singurul punct din sistem care poate aloca fizic același scaun de două ori.
# Mai mulți oameni primesc simultan „s-a eliberat un loc" și dau click în
# aceeași secundă — dacă lock-ul nu ține, doi oameni primesc același loc și
# unul dintre ei vine degeaba la ușă.
#
# Testul folosește procese psql separate, deci conexiuni Postgres reale și
# paralele. Un test cu o singură conexiune ar trece chiar și fără lock — ar
# demonstra doar că SQL-ul e sintactic valid.
#
# Rulează:  bash tests/db/race.sh
# Cere: PGHOST/PGPORT/PGUSER setate către o bază cu migrația aplicată.

set -euo pipefail

DB="${DB:-wsdl}"
RUNDE="${RUNDE:-20}"
CONCURENTI="${CONCURENTI:-10}"
CAPACITATE=25

q() { psql -d "$DB" -tAc "$1"; }

echo "Cursa din waitlist: $RUNDE runde × $CONCURENTI cereri simultane pe 1 loc liber."
echo

esecuri=0

for runda in $(seq 1 "$RUNDE"); do
  # Stare curată.
  q "truncate event_registrations, contacts cascade;" >/dev/null

  # 24 de locuri ocupate ferm → exact unul liber sub capacitatea de 25.
  for i in $(seq 1 $((CAPACITATE - 1))); do
    q "insert into contacts (email, nume) values ('ocupat$i@t.ro','Ocupat $i');
       insert into event_registrations (contact_id, status, consimtamant_comunicare)
       select id, 'reconfirmat', true from contacts where email='ocupat$i@t.ro';" >/dev/null
  done

  # N oameni pe lista de așteptare.
  #
  # Notă: `psql -tAc` tipărește eticheta de comandă („INSERT 0 1") pe stdout
  # lângă valoarea din RETURNING, deci un `$(...)` naiv capturează ambele.
  # Insert-ul și citirea tokenului se fac separat.
  for i in $(seq 1 "$CONCURENTI"); do
    q "insert into contacts (email, nume) values ('wait$i@t.ro','Wait $i');
       insert into event_registrations (contact_id, status, consimtamant_comunicare)
       select id, 'asteptare', true from contacts where email='wait$i@t.ro';" >/dev/null
  done

  # `mapfile` cere bash 4+; macOS livrează 3.2. Forma asta merge peste tot.
  tokens=()
  while IFS= read -r linie; do
    [ -n "$linie" ] && tokens+=("$linie")
  done < <(q "select confirm_token from event_registrations
              where status='asteptare' order by created_at;")

  # Foc simultan. Fiecare psql e o conexiune separată.
  rezultate=$(mktemp)
  for tok in "${tokens[@]}"; do
    ( psql -d "$DB" -tAc "select claim_waitlist_seat('$tok');" >> "$rezultate" ) &
  done
  wait

  castigatori=$(grep -c 'revendicat' "$rezultate" || true)
  plini=$(grep -c 'plin' "$rezultate" || true)
  raspunsuri=$(grep -c . "$rezultate" || true)
  confirmati=$(q "select count(*) from event_registrations where status in ('reconfirmat','prezent');")
  rm -f "$rezultate"

  # Santinelă: dacă nu s-au întors N răspunsuri, harness-ul e stricat, nu
  # sistemul. Fără verificarea asta, un test gol arată identic cu un test
  # trecut — și „0 câștigători" ar părea un eșec de lock.
  if [ "$raspunsuri" -ne "$CONCURENTI" ]; then
    printf "  runda %2d  HARNESS  doar %s răspunsuri din %s\n" "$runda" "$raspunsuri" "$CONCURENTI"
    esecuri=$((esecuri + 1))
    continue
  fi

  if [ "$castigatori" -eq 1 ] && [ "$confirmati" -eq "$CAPACITATE" ]; then
    printf "  runda %2d  ok    câștigători=%s  plin=%s  confirmați=%s\n" \
      "$runda" "$castigatori" "$plini" "$confirmati"
  else
    printf "  runda %2d  PICA  câștigători=%s  plin=%s  confirmați=%s  (aștept 1 / %s)\n" \
      "$runda" "$castigatori" "$plini" "$confirmati" "$CAPACITATE"
    esecuri=$((esecuri + 1))
  fi
done

echo
if [ "$esecuri" -gt 0 ]; then
  echo "✗ $esecuri din $RUNDE runde au alocat greșit. Lock-ul nu ține."
  exit 1
fi
echo "✓ $RUNDE/$RUNDE runde: exact un câștigător, capacitatea respectată."
