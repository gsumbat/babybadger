-- Invite choices (wireframes P23 Invite access, P24 Review and send, P25 Invite pending, P26 Invite accepted,
-- S1 Family invite).
--   * P23 "Who she'll look after": kid_ids. null = every kid in the family, now and later; a list = only those kids.
--     The sitter sees only those kids (and their care-plan items) once she has signed.
--   * P23 "What she can do": can_drive, can_trip, can_message (stored now; trips, driving and messages aren't built).
--   * P23 "Pay": rate (per hour) and pay_schedule (weekly / per shift).
-- The parent's choices go on the invite; accept_invite copies them onto family_sitters, which is what the rules read.
-- S1: preview_invite shows the sitter who invited her, which kids and the rate before she accepts (and marks the
-- invite opened for P25); decline_invite closes it.

-- ---------------------------------------------------------------- invites
alter table public.invites
  add column if not exists kid_ids      uuid[],
  add column if not exists can_drive    boolean not null default false,
  add column if not exists can_trip     boolean not null default false,
  add column if not exists can_message  boolean not null default true,
  add column if not exists rate         numeric(7, 2) check (rate is null or (rate >= 0 and rate < 10000)),
  add column if not exists pay_schedule text not null default 'weekly' check (pay_schedule in ('weekly', 'per_shift')),
  add column if not exists opened_at    timestamptz,
  add column if not exists declined_at  timestamptz;

-- ---------------------------------------------------------------- family_sitters
alter table public.family_sitters
  add column if not exists kid_ids      uuid[],
  add column if not exists can_drive    boolean not null default false,
  add column if not exists can_trip     boolean not null default false,
  add column if not exists can_message  boolean not null default true,
  add column if not exists rate         numeric(7, 2) check (rate is null or (rate >= 0 and rate < 10000)),
  add column if not exists pay_schedule text not null default 'weekly' check (pay_schedule in ('weekly', 'per_shift'));

-- New columns need their grant spelled out (existing policies still decide which rows).
grant select, insert, update, delete on public.invites to authenticated;
grant select, insert, update, delete on public.family_sitters to authenticated;
grant all on public.invites, public.family_sitters to service_role;

-- ---------------------------------------------------------------- kid visibility
-- May the signed-in sitter see this kid of this family? Only reads family_sitters (security definer, no recursion).
create or replace function public.sitter_kid_allowed(fid uuid, kid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from family_sitters
    where family_id = fid and sitter_id = auth.uid() and status = 'active'
      and (kid_ids is null or kid = any (kid_ids))
  );
$$;
revoke execute on function public.sitter_kid_allowed(uuid, uuid) from anon, public;
grant execute on function public.sitter_kid_allowed(uuid, uuid) to authenticated, service_role;

drop policy if exists kids_sitter_read on public.kids;
create policy kids_sitter_read on public.kids for select
  using (public.is_sitter_of(family_id) and public.sitter_kid_allowed(family_id, id));

drop policy if exists care_items_sitter_read on public.care_items;
create policy care_items_sitter_read on public.care_items for select
  using (public.is_sitter_of(family_id) and (kid_id is null or public.sitter_kid_allowed(family_id, kid_id)));

-- ---------------------------------------------------------------- RPCs
-- create_invite gains the P23 choices. The old two-argument version is dropped so a call with only the family and
-- name still works (the new arguments have defaults) without two overloads to choose from.
drop function if exists public.create_invite(uuid, text);
create or replace function public.create_invite(
  p_family uuid,
  p_sitter_name text,
  p_kid_ids uuid[] default null,
  p_can_drive boolean default false,
  p_can_trip boolean default false,
  p_can_message boolean default true,
  p_rate numeric default null,
  p_pay_schedule text default 'weekly'
) returns text
language plpgsql security definer set search_path = public as $$
declare c text;
begin
  if not is_parent_of(p_family) then raise exception 'not a parent of this family'; end if;
  if p_kid_ids is not null and exists (
    select 1 from unnest(p_kid_ids) k where not exists (select 1 from kids where id = k and family_id = p_family)
  ) then raise exception 'kid not in this family'; end if;
  if p_kid_ids is not null and cardinality(p_kid_ids) = 0 then raise exception 'choose at least one kid'; end if;
  -- codes are unique across all invites, used or not
  loop
    c := lpad((floor(random() * 1000000))::int::text, 6, '0');
    exit when not exists (select 1 from invites where code = c);
  end loop;
  insert into invites (family_id, code, sitter_name, created_by, kid_ids, can_drive, can_trip, can_message, rate, pay_schedule)
    values (p_family, c, coalesce(p_sitter_name, ''), auth.uid(), p_kid_ids, coalesce(p_can_drive, false),
            coalesce(p_can_trip, false), coalesce(p_can_message, true), p_rate, coalesce(p_pay_schedule, 'weekly'));
  return c;
end $$;

-- An invite that can still be used: not accepted, cancelled, declined or expired.
create or replace function public.open_invite_by_code(p_code text) returns invites
language plpgsql stable security definer set search_path = public as $$
declare inv invites;
begin
  select * into inv from invites where code = p_code and accepted_at is null and cancelled_at is null and declined_at is null;
  if not found then raise exception 'invite code not found or already used'; end if;
  if inv.expires_at < now() then raise exception 'invite code expired'; end if;
  return inv;
end $$;
revoke execute on function public.open_invite_by_code(text) from anon, public, authenticated;

-- S1: what the sitter sees before accepting. Marks the invite opened (P25 "Opened").
create or replace function public.preview_invite(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare inv invites; res jsonb;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  inv := open_invite_by_code(p_code);
  if is_parent_of(inv.family_id) then raise exception 'you are a parent in this family'; end if;
  update invites set opened_at = coalesce(opened_at, now()) where id = inv.id;
  select jsonb_build_object(
    'family_id', f.id,
    'family_name', f.name,
    'invited_by', coalesce((select full_name from profiles where id = inv.created_by), ''),
    'rate', inv.rate,
    'pay_schedule', inv.pay_schedule,
    'kids', coalesce((
      select jsonb_agg(jsonb_build_object('name', k.name, 'color', k.color,
                                          'age', case when k.birthdate is null then null else date_part('year', age(k.birthdate))::int end)
                       order by k.created_at)
      from kids k where k.family_id = inv.family_id and (inv.kid_ids is null or k.id = any (inv.kid_ids))
    ), '[]'::jsonb)
  ) into res
  from families f where f.id = inv.family_id;
  return res;
end $$;

create or replace function public.decline_invite(p_code text) returns void
language plpgsql security definer set search_path = public as $$
declare inv invites;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  inv := open_invite_by_code(p_code);
  update invites set declined_at = now() where id = inv.id;
end $$;

create or replace function public.accept_invite(p_code text, p_your_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare inv invites;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into inv from invites where code = p_code and accepted_at is null and cancelled_at is null and declined_at is null for update;
  if not found then raise exception 'invite code not found or already used'; end if;
  if inv.expires_at < now() then raise exception 'invite code expired'; end if;
  if is_parent_of(inv.family_id) then raise exception 'you are a parent in this family'; end if;
  insert into profiles (id, full_name, role) values (auth.uid(), p_your_name, 'sitter')
    on conflict (id) do update set full_name = case when profiles.full_name = '' then excluded.full_name else profiles.full_name end,
                                   role = coalesce(profiles.role, 'sitter');
  update invites set accepted_by = auth.uid(), accepted_at = now(), opened_at = coalesce(opened_at, now()) where id = inv.id;
  insert into family_sitters (family_id, sitter_id, status, kid_ids, can_drive, can_trip, can_message, rate, pay_schedule)
    values (inv.family_id, auth.uid(), 'needs_consent', inv.kid_ids, inv.can_drive, inv.can_trip, inv.can_message, inv.rate, inv.pay_schedule)
    on conflict (family_id, sitter_id) do update set
      status = case when family_sitters.status = 'removed' then 'needs_consent' else family_sitters.status end,
      kid_ids = excluded.kid_ids, can_drive = excluded.can_drive, can_trip = excluded.can_trip,
      can_message = excluded.can_message, rate = excluded.rate, pay_schedule = excluded.pay_schedule;
  return inv.family_id;
end $$;

revoke execute on function public.create_invite(uuid, text, uuid[], boolean, boolean, boolean, numeric, text) from anon, public;
revoke execute on function public.preview_invite(text), public.decline_invite(text), public.accept_invite(text, text) from anon, public;
grant execute on function public.create_invite(uuid, text, uuid[], boolean, boolean, boolean, numeric, text) to authenticated, service_role;
grant execute on function public.preview_invite(text), public.decline_invite(text), public.accept_invite(text, text) to authenticated, service_role;

-- P23 "Can message you": when a parent turns it off, the sitter can still read the thread but not write to it.
-- (Replaces migration 10's helper, which runs before this file adds the column.)
create or replace function public.can_write_thread(fid uuid, sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_sitter_of_family(fid, sid) and (
    public.is_parent_of(fid)
    or (sid = auth.uid() and public.is_sitter_of(fid)
        and coalesce((select fs.can_message from public.family_sitters fs where fs.family_id = fid and fs.sitter_id = sid), true))
  );
$$;
