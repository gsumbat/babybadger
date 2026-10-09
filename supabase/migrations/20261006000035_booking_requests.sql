-- Booking sends a request the sitter accepts (wireframes P6d Book a shift with "Send request", P6e Repeat, P6g the
-- sitter is unavailable; sitter side S33 Shift request and S33s a repeating request). Needs migrations 25 and 34.
--   * The booking drawer no longer writes a shift. It asks the one sitter the parent picked through the same
--     shift_requests as Ask your pool (migration 25), with kind = 'booking' (a pool request is kind 'pool').
--     First to accept is always on, so her yes books the shift at once; the request expires when the shift starts.
--   * Repeat (P6e): one request per date, all sharing series_id (null = a single date). The sitter answers the whole
--     series at once on S33s: the dates she ticks are booked, the rest declined. A date that can't be booked (another
--     shift, a must-have she's missing, house rules) is reported for that date and the others still go through.
--   * tasks: the shift's task lines, worked out by the app for each date from the kids' care plan ("4:30 Snack · Ava").
--     They become the shift's shift_tasks when it's booked (due time empty, as booking by hand did).
--   * create_booking_request(sitter, windows, kids, place, note): a full-access parent of the sitter's family sends
--     1 – 60 dates; ONE push to the sitter ("Jen asks you to sit 12 times" · "Mon, Wed, Fri · Oct 12 – Nov 13 ·
--     3:00 – 7:00 PM"). answer_booking_series(series, accept, clear time off): the sitter's answer; ONE push to the
--     parents ("Maya accepted 10 of 12 shifts").
--   * A single booking request keeps using accept / offer / decline_shift_request, and the parent cancel_shift_request.
--   * Expiry: a repeating request pushes the parents once, when its first date passes unanswered (not once per date).
-- Read through the same policies as migration 25 (sitters only their own requests). Re-runnable.

-- ---------------------------------------------------------------- columns
alter table public.shift_requests
  add column if not exists series_id uuid,
  add column if not exists tasks     text[] not null default '{}',
  add column if not exists kind      text not null default 'pool';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'shift_requests_kind_check') then
    alter table public.shift_requests add constraint shift_requests_kind_check check (kind in ('pool', 'booking'));
  end if;
end $$;
create index if not exists shift_requests_series on public.shift_requests (series_id, starts_at) where series_id is not null;

-- Read only from the app, like the rest of the table (migration 25 grants select on the whole table; named here too).
grant select (series_id, tasks, kind) on public.shift_requests to authenticated;

-- ---------------------------------------------------------------- booking (internal)
-- The shift for one sitter, without pushes: the shift (scheduled, the request's kids she's invited for, its home),
-- its tasks from the request, the request filled, everyone else asked told it's filled (their status). Callers
-- check who may do it and send the pushes.
create or replace function public.book_request_shift(p_request uuid, p_sitter uuid, p_starts timestamptz, p_ends timestamptz)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  r shift_requests;
  sid uuid;
  allowed uuid[];
begin
  select * into r from shift_requests where id = p_request;
  select kid_ids into allowed from family_sitters where family_id = r.family_id and sitter_id = p_sitter;
  insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by, place_id)
    values (r.family_id, p_sitter, p_starts, p_ends, r.created_by, r.place_id)
    returning id into sid;
  insert into shift_kids (shift_id, kid_id)
    select sid, k.id from kids k
    where k.family_id = r.family_id and k.id = any (r.kid_ids) and (allowed is null or k.id = any (allowed))
    on conflict do nothing;
  insert into shift_tasks (shift_id, title, position)
    select sid, t.title, (t.n - 1)::int from unnest(coalesce(r.tasks, '{}')) with ordinality as t(title, n)
    where btrim(t.title) <> '';
  update shift_requests set status = 'filled', shift_id = sid, filled_by = p_sitter, updated_at = now() where id = p_request;
  update shift_request_sitters set status = 'accepted', answered_at = coalesce(answered_at, now())
    where request_id = p_request and sitter_id = p_sitter;
  update shift_request_sitters set status = 'filled'
    where request_id = p_request and sitter_id <> p_sitter and status in ('sent', 'seen', 'accepted', 'offered');
  return sid;
