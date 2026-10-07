-- Ask your pool (wireframes P45 Ask your pool, P46 Request out, P47 Booked; sitter side S33 Shift request,
-- S34 This shift was filled, S20 Shift request that overlaps her time off).
--   * shift_requests: one request a parent sends to several of the family's active sitters for one time window.
--     status open | filled | cancelled | expired. "First to accept gets it" (first_to_accept): the first sitter who
--     accepts is booked at once. Off: each acceptance only tells the parents, who pick one (book_shift_request).
--     expires_at = now + 2 / 12 / 24 hours (P45 "Request expires in"), never after the shift starts.
--     Expiry is lazy: an open request past expires_at counts as expired everywhere, and expire_shift_requests()
--     (called by the app when a request screen opens, and by accept / offer) marks it and pushes the parents.
--   * shift_request_sitters: who was asked and how she answered. sent -> seen (she opened it) -> accepted | offered
--     (S20: only the free part, offer_starts_at / offer_ends_at) | declined; filled (someone else got it);
--     passed (the parent said "Look elsewhere" to her offer).
-- Sitters read only their own row and the request they were sent (never who else was asked: P45 "Not who else was
-- asked"). Parents read their family's requests and every row. All writes go through the functions below.
-- Pushes (notify_users, migration 10): new request -> each sitter; accepted / booked -> parents; filled -> the other
-- sitters; offer -> parents; expired -> parents.
-- Shifts made here go through the same triggers as booking by hand: house rules (09), the timing guard (14), the
-- home check (16, shifts_place_check) and Block booking (20, requirement_mode 'block').

-- ---------------------------------------------------------------- tables
create table if not exists public.shift_requests (
  id               uuid primary key default gen_random_uuid(),
  family_id        uuid not null references public.families (id) on delete cascade,
  created_by       uuid not null references auth.users (id),
  starts_at        timestamptz not null,
  ends_at          timestamptz not null,
  kid_ids          uuid[] not null default '{}',
  place_id         uuid references public.places (id) on delete set null,
  note             text not null default '' check (char_length(note) <= 500),
  first_to_accept  boolean not null default true,
  expires_at       timestamptz not null,
  status           text not null default 'open' check (status in ('open', 'filled', 'cancelled', 'expired')),
  shift_id         uuid references public.shifts (id) on delete set null,
  filled_by        uuid references auth.users (id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists shift_requests_family on public.shift_requests (family_id, starts_at);

create table if not exists public.shift_request_sitters (
  request_id       uuid not null references public.shift_requests (id) on delete cascade,
  sitter_id        uuid not null references auth.users (id) on delete cascade,
  status           text not null default 'sent' check (status in ('sent', 'seen', 'accepted', 'offered', 'declined', 'passed', 'filled')),
  seen_at          timestamptz,
  answered_at      timestamptz,
  offer_starts_at  timestamptz,
  offer_ends_at    timestamptz,
  created_at       timestamptz not null default now(),
  primary key (request_id, sitter_id),
  check ((offer_starts_at is null) = (offer_ends_at is null)),
  check (offer_ends_at is null or offer_ends_at > offer_starts_at)
);
create index if not exists shift_request_sitters_sitter on public.shift_request_sitters (sitter_id, created_at desc);

-- ---------------------------------------------------------------- helpers (security definer: no RLS recursion)
create or replace function public.shift_request_family(rid uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select family_id from shift_requests where id = rid;
$$;

create or replace function public.was_asked_for(rid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from shift_request_sitters where request_id = rid and sitter_id = auth.uid());
$$;

-- "Sat, Oct 10 · 6:00 – 10:00 PM" for push texts (the app shows the phone's own time zone; pushes use Tampa's,
-- like the billing reminder in migration 24).
create or replace function public.request_when(s timestamptz, e timestamptz) returns text
language plpgsql stable set search_path = public as $$
declare
  a text := trim(to_char(s at time zone 'America/New_York', 'FMHH12:MI AM'));
  b text := trim(to_char(e at time zone 'America/New_York', 'FMHH12:MI AM'));
begin
  if right(a, 2) = right(b, 2) then a := left(a, length(a) - 3); end if;
  return to_char(s at time zone 'America/New_York', 'Dy, Mon FMDD') || ' · ' || a || ' – ' || b;
end $$;

create or replace function public.family_name_of(fid uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select name from families where id = fid), 'A family');
$$;

-- Parents of the family, except the signed-in user (she doesn't need a push about her own tap).
create or replace function public.other_parents(fid uuid) returns uuid[]
language sql stable security definer set search_path = public as $$
  select array(select user_id from family_parents where family_id = fid and user_id is distinct from auth.uid());
$$;

-- Marks every open request past its expiry as expired and pushes the parents once. Safe for anyone to call: it only
-- does what the clock already decided. Returns how many it closed.
create or replace function public.expire_shift_requests() returns int
language plpgsql security definer set search_path = public as $$
declare r record; n int := 0;
begin
  for r in update shift_requests set status = 'expired', updated_at = now()
           where status = 'open' and expires_at <= now()
           returning id, family_id, starts_at, ends_at loop
    n := n + 1;
    perform notify_users(array(select user_id from family_parents where family_id = r.family_id),
      'Your shift request expired', request_when(r.starts_at, r.ends_at) || ' · no one accepted in time',
      '/parent/request/' || r.id);
  end loop;
  return n;
end $$;

-- Books the request for one sitter: the shift (scheduled, her kids from the request, the request's home), the
-- request filled, everyone else asked told it's filled. Internal: callers check who may do it.
create or replace function public.book_shift_request_for(p_request uuid, p_sitter uuid, p_starts timestamptz, p_ends timestamptz)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  r shift_requests;
  sid uuid;
  allowed uuid[];
  others uuid[];
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
  update shift_requests set status = 'filled', shift_id = sid, filled_by = p_sitter, updated_at = now() where id = p_request;
  update shift_request_sitters set status = 'accepted', answered_at = coalesce(answered_at, now())
    where request_id = p_request and sitter_id = p_sitter;
  with o as (
    update shift_request_sitters set status = 'filled'
    where request_id = p_request and sitter_id <> p_sitter and status in ('sent', 'seen', 'accepted', 'offered')
    returning sitter_id
  ) select coalesce(array_agg(sitter_id), '{}') into others from o;
  perform notify_users(others, 'This shift was filled', family_name_of(r.family_id) || ' · ' || request_when(r.starts_at, r.ends_at),
    '/sitter/request/' || p_request);
  perform notify_users(other_parents(r.family_id), first_name_of(p_sitter) || ' took the shift', request_when(p_starts, p_ends),
    '/parent/request/' || p_request);
  return sid;
end $$;

-- ---------------------------------------------------------------- parent RPCs
-- P45 "Send to N sitters". p_kid_ids empty = every kid in the family. p_place null = the main home.
create or replace function public.create_shift_request(
  p_family uuid, p_starts timestamptz, p_ends timestamptz, p_sitters uuid[],
  p_kid_ids uuid[] default '{}', p_note text default '', p_first_to_accept boolean default true,
  p_expires_hours int default 12, p_place uuid default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare rid uuid; kids uuid[];
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  if not is_parent_of(p_family) then raise exception 'not a parent of this family' using errcode = '42501'; end if;
  if p_starts is null or p_ends is null or p_ends <= p_starts then raise exception 'pick an end time after the start'; end if;
  if p_starts <= now() then raise exception 'pick a time that hasn''t started yet'; end if;
  if p_ends - p_starts > interval '24 hours' then raise exception 'a shift can be at most 24 hours'; end if;
  if p_expires_hours not in (2, 12, 24) then raise exception 'pick when the request expires'; end if;
  if coalesce(cardinality(p_sitters), 0) = 0 then raise exception 'pick at least one sitter'; end if;
  if exists (select 1 from unnest(p_sitters) x where not is_sitter_of_family(p_family, x)) then
    raise exception 'you can only ask your family''s signed sitters';
  end if;
  if exists (select 1 from unnest(coalesce(p_kid_ids, '{}')) x where not exists (select 1 from kids where id = x and family_id = p_family)) then
    raise exception 'kid not in this family';
  end if;
  if p_place is not null and not exists (select 1 from places where id = p_place and family_id = p_family and kind = 'home') then
    raise exception 'pick one of this family''s homes';
  end if;
  kids := case when coalesce(cardinality(p_kid_ids), 0) = 0 then array(select id from kids where family_id = p_family) else p_kid_ids end;
  insert into shift_requests (family_id, created_by, starts_at, ends_at, kid_ids, place_id, note, first_to_accept, expires_at)
    values (p_family, auth.uid(), p_starts, p_ends, kids, p_place, coalesce(left(trim(p_note), 500), ''), coalesce(p_first_to_accept, true),
            least(now() + make_interval(hours => p_expires_hours), p_starts))
    returning id into rid;
  insert into shift_request_sitters (request_id, sitter_id) select distinct rid, x from unnest(p_sitters) x;
  perform notify_users(p_sitters, 'New shift request', family_name_of(p_family) || ' · ' || request_when(p_starts, p_ends),
    '/sitter/request/' || rid);
  return rid;
end $$;

-- P46 "Ask more sitters": adds sitters to an open request (the ones already asked are skipped). Returns how many.
create or replace function public.add_shift_request_sitters(p_request uuid, p_sitters uuid[]) returns int
language plpgsql security definer set search_path = public as $$
declare r shift_requests; added uuid[];
begin
  perform expire_shift_requests();
  select * into r from shift_requests where id = p_request for update;
  if not found or not is_parent_of(r.family_id) then raise exception 'request not found'; end if;
  if r.status <> 'open' then raise exception 'this request is closed'; end if;
  if exists (select 1 from unnest(p_sitters) x where not is_sitter_of_family(r.family_id, x)) then
    raise exception 'you can only ask your family''s signed sitters';
  end if;
  with ins as (
    insert into shift_request_sitters (request_id, sitter_id)
    select p_request, x from (select distinct unnest(p_sitters) as x) s
    on conflict do nothing
    returning sitter_id
  ) select coalesce(array_agg(sitter_id), '{}') into added from ins;
  perform notify_users(added, 'New shift request', family_name_of(r.family_id) || ' · ' || request_when(r.starts_at, r.ends_at),
    '/sitter/request/' || p_request);
  return cardinality(added);
end $$;

-- P46 "Cancel request". Sitters who already said yes (or offered part of it) are told.
create or replace function public.cancel_shift_request(p_request uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r shift_requests; told uuid[];
begin
  select * into r from shift_requests where id = p_request for update;
  if not found or not is_parent_of(r.family_id) then raise exception 'request not found'; end if;
  if r.status <> 'open' then return; end if;
  update shift_requests set status = 'cancelled', updated_at = now() where id = p_request;
  told := array(select sitter_id from shift_request_sitters where request_id = p_request and status in ('accepted', 'offered'));
  perform notify_users(told, 'Request cancelled', family_name_of(r.family_id) || ' · ' || request_when(r.starts_at, r.ends_at),
    '/sitter/request/' || p_request);
end $$;

-- Parent books one sitter who accepted ("First to accept" off) or offered part of the time (S20 -> P46 "Accept offer").
-- An offer books only the offered window.
create or replace function public.book_shift_request(p_request uuid, p_sitter uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare r shift_requests; a shift_request_sitters; sid uuid;
begin
  perform expire_shift_requests();
  select * into r from shift_requests where id = p_request for update;
  if not found or not is_parent_of(r.family_id) then raise exception 'request not found'; end if;
  if r.status <> 'open' then raise exception 'this request is closed'; end if;
  select * into a from shift_request_sitters where request_id = p_request and sitter_id = p_sitter for update;
  if not found or a.status not in ('accepted', 'offered') then raise exception 'she hasn''t said yes to this request'; end if;
  sid := book_shift_request_for(p_request, p_sitter, coalesce(a.offer_starts_at, r.starts_at), coalesce(a.offer_ends_at, r.ends_at));
  perform notify_users(array[p_sitter], 'You''re booked', family_name_of(r.family_id) || ' · ' ||
    request_when(coalesce(a.offer_starts_at, r.starts_at), coalesce(a.offer_ends_at, r.ends_at)), '/sitter/calendar');
  return sid;
end $$;

-- P46 "Look elsewhere" on a sitter's offer.
create or replace function public.pass_shift_request_offer(p_request uuid, p_sitter uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_parent_of(shift_request_family(p_request)) then raise exception 'request not found'; end if;
  update shift_request_sitters set status = 'passed' where request_id = p_request and sitter_id = p_sitter and status = 'offered';
end $$;

-- ---------------------------------------------------------------- sitter RPCs
-- S33 / S20 opened: "Sent" becomes "Seen 2 min ago" on P46.
create or replace function public.mark_shift_request_seen(p_request uuid) returns void
language sql security definer set search_path = public as $$
  update shift_request_sitters set status = 'seen', seen_at = now()
  where request_id = p_request and sitter_id = auth.uid() and status = 'sent';
$$;

-- S33 "Accept shift" / S20 "Accept all and cancel my time off". Returns {result, shift_id}:
--   booked (first to accept: the shift is hers), accepted (the parents pick), filled / cancelled / expired (too late).
-- p_clear_from / p_clear_to (S20): the days of her time off to give up for this shift (her own rows only; a longer
-- time off is shortened or split around them).
create or replace function public.accept_shift_request(p_request uuid, p_clear_from date default null, p_clear_to date default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r shift_requests; a shift_request_sitters; t sitter_time_off; sid uuid;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  perform expire_shift_requests();
  select * into r from shift_requests where id = p_request for update;
  select * into a from shift_request_sitters where request_id = p_request and sitter_id = auth.uid() for update;
  if r.id is null or a.request_id is null then raise exception 'this request wasn''t sent to you'; end if;
  if r.status <> 'open' then return jsonb_build_object('result', r.status); end if;
  if a.status in ('declined', 'passed', 'filled') then raise exception 'you already answered this request'; end if;
  if not is_sitter_of_family(r.family_id, auth.uid()) then raise exception 'you''re no longer one of this family''s sitters'; end if;
  if not house_rules_agreed(r.family_id, auth.uid()) then raise exception 'agree to the family''s house rules first'; end if;
  if p_clear_from is not null then
    if p_clear_to is null or p_clear_to < p_clear_from or p_clear_to - p_clear_from > 2 then raise exception 'pick the days to clear'; end if;
    for t in select * from sitter_time_off where sitter_id = auth.uid() and starts <= p_clear_to and ends >= p_clear_from loop
      if t.starts >= p_clear_from and t.ends <= p_clear_to then
        delete from sitter_time_off where id = t.id;
      elsif t.starts < p_clear_from and t.ends > p_clear_to then
        update sitter_time_off set ends = p_clear_from - 1 where id = t.id;
        insert into sitter_time_off (sitter_id, starts, ends, note) values (t.sitter_id, p_clear_to + 1, t.ends, t.note);
      elsif t.starts < p_clear_from then
        update sitter_time_off set ends = p_clear_from - 1 where id = t.id;
      else
        update sitter_time_off set starts = p_clear_to + 1 where id = t.id;
      end if;
    end loop;
  end if;
  if r.first_to_accept then
    begin
      sid := book_shift_request_for(p_request, auth.uid(), r.starts_at, r.ends_at);
    exception when others then
      if sqlerrm like '%must-have%' then raise exception 'you''re missing one of this family''s must-have requirements'; end if;
      raise;
    end;
    return jsonb_build_object('result', 'booked', 'shift_id', sid);
  end if;
  update shift_request_sitters set status = 'accepted', answered_at = now(), offer_starts_at = null, offer_ends_at = null
    where request_id = p_request and sitter_id = auth.uid();
  perform notify_users(other_parents(r.family_id), first_name_of(auth.uid()) || ' can take the shift',
    request_when(r.starts_at, r.ends_at) || ' · tap to book her', '/parent/request/' || p_request);
  return jsonb_build_object('result', 'accepted');
end $$;

-- S20 "Offer 6:00 – 7:00 PM only": a part of the window. Returns {result}: offered, or the request's status if closed.
create or replace function public.offer_shift_request(p_request uuid, p_starts timestamptz, p_ends timestamptz) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r shift_requests; a shift_request_sitters;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  perform expire_shift_requests();
  select * into r from shift_requests where id = p_request for update;
  select * into a from shift_request_sitters where request_id = p_request and sitter_id = auth.uid() for update;
  if r.id is null or a.request_id is null then raise exception 'this request wasn''t sent to you'; end if;
  if r.status <> 'open' then return jsonb_build_object('result', r.status); end if;
  if a.status in ('declined', 'passed', 'filled') then raise exception 'you already answered this request'; end if;
  if p_starts is null or p_ends is null or p_ends <= p_starts or p_starts < r.starts_at or p_ends > r.ends_at
     or (p_starts = r.starts_at and p_ends = r.ends_at) then
    raise exception 'offer a part of the requested time';
  end if;
  update shift_request_sitters set status = 'offered', answered_at = now(), offer_starts_at = p_starts, offer_ends_at = p_ends
    where request_id = p_request and sitter_id = auth.uid();
  perform notify_users(other_parents(r.family_id), first_name_of(auth.uid()) || ' offered part of the shift',
    request_when(p_starts, p_ends) || ' · tap to answer', '/parent/request/' || p_request);
  return jsonb_build_object('result', 'offered');
end $$;

-- S33 / S20 "Decline". Nothing to tell anyone.
create or replace function public.decline_shift_request(p_request uuid) returns void
language sql security definer set search_path = public as $$
  update shift_request_sitters set status = 'declined', answered_at = now(), offer_starts_at = null, offer_ends_at = null
  where request_id = p_request and sitter_id = auth.uid() and status in ('sent', 'seen', 'accepted', 'offered')
    and exists (select 1 from shift_requests where id = p_request and status = 'open');
$$;

-- ---------------------------------------------------------------- row level security
alter table public.shift_requests enable row level security;
alter table public.shift_request_sitters enable row level security;

drop policy if exists shift_requests_parent_read on public.shift_requests;
create policy shift_requests_parent_read on public.shift_requests for select using (public.is_parent_of(family_id));
drop policy if exists shift_requests_sitter_read on public.shift_requests;
create policy shift_requests_sitter_read on public.shift_requests for select using (public.was_asked_for(id));

drop policy if exists shift_request_sitters_parent_read on public.shift_request_sitters;
create policy shift_request_sitters_parent_read on public.shift_request_sitters for select
  using (public.is_parent_of(public.shift_request_family(request_id)));
drop policy if exists shift_request_sitters_self_read on public.shift_request_sitters;
create policy shift_request_sitters_self_read on public.shift_request_sitters for select using (sitter_id = auth.uid());

-- ---------------------------------------------------------------- grants
-- Read through RLS; every write goes through the functions above.
grant select on public.shift_requests, public.shift_request_sitters to authenticated;
grant all on public.shift_requests, public.shift_request_sitters to service_role;
revoke all on public.shift_requests, public.shift_request_sitters from anon;

revoke execute on function public.shift_request_family(uuid), public.was_asked_for(uuid) from public, anon;
grant execute on function public.shift_request_family(uuid), public.was_asked_for(uuid) to authenticated, service_role;
revoke execute on function public.request_when(timestamptz, timestamptz), public.family_name_of(uuid), public.other_parents(uuid),
  public.book_shift_request_for(uuid, uuid, timestamptz, timestamptz) from public, anon, authenticated;
revoke execute on function public.expire_shift_requests(),
  public.create_shift_request(uuid, timestamptz, timestamptz, uuid[], uuid[], text, boolean, int, uuid),
  public.add_shift_request_sitters(uuid, uuid[]), public.cancel_shift_request(uuid), public.book_shift_request(uuid, uuid),
  public.pass_shift_request_offer(uuid, uuid), public.mark_shift_request_seen(uuid), public.accept_shift_request(uuid, date, date),
  public.offer_shift_request(uuid, timestamptz, timestamptz), public.decline_shift_request(uuid) from public, anon;
grant execute on function public.expire_shift_requests(),
  public.create_shift_request(uuid, timestamptz, timestamptz, uuid[], uuid[], text, boolean, int, uuid),
  public.add_shift_request_sitters(uuid, uuid[]), public.cancel_shift_request(uuid), public.book_shift_request(uuid, uuid),
  public.pass_shift_request_offer(uuid, uuid), public.mark_shift_request_seen(uuid), public.accept_shift_request(uuid, date, date),
  public.offer_shift_request(uuid, timestamptz, timestamptz), public.decline_shift_request(uuid) to authenticated, service_role;

-- P46 and S33 update live (Realtime still applies the policies above).
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'shift_requests') then
      alter publication supabase_realtime add table public.shift_requests;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'shift_request_sitters') then
      alter publication supabase_realtime add table public.shift_request_sitters;
    end if;
  end if;
end $$;

-- Optional (needs pg_cron): close expired requests every 5 minutes even when nobody opens the app.
-- select cron.schedule('expire-shift-requests', '*/5 * * * *', 'select public.expire_shift_requests()');
