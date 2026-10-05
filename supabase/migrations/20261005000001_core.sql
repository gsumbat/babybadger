-- BabyBadger core schema: families, kids, sitters, invites, consent, shifts, live location, logs.
-- Privacy rules enforced here (not just in the app):
--   * A sitter's location can only be written while her own shift is active (clocked in).
--   * Parents read locations only for shifts in their own family.
--   * A sitter sees a family's kids and plans only after accepting an invite.
--   * A sitter can't clock in until she has signed that family's monitoring notice.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- tables
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  role        text check (role in ('parent', 'sitter')),
  created_at  timestamptz not null default now()
);

create table public.families (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  uuid not null references auth.users (id),
  created_at  timestamptz not null default now()
);

create table public.family_parents (
  family_id   uuid not null references public.families (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table public.kids (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.families (id) on delete cascade,
  name        text not null,
  birthdate   date,
  avoid_foods text not null default '',
  notes       text not null default '',
  created_at  timestamptz not null default now()
);

create table public.invites (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.families (id) on delete cascade,
  code        text not null unique,
  sitter_name text not null default '',
  created_by  uuid not null references auth.users (id),
  expires_at  timestamptz not null default now() + interval '7 days',
  accepted_by uuid references auth.users (id),
  accepted_at timestamptz,
  cancelled_at timestamptz,
  created_at  timestamptz not null default now()
);

create table public.family_sitters (
  family_id   uuid not null references public.families (id) on delete cascade,
  sitter_id   uuid not null references auth.users (id) on delete cascade,
  status      text not null default 'needs_consent' check (status in ('needs_consent', 'active', 'removed')),
  joined_at   timestamptz not null default now(),
  primary key (family_id, sitter_id)
);

create table public.consents (
  id              uuid primary key default gen_random_uuid(),
  family_id       uuid not null references public.families (id) on delete cascade,
  sitter_id       uuid not null references auth.users (id) on delete cascade,
  notice_version  text not null,
  terms_version   text not null,
  signed_name     text not null,
  signed_at       timestamptz not null default now()
);

create table public.shifts (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references public.families (id) on delete cascade,
  sitter_id     uuid not null references auth.users (id),
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  status        text not null default 'scheduled' check (status in ('scheduled', 'active', 'completed', 'cancelled')),
  clock_in_at   timestamptz,
  clock_out_at  timestamptz,
  note          text not null default '',
  created_by    uuid not null references auth.users (id),
  created_at    timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index shifts_family_starts on public.shifts (family_id, starts_at);
create index shifts_sitter_starts on public.shifts (sitter_id, starts_at);

create table public.shift_kids (
  shift_id  uuid not null references public.shifts (id) on delete cascade,
  kid_id    uuid not null references public.kids (id) on delete cascade,
  primary key (shift_id, kid_id)
);

create table public.shift_tasks (
  id        uuid primary key default gen_random_uuid(),
  shift_id  uuid not null references public.shifts (id) on delete cascade,
  title     text not null,
  due_at    timestamptz,
  done_at   timestamptz,
  position  int not null default 0
);

create table public.locations (
  id           bigint generated always as identity primary key,
  shift_id     uuid not null references public.shifts (id) on delete cascade,
  sitter_id    uuid not null references auth.users (id),
  lat          double precision not null check (lat between -90 and 90),
  lng          double precision not null check (lng between -180 and 180),
  accuracy_m   real,
  recorded_at  timestamptz not null default now()
);
create index locations_shift_time on public.locations (shift_id, recorded_at desc);

create table public.logs (
  id          uuid primary key default gen_random_uuid(),
  shift_id    uuid not null references public.shifts (id) on delete cascade,
  author_id   uuid not null references auth.users (id),
  kind        text not null check (kind in ('food', 'nap', 'activity', 'diaper', 'note', 'photo')),
  kid_ids     uuid[] not null default '{}',
  data        jsonb not null default '{}',
  photo_path  text,
  urgent      boolean not null default false,
  happened_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
create index logs_shift_time on public.logs (shift_id, happened_at desc);

-- ---------------------------------------------------------------- helpers
-- security definer so policies can look across tables without recursion
create or replace function public.is_parent_of(fid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from family_parents where family_id = fid and user_id = auth.uid());
$$;

create or replace function public.is_sitter_of(fid uuid, require_active boolean default true) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from family_sitters
    where family_id = fid and sitter_id = auth.uid()
      and (status = 'active' or (not require_active and status = 'needs_consent'))
  );
$$;

create or replace function public.shift_family(sid uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select family_id from shifts where id = sid;
$$;

create or replace function public.is_my_active_shift(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from shifts where id = sid and sitter_id = auth.uid() and status = 'active');
$$;

create or replace function public.is_my_shift(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from shifts where id = sid and sitter_id = auth.uid());
$$;

-- needed by the shifts policy: is this person an active sitter of the family?
create or replace function public.is_sitter_of_family(fid uuid, uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from family_sitters where family_id = fid and sitter_id = uid and status = 'active');
$$;

-- ---------------------------------------------------------------- row level security
alter table public.profiles       enable row level security;
alter table public.families       enable row level security;
alter table public.family_parents enable row level security;
alter table public.kids           enable row level security;
alter table public.invites        enable row level security;
alter table public.family_sitters enable row level security;
alter table public.consents       enable row level security;
alter table public.shifts         enable row level security;
alter table public.shift_kids     enable row level security;
alter table public.shift_tasks    enable row level security;
alter table public.locations      enable row level security;
alter table public.logs           enable row level security;

-- profiles: yourself, plus the people you work with (parents <-> their sitters, co-parents)
create policy profiles_self on public.profiles for select using (id = auth.uid());
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_self_insert on public.profiles for insert with check (id = auth.uid());
create policy profiles_related on public.profiles for select using (
  exists (select 1 from family_sitters fs where fs.sitter_id = profiles.id and public.is_parent_of(fs.family_id))
  or exists (select 1 from family_parents fp where fp.user_id = profiles.id and (public.is_parent_of(fp.family_id) or public.is_sitter_of(fp.family_id, false)))
);

create policy families_read on public.families for select using (public.is_parent_of(id) or public.is_sitter_of(id, false));
create policy families_update on public.families for update using (public.is_parent_of(id));

create policy family_parents_read on public.family_parents for select using (public.is_parent_of(family_id) or public.is_sitter_of(family_id, false));

create policy kids_parent on public.kids for all using (public.is_parent_of(family_id)) with check (public.is_parent_of(family_id));
create policy kids_sitter_read on public.kids for select using (public.is_sitter_of(family_id));

create policy invites_parent on public.invites for select using (public.is_parent_of(family_id));
create policy invites_parent_cancel on public.invites for update using (public.is_parent_of(family_id)) with check (public.is_parent_of(family_id));

create policy family_sitters_parent_read on public.family_sitters for select using (public.is_parent_of(family_id));
create policy family_sitters_parent_remove on public.family_sitters for update using (public.is_parent_of(family_id)) with check (public.is_parent_of(family_id) and status = 'removed');
create policy family_sitters_self_read on public.family_sitters for select using (sitter_id = auth.uid());

create policy consents_read on public.consents for select using (sitter_id = auth.uid() or public.is_parent_of(family_id));

create policy shifts_parent on public.shifts for all using (public.is_parent_of(family_id))
  with check (public.is_parent_of(family_id) and public.is_sitter_of_family(family_id, sitter_id));
create policy shifts_sitter_read on public.shifts for select using (sitter_id = auth.uid());

create policy shift_kids_parent on public.shift_kids for all using (public.is_parent_of(public.shift_family(shift_id))) with check (public.is_parent_of(public.shift_family(shift_id)));
create policy shift_kids_sitter on public.shift_kids for select using (public.is_my_shift(shift_id));

create policy tasks_parent on public.shift_tasks for all using (public.is_parent_of(public.shift_family(shift_id))) with check (public.is_parent_of(public.shift_family(shift_id)));
create policy tasks_sitter_read on public.shift_tasks for select using (public.is_my_shift(shift_id));

-- locations: write only while clocked in, as yourself
create policy locations_sitter_insert on public.locations for insert
  with check (sitter_id = auth.uid() and public.is_my_active_shift(shift_id));
create policy locations_sitter_read on public.locations for select using (sitter_id = auth.uid());
create policy locations_parent_read on public.locations for select using (public.is_parent_of(public.shift_family(shift_id)));

-- logs: sitter writes during her active shift; parents read (and may add notes)
create policy logs_sitter_insert on public.logs for insert
  with check (author_id = auth.uid() and public.is_my_active_shift(shift_id));
create policy logs_sitter_read on public.logs for select using (public.is_my_shift(shift_id));
create policy logs_parent_read on public.logs for select using (public.is_parent_of(public.shift_family(shift_id)));

-- ---------------------------------------------------------------- RPCs (all state changes that need rules)
-- New user's profile row
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.create_family(p_family_name text, p_your_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare fid uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into profiles (id, full_name, role) values (auth.uid(), p_your_name, 'parent')
    on conflict (id) do update set full_name = excluded.full_name, role = 'parent';
  insert into families (name, created_by) values (p_family_name, auth.uid()) returning id into fid;
  insert into family_parents (family_id, user_id) values (fid, auth.uid());
  return fid;
end $$;

create or replace function public.create_invite(p_family uuid, p_sitter_name text) returns text
language plpgsql security definer set search_path = public as $$
declare c text;
begin
  if not is_parent_of(p_family) then raise exception 'not a parent of this family'; end if;
  loop
    c := lpad((floor(random() * 1000000))::int::text, 6, '0');
    exit when not exists (select 1 from invites where code = c and accepted_at is null and cancelled_at is null);
  end loop;
  insert into invites (family_id, code, sitter_name, created_by) values (p_family, c, coalesce(p_sitter_name, ''), auth.uid());
  return c;
end $$;

create or replace function public.accept_invite(p_code text, p_your_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare inv invites;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into inv from invites where code = p_code and accepted_at is null and cancelled_at is null for update;
  if not found then raise exception 'invite code not found or already used'; end if;
  if inv.expires_at < now() then raise exception 'invite code expired'; end if;
  if is_parent_of(inv.family_id) then raise exception 'you are a parent in this family'; end if;
  insert into profiles (id, full_name, role) values (auth.uid(), p_your_name, 'sitter')
    on conflict (id) do update set full_name = case when profiles.full_name = '' then excluded.full_name else profiles.full_name end,
                                   role = coalesce(profiles.role, 'sitter');
  update invites set accepted_by = auth.uid(), accepted_at = now() where id = inv.id;
  insert into family_sitters (family_id, sitter_id, status) values (inv.family_id, auth.uid(), 'needs_consent')
    on conflict (family_id, sitter_id) do update set status = case when family_sitters.status = 'removed' then 'needs_consent' else family_sitters.status end;
  return inv.family_id;
end $$;

create or replace function public.sign_consent(p_family uuid, p_signed_name text, p_notice_version text, p_terms_version text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_sitter_of(p_family, false) then raise exception 'no invite accepted for this family'; end if;
  if length(trim(p_signed_name)) < 2 then raise exception 'type your full name to sign'; end if;
  insert into consents (family_id, sitter_id, notice_version, terms_version, signed_name)
    values (p_family, auth.uid(), p_notice_version, p_terms_version, trim(p_signed_name));
  update family_sitters set status = 'active' where family_id = p_family and sitter_id = auth.uid();
end $$;

-- Clock-in opens 15 minutes before the shift starts and closes when it ends.
create or replace function public.clock_in(p_shift uuid) returns shifts
language plpgsql security definer set search_path = public as $$
declare s shifts;
begin
  select * into s from shifts where id = p_shift and sitter_id = auth.uid() for update;
  if not found then raise exception 'shift not found'; end if;
  if s.status <> 'scheduled' then raise exception 'shift is %', s.status; end if;
  if not is_sitter_of(s.family_id) then raise exception 'sign the family''s monitoring notice first'; end if;
  if now() < s.starts_at - interval '15 minutes' then raise exception 'clock-in opens 15 minutes before the shift'; end if;
  if now() > s.ends_at then raise exception 'this shift has already ended'; end if;
  if exists (select 1 from shifts where sitter_id = auth.uid() and status = 'active') then raise exception 'you are already clocked in to another shift'; end if;
  update shifts set status = 'active', clock_in_at = now() where id = p_shift returning * into s;
  return s;
end $$;

create or replace function public.clock_out(p_shift uuid, p_note text default '') returns shifts
language plpgsql security definer set search_path = public as $$
declare s shifts;
begin
  update shifts set status = 'completed', clock_out_at = now(), note = coalesce(p_note, '')
    where id = p_shift and sitter_id = auth.uid() and status = 'active' returning * into s;
  if not found then raise exception 'not clocked in to this shift'; end if;
  return s;
end $$;

create or replace function public.set_task_done(p_task uuid, p_done boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  update shift_tasks t set done_at = case when p_done then now() else null end
    where t.id = p_task and is_my_active_shift(t.shift_id);
  if not found then raise exception 'task not found or shift not active'; end if;
end $$;

-- Safety net: a shift left running 2 hours past its end closes itself (run from a cron job).
create or replace function public.auto_close_shifts() returns int
language sql security definer set search_path = public as $$
  with closed as (
    update shifts set status = 'completed', clock_out_at = ends_at, note = trim(note || ' [auto clock-out]')
    where status = 'active' and now() > ends_at + interval '2 hours' returning 1
  ) select count(*)::int from closed;
$$;

revoke all on function public.auto_close_shifts() from public;

-- realtime: parents watch location, logs and shift status live
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.locations, public.logs, public.shifts, public.shift_tasks;
  end if;
end $$;
