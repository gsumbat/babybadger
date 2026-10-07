-- Shift log reactions and photo requests (wireframe P77 Shift log; S4 strip "Jen asked for a photo").
--   * "Love it" on a photo entry: a parent of the family adds or removes her own heart; the shift's sitter sees it
--     and gets a push ("Jen loved your photo").
--   * "Ask for a photo": a parent of the family asks the sitter on a live shift for a photo update, at most once per
--     10 minutes per shift (ask_for_photo). The sitter gets a push and a strip on her shift screen until she logs a
--     photo.
-- Run after migration 25. Safe to run twice.

-- ---------------------------------------------------------------- reactions
create table if not exists public.log_reactions (
  log_id      uuid not null references public.logs (id) on delete cascade,
  parent_id   uuid not null references auth.users (id) on delete cascade,
  kind        text not null default 'love' check (kind in ('love')),
  -- Filled from the log (trigger below) so the shift's screens can watch one shift live.
  shift_id    uuid references public.shifts (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (log_id, parent_id, kind)
);
create index if not exists log_reactions_shift on public.log_reactions (shift_id);
alter table public.log_reactions enable row level security;

-- The log's shift (security definer: policies can't read logs directly without recursion worries).
create or replace function public.log_shift(lid uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select shift_id from logs where id = lid;
$$;

-- Only photo entries take a "Love it".
create or replace function public.is_photo_log(lid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from logs where id = lid and kind = 'photo');
$$;

create or replace function public.log_reactions_fill() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.shift_id := log_shift(new.log_id);
  return new;
end $$;
drop trigger if exists log_reactions_fill on public.log_reactions;
create trigger log_reactions_fill before insert on public.log_reactions for each row execute function public.log_reactions_fill();

drop policy if exists log_reactions_parent_read on public.log_reactions;
drop policy if exists log_reactions_sitter_read on public.log_reactions;
drop policy if exists log_reactions_parent_insert on public.log_reactions;
drop policy if exists log_reactions_parent_delete on public.log_reactions;
create policy log_reactions_parent_read on public.log_reactions for select
  using (public.is_parent_of(public.shift_family(public.log_shift(log_id))));
create policy log_reactions_sitter_read on public.log_reactions for select
  using (public.is_my_shift(public.log_shift(log_id)));
create policy log_reactions_parent_insert on public.log_reactions for insert
  with check (parent_id = auth.uid() and public.is_photo_log(log_id)
    and public.is_parent_of(public.shift_family(public.log_shift(log_id))));
create policy log_reactions_parent_delete on public.log_reactions for delete
  using (parent_id = auth.uid());

-- "Jen loved your photo" to the shift's sitter (body: the photo's caption).
create or replace function public.push_on_reaction() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  s shifts;
  cap text;
begin
  select sh.* into s from shifts sh join logs l on l.shift_id = sh.id where l.id = new.log_id;
  if not found then return new; end if;
  select coalesce(nullif(trim(data->>'caption'), ''), 'Tap to see your shift.') into cap from logs where id = new.log_id;
  perform notify_users(array[s.sitter_id], first_name_of(new.parent_id) || ' loved your photo', cap, '/sitter/shift/' || s.id);
  return new;
end $$;
drop trigger if exists log_reactions_push on public.log_reactions;
create trigger log_reactions_push after insert on public.log_reactions for each row execute function public.push_on_reaction();

-- ---------------------------------------------------------------- photo requests
create table if not exists public.photo_requests (
  id          uuid primary key default gen_random_uuid(),
  shift_id    uuid not null references public.shifts (id) on delete cascade,
  parent_id   uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index if not exists photo_requests_shift_time on public.photo_requests (shift_id, created_at desc);
alter table public.photo_requests enable row level security;
-- Read only: rows are written by ask_for_photo().
drop policy if exists photo_requests_parent_read on public.photo_requests;
drop policy if exists photo_requests_sitter_read on public.photo_requests;
create policy photo_requests_parent_read on public.photo_requests for select
  using (public.is_parent_of(public.shift_family(shift_id)));
create policy photo_requests_sitter_read on public.photo_requests for select
  using (public.is_my_shift(shift_id));

-- A parent of the family asks the sitter on a live shift for a photo. Once per 10 minutes per shift.
create or replace function public.ask_for_photo(p_shift uuid) returns photo_requests
language plpgsql security definer set search_path = public as $$
declare
  s shifts;
  r photo_requests;
  last_at timestamptz;
  who text := coalesce((select nullif(split_part(trim(full_name), ' ', 1), '') from profiles where id = auth.uid()), 'The family');
begin
  select * into s from shifts where id = p_shift for update;
  if not found or not is_parent_of(s.family_id) then raise exception 'not your family''s shift'; end if;
  if s.status <> 'active' then raise exception 'the shift isn''t live'; end if;
  select max(created_at) into last_at from photo_requests where shift_id = p_shift;
  if last_at is not null and last_at > now() - interval '10 minutes' then
    raise exception 'You asked % min ago. Try again in a few minutes.', greatest(1, round(extract(epoch from (now() - last_at)) / 60));
  end if;
  insert into photo_requests (shift_id, parent_id) values (p_shift, auth.uid()) returning * into r;
  perform notify_users(array[s.sitter_id], who || ' asked for a photo update', 'Tap to add one.', '/sitter/shift/' || s.id);
  return r;
end $$;

-- ---------------------------------------------------------------- realtime
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'log_reactions') then
      alter publication supabase_realtime add table public.log_reactions;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'photo_requests') then
      alter publication supabase_realtime add table public.photo_requests;
    end if;
  end if;
end $$;

-- ---------------------------------------------------------------- access
grant select, insert, delete on public.log_reactions to authenticated;
grant select on public.photo_requests to authenticated;
grant all on public.log_reactions, public.photo_requests to service_role;
revoke all on public.log_reactions, public.photo_requests from anon;
-- Helpers used inside the policies stay callable by signed-in users.
grant execute on function public.log_shift(uuid), public.is_photo_log(uuid) to authenticated, service_role;
revoke execute on function public.log_shift(uuid), public.is_photo_log(uuid) from anon, public;
grant execute on function public.ask_for_photo(uuid) to authenticated;
revoke execute on function public.ask_for_photo(uuid) from anon, public;
revoke execute on function public.log_reactions_fill(), public.push_on_reaction() from public, anon, authenticated;
