-- Test data: past shifts and logs for Ava and Leo (the Lee family, sitter Maya) so "Ava’s report" (P5h) has something
-- in every range: Today · Week · Month · 3 months · 6 months · 1 year. George runs it by hand in the Supabase SQL
-- editor. It is NOT a migration: don't put it in migrations/.
--
-- What it makes: 14 completed shifts (3:00 – 7:00 PM Tampa time) on days 1, 2, 3, 5, 8, 11, 16, 24, 38, 62, 95, 130,
-- 180 and 240 ago, both kids on each, and 6–9 logs per shift (snack, dinner, activity, Leo's potty and nap, a note,
-- an incident on one shift). No photos (they need real files in storage). Push notifications are switched off while
-- it inserts, so nobody's phone buzzes. Ids are fixed (md5 of a name), so running it again replaces the same rows.
-- Cleanup at the bottom.

begin;

alter table public.logs disable trigger logs_push;

do $$
declare
  fam   constant uuid := 'fc85e6ba-ef22-44ef-ab41-ff1c500abc59';
  maya  constant uuid := '8bfd7a12-1cf1-4be0-88ff-892baccc1dd8';
  tz    constant text := 'America/New_York';
  ava   uuid;
  leo   uuid;
  jen   uuid;
  ago   int[] := array[1, 2, 3, 5, 8, 11, 16, 24, 38, 62, 95, 130, 180, 240];
  n     int;
  d     date;
  s     timestamptz;
  sid   uuid;
  lid   int;
  snacks text[] := array['Apple slices, crackers', 'Yogurt and berries', 'Cheese and grapes', 'Banana, pretzels', 'Carrot sticks, hummus'];
  dinners text[] := array['Pasta, peas', 'Chicken, rice, broccoli', 'Tacos', 'Fish sticks, corn', 'Mac and cheese, green beans'];
  amounts text[] := array['all', 'most', 'all', 'some', 'most'];
  acts  text[] := array['park', 'soccer', 'reading', 'drawing', 'bike ride'];
  notes text[] := array['Great afternoon, lots of laughing.', 'Ava finished her reading log.', 'Leo was a bit tired today.', 'Both helped tidy up before dinner.', 'Played outside the whole time.'];
begin
  select id into ava from public.kids where family_id = fam and name = 'Ava';
  select id into leo from public.kids where family_id = fam and name = 'Leo';
  select created_by into jen from public.families where id = fam;
  if ava is null or leo is null then raise exception 'Ava or Leo not found in the Lee family'; end if;

  for n in 1 .. array_length(ago, 1) loop
    d := (now() at time zone tz)::date - ago[n];
    s := (d + time '15:00') at time zone tz;
    sid := md5('report-preview-shift-' || n)::uuid;

    insert into public.shifts (id, family_id, sitter_id, starts_at, ends_at, status, clock_in_at, clock_out_at, note, created_by)
    values (sid, fam, maya, s, s + interval '4 hours', 'completed', s + interval '2 minutes', s + interval '4 hours 4 minutes',
            notes[1 + n % 5], jen)
    on conflict (id) do update set starts_at = excluded.starts_at, ends_at = excluded.ends_at, status = 'completed',
      clock_in_at = excluded.clock_in_at, clock_out_at = excluded.clock_out_at, note = excluded.note;

    insert into public.shift_kids (shift_id, kid_id) values (sid, ava), (sid, leo) on conflict do nothing;
    delete from public.logs where shift_id = sid;

    -- 3:30 snack, both
    insert into public.logs (id, shift_id, author_id, kind, kid_ids, data, happened_at) values
      (md5('rp-log-' || n || '-1')::uuid, sid, maya, 'food', array[ava, leo],
       jsonb_build_object('meal', 'snack', 'what', snacks[1 + n % 5], 'amount', amounts[1 + n % 5]), s + interval '30 minutes');
    -- 3:45 Leo's nap (most shifts), about 1 h 10 – 1 h 40
    if n % 4 <> 0 then
      insert into public.logs (id, shift_id, author_id, kind, kid_ids, data, happened_at) values
        (md5('rp-log-' || n || '-2')::uuid, sid, maya, 'nap', array[leo],
         jsonb_build_object('started_at', '3:45 PM', 'ended_at', to_char(timestamp '2000-01-01 15:45' + make_interval(mins => 70 + (n * 7) % 30), 'FMHH12:MI') || ' PM',
                            'how', case when n % 3 = 0 then 'fussy at first' else 'fell asleep easily' end),
         s + interval '45 minutes');
    end if;
    -- 4:30 activity, both
    insert into public.logs (id, shift_id, author_id, kind, kid_ids, data, happened_at) values
      (md5('rp-log-' || n || '-3')::uuid, sid, maya, 'activity', array[ava, leo],
       jsonb_build_object('what', acts[1 + n % 5], 'duration', (30 + (n % 3) * 15) || ' min'), s + interval '90 minutes');
    -- Leo's potty: two tries per shift
    insert into public.logs (id, shift_id, author_id, kind, kid_ids, data, happened_at) values
      (md5('rp-log-' || n || '-4')::uuid, sid, maya, 'diaper', array[leo],
       jsonb_build_object('diaper', 'dry', 'potty', case when n % 3 = 0 then 'tried, nothing' else 'success' end), s + interval '75 minutes'),
      (md5('rp-log-' || n || '-5')::uuid, sid, maya, 'diaper', array[leo],
       jsonb_build_object('diaper', case when n % 5 = 0 then 'wet' else 'dry' end, 'potty', 'success'), s + interval '170 minutes');
    -- 6:00 dinner, both (Ava ate less while her tooth was loose: the last week)
    insert into public.logs (id, shift_id, author_id, kind, kid_ids, data, happened_at) values
      (md5('rp-log-' || n || '-6')::uuid, sid, maya, 'food', array[ava, leo],
       jsonb_build_object('meal', 'dinner', 'what', dinners[1 + n % 5], 'amount', case when ago[n] <= 5 then 'some' else amounts[1 + (n + 2) % 5] end),
       s + interval '3 hours');
    -- a note on every other shift
    if n % 2 = 0 then
      insert into public.logs (id, shift_id, author_id, kind, kid_ids, data, happened_at) values
        (md5('rp-log-' || n || '-7')::uuid, sid, maya, 'note', array[ava, leo],
         jsonb_build_object('category', 'good news', 'text', notes[1 + (n + 1) % 5]), s + interval '3 hours 30 minutes');
    end if;
    -- one incident (shift 3: three days ago), Leo
    if n = 3 then
      insert into public.logs (id, shift_id, author_id, kind, kid_ids, data, urgent, happened_at) values
        (md5('rp-log-' || n || '-8')::uuid, sid, maya, 'incident', array[leo],
         jsonb_build_object('type', 'Fall or bump', 'where', 'Backyard', 'text', 'Tripped on the step and scraped his knee. Cleaned it and put on a bandage, he’s fine.'),
         true, s + interval '2 hours 40 minutes');
    end if;
  end loop;

  raise notice 'Report preview: % shifts for Ava and Leo', array_length(ago, 1);
end $$;

alter table public.logs enable trigger logs_push;

commit;

-- ==================================================================== cleanup (commented out)
-- Deleting the shifts removes their kids and logs too (on delete cascade).
--
-- delete from public.shifts where id in (select md5('report-preview-shift-' || n)::uuid from generate_series(1, 14) n);
