-- Shift timing: running late, cancelling, staying longer (wireframes S21 Running late, S25 Parent asks to extend).
--   * S21: the sitter tells the family she's running late (how many minutes + a note). It's stored on the shift
--     (late_minutes, late_note, late_at) so the parents' Home (P4c) shows it, and the parents get a push.
--     "I can't make it today" cancels her shift (cancelled_by, cancel_reason, cancelled_at) with an urgent push.
--   * S25: a parent asks the sitter to stay longer (shift_extensions); the sitter accepts (any later end time she
--     picks) or declines on her active shift. Accepting moves shifts.ends_at. Every step pushes the other side.
-- All writes go through the functions below, which check who may do what. Direct table writes can't fake a late
-- notice or who cancelled.

-- ---------------------------------------------------------------- shifts
alter table public.shifts
  add column if not exists late_minutes  int check (late_minutes is null or late_minutes between 1 and 240),
  add column if not exists late_note     text not null default '' check (char_length(late_note) <= 500),
  add column if not exists late_at       timestamptz,
  add column if not exists cancelled_by  uuid references auth.users (id),
  add column if not exists cancel_reason text not null default '' check (char_length(cancel_reason) <= 500),
  add column if not exists cancelled_at  timestamptz;

-- Not security definer on purpose: current_user is 'authenticated' for Data API writes and the function owner
-- inside report_late / cancel_my_shift. A parent cancelling from the app is recorded as cancelled by her.
create or replace function public.guard_shift_timing() returns trigger
language plpgsql set search_path = public as $$
begin
  if current_user <> 'authenticated' then return new; end if;
  if tg_op = 'INSERT' then
    new.late_minutes := null; new.late_note := ''; new.late_at := null;
    new.cancelled_by := null; new.cancelled_at := null;
    return new;
  end if;
  if new.late_minutes is distinct from old.late_minutes or new.late_note is distinct from old.late_note
     or new.late_at is distinct from old.late_at then
    raise exception 'only the sitter can send a late notice' using errcode = '42501';
  end if;
  if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    new.cancelled_by := auth.uid();
    new.cancelled_at := now();
  elsif new.cancelled_by is distinct from old.cancelled_by or new.cancelled_at is distinct from old.cancelled_at then
    raise exception 'can''t change who cancelled' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger shifts_timing_guard before insert or update on public.shifts
  for each row execute function public.guard_shift_timing();

-- ---------------------------------------------------------------- shift_extensions
create table public.shift_extensions (
  id               uuid primary key default gen_random_uuid(),
  shift_id         uuid not null references public.shifts (id) on delete cascade,
  requested_by     uuid not null references auth.users (id),
  new_ends_at      timestamptz not null,
  note             text not null default '' check (char_length(note) <= 500),
  status           text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'withdrawn')),
  -- The end time the sitter agreed to (S25 chips: may be earlier than asked, e.g. "Until 7:15").
  answered_ends_at timestamptz,
  answered_at      timestamptz,
  created_at       timestamptz not null default now()
);
create index shift_extensions_shift on public.shift_extensions (shift_id, created_at desc);
-- One open request per shift; a new one replaces it (request_extension withdraws the old one).
create unique index shift_extensions_one_pending on public.shift_extensions (shift_id) where status = 'pending';

alter table public.shift_extensions enable row level security;
-- The family's parents and that shift's sitter read them; nobody writes directly.
create policy shift_extensions_read on public.shift_extensions for select
  using (public.is_parent_of(public.shift_family(shift_id)) or public.is_my_shift(shift_id));

-- ---------------------------------------------------------------- S21: running late
create or replace function public.report_late(p_shift uuid, p_minutes int, p_note text default '', p_risk text default '')
returns shifts language plpgsql security definer set search_path = public as $$
declare s shifts;
begin
  select * into s from shifts where id = p_shift and sitter_id = auth.uid() for update;
  if not found then raise exception 'not your shift'; end if;
  if s.status <> 'scheduled' or s.ends_at <= now() then raise exception 'this shift has already started or ended'; end if;
  if p_minutes is null or p_minutes < 1 or p_minutes > 240 then raise exception 'pick how late you''ll be'; end if;
  update shifts set late_minutes = p_minutes, late_note = left(trim(coalesce(p_note, '')), 500), late_at = now()
    where id = p_shift returning * into s;
  -- "Maya is running 15 min late" · her note · "Pick up Ava at 3:15 is at risk." (the app words the risk line in
  -- the family's local time, which the database doesn't know).
  perform notify_parents(s.family_id, first_name_of(s.sitter_id) || ' is running ' || p_minutes || ' min late',
    concat_ws(' ', nullif(s.late_note, ''), nullif(left(trim(coalesce(p_risk, '')), 200), '')), '/parent', false);
  return s;
end $$;

