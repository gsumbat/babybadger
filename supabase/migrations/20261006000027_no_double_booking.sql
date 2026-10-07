-- A sitter can't be booked for two shifts at the same time, for any family (S33b "You're already booked then").
--   * Checked when a shift is created, when its sitter or times change (booking, Ask your pool, stay longer), or when a
--     cancelled shift is brought back. Clocking in / out only changes status, so shifts that already overlap before this
--     migration still work.
--   * Back-to-back shifts are fine (one ends at 7:00, the next starts at 7:00).
--   * Security definer: the check sees her shifts with every family. The message never names the other family.
-- Safe to run more than once.

create or replace function public.shifts_no_double_booking() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.sitter_id is null or new.status not in ('scheduled', 'active') then return new; end if;
  if tg_op = 'UPDATE'
     and new.sitter_id is not distinct from old.sitter_id
     and new.starts_at = old.starts_at and new.ends_at = old.ends_at
     and old.status in ('scheduled', 'active') then
    return new;
  end if;
  if exists (
    select 1 from shifts s
    where s.sitter_id = new.sitter_id and s.id <> new.id
      and s.status in ('scheduled', 'active')
      and s.starts_at < new.ends_at and s.ends_at > new.starts_at
  ) then
    raise exception 'already booked then: this sitter has another shift at that time' using errcode = '23P01';
  end if;
  return new;
end $$;
drop trigger if exists shifts_no_double_booking on public.shifts;
create trigger shifts_no_double_booking before insert or update on public.shifts
  for each row execute function public.shifts_no_double_booking();
revoke execute on function public.shifts_no_double_booking() from public, anon, authenticated;
