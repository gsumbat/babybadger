-- Trips and the clock-in zone (wireframes S8 Start a trip, P8 Trip in progress, C2 Arrival alert, S22 Clock-in
-- blocked, S21 distance card, P9 trip rows). Design note nC: "a trip goes to a saved place. Leaving the start zone
-- and entering the destination zone each push an alert to parents. Movement outside saved places with no trip
-- started raises an off-plan alert." Needs migration 16 (places, shifts.place_id).
--
--   * trips: the sitter starts one on her active shift (S8): to a saved place, or "Somewhere else" (custom_dest),
--     which waits for a parent (status 'pending' until approved / declined). One open trip per shift.
--   * Every GPS point (public.locations) runs the geofence below: the zones are the family's places (homes and
--     places with a lat / lng; radius_ft; distance by haversine, in feet). Points less accurate than 100 m are
--     skipped so a bad fix doesn't fire alerts. No places with coordinates → nothing happens at all.
--       - open trip, first point outside the zone she started in → trips.left_start_at + alert 'trip_left'
--         (C2 "Maya left home with Ava" / "Heading to Riverside soccer fields by car").
--       - open trip, first point inside the destination → trips.arrived_at, status 'arrived' + alert 'trip_arrived'
--         (C2 "Maya and Ava arrived at Riverside soccer fields" / "Trip by car took 17 min. Tap to see the map.").
--       - no open trip and the point is outside every zone → alert 'off_plan' (P9 "Off-plan location"), at most one
--         every 30 minutes per shift.
--   * public.alerts: the parents' Alerts feed rows for these events (P9). Migration 15 keeps incidents as urgent
--     logs; trip / zone events aren't logs (they'd show in the timeline and report), so they get this table.
--     Each insert pushes both parents through notify_parents (same pattern as migration 15's push_on_log).
--     Parents read them and may only dismiss them ("This is expected, dismiss"). Only the database writes them.
--   * clockin_requests: S22 "Starting somewhere else? Like school pickup. A parent approves it." The sitter asks
--     (alert 'clockin_away'); a parent approves or declines; the sitter's phone gets the answer. With an approved
--     request the app lets her clock in outside the home zone, and off-plan alerts wait until she first reaches
--     one of the family's places.
-- Clock-in itself stays as it is (clock_in(p_shift)): the zone check runs in the app before it, and is skipped
-- when the phone can't give a location (web, permission off) or the family has no home with an address.

-- ---------------------------------------------------------------- distance + zones
-- Great-circle distance in feet (earth radius 6,371,008.8 m).
create or replace function public.geo_dist_ft(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
returns double precision language sql immutable parallel safe set search_path = public as $$
  select 2 * 20902259.8 * asin(least(1, sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) + cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2))));
$$;

-- The family's zone a point is in (the nearest one when zones overlap), or null.
create or replace function public.zone_at(p_family uuid, p_lat double precision, p_lng double precision) returns public.places
language sql stable security definer set search_path = public as $$
  select p.* from places p
  where p.family_id = p_family and p.lat is not null and p.lng is not null
    and geo_dist_ft(p.lat, p.lng, p_lat, p_lng) <= p.radius_ft
  order by geo_dist_ft(p.lat, p.lng, p_lat, p_lng)
  limit 1;
$$;

-- ---------------------------------------------------------------- tables
create table if not exists public.trips (
  id              uuid primary key default gen_random_uuid(),
  shift_id        uuid not null references public.shifts (id) on delete cascade,
  family_id       uuid not null references public.families (id) on delete cascade,
  sitter_id       uuid not null references auth.users (id),
  place_id        uuid references public.places (id) on delete set null,
  custom_dest     text check (custom_dest is null or char_length(custom_dest) between 1 and 120),
  -- the zone she was in when she tapped Start trip (null = none: the trip counts as left at once)
  start_place_id  uuid references public.places (id) on delete set null,
  needs_approval  boolean not null default false,
  approved_at     timestamptz,
  kid_ids         uuid[] not null default '{}',
  mode            text not null default 'car' check (mode in ('walk', 'car', 'transit')),
  started_at      timestamptz not null default now(),
  left_start_at   timestamptz,
  arrived_at      timestamptz,
  ended_at        timestamptz,
  status          text not null default 'active' check (status in ('pending', 'active', 'arrived', 'ended', 'declined'))
);
create index if not exists trips_shift on public.trips (shift_id, started_at desc);

