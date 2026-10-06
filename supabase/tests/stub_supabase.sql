-- Minimal stand-in for Supabase's auth schema so the migrations and RLS can be tested on plain Postgres.
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key, email text);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin; end if;
end $$;
grant usage on schema public, auth to authenticated, anon;
-- No default grants: migrations must grant access explicitly (like a project with auto-expose off).
grant execute on function auth.uid() to authenticated, anon;

-- Stand-in for Supabase's pg_net: records outgoing requests instead of sending them.
create schema if not exists net;
create table if not exists net.sent (id bigserial primary key, url text, body jsonb, headers jsonb, at timestamptz default now());
create or replace function net.http_post(url text, body jsonb default '{}', params jsonb default '{}', headers jsonb default '{}', timeout_milliseconds int default 5000)
returns bigint language sql as $$ insert into net.sent (url, body, headers) values (url, body, headers) returning id $$;
