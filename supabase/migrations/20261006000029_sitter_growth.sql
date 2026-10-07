-- Sitter growth, phase 1 (wireframes S39 row, S52 / S52b Invite a family, S0f family link page, P3d Connect with
-- Maya, S12 / S12b and S13 / S13c "Be found by new families later"). Needs migration 28 (new_link_token, invite
-- link_token / sitter_email, invite_link_status). Re-runnable.
--
--   * family_referrals: a sitter invites a family she ALREADY sits for (babybadger.app/f/<token>). Not a marketplace:
--     a family only reaches a sitter through her own link. Only the sitter reads or writes her rows; nobody else.
--     At most 20 open ones per sitter. Links work for 30 days (Resend starts the 30 days again).
--   * family_referral_preview(token): the ONLY new function anon can call. A usable link shows the sitter's first name,
--     last initial and avatar initials; nothing else (no email, family or parent name). Other links: status only.
--   * claim_family_referral(token, choices): the parent, signed in with a family, chooses what the sitter may see
--     (P23 choices) and confirms. It makes a normal parent -> sitter invite (create_invite, locked to the sitter's
--     email so it lands in her Home "Needs you"), marks the referral joined and pushes the sitter "The Kim family
--     joined BabyBadger". She then accepts through the usual path (S1 -> S27 -> S42 -> S2). Nothing links a sitter
--     to a family until the parent confirms here AND the sitter accepts.
--   * sitter_profiles.discoverable_later (+ _at): "Be found by new families later" consent. Off by default. Only the
--     sitter reads it (my_found_later) or changes it (set_found_later): parents of her families can read her profile
--     row, so the table's select grant becomes per-column and these two columns are left out of it.
--     NOTE for later migrations: a new sitter_profiles column needs its own `grant select (col)` now.

-- ---------------------------------------------------------------- family_referrals
create table if not exists public.family_referrals (
  id               uuid primary key default gen_random_uuid(),
  sitter_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  token            text not null default public.new_link_token() unique,
  parent_name      text check (parent_name is null or length(parent_name) <= 60),
  family_name      text check (family_name is null or length(family_name) <= 80),
  email            text check (email is null or (length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null default now() + interval '30 days',
  joined_family_id uuid references public.families (id) on delete set null,
  joined_at        timestamptz,
  invite_id        uuid references public.invites (id) on delete set null,
  cancelled_at     timestamptz
);
create index if not exists family_referrals_sitter on public.family_referrals (sitter_id, created_at desc);

-- Tidy text, keep the owner and the server's columns fixed, and cap open invites at 20 per sitter.
create or replace function public.family_referrals_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  new.parent_name := nullif(trim(coalesce(new.parent_name, '')), '');
  new.family_name := nullif(trim(coalesce(new.family_name, '')), '');
  new.email := nullif(lower(trim(coalesce(new.email, ''))), '');
  if tg_op = 'INSERT' then
    if (select count(*) from family_referrals r
        where r.sitter_id = new.sitter_id and r.cancelled_at is null and r.joined_at is null and r.expires_at > now()) >= 20 then
      raise exception 'You have 20 open family invites. Cancel one you don’t need first.';
    end if;
  else
    new.sitter_id := old.sitter_id;
    new.token := old.token;
    new.created_at := old.created_at;
  end if;
  return new;
end $$;
drop trigger if exists family_referrals_guard on public.family_referrals;
create trigger family_referrals_guard before insert or update on public.family_referrals
  for each row execute function public.family_referrals_guard();

alter table public.family_referrals enable row level security;
drop policy if exists family_referrals_own_read on public.family_referrals;
create policy family_referrals_own_read on public.family_referrals for select using (sitter_id = auth.uid());
drop policy if exists family_referrals_own_insert on public.family_referrals;
create policy family_referrals_own_insert on public.family_referrals for insert
  with check (sitter_id = auth.uid() and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'sitter'));
drop policy if exists family_referrals_own_update on public.family_referrals;
create policy family_referrals_own_update on public.family_referrals for update
  using (sitter_id = auth.uid()) with check (sitter_id = auth.uid());

-- The sitter writes only the optional details and Cancel; dates, joins and tokens are the server's.
revoke all on public.family_referrals from anon, authenticated;
grant select on public.family_referrals to authenticated;
grant insert (parent_name, family_name, email) on public.family_referrals to authenticated;
grant update (parent_name, family_name, email, cancelled_at) on public.family_referrals to authenticated;
grant all on public.family_referrals to service_role;

-- 'open', 'used' (a family joined), 'closed' (cancelled), 'expired'.
create or replace function public.family_referral_status(r family_referrals) returns text
language sql stable set search_path = public as $$
  select case
    when r.joined_at is not null then 'used'
    when r.cancelled_at is not null then 'closed'
    when r.expires_at < now() then 'expired'
    else 'open' end;
$$;
revoke execute on function public.family_referral_status(family_referrals) from anon, public, authenticated;

-- ---------------------------------------------------------------- S0f: anon-safe preview, by token only
create or replace function public.family_referral_preview(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare r family_referrals; st text; nm text; first text; last text;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{40}$' then return jsonb_build_object('status', 'not_found'); end if;
  select * into r from family_referrals where token = p_token;
  if not found then return jsonb_build_object('status', 'not_found'); end if;
  st := family_referral_status(r);
  if st <> 'open' then return jsonb_build_object('status', st); end if;
  select trim(coalesce(full_name, '')) into nm from profiles where id = r.sitter_id;
  first := coalesce(nullif(split_part(nm, ' ', 1), ''), '');
  last := coalesce(nullif(split_part(nm, ' ', 2), ''), '');
  return jsonb_build_object(
    'status', 'open',
    'sitter_first', first,
    'sitter_initial', upper(left(last, 1)),
    'initials', upper(left(first, 1) || left(last, 1)),
    'expires_at', r.expires_at,
    -- Signed in: is this my own link? (S0f shows "This is your link" to the sitter herself.)
    'mine', auth.uid() is not null and auth.uid() = r.sitter_id);
end $$;
revoke execute on function public.family_referral_preview(text) from public;
grant execute on function public.family_referral_preview(text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------- S52b: her list
-- Her invites that weren't cancelled, newest first, with the family's real name once one joined and that family's
-- invite link while it still waits for her (Review invite -> /i/<token>).
create or replace function public.my_family_referrals() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
        'id', r.id, 'token', r.token, 'parent_name', r.parent_name, 'family_name', r.family_name, 'email', r.email,
        'created_at', r.created_at, 'expires_at', r.expires_at, 'joined_at', r.joined_at,
        'status', family_referral_status(r),
        'joined_family_name', f.name,
        'invite_token', case when i.accepted_at is null and i.cancelled_at is null and i.declined_at is null and i.expires_at > now()
                             then i.link_token end,
        'connected', exists (select 1 from family_sitters fs where fs.family_id = r.joined_family_id and fs.sitter_id = r.sitter_id and fs.status <> 'removed'))
      order by r.created_at desc)
    from family_referrals r
    left join families f on f.id = r.joined_family_id
    left join invites i on i.id = r.invite_id
    where r.sitter_id = auth.uid() and r.cancelled_at is null
  ), '[]'::jsonb);
