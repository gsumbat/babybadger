-- Family seats (wireframes P78 / P78f / P78v Family members, P78b / P78br Add a family member, P78s, P78c / P78g / P78t
-- Family member and Make owner, P78e You, P78d / M0 join, P4m Home · read only). Needs migration 30. Re-runnable.
--
-- George's decision: "We give 4 seats who can use the app. The owner adds them and can determine it is read only or
-- full access with a toggle when inviting them."
--   * 4 seats per family (members plus open invites), as in migration 30.
--   * Access levels. The stored values stay as they are (no data churn): family_parents.role / family_member_invites.role
--     'parent' = Full access, 'helper' = Read only. The app shows "Full access" / "Read only"; relation (Mom, Grandma…)
--     stays an optional label.
--   * Owner = families.created_by (the family's creator to begin with). ONLY the owner:
--       - invites, resends, cancels and reads member invites (their links);
--       - changes someone's access (set_member_access; set_member_role stays as an alias);
--       - removes someone;
--       - manages billing: set_trial_reminder here, and the billing-* Edge Functions check families.created_by;
--       - hands the family over (transfer_family_ownership) to a full-access member.
--     The owner always has full access, can't be removed or made read only, and can't leave until someone else is the
--     owner. Everyone else can leave.
--   * Full access (role 'parent') still does everything else a parent does: sitters, bookings, pay, requirements, kids,
--     the care plan, rules and places (is_parent_of is unchanged).
--   * families.created_by: the app could update every column of families (migration 20 granted update on the table to
--     every signed-in user, and families_update lets any parent through). Now only name and requirement_mode are
--     writable from the app; created_by changes only through transfer_family_ownership. Nothing else reads created_by
--     as fixed: family_members() reads it for the Owner pill, nothing keys on it.
--   * The trial reminder (billing_trial_reminder) goes to the owner only.

-- ---------------------------------------------------------------- owner
create or replace function public.is_family_owner(fid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from families f join family_parents fp on fp.family_id = f.id and fp.user_id = f.created_by
    where f.id = fid and f.created_by = auth.uid());
$$;
revoke execute on function public.is_family_owner(uuid) from anon, public;
grant execute on function public.is_family_owner(uuid) to authenticated, service_role;

-- The owner's user id (server use: pushes).
create or replace function public.family_owner_id(fid uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select created_by from families where id = fid;
$$;
revoke execute on function public.family_owner_id(uuid) from anon, public, authenticated;
grant execute on function public.family_owner_id(uuid) to service_role;

-- Only name and requirement_mode are written from the app (P7a Warn me / Block booking). created_by, id and
-- created_at are not.
revoke update on public.families from authenticated;
grant update (name, requirement_mode) on public.families to authenticated;

-- 'parent' / 'helper' as the access level the app shows.
create or replace function public.member_access(p_role text) returns text
language sql immutable set search_path = public as $$
  select case when p_role = 'helper' then 'read_only' else 'full' end;
$$;
revoke execute on function public.member_access(text) from anon, public;
grant execute on function public.member_access(text) to authenticated, service_role;

-- 'full' / 'read_only' (or the stored 'parent' / 'helper') to the stored role. Null for anything else.
create or replace function public.member_role_for(p_access text) returns text
language sql immutable set search_path = public as $$
  select case
    when p_access in ('full', 'parent') then 'parent'
    when p_access in ('read_only', 'helper') then 'helper'
  end;
$$;
revoke execute on function public.member_role_for(text) from anon, public, authenticated;

-- ---------------------------------------------------------------- member invites: the owner only
drop policy if exists family_member_invites_parent_read on public.family_member_invites;
drop policy if exists family_member_invites_owner_read on public.family_member_invites;
create policy family_member_invites_owner_read on public.family_member_invites for select using (public.is_family_owner(family_id));

-- P78b / P78br: the owner makes the invite with an access level ('full' | 'read_only'; 'parent' | 'helper' still work).
-- Returns {id, link_token, expires_at}.
create or replace function public.invite_family_member(p_family uuid, p_name text, p_relation text, p_role text, p_email text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare i family_member_invites; mail text := nullif(lower(trim(coalesce(p_email, ''))), ''); r text := member_role_for(p_role);
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if not is_family_owner(p_family) then raise exception 'not the family owner' using errcode = '42501'; end if;
  if length(trim(coalesce(p_name, ''))) < 1 then raise exception 'Add their name.'; end if;
  if r is null then raise exception 'Pick full access or read only.'; end if;
  if family_seats_used(p_family) >= 4 then raise exception 'family_full'; end if;
  if mail is not null and exists (
      select 1 from family_parents fp join auth.users u on u.id = fp.user_id
      where fp.family_id = p_family and lower(u.email) = mail) then
    raise exception 'already_member';
  end if;
  insert into family_member_invites (family_id, name, relation, role, email, created_by)
    values (p_family, left(trim(p_name), 60), nullif(p_relation, ''), r, mail, auth.uid())
    returning * into i;
  return jsonb_build_object('id', i.id, 'link_token', i.link_token, 'expires_at', i.expires_at);
end $$;

create or replace function public.member_invite_sent(p_invite uuid) returns void
language plpgsql security definer set search_path = public as $$
declare i family_member_invites; fam text; to_whom uuid[];
begin
  select * into i from family_member_invites where id = p_invite for update;
  if not found or not is_family_owner(i.family_id) then raise exception 'not the family owner' using errcode = '42501'; end if;
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

create or replace function public.resend_member_invite(p_invite uuid) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare i family_member_invites;
begin
  select * into i from family_member_invites where id = p_invite for update;
  if not found or not is_family_owner(i.family_id) then raise exception 'not the family owner' using errcode = '42501'; end if;
  if i.accepted_at is not null then raise exception 'used'; end if;
  if i.cancelled_at is not null then raise exception 'closed'; end if;
  if i.expires_at < now() and family_seats_used(i.family_id, i.id) >= 4 then raise exception 'family_full'; end if;
  update family_member_invites set expires_at = now() + interval '7 days' where id = i.id returning expires_at into i.expires_at;
  return i.expires_at;
end $$;

create or replace function public.cancel_member_invite(p_invite uuid) returns void
language plpgsql security definer set search_path = public as $$
declare i family_member_invites;
begin
  select * into i from family_member_invites where id = p_invite for update;
  if not found or not is_family_owner(i.family_id) then raise exception 'not the family owner' using errcode = '42501'; end if;
  if i.accepted_at is not null then raise exception 'used'; end if;
  update family_member_invites set cancelled_at = coalesce(cancelled_at, now()) where id = i.id;
end $$;

-- P78d: the details also say the access level ('full' | 'read_only').
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
    'access', member_access(i.role),
    'expires_at', i.expires_at,
    'kids', coalesce((select jsonb_agg(split_part(trim(k.name), ' ', 1) order by k.created_at) from kids k where k.family_id = i.family_id), '[]'::jsonb),
    'block', member_join_block(i));
end $$;

-- ---------------------------------------------------------------- P78 list
-- Every member reads the members; the owner also gets the invites. 'owner' = the owner's user id, 'my_access' =
-- 'full' | 'read_only', 'i_own' = you're the owner, 'seats_used' = members plus open invites (the "4 seats · 2 used"
-- header; non-owners see the count without the invites). Each member: 'owner', 'access'. 'my_role' / 'role' /
-- 'creator' stay for older app builds.
create or replace function public.family_members(p_family uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare own uuid := (select created_by from families where id = p_family); me text;
begin
  if not is_family_member(p_family) then raise exception 'not a member of this family'; end if;
  select role into me from family_parents where family_id = p_family and user_id = auth.uid();
  return jsonb_build_object(
    'max', 4,
    'owner', own,
    'i_own', own = auth.uid(),
    'my_role', me,
    'my_access', member_access(me),
    'seats_used', family_seats_used(p_family),
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
          'user_id', fp.user_id, 'name', coalesce(p.full_name, ''), 'role', fp.role, 'access', member_access(fp.role),
          'relation', fp.relation, 'joined_at', fp.created_at, 'me', fp.user_id = auth.uid(),
          'owner', fp.user_id = own, 'creator', fp.user_id = own)
        order by (fp.user_id = own) desc, fp.created_at)
      from family_parents fp left join profiles p on p.id = fp.user_id
      where fp.family_id = p_family), '[]'::jsonb),
    'invites', case when is_family_owner(p_family) then coalesce((
      select jsonb_agg(jsonb_build_object(
          'id', i.id, 'link_token', i.link_token, 'name', i.name, 'relation', i.relation, 'role', i.role,
          'access', member_access(i.role), 'email', i.email,
          'created_at', i.created_at, 'expires_at', i.expires_at, 'sent_at', i.sent_at, 'status', member_invite_status(i))
        order by i.created_at desc)
      from family_member_invites i
      where i.family_id = p_family and i.accepted_at is null and i.cancelled_at is null), '[]'::jsonb) else '[]'::jsonb end);
