-- Sitter availability and time off (wireframe S11; shown on the calendars S6 / S6a / S6c and P6c).
--   * sitter_availability: one row per weekday the sitter is available, with her hours. No row = unavailable that day.
--     weekday follows JavaScript's Date.getDay(): 0 = Sunday ... 6 = Saturday.
--   * sitter_time_off: whole days off, first and last day included (S11 "Time off · Oct 16 – 18").
-- The sitter manages her own rows. Parents of a family where she is an ACTIVE sitter (signed the notice) can read her
-- weekly hours, and her time off only through family_sitter_time_off(): sitter, first day, last day. Never the note,
-- and never which other family booked her (P6c "Maya away", no reason given).

create table public.sitter_availability (
  sitter_id  uuid not null references public.profiles (id) on delete cascade,
  weekday    smallint not null check (weekday between 0 and 6),
  starts     time not null,
  ends       time not null,
  updated_at timestamptz not null default now(),
  primary key (sitter_id, weekday),
  check (starts <> ends)
);

create table public.sitter_time_off (
  id         uuid primary key default gen_random_uuid(),
  sitter_id  uuid not null references public.profiles (id) on delete cascade,
  starts     date not null,
  ends       date not null,
  note       text not null default '',
  created_at timestamptz not null default now(),
  check (ends >= starts)
);
create index sitter_time_off_sitter on public.sitter_time_off (sitter_id, ends);

-- Is this sitter active in a family the signed-in user is a parent of?
create or replace function public.is_my_active_sitter(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from family_sitters fs
    join family_parents fp on fp.family_id = fs.family_id
    where fs.sitter_id = sid and fs.status = 'active' and fp.user_id = auth.uid()
  );
$$;

alter table public.sitter_availability enable row level security;
alter table public.sitter_time_off enable row level security;

create policy sitter_availability_own on public.sitter_availability for all
  using (sitter_id = auth.uid()) with check (sitter_id = auth.uid());
create policy sitter_availability_parent_read on public.sitter_availability for select
  using (public.is_my_active_sitter(sitter_id));

-- Only the sitter reads the table itself (it holds her note).
create policy sitter_time_off_own on public.sitter_time_off for all
  using (sitter_id = auth.uid()) with check (sitter_id = auth.uid());

-- Parents: time off of the family's active sitters, dates only. Ranges that ended before p_from are left out.
create or replace function public.family_sitter_time_off(p_family uuid, p_from date default current_date - 62)
returns table (sitter_id uuid, starts date, ends date)
language sql stable security definer set search_path = public as $$
  select t.sitter_id, t.starts, t.ends
  from sitter_time_off t
  join family_sitters fs on fs.sitter_id = t.sitter_id and fs.family_id = p_family and fs.status = 'active'
  where public.is_parent_of(p_family) and t.ends >= p_from
  order by t.starts;
$$;

-- The blanket grant in 20261005000003_grants.sql only covered tables that existed then.
grant select, insert, update, delete on public.sitter_availability to authenticated;
grant select, insert, update, delete on public.sitter_time_off to authenticated;
grant all on public.sitter_availability, public.sitter_time_off to service_role;
revoke all on public.sitter_availability, public.sitter_time_off from anon;
revoke execute on function public.is_my_active_sitter(uuid) from anon, public;
revoke execute on function public.family_sitter_time_off(uuid, date) from anon, public;
grant execute on function public.is_my_active_sitter(uuid) to authenticated, service_role;
grant execute on function public.family_sitter_time_off(uuid, date) to authenticated, service_role;
