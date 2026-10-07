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

-- 14. Care plan: parents manage their own family's items; an active sitter only reads them;
--     other parents, invited (not yet signed) and removed sitters see nothing.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000e', 'new-sitter@example.com');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
insert into ctx values ('fam2', (select public.create_family('The Park family', 'Sam Park')::text));
insert into kids (family_id, name) select v::uuid, 'Kai' from ctx where k = 'fam2';
insert into ctx select 'kai', id::text from kids where name = 'Kai';
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into care_items (family_id, type, title, starts, days) select v::uuid, 'activity', 'Pick up Ava', '15:15', 62 from ctx where k = 'fam';
insert into care_items (family_id, kid_id, type, starts, ends) select f.v::uuid, k.id, 'nap', '13:00', '15:00' from ctx f, kids k where f.k = 'fam' and k.name = 'Ava';
update care_items set how = 'Blue bunny in the crib' where type = 'nap';
update care_items set every_minutes = 180 where type = 'nap';
insert into ctx values ('code2', (select public.create_invite((select v::uuid from ctx where k='fam'), 'New')));
do $$ declare n int; begin
  if (select count(*) from care_items) <> 2 then raise exception 'FAIL parent cannot see her care plan'; end if;
  if (select how from care_items where type = 'nap') <> 'Blue bunny in the crib' then raise exception 'FAIL parent cannot edit care plan'; end if;
  if (select every_minutes from care_items where type = 'nap') <> 180 then raise exception 'FAIL parent cannot set a repeat'; end if;
  begin
    update care_items set every_minutes = 10 where type = 'nap';
    raise exception 'FAIL repeat under 30 minutes accepted';
  exception when check_violation then null; end;
  -- can't write into another family, or attach another family's kid
  begin
    insert into care_items (family_id, type) select v::uuid, 'meal' from ctx where k = 'fam2';
    raise exception 'FAIL parent wrote another family''s care plan';
  exception when insufficient_privilege then null; end;
  begin
    insert into care_items (family_id, kid_id, type) select f.v::uuid, (select v::uuid from ctx where k = 'kai'), 'meal' from ctx f where f.k = 'fam';
    raise exception 'FAIL parent attached another family''s kid';
  exception when insufficient_privilege then null; end;
  delete from care_items where type = 'activity';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL parent cannot delete a care item'; end if;
end $$;
insert into care_items (family_id, type, title) select v::uuid, 'other', 'Water the plants' from ctx where k = 'fam';

-- other parent: nothing to see, change or delete
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
do $$ declare n int; begin
  if (select count(*) from care_items) <> 0 then raise exception 'FAIL other parent sees care plan'; end if;
  update care_items set title = 'x';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL other parent edited care plan'; end if;
  delete from care_items;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL other parent deleted care plan'; end if;
end $$;

-- active sitter (Maya): reads, can't write
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
do $$ declare n int; begin
  if (select count(*) from care_items) <> 2 then raise exception 'FAIL active sitter cannot read care plan'; end if;
  update care_items set title = 'x';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL sitter edited care plan'; end if;
  delete from care_items;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL sitter deleted care plan'; end if;
  begin
    insert into care_items (family_id, type) select v::uuid, 'meal' from ctx where k = 'fam';
    raise exception 'FAIL sitter added to care plan';
  exception when insufficient_privilege then null; end;
end $$;

-- invited sitter who hasn't signed the notice: nothing
select pg_temp.as_user('00000000-0000-0000-0000-00000000000e');
select public.accept_invite((select v from ctx where k='code2'), 'New Sitter');
do $$ begin
  if (select count(*) from care_items) <> 0 then raise exception 'FAIL invited sitter sees care plan before signing'; end if;
end $$;

-- removed sitter: nothing
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
update family_sitters set status = 'removed' where sitter_id = '00000000-0000-0000-0000-00000000000b';
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
do $$ begin
  if (select count(*) from care_items) <> 0 then raise exception 'FAIL removed sitter sees care plan'; end if;
end $$;
reset role;

-- 15. Messages (P10 / S37): one thread per family × sitter. Both parents and that signed sitter read and write it;
--     invited (not signed) and removed sitters, other families and strangers can't. New messages push to the others.
--     Jen + co-parent Dan run the Lee family; Rosa is a signed sitter; Maya (b) is removed; e is invited only.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000c0a1', 'dan@example.com'),
  ('00000000-0000-0000-0000-00000000c0a2', 'rosa@example.com');
insert into profiles (id, full_name, role) values ('00000000-0000-0000-0000-00000000c0a1', 'Dan Lee', 'parent')
  on conflict (id) do update set full_name = excluded.full_name;
insert into family_parents (family_id, user_id) select v::uuid, '00000000-0000-0000-0000-00000000c0a1' from ctx where k = 'fam';
delete from net.sent;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into ctx values ('code3', (select public.create_invite((select v::uuid from ctx where k='fam'), 'Rosa')));
select pg_temp.as_user('00000000-0000-0000-0000-00000000c0a2');
select public.accept_invite((select v from ctx where k='code3'), 'Rosa Diaz');
select public.sign_consent((select v::uuid from ctx where k='fam'), 'Rosa Diaz', 'notice-1.0', 'terms-1.0');
select public.register_push_token('ExponentPushToken[rosa-phone]', 'ios');
select pg_temp.as_user('00000000-0000-0000-0000-00000000c0a1');
select public.register_push_token('ExponentPushToken[dan-phone]', 'ios');

-- Jen writes to Rosa; not as someone else, not to a removed or unsigned sitter
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into messages (family_id, sitter_id, author_id, body)
  select v::uuid, '00000000-0000-0000-0000-00000000c0a2', auth.uid(), 'Ava has a loose tooth, no apples today please' from ctx where k = 'fam';
do $$ begin
  begin
    insert into messages (family_id, sitter_id, author_id, body)
      select v::uuid, '00000000-0000-0000-0000-00000000c0a2', '00000000-0000-0000-0000-00000000c0a2', 'fake' from ctx where k = 'fam';
    raise exception 'FAIL parent wrote as the sitter';
  exception when insufficient_privilege then null; end;
  begin
    insert into messages (family_id, sitter_id, author_id, body)
      select v::uuid, '00000000-0000-0000-0000-00000000000b', auth.uid(), 'hi' from ctx where k = 'fam';
    raise exception 'FAIL parent messaged a removed sitter';
  exception when insufficient_privilege then null; end;
  begin
    insert into messages (family_id, sitter_id, author_id, body)
      select v::uuid, '00000000-0000-0000-0000-00000000000e', auth.uid(), 'hi' from ctx where k = 'fam';
    raise exception 'FAIL parent messaged a sitter who has not signed';
  exception when insufficient_privilege then null; end;
  begin
    insert into messages (family_id, sitter_id, author_id, body)
      select v::uuid, '00000000-0000-0000-0000-00000000c0a2', auth.uid(), '' from ctx where k = 'fam';
    raise exception 'FAIL empty message saved';
  exception when check_violation then null; end;
end $$;

-- Rosa reads it, sees it unread, marks the thread read, replies; can't edit, delete or write elsewhere
select pg_temp.as_user('00000000-0000-0000-0000-00000000c0a2');
do $$ declare n int; begin
  if (select count(*) from messages) <> 1 then raise exception 'FAIL sitter cannot read her thread'; end if;
  if (select coalesce(sum(unread), 0) from public.unread_messages()) <> 1 then raise exception 'FAIL sitter unread count'; end if;
  perform public.mark_thread_read((select v::uuid from ctx where k='fam'), auth.uid());
  if (select coalesce(sum(unread), 0) from public.unread_messages()) <> 0 then raise exception 'FAIL mark read did not clear unread'; end if;
  begin
    update messages set body = 'edited';
    raise exception 'FAIL sitter edited a message';
  exception when insufficient_privilege then null; end;
  begin
    delete from messages;
    raise exception 'FAIL sitter deleted a message';
  exception when insufficient_privilege then null; end;
  begin
    insert into message_reads (family_id, sitter_id, user_id) select v::uuid, auth.uid(), auth.uid() from ctx where k = 'fam';
    raise exception 'FAIL read marker written directly';
  exception when insufficient_privilege then null; end;
  begin
    insert into messages (family_id, sitter_id, author_id, body)
      select v::uuid, '00000000-0000-0000-0000-00000000000e', auth.uid(), 'hi' from ctx where k = 'fam';
    raise exception 'FAIL sitter wrote into another sitter''s thread';
  exception when insufficient_privilege then null; end;
end $$;
insert into messages (family_id, sitter_id, author_id, body)
  select v::uuid, auth.uid(), auth.uid(), 'Got it! Switching to yogurt for snack' from ctx where k = 'fam';

-- Dan (the other parent) reads both, has 2 unread, sees Rosa's read marker ("seen")
select pg_temp.as_user('00000000-0000-0000-0000-00000000c0a1');
do $$ begin
  if (select count(*) from messages) <> 2 then raise exception 'FAIL co-parent cannot read the thread'; end if;
  if (select coalesce(sum(unread), 0) from public.unread_messages()) <> 2 then raise exception 'FAIL co-parent unread count'; end if;
  if (select count(*) from message_reads where user_id = '00000000-0000-0000-0000-00000000c0a2') <> 1 then raise exception 'FAIL parent cannot see the sitter read marker'; end if;