end $$;
revoke execute on function public.my_family_referrals() from anon, public;
grant execute on function public.my_family_referrals() to authenticated, service_role;

-- Resend: the same link works 30 more days (also brings an expired one back, within the 20 cap).
create or replace function public.resend_family_referral(p_id uuid) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare r family_referrals;
begin
  select * into r from family_referrals where id = p_id and sitter_id = auth.uid() for update;
  if not found then raise exception 'invite not found'; end if;
  if r.joined_at is not null then raise exception 'This family already joined.'; end if;
  if r.cancelled_at is not null then raise exception 'This invite was cancelled.'; end if;
  if r.expires_at < now() and (select count(*) from family_referrals x
      where x.sitter_id = r.sitter_id and x.cancelled_at is null and x.joined_at is null and x.expires_at > now()) >= 20 then
    raise exception 'You have 20 open family invites. Cancel one you don’t need first.';
  end if;
  update family_referrals set expires_at = now() + interval '30 days' where id = r.id returning expires_at into r.expires_at;
  return r.expires_at;
end $$;
revoke execute on function public.resend_family_referral(uuid) from anon, public;
grant execute on function public.resend_family_referral(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------- P3d: the parent connects
-- The parent (signed in, a parent of p_family) confirms what the sitter may see. Makes the normal invite (same
-- checks as create_invite), locks it to the sitter's email, marks it sent, marks the referral joined and pushes the
-- sitter. Returns the invite's id (the parent's P25) and link token.
create or replace function public.claim_family_referral(
  p_token text,
  p_family uuid,
  p_kid_ids uuid[] default null,
  p_can_drive boolean default false,
  p_can_trip boolean default false,
  p_can_message boolean default true,
  p_rate numeric default null,
  p_pay_schedule text default 'weekly'
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r family_referrals; st text; c text; inv invites; fam text; sitter_first text; mail text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_token is null or p_token !~ '^[0-9a-f]{40}$' then raise exception 'not_found'; end if;
  select * into r from family_referrals where token = p_token for update;
  if not found then raise exception 'not_found'; end if;
  st := family_referral_status(r);
  if st <> 'open' then raise exception '%', st; end if;
  if not is_parent_of(p_family) then raise exception 'not a parent of this family'; end if;
  if r.sitter_id = auth.uid() then raise exception 'This is your own link.'; end if;
  if exists (select 1 from family_sitters fs where fs.family_id = p_family and fs.sitter_id = r.sitter_id and fs.status <> 'removed') then
    raise exception 'already_connected';
  end if;
  select nullif(split_part(trim(full_name), ' ', 1), '') into sitter_first from profiles where id = r.sitter_id;
  c := create_invite(p_family, coalesce(sitter_first, ''), p_kid_ids, p_can_drive, p_can_trip, p_can_message, p_rate, p_pay_schedule);
  select lower(email) into mail from auth.users where id = r.sitter_id;
  update invites set sitter_email = mail, sent_at = now() where code = c returning * into inv;
  update family_referrals set joined_family_id = p_family, joined_at = now(), invite_id = inv.id where id = r.id;
  select name into fam from families where id = p_family;
  perform notify_users(array[r.sitter_id], fam || ' joined BabyBadger', 'Review their invite and accept.', '/i/' || inv.link_token);
  return jsonb_build_object('invite_id', inv.id, 'link_token', inv.link_token);
end $$;
revoke execute on function public.claim_family_referral(text, uuid, uuid[], boolean, boolean, boolean, numeric, text) from anon, public;
grant execute on function public.claim_family_referral(text, uuid, uuid[], boolean, boolean, boolean, numeric, text) to authenticated, service_role;

-- ---------------------------------------------------------------- fix: saving an existing sitter profile
-- Migration 19's stamp trigger read new.file_path in the same IF as the table-name check, so every UPDATE of a
-- sitter_profiles row failed with 'record "new" has no field "file_path"' (S40 saving a second time; the upsert in
-- set_found_later below). The credentials check now only runs for sitter_credentials.
create or replace function public.sitter_rows_stamp() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    new.sitter_id := old.sitter_id;
    new.created_at := old.created_at;
    if tg_table_name = 'sitter_credentials' then
      if (new.file_path is distinct from old.file_path or new.issued_on is distinct from old.issued_on
          or new.expires_on is distinct from old.expires_on or new.kind is distinct from old.kind)
         and new.verified_at is not distinct from old.verified_at then
        new.verified_at := null;
      end if;
    end if;
  end if;
  new.updated_at := clock_timestamp();
  return new;
end $$;
revoke execute on function public.sitter_rows_stamp() from public, anon, authenticated;

-- ---------------------------------------------------------------- "Be found by new families later"
alter table public.sitter_profiles
  add column if not exists discoverable_later    boolean not null default false,
  add column if not exists discoverable_later_at timestamptz;

-- Parents of her families read her profile row (sitter_profiles_read), so reading becomes per-column: every column
-- except these two. Done from the catalog so it also covers columns from earlier migrations (birthdate, 23).
revoke select on public.sitter_profiles from authenticated;
do $$ declare cols text; begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position) into cols
    from information_schema.columns
    where table_schema = 'public' and table_name = 'sitter_profiles' and column_name not in ('discoverable_later', 'discoverable_later_at');
  execute format('grant select (%s) on public.sitter_profiles to authenticated', cols);
