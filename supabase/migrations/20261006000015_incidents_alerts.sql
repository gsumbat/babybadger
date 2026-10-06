-- Incidents (wireframe S24 "Log an incident") and the parents' Alerts feed (P9).
-- An incident is a log row: kind 'incident', urgent = true, data {type, where, text} (+ optional photo_path).
-- Same rules as every other log (migration 01): only the shift's sitter writes it, during her active shift;
-- the family's parents read it. No new table, so RLS and grants are unchanged.
--
-- The push alert: "Leo · Incident: Fall or bump", body "Backyard · Slipped off the slide…" (no "Urgent:" prefix,
-- the title already says what it is), always sent (urgent ignores P12 "Food and tasks"), and a tap opens
-- Alerts (/parent/alerts), where the incident is the top red card. Every other kind is unchanged from migration 08.

-- 1. Allow the new kind.
alter table public.logs drop constraint if exists logs_kind_check;
alter table public.logs add constraint logs_kind_check
  check (kind in ('food', 'nap', 'activity', 'diaper', 'note', 'photo', 'incident'));

-- 2. Push text. Copy of migration 08's push_on_log with the 'incident' branch added. Same wording as describeLog().
create or replace function public.push_on_log() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  d jsonb := new.data;
  fam uuid := shift_family(new.shift_id);
  kids text := kid_names(new.kid_ids);
  title text;
  detail text;
  url text := '/parent/shift/' || new.shift_id;
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
    when 'incident' then
      title := 'Incident: ' || coalesce(nullif(d->>'type', ''), 'Other');
      detail := concat_ws(' · ', nullif(d->>'where', ''), nullif(d->>'text', ''));
      url := '/parent/alerts';
    else
      title := initcap(coalesce(nullif(d->>'category', ''), 'note'));
      detail := coalesce(d->>'text', '');
  end case;
  if kids <> '' then title := kids || ' · ' || title; end if;
  if new.urgent and new.kind <> 'incident' then title := 'Urgent: ' || title; end if;
  perform notify_parents(fam, title, coalesce(nullif(detail, ''), 'From ' || first_name_of(new.author_id)),
    url, not new.urgent);
  return new;
end $$;
-- create or replace keeps the trigger and the grants; repeat migration 05's revoke to be safe.
revoke execute on function public.push_on_log() from public, anon, authenticated;