end $$;
-- Jen has 1 unread (Rosa's reply)
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ begin
  if (select coalesce(sum(unread), 0) from public.unread_messages()) <> 1 then raise exception 'FAIL parent unread count'; end if;
end $$;

-- Invited (unsigned) sitter, removed sitter, other family's parent, stranger: nothing
do $$
declare u text;
begin
  foreach u in array array['00000000-0000-0000-0000-00000000000e', '00000000-0000-0000-0000-00000000000b',
                           '00000000-0000-0000-0000-00000000000d', '00000000-0000-0000-0000-00000000000c'] loop
    perform set_config('request.jwt.claim.sub', u, false);
    if (select count(*) from messages) <> 0 then raise exception 'FAIL % reads messages', u; end if;
    if (select count(*) from message_reads) <> 0 then raise exception 'FAIL % reads read markers', u; end if;
    if (select count(*) from public.unread_messages()) <> 0 then raise exception 'FAIL % has unread counts', u; end if;
    begin
      perform public.mark_thread_read((select v::uuid from ctx where k='fam'), '00000000-0000-0000-0000-00000000c0a2');
      raise exception 'FAIL % marked someone else''s thread read', u;
    exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
    begin
      insert into messages (family_id, sitter_id, author_id, body)
        select v::uuid, '00000000-0000-0000-0000-00000000c0a2', u::uuid, 'hi' from ctx where k = 'fam';
      raise exception 'FAIL % wrote into the thread', u;
    exception when insufficient_privilege then null; end;
  end loop;
  begin
    perform public.notify_users(array['00000000-0000-0000-0000-00000000000a'::uuid], 'hi', 'hi', '/');
    raise exception 'FAIL a user can send alerts';
  exception when insufficient_privilege then null; end;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000e');
do $$ begin
  insert into messages (family_id, sitter_id, author_id, body)
    select v::uuid, auth.uid(), auth.uid(), 'hi' from ctx where k = 'fam';
  raise exception 'FAIL unsigned sitter wrote to the family';
exception when insufficient_privilege then null; end $$;
reset role;

-- Alerts: Jen's message went to Rosa and Dan (not Jen); Rosa's reply to Jen and Dan (not Rosa)
do $$ begin
  if (select count(*) from net.sent) <> 3 then raise exception 'FAIL expected 3 message alert sends, got %', (select count(*) from net.sent); end if;
  if (select count(*) from net.sent, jsonb_array_elements(body) m
      where m->>'title' = 'Jen' and m->>'to' = 'ExponentPushToken[jen-phone]') <> 0 then raise exception 'FAIL author alerted about her own message'; end if;
  if (select string_agg(m->>'to', ',' order by m->>'to') from net.sent, jsonb_array_elements(body) m where m->>'title' = 'Jen')
      <> 'ExponentPushToken[dan-phone],ExponentPushToken[rosa-phone]' then raise exception 'FAIL parent message alert recipients'; end if;
  if (select string_agg(m->>'to', ',' order by m->>'to') from net.sent, jsonb_array_elements(body) m where m->>'title' = 'Rosa')
      <> 'ExponentPushToken[dan-phone],ExponentPushToken[jen-phone]' then raise exception 'FAIL sitter message alert recipients'; end if;
  if not exists (select 1 from net.sent, jsonb_array_elements(body) m
      where m->>'to' = 'ExponentPushToken[rosa-phone]' and m->'data'->>'url' like '/sitter/messages?family=%') then raise exception 'FAIL sitter alert link'; end if;
  if not exists (select 1 from net.sent, jsonb_array_elements(body) m
      where m->>'to' = 'ExponentPushToken[jen-phone]' and m->'data'->>'url' = '/parent/messages?sitter=00000000-0000-0000-0000-00000000c0a2'
        and m->>'body' = 'Got it! Switching to yogurt for snack') then raise exception 'FAIL parent alert link or text'; end if;
end $$;

-- Invite access (migration 11, wireframes P23-P26, S1): the parent picks kids, permissions and pay; the sitter
-- previews the invite (S1) before accepting; once signed she sees only the chosen kids and their care items.
-- Own users and family so it doesn't depend on the scenarios above.
reset role;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000011a1', 'ana-parent@example.com'),
  ('00000000-0000-0000-0000-0000000011b1', 'bea-sitter@example.com'),
  ('00000000-0000-0000-0000-0000000011c1', 'cy-sitter@example.com');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000011a1');
insert into ctx values ('ifam', (select public.create_family('The Ortiz family', 'Ana Ortiz')::text));
insert into kids (family_id, name, birthdate) select v::uuid, 'Lia', current_date - interval '7 years 2 months' from ctx where k = 'ifam';
insert into kids (family_id, name) select v::uuid, 'Teo' from ctx where k = 'ifam';
insert into ctx select 'lia', id::text from kids where name = 'Lia';
insert into ctx select 'teo', id::text from kids where name = 'Teo';
insert into care_items (family_id, kid_id, type) select f.v::uuid, l.v::uuid, 'nap' from ctx f, ctx l where f.k = 'ifam' and l.k = 'lia';
insert into care_items (family_id, kid_id, type) select f.v::uuid, t.v::uuid, 'bedtime' from ctx f, ctx t where f.k = 'ifam' and t.k = 'teo';
insert into care_items (family_id, type, title) select v::uuid, 'other', 'Feed the cat' from ctx where k = 'ifam';
insert into ctx values ('icode', (select public.create_invite((select v::uuid from ctx where k='ifam'), 'Bea',
  array[(select v::uuid from ctx where k='lia')], true, false, true, 22.50, 'per_shift')));
do $$ begin
  -- another family's kid can't be put on the invite; an empty list is refused
  begin
    perform public.create_invite((select v::uuid from ctx where k='ifam'), 'X', array[(select v::uuid from ctx where k='kai')]);
    raise exception 'FAIL invite took another family''s kid';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  begin
    perform public.create_invite((select v::uuid from ctx where k='ifam'), 'X', '{}'::uuid[]);
    raise exception 'FAIL invite took no kids';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  if (select opened_at from invites where code = (select v from ctx where k='icode')) is not null then raise exception 'FAIL invite opened too early'; end if;
end $$;
insert into ctx values ('icode2', (select public.create_invite((select v::uuid from ctx where k='ifam'), 'Cy')));

-- S1: Bea previews. She sees the family, Lia only, the rate; nothing else is shared yet.
select pg_temp.as_user('00000000-0000-0000-0000-0000000011b1');
do $$ declare p jsonb; begin
  p := public.preview_invite((select v from ctx where k='icode'));
  if p->>'family_name' <> 'The Ortiz family' or p->>'invited_by' <> 'Ana Ortiz' then raise exception 'FAIL preview family: %', p; end if;
  if jsonb_array_length(p->'kids') <> 1 or p->'kids'->0->>'name' <> 'Lia' or (p->'kids'->0->>'age')::int <> 7 then raise exception 'FAIL preview kids: %', p; end if;
  if (p->>'rate')::numeric <> 22.50 or p->>'pay_schedule' <> 'per_shift' then raise exception 'FAIL preview pay: %', p; end if;
  if (select count(*) from families) <> 0 or (select count(*) from kids) <> 0 then raise exception 'FAIL preview shared the family before accepting'; end if;
end $$;

-- the parent sees it opened (P25)
select pg_temp.as_user('00000000-0000-0000-0000-0000000011a1');
do $$ begin
  if (select opened_at from invites where code = (select v from ctx where k='icode')) is null then raise exception 'FAIL invite not marked opened'; end if;
end $$;

-- Bea accepts and signs: her link carries the choices; she sees Lia, Lia's nap and the family task, not Teo
select pg_temp.as_user('00000000-0000-0000-0000-0000000011b1');
select public.accept_invite((select v from ctx where k='icode'), 'Bea Cruz');
select public.sign_consent((select v::uuid from ctx where k='ifam'), 'Bea Cruz', 'notice-1.0', 'terms-1.0');
do $$ begin
  if (select count(*) from kids) <> 1 or (select name from kids) <> 'Lia' then raise exception 'FAIL sitter sees kids outside her invite'; end if;
  if (select count(*) from care_items) <> 2 then raise exception 'FAIL sitter care plan not limited to her kids: %', (select count(*) from care_items); end if;
  if exists (select 1 from care_items where type = 'bedtime') then raise exception 'FAIL sitter sees Teo''s bedtime'; end if;
  if (select rate from family_sitters) <> 22.50 or not (select can_drive from family_sitters) or (select pay_schedule from family_sitters) <> 'per_shift'
    then raise exception 'FAIL sitter link missing invite choices'; end if;
end $$;

-- Cy declines (S1): the code can't be used afterwards; the parent sees it declined
select pg_temp.as_user('00000000-0000-0000-0000-0000000011c1');
select public.decline_invite((select v from ctx where k='icode2'));
do $$ begin
  begin
    perform public.accept_invite((select v from ctx where k='icode2'), 'Cy');
    raise exception 'FAIL declined invite accepted';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  begin
    perform public.preview_invite('000000x');
    raise exception 'FAIL preview of a bad code';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  if (select count(*) from family_sitters) <> 0 then raise exception 'FAIL decliner joined'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000011a1');
do $$ begin
  if (select declined_at from invites where code = (select v from ctx where k='icode2')) is null then raise exception 'FAIL parent cannot see decline'; end if;
  -- a sitter invited with every kid (null) sees all of them, including kids added later
  if (select kid_ids from invites where code = (select v from ctx where k='icode2')) is not null then raise exception 'FAIL default invite should cover every kid'; end if;
end $$;
reset role;

-- House rules (migration 09): parents manage their family's rules; invited and active sitters read them and agree for
-- themselves; booking and clock-in wait for an OK to the current Must rules; a Must change asks again, a Prefer one doesn't.
reset role;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000001a1', 'kim@example.com'),
  ('00000000-0000-0000-0000-0000000001a2', 'ana@example.com'),
  ('00000000-0000-0000-0000-0000000001a3', 'bea@example.com');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000001a1');
insert into ctx values ('hfam', (select public.create_family('The Ito family', 'Kim Ito')::text));
insert into ctx values ('hcode1', (select public.create_invite((select v::uuid from ctx where k='hfam'), 'Ana')));
insert into ctx values ('hcode2', (select public.create_invite((select v::uuid from ctx where k='hfam'), 'Bea')));
insert into house_rules (family_id, key, title, category, strength, must_since)
  select v::uuid, 'visitors', 'No visitors without asking', 'safety', 'must', '2000-01-01' from ctx where k = 'hfam';
insert into house_rules (family_id, key, title, category, strength)
  select v::uuid, 'tidy', 'Tidy before you go', 'home', 'prefer' from ctx where k = 'hfam';
do $$ begin
  if (select must_since from house_rules where key = 'visitors') < now() - interval '1 minute' then raise exception 'FAIL parent backdated a Must rule'; end if;
  if (select must_since from house_rules where key = 'tidy') is not null then raise exception 'FAIL Prefer rule asks for an OK'; end if;
  begin
    insert into house_rules (family_id, key, title, category) select v::uuid, 'visitors', 'Again', 'safety' from ctx where k = 'hfam';
    raise exception 'FAIL same catalogue rule added twice';
  exception when unique_violation then null; end;
  begin
    insert into house_rules (family_id, title, category, strength) select v::uuid, 'x', 'safety', 'sometimes' from ctx where k = 'hfam';
    raise exception 'FAIL odd strength accepted';
  exception when check_violation then null; end;
  begin
    insert into house_rules (family_id, title, category) select v::uuid, 'Shoes off', 'home' from ctx where k = 'fam2';
    raise exception 'FAIL parent wrote another family''s rules';
  exception when insufficient_privilege then null; end;
end $$;

-- Ana accepts the invite: reads the rules (S42 comes before the S2 notice) and agrees for herself only
select pg_temp.as_user('00000000-0000-0000-0000-0000000001a2');
select public.accept_invite((select v from ctx where k='hcode1'), 'Ana Diaz');
do $$ declare n int; begin
  if (select count(*) from house_rules) <> 2 then raise exception 'FAIL invited sitter cannot read house rules'; end if;
  update house_rules set strength = 'prefer';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL sitter edited house rules'; end if;
  delete from house_rules;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL sitter deleted house rules'; end if;
  begin
    insert into house_rules (family_id, title, category) select v::uuid, 'Free snacks', 'food' from ctx where k = 'hfam';
    raise exception 'FAIL sitter added a house rule';
  exception when insufficient_privilege then null; end;
  begin
    insert into house_rule_agreements (family_id, sitter_id) select v::uuid, '00000000-0000-0000-0000-0000000001a3' from ctx where k = 'hfam';
    raise exception 'FAIL sitter agreed for someone else';
  exception when insufficient_privilege then null; end;
  begin
    insert into house_rule_agreements (family_id, sitter_id) select v::uuid, auth.uid() from ctx where k = 'fam2';
    raise exception 'FAIL sitter agreed to a family she never joined';
  exception when insufficient_privilege then null; end;
end $$;
insert into house_rule_agreements (family_id, sitter_id, agreed_at) select v::uuid, auth.uid(), '2100-01-01' from ctx where k = 'hfam';
do $$ begin
  if (select agreed_at from house_rule_agreements) > now() + interval '1 minute' then raise exception 'FAIL sitter set her own agreement time'; end if;
end $$;
select public.sign_consent((select v::uuid from ctx where k='hfam'), 'Ana Diaz', 'notice-1.0', 'terms-1.0');

-- Bea joins and signs the notice but hasn't agreed to the rules; she can't see Ana's agreement
select pg_temp.as_user('00000000-0000-0000-0000-0000000001a3');
select public.accept_invite((select v from ctx where k='hcode2'), 'Bea Lin');
select public.sign_consent((select v::uuid from ctx where k='hfam'), 'Bea Lin', 'notice-1.0', 'terms-1.0');
do $$ begin
  if (select count(*) from house_rule_agreements) <> 0 then raise exception 'FAIL sitter sees another sitter''s agreement'; end if;
  begin
    perform public.house_rules_agreed((select v::uuid from ctx where k='hfam'), '00000000-0000-0000-0000-0000000001a2');
    raise exception 'FAIL sitter can call house_rules_agreed';
  exception when insufficient_privilege then null; end;
end $$;

-- Kim sees Ana's OK; she can book Ana but not Bea
select pg_temp.as_user('00000000-0000-0000-0000-0000000001a1');
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
  select v::uuid, '00000000-0000-0000-0000-0000000001a2', now() + interval '5 minutes', now() + interval '3 hours', auth.uid() from ctx where k = 'hfam';
insert into ctx select 'hshift', id::text from shifts where sitter_id = '00000000-0000-0000-0000-0000000001a2';
do $$ begin
  if (select count(*) from house_rule_agreements) <> 1 then raise exception 'FAIL parent cannot see agreements'; end if;
  begin
    insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
      select v::uuid, '00000000-0000-0000-0000-0000000001a3', now() + interval '1 day', now() + interval '1 day 3 hours', auth.uid() from ctx where k = 'hfam';
    raise exception 'FAIL booked a sitter who hasn''t agreed to the house rules';
  exception when others then if sqlerrm like 'FAIL%' or sqlerrm not like '%house rules%' then raise; end if; end;
  begin
    update shifts set sitter_id = '00000000-0000-0000-0000-0000000001a3' where id = (select v::uuid from ctx where k = 'hshift');
    raise exception 'FAIL moved a shift to a sitter who hasn''t agreed';
  exception when others then if sqlerrm like 'FAIL%' or sqlerrm not like '%house rules%' then raise; end if; end;
end $$;

-- A Prefer change keeps Ana's OK; a Must change asks again
update house_rules set title = 'Tidy toys and dishes before you go' where key = 'tidy';
reset role;
do $$ begin
  if not public.house_rules_agreed((select v::uuid from ctx where k='hfam'), '00000000-0000-0000-0000-0000000001a2') then raise exception 'FAIL Prefer change asked for a new OK'; end if;
end $$;
set role authenticated;
update house_rules set options = '{"note": "Grandma is fine"}' where key = 'visitors';
reset role;
do $$ begin
  if public.house_rules_agreed((select v::uuid from ctx where k='hfam'), '00000000-0000-0000-0000-0000000001a2') then raise exception 'FAIL Must change kept the old OK'; end if;
end $$;
set role authenticated;

-- Ana can't clock in until she agrees again
select pg_temp.as_user('00000000-0000-0000-0000-0000000001a2');
do $$ begin
  perform public.clock_in((select v::uuid from ctx where k='hshift'));
  raise exception 'FAIL clocked in without agreeing to the changed rules';
exception when others then if sqlerrm like 'FAIL%' or sqlerrm not like '%house rules%' then raise; end if; end $$;
insert into house_rule_agreements (family_id, sitter_id) select v::uuid, auth.uid() from ctx where k = 'hfam'
  on conflict (family_id, sitter_id) do update set agreed_at = excluded.agreed_at;
reset role;
do $$ begin
  if not public.house_rules_agreed((select v::uuid from ctx where k='hfam'), '00000000-0000-0000-0000-0000000001a2') then raise exception 'FAIL agreeing again didn''t count'; end if;
  if (select count(*) from house_rule_agreements where family_id = (select v::uuid from ctx where k='hfam')) <> 1 then raise exception 'FAIL agreeing again added a row'; end if;
end $$;
set role authenticated;

-- Removing the only Must rule frees Bea to be booked
select pg_temp.as_user('00000000-0000-0000-0000-0000000001a1');
delete from house_rules where key = 'visitors';
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
  select v::uuid, '00000000-0000-0000-0000-0000000001a3', now() + interval '1 day', now() + interval '1 day 3 hours', auth.uid() from ctx where k = 'hfam';

-- Other parents and strangers: nothing
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
do $$ declare n int; begin
  if (select count(*) from house_rules) <> 0 then raise exception 'FAIL other parent sees house rules'; end if;
  if (select count(*) from house_rule_agreements) <> 0 then raise exception 'FAIL other parent sees agreements'; end if;
  update house_rules set title = 'x';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL other parent edited house rules'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin
  if (select count(*) from house_rules) <> 0 then raise exception 'FAIL stranger sees house rules'; end if;
end $$;
reset role;

-- Availability and time off (migration 12): a sitter manages only her own hours and days off. Parents of a family
-- where she is ACTIVE read her weekly hours, and her time off only as dates through family_sitter_time_off().
-- Invited (not signed), removed sitters' and other families' sitters' hours stay hidden. The note never reaches parents.
reset role;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000a1101', 'zoe-sitter@example.com'),
  ('00000000-0000-0000-0000-0000000a1102', 'ivy-sitter@example.com'),
  ('00000000-0000-0000-0000-0000000a1103', 'rae-sitter@example.com');
-- Zoe is active with the Park family; Ivy is invited to the Lee family but hasn't signed; Rae was removed by the Parks.
insert into family_sitters (family_id, sitter_id, status)
  select v::uuid, '00000000-0000-0000-0000-0000000a1101', 'active' from ctx where k = 'fam2';
insert into family_sitters (family_id, sitter_id, status)
  select v::uuid, '00000000-0000-0000-0000-0000000a1102', 'needs_consent' from ctx where k = 'fam';
insert into family_sitters (family_id, sitter_id, status)
  select v::uuid, '00000000-0000-0000-0000-0000000a1103', 'removed' from ctx where k = 'fam2';
set role authenticated;

select pg_temp.as_user('00000000-0000-0000-0000-0000000a1101');
insert into sitter_availability (sitter_id, weekday, starts, ends) values
  (auth.uid(), 1, '14:30', '22:00'), (auth.uid(), 6, '10:00', '23:00');
insert into sitter_time_off (sitter_id, starts, ends, note) values (auth.uid(), current_date + 10, current_date + 12, 'Exams');
update sitter_availability set ends = '21:00' where weekday = 1;
do $$ begin
  if (select count(*) from sitter_availability) <> 2 then raise exception 'FAIL sitter cannot read her availability'; end if;
  if (select ends from sitter_availability where weekday = 1) <> '21:00' then raise exception 'FAIL sitter cannot edit her hours'; end if;
  if (select count(*) from sitter_time_off) <> 1 then raise exception 'FAIL sitter cannot read her time off'; end if;
  begin
    insert into sitter_availability (sitter_id, weekday, starts, ends) values ('00000000-0000-0000-0000-0000000a1102', 2, '09:00', '17:00');
    raise exception 'FAIL sitter set another sitter''s hours';
  exception when insufficient_privilege then null; end;
  begin
    insert into sitter_time_off (sitter_id, starts, ends) values ('00000000-0000-0000-0000-0000000a1102', current_date, current_date);
    raise exception 'FAIL sitter added another sitter''s time off';
  exception when insufficient_privilege then null; end;
  begin
    insert into sitter_availability (sitter_id, weekday, starts, ends) values (auth.uid(), 7, '09:00', '17:00');
    raise exception 'FAIL weekday 7 accepted';
  exception when check_violation then null; end;
  begin
    insert into sitter_time_off (sitter_id, starts, ends) values (auth.uid(), current_date, current_date - 1);
    raise exception 'FAIL time off ending before it starts accepted';
  exception when check_violation then null; end;
end $$;

select pg_temp.as_user('00000000-0000-0000-0000-0000000a1102');
insert into sitter_availability (sitter_id, weekday, starts, ends) values (auth.uid(), 2, '09:00', '17:00');
insert into sitter_time_off (sitter_id, starts, ends) values (auth.uid(), current_date, current_date + 1);
do $$ begin
  if (select count(*) from sitter_availability) <> 1 then raise exception 'FAIL sitter sees another sitter''s hours'; end if;
  if (select count(*) from sitter_time_off) <> 1 then raise exception 'FAIL sitter sees another sitter''s time off'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1103');
insert into sitter_availability (sitter_id, weekday, starts, ends) values (auth.uid(), 3, '09:00', '17:00');
insert into sitter_time_off (sitter_id, starts, ends) values (auth.uid(), current_date, current_date);

-- Sam (Park parent): Zoe's hours and dates off, nothing of Rae (removed) or Ivy (another family); never the note.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
do $$ declare n int; begin
  if (select count(*) from sitter_availability where sitter_id = '00000000-0000-0000-0000-0000000a1101') <> 2 then raise exception 'FAIL parent cannot read active sitter''s hours'; end if;
  if (select count(*) from sitter_availability) <> 2 then raise exception 'FAIL parent sees hours of a removed or other family''s sitter'; end if;
  if (select count(*) from sitter_time_off) <> 0 then raise exception 'FAIL parent reads the time off table (notes)'; end if;
  if (select count(*) from public.family_sitter_time_off((select v::uuid from ctx where k = 'fam2'))) <> 1 then raise exception 'FAIL parent cannot see active sitter''s time off'; end if;
  if (select sitter_id from public.family_sitter_time_off((select v::uuid from ctx where k = 'fam2'))) <> '00000000-0000-0000-0000-0000000a1101' then raise exception 'FAIL wrong sitter''s time off'; end if;
  if (select count(*) from public.family_sitter_time_off((select v::uuid from ctx where k = 'fam'))) <> 0 then raise exception 'FAIL parent sees another family''s sitters'' time off'; end if;
  update sitter_availability set ends = '23:59';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL parent edited a sitter''s hours'; end if;
  delete from sitter_availability;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL parent deleted a sitter''s hours'; end if;
  begin
    insert into sitter_availability (sitter_id, weekday, starts, ends) values ('00000000-0000-0000-0000-0000000a1101', 0, '09:00', '17:00');
    raise exception 'FAIL parent set a sitter''s hours';
  exception when insufficient_privilege then null; end;
end $$;

-- Jen (Lee parent): Ivy hasn't signed, so nothing; Zoe isn't hers.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ begin
  if (select count(*) from sitter_availability) <> 0 then raise exception 'FAIL parent sees hours of an unsigned or other family''s sitter'; end if;
  if (select count(*) from public.family_sitter_time_off((select v::uuid from ctx where k = 'fam'))) <> 0 then raise exception 'FAIL parent sees unsigned sitter''s time off'; end if;
end $$;

-- Stranger: nothing.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin
  if (select count(*) from sitter_availability) <> 0 then raise exception 'FAIL stranger sees sitter hours'; end if;
  if (select count(*) from sitter_time_off) <> 0 then raise exception 'FAIL stranger sees time off'; end if;
  if (select count(*) from public.family_sitter_time_off((select v::uuid from ctx where k = 'fam2'))) <> 0 then raise exception 'FAIL stranger sees time off through the function'; end if;
end $$;
reset role;

-- Incidents (migration 15, wireframes S24 / P9): the shift's sitter logs an incident (kind 'incident', urgent);
-- both of the family's parents read it and get the alert right away (even with "Food and tasks" off), and a tap
-- opens Alerts. Another family's parent and a stranger see nothing. Rosa (signed with the Lees) works the shift.
delete from net.sent;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
  values ((select v::uuid from ctx where k='fam'), '00000000-0000-0000-0000-00000000c0a2', now() + interval '5 minutes', now() + interval '3 hours', auth.uid());
insert into ctx select 'ishift', id::text from shifts where sitter_id = '00000000-0000-0000-0000-00000000c0a2' order by created_at desc limit 1;
select pg_temp.as_user('00000000-0000-0000-0000-00000000c0a2');
select public.clock_in((select v::uuid from ctx where k='ishift'));
insert into logs (shift_id, author_id, kind, kid_ids, data, urgent)
  select s.v::uuid, auth.uid(), 'incident', array[(select id from kids where name = 'Ava')],
    '{"type":"Fall or bump","where":"Backyard","text":"Scraped her knee. Bandage on."}', true
  from ctx s where s.k = 'ishift';
do $$ begin
  begin
    insert into logs (shift_id, author_id, kind, data) select v::uuid, auth.uid(), 'bogus', '{}' from ctx where k = 'ishift';
    raise exception 'FAIL unknown log kind accepted';
  exception when check_violation then null; end;
  if (select count(*) from logs where kind = 'incident') <> 1 then raise exception 'FAIL sitter cannot read her incident'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ begin
  if (select count(*) from logs where kind = 'incident' and urgent) <> 1 then raise exception 'FAIL parent cannot see the incident'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000c0a1');
do $$ begin
  if (select count(*) from logs where kind = 'incident') <> 1 then raise exception 'FAIL co-parent cannot see the incident'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
do $$ begin
  if (select count(*) from logs where kind = 'incident') <> 0 then raise exception 'FAIL other family sees the incident'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin
  if (select count(*) from logs where kind = 'incident') <> 0 then raise exception 'FAIL stranger sees the incident'; end if;
end $$;
-- Maya (removed from the Lees) can't log an incident on Rosa's shift
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
do $$ begin
  begin
    insert into logs (shift_id, author_id, kind, data, urgent) select v::uuid, auth.uid(), 'incident', '{"type":"Other"}', true from ctx where k = 'ishift';
    raise exception 'FAIL another sitter logged an incident on the shift';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ declare m jsonb; begin
  select body into m from net.sent, jsonb_array_elements(body) x where x->>'title' like '%Incident%' limit 1;
  if m is null then raise exception 'FAIL no incident alert sent'; end if;
  if m->0->>'title' <> 'Ava · Incident: Fall or bump' then raise exception 'FAIL incident alert title: %', m->0->>'title'; end if;
  if m->0->>'body' <> 'Backyard · Scraped her knee. Bandage on.' then raise exception 'FAIL incident alert body: %', m->0->>'body'; end if;
  if m->0->'data'->>'url' <> '/parent/alerts' then raise exception 'FAIL incident alert link: %', m->0->'data'; end if;
  if (select count(*) from jsonb_array_elements(m) x where x->>'to' in ('ExponentPushToken[jen-phone]', 'ExponentPushToken[dan-phone]')) <> 2
    or jsonb_array_length(m) <> 2 then raise exception 'FAIL incident alert should reach both parents only: %', m; end if;
end $$;

-- Shift timing (migration 14): S21 running late / can't make it, S25 stay longer. Only the shift's sitter sends a
-- late notice, cancels her shift or answers; only the family's parents ask her to stay; nobody fakes them by
-- writing the tables; a finished shift can't be extended.
reset role;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000a1401', 'pia-parent@example.com'),
  ('00000000-0000-0000-0000-0000000a1402', 'sol-sitter@example.com');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1401');
insert into ctx values ('fam14', (select public.create_family('The Cruz family', 'Pia Cruz')::text));
select public.register_push_token('ExponentPushToken[pia-phone]', 'ios');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1402');
select public.register_push_token('ExponentPushToken[sol-phone]', 'ios');
reset role;
update profiles set full_name = 'Sol Reyes' where id = '00000000-0000-0000-0000-0000000a1402';
insert into family_sitters (family_id, sitter_id, status, rate)
  select v::uuid, '00000000-0000-0000-0000-0000000a1402', 'active', 22 from ctx where k = 'fam14';
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1401');
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by, late_minutes)
  select v::uuid, '00000000-0000-0000-0000-0000000a1402', now() + interval '5 minutes', now() + interval '4 hours', auth.uid(), 30 from ctx where k = 'fam14';
