#!/usr/bin/env bash
# Spins up a throwaway Postgres 16, applies the migrations on top of a Supabase auth stub, runs the RLS scenarios.
set -euo pipefail
# initdb refuses to run as root: re-run as the postgres user from a readable copy
if [ "$(id -u)" = 0 ] && id postgres >/dev/null 2>&1; then
  T=$(mktemp -d); cp -r "$(dirname "$0")/.." "$T/sb"; chmod -R a+rX "$T"
  exec runuser -u postgres -- bash "$T/sb/tests/run.sh"
fi
cd "$(dirname "$0")/.."
PGBIN=${PGBIN:-/usr/lib/postgresql/16/bin}
DIR=$(mktemp -d); PORT=${PORT:-55432}
trap '$PGBIN/pg_ctl -D "$DIR" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$DIR"' EXIT
$PGBIN/initdb -D "$DIR" -U postgres -A trust >/dev/null
$PGBIN/pg_ctl -D "$DIR" -o "-p $PORT -k $DIR" -l "$DIR/log" start >/dev/null
P="psql -h $DIR -p $PORT -U postgres -v ON_ERROR_STOP=1 -q"
$P -c "create database t"
$P -d t -f tests/stub_supabase.sql
$P -d t -f migrations/20261005000001_core.sql
$P -d t -f migrations/20261005000003_grants.sql
$P -d t -f migrations/20261005000004_kid_profile.sql
$P -d t -f tests/rls_scenarios.sql