create table if not exists public.clockin_requests (
  id           uuid primary key default gen_random_uuid(),
  shift_id     uuid not null references public.shifts (id) on delete cascade,
  family_id    uuid not null references public.families (id) on delete cascade,
  sitter_id    uuid not null references auth.users (id),
  note         text not null default '' check (char_length(note) <= 200),
  status       text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  answered_by  uuid references auth.users (id),
  answered_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists clockin_requests_shift on public.clockin_requests (shift_id, created_at desc);

create table if not exists public.alerts (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references public.families (id) on delete cascade,
  shift_id      uuid not null references public.shifts (id) on delete cascade,
  trip_id       uuid references public.trips (id) on delete cascade,
  kind          text not null,
  title         text not null,
  body          text not null default '',
  url           text not null default '/parent/alerts',
  data          jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  dismissed_at  timestamptz
);
alter table public.alerts drop constraint if exists alerts_kind_check;
alter table public.alerts add constraint alerts_kind_check
  check (kind in ('trip_left', 'trip_arrived', 'trip_request', 'off_plan', 'clockin_away'));
create index if not exists alerts_shift_time on public.alerts (shift_id, created_at desc);

-- Where the geofence was on each shift (internal; no policies, no grants).
create table if not exists public.shift_geo_state (
  shift_id     uuid primary key references public.shifts (id) on delete cascade,
  zone_id      uuid,            -- the last zone she was in
  seen_zone    boolean not null default false,
  off_plan_at  timestamptz
);

-- ---------------------------------------------------------------- push on every alert (migration 15's pattern)
create or replace function public.push_on_alert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform notify_parents(new.family_id, new.title, new.body, new.url, false);
  return new;
end $$;
drop trigger if exists alerts_push on public.alerts;
create trigger alerts_push after insert on public.alerts for each row execute function public.push_on_alert();

-- ---------------------------------------------------------------- words
create or replace function public.trip_mode_phrase(m text) returns text
language sql immutable set search_path = public as $$
  select case m when 'walk' then 'on foot' when 'transit' then 'by transit' else 'by car' end;
$$;

create or replace function public.trip_dest(t public.trips) returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select name from places where id = t.place_id), nullif(t.custom_dest, ''), 'a saved place');
$$;

-- ---------------------------------------------------------------- trips: start
-- Fills in what the app doesn't decide: family, start zone, whether a parent must approve, the timestamps.
create or replace function public.trips_prepare() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  s shifts;
  pt locations;
  z places;
