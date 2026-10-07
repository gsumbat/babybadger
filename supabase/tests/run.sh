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
# pg_net is a Supabase extension; the stub above stands in for it.
sed '/create extension if not exists pg_net/d' migrations/20261006000005_push.sql | $P -d t
$P -d t -f migrations/20261006000006_care_plan.sql
$P -d t -f migrations/20261006000007_kid_gender.sql
$P -d t -f migrations/20261006000008_care_repeat.sql
$P -d t -f migrations/20261006000009_house_rules.sql
$P -d t -f migrations/20261006000010_messages.sql
$P -d t -f migrations/20261006000011_invite_access.sql
$P -d t -f migrations/20261006000012_availability.sql
$P -d t -f migrations/20261006000013_invite_preview_birthdate.sql
$P -d t -f migrations/20261006000014_shift_timing.sql
$P -d t -f migrations/20261006000015_incidents_alerts.sql
$P -d t -f migrations/20261006000016_places.sql
$P -d t -f migrations/20261006000017_trips.sql
$P -d t -f migrations/20261006000018_trip_names.sql
$P -d t -f migrations/20261006000019_sitter_credentials.sql
$P -d t -f migrations/20261006000020_family_requirements.sql
$P -d t -f migrations/20261006000021_family_setup.sql
$P -d t -f migrations/20261006000022_more_requirements.sql
$P -d t -f migrations/20261006000023_sitter_birthdate.sql
$P -d t -f migrations/20261006000024_billing.sql
$P -d t -f migrations/20261006000025_pool_requests.sql
$P -d t -f migrations/20261006000026_log_reactions.sql
$P -d t -f tests/rls_scenarios.sql
