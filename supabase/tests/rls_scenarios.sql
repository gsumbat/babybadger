-- End-to-end rules test. Each block runs as a user via request.jwt.claim.sub and role authenticated.
-- Fails loudly (raise exception) on any broken rule.
\set ON_ERROR_STOP on
set client_min_messages = warning;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'jen@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'maya@example.com'),
  ('00000000-0000-0000-0000-00000000000c', 'stranger@example.com'),
  ('00000000-0000-0000-0000-00000000000d', 'other-parent@example.com');

create temp table ctx (k text primary key, v text);
grant all on ctx to authenticated;

-- helper to switch user
create or replace function pg_temp.as_user(u text) returns void language plpgsql as $$
begin perform set_config('request.jwt.claim.sub', u, false); end $$;

set role authenticated;

-- 1. Jen creates a family, a kid and an invite
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into ctx values ('fam', (select public.create_family('The Lee family', 'Jen Lee')::text));
insert into kids (family_id, name, avoid_foods) select v::uuid, 'Ava', 'peanuts' from ctx where k = 'fam';
insert into ctx values ('code', (select public.create_invite((select v::uuid from ctx where k='fam'), 'Maya')));
select public.register_push_token('ExponentPushToken[jen-phone]', 'ios');
do $$ begin
  perform public.register_push_token('not-a-token', 'ios');
  raise exception 'FAIL accepted a bad push token';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; end $$;

-- 2. Stranger can't see the family, kids or anyone's phone; can't send alerts
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select public.register_push_token('ExponentPushToken[stranger-phone]', 'ios');
do $$ begin
  if (select count(*) from push_tokens) <> 1 then raise exception 'FAIL stranger sees other push tokens'; end if;
  begin
    perform public.notify_parents((select v::uuid from ctx where k='fam'), 'hi', 'hi', '/', false);
    raise exception 'FAIL stranger can send alerts';
  exception when insufficient_privilege then null; end;
  begin
    perform public.first_name_of('00000000-0000-0000-0000-00000000000a');
    raise exception 'FAIL stranger can read names';
  exception when insufficient_privilege then null; end;
  if (select count(*) from families) <> 0 then raise exception 'FAIL stranger sees family'; end if;
  if (select count(*) from kids) <> 0 then raise exception 'FAIL stranger sees kids'; end if;
end $$;

-- 3. Maya accepts the invite: sees family, but not kids until consent
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
select public.accept_invite((select v from ctx where k='code'), 'Maya Rodriguez');
select public.register_push_token('ExponentPushToken[maya-phone]', 'ios');
do $$ begin
  if (select count(*) from families) <> 1 then raise exception 'FAIL sitter cannot see family after invite'; end if;
  if (select count(*) from kids) <> 0 then raise exception 'FAIL sitter sees kids before consent'; end if;
end $$;
-- invite code is single use
do $$ begin
  perform public.accept_invite((select v from ctx where k='code'), 'Maya');
  raise exception 'FAIL invite reused';
exception when others then
  if sqlerrm like 'FAIL%' then raise; end if;
end $$;

-- 4. Jen can't book Maya before she signs (not active)
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ begin
  insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
  values ((select v::uuid from ctx where k='fam'), '00000000-0000-0000-0000-00000000000b', now(), now() + interval '4 hours', auth.uid());
  raise exception 'FAIL booked sitter without consent';
exception when insufficient_privilege or check_violation then null;
  when others then if sqlerrm like 'FAIL%' then raise; elsif sqlerrm not like '%row-level security%' then raise; end if;
end $$;

-- 5. Maya signs consent -> active, now sees kids
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
select public.sign_consent((select v::uuid from ctx where k='fam'), 'Maya Rodriguez', 'notice-1.0', 'terms-1.0');
do $$ begin
  if (select count(*) from kids) <> 1 then raise exception 'FAIL sitter cannot see kids after consent'; end if;
end $$;

-- 6. Jen books a shift starting now, with a task
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
  values ((select v::uuid from ctx where k='fam'), '00000000-0000-0000-0000-00000000000b', now() + interval '5 minutes', now() + interval '4 hours', auth.uid());
insert into ctx select 'shift', id::text from shifts order by created_at desc limit 1;
insert into shift_tasks (shift_id, title) select v::uuid, 'Pick up Ava' from ctx where k='shift';