insert into ctx select 'shift14', id::text from shifts where family_id = (select v::uuid from ctx where k = 'fam14');
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
  select v::uuid, '00000000-0000-0000-0000-0000000a1402', now() + interval '1 day', now() + interval '1 day 4 hours', auth.uid() from ctx where k = 'fam14';
insert into ctx select 'shift14b', id::text from shifts where family_id = (select v::uuid from ctx where k = 'fam14') and starts_at > now() + interval '12 hours';
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
  select v::uuid, '00000000-0000-0000-0000-0000000a1402', now() + interval '2 days', now() + interval '2 days 4 hours', auth.uid() from ctx where k = 'fam14';
insert into ctx select 'shift14c', id::text from shifts where family_id = (select v::uuid from ctx where k = 'fam14') and starts_at > now() + interval '36 hours';
do $$ begin
  -- a late notice can't be written on insert or by a parent
  if (select late_minutes from shifts where id = (select v::uuid from ctx where k = 'shift14')) is not null then raise exception 'FAIL parent wrote a late notice on insert'; end if;
  begin
    update shifts set late_minutes = 5, late_note = 'fake' where id = (select v::uuid from ctx where k = 'shift14');
    raise exception 'FAIL parent faked a late notice';
  exception when insufficient_privilege then null; end;
  begin
    perform public.report_late((select v::uuid from ctx where k = 'shift14'), 15, 'x', '');
    raise exception 'FAIL parent sent a late notice';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  begin
    perform public.cancel_my_shift((select v::uuid from ctx where k = 'shift14'), 'x');
    raise exception 'FAIL parent cancelled as the sitter';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  begin
    perform public.request_extension((select v::uuid from ctx where k = 'shift14'), (select ends_at from shifts where id = (select v::uuid from ctx where k = 'shift14')) - interval '5 minutes', '');
    raise exception 'FAIL extension ending before the shift accepted';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  begin
    insert into shift_extensions (shift_id, requested_by, new_ends_at) values ((select v::uuid from ctx where k = 'shift14'), auth.uid(), now() + interval '5 hours');
    raise exception 'FAIL parent wrote shift_extensions directly';
  exception when insufficient_privilege then null; end;
