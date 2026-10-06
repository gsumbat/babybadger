-- Interval repeats on the care plan (wireframe P20: Bottle "12:00 PM · Every 3 hrs", Diaper check "Every 2 hrs").
-- every_minutes = repeat every N minutes inside the shift, from `starts` (or the shift start when there's no
-- start time) until `ends` or the end of the shift. Null = once.
alter table public.care_items
  add column if not exists every_minutes smallint check (every_minutes between 30 and 720);

-- Per-type extras from P20a (P20f diaper, P20g medicine). The app keeps only the chosen type's keys:
--   bottle   {"amount_oz": 4, "milk": "formula" | "breast milk" | "whole milk"}
--   diaper   {"potty": true}            (potty training: the item reads "Potty break")
--   medicine {"dose": "5 ml"}           (the medicine's name is the title)
-- Everything else is {}.
alter table public.care_items
  add column if not exists details jsonb not null default '{}'::jsonb;

-- New columns need their grant spelled out.
grant select, insert, update, delete on public.care_items to authenticated;

-- S48 now shows the diaper choice as #1 / #2 / Both / Dry (still stored as wet / dirty / both / dry). Same push
-- text as migration 05 except the diaper detail, so it matches describeLog() in the app.
create or replace function public.push_on_log() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  d jsonb := new.data;
  fam uuid := shift_family(new.shift_id);
  kids text := kid_names(new.kid_ids);
  title text;
  detail text;
begin
  case new.kind
    when 'food' then
      title := initcap(coalesce(nullif(d->>'meal', ''), 'food'));
      detail := concat_ws(' · ', nullif(d->>'what', ''), 'ate ' || nullif(d->>'amount', ''));
    when 'nap' then
      title := case when coalesce(d->>'ended_at', '') <> '' then 'Nap' else 'Nap started' end;
      detail := concat_ws(' · ', nullif(d->>'started_at', '') || coalesce(' – ' || nullif(d->>'ended_at', ''), ''), nullif(d->>'how', ''));
    when 'activity' then
      title := initcap(coalesce(nullif(d->>'what', ''), 'activity'));
      detail := concat_ws(' · ', nullif(d->>'duration', ''), nullif(d->>'note', ''));
    when 'diaper' then
      title := case when coalesce(d->>'potty', '') <> '' then 'Potty: ' || (d->>'potty') else 'Diaper' end;
      detail := concat_ws(' · ',
        case d->>'diaper' when 'wet' then '#1' when 'dirty' then '#2' when 'both' then 'Both' when 'dry' then 'Dry'
          else nullif(d->>'diaper', '') end,
        nullif(d->>'note', ''));
    when 'photo' then
      title := 'Photo update';
      detail := coalesce(d->>'caption', '');
    else
      title := initcap(coalesce(nullif(d->>'category', ''), 'note'));
      detail := coalesce(d->>'text', '');
  end case;
  if kids <> '' then title := kids || ' · ' || title; end if;
  if new.urgent then title := 'Urgent: ' || title; end if;
  perform notify_parents(fam, title, coalesce(nullif(detail, ''), 'From ' || first_name_of(new.author_id)),
    '/parent/shift/' || new.shift_id, not new.urgent);
  return new;
end $$;
-- create or replace keeps the trigger and the grants; repeat migration 05's revoke to be safe.
revoke execute on function public.push_on_log() from public, anon, authenticated;