begin
  select * into s from shifts where id = new.shift_id;
  -- before the RLS check runs: only the shift's own sitter gets this far (no hints for anyone else)
  if not found or s.sitter_id is distinct from auth.uid() then
    raise exception 'not your shift' using errcode = '42501';
  end if;
  new.family_id := s.family_id;
  new.sitter_id := s.sitter_id;
  if new.place_id is not null then
    if not exists (select 1 from places where id = new.place_id and family_id = s.family_id) then
      raise exception 'pick one of the family''s places';
    end if;
    new.custom_dest := null;
  elsif coalesce(trim(new.custom_dest), '') = '' then
    raise exception 'pick where you''re going';
  else
    new.custom_dest := trim(new.custom_dest);
  end if;
  if exists (select 1 from unnest(new.kid_ids) k where not exists (select 1 from kids where id = k and family_id = s.family_id)) then
    raise exception 'that kid isn''t in this family';
  end if;
  if exists (select 1 from trips where shift_id = new.shift_id and status in ('pending', 'active')) then
    raise exception 'end your current trip first';
  end if;
  new.needs_approval := new.place_id is null;
  new.status := case when new.needs_approval then 'pending' else 'active' end;
  new.approved_at := null; new.arrived_at := null; new.ended_at := null;
  new.started_at := now();
  -- start zone: where her latest point is; without a recent point, the shift's home
  select * into pt from locations where shift_id = new.shift_id and recorded_at > now() - interval '15 minutes'
    order by recorded_at desc limit 1;
  if found then
    z := zone_at(s.family_id, pt.lat, pt.lng);
    new.start_place_id := z.id;
  else
    new.start_place_id := coalesce(s.place_id, (select id from places where family_id = s.family_id and is_main limit 1));
  end if;
  new.left_start_at := case when new.start_place_id is null then now() end;
  return new;
end $$;
drop trigger if exists trips_prepare on public.trips;
create trigger trips_prepare before insert on public.trips for each row execute function public.trips_prepare();

create or replace function public.trip_left_alert(t public.trips) returns void
language plpgsql security definer set search_path = public as $$
declare
  who text := first_name_of(t.sitter_id);
  kids text := kid_names(t.kid_ids);
  dest text := trip_dest(t);
  st places;
  from_txt text;
begin
  select * into st from places where id = t.start_place_id;
  from_txt := case when st.id is null then '' when st.kind = 'home' then ' home' else ' ' || st.name end;
  insert into alerts (family_id, shift_id, trip_id, kind, title, body, url, data)
  values (t.family_id, t.shift_id, t.id, 'trip_left',
    case when st.id is null then who || ' started a trip' else who || ' left' || from_txt end || coalesce(' with ' || nullif(kids, ''), ''),
    'Heading to ' || dest || ' ' || trip_mode_phrase(t.mode),
    '/parent/trip/' || t.id,
    jsonb_build_object('dest', dest, 'mode', t.mode, 'kids', kids, 'from', coalesce(st.name, '')));
end $$;

-- After a trip starts: "Somewhere else" asks the parents; a trip that starts outside every zone has already left.
create or replace function public.trips_started() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  who text := first_name_of(new.sitter_id);
  kids text := kid_names(new.kid_ids);
  dest text := trip_dest(new);
begin
  if new.status = 'pending' then
    insert into alerts (family_id, shift_id, trip_id, kind, title, body, url, data)
    values (new.family_id, new.shift_id, new.id, 'trip_request',
      who || ' asks to go to ' || dest,
      concat_ws(' · ', nullif(kids, ''), trip_mode_phrase(new.mode)) || '. Tap to answer.',
      '/parent/trip/' || new.id,
      jsonb_build_object('dest', dest, 'mode', new.mode, 'kids', kids));
  end if;
  if new.left_start_at is not null then perform trip_left_alert(new); end if;
  return new;
end $$;
drop trigger if exists trips_started on public.trips;
create trigger trips_started after insert on public.trips for each row execute function public.trips_started();