end $$;
-- the parent cancels a shift herself: recorded as cancelled by her, and she can't pin it on the sitter
update shifts set status = 'cancelled' where id = (select v::uuid from ctx where k = 'shift14c');
do $$ begin
  if (select cancelled_by from shifts where id = (select v::uuid from ctx where k = 'shift14c')) <> auth.uid() then raise exception 'FAIL parent cancel not recorded'; end if;
  begin
    update shifts set cancelled_by = '00000000-0000-0000-0000-0000000a1402' where id = (select v::uuid from ctx where k = 'shift14c');
    raise exception 'FAIL parent changed who cancelled';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
delete from net.sent;
set role authenticated;

-- S21: Sol is running 15 min late; Pia's phone gets it with the note and the at-risk task
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1402');
select public.report_late((select v::uuid from ctx where k = 'shift14'), 15, 'Traffic on I-275.', 'Pick up Ava at 3:15 is at risk.');
do $$ declare s shifts; n int; begin
  select * into s from shifts where id = (select v::uuid from ctx where k = 'shift14');
  if s.late_minutes <> 15 or s.late_note <> 'Traffic on I-275.' or s.late_at is null then raise exception 'FAIL late notice not stored'; end if;
  begin
    perform public.report_late((select v::uuid from ctx where k = 'shift14'), 0, '', '');
    raise exception 'FAIL 0 minutes late accepted';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  update shifts set late_minutes = 30 where id = s.id;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL sitter wrote the shift directly'; end if;
  begin
    perform public.request_extension(s.id, s.ends_at + interval '30 minutes', '');
    raise exception 'FAIL sitter asked herself to stay';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;
reset role;
do $$ declare b jsonb; begin
  if (select count(*) from net.sent) <> 1 then raise exception 'FAIL expected 1 late alert, got %', (select count(*) from net.sent); end if;
  select body into b from net.sent;
  if b->0->>'to' <> 'ExponentPushToken[pia-phone]' then raise exception 'FAIL late alert went to %', b->0->>'to'; end if;
  if b->0->>'title' <> 'Sol is running 15 min late' then raise exception 'FAIL late alert title: %', b->0->>'title'; end if;
  if b->0->>'body' <> 'Traffic on I-275. Pick up Ava at 3:15 is at risk.' then raise exception 'FAIL late alert body: %', b->0->>'body'; end if;
end $$;
delete from net.sent;
set role authenticated;

-- stranger and another family's parent: nothing to see or send
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ begin
  if (select count(*) from shifts where id = (select v::uuid from ctx where k = 'shift14')) <> 0 then raise exception 'FAIL other parent sees the shift'; end if;
  begin
    perform public.request_extension((select v::uuid from ctx where k = 'shift14'), now() + interval '6 hours', '');
    raise exception 'FAIL other family''s parent asked for an extension';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;

