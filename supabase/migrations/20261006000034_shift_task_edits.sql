-- 34. Edit tasks on a booked shift (P5e). Full-access parents add, rename, retime and remove a shift's tasks while the
-- shift is upcoming (scheduled, not over yet) or live (active); the sitter gets a push for each change:
-- "Jen added a task: Pick up milk", "Jen changed a task: …", "Jen removed a task: …".
--
-- Parents could already write shift_tasks directly (core policy tasks_parent, for all); booking (parent/shift/new)
-- still inserts the shift's first tasks that way, without a push. Edits after booking go through these functions so
-- the push is sent once and the status is checked. A trigger also stops any write to the tasks of a completed or
-- cancelled shift (the report keeps what the sitter saw).
-- Re-runnable: "create or replace", trigger dropped first.

-- ---------------------------------------------------------------- guard: no edits after the shift is over
create or replace function public.shift_tasks_open_only() returns trigger
language plpgsql security definer set search_path = public as $$
declare st text := (select status from shifts where id = coalesce(new.shift_id, old.shift_id));
begin
  -- st is null while the shift itself is being deleted (cascade): let that through.
  if st in ('completed', 'cancelled') then
    raise exception 'This shift is over; its tasks can''t change.' using errcode = 'check_violation';
  end if;
  if tg_op = 'UPDATE' then new.shift_id := old.shift_id; end if;
  return coalesce(new, old);
end $$;
revoke execute on function public.shift_tasks_open_only() from public, anon, authenticated;
drop trigger if exists shift_tasks_open_only on public.shift_tasks;
create trigger shift_tasks_open_only before insert or update or delete on public.shift_tasks
  for each row execute function public.shift_tasks_open_only();

-- ---------------------------------------------------------------- shared checks
-- The shift, when the signed-in user is a full-access parent of its family and it is upcoming or live.
create or replace function public.editable_shift(p_shift uuid) returns shifts
language plpgsql stable security definer set search_path = public as $$
declare s shifts;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into s from shifts where id = p_shift;
  if s.id is null or not is_parent_of(s.family_id) then raise exception 'not allowed' using errcode = 'insufficient_privilege'; end if;
  if not (s.status = 'active' or (s.status = 'scheduled' and s.ends_at > now())) then
    raise exception 'This shift is over; its tasks can''t change.';
  end if;
  return s;
end $$;
revoke execute on function public.editable_shift(uuid) from public, anon, authenticated;

create or replace function public.clean_task_title(p_title text) returns text
language plpgsql immutable set search_path = public as $$
declare t text := btrim(regexp_replace(coalesce(p_title, ''), '\s+', ' ', 'g'));
begin
  if t = '' then raise exception 'Add what needs doing.'; end if;
  if length(t) > 120 then raise exception 'Keep it under 120 characters.'; end if;
  return t;
end $$;
revoke execute on function public.clean_task_title(text) from public, anon, authenticated;

-- The due time sits inside the shift (or is empty).
create or replace function public.check_task_due(s shifts, p_due timestamptz) returns void
language plpgsql immutable set search_path = public as $$
begin
  if p_due is not null and (p_due < s.starts_at - interval '1 minute' or p_due > s.ends_at + interval '1 minute') then
    raise exception 'Pick a time during the shift.';
  end if;
end $$;
revoke execute on function public.check_task_due(shifts, timestamptz) from public, anon, authenticated;

create or replace function public.push_task_change(s shifts, p_verb text, p_title text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform notify_users(array[s.sitter_id], first_name_of(auth.uid()) || ' ' || p_verb || ' a task: ' || p_title,
    'Open your shift to see the plan.', '/sitter/shift/' || s.id);
end $$;
revoke execute on function public.push_task_change(shifts, text, text) from public, anon, authenticated;

-- ---------------------------------------------------------------- the three edits
create or replace function public.add_shift_task(p_shift uuid, p_title text, p_due timestamptz default null) returns shift_tasks
language plpgsql security definer set search_path = public as $$
declare s shifts := editable_shift(p_shift); t text := clean_task_title(p_title); r shift_tasks;
begin
  perform check_task_due(s, p_due);
  insert into shift_tasks (shift_id, title, due_at, position)
    values (s.id, t, p_due, coalesce((select max(position) + 1 from shift_tasks where shift_id = s.id), 0))
    returning * into r;
  perform push_task_change(s, 'added', t);
  return r;
end $$;

create or replace function public.edit_shift_task(p_task uuid, p_title text, p_due timestamptz default null) returns shift_tasks
language plpgsql security definer set search_path = public as $$
declare old_t shift_tasks; s shifts; t text; r shift_tasks;
begin
  select * into old_t from shift_tasks where id = p_task;
  if old_t.id is null then raise exception 'not allowed' using errcode = 'insufficient_privilege'; end if;
  s := editable_shift(old_t.shift_id);
  t := clean_task_title(p_title);
  perform check_task_due(s, p_due);
  update shift_tasks set title = t, due_at = p_due where id = p_task returning * into r;
  if t is distinct from old_t.title or p_due is distinct from old_t.due_at then
    perform push_task_change(s, 'changed', t);
  end if;
  return r;
end $$;

create or replace function public.delete_shift_task(p_task uuid) returns void
language plpgsql security definer set search_path = public as $$
declare old_t shift_tasks; s shifts;
begin
  select * into old_t from shift_tasks where id = p_task;
  if old_t.id is null then raise exception 'not allowed' using errcode = 'insufficient_privilege'; end if;
  s := editable_shift(old_t.shift_id);
  delete from shift_tasks where id = p_task;
  perform push_task_change(s, 'removed', old_t.title);
end $$;

-- ---------------------------------------------------------------- access
revoke execute on function public.add_shift_task(uuid, text, timestamptz), public.edit_shift_task(uuid, text, timestamptz),
  public.delete_shift_task(uuid) from public, anon;
grant execute on function public.add_shift_task(uuid, text, timestamptz), public.edit_shift_task(uuid, text, timestamptz),
  public.delete_shift_task(uuid) to authenticated, service_role;
-- The table itself (explicit, as for every table since migration 10): parents keep their core policy for booking;
-- sitters and read-only members only read.
grant select, insert, update, delete on public.shift_tasks to authenticated;
grant all on public.shift_tasks to service_role;
revoke all on public.shift_tasks from anon;
