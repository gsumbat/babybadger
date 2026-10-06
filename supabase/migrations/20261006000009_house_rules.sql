-- House rules (wireframes P74 House rules, P75 Add rules, P76 Rule detail, S42 sitter reads and agrees,
-- S43 today's house rules on a shift). Design note nP17.
--   * Rules are per family. Each one is Must (the sitter agrees before she can be booked) or Prefer (a wish).
--   * key = the P75 chip it came from ('meals', 'phone', ...); null = a rule the parent wrote herself.
--   * category = the P75 section: logs | phone | safety | food | home.
--   * options = rule extras from P76 (phone use: {"use": "emergencies" | "naps" | "any", "no_social": true,
--     "no_posts": true}; photo updates: {"every_hours": 2}). {} for everything else.
--   * must_since = when this Must rule last asked for a new OK (added, made Must, or its wording/options changed).
--     A trigger sets it; the app never writes it. Prefer rules have none.
-- A sitter's agreement (house_rule_agreements.agreed_at) covers the family's rules when it is newer than every
-- Must rule's must_since. So changing a Must rule asks every sitter to agree again before her next shift; a Prefer
-- change, removing a rule or relaxing Must -> Prefer doesn't.
-- Enforced here too: a parent can't book (or move a shift to) a sitter who hasn't agreed, and a sitter can't clock in
-- until she has agreed to the current Must rules.
-- Sitters read the rules from the moment they accept the invite: S42 comes before the S2 notice in the canvas flow.

create table public.house_rules (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.families (id) on delete cascade,
  key         text,
  title       text not null check (length(trim(title)) between 1 and 120),
  sub         text not null default '',
  category    text not null check (category in ('logs', 'phone', 'safety', 'food', 'home')),
  strength    text not null default 'must' check (strength in ('must', 'prefer')),
  options     jsonb not null default '{}'::jsonb,
  sort        int not null default 0,
  must_since  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (family_id, key)
);
create index house_rules_family on public.house_rules (family_id);

create table public.house_rule_agreements (
  family_id   uuid not null references public.families (id) on delete cascade,
  sitter_id   uuid not null references auth.users (id) on delete cascade,
  agreed_at   timestamptz not null default now(),
  primary key (family_id, sitter_id)
);

-- must_since is the server's to set. clock_timestamp(), not now(): an OK and a change in one transaction still order.
create or replace function public.house_rules_stamp() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.must_since := case when new.strength = 'must' then clock_timestamp() end;
  else
    new.family_id := old.family_id;
    if new.strength = 'must' and (old.strength <> 'must' or new.title is distinct from old.title
        or new.sub is distinct from old.sub or new.options is distinct from old.options) then
      new.must_since := clock_timestamp();
    elsif new.strength = 'must' then
      new.must_since := old.must_since;
    else
      new.must_since := null;
    end if;
    new.updated_at := clock_timestamp();
  end if;
  return new;
end $$;
create trigger house_rules_stamp before insert or update on public.house_rules
  for each row execute function public.house_rules_stamp();

-- The agreement time is always now, and an agreement can't be moved to another family or sitter.
create or replace function public.house_rule_agreements_stamp() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    new.family_id := old.family_id;
    new.sitter_id := old.sitter_id;
  end if;
  new.agreed_at := clock_timestamp();
  return new;
end $$;
create trigger house_rule_agreements_stamp before insert or update on public.house_rule_agreements
  for each row execute function public.house_rule_agreements_stamp();

-- Has this sitter agreed to the family's current Must rules? True when the family has none.
create or replace function public.house_rules_agreed(fid uuid, uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select max(must_since) from house_rules where family_id = fid and strength = 'must'), '-infinity'::timestamptz)
      <= coalesce((select agreed_at from house_rule_agreements where family_id = fid and sitter_id = uid), '-infinity'::timestamptz);
$$;

-- Booking and clock-in gate.
create or replace function public.shifts_house_rules_gate() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('scheduled', 'active') and (tg_op = 'INSERT' or new.sitter_id <> old.sitter_id)
      and not house_rules_agreed(new.family_id, new.sitter_id) then
    raise exception 'this sitter hasn''t agreed to your house rules yet';
  end if;
  if tg_op = 'UPDATE' and new.status = 'active' and old.status = 'scheduled'
      and not house_rules_agreed(new.family_id, new.sitter_id) then
    raise exception 'agree to the family''s house rules first';
  end if;
  return new;
end $$;
create trigger shifts_house_rules_gate before insert or update on public.shifts
  for each row execute function public.shifts_house_rules_gate();

-- ---------------------------------------------------------------- row level security
alter table public.house_rules enable row level security;
alter table public.house_rule_agreements enable row level security;

create policy house_rules_parent on public.house_rules for all
  using (public.is_parent_of(family_id)) with check (public.is_parent_of(family_id));
create policy house_rules_sitter_read on public.house_rules for select using (public.is_sitter_of(family_id, false));

create policy house_rule_agreements_read on public.house_rule_agreements for select
  using (sitter_id = auth.uid() or public.is_parent_of(family_id));
create policy house_rule_agreements_self_insert on public.house_rule_agreements for insert
  with check (sitter_id = auth.uid() and public.is_sitter_of(family_id, false));
create policy house_rule_agreements_self_update on public.house_rule_agreements for update
  using (sitter_id = auth.uid() and public.is_sitter_of(family_id, false))
  with check (sitter_id = auth.uid() and public.is_sitter_of(family_id, false));

-- ---------------------------------------------------------------- grants
-- The blanket grant in 20261005000003_grants.sql only covered tables and functions that existed then.
grant select, insert, update, delete on public.house_rules to authenticated;
grant select, insert, update on public.house_rule_agreements to authenticated;
grant all on public.house_rules, public.house_rule_agreements to service_role;
revoke all on public.house_rules, public.house_rule_agreements from anon;
-- New functions are executable by PUBLIC by default. Only the triggers use these; the app works out the same answer
-- from the rows it can read.
revoke execute on function public.house_rules_stamp() from public, anon, authenticated;
revoke execute on function public.house_rule_agreements_stamp() from public, anon, authenticated;
revoke execute on function public.shifts_house_rules_gate() from public, anon, authenticated;
revoke execute on function public.house_rules_agreed(uuid, uuid) from public, anon, authenticated;
grant execute on function public.house_rules_agreed(uuid, uuid) to service_role;
