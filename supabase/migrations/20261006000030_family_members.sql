-- Family members (wireframes P12b "Family members" row, P78 Family members, P78f full, P78b / P78s Invite a family
-- member, P78c Member, P78d Join the family, M0 babybadger.app/m/<token>, P4m helper's Home). Needs migrations 28
-- (new_link_token, mask_email) and 29. Re-runnable.
--
--   * Up to 4 adults per family, counting members AND open member invites (MAX_FAMILY_MEMBERS = 4 in the app).
--   * family_parents gets role ('parent' | 'helper') and relation (Mom, Dad, Grandma, Grandpa, Aunt, Uncle, Other).
--       - parent: everything, as before.
--       - helper ("Family helper", e.g. grandma): reads the kids' care info, the schedule, the live shift, trips and
--         alerts, logs and photos, house rules and places; messages the sitter, hearts photos and asks for a photo.
--         Can't manage billing, sitters (invite / remove / pay / requirements), members, kids, the care plan, rules,
--         places or bookings.
--   * is_parent_of(fid) now means role = 'parent' (every management policy and RPC keeps using it unchanged).
--     is_family_member(fid) = any role; the read and helper paths below switch to it explicitly.
--   * family_member_invites: babybadger.app/m/<40-hex token>, 7 days, Resend (7 more days) / Cancel, optional email
--     lock (same rule as sitter invites, migration 28). Only a parent creates, resends or cancels them, through RPCs.
--   * member_invite_preview(token): anon-safe. A usable link shows the family name and the inviter's first name only.
--   * accept_member_invite(token): signed in, not a sitter account, not in another family. Joins with the invite's
--     role and relation; a helper is covered by the family's plan (no family setup, no subscription screens).
--   * Only parents invite, change roles or remove members; anyone can leave; the last parent can't leave, be removed
--     or be made a helper.
--   * Pushes: notify_parents (migration 05) and the trip / message fan-outs read family_parents, so helpers get
--     clock-in / out, logs, late / cancel, trip and arrival alerts and messages. Billing and pool-request pushes go to
--     parents only (other_parents, expire_shift_requests, billing_trial_reminder below).

-- ---------------------------------------------------------------- family_parents: role + relation
alter table public.family_parents
  add column if not exists role     text not null default 'parent',
  add column if not exists relation text;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'family_parents_role_check') then
    alter table public.family_parents add constraint family_parents_role_check check (role in ('parent', 'helper'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'family_parents_relation_check') then
    alter table public.family_parents add constraint family_parents_relation_check
      check (relation is null or relation in ('Mom', 'Dad', 'Grandma', 'Grandpa', 'Aunt', 'Uncle', 'Other'));
  end if;
end $$;

-- Read only from the app (per column); every change goes through the functions below.
revoke all on public.family_parents from anon, authenticated;
grant select (family_id, user_id, created_at, role, relation) on public.family_parents to authenticated;
grant all on public.family_parents to service_role;

-- ---------------------------------------------------------------- helpers
-- Parent = role 'parent' (management). Redefined in place, so every policy and RPC that used it keeps working.
create or replace function public.is_parent_of(fid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from family_parents where family_id = fid and user_id = auth.uid() and role = 'parent');
$$;

-- Any adult of the family (parent or helper).
create or replace function public.is_family_member(fid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from family_parents where family_id = fid and user_id = auth.uid());
$$;
revoke execute on function public.is_family_member(uuid) from anon, public;
grant execute on function public.is_family_member(uuid) to authenticated, service_role;

-- The family's parents (role 'parent'), for pushes about billing and bookings.
create or replace function public.family_parent_ids(fid uuid) returns uuid[]
language sql stable security definer set search_path = public as $$
  select array(select user_id from family_parents where family_id = fid and role = 'parent');
$$;
revoke execute on function public.family_parent_ids(uuid) from anon, public, authenticated;
grant execute on function public.family_parent_ids(uuid) to service_role;

-- First name of a family adult, or the fallback ("Jen", "the family").
create or replace function public.adult_first_name(uid uuid, fallback text) returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select nullif(split_part(trim(full_name), ' ', 1), '') from profiles where id = uid), fallback);
$$;
revoke execute on function public.adult_first_name(uuid, text) from anon, public, authenticated;