end $$;

-- Same as migration 25 (books one sitter, pushes the others and the parents), now through book_request_shift, so
-- the request's tasks reach the shift on every path (accept, the parent's pick, an offer).
create or replace function public.book_shift_request_for(p_request uuid, p_sitter uuid, p_starts timestamptz, p_ends timestamptz)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  r shift_requests;
  sid uuid;
  others uuid[];
begin
  select * into r from shift_requests where id = p_request;
  others := array(select sitter_id from shift_request_sitters
                  where request_id = p_request and sitter_id <> p_sitter and status in ('sent', 'seen', 'accepted', 'offered'));
  sid := book_request_shift(p_request, p_sitter, p_starts, p_ends);
  perform notify_users(others, 'This shift was filled', family_name_of(r.family_id) || ' · ' || request_when(r.starts_at, r.ends_at),
    '/sitter/request/' || p_request);
  perform notify_users(other_parents(r.family_id), first_name_of(p_sitter) || ' took the shift', request_when(p_starts, p_ends),
    '/parent/request/' || p_request);
  return sid;
end $$;

-- Gives up her own time off on these days (S20 / S33s "Your time off"): a longer time off is shortened or split
-- around them. Same rule as accept_shift_request (migration 25).
create or replace function public.clear_time_off_days(p_sitter uuid, p_from date, p_to date) returns void
language plpgsql security definer set search_path = public as $$
declare t sitter_time_off;
begin
  for t in select * from sitter_time_off where sitter_id = p_sitter and starts <= p_to and ends >= p_from loop
    if t.starts >= p_from and t.ends <= p_to then
      delete from sitter_time_off where id = t.id;
    elsif t.starts < p_from and t.ends > p_to then
      update sitter_time_off set ends = p_from - 1 where id = t.id;
      insert into sitter_time_off (sitter_id, starts, ends, note) values (t.sitter_id, p_to + 1, t.ends, t.note);
    elsif t.starts < p_from then
      update sitter_time_off set ends = p_from - 1 where id = t.id;
    else
      update sitter_time_off set starts = p_to + 1 where id = t.id;
    end if;
  end loop;
end $$;

-- "Mon, Wed, Fri · Oct 12 – Nov 13 · 3:00 – 7:00 PM" for a series push (Tampa time, like request_when).
create or replace function public.series_when(p_series uuid) returns text
language plpgsql stable security definer set search_path = public as $$
declare days text; first shift_requests; last_start timestamptz;
begin
  select string_agg(d, ', ' order by n) into days from (
    select distinct extract(isodow from starts_at at time zone 'America/New_York')::int as n,
           to_char(starts_at at time zone 'America/New_York', 'Dy') as d
    from shift_requests where series_id = p_series) x;
  select * into first from shift_requests where series_id = p_series order by starts_at limit 1;
  select max(starts_at) into last_start from shift_requests where series_id = p_series;
  return days || ' · ' || to_char(first.starts_at at time zone 'America/New_York', 'Mon FMDD') || ' – '
    || to_char(last_start at time zone 'America/New_York', 'Mon FMDD') || ' · ' || split_part(request_when(first.starts_at, first.ends_at), ' · ', 2);
end $$;

-- Migration 25's expiry, except a repeating request pushes once: when its first date passes unanswered.
create or replace function public.expire_shift_requests() returns int
language plpgsql security definer set search_path = public as $$
declare r record; n int := 0; told uuid[] := '{}';
begin
  for r in update shift_requests set status = 'expired', updated_at = now()
           where status = 'open' and expires_at <= now()
           returning id, family_id, starts_at, ends_at, series_id loop
    n := n + 1;
    if r.series_id is null then
      perform notify_users(array(select user_id from family_parents where family_id = r.family_id),
        'Your shift request expired', request_when(r.starts_at, r.ends_at) || ' · no one accepted in time',
        '/parent/request/' || r.id);
    elsif not r.series_id = any (told)
          and not exists (select 1 from shift_requests where series_id = r.series_id and status = 'expired' and updated_at < now()) then
      told := told || r.series_id;
      perform notify_users(array(select user_id from family_parents where family_id = r.family_id),
        'A date in your request passed', request_when(r.starts_at, r.ends_at) || ' · no answer in time',
        '/parent/request/' || r.id);
    end if;
  end loop;
  return n;
