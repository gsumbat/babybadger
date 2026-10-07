-- Invite links (wireframes S0a–S0e, P24): babybadger.app/i/<link_token>.
--   * invites.link_token: a long random token (160 bits) for the link. The link never contains the 6-digit code, so
--     the public page can't be found by guessing. The 6-digit code stays for typing in the app after sign-in (S51)
--     and as the fallback line in the parent's text.
--   * invites.sitter_email (P3 / P24 "To Maya · maya@…"): optional. When set, only someone signed in with that email
--     can open (S1), accept or decline the invite. When it belongs to someone who already uses BabyBadger as a
--     sitter, sending the invite pushes "New family invite" to her phone (S0e) and the invite shows in her Home
--     "Needs you" list until she answers it. Invites without an email work as before.
--   * invites.sent_at: when the parent first sent / emailed / copied the invite from P24 (invite_sent below).
--   * invite_link_preview(token): the ONLY function anyone without an account (anon) can call. What the web page and
--     the app show before sign-in (S0b, S0c): the family name, the inviting parent's first name and the kids' first
--     names and ages, for a link that can still be used. Used, expired, cancelled and unknown links return a status
--     only. Nothing can be looked up by the 6-digit code without signing in.
--   * invite_code_for_link(token): signed in, turns the link into the 6-digit code the existing preview / accept /
--     decline functions take.
--   * my_invites(): open invites sent to the signed-in sitter's email (Home "Needs you").
-- Later, when phone sign-in arrives, a sitter_phone column can sit next to sitter_email and the same rules apply.

-- ---------------------------------------------------------------- columns
-- 40 hex characters from two random UUIDs (gen_random_uuid is built in; ~154 random bits).
create or replace function public.new_link_token() returns text
language sql volatile set search_path = public as $$
  select left(replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''), 40);
$$;
revoke execute on function public.new_link_token() from anon, public;
grant execute on function public.new_link_token() to authenticated, service_role;