-- S25: Sol clocks in; Pia asks for 45 more minutes (Sol's phone gets it), then changes it to 60: one open request
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1402');
select public.clock_in((select v::uuid from ctx where k = 'shift14'));
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1401');
select public.request_extension(s.id, s.ends_at + interval '45 minutes', 'Stuck in a meeting.') from shifts s where s.id = (select v::uuid from ctx where k = 'shift14');
select public.request_extension(s.id, s.ends_at + interval '60 minutes', 'Stuck in a meeting.') from shifts s where s.id = (select v::uuid from ctx where k = 'shift14');
do $$ begin
  if (select count(*) from shift_extensions where status = 'pending') <> 1 then raise exception 'FAIL more than one open request'; end if;
  if (select count(*) from shift_extensions where status = 'withdrawn') <> 1 then raise exception 'FAIL replaced request not withdrawn'; end if;
  begin
    perform public.answer_extension((select id from shift_extensions where status = 'pending'), true, null);
    raise exception 'FAIL parent answered for the sitter';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin
  if (select count(*) from shift_extensions) <> 0 then raise exception 'FAIL stranger sees extension requests'; end if;
end $$;
reset role;
do $$ begin
  -- the clock-in alert went to Pia; both requests to Sol only
  if (select count(*) from net.sent where body->0->>'title' like 'Pia asks%') <> 2 then raise exception 'FAIL expected 2 request alerts'; end if;
  if exists (select 1 from net.sent, jsonb_array_elements(body) m where net.sent.body->0->>'title' like 'Pia asks%' and m->>'to' <> 'ExponentPushToken[sol-phone]') then raise exception 'FAIL request alert went to someone else'; end if;
  if (select body->0->>'title' from net.sent where body->0->>'title' like 'Pia asks%' order by id limit 1) <> 'Pia asks: can you stay 45 min longer?' then raise exception 'FAIL request title'; end if;
  if (select body->0->>'body' from net.sent where body->0->>'title' like 'Pia asks%' order by id limit 1) <> 'Stuck in a meeting.' then raise exception 'FAIL request body'; end if;
end $$;
delete from net.sent;
set role authenticated;

-- Sol sees it and stays 15 min (less than asked); the shift end moves; the answer can't be given twice
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1402');
insert into ctx select 'end14', ends_at::text from shifts where id = (select v::uuid from ctx where k = 'shift14');
do $$ begin
  if (select count(*) from shift_extensions) <> 2 then raise exception 'FAIL sitter cannot see requests on her shift'; end if;
end $$;
select public.answer_extension((select id from shift_extensions where status = 'pending'), true, (select v::timestamptz + interval '15 minutes' from ctx where k = 'end14'));
do $$ begin
  if (select ends_at from shifts where id = (select v::uuid from ctx where k = 'shift14')) <> (select v::timestamptz + interval '15 minutes' from ctx where k = 'end14') then raise exception 'FAIL shift end not moved'; end if;
  if (select answered_ends_at from shift_extensions where status = 'accepted') <> (select v::timestamptz + interval '15 minutes' from ctx where k = 'end14') then raise exception 'FAIL agreed end not stored'; end if;
  begin
    perform public.answer_extension((select id from shift_extensions where status = 'accepted'), false, null);
    raise exception 'FAIL request answered twice';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;

-- Pia asks again; Sol can't stay: end unchanged
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1401');
select public.request_extension(s.id, s.ends_at + interval '30 minutes', '') from shifts s where s.id = (select v::uuid from ctx where k = 'shift14');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1402');
select public.answer_extension((select id from shift_extensions where status = 'pending'), false, null);
do $$ begin
  if (select ends_at from shifts where id = (select v::uuid from ctx where k = 'shift14')) <> (select v::timestamptz + interval '15 minutes' from ctx where k = 'end14') then raise exception 'FAIL declining moved the end'; end if;
end $$;
reset role;
do $$ begin
  if (select count(*) from net.sent where body->0->>'to' = 'ExponentPushToken[pia-phone]') <> 2 then raise exception 'FAIL answers not sent to the parent'; end if;
  if not exists (select 1 from net.sent where body->0->>'title' = 'Sol can stay 15 min longer') then raise exception 'FAIL accept alert title'; end if;
  if not exists (select 1 from net.sent where body->0->>'title' = 'Sol can''t stay longer') then raise exception 'FAIL decline alert title'; end if;
end $$;
delete from net.sent;
set role authenticated;

-- An open request when the shift ends can't be accepted; a finished shift can't be extended
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1401');
select public.request_extension(s.id, s.ends_at + interval '30 minutes', '') from shifts s where s.id = (select v::uuid from ctx where k = 'shift14');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1402');
select public.clock_out((select v::uuid from ctx where k = 'shift14'), '');
do $$ begin
  perform public.answer_extension((select id from shift_extensions where status = 'pending'), true, null);
  raise exception 'FAIL extended a completed shift';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1401');
do $$ begin
  perform public.request_extension(s.id, s.ends_at + interval '30 minutes', '') from shifts s where s.id = (select v::uuid from ctx where k = 'shift14');
  raise exception 'FAIL asked to extend a completed shift';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; end $$;

-- S21 "I can't make it today": Sol cancels tomorrow's shift; Pia gets an urgent alert; it can't be cancelled twice
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1402');
select public.cancel_my_shift((select v::uuid from ctx where k = 'shift14b'), 'Sick kid at home.');
do $$ declare s shifts; begin
  select * into s from shifts where id = (select v::uuid from ctx where k = 'shift14b');
  if s.status <> 'cancelled' or s.cancelled_by <> auth.uid() or s.cancel_reason <> 'Sick kid at home.' or s.cancelled_at is null then raise exception 'FAIL sitter cancel not stored'; end if;
  begin
    perform public.cancel_my_shift(s.id, '');
    raise exception 'FAIL cancelled twice';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;
reset role;
do $$ begin
  if (select count(*) from net.sent where body->0->>'title' like 'Urgent:%') <> 1 then raise exception 'FAIL expected 1 cancel alert'; end if;
  if (select body->0->>'title' from net.sent where body->0->>'title' like 'Urgent:%') <> 'Urgent: Sol can''t make it'
     or (select body->0->>'to' from net.sent where body->0->>'title' like 'Urgent:%') <> 'ExponentPushToken[pia-phone]'
     or (select body->0->>'body' from net.sent where body->0->>'title' like 'Urgent:%') <> 'Sick kid at home.' then raise exception 'FAIL cancel alert'; end if;
end $$;

-- Homes and places (migration 16, wireframes P56-P58): parents manage their family's homes and places; one main home;
-- signed sitters read them through places_for_sitter, without the address when "Sitters see the address" is off;
-- strangers and other families see nothing. A shift can only be at one of its family's homes.
reset role;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000a16a1', 'kim-parent@example.com'),
  ('00000000-0000-0000-0000-0000000a16b1', 'noa-sitter@example.com'),
  ('00000000-0000-0000-0000-0000000a16c1', 'lou-stranger@example.com');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a16a1');
insert into ctx values ('pfam', (select public.create_family('The Park family', 'Kim Park')::text));
insert into kids (family_id, name) select v::uuid, 'Bo' from ctx where k = 'pfam';
insert into ctx values ('pcode', (select public.create_invite((select v::uuid from ctx where k='pfam'), 'Noa')));
insert into places (family_id, kind, name, address, lat, lng, radius_ft, is_main, notes)
  select v::uuid, 'home', 'Home', '214 Bayshore Ct, Tampa, FL 33606', 27.93, -82.48, 150, true, 'Gate code 4721' from ctx where k = 'pfam';
insert into places (family_id, kind, name, address, lat, lng, radius_ft, kid_ids, days, show_address)
  select f.v::uuid, 'home', 'Sam''s apartment', '88 Channelside Dr, Apt 4B, Tampa', 27.94, -82.45, 75, array[(select id from kids where name = 'Bo')], '{5,6,0}', false
  from ctx f where f.k = 'pfam';
insert into places (family_id, kind, name, address, lat, lng, radius_ft)
  select v::uuid, 'place', 'Lincoln Elementary', '1207 W Swann Ave, Tampa', 27.94, -82.47, 300 from ctx where k = 'pfam';
insert into ctx select 'home2', id::text from places where name = 'Sam''s apartment';
do $$ begin
  if (select count(*) from places) <> 3 then raise exception 'FAIL parent cannot read her places'; end if;
  -- making the apartment main moves "main" off the first home
  update places set is_main = true where id = (select v::uuid from ctx where k = 'home2');
  if (select count(*) from places where is_main) <> 1 or not (select is_main from places where id = (select v::uuid from ctx where k = 'home2')) then raise exception 'FAIL one main home'; end if;
  update places set is_main = true where name = 'Home';
  -- a place (not a home) can't be main; a bad zone size or day is refused; kids must be the family's
  begin
    update places set is_main = true where kind = 'place';
    raise exception 'FAIL a place became main';
  exception when check_violation then null; end;
  begin
    update places set radius_ft = 5 where name = 'Home';
    raise exception 'FAIL tiny zone accepted';
  exception when check_violation then null; end;
  begin
    update places set days = '{7}' where name = 'Home';
    raise exception 'FAIL day 7 accepted';
  exception when check_violation then null; end;
  begin
    update places set kid_ids = array[gen_random_uuid()] where name = 'Home';
    raise exception 'FAIL another family''s kid accepted';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  update places set notes = 'Gate code 4721 · park on the street' where name = 'Home';
  if (select address from places_for_sitter where id = (select v::uuid from ctx where k = 'home2')) is null then raise exception 'FAIL parent view hides her own address'; end if;
end $$;

-- Invited (not signed) sitter: nothing yet
select pg_temp.as_user('00000000-0000-0000-0000-0000000a16b1');
select public.accept_invite((select v from ctx where k='pcode'), 'Noa Levi');
do $$ begin
  if (select count(*) from places) <> 0 or (select count(*) from places_for_sitter) <> 0 then raise exception 'FAIL unsigned sitter sees places'; end if;
end $$;
-- Signed: reads them through the view; the hidden address is blank but the zone is there; can't write or read the table
select public.sign_consent((select v::uuid from ctx where k='pfam'), 'Noa Levi', 'notice-1.0', 'terms-1.0');
do $$ begin
  if (select count(*) from places) <> 0 then raise exception 'FAIL sitter reads the places table (hidden addresses)'; end if;
  if (select count(*) from places_for_sitter) <> 3 then raise exception 'FAIL sitter cannot read places: %', (select count(*) from places_for_sitter); end if;
  if (select address from places_for_sitter where id = (select v::uuid from ctx where k = 'home2')) is not null then raise exception 'FAIL sitter sees a hidden address'; end if;
  if (select lat from places_for_sitter where id = (select v::uuid from ctx where k = 'home2')) is null then raise exception 'FAIL sitter lost the zone'; end if;
  if (select address from places_for_sitter where name = 'Home') <> '214 Bayshore Ct, Tampa, FL 33606' then raise exception 'FAIL sitter cannot see a shown address'; end if;
  if (select notes from places_for_sitter where name = 'Home') <> 'Gate code 4721 · park on the street' then raise exception 'FAIL sitter cannot see arriving notes'; end if;
  insert into places (family_id, kind, name) select v::uuid, 'place', 'Sneaky' from ctx where k = 'pfam';
  raise exception 'FAIL sitter added a place';
exception when insufficient_privilege then null;
  when others then if sqlerrm like 'FAIL%' then raise; elsif sqlerrm not like '%row-level security%' then raise; end if;
end $$;
do $$ begin
  update places set show_address = true;
  delete from places;
end $$;

-- Stranger: nothing to see, change or delete
select pg_temp.as_user('00000000-0000-0000-0000-0000000a16c1');
insert into ctx values ('pfam2', (select public.create_family('The Ng family', 'Lou Ng')::text));
insert into places (family_id, kind, name) select v::uuid, 'home', 'Lou''s place' from ctx where k = 'pfam2';
insert into ctx select 'lhome', id::text from places where name = 'Lou''s place';
do $$ begin
  if (select count(*) from places) <> 1 or (select count(*) from places_for_sitter) <> 1 then raise exception 'FAIL stranger sees another family''s places'; end if;
  update places set name = 'x' where family_id = (select v::uuid from ctx where k = 'pfam');
  delete from places where family_id = (select v::uuid from ctx where k = 'pfam');
end $$;

-- Back to Kim: the sitter's and stranger's writes did nothing; she books a shift at the apartment, not at Lou's;
-- removing the apartment leaves the shift at the main home (place_id null); she can delete her places
select pg_temp.as_user('00000000-0000-0000-0000-0000000a16a1');
do $$ begin
  if (select count(*) from places) <> 3 or exists (select 1 from places where name = 'x') then raise exception 'FAIL others changed Kim''s places'; end if;
  if (select show_address from places where id = (select v::uuid from ctx where k = 'home2')) then raise exception 'FAIL sitter changed a place'; end if;
end $$;
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by, place_id)
  select f.v::uuid, '00000000-0000-0000-0000-0000000a16b1', now() + interval '1 day', now() + interval '1 day 4 hours', auth.uid(), h.v::uuid
  from ctx f, ctx h where f.k = 'pfam' and h.k = 'home2';
do $$ begin
  begin
    insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by, place_id)
      select v::uuid, '00000000-0000-0000-0000-0000000a16b1', now() + interval '2 days', now() + interval '2 days 4 hours', auth.uid(), (select v::uuid from ctx where k = 'lhome')
      from ctx where k = 'pfam';
    raise exception 'FAIL shift booked at another family''s home';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  begin
    insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by, place_id)
      select v::uuid, '00000000-0000-0000-0000-0000000a16b1', now() + interval '2 days', now() + interval '2 days 4 hours', auth.uid(), (select id from places where kind = 'place')
      from ctx where k = 'pfam';
    raise exception 'FAIL shift booked at a place that isn''t a home';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  delete from places where id = (select v::uuid from ctx where k = 'home2');
  if (select place_id from shifts where family_id = (select v::uuid from ctx where k = 'pfam')) is not null then raise exception 'FAIL shift kept a removed home'; end if;
  delete from places where family_id = (select v::uuid from ctx where k = 'pfam');
  if (select count(*) from places) <> 0 then raise exception 'FAIL parent cannot delete places'; end if;
end $$;
reset role;

-- Trips and the clock-in zone (migration 17, wireframes S8 / P8 / C2 / S22 / P9): the shift's sitter starts trips on
-- her active shift; each GPS point runs the geofence against the family's places: leaving the start zone and arriving
-- push the parents (C2); moving outside every place with no trip open raises one off-plan alert per 30 min. No places
-- → nothing. "Somewhere else" waits for a parent. A start away from home (S22) is asked and answered. Alerts are
-- written only by the database; parents read and dismiss them. Kim Fox (parent), Tess Hall (sitter), Uma (stranger).
reset role;
delete from net.sent;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000a17a1', 'kim-fox@example.com'),
  ('00000000-0000-0000-0000-0000000a17b1', 'tess@example.com'),
  ('00000000-0000-0000-0000-0000000a17c1', 'uma@example.com');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17a1');
insert into ctx values ('tfam', (select public.create_family('The Fox family', 'Kim Fox')::text));
insert into kids (family_id, name) select v::uuid, 'Ivy' from ctx where k = 'tfam';
insert into ctx select 'tivy', id::text from kids where name = 'Ivy' and family_id = (select v::uuid from ctx where k = 'tfam');
select public.register_push_token('ExponentPushToken[kim-phone]', 'ios');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17b1');
select public.register_push_token('ExponentPushToken[tess-phone]', 'ios');
reset role;
update profiles set full_name = 'Tess Hall' where id = '00000000-0000-0000-0000-0000000a17b1';
insert into family_sitters (family_id, sitter_id, status) select v::uuid, '00000000-0000-0000-0000-0000000a17b1', 'active' from ctx where k = 'tfam';
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17a1');
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
  select v::uuid, '00000000-0000-0000-0000-0000000a17b1', now() + interval '5 minutes', now() + interval '4 hours', auth.uid() from ctx where k = 'tfam';
insert into ctx select 'tshift', id::text from shifts where sitter_id = '00000000-0000-0000-0000-0000000a17b1';

-- No places yet: points do nothing (no zones, no alerts)
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17b1');
select public.clock_in((select v::uuid from ctx where k = 'tshift'));
insert into locations (shift_id, sitter_id, lat, lng, accuracy_m, recorded_at)
  select v::uuid, auth.uid(), 27.9550, -82.4550, 10, now() from ctx where k = 'tshift';
reset role;
do $$ begin
  if (select count(*) from alerts) <> 0 or (select count(*) from shift_geo_state) <> 0 then raise exception 'FAIL geofence ran with no places'; end if;
  if (select count(*) from net.sent) <> 1 then raise exception 'FAIL expected only the clock-in push, got %', (select count(*) from net.sent); end if;
end $$;
delete from net.sent;
set role authenticated;

-- Kim saves the home (150 ft zone) and soccer (300 ft)
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17a1');
insert into places (family_id, kind, name, lat, lng, radius_ft, is_main)
  select v::uuid, 'home', 'Fox home', 27.9500, -82.4600, 150, true from ctx where k = 'tfam';
insert into places (family_id, kind, name, lat, lng, radius_ft)
  select v::uuid, 'place', 'Riverside soccer fields', 27.9600, -82.4500, 300 from ctx where k = 'tfam';
insert into ctx select 'thome', id::text from places where name = 'Fox home';
insert into ctx select 'tsoccer', id::text from places where name = 'Riverside soccer fields';

-- Tess at home, then out with no trip: one off-plan alert, the second point 5 min later is debounced
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17b1');
insert into locations (shift_id, sitter_id, lat, lng, accuracy_m, recorded_at)
  select v::uuid, auth.uid(), 27.9500, -82.4600, 10, now() + interval '1 second' from ctx where k = 'tshift';
insert into locations (shift_id, sitter_id, lat, lng, accuracy_m, recorded_at)
  select v::uuid, auth.uid(), 27.9550, -82.4550, 400, now() + interval '30 seconds' from ctx where k = 'tshift';  -- bad fix: skipped
insert into locations (shift_id, sitter_id, lat, lng, accuracy_m, recorded_at)
  select v::uuid, auth.uid(), 27.9550, -82.4550, 10, now() + interval '1 minute' from ctx where k = 'tshift';
insert into locations (shift_id, sitter_id, lat, lng, accuracy_m, recorded_at)
  select v::uuid, auth.uid(), 27.9560, -82.4540, 10, now() + interval '6 minutes' from ctx where k = 'tshift';
insert into locations (shift_id, sitter_id, lat, lng, accuracy_m, recorded_at)
  select v::uuid, auth.uid(), 27.9500, -82.4601, 10, now() + interval '8 minutes' from ctx where k = 'tshift';
do $$ begin
  if (select count(*) from alerts) <> 0 then raise exception 'FAIL sitter reads alerts'; end if;
  begin
    insert into alerts (family_id, shift_id, kind, title) select v::uuid, (select v::uuid from ctx where k = 'tshift'), 'off_plan', 'fake' from ctx where k = 'tfam';
    raise exception 'FAIL sitter wrote an alert';
  exception when insufficient_privilege then null; end;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17a1');