end $$;

-- ---------------------------------------------------------------- parent RPC
-- P6d / P6e "Send request". p_windows: [{starts, ends, tasks: [text]}] (1 – 60). p_kid_ids empty = every kid.
-- p_place null = the main home. Returns {series_id, request_ids} (series_id null for one date).
create or replace function public.create_booking_request(p_sitter uuid, p_windows jsonb, p_kid_ids uuid[], p_place uuid, p_note text default '')
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  fam uuid;
  kids uuid[];
  n int;
  w record;
  s timestamptz[] := '{}';
  e timestamptz[] := '{}';
  t jsonb[] := '{}';
  ser uuid;
  rid uuid;
  ids uuid[] := '{}';
  who text;
  i int;
  j int;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  select fs.family_id into fam from family_sitters fs
    where fs.sitter_id = p_sitter and fs.status = 'active' and is_parent_of(fs.family_id) limit 1;
  if fam is null then raise exception 'you can only ask your family''s signed sitters' using errcode = '42501'; end if;
  if p_windows is null or jsonb_typeof(p_windows) <> 'array' then raise exception 'pick a day and time'; end if;
  n := jsonb_array_length(p_windows);
  if n < 1 then raise exception 'pick a day and time'; end if;
  if n > 60 then raise exception 'ask for at most 60 dates at once'; end if;
  for w in select x from jsonb_array_elements(p_windows) x loop
    begin
      s := s || (w.x->>'starts')::timestamptz;
      e := e || (w.x->>'ends')::timestamptz;
    exception when others then raise exception 'pick a day and time';
    end;
    t := t || coalesce(case when jsonb_typeof(w.x->'tasks') = 'array' then w.x->'tasks' end, '[]'::jsonb);
  end loop;
  for i in 1 .. n loop
    if s[i] is null or e[i] is null or e[i] <= s[i] then raise exception 'pick an end time after the start'; end if;
    if s[i] <= now() then raise exception 'pick a time that hasn''t started yet'; end if;
    if e[i] - s[i] > interval '24 hours' then raise exception 'a shift can be at most 24 hours'; end if;
    if s[i] > now() + interval '7 months' then raise exception 'pick dates within the next 6 months'; end if;
    for j in i + 1 .. n loop
      if s[i] < e[j] and s[j] < e[i] then raise exception 'two of these dates overlap'; end if;
    end loop;
  end loop;
  if exists (select 1 from unnest(coalesce(p_kid_ids, '{}')) x where not exists (select 1 from kids where id = x and family_id = fam)) then
    raise exception 'kid not in this family';
  end if;
  if p_place is not null and not exists (select 1 from places where id = p_place and family_id = fam and kind = 'home') then
    raise exception 'pick one of this family''s homes';
  end if;
  kids := case when coalesce(cardinality(p_kid_ids), 0) = 0 then array(select id from kids where family_id = fam) else p_kid_ids end;
  ser := case when n > 1 then gen_random_uuid() end;
  for i in 1 .. n loop
    insert into shift_requests (family_id, created_by, starts_at, ends_at, kid_ids, place_id, note, first_to_accept, expires_at, series_id, tasks, kind)
      values (fam, auth.uid(), s[i], e[i], kids, p_place, coalesce(left(trim(p_note), 500), ''), true, s[i], ser,
              array(select left(btrim(x), 200) from jsonb_array_elements_text(t[i]) with ordinality as y(x, k)
                    where btrim(x) <> '' and k <= 60 order by k),
              'booking')
      returning id into rid;
    insert into shift_request_sitters (request_id, sitter_id) values (rid, p_sitter);
    ids := ids || rid;
  end loop;
  who := first_name_of(auth.uid());
  if ser is null then
    perform notify_users(array[p_sitter], who || ' asks you to sit', request_when(s[1], e[1]), '/sitter/request/' || ids[1]);
  else
    perform notify_users(array[p_sitter], who || ' asks you to sit ' || n || ' times', series_when(ser),
      '/sitter/request/' || (select id from shift_requests where series_id = ser order by starts_at limit 1));
  end if;
  return jsonb_build_object('series_id', ser, 'request_ids', to_jsonb(ids));
