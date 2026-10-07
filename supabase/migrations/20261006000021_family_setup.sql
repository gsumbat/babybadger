-- Family setup and add-a-child (wireframes P2 AddKids, P21 ChildSitters, P22 ChildAdded, P12 Settings, S26 NewChild).
-- Safe to run more than once.
--   * P12 › Alerts › "Arrivals and departures · Trips to saved places": profiles.alert_arrivals (on by default).
--     Trip-left and trip-arrived alerts (migration 17) skip the parents who turned it off. Off-plan, trip requests and
--     clock-in-away requests always send ("Off-plan and help alerts · Always").
--   * P21 "Who looks after Mia?": set_sitter_kid turns one kid on or off for one sitter (family_sitters.kid_ids,
--     migration 11: null = every kid, now and later). Parents can't update family_sitters directly (only to remove a
--     sitter), so this goes through a checked function.
--   * P21 "Tell Maya about Mia": tell_sitters_about_kid pushes S26 ("Meet Mia") to the chosen sitters who can see her.
--   * P21 "Add Mia to booked shifts" needs nothing new: parents already add shift_kids rows for their own shifts.

-- ---------------------------------------------------------------- P12 arrivals switch
alter table public.profiles add column if not exists alert_arrivals boolean not null default true;
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

-- Copy of migration 17's push_on_alert: trip_left / trip_arrived go only to parents with arrivals on.
create or replace function public.push_on_alert() returns trigger
language plpgsql security definer set search_path = public as $$
declare to_whom uuid[];
begin
  if new.kind in ('trip_left', 'trip_arrived') then
    select array_agg(fp.user_id) into to_whom
      from family_parents fp left join profiles pr on pr.id = fp.user_id
      where fp.family_id = new.family_id and coalesce(pr.alert_arrivals, true);
    if to_whom is not null then perform notify_users(to_whom, new.title, new.body, new.url); end if;
  else
    perform notify_parents(new.family_id, new.title, new.body, new.url, false);
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------- P21 sitter access per kid
create or replace function public.set_sitter_kid(p_kid uuid, p_sitter uuid, p_on boolean) returns void
language plpgsql security definer set search_path = public as $$
declare fid uuid; cur uuid[];
begin
  select family_id into fid from kids where id = p_kid;
  if fid is null or not is_parent_of(fid) then raise exception 'not a parent of this family'; end if;
  select kid_ids into cur from family_sitters where family_id = fid and sitter_id = p_sitter and status <> 'removed' for update;
  if not found then raise exception 'not a sitter of this family'; end if;
  if p_on then
    if cur is null or p_kid = any (cur) then return; end if;
    cur := cur || p_kid;
    -- Every kid chosen again = null (also covers kids added later), as on the invite (P23).
    if not exists (select 1 from kids k where k.family_id = fid and not (k.id = any (cur))) then cur := null; end if;
  else
    if cur is null then
      select coalesce(array_agg(id order by created_at), '{}') into cur from kids where family_id = fid and id <> p_kid;
    else
      cur := array_remove(cur, p_kid);
    end if;
  end if;
  update family_sitters set kid_ids = cur where family_id = fid and sitter_id = p_sitter;
end $$;

-- ---------------------------------------------------------------- P21 "Tell Maya about Mia" → S26
-- Only to signed sitters (status active) who can see the kid; returns how many were told.
create or replace function public.tell_sitters_about_kid(p_kid uuid, p_sitters uuid[]) returns int
language plpgsql security definer set search_path = public as $$
declare k kids; fam text; targets uuid[];
begin
  select * into k from kids where id = p_kid;
  if not found or not is_parent_of(k.family_id) then raise exception 'not a parent of this family'; end if;
  select array_agg(fs.sitter_id) into targets from family_sitters fs
    where fs.family_id = k.family_id and fs.sitter_id = any (coalesce(p_sitters, '{}')) and fs.status = 'active'
      and (fs.kid_ids is null or p_kid = any (fs.kid_ids));
  if targets is null then return 0; end if;
  select name into fam from families where id = k.family_id;
  perform notify_users(targets, 'Meet ' || k.name,
    first_name_of(auth.uid()) || ' added ' || k.name || ' to ' || coalesce(fam, 'the family') || '. Tap to see what to know.',
    '/sitter/kid/' || p_kid);
  return cardinality(targets);
end $$;

revoke execute on function public.set_sitter_kid(uuid, uuid, boolean), public.tell_sitters_about_kid(uuid, uuid[]) from anon, public;
grant execute on function public.set_sitter_kid(uuid, uuid, boolean), public.tell_sitters_about_kid(uuid, uuid[]) to authenticated, service_role;