do $$ declare a alerts; begin
  if (select count(*) from alerts) <> 1 then raise exception 'FAIL expected 1 off-plan alert, got %', (select count(*) from alerts); end if;
  select * into a from alerts;
  if a.kind <> 'off_plan' or a.title <> 'Off-plan location' then raise exception 'FAIL off-plan alert: % %', a.kind, a.title; end if;
  if a.body <> 'Tess left home without starting a trip. She is 0.5 mi away, moving.' then raise exception 'FAIL off-plan body: %', a.body; end if;
end $$;

-- S8: a trip to soccer with Ivy by car. One open trip at a time; only saved places of this family; Tess can't
-- mark it arrived or approve it herself
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17b1');
insert into trips (shift_id, sitter_id, place_id, kid_ids, mode)
  select s.v::uuid, auth.uid(), p.v::uuid, array[(select v::uuid from ctx where k = 'tivy')], 'car' from ctx s, ctx p where s.k = 'tshift' and p.k = 'tsoccer';
insert into ctx select 'trip1', id::text from trips;
do $$ declare t trips; n int; begin
  select * into t from trips;
  if t.status <> 'active' or t.needs_approval or t.start_place_id <> (select v::uuid from ctx where k = 'thome') or t.left_start_at is not null
    or t.family_id <> (select v::uuid from ctx where k = 'tfam') then raise exception 'FAIL trip not set up: %', row_to_json(t); end if;
  begin
    insert into trips (shift_id, sitter_id, place_id, mode) select v::uuid, auth.uid(), (select v::uuid from ctx where k = 'thome'), 'walk' from ctx where k = 'tshift';
    raise exception 'FAIL two open trips';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  begin
    insert into trips (shift_id, sitter_id, place_id, mode) select v::uuid, auth.uid(), null, 'walk' from ctx where k = 'tshift';
    raise exception 'FAIL trip with no destination';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  update trips set arrived_at = now(), place_id = null where id = t.id;
  if (select arrived_at from trips where id = t.id) is not null or (select place_id from trips where id = t.id) is null then raise exception 'FAIL sitter rewrote the trip'; end if;
  begin
    update trips set status = 'arrived' where id = t.id;
    raise exception 'FAIL sitter marked the trip arrived';
  exception when insufficient_privilege then null; end;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17c1');
do $$ begin
  if (select count(*) from trips) + (select count(*) from alerts) + (select count(*) from clockin_requests) <> 0 then raise exception 'FAIL stranger sees trips or alerts'; end if;
  begin
    insert into trips (shift_id, sitter_id, custom_dest, mode) select v::uuid, auth.uid(), 'Mall', 'car' from ctx where k = 'tshift';
    raise exception 'FAIL stranger started a trip';
  exception when insufficient_privilege then null; end;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ begin
  if (select count(*) from trips) + (select count(*) from alerts) <> 0 then raise exception 'FAIL other family sees trips or alerts'; end if;
end $$;
reset role;
delete from net.sent;
set role authenticated;

-- Leaves home at +10 min (C2 "Trip started"), arrives at soccer at +27 (C2 "Arrival", 17 min); no off-plan in between
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17b1');
insert into locations (shift_id, sitter_id, lat, lng, accuracy_m, recorded_at)
  select v::uuid, auth.uid(), 27.9550, -82.4550, 10, now() + interval '10 minutes' from ctx where k = 'tshift';
insert into locations (shift_id, sitter_id, lat, lng, accuracy_m, recorded_at)
  select v::uuid, auth.uid(), 27.9590, -82.4510, 10, now() + interval '20 minutes' from ctx where k = 'tshift';
insert into locations (shift_id, sitter_id, lat, lng, accuracy_m, recorded_at)
  select v::uuid, auth.uid(), 27.9601, -82.4501, 10, now() + interval '27 minutes' from ctx where k = 'tshift';
do $$ declare t trips; begin
  select * into t from trips where id = (select v::uuid from ctx where k = 'trip1');
  if t.status <> 'arrived' or t.left_start_at is null or t.arrived_at - t.left_start_at not between interval '16 minutes 50 seconds' and interval '17 minutes 10 seconds' then raise exception 'FAIL trip not tracked: %', row_to_json(t); end if;
end $$;
reset role;
do $$ declare b jsonb; begin
  if (select count(*) from net.sent) <> 2 then raise exception 'FAIL expected 2 trip pushes, got %', (select count(*) from net.sent); end if;
  select body into b from net.sent order by id limit 1;
  if b->0->>'to' <> 'ExponentPushToken[kim-phone]' or b->0->>'title' <> 'Tess left home with Ivy' or b->0->>'body' <> 'Heading to Riverside soccer fields by car'
    or b->0->'data'->>'url' <> '/parent/trip/' || (select v from ctx where k = 'trip1') then raise exception 'FAIL trip-left push: %', b; end if;
  select body into b from net.sent order by id desc limit 1;
  if b->0->>'title' <> 'Tess and Ivy arrived at Riverside soccer fields' or b->0->>'body' <> 'Trip by car took 17 min. Tap to see the map.' then raise exception 'FAIL arrival push: %', b; end if;
end $$;
delete from net.sent;
set role authenticated;

-- She leaves soccer with no trip at +40 (past the 30-min wait): a new off-plan alert names soccer
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17b1');
insert into locations (shift_id, sitter_id, lat, lng, accuracy_m, recorded_at)
  select v::uuid, auth.uid(), 27.9650, -82.4450, 10, now() + interval '40 minutes' from ctx where k = 'tshift';
-- "Somewhere else": waits for a parent; she started outside every zone, so it counts as left at once
insert into trips (shift_id, sitter_id, custom_dest, kid_ids, mode)
  select v::uuid, auth.uid(), ' Library ', array[(select v::uuid from ctx where k = 'tivy')], 'walk' from ctx where k = 'tshift';
insert into ctx select 'trip2', id::text from trips where custom_dest is not null;
do $$ begin
  if (select status from trips where id = (select v::uuid from ctx where k = 'trip2')) <> 'pending'
    or not (select needs_approval from trips where id = (select v::uuid from ctx where k = 'trip2')) then raise exception 'FAIL custom trip not pending'; end if;
  begin
    update trips set status = 'active' where id = (select v::uuid from ctx where k = 'trip2');
    raise exception 'FAIL sitter approved her own trip';
  exception when insufficient_privilege then null; end;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17a1');
update trips set status = 'active' where id = (select v::uuid from ctx where k = 'trip2');
do $$ begin
  if (select approved_at from trips where id = (select v::uuid from ctx where k = 'trip2')) is null then raise exception 'FAIL approval not stamped'; end if;
  begin
    update trips set status = 'ended' where id = (select v::uuid from ctx where k = 'trip2');
    raise exception 'FAIL parent ended the trip';
  exception when insufficient_privilege then null; end;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17b1');
update trips set status = 'ended' where id = (select v::uuid from ctx where k = 'trip2');
do $$ begin
  if (select ended_at from trips where id = (select v::uuid from ctx where k = 'trip2')) is null then raise exception 'FAIL trip not ended'; end if;
end $$;
reset role;
do $$ declare titles text[]; begin
  select array_agg(x->>'title' order by s.id) into titles from net.sent s, jsonb_array_elements(s.body) x;
  if titles <> array['Off-plan location', 'Tess asks to go to Library', 'Tess started a trip with Ivy', 'Kim said yes'] then
    raise exception 'FAIL pushes: %', titles; end if;
  if (select x->>'body' from net.sent s, jsonb_array_elements(s.body) x where x->>'title' = 'Off-plan location')
    <> 'Tess left Riverside soccer fields without starting a trip. She is 0.5 mi away.' then
    raise exception 'FAIL second off-plan body: %', (select x->>'body' from net.sent s, jsonb_array_elements(s.body) x where x->>'title' = 'Off-plan location'); end if;
  if (select x->>'body' from net.sent s, jsonb_array_elements(s.body) x where x->>'title' = 'Tess asks to go to Library') <> 'Ivy · on foot. Tap to answer.' then
    raise exception 'FAIL request body'; end if;
  if (select x->>'to' from net.sent s, jsonb_array_elements(s.body) x where x->>'title' = 'Kim said yes') <> 'ExponentPushToken[tess-phone]' then
    raise exception 'FAIL answer went to the wrong phone'; end if;
end $$;
delete from net.sent;
set role authenticated;

-- Kim reads and dismisses alerts; she can't rewrite or add them
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17a1');
do $$ declare n int; begin
  if (select count(*) from alerts) <> 6 then raise exception 'FAIL expected 6 alerts, got %', (select count(*) from alerts); end if;
  update alerts set dismissed_at = now() where kind = 'off_plan';
  get diagnostics n = row_count;
  if n <> 2 then raise exception 'FAIL parent cannot dismiss'; end if;
  begin
    update alerts set title = 'x';
    raise exception 'FAIL parent rewrote an alert';
  exception when insufficient_privilege then null; end;
  begin
    insert into alerts (family_id, shift_id, kind, title) select v::uuid, (select v::uuid from ctx where k = 'tshift'), 'off_plan', 'fake' from ctx where k = 'tfam';
    raise exception 'FAIL parent wrote an alert';
  exception when insufficient_privilege then null; end;
end $$;

-- Clock-out ends an open trip
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17b1');
insert into trips (shift_id, sitter_id, place_id, mode) select v::uuid, auth.uid(), (select v::uuid from ctx where k = 'thome'), 'walk' from ctx where k = 'tshift';
select public.clock_out((select v::uuid from ctx where k = 'tshift'), '');
do $$ begin
  if exists (select 1 from trips where status in ('pending', 'active')) then raise exception 'FAIL clock-out left a trip open'; end if;
end $$;

reset role;
delete from net.sent;
set role authenticated;
-- S22: starting somewhere else. Tess asks (Kim's phone gets it), the stranger can't answer, Kim says yes once.
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17a1');
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
  select v::uuid, '00000000-0000-0000-0000-0000000a17b1', now() + interval '10 minutes', now() + interval '3 hours', auth.uid() from ctx where k = 'tfam';
insert into ctx select 'tshift2', id::text from shifts where sitter_id = '00000000-0000-0000-0000-0000000a17b1' and status = 'scheduled';
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17b1');
select public.request_clockin_away((select v::uuid from ctx where k = 'tshift2'), 'School pickup at Lincoln.');
do $$ begin
  begin
    insert into clockin_requests (shift_id, family_id, sitter_id) select v::uuid, (select v::uuid from ctx where k = 'tfam'), auth.uid() from ctx where k = 'tshift2';
    raise exception 'FAIL sitter wrote a request directly';
  exception when insufficient_privilege then null; end;
  if (select count(*) from clockin_requests where status = 'pending') <> 1 then raise exception 'FAIL sitter cannot see her request'; end if;
end $$;
insert into ctx select 'creq', id::text from clockin_requests;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17c1');
do $$ begin
  begin
    perform public.answer_clockin_away((select v::uuid from ctx where k = 'creq'), true);
    raise exception 'FAIL stranger answered';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17a1');
select public.answer_clockin_away((select v::uuid from ctx where k = 'creq'), true);
do $$ begin
  begin
    perform public.answer_clockin_away((select v::uuid from ctx where k = 'creq'), false);
    raise exception 'FAIL answered twice';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;
-- Approved start away: no off-plan until she first reaches a saved place; after that, the usual rule
select pg_temp.as_user('00000000-0000-0000-0000-0000000a17b1');
select public.clock_in((select v::uuid from ctx where k = 'tshift2'));
insert into locations (shift_id, sitter_id, lat, lng, accuracy_m, recorded_at)
  select v::uuid, auth.uid(), 27.9700, -82.4700, 10, now() from ctx where k = 'tshift2';
insert into locations (shift_id, sitter_id, lat, lng, accuracy_m, recorded_at)
  select v::uuid, auth.uid(), 27.9500, -82.4600, 10, now() + interval '20 minutes' from ctx where k = 'tshift2';
insert into locations (shift_id, sitter_id, lat, lng, accuracy_m, recorded_at)
  select v::uuid, auth.uid(), 27.9550, -82.4550, 10, now() + interval '30 minutes' from ctx where k = 'tshift2';
reset role;
do $$ declare titles text[]; begin
  select array_agg(x->>'title' order by s.id) into titles from net.sent s, jsonb_array_elements(s.body) x;
  if titles <> array['Tess asks to clock in away from home', 'Kim said yes', 'Tess clocked in', 'Off-plan location'] then raise exception 'FAIL S22 pushes: %', titles; end if;
  if (select x->>'body' from net.sent s, jsonb_array_elements(s.body) x where x->>'title' = 'Tess asks to clock in away from home') <> 'School pickup at Lincoln. Tap to answer.' then
    raise exception 'FAIL S22 request body'; end if;
end $$;
reset role;

-- Sitter profile and credentials (migration 19, wireframes S13-S18, S40, S41, P11): a sitter writes only her own
-- details, certificates and languages; she can't mark one verified or write the background check (BabyBadger
-- and the provider do); changing a verified card's dates sends it back to review. Parents of a family she's linked
-- to (signed, invited or removed) read them; other parents and strangers see nothing.
-- Nia runs the Moss family; Ola is signed, Pip invited (not signed); Quin runs another family.
reset role;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000a1901', 'nia-parent@example.com'),
  ('00000000-0000-0000-0000-0000000a1902', 'ola-sitter@example.com'),
  ('00000000-0000-0000-0000-0000000a1903', 'stranger19@example.com'),
  ('00000000-0000-0000-0000-0000000a1904', 'pip-sitter@example.com'),
  ('00000000-0000-0000-0000-0000000a1905', 'quin-parent@example.com');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1901');