-- 7. Before clock-in Maya cannot write location or logs
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
do $$ begin
  insert into locations (shift_id, sitter_id, lat, lng) values ((select v::uuid from ctx where k='shift'), auth.uid(), 27.95, -82.46);
  raise exception 'FAIL location written before clock-in';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; end $$;

-- 8. Clock in, write location + log, tick task
select public.clock_in((select v::uuid from ctx where k='shift'));
insert into locations (shift_id, sitter_id, lat, lng) select v::uuid, auth.uid(), 27.95, -82.46 from ctx where k='shift';
insert into logs (shift_id, author_id, kind, data) select v::uuid, auth.uid(), 'food', '{"meal":"snack","what":"apple slices","amount":"all"}' from ctx where k='shift';
select public.set_task_done((select id from shift_tasks limit 1), true);
-- can't write a location as someone else
do $$ begin
  insert into locations (shift_id, sitter_id, lat, lng) values ((select v::uuid from ctx where k='shift'), '00000000-0000-0000-0000-00000000000a', 1, 1);
  raise exception 'FAIL wrote location as another user';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; end $$;

-- 9. Jen sees location and logs; other parent sees nothing
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ begin
  if (select count(*) from locations) <> 1 then raise exception 'FAIL parent cannot see location'; end if;
  if (select count(*) from logs) <> 1 then raise exception 'FAIL parent cannot see logs'; end if;
  if (select count(*) from shift_tasks where done_at is not null) <> 1 then raise exception 'FAIL task not marked done'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
do $$ begin
  if (select count(*) from locations) <> 0 then raise exception 'FAIL other parent sees location'; end if;
  if (select count(*) from logs) <> 0 then raise exception 'FAIL other parent sees logs'; end if;
end $$;

-- 10. Clock out: no more location writes
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
select public.clock_out((select v::uuid from ctx where k='shift'), 'Great afternoon');
do $$ begin
  insert into locations (shift_id, sitter_id, lat, lng) values ((select v::uuid from ctx where k='shift'), auth.uid(), 27.95, -82.46);
  raise exception 'FAIL location written after clock-out';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; end $$;

-- 11. Sitter can't edit the shift directly (e.g. extend her hours)
do $$ declare n int; begin
  update shifts set ends_at = ends_at + interval '3 hours' where id = (select v::uuid from ctx where k='shift');
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL sitter edited shift times'; end if;
end $$;

reset role;

-- 12. Alerts: clock-in, the snack log and clock-out each went to Jen's phone only
do $$ declare b jsonb; begin
  if (select count(*) from net.sent) <> 3 then raise exception 'FAIL expected 3 alert sends, got %', (select count(*) from net.sent); end if;
  if exists (select 1 from net.sent, jsonb_array_elements(body) m where m->>'to' <> 'ExponentPushToken[jen-phone]') then raise exception 'FAIL alert sent to a non-parent'; end if;
  select body into b from net.sent order by id limit 1 offset 1;
  if b->0->>'title' <> 'Snack' or b->0->>'body' <> 'apple slices · ate all' then raise exception 'FAIL log alert text: %', b; end if;
  if (select body->0->>'title' from net.sent order by id limit 1) <> 'Maya clocked in' then raise exception 'FAIL clock-in alert text'; end if;
end $$;
-- 13. Jen turns off "Food and tasks": logs stop, clock alerts stay
update profiles set alert_logs = false where id = '00000000-0000-0000-0000-00000000000a';
delete from net.sent;
insert into logs (shift_id, author_id, kind, data) select v::uuid, '00000000-0000-0000-0000-00000000000b', 'note', '{"text":"hi"}' from ctx where k='shift';
insert into logs (shift_id, author_id, kind, data, urgent) select v::uuid, '00000000-0000-0000-0000-00000000000b', 'note', '{"text":"fell"}', true from ctx where k='shift';
do $$ begin
  if (select count(*) from net.sent) <> 1 then raise exception 'FAIL alert_logs off should send only the urgent entry'; end if;
  if (select body->0->>'title' from net.sent) <> 'Urgent: Note' then raise exception 'FAIL urgent title: %', (select body->0->>'title' from net.sent); end if;
end $$;

select 'ALL RLS SCENARIOS PASSED' as result;