end $$;

-- ---------------------------------------------------------------- sitter RPC
-- S33s "Accept 10 shifts" / "Decline all". Every open date of the series sent to her is answered: the ones in
-- p_accept are booked (house rules, no double booking, Block booking and the timing guard still apply), the rest
-- declined. p_clear_time_off: give up her time off on the accepted dates (Tampa days). A date that can't be booked
-- keeps its request open and reports why. Returns [{request_id, result, message?}], result one of booked, declined,
-- busy (another shift then), missing_requirement, failed, or the request's status when it was already closed
-- (filled / cancelled / expired) or answered. One push to the parents.
create or replace function public.answer_booking_series(p_series uuid, p_accept uuid[], p_clear_time_off boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  r shift_requests;
  a shift_request_sitters;
  fam uuid;
  results jsonb := '[]';
  res text;
  msg text;
  booked int := 0;
  answered int := 0;
  first_id uuid;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  perform expire_shift_requests();
  select q.family_id into fam from shift_requests q join shift_request_sitters x on x.request_id = q.id and x.sitter_id = auth.uid()
    where q.series_id = p_series limit 1;
  if p_series is null or fam is null then raise exception 'this request wasn''t sent to you'; end if;
  if not is_sitter_of_family(fam, auth.uid()) then raise exception 'you''re no longer one of this family''s sitters'; end if;
  if not house_rules_agreed(fam, auth.uid()) then raise exception 'agree to the family''s house rules first'; end if;
  for r in select q.* from shift_requests q join shift_request_sitters x on x.request_id = q.id and x.sitter_id = auth.uid()
           where q.series_id = p_series order by q.starts_at for update of q loop
    first_id := coalesce(first_id, r.id);
    select * into a from shift_request_sitters where request_id = r.id and sitter_id = auth.uid() for update;
    msg := null;
    if r.status <> 'open' then
      res := r.status;
    elsif a.status in ('declined', 'passed', 'filled') then
      res := a.status;
    elsif r.id = any (coalesce(p_accept, '{}')) then
      answered := answered + 1;
      begin
        if p_clear_time_off then
          perform clear_time_off_days(auth.uid(), (r.starts_at at time zone 'America/New_York')::date,
            ((r.ends_at - interval '1 second') at time zone 'America/New_York')::date);
        end if;
        perform book_request_shift(r.id, auth.uid(), r.starts_at, r.ends_at);
        res := 'booked';
        booked := booked + 1;
      exception when others then
        msg := sqlerrm;
        res := case when sqlerrm like 'already booked then%' then 'busy' when sqlerrm like '%must-have%' then 'missing_requirement' else 'failed' end;
      end;
    else
      answered := answered + 1;
      update shift_request_sitters set status = 'declined', answered_at = now(), offer_starts_at = null, offer_ends_at = null
        where request_id = r.id and sitter_id = auth.uid();
      res := 'declined';
    end if;
    results := results || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object('request_id', r.id, 'result', res, 'message', msg)));
  end loop;
  if answered > 0 then
    perform notify_users(other_parents(fam),
      case when booked = 0 then first_name_of(auth.uid()) || ' can''t take these shifts'
           else first_name_of(auth.uid()) || ' accepted ' || booked || ' of ' || answered || ' shifts' end,
      series_when(p_series), '/parent/request/' || first_id);
  end if;
  return results;
end $$;

-- ---------------------------------------------------------------- grants
revoke execute on function public.book_request_shift(uuid, uuid, timestamptz, timestamptz), public.book_shift_request_for(uuid, uuid, timestamptz, timestamptz),
  public.clear_time_off_days(uuid, date, date), public.series_when(uuid) from public, anon, authenticated;
revoke execute on function public.expire_shift_requests(), public.create_booking_request(uuid, jsonb, uuid[], uuid, text),
  public.answer_booking_series(uuid, uuid[], boolean) from public, anon;
grant execute on function public.expire_shift_requests(), public.create_booking_request(uuid, jsonb, uuid[], uuid, text),
  public.answer_booking_series(uuid, uuid[], boolean) to authenticated, service_role;