insert into ctx values ('cfam', (select public.create_family('The Moss family', 'Nia Moss')::text));
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1905');
insert into ctx values ('cfam2', (select public.create_family('The Quin family', 'Quin Ray')::text));
reset role;
insert into family_sitters (family_id, sitter_id, status) select v::uuid, '00000000-0000-0000-0000-0000000a1902', 'active' from ctx where k = 'cfam';
insert into family_sitters (family_id, sitter_id, status) select v::uuid, '00000000-0000-0000-0000-0000000a1904', 'needs_consent' from ctx where k = 'cfam';
set role authenticated;

-- Ola fills in her details, two certificates and her languages
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1902');
insert into sitter_profiles (sitter_id, phone, home_area, bio, years_experience) values (auth.uid(), '(813) 555-0192', 'Seminole Heights, Tampa', 'Bilingual sitter.', 6);
insert into sitter_credentials (sitter_id, kind, title, issuer, issued_on, expires_on, file_path)
  values (auth.uid(), 'first_aid', 'CPR and First Aid', 'American Red Cross', current_date - 200, current_date + 400, auth.uid() || '/cards/a.jpg'),
         (auth.uid(), 'cpr_infant', 'Infant CPR', 'American Heart Assoc.', current_date - 700, current_date + 21, null);
insert into sitter_languages (sitter_id, language, level) values (auth.uid(), 'English', 'native'), (auth.uid(), 'Spanish', 'fluent');
do $$ begin
  if (select count(*) from sitter_credentials) <> 2 then raise exception 'FAIL sitter cannot read her credentials'; end if;
  if exists (select 1 from sitter_credentials where verified_at is not null) then raise exception 'FAIL new credential starts verified'; end if;
  begin
    insert into sitter_credentials (sitter_id, kind, title, verified_at) values (auth.uid(), 'water_safety', 'Water safety', now());
    raise exception 'FAIL sitter marked her own certificate verified';
  exception when insufficient_privilege then null; end;
  begin
    update sitter_credentials set verified_at = now();
    raise exception 'FAIL sitter verified a certificate';
  exception when insufficient_privilege then null; end;
  begin
    insert into sitter_credentials (sitter_id, kind, title) values (auth.uid(), 'background_check', 'Background check');
    raise exception 'FAIL sitter wrote her own background check';
  exception when insufficient_privilege then null; end;
  begin
    insert into sitter_credentials (sitter_id, kind, title) values ('00000000-0000-0000-0000-0000000a1904', 'first_aid', 'CPR');
    raise exception 'FAIL sitter added another sitter''s certificate';
  exception when insufficient_privilege then null; end;
  begin
    insert into sitter_languages (sitter_id, language, level) values (auth.uid(), 'French', 'perfect');
    raise exception 'FAIL bad language level accepted';
  exception when check_violation then null; end;
  begin
    insert into sitter_credentials (sitter_id, kind, title) values (auth.uid(), 'pilot', 'Pilot');
    raise exception 'FAIL unknown credential kind accepted';
  exception when check_violation then null; end;
end $$;

-- BabyBadger verifies both and records a cleared background check
reset role;
update sitter_credentials set verified_at = now() where sitter_id = '00000000-0000-0000-0000-0000000a1902';
insert into sitter_credentials (sitter_id, kind, title, issued_on, expires_on, verified_at)
  values ('00000000-0000-0000-0000-0000000a1902', 'background_check', 'Background check', current_date - 40, current_date + 325, now());
set role authenticated;

-- Ola renames one (stays verified), uploads a renewed card for the other (back to review); the background check is
-- read-only for her
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1902');
update sitter_credentials set title = 'CPR + First Aid' where kind = 'first_aid';
update sitter_credentials set expires_on = current_date + 730, file_path = auth.uid() || '/cards/b.jpg' where kind = 'cpr_infant';
do $$ declare n int; begin
  if (select verified_at from sitter_credentials where kind = 'first_aid') is null then raise exception 'FAIL a rename cleared verification'; end if;
  if (select verified_at from sitter_credentials where kind = 'cpr_infant') is not null then raise exception 'FAIL a renewed card stayed verified'; end if;
  if (select count(*) from sitter_credentials where kind = 'background_check') <> 1 then raise exception 'FAIL sitter cannot see her background check'; end if;
  update sitter_credentials set expires_on = current_date + 999 where kind = 'background_check';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL sitter changed her background check'; end if;
  delete from sitter_credentials where kind = 'background_check';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL sitter deleted her background check'; end if;
end $$;

-- Pip (invited) adds a language; she can't see Ola's anything
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1904');
insert into sitter_languages (sitter_id, language, level) values (auth.uid(), 'Portuguese', 'basic');
do $$ begin
  if (select count(*) from sitter_profiles) <> 0 or (select count(*) from sitter_credentials) <> 0
     or (select count(*) from sitter_languages) <> 1 then raise exception 'FAIL sitter sees another sitter''s profile'; end if;
end $$;

-- Nia reads Ola's and Pip's (invited) profile; can't write or verify them
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1901');
do $$ declare n int; begin
  if not public.sitter_can_be_seen_by('00000000-0000-0000-0000-0000000a1902') then raise exception 'FAIL parent cannot see her sitter'; end if;
  if (select phone from sitter_profiles where sitter_id = '00000000-0000-0000-0000-0000000a1902') <> '(813) 555-0192' then raise exception 'FAIL parent cannot read sitter details'; end if;
  if (select count(*) from sitter_credentials) <> 3 then raise exception 'FAIL parent cannot read sitter credentials'; end if;
  if (select count(*) from sitter_languages) <> 3 then raise exception 'FAIL parent cannot read sitter languages (signed + invited)'; end if;
  update sitter_profiles set bio = 'hacked';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL parent edited a sitter profile'; end if;
  delete from sitter_credentials;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL parent deleted a sitter credential'; end if;
  begin
    insert into sitter_languages (sitter_id, language) values ('00000000-0000-0000-0000-0000000a1902', 'Klingon');
    raise exception 'FAIL parent added a sitter language';
  exception when insufficient_privilege then null; end;
end $$;

-- Another family's parent and a stranger: nothing
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1905');
do $$ begin
  if public.sitter_can_be_seen_by('00000000-0000-0000-0000-0000000a1902') then raise exception 'FAIL other parent can see the sitter'; end if;
  if (select count(*) from sitter_profiles) + (select count(*) from sitter_credentials) + (select count(*) from sitter_languages) <> 0 then
    raise exception 'FAIL other family''s parent sees sitter profiles'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1903');
do $$ begin
  if (select count(*) from sitter_profiles) + (select count(*) from sitter_credentials) + (select count(*) from sitter_languages) <> 0 then
    raise exception 'FAIL stranger sees sitter profiles'; end if;
end $$;

-- Removed from the family, Ola stays readable to Nia (her history); deleting her account removes everything
reset role;
update family_sitters set status = 'removed' where sitter_id = '00000000-0000-0000-0000-0000000a1902';
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a1901');
do $$ begin
  if (select count(*) from sitter_credentials) <> 3 then raise exception 'FAIL parent lost a removed sitter''s credentials'; end if;
end $$;
reset role;

-- Family setup / add a child (migration 21, wireframes P21, P12, S26): only a parent of the family turns a kid on or
-- off for a sitter (null = every kid stays null until one is turned off); the sitter then sees exactly those kids.
-- "Tell Sue about Mo" reaches only signed sitters who can see him. P12 "Arrivals and departures" off: trip
-- arrival alerts skip that parent; off-plan alerts still reach her.
-- Rae runs the Fox family with Lu and Kai; Sue is signed.
reset role;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000a2101', 'rae-parent@example.com'),
  ('00000000-0000-0000-0000-0000000a2102', 'sue-sitter@example.com'),
  ('00000000-0000-0000-0000-0000000a2103', 'stranger21@example.com');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2101');
insert into ctx values ('ffam', (select public.create_family('The Fox family', 'Rae Fox')::text));
insert into kids (family_id, name) select v::uuid, 'Lu' from ctx where k = 'ffam';
insert into kids (family_id, name) select v::uuid, 'Kai' from ctx where k = 'ffam';
insert into ctx select 'flu', id::text from kids where name = 'Lu' and family_id = (select v::uuid from ctx where k = 'ffam');
insert into ctx select 'fkai', id::text from kids where name = 'Kai' and family_id = (select v::uuid from ctx where k = 'ffam');
select public.register_push_token('ExponentPushToken[rae-phone]', 'ios');
insert into ctx values ('fcode', (select public.create_invite((select v::uuid from ctx where k = 'ffam'), 'Sue')));
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2102');
select public.accept_invite((select v from ctx where k = 'fcode'), 'Sue Park');
select public.sign_consent((select v::uuid from ctx where k = 'ffam'), 'Sue Park', 'notice-1.0', 'terms-1.0');
select public.register_push_token('ExponentPushToken[sue-phone]', 'ios');
do $$ begin
  if (select count(*) from kids where family_id = (select v::uuid from ctx where k = 'ffam')) <> 2 then raise exception 'FAIL sitter with every kid sees % kids', (select count(*) from kids); end if;
  begin
    perform public.set_sitter_kid((select v::uuid from ctx where k = 'fkai'), auth.uid(), false);
    raise exception 'FAIL sitter changed her own kids';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2103');
do $$ begin
  begin
    perform public.set_sitter_kid((select v::uuid from ctx where k = 'fkai'), '00000000-0000-0000-0000-0000000a2102', false);
    raise exception 'FAIL stranger changed a sitter''s kids';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  begin
    perform public.tell_sitters_about_kid((select v::uuid from ctx where k = 'fkai'), array['00000000-0000-0000-0000-0000000a2102'::uuid]);
    raise exception 'FAIL stranger pushed a sitter';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;