-- At most 4 adults per family (backstop; the RPCs also count open invites).
create or replace function public.family_parents_cap() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from family_parents where family_id = new.family_id) >= 4 then
    raise exception 'family_full';
  end if;
  return new;
end $$;
revoke execute on function public.family_parents_cap() from anon, public, authenticated;
drop trigger if exists family_parents_cap on public.family_parents;
create trigger family_parents_cap before insert on public.family_parents for each row execute function public.family_parents_cap();

-- A family member can't also be one of the family's sitters (accept_invite only checked parents).
create or replace function public.family_sitters_not_member() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status <> 'removed' and exists (select 1 from family_parents where family_id = new.family_id and user_id = new.sitter_id) then
    raise exception 'you are a parent in this family';
  end if;
  return new;
end $$;
revoke execute on function public.family_sitters_not_member() from anon, public, authenticated;
drop trigger if exists family_sitters_not_member on public.family_sitters;
create trigger family_sitters_not_member before insert or update on public.family_sitters
  for each row execute function public.family_sitters_not_member();

-- ---------------------------------------------------------------- reads widened to every member
-- profiles: members see each other's name; members see their sitters' names (sitters still see the family's adults).
drop policy if exists profiles_related on public.profiles;
create policy profiles_related on public.profiles for select using (
  exists (select 1 from family_sitters fs where fs.sitter_id = profiles.id and public.is_family_member(fs.family_id))
  or exists (select 1 from family_parents fp where fp.user_id = profiles.id and (public.is_family_member(fp.family_id) or public.is_sitter_of(fp.family_id, false)))
);

drop policy if exists families_read on public.families;
create policy families_read on public.families for select using (public.is_family_member(id) or public.is_sitter_of(id, false));

drop policy if exists family_parents_read on public.family_parents;
create policy family_parents_read on public.family_parents for select using (public.is_family_member(family_id) or public.is_sitter_of(family_id, false));

drop policy if exists kids_member_read on public.kids;
create policy kids_member_read on public.kids for select using (public.is_family_member(family_id));

drop policy if exists family_sitters_member_read on public.family_sitters;
create policy family_sitters_member_read on public.family_sitters for select using (public.is_family_member(family_id));

drop policy if exists shifts_member_read on public.shifts;
create policy shifts_member_read on public.shifts for select using (public.is_family_member(family_id));
drop policy if exists shift_kids_member_read on public.shift_kids;
create policy shift_kids_member_read on public.shift_kids for select using (public.is_family_member(public.shift_family(shift_id)));
drop policy if exists tasks_member_read on public.shift_tasks;
create policy tasks_member_read on public.shift_tasks for select using (public.is_family_member(public.shift_family(shift_id)));

drop policy if exists locations_member_read on public.locations;
create policy locations_member_read on public.locations for select using (public.is_family_member(public.shift_family(shift_id)));
drop policy if exists logs_member_read on public.logs;
create policy logs_member_read on public.logs for select using (public.is_family_member(public.shift_family(shift_id)));

drop policy if exists care_items_member_read on public.care_items;
create policy care_items_member_read on public.care_items for select using (public.is_family_member(family_id));

drop policy if exists house_rules_member_read on public.house_rules;
create policy house_rules_member_read on public.house_rules for select using (public.is_family_member(family_id));
drop policy if exists house_rule_agreements_read on public.house_rule_agreements;
create policy house_rule_agreements_read on public.house_rule_agreements for select
  using (sitter_id = auth.uid() or public.is_family_member(family_id));

drop policy if exists shift_extensions_read on public.shift_extensions;
create policy shift_extensions_read on public.shift_extensions for select
  using (public.is_family_member(public.shift_family(shift_id)) or public.is_my_shift(shift_id));

drop policy if exists places_member_read on public.places;
create policy places_member_read on public.places for select using (public.is_family_member(family_id));
create or replace view public.places_for_sitter as
  select p.id, p.family_id, p.kind, p.name,
         case when p.show_address or public.is_family_member(p.family_id) then p.address end as address,
         p.lat, p.lng, p.radius_ft, p.kid_ids, p.days, p.is_main, p.show_address, p.notes, p.created_at, p.updated_at
  from public.places p
  where public.is_sitter_of(p.family_id) or public.is_family_member(p.family_id);

drop policy if exists trips_member_read on public.trips;
create policy trips_member_read on public.trips for select using (public.is_family_member(family_id));
drop policy if exists clockin_requests_read on public.clockin_requests;
create policy clockin_requests_read on public.clockin_requests for select
  using (sitter_id = auth.uid() or public.is_family_member(family_id));
drop policy if exists alerts_member_read on public.alerts;
create policy alerts_member_read on public.alerts for select using (public.is_family_member(family_id));

-- Log hearts and photo requests: helpers too.
drop policy if exists log_reactions_parent_read on public.log_reactions;
create policy log_reactions_parent_read on public.log_reactions for select
  using (public.is_family_member(public.shift_family(public.log_shift(log_id))));
drop policy if exists log_reactions_parent_insert on public.log_reactions;
create policy log_reactions_parent_insert on public.log_reactions for insert
  with check (parent_id = auth.uid() and public.is_photo_log(log_id)
    and public.is_family_member(public.shift_family(public.log_shift(log_id))));
drop policy if exists photo_requests_parent_read on public.photo_requests;
create policy photo_requests_parent_read on public.photo_requests for select
  using (public.is_family_member(public.shift_family(shift_id)));

-- Shift photos (migration 02): every member reads them.
do $$ begin
  if to_regclass('storage.objects') is not null then
    execute 'drop policy if exists "family and sitter read shift photos" on storage.objects';
    execute $p$create policy "family and sitter read shift photos" on storage.objects for select to authenticated
      using (bucket_id = 'shift-photos' and (
        public.is_my_shift(((storage.foldername(name))[1])::uuid)
        or public.is_family_member(public.shift_family(((storage.foldername(name))[1])::uuid))))$p$;
  end if;
end $$;

-- Messages (migrations 10 / 11): every member reads and writes the family's sitter threads.
create or replace function public.can_read_thread(fid uuid, sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_family_member(fid) or (sid = auth.uid() and public.is_sitter_of(fid));
$$;
create or replace function public.can_write_thread(fid uuid, sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_sitter_of_family(fid, sid) and (
    public.is_family_member(fid)
    or (sid = auth.uid() and public.is_sitter_of(fid)
        and coalesce((select fs.can_message from public.family_sitters fs where fs.family_id = fid and fs.sitter_id = sid), true))
  );
$$;

-- Sitters' time off (migration 12): the calendar of every member shows it.
create or replace function public.family_sitter_time_off(p_family uuid, p_from date default current_date - 62)
returns table (sitter_id uuid, starts date, ends date)
language sql stable security definer set search_path = public as $$
  select t.sitter_id, t.starts, t.ends
  from sitter_time_off t
  join family_sitters fs on fs.sitter_id = t.sitter_id and fs.family_id = p_family and fs.status = 'active'
  where public.is_family_member(p_family) and t.ends >= p_from
  order by t.starts;
$$;

-- Plan state (migration 24): helpers see the same locks as parents (live map), never the subscription row itself.
create or replace function public.family_has_plan(fid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((
    select s.status in ('trialing', 'active')
        or (s.status = 'past_due' and s.current_period_end is not null and now() < s.current_period_end + interval '7 days')
    from family_subscriptions s
    where s.family_id = fid
      and (auth.uid() is null or is_family_member(fid) or is_sitter_of(fid, false))
  ), false);
$$;

-- "Ask for a photo" (migration 26): helpers too.
create or replace function public.ask_for_photo(p_shift uuid) returns photo_requests
language plpgsql security definer set search_path = public as $$
declare
  s shifts;
  r photo_requests;
  last_at timestamptz;
  who text := coalesce((select nullif(split_part(trim(full_name), ' ', 1), '') from profiles where id = auth.uid()), 'The family');
begin
  select * into s from shifts where id = p_shift for update;
  if not found or not is_family_member(s.family_id) then raise exception 'not your family''s shift'; end if;
  if s.status <> 'active' then raise exception 'the shift isn''t live'; end if;
  select max(created_at) into last_at from photo_requests where shift_id = p_shift;
  if last_at is not null and last_at > now() - interval '10 minutes' then
    raise exception 'You asked % min ago. Try again in a few minutes.', greatest(1, round(extract(epoch from (now() - last_at)) / 60));
  end if;
  insert into photo_requests (shift_id, parent_id) values (p_shift, auth.uid()) returning * into r;
  perform notify_users(array[s.sitter_id], who || ' asked for a photo update', 'Tap to add one.', '/sitter/shift/' || s.id);
  return r;
end $$;

-- ---------------------------------------------------------------- pushes that stay with parents
-- Pool requests (migration 25): only parents book, so only parents hear about answers.
create or replace function public.other_parents(fid uuid) returns uuid[]
language sql stable security definer set search_path = public as $$
  select array(select user_id from family_parents where family_id = fid and role = 'parent' and user_id is distinct from auth.uid());
$$;

create or replace function public.expire_shift_requests() returns int
language plpgsql security definer set search_path = public as $$
declare r record; n int := 0;
begin
  for r in update shift_requests set status = 'expired', updated_at = now()
           where status = 'open' and expires_at <= now()
           returning id, family_id, starts_at, ends_at loop
    n := n + 1;
    perform notify_users(family_parent_ids(r.family_id),
      'Your shift request expired', request_when(r.starts_at, r.ends_at) || ' · no one accepted in time',
      '/parent/request/' || r.id);
  end loop;
  return n;
end $$;

-- Billing (migration 24): the trial reminder goes to parents only.
create or replace function public.billing_trial_reminder(p_family uuid) returns void
language plpgsql security definer set search_path = public as $$
declare s family_subscriptions;
begin
  select * into s from family_subscriptions where family_id = p_family;
  if not found or not s.remind_trial or s.trial_ends_at is null then return; end if;
  perform notify_users(
    family_parent_ids(p_family),
    'Your free trial ends ' || to_char(s.trial_ends_at at time zone 'America/New_York', 'Mon FMDD'),
    case when s.cancel_at_period_end then 'Your plan won’t renew. Resubscribe anytime in Settings.'
         else 'Then BabyBadger Family renews. Change or cancel in Settings › Subscription.' end,
    '/parent/subscription');
end $$;
revoke execute on function public.billing_trial_reminder(uuid) from public, anon, authenticated;
grant execute on function public.billing_trial_reminder(uuid) to service_role;

-- ---------------------------------------------------------------- member invites
create table if not exists public.family_member_invites (
  id           uuid primary key default gen_random_uuid(),
  family_id    uuid not null references public.families (id) on delete cascade,
  link_token   text not null default public.new_link_token() unique,
  name         text not null default '' check (length(name) <= 60),
  relation     text check (relation is null or relation in ('Mom', 'Dad', 'Grandma', 'Grandpa', 'Aunt', 'Uncle', 'Other')),
  role         text not null default 'helper' check (role in ('parent', 'helper')),
  email        text check (email is null or (length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  created_by   uuid not null references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '7 days',
  sent_at      timestamptz,
  accepted_by  uuid references auth.users (id) on delete set null,
  accepted_at  timestamptz,
  cancelled_at timestamptz
);
create index if not exists family_member_invites_family on public.family_member_invites (family_id, created_at desc);

alter table public.family_member_invites enable row level security;
drop policy if exists family_member_invites_parent_read on public.family_member_invites;
create policy family_member_invites_parent_read on public.family_member_invites for select using (public.is_parent_of(family_id));
-- Writes go through the functions below only.
revoke all on public.family_member_invites from anon, authenticated;
grant select (id, family_id, link_token, name, relation, role, email, created_by, created_at, expires_at, sent_at, accepted_by, accepted_at, cancelled_at)
  on public.family_member_invites to authenticated;
grant all on public.family_member_invites to service_role;

-- 'open', 'used', 'closed' (cancelled), 'expired'.
create or replace function public.member_invite_status(i family_member_invites) returns text
language sql stable set search_path = public as $$
  select case
    when i.accepted_at is not null then 'used'
    when i.cancelled_at is not null then 'closed'
    when i.expires_at < now() then 'expired'
    else 'open' end;
$$;
revoke execute on function public.member_invite_status(family_member_invites) from anon, public, authenticated;

-- Members plus open invites (what counts toward the 4), optionally leaving one invite out (its own resend).
create or replace function public.family_seats_used(fid uuid, skip_invite uuid default null) returns int
language sql stable security definer set search_path = public as $$
  select (select count(*) from family_parents where family_id = fid)::int
       + (select count(*) from family_member_invites i
          where i.family_id = fid and i.accepted_at is null and i.cancelled_at is null and i.expires_at > now()
            and i.id is distinct from skip_invite)::int;
$$;
revoke execute on function public.family_seats_used(uuid, uuid) from anon, public, authenticated;

-- P78b: a parent makes the invite. Returns {id, link_token, expires_at}.
create or replace function public.invite_family_member(p_family uuid, p_name text, p_relation text, p_role text, p_email text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare i family_member_invites; mail text := nullif(lower(trim(coalesce(p_email, ''))), '');
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if not is_parent_of(p_family) then raise exception 'not a parent of this family'; end if;
  if length(trim(coalesce(p_name, ''))) < 1 then raise exception 'Add their name.'; end if;
  if p_role is null or p_role not in ('parent', 'helper') then raise exception 'Pick a role.'; end if;
  if family_seats_used(p_family) >= 4 then raise exception 'family_full'; end if;
  if mail is not null and exists (
      select 1 from family_parents fp join auth.users u on u.id = fp.user_id
      where fp.family_id = p_family and lower(u.email) = mail) then
    raise exception 'already_member';
  end if;
  insert into family_member_invites (family_id, name, relation, role, email, created_by)
    values (p_family, left(trim(p_name), 60), nullif(p_relation, ''), p_role, mail, auth.uid())
    returning * into i;
  return jsonb_build_object('id', i.id, 'link_token', i.link_token, 'expires_at', i.expires_at);
end $$;

-- P78s: Send by text / Email / Copy link stamps sent_at once; an email that belongs to someone who already uses
-- BabyBadger (and isn't in this family) gets a push that opens the invite.
create or replace function public.member_invite_sent(p_invite uuid) returns void
language plpgsql security definer set search_path = public as $$
declare i family_member_invites; fam text; to_whom uuid[];
begin
  select * into i from family_member_invites where id = p_invite for update;
  if not found or not is_parent_of(i.family_id) then raise exception 'not a parent of this family'; end if;
  if i.sent_at is not null then return; end if;
  update family_member_invites set sent_at = now() where id = i.id;
  if i.email is null then return; end if;
  to_whom := array(
    select u.id from auth.users u
    where lower(u.email) = i.email and not exists (select 1 from family_parents fp where fp.family_id = i.family_id and fp.user_id = u.id));
  if cardinality(to_whom) = 0 then return; end if;
  select name into fam from families where id = i.family_id;
  perform notify_users(to_whom, adult_first_name(i.created_by, 'A parent') || ' invited you to ' || coalesce(fam, 'their family'),
    'Tap to join on BabyBadger.', '/m/' || i.link_token);
end $$;

-- P78 Resend: the same link works 7 more days (also brings back an expired one while the family has room).
create or replace function public.resend_member_invite(p_invite uuid) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare i family_member_invites;
begin
  select * into i from family_member_invites where id = p_invite for update;
  if not found or not is_parent_of(i.family_id) then raise exception 'not a parent of this family'; end if;
  if i.accepted_at is not null then raise exception 'used'; end if;
  if i.cancelled_at is not null then raise exception 'closed'; end if;
  if i.expires_at < now() and family_seats_used(i.family_id, i.id) >= 4 then raise exception 'family_full'; end if;
  update family_member_invites set expires_at = now() + interval '7 days' where id = i.id returning expires_at into i.expires_at;
  return i.expires_at;
end $$;

-- P78 Cancel.
create or replace function public.cancel_member_invite(p_invite uuid) returns void
language plpgsql security definer set search_path = public as $$
declare i family_member_invites;
begin
  select * into i from family_member_invites where id = p_invite for update;
  if not found or not is_parent_of(i.family_id) then raise exception 'not a parent of this family'; end if;
  if i.accepted_at is not null then raise exception 'used'; end if;
  update family_member_invites set cancelled_at = coalesce(cancelled_at, now()) where id = i.id;
end $$;

-- M0: anon-safe preview, by token only. A usable link: the family name and the inviter's first name. Else status only.
create or replace function public.member_invite_preview(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare i family_member_invites; st text;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{40}$' then return jsonb_build_object('status', 'not_found'); end if;
  select * into i from family_member_invites where link_token = p_token;
  if not found then return jsonb_build_object('status', 'not_found'); end if;
  st := member_invite_status(i);
  if st <> 'open' then return jsonb_build_object('status', st); end if;
  return jsonb_build_object(
    'status', 'open',
    'family_name', (select name from families where id = i.family_id),
    'invited_by', adult_first_name(i.created_by, ''));
end $$;

-- The email lock: an invite with an email only opens for the account with that email (as migration 28).
create or replace function public.check_member_invite_email(i family_member_invites) returns void
language plpgsql stable security definer set search_path = public as $$
declare me text;
begin
  if i.email is null then return; end if;
  select lower(email) into me from auth.users where id = auth.uid();
  if me is not distinct from i.email then return; end if;
  raise exception 'This invite was sent to %. Sign in with that email, or ask % to resend it.', mask_email(i.email), adult_first_name(i.created_by, 'the family');
end $$;
revoke execute on function public.check_member_invite_email(family_member_invites) from anon, public, authenticated;

-- Why can't the signed-in person join? null = they can.
create or replace function public.member_join_block(i family_member_invites) returns text
language plpgsql stable security definer set search_path = public as $$
begin
  if exists (select 1 from family_parents where family_id = i.family_id and user_id = auth.uid()) then return 'already_member'; end if;
  if exists (select 1 from family_parents where user_id = auth.uid()) then return 'other_family'; end if;
  if exists (select 1 from profiles where id = auth.uid() and role = 'sitter') then return 'sitter_account'; end if;
  if exists (select 1 from family_sitters where family_id = i.family_id and sitter_id = auth.uid() and status <> 'removed') then return 'sitter_account'; end if;
  return null;
end $$;
revoke execute on function public.member_join_block(family_member_invites) from anon, public, authenticated;

-- P78d: signed in, what the accept screen shows. Raises the email-lock message; 'block' says why they can't join.
create or replace function public.member_invite_details(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare i family_member_invites; st text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_token is null or p_token !~ '^[0-9a-f]{40}$' then return jsonb_build_object('status', 'not_found'); end if;
  select * into i from family_member_invites where link_token = p_token;
  if not found then return jsonb_build_object('status', 'not_found'); end if;
  st := member_invite_status(i);
  if st <> 'open' then
    return jsonb_build_object('status', st, 'mine', i.accepted_by = auth.uid());
  end if;
  perform check_member_invite_email(i);
  return jsonb_build_object(
    'status', 'open',
    'family_name', (select name from families where id = i.family_id),
    'invited_by', adult_first_name(i.created_by, ''),
    'name', i.name,
    'relation', i.relation,
    'role', i.role,
    'expires_at', i.expires_at,
    'kids', coalesce((select jsonb_agg(split_part(trim(k.name), ' ', 1) order by k.created_at) from kids k where k.family_id = i.family_id), '[]'::jsonb),
    'block', member_join_block(i));
end $$;

-- P78d Join: the signed-in person becomes a member with the invite's role and relation. Returns the family id.
create or replace function public.accept_member_invite(p_token text, p_your_name text default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare i family_member_invites; st text; why text; who text; fam text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_token is null or p_token !~ '^[0-9a-f]{40}$' then raise exception 'not_found'; end if;
  select * into i from family_member_invites where link_token = p_token for update;
  if not found then raise exception 'not_found'; end if;
  st := member_invite_status(i);
  if st <> 'open' then raise exception '%', st; end if;
  perform check_member_invite_email(i);
  why := member_join_block(i);
  if why is not null then raise exception '%', why; end if;
  if (select count(*) from family_parents where family_id = i.family_id) >= 4 then raise exception 'family_full'; end if;
  who := nullif(trim(coalesce(p_your_name, '')), '');
  insert into profiles (id, full_name, role) values (auth.uid(), coalesce(who, i.name, ''), 'parent')
    on conflict (id) do update set
      full_name = case when profiles.full_name = '' then coalesce(who, nullif(i.name, ''), '') else profiles.full_name end,
      role = 'parent';
  insert into family_parents (family_id, user_id, role, relation) values (i.family_id, auth.uid(), i.role, i.relation);
  update family_member_invites set accepted_by = auth.uid(), accepted_at = now() where id = i.id;
  select name into fam from families where id = i.family_id;
  perform notify_users(array(select user_id from family_parents where family_id = i.family_id and user_id <> auth.uid()),
    adult_first_name(auth.uid(), 'Someone') || ' joined ' || coalesce(fam, 'your family'), 'See your family in Settings › Family members.', '/parent/members');
  return i.family_id;
end $$;

-- P78 list: the family's adults (any member) and, for parents, the invites that weren't cancelled or used.
create or replace function public.family_members(p_family uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_family_member(p_family) then raise exception 'not a member of this family'; end if;
  return jsonb_build_object(
    'max', 4,
    'my_role', (select role from family_parents where family_id = p_family and user_id = auth.uid()),
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
          'user_id', fp.user_id, 'name', coalesce(p.full_name, ''), 'role', fp.role, 'relation', fp.relation,
          'joined_at', fp.created_at, 'me', fp.user_id = auth.uid(), 'creator', fp.user_id = f.created_by)
        order by (fp.user_id = f.created_by) desc, fp.created_at)
      from family_parents fp join families f on f.id = fp.family_id left join profiles p on p.id = fp.user_id
      where fp.family_id = p_family), '[]'::jsonb),
    'invites', case when is_parent_of(p_family) then coalesce((
      select jsonb_agg(jsonb_build_object(
          'id', i.id, 'link_token', i.link_token, 'name', i.name, 'relation', i.relation, 'role', i.role, 'email', i.email,
          'created_at', i.created_at, 'expires_at', i.expires_at, 'sent_at', i.sent_at, 'status', member_invite_status(i))
        order by i.created_at desc)
      from family_member_invites i
      where i.family_id = p_family and i.accepted_at is null and i.cancelled_at is null), '[]'::jsonb) else '[]'::jsonb end);
end $$;

-- P78c: a parent changes someone's role. The last parent can't become a helper.
create or replace function public.set_member_role(p_family uuid, p_user uuid, p_role text) returns void
language plpgsql security definer set search_path = public as $$
declare cur text;
begin
  if not is_parent_of(p_family) then raise exception 'not a parent of this family'; end if;
  if p_role is null or p_role not in ('parent', 'helper') then raise exception 'Pick a role.'; end if;
  select role into cur from family_parents where family_id = p_family and user_id = p_user for update;
  if not found then raise exception 'not a member of this family'; end if;
  if cur = p_role then return; end if;
  if cur = 'parent' and (select count(*) from family_parents where family_id = p_family and role = 'parent') <= 1 then
    raise exception 'last_parent';
  end if;
  update family_parents set role = p_role where family_id = p_family and user_id = p_user;
end $$;

-- P78c Remove (parents) / Leave family (anyone, for themselves). The last parent stays.
create or replace function public.remove_family_member(p_family uuid, p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
declare cur text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_user is distinct from auth.uid() and not is_parent_of(p_family) then raise exception 'not a parent of this family'; end if;
  select role into cur from family_parents where family_id = p_family and user_id = p_user for update;
  if not found then raise exception 'not a member of this family'; end if;
  if cur = 'parent' and (select count(*) from family_parents where family_id = p_family and role = 'parent') <= 1 then
    raise exception 'last_parent';
  end if;
  delete from family_parents where family_id = p_family and user_id = p_user;
  delete from message_reads where family_id = p_family and user_id = p_user;
end $$;

create or replace function public.leave_family(p_family uuid) returns void
language sql security definer set search_path = public as $$
  select public.remove_family_member(p_family, auth.uid());
$$;

-- ---------------------------------------------------------------- function access
revoke execute on function
  public.invite_family_member(uuid, text, text, text, text), public.member_invite_sent(uuid), public.resend_member_invite(uuid),
  public.cancel_member_invite(uuid), public.member_invite_details(text), public.accept_member_invite(text, text),
  public.family_members(uuid), public.set_member_role(uuid, uuid, text), public.remove_family_member(uuid, uuid),
  public.leave_family(uuid)
  from anon, public;
grant execute on function
  public.invite_family_member(uuid, text, text, text, text), public.member_invite_sent(uuid), public.resend_member_invite(uuid),
  public.cancel_member_invite(uuid), public.member_invite_details(text), public.accept_member_invite(text, text),
  public.family_members(uuid), public.set_member_role(uuid, uuid, text), public.remove_family_member(uuid, uuid),
  public.leave_family(uuid)
  to authenticated, service_role;
revoke execute on function public.member_invite_preview(text) from public;
grant execute on function public.member_invite_preview(text) to anon, authenticated, service_role;

-- Members list refreshes live when someone joins or leaves.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'family_parents') then
    alter publication supabase_realtime add table public.family_parents;
  end if;
end $$;
