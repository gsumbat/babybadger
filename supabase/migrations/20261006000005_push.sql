-- Push notifications (build plan phase 1, wireframes P9 Alerts and P12 Settings › Alerts).
-- Phones register an Expo push token; the database sends alerts to the family's parents through
-- Expo's push service when the sitter clocks in, clocks out, or logs an entry.
-- Needs the pg_net extension (Supabase: Database › Extensions › pg_net, or the line below).

create extension if not exists pg_net;

-- One row per phone. A token moves to whoever signed in on that phone last.
create table public.push_tokens (
  token       text primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  platform    text not null default '',
  updated_at  timestamptz not null default now()
);
create index push_tokens_user on public.push_tokens (user_id);
alter table public.push_tokens enable row level security;
create policy push_tokens_self on public.push_tokens for select using (user_id = auth.uid());

-- P12 › Alerts › "Food and tasks: each entry the sitter logs". Clock-in, clock-out and urgent entries always send.
alter table public.profiles add column if not exists alert_logs boolean not null default true;

create or replace function public.register_push_token(p_token text, p_platform text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  if p_token !~ '^Expo(nent)?PushToken\[.+\]$' then raise exception 'not an Expo push token'; end if;
  insert into push_tokens (token, user_id, platform, updated_at) values (p_token, auth.uid(), coalesce(p_platform, ''), now())
    on conflict (token) do update set user_id = excluded.user_id, platform = excluded.platform, updated_at = now();
end $$;

create or replace function public.remove_push_token(p_token text) returns void
language sql security definer set search_path = public as $$
  delete from push_tokens where token = p_token and user_id = auth.uid();
$$;

-- Sends one alert to every phone of the family's parents. Never blocks or fails the change that caused it.
create or replace function public.notify_parents(p_family uuid, p_title text, p_body text, p_url text, p_is_log boolean)
returns void language plpgsql security definer set search_path = public as $$
declare msgs jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
      'to', t.token, 'title', p_title, 'body', p_body, 'sound', 'default', 'data', jsonb_build_object('url', p_url))), '[]'::jsonb)
    into msgs
    from family_parents fp
    join push_tokens t on t.user_id = fp.user_id
    left join profiles pr on pr.id = fp.user_id
    where fp.family_id = p_family and (not p_is_log or coalesce(pr.alert_logs, true));
  if jsonb_array_length(msgs) = 0 then return; end if;
  perform net.http_post(
    url := 'https://exp.host/--/api/v2/push/send',
    body := msgs,
    headers := '{"Content-Type": "application/json", "Accept": "application/json"}'::jsonb);
exception when others then
  raise warning 'push not sent: %', sqlerrm;
end $$;

create or replace function public.first_name_of(uid uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(nullif(split_part(trim(full_name), ' ', 1), ''), 'Your sitter') from profiles where id = uid;
$$;

create or replace function public.kid_names(ids uuid[]) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(string_agg(name, ' and ' order by name), '') from kids where id = any(ids);
$$;

-- Clock-in and clock-out (P9: "Maya clocked in", P4/P5: report ready).
create or replace function public.push_on_shift() returns trigger
language plpgsql security definer set search_path = public as $$
declare who text := first_name_of(new.sitter_id);
begin
  if old.status = 'scheduled' and new.status = 'active' then
    perform notify_parents(new.family_id, who || ' clocked in', 'See the live map.', '/parent/shift/' || new.id, false);
  elsif old.status = 'active' and new.status = 'completed' then
    perform notify_parents(new.family_id, who || ' clocked out', 'The shift report is ready.', '/parent/shift/' || new.id, false);
  end if;
  return new;
end $$;
create trigger shifts_push after update of status on public.shifts
  for each row when (old.status is distinct from new.status) execute function public.push_on_shift();

-- Each log entry (P9: "Ava ate all of her snack · Apple slices, crackers"). Same wording as describeLog() in the app.
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
      detail := concat_ws(' · ', nullif(d->>'diaper', ''), nullif(d->>'note', ''));
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
create trigger logs_push after insert on public.logs for each row execute function public.push_on_log();

-- Same access rules as migration 03: signed-in users call the RPCs; only the server sends.
grant select on public.push_tokens to authenticated;
grant all on public.push_tokens to service_role;
revoke execute on function public.notify_parents(uuid, text, text, text, boolean) from public, anon, authenticated;
revoke execute on function public.push_on_shift() from public, anon, authenticated;
revoke execute on function public.push_on_log() from public, anon, authenticated;
revoke execute on function public.first_name_of(uuid), public.kid_names(uuid[]) from public, anon, authenticated;
grant execute on function public.register_push_token(text, text), public.remove_push_token(text) to authenticated;
revoke execute on function public.register_push_token(text, text), public.remove_push_token(text) from anon, public;