end $$;

-- ---------------------------------------------------------------- access, remove, leave, transfer
-- P78c Full access switch: the owner sets someone's access ('full' | 'read_only'). The owner always keeps full access.
create or replace function public.set_member_access(p_family uuid, p_user uuid, p_access text) returns void
language plpgsql security definer set search_path = public as $$
declare cur text; r text := member_role_for(p_access);
begin
  if not is_family_owner(p_family) then raise exception 'not the family owner' using errcode = '42501'; end if;
  if r is null then raise exception 'Pick full access or read only.'; end if;
  select role into cur from family_parents where family_id = p_family and user_id = p_user for update;
  if not found then raise exception 'not a member of this family'; end if;
  if cur = r then return; end if;
  if p_user = (select created_by from families where id = p_family) then raise exception 'owner_access'; end if;
  update family_parents set role = r where family_id = p_family and user_id = p_user;
end $$;

-- Migration 30's name: the same thing ('parent' / 'helper' or 'full' / 'read_only').
create or replace function public.set_member_role(p_family uuid, p_user uuid, p_role text) returns void
language sql security definer set search_path = public as $$
  select public.set_member_access(p_family, p_user, p_role);
$$;

-- P78c Remove (the owner removes someone else) / P78e Leave family (anyone but the owner, for themselves).
create or replace function public.remove_family_member(p_family uuid, p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
declare own uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_user is distinct from auth.uid() and not is_family_owner(p_family) then raise exception 'not the family owner' using errcode = '42501'; end if;
  perform 1 from family_parents where family_id = p_family and user_id = p_user for update;
  if not found then raise exception 'not a member of this family'; end if;
  select created_by into own from families where id = p_family;
  if p_user = own then raise exception 'owner_leave'; end if;
  delete from family_parents where family_id = p_family and user_id = p_user;
  delete from message_reads where family_id = p_family and user_id = p_user;
end $$;

create or replace function public.leave_family(p_family uuid) returns void
language sql security definer set search_path = public as $$
  select public.remove_family_member(p_family, auth.uid());
$$;

-- P78t "Make Sam the owner": the owner hands the family to a full-access member. The old owner keeps full access and
-- can leave afterwards. The new owner gets a push. The Stripe customer stays the family's; the new owner manages it.
create or replace function public.transfer_family_ownership(p_family uuid, p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r text; fam text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if not is_family_owner(p_family) then raise exception 'not the family owner' using errcode = '42501'; end if;
  if p_user is null or p_user = auth.uid() then raise exception 'already_owner'; end if;
  select role into r from family_parents where family_id = p_family and user_id = p_user for update;
  if not found then raise exception 'not a member of this family'; end if;
  if r <> 'parent' then raise exception 'needs_full_access'; end if;
  update families set created_by = p_user where id = p_family;
  select name into fam from families where id = p_family;
  perform notify_users(array[p_user], adult_first_name(auth.uid(), 'Someone') || ' made you the owner of ' || coalesce(fam, 'your family'),
    'You now manage seats and the subscription.', '/parent/members');
end $$;

-- ---------------------------------------------------------------- billing: the owner only
-- P38 "Remind me before it ends".
create or replace function public.set_trial_reminder(p_family uuid, p_on boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_family_owner(p_family) then raise exception 'not the family owner' using errcode = '42501'; end if;
  insert into family_subscriptions (family_id, remind_trial) values (p_family, coalesce(p_on, true))
    on conflict (family_id) do update set remind_trial = excluded.remind_trial, updated_at = now();
end $$;

-- 3 days before the trial ends (the webhook calls it): the owner's push.
create or replace function public.billing_trial_reminder(p_family uuid) returns void
language plpgsql security definer set search_path = public as $$
declare s family_subscriptions;
begin
  select * into s from family_subscriptions where family_id = p_family;
  if not found or not s.remind_trial or s.trial_ends_at is null then return; end if;
  perform notify_users(
    array(select f.created_by from families f where f.id = p_family),
    'Your free trial ends ' || to_char(s.trial_ends_at at time zone 'America/New_York', 'Mon FMDD'),
    case when s.cancel_at_period_end then 'Your plan won’t renew. Resubscribe anytime in Settings.'
         else 'Then BabyBadger Family renews. Change or cancel in Settings › Subscription.' end,
    '/parent/subscription');
end $$;
revoke execute on function public.billing_trial_reminder(uuid) from public, anon, authenticated;
grant execute on function public.billing_trial_reminder(uuid) to service_role;

-- ---------------------------------------------------------------- function access
revoke execute on function
  public.invite_family_member(uuid, text, text, text, text), public.member_invite_sent(uuid), public.resend_member_invite(uuid),
  public.cancel_member_invite(uuid), public.member_invite_details(text), public.family_members(uuid),
  public.set_member_access(uuid, uuid, text), public.set_member_role(uuid, uuid, text), public.remove_family_member(uuid, uuid),
  public.leave_family(uuid), public.transfer_family_ownership(uuid, uuid), public.set_trial_reminder(uuid, boolean)
  from anon, public;
grant execute on function
  public.invite_family_member(uuid, text, text, text, text), public.member_invite_sent(uuid), public.resend_member_invite(uuid),
  public.cancel_member_invite(uuid), public.member_invite_details(text), public.family_members(uuid),
  public.set_member_access(uuid, uuid, text), public.set_member_role(uuid, uuid, text), public.remove_family_member(uuid, uuid),
  public.leave_family(uuid), public.transfer_family_ownership(uuid, uuid), public.set_trial_reminder(uuid, boolean)
  to authenticated, service_role;
