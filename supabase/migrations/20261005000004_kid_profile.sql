-- Richer child profile for the "Add a child" flow (wireframes P18-P19).
alter table public.kids
  add column if not exists color        text not null default '#E8B9BE',
  add column if not exists calls_you    text not null default '',
  add column if not exists allergies    text not null default '',
  add column if not exists health_notes text not null default '',
  add column if not exists pediatrician text not null default '',
  add column if not exists comfort_item text not null default '';
