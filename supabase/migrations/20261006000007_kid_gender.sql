-- Gender on the child profile (wireframes P18 / P18e): optional, girl or boy.
-- Lets screens use the wireframes' pronouns ("Her plan", "what calms her"); empty falls back to neutral copy.
alter table public.kids
  add column if not exists gender text check (gender in ('girl', 'boy'));

-- New columns need their grant spelled out.
grant select, insert, update on public.kids to authenticated;