end $$;
-- Writes go through set_found_later only (it stamps the time).
revoke insert, update on public.sitter_profiles from authenticated;
do $$ declare cols text; begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position) into cols
    from information_schema.columns
    where table_schema = 'public' and table_name = 'sitter_profiles'
      and column_name not in ('discoverable_later', 'discoverable_later_at', 'created_at', 'updated_at');
  execute format('grant insert (%1$s), update (%1$s) on public.sitter_profiles to authenticated', cols);
end $$;

create or replace function public.my_found_later() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  return coalesce((select jsonb_build_object('on', discoverable_later, 'at', discoverable_later_at) from sitter_profiles where sitter_id = auth.uid()),
                  jsonb_build_object('on', false, 'at', null));
end $$;
revoke execute on function public.my_found_later() from anon, public;
grant execute on function public.my_found_later() to authenticated, service_role;

create or replace function public.set_found_later(p_on boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if not exists (select 1 from profiles where id = auth.uid() and role = 'sitter') then raise exception 'only sitters'; end if;
  insert into sitter_profiles (sitter_id, discoverable_later, discoverable_later_at)
    values (auth.uid(), coalesce(p_on, false), now())
    on conflict (sitter_id) do update set
      discoverable_later = excluded.discoverable_later,
      discoverable_later_at = case when sitter_profiles.discoverable_later is distinct from excluded.discoverable_later
                                   then now() else sitter_profiles.discoverable_later_at end;
  return my_found_later();
end $$;
revoke execute on function public.set_found_later(boolean) from anon, public;
grant execute on function public.set_found_later(boolean) to authenticated, service_role;
