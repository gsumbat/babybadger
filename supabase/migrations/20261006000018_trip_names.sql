-- Natural lists of kids' names in pushes and alerts: "Ava", "Ava and Leo", "Ava, Leo and Sam" (was "Ava and Leo and Sam"),
-- and the trip arrival title "Maya, Ava and Leo arrived at …" (was "Maya and Ava and Leo arrived at …").
create or replace function public.kid_names(ids uuid[]) returns text
language sql stable security definer set search_path = public as $$
  with n as (select array_agg(name order by name) a from kids where id = any(ids))
  select case when a is null then ''
              when cardinality(a) = 1 then a[1]
              else array_to_string(a[1:cardinality(a) - 1], ', ') || ' and ' || a[cardinality(a)] end
  from n;
$$;

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
        case when kids = '' then who when kids like '% and %' then who || ', ' || kids else who || ' and ' || kids end || ' arrived at ' || dest,
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
revoke execute on function public.geofence_on_location() from public, anon, authenticated;
