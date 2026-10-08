-- Test data: a second family for Maya, "The Ortiz family" (parent Ana, kid Sam), with a shift TONIGHT and one unread
-- message. George runs it by hand in the Supabase SQL editor. It is NOT a migration: don't put it in migrations/.
--
-- What it makes (fixed ids, so running it again updates the same rows instead of adding new ones):
--   * Ana Ortiz: an auth user who CANNOT sign in (no password, an @babybadger.invalid address nobody can receive mail
--     at, no login identity) + her profile (parent, phone (813) 555-0187, a made-up 555-01xx number).
--   * The Ortiz family (owner Ana, full access, "Mom"), kid Sam (born 05/14/2021, so 5), home at 4710 W Kennedy Blvd,
--     Tampa (main home, 150 ft clock-in zone).
--   * Maya (sitter 8bfd7a12-...) as an ACTIVE sitter of the family: accepted + signed the monitoring notice (a consents
--     row, family_sitters.status 'active'), can message, $20 / hour, paid weekly.
--   * A shift today 7:30 - 10:00 PM Tampa time (America/New_York), status scheduled, with Sam and two tasks
--     ("Bath at 8", "Bedtime story, lights out 8:30"). "Today" = today's date in Tampa, not in UTC, so it is right even
--     when it's run in the evening. If Maya already has a scheduled or active shift that overlaps, the shift moves to
--     start when that shift ends (same 2 h 30 m length; it can then run past midnight). The NOTICE at the end says
--     which time it picked.
--   * One message from Ana to Maya: "Hi Maya! Sam is excited for tonight." (unread for Maya, so the chip shows).
--     The first run pushes it to Maya's phone like a real message (messages_push trigger); later runs don't.
--
-- Running it again: nothing is duplicated. The shift goes back to today 7:30 - 10:00 PM (or the next free slot),
-- scheduled, not clocked in, and its two tasks are unticked. Logs, locations and trips from an earlier test of that
-- shift stay (use the cleanup at the bottom to start from nothing). The message is not sent again.
--
-- Checked against migrations 01-33: handle_new_user makes the empty profile (filled in here), family_parents_cap
-- (1 adult), family_sitters_not_member (Maya isn't an Ortiz adult), house-rules gate (the family has no rules),
-- requirements gate (no requirements, mode 'warn'), no-double-booking (handled above), shifts_place_check (the
-- family's own home), places_stamp (one main home). Push triggers go through pg_net and never fail the insert.

begin;

do $$
declare
  maya   constant uuid := '8bfd7a12-1cf1-4be0-88ff-892baccc1dd8';
  ana    constant uuid := 'a1a0e7a1-0000-4000-8000-000000000001';
  fam    constant uuid := 'a1a0e7a1-0000-4000-8000-000000000002';
  sam    constant uuid := 'a1a0e7a1-0000-4000-8000-000000000003';
  home   constant uuid := 'a1a0e7a1-0000-4000-8000-000000000004';
  cons   constant uuid := 'a1a0e7a1-0000-4000-8000-000000000005';
  shift  constant uuid := 'a1a0e7a1-0000-4000-8000-000000000006';
  task1  constant uuid := 'a1a0e7a1-0000-4000-8000-000000000007';
  task2  constant uuid := 'a1a0e7a1-0000-4000-8000-000000000008';
  msg    constant uuid := 'a1a0e7a1-0000-4000-8000-000000000009';
  tz     constant text := 'America/New_York';
  len    constant interval := interval '2 hours 30 minutes';
  today  date := (now() at time zone tz)::date;   -- today in Tampa
  starts timestamptz;
  busy   timestamptz;
begin
  if not exists (select 1 from auth.users where id = maya) then
    raise exception 'Maya (sitter %) is not in auth.users: nothing was added', maya;
  end if;

  -- ---------------------------------------------------------------- Ana: a user who can't sign in
  -- encrypted_password '' = no password; the token columns are '' (not null) because Supabase Auth can't read a null
  -- there when it looks the address up. No auth.identities row, so there is no way to log in as her.
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, recovery_token, email_change_token_new, email_change)
  values (ana, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
          'ana.ortiz.test@babybadger.invalid', '', now(),
          '{"provider":"email","providers":["email"]}', '{"full_name":"Ana Ortiz"}', now(), now(),
          '', '', '', '')
  on conflict (id) do nothing;

  -- handle_new_user (core migration) already made an empty profile; fill it in.
  insert into public.profiles (id, full_name, role, phone)
  values (ana, 'Ana Ortiz', 'parent', '(813) 555-0187')
  on conflict (id) do update set full_name = excluded.full_name, role = excluded.role, phone = excluded.phone;

  -- ---------------------------------------------------------------- family, Ana as owner, Sam, home
  insert into public.families (id, name, created_by)
  values (fam, 'The Ortiz family', ana)
  on conflict (id) do update set name = excluded.name, created_by = excluded.created_by;

  insert into public.family_parents (family_id, user_id, role, relation)
  values (fam, ana, 'parent', 'Mom')
  on conflict (family_id, user_id) do update set role = excluded.role, relation = excluded.relation;

  insert into public.kids (id, family_id, name, birthdate, gender, color, notes)
  values (sam, fam, 'Sam', date '2021-05-14', 'boy', '#E8B9BE', 'Loves dinosaurs')
  on conflict (id) do update set name = excluded.name, birthdate = excluded.birthdate, gender = excluded.gender;

  insert into public.places (id, family_id, kind, name, address, lat, lng, radius_ft, is_main, show_address)
  values (home, fam, 'home', 'Home', '4710 W Kennedy Blvd, Tampa, FL 33609', 27.94465, -82.51950, 150, true, true)
  on conflict (id) do update set address = excluded.address, lat = excluded.lat, lng = excluded.lng,
                                 radius_ft = excluded.radius_ft, is_main = true, show_address = true;

  -- ---------------------------------------------------------------- Maya: active sitter, notice signed
  -- What accept_invite + sign_consent leave behind: a family_sitters row (then 'active') and a consents row.
  insert into public.family_sitters (family_id, sitter_id, status, kid_ids, can_drive, can_trip, can_message, rate, pay_schedule)
  values (fam, maya, 'active', null, false, true, true, 20.00, 'weekly')
  on conflict (family_id, sitter_id) do update set status = 'active', can_message = true, rate = excluded.rate;

  insert into public.consents (id, family_id, sitter_id, notice_version, terms_version, signed_name)
  values (cons, fam, maya, 'monitoring-notice-1.0', 'terms-1.0',
          coalesce((select nullif(trim(full_name), '') from public.profiles where id = maya), 'Maya'))
  on conflict (id) do nothing;

  -- ---------------------------------------------------------------- tonight's shift
  -- 7:30 PM Tampa time; moved past any of Maya's scheduled / active shifts that overlap (the no-double-booking
  -- trigger would refuse it). Back-to-back is allowed.
  starts := (today + time '19:30') at time zone tz;
  for i in 1..20 loop
    select max(s.ends_at) into busy
      from public.shifts s
      where s.sitter_id = maya and s.id <> shift and s.status in ('scheduled', 'active')
        and s.starts_at < starts + len and s.ends_at > starts;
    exit when busy is null;
    starts := busy;
  end loop;

  insert into public.shifts (id, family_id, sitter_id, starts_at, ends_at, status, created_by, place_id)
  values (shift, fam, maya, starts, starts + len, 'scheduled', ana, home)
  on conflict (id) do update set
    starts_at = excluded.starts_at, ends_at = excluded.ends_at, status = 'scheduled', place_id = excluded.place_id,
    clock_in_at = null, clock_out_at = null, note = '',
    late_minutes = null, late_note = '', late_at = null, cancelled_by = null, cancel_reason = '', cancelled_at = null;

  insert into public.shift_kids (shift_id, kid_id) values (shift, sam) on conflict do nothing;

  -- Task times follow the shift (8:00 and 8:30 PM when it starts at 7:30).
  insert into public.shift_tasks (id, shift_id, title, due_at, position)
  values (task1, shift, 'Bath at 8', starts + interval '30 minutes', 0),
         (task2, shift, 'Bedtime story, lights out 8:30', starts + interval '1 hour', 1)
  on conflict (id) do update set title = excluded.title, due_at = excluded.due_at, position = excluded.position, done_at = null;

  -- ---------------------------------------------------------------- Ana's message (unread for Maya)
  insert into public.messages (id, family_id, sitter_id, author_id, body)
  values (msg, fam, maya, ana, 'Hi Maya! Sam is excited for tonight.')
  on conflict (id) do nothing;

  raise notice 'Ortiz shift: % - % (Tampa time)',
    to_char(starts at time zone tz, 'MM/DD/YYYY HH12:MI AM'), to_char((starts + len) at time zone tz, 'HH12:MI AM');
end $$;

commit;

-- ==================================================================== cleanup (commented out)
-- Removes everything this seed made, and anything made later in the Ortiz family (logs, trips, locations, reads):
-- deleting the family cascades to family_parents, kids, places, family_sitters, consents, shifts (and their tasks,
-- kids, logs, locations, trips), messages and message_reads. The shifts go first because shifts.created_by /
-- sitter_id don't cascade. Deleting Ana from auth.users removes her profile and push tokens.
--
-- begin;
-- delete from public.shifts   where family_id = 'a1a0e7a1-0000-4000-8000-000000000002';
-- delete from public.families where id        = 'a1a0e7a1-0000-4000-8000-000000000002';
-- delete from auth.users      where id        = 'a1a0e7a1-0000-4000-8000-000000000001';
-- commit;
