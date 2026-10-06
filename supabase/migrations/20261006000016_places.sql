-- Homes and places (wireframes P56 Homes and places, P57 Edit a home, P58 Add a place). Design note nP14.
--   * kind 'home'  = where the kids live: a clock-in zone. A family can have more than one (two parents' homes,
--     shared custody). Each home has which kids stay there (kid_ids, null = every kid) and on which days
--     (days 0 = Sun .. 6 = Sat, null = every day), so a shift booked on those days starts there by default.
--   * kind 'place' = school, soccer, grandma's: only arrive / leave alerts, never clock-in.
--   * radius_ft = the zone size (P57 Small 75 / Medium 150 / Large 300; other values allowed 30..2000).
--   * is_main = shown first when booking; one per family. Setting a new main clears the old one (trigger).
--   * show_address = "Sitters see the address". Sitters never read the table itself: they read the
--     places_for_sitter view, which blanks the address when it's off (lat / lng stay, the geofence needs them).
--   * notes = "Arriving notes for sitters".
-- shifts.place_id = the home the shift happens at; null = the main home.
-- Re-runnable: tables / columns use "if not exists", functions "create or replace", policies are dropped first.

create table if not exists public.places (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references public.families (id) on delete cascade,
  kind          text not null check (kind in ('home', 'place')),
  name          text not null check (length(trim(name)) between 1 and 80),
  address       text,
  lat           double precision check (lat between -90 and 90),
  lng           double precision check (lng between -180 and 180),
  radius_ft     int not null default 150 check (radius_ft between 30 and 2000),
  kid_ids       uuid[],
  days          smallint[] check (days is null or days <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  is_main       boolean not null default false,
  show_address  boolean not null default true,
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  check (not is_main or kind = 'home')
);
create index if not exists places_family on public.places (family_id);
-- One main home per family.
create unique index if not exists places_one_main on public.places (family_id) where is_main;

alter table public.shifts add column if not exists place_id uuid references public.places (id) on delete set null;

-- Keeps family_id fixed, stamps updated_at, checks the kids belong to the family, and moves "main" to this home.
-- Runs as the caller, so it only ever touches rows the parent may change anyway.
create or replace function public.places_stamp() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    new.family_id := old.family_id;
    new.created_at := old.created_at;
  end if;
  new.updated_at := clock_timestamp();
  if new.kid_ids is not null and exists (
      select 1 from unnest(new.kid_ids) k where not exists (select 1 from kids where id = k and family_id = new.family_id)) then
    raise exception 'that kid isn''t in this family';
  end if;
  if new.is_main then
    update places set is_main = false where family_id = new.family_id and is_main and id <> new.id;
  end if;
  return new;
end $$;
drop trigger if exists places_stamp on public.places;
create trigger places_stamp before insert or update on public.places
  for each row execute function public.places_stamp();

-- A shift can only happen at one of its own family's homes.
create or replace function public.shifts_place_check() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.place_id is not null and (tg_op = 'INSERT' or new.place_id is distinct from old.place_id)
      and not exists (select 1 from places where id = new.place_id and family_id = new.family_id and kind = 'home') then
    raise exception 'pick one of this family''s homes';
  end if;
  return new;
end $$;
drop trigger if exists shifts_place_check on public.shifts;
create trigger shifts_place_check before insert or update of place_id on public.shifts
  for each row execute function public.shifts_place_check();

-- ---------------------------------------------------------------- row level security
-- Parents: everything in their family. Sitters: no policy on the table (it would show hidden addresses);
-- they read places_for_sitter below.
alter table public.places enable row level security;
drop policy if exists places_parent on public.places;
create policy places_parent on public.places for all
  using (public.is_parent_of(family_id)) with check (public.is_parent_of(family_id));

-- Signed (active) sitters of the family. The view runs as its owner, so it filters by family itself; parents
-- see their own family's rows here too (with the address), so one query works for both.
create or replace view public.places_for_sitter as
  select p.id, p.family_id, p.kind, p.name,
         case when p.show_address or public.is_parent_of(p.family_id) then p.address end as address,
         p.lat, p.lng, p.radius_ft, p.kid_ids, p.days, p.is_main, p.show_address, p.notes, p.created_at, p.updated_at
  from public.places p
  where public.is_sitter_of(p.family_id) or public.is_parent_of(p.family_id);

-- ---------------------------------------------------------------- grants
grant select, insert, update, delete on public.places to authenticated;
grant select on public.places_for_sitter to authenticated;
grant all on public.places to service_role;
grant select on public.places_for_sitter to service_role;
revoke all on public.places, public.places_for_sitter from anon;
revoke execute on function public.places_stamp() from public, anon, authenticated;
revoke execute on function public.shifts_place_check() from public, anon, authenticated;