-- S21 "I can't make it today": the sitter cancels her own upcoming shift; parents get an urgent alert.
create or replace function public.cancel_my_shift(p_shift uuid, p_reason text default '')
returns shifts language plpgsql security definer set search_path = public as $$
declare s shifts;
begin
  select * into s from shifts where id = p_shift and sitter_id = auth.uid() for update;
  if not found then raise exception 'not your shift'; end if;
  if s.status <> 'scheduled' or s.ends_at <= now() then raise exception 'only an upcoming shift can be cancelled'; end if;
  update shifts set status = 'cancelled', cancelled_by = auth.uid(), cancelled_at = now(),
      cancel_reason = left(trim(coalesce(p_reason, '')), 500)
    where id = p_shift returning * into s;
  update shift_extensions set status = 'withdrawn', answered_at = now() where shift_id = p_shift and status = 'pending';
  perform notify_parents(s.family_id, 'Urgent: ' || first_name_of(s.sitter_id) || ' can''t make it',
    coalesce(nullif(s.cancel_reason, ''), 'She cancelled the shift.'), '/parent/shift/' || s.id, false);
  return s;
end $$;

-- ---------------------------------------------------------------- S25: stay longer
-- A parent asks the shift's sitter to stay until p_until (only later than the current end, up to 12 hours).
create or replace function public.request_extension(p_shift uuid, p_until timestamptz, p_note text default '')
returns shift_extensions language plpgsql security definer set search_path = public as $$
declare
  s shifts;
  r shift_extensions;
  who text := coalesce((select nullif(split_part(trim(full_name), ' ', 1), '') from profiles where id = auth.uid()), 'The family');
begin
  select * into s from shifts where id = p_shift for update;
  if not found or not is_parent_of(s.family_id) then raise exception 'not your family''s shift'; end if;
  if s.status not in ('scheduled', 'active') then raise exception 'this shift has ended'; end if;
  if p_until is null or p_until <= s.ends_at then raise exception 'pick a time after the shift ends'; end if;
  if p_until > s.ends_at + interval '12 hours' then raise exception 'that''s more than 12 hours longer'; end if;
  update shift_extensions set status = 'withdrawn', answered_at = now() where shift_id = p_shift and status = 'pending';
  insert into shift_extensions (shift_id, requested_by, new_ends_at, note)
    values (p_shift, auth.uid(), p_until, left(trim(coalesce(p_note, '')), 500)) returning * into r;
  perform notify_users(array[s.sitter_id],
    who || ' asks: can you stay ' || round(extract(epoch from (p_until - s.ends_at)) / 60) || ' min longer?',
    r.note, '/sitter/shift/' || s.id);
  return r;
end $$;

-- The sitter answers on her shift (S25). Accepting moves the shift's end to p_until (default: the time asked).
create or replace function public.answer_extension(p_request uuid, p_accept boolean, p_until timestamptz default null)
returns shifts language plpgsql security definer set search_path = public as $$
declare
  r shift_extensions;
  s shifts;
  u timestamptz;
  who text;
begin
  select * into r from shift_extensions where id = p_request for update;
  if not found then raise exception 'request not found'; end if;
  select * into s from shifts where id = r.shift_id for update;
  if s.sitter_id is distinct from auth.uid() then raise exception 'not your shift'; end if;
  if r.status <> 'pending' then raise exception 'this request was already answered'; end if;
  if s.status not in ('scheduled', 'active') then raise exception 'this shift has ended'; end if;
  who := first_name_of(s.sitter_id);
  if coalesce(p_accept, false) then
    u := coalesce(p_until, r.new_ends_at);
    if u <= s.ends_at then raise exception 'pick a time after the shift ends'; end if;
    if u > s.ends_at + interval '12 hours' then raise exception 'that''s more than 12 hours longer'; end if;
    update shift_extensions set status = 'accepted', answered_ends_at = u, answered_at = now() where id = r.id;
    perform notify_parents(s.family_id, who || ' can stay ' || round(extract(epoch from (u - s.ends_at)) / 60) || ' min longer',
      'The shift end moved.', '/parent', false);
    update shifts set ends_at = u where id = s.id returning * into s;
  else
    update shift_extensions set status = 'declined', answered_at = now() where id = r.id;
    perform notify_parents(s.family_id, who || ' can''t stay longer', 'The shift ends on time.', '/parent', false);
  end if;
  return s;
end $$;

-- Live card on S4 and the parents' Home.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.shift_extensions;
  end if;
end $$;

-- ---------------------------------------------------------------- access
-- New columns and tables need their grants spelled out (existing policies still decide which rows).
grant select, insert, update, delete on public.shifts to authenticated;
grant select on public.shift_extensions to authenticated;
revoke insert, update, delete on public.shift_extensions from authenticated;
revoke all on public.shift_extensions from anon;
grant all on public.shifts, public.shift_extensions to service_role;
revoke execute on function public.guard_shift_timing() from public, anon, authenticated;
revoke execute on function public.report_late(uuid, int, text, text), public.cancel_my_shift(uuid, text),
  public.request_extension(uuid, timestamptz, text), public.answer_extension(uuid, boolean, timestamptz) from public, anon;
grant execute on function public.report_late(uuid, int, text, text), public.cancel_my_shift(uuid, text),
  public.request_extension(uuid, timestamptz, text), public.answer_extension(uuid, boolean, timestamptz) to authenticated;