-- ---------------------------------------------------------------- trips: changes from the app
-- Not security definer on purpose (like migration 14's guard): current_user is 'authenticated' for Data API writes
-- and the owner inside the geofence. From the app only the status moves, and only these ways:
--   parent: pending → active (approve) or declined;   sitter: pending / active / arrived → ended.
create or replace function public.trips_guard() returns trigger
language plpgsql set search_path = public as $$
declare r public.trips := old;
begin
  if current_user <> 'authenticated' then return new; end if;
  if new.status is not distinct from old.status then return old; end if;
  r.status := new.status;
  if old.status = 'pending' and new.status in ('active', 'declined') and public.is_parent_of(old.family_id) then
    if new.status = 'active' then r.approved_at := now(); else r.ended_at := now(); end if;
  elsif old.status in ('pending', 'active', 'arrived') and new.status = 'ended' and old.sitter_id = auth.uid() then
    r.ended_at := now();
  else
    raise exception 'can''t change this trip' using errcode = '42501';
  end if;
  return r;
end $$;
drop trigger if exists trips_guard on public.trips;
create trigger trips_guard before update on public.trips for each row execute function public.trips_guard();

-- A parent's answer reaches the sitter's phone.
create or replace function public.trips_answered() returns trigger
language plpgsql security definer set search_path = public as $$
declare who text := first_name_of(auth.uid());
begin
  if old.status = 'pending' and new.status = 'active' then
    perform notify_users(array[new.sitter_id], who || ' said yes', 'Go ahead to ' || trip_dest(new) || '.', '/sitter/shift/' || new.shift_id);
  elsif old.status = 'pending' and new.status = 'declined' then
    perform notify_users(array[new.sitter_id], who || ' said no', 'Stay put. Message ' || who || ' if you need to.', '/sitter/shift/' || new.shift_id);
  end if;
  return new;
end $$;
drop trigger if exists trips_answered on public.trips;
create trigger trips_answered after update of status on public.trips
  for each row when (old.status is distinct from new.status) execute function public.trips_answered();

-- Clock-out ends any open trip.
create or replace function public.trips_end_with_shift() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update trips set status = 'ended', ended_at = now() where shift_id = new.id and status in ('pending', 'active');
  return new;
end $$;
drop trigger if exists shifts_end_trips on public.shifts;
create trigger shifts_end_trips after update of status on public.shifts
  for each row when (old.status = 'active' and new.status is distinct from 'active') execute function public.trips_end_with_shift();

-- ---------------------------------------------------------------- the geofence (each GPS point)
create or replace function public.geofence_on_location() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  fam uuid;
  z places;
  t trips;
  g shift_geo_state;
  last_zone places;
  prev locations;
  who text;
  kids text;
  dest text;
  away_ft double precision;
  mins int;
begin
  if new.accuracy_m is not null and new.accuracy_m > 100 then return new; end if;
  fam := shift_family(new.shift_id);
  if not exists (select 1 from places where family_id = fam and lat is not null and lng is not null) then return new; end if;

  z := zone_at(fam, new.lat, new.lng);
  insert into shift_geo_state (shift_id) values (new.shift_id) on conflict (shift_id) do nothing;
  select * into g from shift_geo_state where shift_id = new.shift_id for update;
  select * into t from trips where shift_id = new.shift_id and status in ('pending', 'active')
    order by started_at desc limit 1;

  if t.id is not null then
    if t.left_start_at is null and z.id is distinct from t.start_place_id then
      update trips set left_start_at = new.recorded_at where id = t.id returning * into t;
      perform trip_left_alert(t);
    end if;
    if t.place_id is not null and t.arrived_at is null and z.id = t.place_id then
      update trips set arrived_at = new.recorded_at, status = 'arrived', left_start_at = coalesce(left_start_at, new.recorded_at)
        where id = t.id returning * into t;
      who := first_name_of(t.sitter_id);
      kids := kid_names(t.kid_ids);
      dest := trip_dest(t);
      mins := greatest(1, round(extract(epoch from (t.arrived_at - coalesce(t.left_start_at, t.started_at))) / 60)::int);
      insert into alerts (family_id, shift_id, trip_id, kind, title, body, url, data)
      values (t.family_id, t.shift_id, t.id, 'trip_arrived',
        who || coalesce(' and ' || nullif(kids, ''), '') || ' arrived at ' || dest,
        'Trip ' || trip_mode_phrase(t.mode) || ' took ' || mins || ' min. Tap to see the map.',
        '/parent/trip/' || t.id,
        jsonb_build_object('dest', dest, 'mode', t.mode, 'kids', kids, 'minutes', mins));
    end if;
  elsif z.id is null
    and (g.off_plan_at is null or new.recorded_at >= g.off_plan_at + interval '30 minutes')
    -- an approved start somewhere else (S22): no off-plan alert until she first reaches a saved place
    and (g.seen_zone or not exists (select 1 from clockin_requests where shift_id = new.shift_id and status = 'approved')) then
    who := first_name_of((select sitter_id from shifts where id = new.shift_id));
    select * into last_zone from places where id = g.zone_id;
    select * into prev from locations where shift_id = new.shift_id and id <> new.id and recorded_at < new.recorded_at
      and recorded_at > new.recorded_at - interval '10 minutes' and (accuracy_m is null or accuracy_m <= 100)
      order by recorded_at desc limit 1;
    if last_zone.id is not null then
      away_ft := geo_dist_ft(last_zone.lat, last_zone.lng, new.lat, new.lng);
    end if;
    insert into alerts (family_id, shift_id, kind, title, body, url, data)
    values (fam, new.shift_id, 'off_plan', 'Off-plan location',
      case when last_zone.id is not null
        then who || ' left ' || case when last_zone.kind = 'home' then 'home' else last_zone.name end
             || ' without starting a trip. She is ' || to_char(greatest(0.1, away_ft / 5280), 'FM990.0') || ' mi away'
             || case when prev.id is not null and geo_dist_ft(prev.lat, prev.lng, new.lat, new.lng) > 150 then ', moving.' else '.' end
        else who || ' is away from your saved places without starting a trip.' end,
      '/parent/alerts',
      jsonb_build_object('lat', new.lat, 'lng', new.lng, 'zone', coalesce(last_zone.name, ''),
        'away_mi', case when away_ft is null then null else round((away_ft / 5280)::numeric, 1) end));
    update shift_geo_state set off_plan_at = new.recorded_at where shift_id = new.shift_id;
  end if;

  if z.id is not null then
    update shift_geo_state set zone_id = z.id, seen_zone = true where shift_id = new.shift_id;
  end if;
  return new;
end $$;
drop trigger if exists locations_geofence on public.locations;
create trigger locations_geofence after insert on public.locations for each row execute function public.geofence_on_location();

-- ---------------------------------------------------------------- S22: start somewhere else
create or replace function public.request_clockin_away(p_shift uuid, p_note text default '') returns public.clockin_requests
language plpgsql security definer set search_path = public as $$
declare
  s shifts;
  r clockin_requests;
  v_note text := left(trim(coalesce(p_note, '')), 200);
begin
  select * into s from shifts where id = p_shift and sitter_id = auth.uid();
  if not found then raise exception 'shift not found'; end if;
  if s.status <> 'scheduled' then raise exception 'shift is %', s.status; end if;
  select * into r from clockin_requests where shift_id = p_shift and status in ('pending', 'approved') order by created_at desc limit 1;
  if r.status = 'approved' then return r; end if;
  if r.id is not null then
    update clockin_requests set note = v_note, created_at = now() where id = r.id returning * into r;
  else
    insert into clockin_requests (shift_id, family_id, sitter_id, note) values (p_shift, s.family_id, s.sitter_id, v_note) returning * into r;
  end if;
  insert into alerts (family_id, shift_id, kind, title, body, url, data)
  values (s.family_id, s.id, 'clockin_away', first_name_of(s.sitter_id) || ' asks to clock in away from home',
    coalesce(nullif(v_note, ''), 'Starting somewhere else, like school pickup.') || ' Tap to answer.', '/parent/alerts',
    jsonb_build_object('request_id', r.id, 'note', v_note));
  return r;
end $$;

create or replace function public.answer_clockin_away(p_request uuid, p_ok boolean) returns public.clockin_requests
language plpgsql security definer set search_path = public as $$
declare
  r clockin_requests;
  who text := first_name_of(auth.uid());
begin
  select * into r from clockin_requests where id = p_request for update;
  if not found or not is_parent_of(r.family_id) then raise exception 'request not found'; end if;
  if r.status <> 'pending' then raise exception 'already answered'; end if;
  update clockin_requests set status = case when p_ok then 'approved' else 'declined' end, answered_by = auth.uid(), answered_at = now()
    where id = r.id returning * into r;
  perform notify_users(array[r.sitter_id], who || case when p_ok then ' said yes' else ' said no' end,
    case when p_ok then 'You can clock in where you are.' else 'Clock in when you get to the home.' end, '/sitter');
  return r;
end $$;

-- ---------------------------------------------------------------- row level security
alter table public.trips enable row level security;
alter table public.clockin_requests enable row level security;
alter table public.alerts enable row level security;
alter table public.shift_geo_state enable row level security;

drop policy if exists trips_sitter_read on public.trips;
drop policy if exists trips_sitter_insert on public.trips;
drop policy if exists trips_sitter_update on public.trips;
drop policy if exists trips_parent_read on public.trips;
drop policy if exists trips_parent_update on public.trips;
create policy trips_sitter_read on public.trips for select using (sitter_id = auth.uid());
create policy trips_sitter_insert on public.trips for insert
  with check (sitter_id = auth.uid() and public.is_my_active_shift(shift_id));
create policy trips_sitter_update on public.trips for update
  using (sitter_id = auth.uid() and public.is_my_active_shift(shift_id)) with check (sitter_id = auth.uid());
create policy trips_parent_read on public.trips for select using (public.is_parent_of(family_id));
create policy trips_parent_update on public.trips for update
  using (public.is_parent_of(family_id)) with check (public.is_parent_of(family_id));

drop policy if exists clockin_requests_read on public.clockin_requests;
create policy clockin_requests_read on public.clockin_requests for select
  using (sitter_id = auth.uid() or public.is_parent_of(family_id));

drop policy if exists alerts_parent_read on public.alerts;
drop policy if exists alerts_parent_dismiss on public.alerts;
create policy alerts_parent_read on public.alerts for select using (public.is_parent_of(family_id));
create policy alerts_parent_dismiss on public.alerts for update
  using (public.is_parent_of(family_id)) with check (public.is_parent_of(family_id));

-- ---------------------------------------------------------------- grants
grant select, insert, update on public.trips to authenticated;
revoke delete on public.trips from authenticated;
grant select on public.clockin_requests to authenticated;
revoke insert, update, delete on public.clockin_requests from authenticated;
grant select on public.alerts to authenticated;
revoke insert, update, delete on public.alerts from authenticated;
grant update (dismissed_at) on public.alerts to authenticated;
revoke all on public.shift_geo_state from authenticated;
revoke all on public.trips, public.clockin_requests, public.alerts, public.shift_geo_state from anon;
grant all on public.trips, public.clockin_requests, public.alerts, public.shift_geo_state to service_role;

revoke execute on function public.zone_at(uuid, double precision, double precision), public.trip_dest(public.trips),
  public.trip_left_alert(public.trips), public.trips_prepare(), public.trips_started(), public.trips_guard(),
  public.trips_answered(), public.trips_end_with_shift(), public.geofence_on_location(), public.push_on_alert()
  from public, anon, authenticated;
grant execute on function public.geo_dist_ft(double precision, double precision, double precision, double precision),
  public.trip_mode_phrase(text) to authenticated;
revoke execute on function public.request_clockin_away(uuid, text), public.answer_clockin_away(uuid, boolean) from public, anon;
grant execute on function public.request_clockin_away(uuid, text), public.answer_clockin_away(uuid, boolean) to authenticated;

-- realtime: the parent's trip view and Alerts, the sitter's S22 answer
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.trips; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.alerts; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.clockin_requests; exception when duplicate_object then null; end;
  end if;
end $$;
