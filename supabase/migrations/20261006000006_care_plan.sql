-- Care plan (wireframes P7 Care plan, P20 Routine, P20a Routine item).
-- One row per thing the sitter should do: a nap, a bottle, a meal, bedtime, a pick-up...
--   * kid_id null  = a whole-family task (P7 "Tasks"); set = part of that kid's day (P20).
--   * days is a weekday bitmask: Sun=1, Mon=2, Tue=4, Wed=8, Thu=16, Fri=32, Sat=64 (127 = every day).
-- Parents of the family manage it; a sitter reads it only once she is an active sitter (signed the notice).

create table public.care_items (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.families (id) on delete cascade,
  kid_id      uuid references public.kids (id) on delete cascade,
  type        text not null check (type in ('nap', 'bottle', 'meal', 'diaper', 'bedtime', 'medicine', 'activity', 'other')),
  title       text not null default '',
  starts      time,
  ends        time,
  days        smallint not null default 127 check (days between 0 and 127),
  how         text not null default '',
  created_at  timestamptz not null default now()
);
create index care_items_family on public.care_items (family_id);
create index care_items_kid on public.care_items (kid_id);

-- A kid item must belong to the same family as the kid.
create or replace function public.kid_family(kid uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select family_id from kids where id = kid;
$$;

alter table public.care_items enable row level security;

create policy care_items_parent on public.care_items for all
  using (public.is_parent_of(family_id))
  with check (public.is_parent_of(family_id) and (kid_id is null or public.kid_family(kid_id) = family_id));
create policy care_items_sitter_read on public.care_items for select using (public.is_sitter_of(family_id));

-- The blanket grant in 20261005000003_grants.sql only covered tables that existed then.
grant select, insert, update, delete on public.care_items to authenticated;
grant all on public.care_items to service_role;
revoke all on public.care_items from anon;
revoke execute on function public.kid_family(uuid) from anon, public;
grant execute on function public.kid_family(uuid) to authenticated, service_role;