alter table public.invites
  add column if not exists sitter_email text check (sitter_email is null or (length(sitter_email) <= 254 and sitter_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  add column if not exists sent_at      timestamptz,
  add column if not exists link_token   text;
update public.invites set link_token = public.new_link_token() where link_token is null;
alter table public.invites alter column link_token set default public.new_link_token();
alter table public.invites alter column link_token set not null;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'invites_link_token_key') then
    alter table public.invites add constraint invites_link_token_key unique (link_token);
  end if;
end $$;

-- New columns need their grant spelled out (existing policies still decide which rows: parents of the family).
grant select, insert, update, delete on public.invites to authenticated;
grant all on public.invites to service_role;
revoke all on public.invites from anon;

-- Emails are stored trimmed and lower-case so they match auth.users.
create or replace function public.invites_tidy_email() returns trigger
language plpgsql set search_path = public as $$
begin
  new.sitter_email := nullif(lower(trim(coalesce(new.sitter_email, ''))), '');
  return new;
end $$;
drop trigger if exists invites_tidy_email on public.invites;
create trigger invites_tidy_email before insert or update of sitter_email on public.invites
  for each row execute function public.invites_tidy_email();

-- "Ava", "Ava and Leo", "Ava, Leo and Mia": the kids an invite covers, in the order they were added.
create or replace function public.invite_kid_names(inv invites) returns text
language plpgsql stable security definer set search_path = public as $$
declare names text[];
begin
  select coalesce(array_agg(name order by created_at), '{}') into names
    from kids where family_id = inv.family_id and (inv.kid_ids is null or id = any (inv.kid_ids));
  if cardinality(names) = 0 then return ''; end if;
  if cardinality(names) = 1 then return names[1]; end if;
  return array_to_string(names[1:cardinality(names) - 1], ', ') || ' and ' || names[cardinality(names)];
end $$;
revoke execute on function public.invite_kid_names(invites) from anon, public, authenticated;

-- ---------------------------------------------------------------- email lock
-- "m•••@email.com"
create or replace function public.mask_email(e text) returns text
language sql immutable set search_path = public as $$
  select case when e is null or position('@' in e) < 2 then '' else left(e, 1) || '•••' || substr(e, position('@' in e)) end;
$$;
revoke execute on function public.mask_email(text) from anon, public;
grant execute on function public.mask_email(text) to authenticated, service_role;

-- An invite with an email only opens for the account with that email.
create or replace function public.check_invite_email(inv invites) returns void
language plpgsql stable security definer set search_path = public as $$
declare me text; who text;
begin
  if inv.sitter_email is null then return; end if;
  select lower(email) into me from auth.users where id = auth.uid();
  if me is not distinct from inv.sitter_email then return; end if;
  who := coalesce((select nullif(split_part(trim(full_name), ' ', 1), '') from profiles where id = inv.created_by), 'the family');
  raise exception 'This invite was sent to %. Sign in with that email, or ask % to resend it.', mask_email(inv.sitter_email), who;
end $$;
revoke execute on function public.check_invite_email(invites) from anon, public, authenticated;

-- S1 preview, decline and accept: as in migrations 11 / 13, plus the email lock.
create or replace function public.preview_invite(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare inv invites; res jsonb;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  inv := open_invite_by_code(p_code);
  if is_parent_of(inv.family_id) then raise exception 'you are a parent in this family'; end if;
  perform check_invite_email(inv);
  update invites set opened_at = coalesce(opened_at, now()) where id = inv.id;
  select jsonb_build_object(
    'family_id', f.id,
    'family_name', f.name,
    'invited_by', coalesce((select full_name from profiles where id = inv.created_by), ''),
    'rate', inv.rate,
    'pay_schedule', inv.pay_schedule,
    'kids', coalesce((
      select jsonb_agg(jsonb_build_object('name', k.name, 'color', k.color, 'birthdate', k.birthdate,
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
  perform check_invite_email(inv);
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
  perform check_invite_email(inv);
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

revoke execute on function public.preview_invite(text), public.decline_invite(text), public.accept_invite(text, text) from anon, public;
grant execute on function public.preview_invite(text), public.decline_invite(text), public.accept_invite(text, text) to authenticated, service_role;

-- ---------------------------------------------------------------- S0b / S0c: anon-safe preview, by token only
create or replace function public.invite_link_status(inv invites) returns text
language sql stable set search_path = public as $$
  select case
    when inv.accepted_at is not null then 'used'
    when inv.cancelled_at is not null or inv.declined_at is not null then 'closed'
    when inv.expires_at < now() then 'expired'
    else 'open' end;
$$;
revoke execute on function public.invite_link_status(invites) from anon, public, authenticated;

create or replace function public.invite_link_preview(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare inv invites; st text;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{40}$' then return jsonb_build_object('status', 'not_found'); end if;
  select * into inv from invites where link_token = p_token;
  if not found then return jsonb_build_object('status', 'not_found'); end if;
  st := invite_link_status(inv);
  if st <> 'open' then return jsonb_build_object('status', st); end if;
  return (
    select jsonb_build_object(
      'status', 'open',
      'family_name', f.name,
      'invited_by', coalesce((select nullif(split_part(trim(full_name), ' ', 1), '') from profiles where id = inv.created_by), ''),
      'invited_by_initials', coalesce((
        select upper(left(split_part(trim(full_name), ' ', 1), 1) || left(nullif(split_part(trim(full_name), ' ', 2), ''), 1))
        from profiles where id = inv.created_by), ''),
      'expires_at', inv.expires_at,
      'kids', coalesce((
        select jsonb_agg(jsonb_build_object('name', split_part(trim(k.name), ' ', 1), 'color', k.color,
                                            'age', case when k.birthdate is null then null else date_part('year', age(k.birthdate))::int end)
                         order by k.created_at)
        from kids k where k.family_id = inv.family_id and (inv.kid_ids is null or k.id = any (inv.kid_ids))
      ), '[]'::jsonb))
    from families f where f.id = inv.family_id
  );
end $$;
revoke execute on function public.invite_link_preview(text) from public;
grant execute on function public.invite_link_preview(text) to anon, authenticated, service_role;

-- Signed in: the link -> the 6-digit code (for preview_invite / accept_invite / decline_invite). Status only when
-- the link can't be used. The email lock is checked by those functions, with the full message.
create or replace function public.invite_code_for_link(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare inv invites; st text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_token is null or p_token !~ '^[0-9a-f]{40}$' then return jsonb_build_object('status', 'not_found'); end if;
  select * into inv from invites where link_token = p_token;
  if not found then return jsonb_build_object('status', 'not_found'); end if;
  st := invite_link_status(inv);
  if st <> 'open' then return jsonb_build_object('status', st); end if;
  return jsonb_build_object('status', 'open', 'code', inv.code);
end $$;
revoke execute on function public.invite_code_for_link(text) from anon, public;
grant execute on function public.invite_code_for_link(text) to authenticated, service_role;

-- ---------------------------------------------------------------- P24: sent → S0e push
-- Called by the app when the parent taps Send by text, Email or Copy link. The first call stamps sent_at and, when
-- the invite has an email that belongs to an existing sitter (not already in this family), pushes her the invite.
create or replace function public.invite_sent(p_invite uuid) returns void
language plpgsql security definer set search_path = public as $$
declare inv invites; fam text; kids_line text; to_whom uuid[];
begin
  select * into inv from invites where id = p_invite for update;
  if not found or not is_parent_of(inv.family_id) then raise exception 'not a parent of this family'; end if;
  if inv.sent_at is not null then return; end if;
  update invites set sent_at = now() where id = inv.id;
  if inv.sitter_email is null then return; end if;
  to_whom := array(
    select u.id from auth.users u join profiles p on p.id = u.id
    where lower(u.email) = inv.sitter_email and p.role = 'sitter'
      and not exists (select 1 from family_sitters fs where fs.family_id = inv.family_id and fs.sitter_id = u.id and fs.status <> 'removed'));
  if cardinality(to_whom) = 0 then return; end if;
  select name into fam from families where id = inv.family_id;
  kids_line := invite_kid_names(inv);
  perform notify_users(to_whom, 'New family invite',
    fam || ' invited you to sit' || case when kids_line = '' then '' else ' for ' || kids_line end || '. Tap to review.',
    '/i/' || inv.link_token);
end $$;
revoke execute on function public.invite_sent(uuid) from anon, public;
grant execute on function public.invite_sent(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------- Home "Needs you": invites to my email
create or replace function public.my_invites() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare me text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select lower(email) into me from auth.users where id = auth.uid();
  if me is null then return '[]'::jsonb; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('link_token', i.link_token, 'family_name', f.name, 'kids', invite_kid_names(i), 'created_at', i.created_at)
                     order by i.created_at desc)
    from invites i join families f on f.id = i.family_id
    where i.sitter_email = me and i.accepted_at is null and i.cancelled_at is null and i.declined_at is null
      and i.expires_at > now()
      and not is_parent_of(i.family_id)
      and not exists (select 1 from family_sitters fs where fs.family_id = i.family_id and fs.sitter_id = auth.uid() and fs.status <> 'removed')
  ), '[]'::jsonb);
end $$;
revoke execute on function public.my_invites() from anon, public;
grant execute on function public.my_invites() to authenticated, service_role;