-- Rae turns Kai off for Sue, then a new kid joins: Sue sees only Lu (an explicit list doesn't grow by itself)
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2101');
select public.set_sitter_kid((select v::uuid from ctx where k = 'fkai'), '00000000-0000-0000-0000-0000000a2102', false);
insert into kids (family_id, name) select v::uuid, 'Mo' from ctx where k = 'ffam';
insert into ctx select 'fmo', id::text from kids where name = 'Mo' and family_id = (select v::uuid from ctx where k = 'ffam');
do $$ begin
  if (select kid_ids from family_sitters where sitter_id = '00000000-0000-0000-0000-0000000a2102') <> array[(select v::uuid from ctx where k = 'flu')] then
    raise exception 'FAIL kid off: %', (select kid_ids from family_sitters where sitter_id = '00000000-0000-0000-0000-0000000a2102'); end if;
  if public.tell_sitters_about_kid((select v::uuid from ctx where k = 'fmo'), array['00000000-0000-0000-0000-0000000a2102'::uuid]) <> 0 then
    raise exception 'FAIL told a sitter about a kid she can''t see'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2102');
do $$ begin
  if (select string_agg(name, ',' order by name) from kids where family_id = (select v::uuid from ctx where k = 'ffam')) <> 'Lu' then
    raise exception 'FAIL sitter sees %', (select string_agg(name, ',') from kids); end if;
end $$;
-- Rae turns Mo on (P21): Sue sees Lu and Mo; Kai back on = every kid again (null). Telling Sue about Mo sends one push.
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2101');
select public.set_sitter_kid((select v::uuid from ctx where k = 'fmo'), '00000000-0000-0000-0000-0000000a2102', true);
reset role;
delete from net.sent;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2101');
do $$ begin
  if public.tell_sitters_about_kid((select v::uuid from ctx where k = 'fmo'), array['00000000-0000-0000-0000-0000000a2102'::uuid, '00000000-0000-0000-0000-0000000a2103'::uuid]) <> 1 then
    raise exception 'FAIL tell count'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2102');
do $$ begin
  if (select count(*) from kids where family_id = (select v::uuid from ctx where k = 'ffam')) <> 2 then raise exception 'FAIL sitter doesn''t see the kid turned on'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2101');
select public.set_sitter_kid((select v::uuid from ctx where k = 'fkai'), '00000000-0000-0000-0000-0000000a2102', true);
do $$ begin
  if (select kid_ids from family_sitters where sitter_id = '00000000-0000-0000-0000-0000000a2102') is not null then raise exception 'FAIL every kid on is not null'; end if;
end $$;
reset role;
do $$ begin
  if (select count(*) from net.sent) <> 1 or (select body->0->>'to' from net.sent) <> 'ExponentPushToken[sue-phone]'
     or (select body->0->>'title' from net.sent) <> 'Meet Mo' or (select body->0->'data'->>'url' from net.sent) not like '/sitter/kid/%' then
    raise exception 'FAIL tell push: %', (select json_agg(body) from net.sent); end if;
end $$;
-- P12 arrivals off: Rae's phone gets the off-plan alert but not the arrival
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2101');
update profiles set alert_arrivals = false where id = auth.uid();
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
  select v::uuid, '00000000-0000-0000-0000-0000000a2102', now() + interval '1 day', now() + interval '1 day 3 hours', auth.uid() from ctx where k = 'ffam';
reset role;
delete from net.sent;
insert into alerts (family_id, shift_id, kind, title, body)
  select f.v::uuid, s.id, 'trip_arrived', 'Sue and Lu arrived at the park', '' from ctx f, shifts s where f.k = 'ffam' and s.family_id = f.v::uuid;
insert into alerts (family_id, shift_id, kind, title, body)
  select f.v::uuid, s.id, 'off_plan', 'Off-plan location', '' from ctx f, shifts s where f.k = 'ffam' and s.family_id = f.v::uuid;
do $$ declare titles text[]; begin
  select array_agg(x->>'title' order by s.id) into titles from net.sent s, jsonb_array_elements(s.body) x;
  if titles is distinct from array['Off-plan location'] then raise exception 'FAIL arrivals switch: %', titles; end if;
end $$;
reset role;

-- 20. Sitter requirements (migration 20, P7a / P28–P32 / S27). Rae Reed (parent), Nia Shaw (sitter, invited),
-- Otto (stranger). Parents write the list; the invited sitter reads it and answers self-confirmed ones; status comes
-- from her credentials and languages; a parent marks a document reviewed; "Block booking" stops booking until every
-- must-have is met; new wording asks her to confirm again.
reset role;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000a20a1', 'rae-reed@example.com'),
  ('00000000-0000-0000-0000-0000000a20b1', 'nia@example.com'),
  ('00000000-0000-0000-0000-0000000a20c1', 'otto@example.com');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a20a1');
insert into ctx values ('rfam', (select public.create_family('The Reed family', 'Rae Reed')::text));
insert into kids (family_id, name) select v::uuid, 'Remy' from ctx where k = 'rfam';
insert into ctx values ('rcode', (select public.create_invite((select v::uuid from ctx where k = 'rfam'), 'Nia')));
insert into family_requirements (family_id, key, title, details, level, position)
  select v::uuid, x.key, x.title, x.details::jsonb, x.level, x.pos from ctx,
    (values ('background_check', 'Background check', '{"within_months": 12}', 'must', 0),
            ('cpr_infant', 'Infant CPR', '{}', 'must', 1),
            ('language:Spanish', 'Speaks Spanish', '{"language": "Spanish"}', 'prefer', 2),
            ('non_smoker', 'Non-smoker', '{"proof": "self"}', 'must', 3),
            ('custom', 'Comfortable with dogs', '{"why": "Biscuit", "proof": "document"}', 'must', 4)) x(key, title, details, level, pos)
  where k = 'rfam';
do $$ begin
  begin
    insert into family_requirements (family_id, key, title) select v::uuid, 'non_smoker', 'Again' from ctx where k = 'rfam';
    raise exception 'FAIL same catalogue requirement twice';
  exception when unique_violation then null; end;
  begin
    insert into family_requirements (family_id, key, title, level) select v::uuid, 'custom', 'x', 'off' from ctx where k = 'rfam';
    raise exception 'FAIL bad level accepted';
  exception when check_violation then null; end;
end $$;
insert into ctx select 'rdoc', id::text from family_requirements where key = 'custom' and family_id = (select v::uuid from ctx where k = 'rfam');
insert into ctx select 'rsmoke', id::text from family_requirements where key = 'non_smoker' and family_id = (select v::uuid from ctx where k = 'rfam');

-- Stranger: nothing
select pg_temp.as_user('00000000-0000-0000-0000-0000000a20c1');
do $$ begin
  if (select count(*) from family_requirements) <> 0 then raise exception 'FAIL stranger sees requirements'; end if;
  if (select count(*) from public.sitter_requirement_status((select v::uuid from ctx where k = 'rfam'), '00000000-0000-0000-0000-0000000a20b1')) <> 0 then
    raise exception 'FAIL stranger reads status'; end if;
  begin
    insert into family_requirements (family_id, key, title) select v::uuid, 'custom', 'x' from ctx where k = 'rfam';
    raise exception 'FAIL stranger wrote a requirement';
  exception when insufficient_privilege then null; end;
end $$;

-- Nia: before she accepts she sees nothing; after accepting (before signing) she reads the list (S27)
select pg_temp.as_user('00000000-0000-0000-0000-0000000a20b1');
do $$ begin
  if (select count(*) from family_requirements) <> 0 then raise exception 'FAIL invitee sees requirements before accepting'; end if;
end $$;
select public.accept_invite((select v from ctx where k = 'rcode'), 'Nia Shaw');
do $$ declare s text; begin
  if (select count(*) from family_requirements) <> 5 then raise exception 'FAIL invited sitter cannot read requirements'; end if;
  select string_agg(reason, ',' order by fr.position) into s
    from public.sitter_requirement_status((select v::uuid from ctx where k = 'rfam'), auth.uid()) st
    join family_requirements fr on fr.id = st.requirement_id;
  if s <> 'missing,missing,missing,unconfirmed,unreviewed' then raise exception 'FAIL first status: %', s; end if;
  if (select count(*) from public.sitter_requirement_status((select v::uuid from ctx where k = 'rfam'), '00000000-0000-0000-0000-0000000a20c1')) <> 0 then
    raise exception 'FAIL sitter reads someone else''s status'; end if;
  begin
    update family_requirements set level = 'prefer';
    if exists (select 1 from family_requirements where level = 'prefer' and key = 'background_check') then raise exception 'FAIL sitter changed a requirement'; end if;
  end;
  begin
    insert into family_requirement_checks (requirement_id, sitter_id, answer) select v::uuid, auth.uid(), true from ctx where k = 'rdoc';
    raise exception 'FAIL sitter approved her own document';
  exception when insufficient_privilege then null; end;
  begin
    insert into family_requirement_checks (requirement_id, sitter_id, answer) select v::uuid, '00000000-0000-0000-0000-0000000a20c1', true from ctx where k = 'rsmoke';
    raise exception 'FAIL sitter answered for someone else';
  exception when insufficient_privilege then null; end;
end $$;
-- She answers Yes to non-smoker; checked_by is hers whatever she sends
insert into family_requirement_checks (requirement_id, sitter_id, answer, checked_by)
  select v::uuid, auth.uid(), true, '00000000-0000-0000-0000-0000000a20a1' from ctx where k = 'rsmoke';
do $$ begin
  if (select checked_by from family_requirement_checks) <> auth.uid() then raise exception 'FAIL checked_by not stamped'; end if;
end $$;
-- Her credentials and languages (written directly: migration 19's own rules are tested there)
reset role;
insert into sitter_credentials (sitter_id, kind, title, issued_on, expires_on) values
  ('00000000-0000-0000-0000-0000000a20b1', 'background_check', 'Background check', current_date - 30, null),
  ('00000000-0000-0000-0000-0000000a20b1', 'cpr_infant', 'Infant CPR', current_date - 700, current_date - 5),
  ('00000000-0000-0000-0000-0000000a20b1', 'cpr_infant', 'Infant CPR', current_date - 300, current_date + 10);
insert into sitter_languages (sitter_id, language, level) values ('00000000-0000-0000-0000-0000000a20b1', 'Spanish', 'conversational');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a20b1');
do $$ declare s text; e date; begin
  select string_agg(st.reason, ',' order by fr.position) into s
    from public.sitter_requirement_status((select v::uuid from ctx where k = 'rfam'), auth.uid()) st
    join family_requirements fr on fr.id = st.requirement_id;
  if s <> 'valid,expiring,speaks,confirmed,unreviewed' then raise exception 'FAIL status with credentials: %', s; end if;
  select st.expires_on into e from public.sitter_requirement_status((select v::uuid from ctx where k = 'rfam'), auth.uid()) st
    join family_requirements fr on fr.id = st.requirement_id where fr.key = 'cpr_infant';
  if e <> current_date + 10 then raise exception 'FAIL expiring date: %', e; end if;
end $$;

-- Rae: reads the same status; with Block booking she can't book Nia until the document is reviewed
select pg_temp.as_user('00000000-0000-0000-0000-0000000a20b1');
select public.sign_consent((select v::uuid from ctx where k = 'rfam'), 'Nia Shaw', 'notice-1.0', 'terms-1.0');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a20a1');
update families set requirement_mode = 'block' where id = (select v::uuid from ctx where k = 'rfam');
do $$ begin
  if (select count(*) filter (where met) from public.sitter_requirement_status((select v::uuid from ctx where k = 'rfam'), '00000000-0000-0000-0000-0000000a20b1')) <> 4 then
    raise exception 'FAIL parent sees a different status'; end if;
  if (select count(*) from family_requirement_checks) <> 1 then raise exception 'FAIL parent cannot read answers'; end if;
  begin
    insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
      select v::uuid, '00000000-0000-0000-0000-0000000a20b1', now() + interval '1 day', now() + interval '1 day 3 hours', auth.uid() from ctx where k = 'rfam';
    raise exception 'FAIL booked a sitter missing a must-have';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  begin
    update families set requirement_mode = 'never' where id = (select v::uuid from ctx where k = 'rfam');
    raise exception 'FAIL bad requirement mode';
  exception when check_violation then null; end;
  begin
    insert into family_requirement_checks (requirement_id, sitter_id, answer) select v::uuid, '00000000-0000-0000-0000-0000000a20b1', true from ctx where k = 'rsmoke';
    raise exception 'FAIL parent answered a self-confirmed requirement';
  exception when insufficient_privilege then null; end;
end $$;
insert into family_requirement_checks (requirement_id, sitter_id, answer) select v::uuid, '00000000-0000-0000-0000-0000000a20b1', true from ctx where k = 'rdoc';
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
  select v::uuid, '00000000-0000-0000-0000-0000000a20b1', now() + interval '1 day', now() + interval '1 day 3 hours', auth.uid() from ctx where k = 'rfam';
-- New wording on a self-confirmed requirement clears her answer; the stamp keeps family and key
update family_requirements set title = 'Non-smoker, no vaping', key = 'custom' where id = (select v::uuid from ctx where k = 'rsmoke');
do $$ begin
  if (select key from family_requirements where id = (select v::uuid from ctx where k = 'rsmoke')) <> 'non_smoker' then raise exception 'FAIL key changed'; end if;
  if exists (select 1 from family_requirement_checks where requirement_id = (select v::uuid from ctx where k = 'rsmoke')) then
    raise exception 'FAIL answer kept after the wording changed'; end if;
  if (select reason from public.sitter_requirement_status((select v::uuid from ctx where k = 'rfam'), '00000000-0000-0000-0000-0000000a20b1')
      where requirement_id = (select v::uuid from ctx where k = 'rsmoke')) <> 'unconfirmed' then raise exception 'FAIL not asked again'; end if;
end $$;
reset role;

select 'ALL RLS SCENARIOS PASSED' as result;
