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
  -- (migration 31: she may upload her own background check report, but never mark it verified)
  begin
    insert into sitter_credentials (sitter_id, kind, title, verified_at) values (auth.uid(), 'background_check', 'Background check', now());
    raise exception 'FAIL sitter verified her own background check';
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
  -- migration 31: families read verified credentials and the ones shared with them, not the re-uploaded Infant CPR
  if (select count(*) from sitter_credentials) <> 2 then raise exception 'FAIL parent reads the wrong sitter credentials'; end if;
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
  if (select count(*) from sitter_credentials) <> 2 then raise exception 'FAIL parent lost a removed sitter''s credentials'; end if;
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
  -- migration 31: nothing counts until a parent asks and taps Looks good
  if s <> 'not_asked,not_asked,missing,not_asked,not_asked' then raise exception 'FAIL first status: %', s; end if;
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
  -- her certificates don't count by themselves (migration 31); her S27 Yes shares Non-smoker
  if s <> 'not_asked,not_asked,speaks,shared,not_asked' then raise exception 'FAIL status with credentials: %', s; end if;
end $$;

-- Rae: reads the same status; with Block booking she can't book Nia until the document is reviewed
select pg_temp.as_user('00000000-0000-0000-0000-0000000a20b1');
select public.sign_consent((select v::uuid from ctx where k = 'rfam'), 'Nia Shaw', 'notice-1.0', 'terms-1.0');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a20a1');
update families set requirement_mode = 'block' where id = (select v::uuid from ctx where k = 'rfam');
do $$ begin
  if (select count(*) filter (where met) from public.sitter_requirement_status((select v::uuid from ctx where k = 'rfam'), '00000000-0000-0000-0000-0000000a20b1')) <> 1 then
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
-- migration 31: Rae asks for the two certificates, Nia shares them, Rae says Looks good to them and to Non-smoker
select public.ask_requirements((select v::uuid from ctx where k = 'rfam'), '00000000-0000-0000-0000-0000000a20b1', array['background_check', 'cpr_infant'], null);
select pg_temp.as_user('00000000-0000-0000-0000-0000000a20b1');
select public.share_requirement(q.id, (select id from sitter_credentials where kind = q.req_key and sitter_id = auth.uid() and (expires_on is null or expires_on >= current_date)))
  from requirement_requests q where q.req_key in ('background_check', 'cpr_infant');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a20a1');
select public.review_requirement(id, true) from requirement_requests where status = 'shared';
do $$ declare s text; e date; begin
  select string_agg(st.reason, ',' order by fr.position) into s
    from public.sitter_requirement_status((select v::uuid from ctx where k = 'rfam'), '00000000-0000-0000-0000-0000000a20b1') st
    join family_requirements fr on fr.id = st.requirement_id;
  if s <> 'valid,expiring,speaks,valid,valid' then raise exception 'FAIL status after Looks good: %', s; end if;
  select st.expires_on into e from public.sitter_requirement_status((select v::uuid from ctx where k = 'rfam'), '00000000-0000-0000-0000-0000000a20b1') st
    join family_requirements fr on fr.id = st.requirement_id where fr.key = 'cpr_infant';
  if e <> current_date + 10 then raise exception 'FAIL expiring date: %', e; end if;
end $$;
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
  select v::uuid, '00000000-0000-0000-0000-0000000a20b1', now() + interval '1 day', now() + interval '1 day 3 hours', auth.uid() from ctx where k = 'rfam';
-- New wording on a self-confirmed requirement clears her answer; the stamp keeps family and key
update family_requirements set title = 'Non-smoker, no vaping', key = 'custom' where id = (select v::uuid from ctx where k = 'rsmoke');
do $$ begin
  if (select key from family_requirements where id = (select v::uuid from ctx where k = 'rsmoke')) <> 'non_smoker' then raise exception 'FAIL key changed'; end if;
  if exists (select 1 from family_requirement_checks where requirement_id = (select v::uuid from ctx where k = 'rsmoke')) then
    raise exception 'FAIL answer kept after the wording changed'; end if;
  if (select reason from public.sitter_requirement_status((select v::uuid from ctx where k = 'rfam'), '00000000-0000-0000-0000-0000000a20b1')
      where requirement_id = (select v::uuid from ctx where k = 'rsmoke')) <> 'asked' then raise exception 'FAIL not asked again'; end if;
end $$;
reset role;

-- 24. Billing (migration 24): parents read their family's plan; only the server writes it
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
set role authenticated;
do $$ begin
  if (select count(*) from family_subscriptions) <> 0 then raise exception 'FAIL subscription row before checkout'; end if;
  if public.family_has_plan((select v::uuid from ctx where k = 'fam')) then raise exception 'FAIL plan without a subscription'; end if;
  begin
    insert into family_subscriptions (family_id, status) select v::uuid, 'active' from ctx where k = 'fam';
    raise exception 'FAIL parent wrote her own subscription';
  exception when insufficient_privilege then null; end;
end $$;
select public.set_trial_reminder((select v::uuid from ctx where k = 'fam'), false);
do $$ begin
  if (select status || '/' || remind_trial from family_subscriptions) <> 'none/false' then raise exception 'FAIL reminder row'; end if;
end $$;
reset role;
select pg_temp.as_user('');
update family_subscriptions set status = 'trialing', plan = 'yearly', trial_ends_at = now() + interval '30 days', had_trial = true,
  current_period_end = now() + interval '30 days', payer_id = '00000000-0000-0000-0000-00000000000a', remind_trial = true
  where family_id = (select v::uuid from ctx where k = 'fam');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ begin
  if not public.family_has_plan((select v::uuid from ctx where k = 'fam')) then raise exception 'FAIL trialing family has no plan'; end if;
  update family_subscriptions set status = 'active';
  raise exception 'FAIL parent updated her subscription';
exception when insufficient_privilege then null; end $$;
do $$ begin
  begin
    delete from family_subscriptions;
    raise exception 'FAIL parent deleted her subscription';
  exception when insufficient_privilege then null; end;
  begin
    perform public.billing_trial_reminder((select v::uuid from ctx where k = 'fam'));
    raise exception 'FAIL parent sent the trial reminder';
  exception when insufficient_privilege then null; end;
end $$;
-- The sitter and a stranger never see the row; the stranger can't change the reminder
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
do $$ begin
  if (select count(*) from family_subscriptions) <> 0 then raise exception 'FAIL sitter sees the subscription'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin
  if (select count(*) from family_subscriptions) <> 0 then raise exception 'FAIL stranger sees the subscription'; end if;
  if public.family_has_plan((select v::uuid from ctx where k = 'fam')) then raise exception 'FAIL stranger reads the plan'; end if;
  begin
    perform public.set_trial_reminder((select v::uuid from ctx where k = 'fam'), false);
    raise exception 'FAIL stranger changed the reminder';
  exception when insufficient_privilege then null; end;
end $$;
-- Grace: past_due counts for 7 days after the period ended; paused and canceled don't
reset role;
select pg_temp.as_user('');
do $$ declare f uuid := (select v::uuid from ctx where k = 'fam'); n int := (select count(*) from net.sent); begin
  perform public.billing_trial_reminder(f);
  if (select count(*) from net.sent) <> n + 1 then raise exception 'FAIL trial reminder not sent'; end if;
  update family_subscriptions set status = 'past_due', current_period_end = now() - interval '3 days' where family_id = f;
  if not public.family_has_plan(f) then raise exception 'FAIL past_due inside grace'; end if;
  update family_subscriptions set current_period_end = now() - interval '8 days' where family_id = f;
  if public.family_has_plan(f) then raise exception 'FAIL past_due after grace'; end if;
  update family_subscriptions set status = 'paused', current_period_end = now() + interval '20 days' where family_id = f;
  if public.family_has_plan(f) then raise exception 'FAIL paused family has the plan'; end if;
  update family_subscriptions set status = 'canceled' where family_id = f;
  if public.family_has_plan(f) then raise exception 'FAIL canceled family has the plan'; end if;
  update family_subscriptions set status = 'active', remind_trial = false where family_id = f;
  perform public.billing_trial_reminder(f);
  if (select count(*) from net.sent) <> n + 1 then raise exception 'FAIL reminder sent while off'; end if;
end $$;

-- 25. Ask your pool (migration 25, P45–P47 / S33 / S34 / S20). Tia Lane (parent), Uma Ray and Vi Long (asked),
-- Wes Hill (a signed sitter of the family who wasn't asked), the stranger. Only the family's parents send requests,
-- only to signed sitters; a sitter reads only her own row (never who else was asked); first to accept is booked and
-- the others are told; with "first to accept" off the parent picks; offers book only the offered part; accepting
-- can clear her time off; cancelled and expired requests can't be taken; Block booking still applies.
reset role;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000a2501', 'tia-parent@example.com'),
  ('00000000-0000-0000-0000-0000000a2502', 'uma-sitter@example.com'),
  ('00000000-0000-0000-0000-0000000a2503', 'vi-sitter@example.com'),
  ('00000000-0000-0000-0000-0000000a2504', 'wes-sitter@example.com');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2501');
insert into ctx values ('fam25', (select public.create_family('The Lane family', 'Tia Lane')::text));
insert into kids (family_id, name) select v::uuid, 'Ivy' from ctx where k = 'fam25';
select public.register_push_token('ExponentPushToken[tia-phone]', 'ios');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2502');
select public.register_push_token('ExponentPushToken[uma-phone]', 'ios');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2503');
select public.register_push_token('ExponentPushToken[vi-phone]', 'ios');
reset role;
update profiles set full_name = 'Uma Ray' where id = '00000000-0000-0000-0000-0000000a2502';
update profiles set full_name = 'Vi Long' where id = '00000000-0000-0000-0000-0000000a2503';
update profiles set full_name = 'Wes Hill' where id = '00000000-0000-0000-0000-0000000a2504';
insert into family_sitters (family_id, sitter_id, status)
  select v::uuid, s::uuid, 'active' from ctx, unnest(array['00000000-0000-0000-0000-0000000a2502', '00000000-0000-0000-0000-0000000a2503',
    '00000000-0000-0000-0000-0000000a2504']) s where k = 'fam25';
insert into ctx select 'n25', count(*)::text from net.sent;
set role authenticated;

-- Bad requests are refused; a stranger can't send one
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2501');
do $$ declare f uuid := (select v::uuid from ctx where k = 'fam25'); begin
  begin
    perform public.create_shift_request(f, now() + interval '1 day', now() + interval '1 day 4 hours', array['00000000-0000-0000-0000-00000000000c'::uuid]);
    raise exception 'FAIL asked someone who isn''t her sitter';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  begin
    perform public.create_shift_request(f, now() + interval '1 day', now() + interval '1 day 4 hours', array['00000000-0000-0000-0000-0000000a2502'::uuid], '{}', '', true, 5);
    raise exception 'FAIL odd expiry accepted';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  begin
    perform public.create_shift_request(f, now() - interval '1 hour', now() + interval '3 hours', array['00000000-0000-0000-0000-0000000a2502'::uuid]);
    raise exception 'FAIL request for a time that started';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  begin
    perform public.create_shift_request(f, now() + interval '1 day', now() + interval '1 day 4 hours', '{}');
    raise exception 'FAIL request with nobody to ask';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin
  perform public.create_shift_request((select v::uuid from ctx where k = 'fam25'), now() + interval '1 day', now() + interval '1 day 4 hours',
    array['00000000-0000-0000-0000-0000000a2502'::uuid]);
  raise exception 'FAIL stranger sent a request';
exception when insufficient_privilege then null; end $$;

-- Tia asks Uma and Vi, first to accept gets it, expires in 12 hours; both phones get "New shift request"
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2501');
insert into ctx select 'req25', public.create_shift_request(v::uuid, now() + interval '2 days', now() + interval '2 days 4 hours',
  array['00000000-0000-0000-0000-0000000a2502', '00000000-0000-0000-0000-0000000a2503']::uuid[], '{}', 'Pizza in the fridge', true, 12)::text
  from ctx where k = 'fam25';
do $$ begin
  if (select count(*) from shift_request_sitters where request_id = (select v::uuid from ctx where k = 'req25')) <> 2 then raise exception 'FAIL parent sees the asked sitters'; end if;
  if (select cardinality(kid_ids) from shift_requests where id = (select v::uuid from ctx where k = 'req25')) <> 1 then raise exception 'FAIL no kids means every kid'; end if;
  if (select expires_at from shift_requests where id = (select v::uuid from ctx where k = 'req25')) > now() + interval '12 hours 1 minute' then raise exception 'FAIL expiry'; end if;
  begin
    update shift_requests set status = 'filled';
    raise exception 'FAIL parent wrote a request directly';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
  if not exists (select 1 from net.sent where id > (select v::bigint from ctx where k = 'n25')
      and body @> '[{"to": "ExponentPushToken[uma-phone]", "title": "New shift request"}]' and body @> '[{"to": "ExponentPushToken[vi-phone]"}]') then
    raise exception 'FAIL sitters not pushed about the request'; end if;
  if exists (select 1 from net.sent, jsonb_array_elements(body) m where id > (select v::bigint from ctx where k = 'n25') and m->>'to' = 'ExponentPushToken[tia-phone]') then
    raise exception 'FAIL parent pushed about her own request'; end if;
end $$;
set role authenticated;

-- Wes (not asked) and the stranger see nothing; Uma sees the request and only her own row, can't write directly
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2504');
do $$ begin
  if (select count(*) from shift_requests) + (select count(*) from shift_request_sitters) <> 0 then raise exception 'FAIL unasked sitter sees the request'; end if;
  perform public.accept_shift_request((select v::uuid from ctx where k = 'req25'));
  raise exception 'FAIL unasked sitter accepted';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin
  if (select count(*) from shift_requests) + (select count(*) from shift_request_sitters) <> 0 then raise exception 'FAIL stranger sees requests'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2502');
select public.mark_shift_request_seen((select v::uuid from ctx where k = 'req25'));
do $$ begin
  if (select note from shift_requests) <> 'Pizza in the fridge' then raise exception 'FAIL sitter cannot read the request'; end if;
  if (select count(*) from shift_request_sitters) <> 1 then raise exception 'FAIL sitter sees who else was asked'; end if;
  if (select status from shift_request_sitters) <> 'seen' or (select seen_at from shift_request_sitters) is null then raise exception 'FAIL not marked seen'; end if;
  begin
    insert into shift_request_sitters (request_id, sitter_id) select v::uuid, '00000000-0000-0000-0000-0000000a2504' from ctx where k = 'req25';
    raise exception 'FAIL sitter added someone to a request';
  exception when insufficient_privilege then null; end;
  begin
    perform public.cancel_shift_request((select v::uuid from ctx where k = 'req25'));
    raise exception 'FAIL sitter cancelled the request';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;

-- Vi offers part of it (S20); an offer outside the window is refused
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2503');
do $$ declare r shift_requests; begin
  select * into r from shift_requests;
  begin
    perform public.offer_shift_request(r.id, r.starts_at - interval '1 hour', r.starts_at + interval '1 hour');
    raise exception 'FAIL offer outside the window';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  if public.offer_shift_request(r.id, r.starts_at, r.starts_at + interval '1 hour')->>'result' <> 'offered' then raise exception 'FAIL offer'; end if;
end $$;
-- Uma accepts first: she's booked with the kid, Vi is told it's filled, Tia is told Uma took it
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2502');
do $$ declare res jsonb; begin
  res := public.accept_shift_request((select v::uuid from ctx where k = 'req25'));
  if res->>'result' <> 'booked' or res->>'shift_id' is null then raise exception 'FAIL first accept: %', res; end if;
  if (select count(*) from shifts where id = (res->>'shift_id')::uuid and status = 'scheduled' and sitter_id = auth.uid()) <> 1 then raise exception 'FAIL shift not hers'; end if;
  if (select count(*) from shift_kids where shift_id = (res->>'shift_id')::uuid) <> 1 then raise exception 'FAIL kids not on the shift'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2503');
do $$ begin
  if (select status from shift_request_sitters) <> 'filled' then raise exception 'FAIL other sitter not told'; end if;
  if public.accept_shift_request((select v::uuid from ctx where k = 'req25'))->>'result' <> 'filled' then raise exception 'FAIL second accept went through'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2501');
do $$ begin
  if (select status || '/' || filled_by from shift_requests where id = (select v::uuid from ctx where k = 'req25')) <> 'filled/00000000-0000-0000-0000-0000000a2502' then
    raise exception 'FAIL request not filled'; end if;
  if (select count(*) from shifts where family_id = (select v::uuid from ctx where k = 'fam25')) <> 1 then raise exception 'FAIL expected one shift'; end if;
end $$;
reset role;
do $$ begin
  if not exists (select 1 from net.sent where body @> '[{"to": "ExponentPushToken[vi-phone]", "title": "This shift was filled"}]') then raise exception 'FAIL filled push'; end if;
  if not exists (select 1 from net.sent where body @> '[{"to": "ExponentPushToken[tia-phone]", "title": "Uma took the shift"}]') then raise exception 'FAIL took push'; end if;
  if exists (select 1 from net.sent where body @> '[{"to": "ExponentPushToken[uma-phone]", "title": "This shift was filled"}]') then raise exception 'FAIL winner told it was filled'; end if;
end $$;
set role authenticated;

-- "First to accept" off: Uma's yes only tells Tia; Tia can't book Vi (no answer), books Uma; Vi is told
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2501');
insert into ctx select 'req25b', public.create_shift_request(v::uuid, now() + interval '3 days', now() + interval '3 days 3 hours',
  array['00000000-0000-0000-0000-0000000a2502', '00000000-0000-0000-0000-0000000a2503']::uuid[], '{}', '', false, 2)::text from ctx where k = 'fam25';
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2502');
do $$ begin
  if public.accept_shift_request((select v::uuid from ctx where k = 'req25b'))->>'result' <> 'accepted' then raise exception 'FAIL accept without first-to-accept'; end if;
  if (select count(*) from shifts) <> 1 then raise exception 'FAIL booked before the parent picked'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2501');
do $$ begin
  begin
    perform public.book_shift_request((select v::uuid from ctx where k = 'req25b'), '00000000-0000-0000-0000-0000000a2503');
    raise exception 'FAIL booked a sitter who didn''t answer';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  perform public.book_shift_request((select v::uuid from ctx where k = 'req25b'), '00000000-0000-0000-0000-0000000a2502');
  if (select status from shift_requests where id = (select v::uuid from ctx where k = 'req25b')) <> 'filled' then raise exception 'FAIL pick not filled'; end if;
  if (select status from shift_request_sitters where request_id = (select v::uuid from ctx where k = 'req25b') and sitter_id = '00000000-0000-0000-0000-0000000a2503') <> 'filled' then
    raise exception 'FAIL other sitter not told after the pick'; end if;
end $$;

-- An offer: Tia accepts Vi's offer, which books only the offered hour; "Look elsewhere" passes on another
insert into ctx select 'req25c', public.create_shift_request(v::uuid, now() + interval '4 days', now() + interval '4 days 5 hours',
  array['00000000-0000-0000-0000-0000000a2503']::uuid[])::text from ctx where k = 'fam25';
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2503');
select public.offer_shift_request(v::uuid, (select starts_at from shift_requests where id = v::uuid), (select starts_at + interval '1 hour' from shift_requests where id = v::uuid))
  from ctx where k = 'req25c';
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2501');
do $$ declare sid uuid; begin
  sid := public.book_shift_request((select v::uuid from ctx where k = 'req25c'), '00000000-0000-0000-0000-0000000a2503');
  if (select ends_at - starts_at from shifts where id = sid) <> interval '1 hour' then raise exception 'FAIL offer booked the whole window'; end if;
end $$;

-- Time off: Vi gives up one day of a three-day time off to take a shift (S20 "Accept all and cancel my time off")
insert into ctx select 'req25d', public.create_shift_request(v::uuid, (current_date + 10)::timestamptz + interval '18 hours', (current_date + 10)::timestamptz + interval '22 hours',
  array['00000000-0000-0000-0000-0000000a2503']::uuid[])::text from ctx where k = 'fam25';
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2503');
insert into sitter_time_off (sitter_id, starts, ends, note) values (auth.uid(), current_date + 9, current_date + 11, 'Trip');
do $$ begin
  if public.accept_shift_request((select v::uuid from ctx where k = 'req25d'), current_date + 10, current_date + 10)->>'result' <> 'booked' then raise exception 'FAIL accept with time off'; end if;
  if (select string_agg(starts || '..' || ends, ',' order by starts) from sitter_time_off) <> (current_date + 9) || '..' || (current_date + 9) || ',' || (current_date + 11) || '..' || (current_date + 11) then
    raise exception 'FAIL time off not split: %', (select string_agg(starts || '..' || ends, ',' order by starts) from sitter_time_off); end if;
end $$;

-- Cancelled and expired requests can't be taken; expiry pushes the parent
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2501');
insert into ctx select 'req25e', public.create_shift_request(v::uuid, now() + interval '5 days', now() + interval '5 days 2 hours',
  array['00000000-0000-0000-0000-0000000a2502']::uuid[])::text from ctx where k = 'fam25';
select public.cancel_shift_request(v::uuid) from ctx where k = 'req25e';
insert into ctx select 'req25f', public.create_shift_request(v::uuid, now() + interval '6 days', now() + interval '6 days 2 hours',
  array['00000000-0000-0000-0000-0000000a2502']::uuid[])::text from ctx where k = 'fam25';
reset role;
update shift_requests set expires_at = now() - interval '1 minute' where id = (select v::uuid from ctx where k = 'req25f');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2502');
do $$ begin
  if public.accept_shift_request((select v::uuid from ctx where k = 'req25e'))->>'result' <> 'cancelled' then raise exception 'FAIL took a cancelled request'; end if;
  if public.accept_shift_request((select v::uuid from ctx where k = 'req25f'))->>'result' <> 'expired' then raise exception 'FAIL took an expired request'; end if;
  if (select status from shift_requests where id = (select v::uuid from ctx where k = 'req25f')) <> 'expired' then raise exception 'FAIL not marked expired'; end if;
end $$;
reset role;
do $$ begin
  if (select count(*) from net.sent where body @> '[{"to": "ExponentPushToken[tia-phone]", "title": "Your shift request expired"}]') <> 1 then raise exception 'FAIL expiry push'; end if;
end $$;

-- Block booking (migration 20): a sitter missing a must-have can't take the shift
update families set requirement_mode = 'block' where id = (select v::uuid from ctx where k = 'fam25');
insert into family_requirements (family_id, key, title, level) select v::uuid, 'non_smoker', 'Non-smoker', 'must' from ctx where k = 'fam25';
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2501');
insert into ctx select 'req25g', public.create_shift_request(v::uuid, now() + interval '7 days', now() + interval '7 days 2 hours',
  array['00000000-0000-0000-0000-0000000a2502']::uuid[])::text from ctx where k = 'fam25';
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2502');
do $$ begin
  perform public.accept_shift_request((select v::uuid from ctx where k = 'req25g'));
  raise exception 'FAIL blocked sitter took the shift';
exception when others then if sqlerrm not like '%must-have%' then raise exception 'FAIL block: %', sqlerrm; end if; end $$;
do $$ begin
  if (select status from shift_requests where id = (select v::uuid from ctx where k = 'req25g')) <> 'open' then raise exception 'FAIL blocked accept changed the request'; end if;
end $$;
reset role;

-- 26. Shift log reactions and photo requests (migration 26, P77). Lia Hart (parent), Kit Hart (second parent),
-- Bo Vance (sitter), the stranger: parents love photo entries (not other logs) and remove only their own heart;
-- the sitter reads the hearts but can't add one; "Ask for a photo" only from the family's parents, on a live shift,
-- once per 10 minutes; nobody writes photo_requests directly; pushes go to the sitter.
reset role;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000a2601', 'lia-parent@example.com'),
  ('00000000-0000-0000-0000-0000000a2602', 'bo-sitter@example.com'),
  ('00000000-0000-0000-0000-0000000a2603', 'kit-parent@example.com');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2601');
insert into ctx values ('fam26', (select public.create_family('The Hart family', 'Lia Hart')::text));
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2602');
select public.register_push_token('ExponentPushToken[bo-phone]', 'ios');
reset role;
update profiles set full_name = 'Bo Vance' where id = '00000000-0000-0000-0000-0000000a2602';
update profiles set full_name = 'Kit Hart' where id = '00000000-0000-0000-0000-0000000a2603';
insert into family_parents (family_id, user_id) select v::uuid, '00000000-0000-0000-0000-0000000a2603' from ctx where k = 'fam26';
insert into family_sitters (family_id, sitter_id, status) select v::uuid, '00000000-0000-0000-0000-0000000a2602', 'active' from ctx where k = 'fam26';
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
  select v::uuid, '00000000-0000-0000-0000-0000000a2602', now() - interval '1 hour', now() + interval '3 hours', '00000000-0000-0000-0000-0000000a2601' from ctx where k = 'fam26';
insert into ctx select 'shift26', id::text from shifts where family_id = (select v::uuid from ctx where k = 'fam26');
set role authenticated;
-- Ask for a photo before the shift is live: refused
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2601');
do $$ begin
  perform public.ask_for_photo((select v::uuid from ctx where k = 'shift26'));
  raise exception 'FAIL asked for a photo before clock-in';
exception when others then if sqlerrm not like '%isn''t live%' then raise exception 'FAIL before clock-in: %', sqlerrm; end if; end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2602');
select public.clock_in((select v::uuid from ctx where k = 'shift26'));
insert into logs (shift_id, author_id, kind, data, photo_path)
  select v::uuid, auth.uid(), 'photo', '{"caption":"Snack break on the bench"}', v || '/p1.jpg' from ctx where k = 'shift26';
insert into logs (shift_id, author_id, kind, data) select v::uuid, auth.uid(), 'food', '{"meal":"snack"}' from ctx where k = 'shift26';
insert into ctx select 'photo26', id::text from logs where kind = 'photo' and shift_id = (select v::uuid from ctx where k = 'shift26');
insert into ctx select 'food26', id::text from logs where kind = 'food' and shift_id = (select v::uuid from ctx where k = 'shift26');
-- The sitter can't love her own photo
do $$ begin
  insert into log_reactions (log_id, parent_id) select v::uuid, auth.uid() from ctx where k = 'photo26';
  raise exception 'FAIL sitter added a heart';
exception when insufficient_privilege then null; end $$;
reset role;
delete from net.sent;
set role authenticated;
-- Lia loves the photo (push to Bo), can't love the snack or love as Kit
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2601');
insert into log_reactions (log_id, parent_id) select v::uuid, auth.uid() from ctx where k = 'photo26';
do $$ begin
  if (select shift_id::text from log_reactions) <> (select v from ctx where k = 'shift26') then raise exception 'FAIL reaction shift_id not filled'; end if;
  begin
    insert into log_reactions (log_id, parent_id) select v::uuid, auth.uid() from ctx where k = 'food26';
    raise exception 'FAIL loved a food entry';
  exception when insufficient_privilege then null; end;
  begin
    insert into log_reactions (log_id, parent_id) select v::uuid, '00000000-0000-0000-0000-0000000a2603' from ctx where k = 'photo26';
    raise exception 'FAIL loved as another parent';
  exception when insufficient_privilege then null; end;
end $$;
-- Kit (second parent) sees Lia's heart, adds his own, can't remove hers
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2603');
insert into log_reactions (log_id, parent_id) select v::uuid, auth.uid() from ctx where k = 'photo26';
do $$ declare n int; begin
  if (select count(*) from log_reactions) <> 2 then raise exception 'FAIL second parent cannot see the hearts'; end if;
  delete from log_reactions where parent_id = '00000000-0000-0000-0000-0000000a2601';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL removed another parent''s heart'; end if;
end $$;
delete from log_reactions where parent_id = auth.uid();
-- The sitter reads the heart; the stranger and the other family's parent see nothing and can't love or ask
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2602');
do $$ begin
  if (select count(*) from log_reactions) <> 1 then raise exception 'FAIL sitter cannot see the heart'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin
  if (select count(*) from log_reactions) <> 0 then raise exception 'FAIL stranger sees hearts'; end if;
  begin
    insert into log_reactions (log_id, parent_id) select v::uuid, auth.uid() from ctx where k = 'photo26';
    raise exception 'FAIL stranger loved a photo';
  exception when insufficient_privilege then null; end;
  begin
    perform public.ask_for_photo((select v::uuid from ctx where k = 'shift26'));
    raise exception 'FAIL stranger asked for a photo';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
end $$;
-- Ask for a photo: the sitter can't ask herself; Lia asks once, again within 10 minutes is refused (also for Kit)
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2602');
do $$ begin
  perform public.ask_for_photo((select v::uuid from ctx where k = 'shift26'));
  raise exception 'FAIL sitter asked for a photo';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2601');
select public.ask_for_photo((select v::uuid from ctx where k = 'shift26'));
do $$ begin
  begin
    perform public.ask_for_photo((select v::uuid from ctx where k = 'shift26'));
    raise exception 'FAIL asked twice within 10 minutes';
  exception when others then if sqlerrm not like 'You asked % min ago%' then raise exception 'FAIL rate limit: %', sqlerrm; end if; end;
  begin
    insert into photo_requests (shift_id, parent_id) select v::uuid, auth.uid() from ctx where k = 'shift26';
    raise exception 'FAIL wrote photo_requests directly';
  exception when insufficient_privilege then null; end;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2603');
do $$ begin
  perform public.ask_for_photo((select v::uuid from ctx where k = 'shift26'));
  raise exception 'FAIL second parent asked within 10 minutes';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2602');
do $$ begin
  if (select count(*) from photo_requests) <> 1 then raise exception 'FAIL sitter cannot see the request'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin
  if (select count(*) from photo_requests) <> 0 then raise exception 'FAIL stranger sees photo requests'; end if;
end $$;
reset role;
-- Pushes: Lia's heart, Kit's heart and Lia's ask, all to Bo's phone only
do $$ begin
  if (select count(*) from net.sent) <> 3 then raise exception 'FAIL expected 3 pushes to the sitter, got %', (select count(*) from net.sent); end if;
  if exists (select 1 from net.sent, jsonb_array_elements(body) m where m->>'to' <> 'ExponentPushToken[bo-phone]') then raise exception 'FAIL push went to someone else'; end if;
  if not exists (select 1 from net.sent, jsonb_array_elements(body) m where m->>'title' = 'Lia loved your photo' and m->>'body' = 'Snack break on the bench') then
    raise exception 'FAIL love push text'; end if;
  if not exists (select 1 from net.sent, jsonb_array_elements(body) m where m->>'title' = 'Lia asked for a photo update') then raise exception 'FAIL ask push text'; end if;
end $$;
-- Ten minutes later she can ask again; after clock-out nobody can
update photo_requests set created_at = now() - interval '11 minutes';
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2601');
select public.ask_for_photo((select v::uuid from ctx where k = 'shift26'));
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2602');
select public.clock_out((select v::uuid from ctx where k = 'shift26'), '');
reset role;
update photo_requests set created_at = now() - interval '1 hour';
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2601');
do $$ begin
  perform public.ask_for_photo((select v::uuid from ctx where k = 'shift26'));
  raise exception 'FAIL asked for a photo after clock-out';
exception when others then if sqlerrm not like '%isn''t live%' then raise exception 'FAIL after clock-out: %', sqlerrm; end if; end $$;
reset role;

-- 27. No double booking: overlapping shifts for one sitter are refused; back-to-back and cancelled ones are fine.
reset role;
do $$
declare f uuid; sid uuid; a uuid; d timestamptz := date_trunc('day', now()) + interval '30 days';
begin
  select family_id, sitter_id into f, sid from shifts where id = (select v::uuid from ctx where k = 'shift26');
  insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by) values (f, sid, d + interval '10 hours', d + interval '12 hours', sid) returning id into a;
  begin
    insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by) values (f, sid, d + interval '11 hours', d + interval '13 hours', sid);
    raise exception 'FAIL overlapping shift was booked';
  exception when others then if sqlerrm not like 'already booked then%' then raise exception 'FAIL double booking: %', sqlerrm; end if; end;
  insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by) values (f, sid, d + interval '12 hours', d + interval '14 hours', sid);
  update shifts set status = 'cancelled' where id = a;
  insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by) values (f, sid, d + interval '10 hours', d + interval '12 hours', sid);
  begin
    update shifts set status = 'scheduled' where id = a;
    raise exception 'FAIL brought back a cancelled shift on top of another';
  exception when others then if sqlerrm not like 'already booked then%' then raise exception 'FAIL restore: %', sqlerrm; end if; end;
end $$;

-- 28. Invite links: the public page works by a long random token only (never by the 6-digit code) and shows only
-- first names for a usable invite; sending to an existing sitter's email pushes her once and lists it on her Home;
-- an invite with an email only opens for that email.
reset role;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000a2811', 'rosa28@example.com'), ('00000000-0000-0000-0000-0000000a2812', 'new28@example.com');
insert into profiles (id, full_name, role) values ('00000000-0000-0000-0000-0000000a2811', 'Rosa Diaz', 'sitter') on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;
insert into push_tokens (user_id, token, platform) values ('00000000-0000-0000-0000-0000000a2811', 'ExponentPushToken[rosa28-phone]', 'ios');
delete from net.sent;
grant select on ctx to anon;
do $$ begin
  -- every invite (old ones too) has its own 40-character token
  if exists (select 1 from invites where link_token !~ '^[0-9a-f]{40}$') then raise exception 'FAIL link tokens'; end if;
  if (select count(distinct link_token) from invites) <> (select count(*) from invites) then raise exception 'FAIL tokens not unique'; end if;
end $$;
insert into ctx select 'tok_used', link_token from invites where code = (select v from ctx where k = 'code');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into ctx values ('code28', (select public.create_invite((select v::uuid from ctx where k='fam'), 'Rosa')));
insert into ctx select 'tok28', link_token from invites where code = (select v from ctx where k = 'code28');
insert into ctx select 'inv28', id::text from invites where code = (select v from ctx where k = 'code28');
update invites set sitter_email = '  Rosa28@Example.com ' where code = (select v from ctx where k = 'code28');
do $$ begin
  if (select sitter_email from invites where code = (select v from ctx where k = 'code28')) <> 'rosa28@example.com' then raise exception 'FAIL email not tidied'; end if;
  begin
    update invites set sitter_email = 'not an email' where code = (select v from ctx where k = 'code28');
    raise exception 'FAIL bad email saved';
  exception when check_violation then null; end;
end $$;
-- Anyone with the link (anon): the family, Jen's first name, kids' first names. Nothing by the 6-digit code.
reset role;
select pg_temp.as_user('');
set role anon;
do $$ declare p jsonb := public.invite_link_preview((select v from ctx where k = 'tok28')); begin
  if p->>'status' <> 'open' then raise exception 'FAIL anon preview status %', p; end if;
  if p->>'family_name' <> 'The Lee family' or p->>'invited_by' <> 'Jen' or p->>'invited_by_initials' <> 'JL' then raise exception 'FAIL anon preview names %', p; end if;
  if p->'kids'->0->>'name' <> 'Ava' or (p->'kids'->0) ? 'birthdate' then raise exception 'FAIL anon preview kids %', p; end if;
  if p ? 'rate' or p ? 'family_id' or p ? 'code' then raise exception 'FAIL anon preview says too much %', p; end if;
  -- the 6-digit code finds nothing
  p := public.invite_link_preview((select v from ctx where k = 'code28'));
  if p <> '{"status": "not_found"}'::jsonb then raise exception 'FAIL anon looked up a code %', p; end if;
  -- an unknown token: status only
  p := public.invite_link_preview(repeat('ab', 20));
  if p <> '{"status": "not_found"}'::jsonb then raise exception 'FAIL unknown token %', p; end if;
  p := public.invite_link_preview((select v from ctx where k = 'tok_used'));
  if p <> '{"status": "used"}'::jsonb then raise exception 'FAIL used link %', p; end if;
  begin
    perform 1 from invites;
    raise exception 'FAIL anon reads invites';
  exception when insufficient_privilege then null; end;
  begin
    perform public.invite_code_for_link((select v from ctx where k = 'tok28'));
    raise exception 'FAIL anon turns a link into a code';
  exception when insufficient_privilege then null; end;
  begin
    perform public.preview_invite((select v from ctx where k = 'code28'));
    raise exception 'FAIL anon previews by code';
  exception when insufficient_privilege then null; end;
  begin
    perform public.invite_sent((select v::uuid from ctx where k = 'inv28'));
    raise exception 'FAIL anon marks invites sent';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
update invites set expires_at = now() - interval '1 minute' where code = (select v from ctx where k = 'code28');
set role anon;
do $$ begin
  if public.invite_link_preview((select v from ctx where k = 'tok28')) <> '{"status": "expired"}'::jsonb then raise exception 'FAIL expired link'; end if;
end $$;
reset role;
update invites set expires_at = now() + interval '7 days' where code = (select v from ctx where k = 'code28');
set role authenticated;
-- Someone else can't send Jen's invite
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin
  perform public.invite_sent((select v::uuid from ctx where k = 'inv28'));
  raise exception 'FAIL stranger sent an invite';
exception when others then if sqlerrm not like 'not a parent%' then raise exception 'FAIL invite_sent: %', sqlerrm; end if; end $$;
-- Signed in, the link gives the code; but this invite is Rosa's: the stranger can't open, decline or accept it
do $$ declare r jsonb := public.invite_code_for_link((select v from ctx where k = 'tok28')); begin
  if r->>'status' <> 'open' or r->>'code' <> (select v from ctx where k = 'code28') then raise exception 'FAIL code for link %', r; end if;
  if public.invite_code_for_link('274139') <> '{"status": "not_found"}'::jsonb then raise exception 'FAIL code passed as a link'; end if;
  begin
    perform public.accept_invite((select v from ctx where k = 'code28'), 'Stranger');
    raise exception 'FAIL accepted someone else''s invite';
  exception when others then
    if sqlerrm <> 'This invite was sent to r•••@example.com. Sign in with that email, or ask Jen to resend it.' then raise exception 'FAIL email lock: %', sqlerrm; end if;
  end;
  begin
    perform public.preview_invite((select v from ctx where k = 'code28'));
    raise exception 'FAIL previewed someone else''s invite';
  exception when others then if sqlerrm not like 'This invite was sent to%' then raise exception 'FAIL preview lock: %', sqlerrm; end if; end;
  begin
    perform public.decline_invite((select v from ctx where k = 'code28'));
    raise exception 'FAIL declined someone else''s invite';
  exception when others then if sqlerrm not like 'This invite was sent to%' then raise exception 'FAIL decline lock: %', sqlerrm; end if; end;
end $$;
-- Jen sends it: Rosa (an existing sitter) gets one push that opens /i/<token>; sending again doesn't repeat it
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
select public.invite_sent((select v::uuid from ctx where k = 'inv28'));
select public.invite_sent((select v::uuid from ctx where k = 'inv28'));
reset role;
do $$ declare n int; m jsonb; begin
  select count(*) into n from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[rosa28-phone]';
  if n <> 1 then raise exception 'FAIL invite push count %', n; end if;
  select x into m from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[rosa28-phone]';
  if m->>'title' <> 'New family invite' or m->>'body' <> 'The Lee family invited you to sit for Ava. Tap to review.'
     or m->'data'->>'url' <> '/i/' || (select v from ctx where k = 'tok28') then raise exception 'FAIL invite push text %', m; end if;
  if (select sent_at from invites where code = (select v from ctx where k = 'code28')) is null then raise exception 'FAIL sent_at'; end if;
end $$;
-- Her Home lists it; nobody else's does; she can open it
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2811');
do $$ declare l jsonb := public.my_invites(); begin
  if jsonb_array_length(l) <> 1 or l->0->>'link_token' <> (select v from ctx where k = 'tok28') or l->0->>'family_name' <> 'The Lee family' or l->0->>'kids' <> 'Ava' or (l->0) ? 'code' then
    raise exception 'FAIL my_invites %', l; end if;
  if public.preview_invite((select v from ctx where k = 'code28'))->>'family_name' <> 'The Lee family' then raise exception 'FAIL Rosa preview'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
do $$ begin if jsonb_array_length(public.my_invites()) <> 0 then raise exception 'FAIL Maya sees Rosa''s invite'; end if; end $$;
-- An email that doesn't belong to a sitter yet: no push (she signs up from the link instead)
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into ctx values ('code28b', (select public.create_invite((select v::uuid from ctx where k='fam'), 'Nina')));
update invites set sitter_email = 'new28@example.com' where code = (select v from ctx where k = 'code28b');
select public.invite_sent((select id from invites where code = (select v from ctx where k = 'code28b')));
reset role;
do $$ begin
  if (select count(*) from net.sent) <> 1 then raise exception 'FAIL pushed an invite to someone who isn''t a sitter'; end if;
end $$;
-- The new account with that email can accept it (an invite without an email keeps working for anyone: scenario 1)
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2812');
select public.accept_invite((select v from ctx where k = 'code28b'), 'Nina Park');
-- Once Rosa answers (declines), it leaves her Home
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2811');
select public.decline_invite((select v from ctx where k = 'code28'));
do $$ begin if jsonb_array_length(public.my_invites()) <> 0 then raise exception 'FAIL declined invite still listed'; end if; end $$;
reset role;

-- 29. Sitter growth (migration 29). Maya invites a family she already sits for (babybadger.app/f/<token>): only she
-- sees her invites; anyone with the link sees her first name and initial only; the parent (Kim) confirms access and
-- that makes a normal invite locked to Maya's email, marks the referral joined and pushes Maya. "Be found later" is
-- hers alone: parents of her families can't read it.
reset role;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000a2901', 'kim29@example.com');
insert into push_tokens (user_id, token, platform) values ('00000000-0000-0000-0000-00000000000b', 'ExponentPushToken[maya29-phone]', 'ios') on conflict do nothing;
update profiles set full_name = 'Maya Rodriguez' where id = '00000000-0000-0000-0000-00000000000b';
delete from net.sent;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
insert into family_referrals (parent_name, family_name, email) values (' Dana ', 'The Kim family', ' Dana@Example.com ');
insert into ctx select 'ref29', id::text from family_referrals where family_name = 'The Kim family';
insert into ctx select 'tok29', token from family_referrals where family_name = 'The Kim family';
do $$ declare r family_referrals; begin
  select * into r from family_referrals where id = (select v::uuid from ctx where k = 'ref29');
  if r.parent_name <> 'Dana' or r.email <> 'dana@example.com' or r.token !~ '^[0-9a-f]{40}$' or r.sitter_id <> auth.uid() then raise exception 'FAIL referral row %', r; end if;
  if r.expires_at < now() + interval '29 days' or r.expires_at > now() + interval '31 days' then raise exception 'FAIL referral expiry %', r.expires_at; end if;
  begin
    update family_referrals set expires_at = now() + interval '1 year' where id = r.id;
    raise exception 'FAIL sitter set her own expiry';
  exception when insufficient_privilege then null; end;
  begin
    update family_referrals set joined_at = now() where id = r.id;
    raise exception 'FAIL sitter marked joined';
  exception when insufficient_privilege then null; end;
  begin
    insert into family_referrals (sitter_id, parent_name) values ('00000000-0000-0000-0000-00000000000c', 'x');
    raise exception 'FAIL insert for another sitter';
  exception when insufficient_privilege then null; end;
  -- 20 open at most
  insert into family_referrals (parent_name) select 'Cap ' || g from generate_series(1, 19) g;
  begin
    insert into family_referrals (parent_name) values ('Cap 20');
    raise exception 'FAIL more than 20 open invites';
  exception when others then if sqlerrm not like 'You have 20 open family invites%' then raise exception 'FAIL cap: %', sqlerrm; end if; end;
  update family_referrals set cancelled_at = now() where parent_name like 'Cap %';
  if jsonb_array_length(public.my_family_referrals()) <> 1 or public.my_family_referrals()->0->>'status' <> 'open' then raise exception 'FAIL my list %', public.my_family_referrals(); end if;
end $$;
-- Parents and strangers: can't read Maya's invites or make their own
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ begin
  if (select count(*) from family_referrals) <> 0 then raise exception 'FAIL Jen reads Maya''s family invites'; end if;
  begin
    insert into family_referrals (parent_name) values ('Not a sitter');
    raise exception 'FAIL a parent made a family invite';
  exception when insufficient_privilege then null; end;
  if jsonb_array_length(public.my_family_referrals()) <> 0 then raise exception 'FAIL Jen''s list'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin
  if (select count(*) from family_referrals) <> 0 then raise exception 'FAIL stranger reads family invites'; end if;
  update family_referrals set cancelled_at = now();
  perform public.resend_family_referral((select v::uuid from ctx where k = 'ref29'));
  raise exception 'FAIL stranger resent';
exception when others then if sqlerrm not like 'invite not found%' then raise exception 'FAIL stranger: %', sqlerrm; end if; end $$;
-- Anyone with the link: Maya's first name and initial, nothing else
reset role;
select pg_temp.as_user('');
set role anon;
do $$ declare p jsonb := public.family_referral_preview((select v from ctx where k = 'tok29')); begin
  if p->>'status' <> 'open' or p->>'sitter_first' <> 'Maya' or p->>'sitter_initial' <> 'R' or p->>'initials' <> 'MR' or (p->>'mine')::boolean then raise exception 'FAIL family link preview %', p; end if;
  if p ? 'family_name' or p ? 'parent_name' or p ? 'email' or p ? 'sitter_id' or p::text like '%Kim%' or p::text like '%Rodriguez%' then raise exception 'FAIL family link says too much %', p; end if;
  if public.family_referral_preview(repeat('ab', 20)) <> '{"status": "not_found"}'::jsonb then raise exception 'FAIL unknown family link'; end if;
  if public.family_referral_preview('Maya') <> '{"status": "not_found"}'::jsonb then raise exception 'FAIL bad family link'; end if;
  begin perform 1 from family_referrals; raise exception 'FAIL anon reads family invites'; exception when insufficient_privilege then null; end;
  begin perform public.my_family_referrals(); raise exception 'FAIL anon lists'; exception when insufficient_privilege then null; end;
  begin perform public.claim_family_referral((select v from ctx where k = 'tok29'), null); raise exception 'FAIL anon claims'; exception when insufficient_privilege then null; end;
  begin perform public.my_found_later(); raise exception 'FAIL anon found later'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set role authenticated;
-- Jen can't connect Maya again while she sits for the Lees (scenario 3 removed her; she's back for this check)
reset role;
update family_sitters set status = 'active' where sitter_id = '00000000-0000-0000-0000-00000000000b' and family_id = (select v::uuid from ctx where k = 'fam');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ begin
  perform public.claim_family_referral((select v from ctx where k = 'tok29'), (select v::uuid from ctx where k = 'fam'));
  raise exception 'FAIL connected an existing sitter twice';
exception when others then if sqlerrm <> 'already_connected' then raise exception 'FAIL already connected: %', sqlerrm; end if; end $$;
reset role;
update family_sitters set status = 'removed' where sitter_id = '00000000-0000-0000-0000-00000000000b' and family_id = (select v::uuid from ctx where k = 'fam');
set role authenticated;
-- Maya can't use her own link
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
do $$ begin
  perform public.claim_family_referral((select v from ctx where k = 'tok29'), (select v::uuid from ctx where k = 'fam'));
  raise exception 'FAIL sitter claimed her own link';
exception when others then if sqlerrm not like 'not a parent%' then raise exception 'FAIL own link: %', sqlerrm; end if; end $$;
-- Kim signs up, makes a family with a kid, confirms what Maya may see
select pg_temp.as_user('00000000-0000-0000-0000-0000000a2901');
insert into ctx values ('fam29', (select public.create_family('The Kim family', 'Dana Kim')::text));
insert into kids (family_id, name) select v::uuid, 'Noa' from ctx where k = 'fam29';
do $$ begin
  -- not her family
  perform public.claim_family_referral((select v from ctx where k = 'tok29'), (select v::uuid from ctx where k = 'fam'));
  raise exception 'FAIL claimed for someone else''s family';
exception when others then if sqlerrm not like 'not a parent%' then raise exception 'FAIL other family: %', sqlerrm; end if; end $$;
insert into ctx select 'claim29', public.claim_family_referral((select v from ctx where k = 'tok29'), (select v::uuid from ctx where k = 'fam29'), null, false, true, true, 22.5, 'per_shift')::text;
insert into ctx select 'code29', code from invites where id = ((select v::jsonb from ctx where k = 'claim29')->>'invite_id')::uuid;
do $$ declare c jsonb := (select v::jsonb from ctx where k = 'claim29'); inv invites; begin
  select * into inv from invites where id = (c->>'invite_id')::uuid;
  if inv.family_id <> (select v::uuid from ctx where k = 'fam29') or inv.sitter_email <> 'maya@example.com' or inv.sitter_name <> 'Maya'
     or inv.sent_at is null or inv.rate <> 22.5 or inv.pay_schedule <> 'per_shift' or inv.can_drive or not inv.can_trip or inv.link_token <> c->>'link_token' then
    raise exception 'FAIL claimed invite %', row_to_json(inv); end if;
  if (select count(*) from family_referrals) <> 0 then raise exception 'FAIL Kim reads the referral'; end if;
  if exists (select 1 from family_sitters where family_id = inv.family_id) then raise exception 'FAIL linked before Maya accepted'; end if;
  begin
    perform public.claim_family_referral((select v from ctx where k = 'tok29'), (select v::uuid from ctx where k = 'fam29'));
    raise exception 'FAIL claimed twice';
  exception when others then if sqlerrm <> 'used' then raise exception 'FAIL claim twice: %', sqlerrm; end if; end;
end $$;
reset role;
do $$ declare m jsonb; c jsonb := (select v::jsonb from ctx where k = 'claim29'); begin
  if (select count(*) from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[maya29-phone]') <> 1 then raise exception 'FAIL Maya push count'; end if;
  select x into m from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[maya29-phone]';
  if m->>'title' <> 'The Kim family joined BabyBadger' or m->'data'->>'url' <> '/i/' || (c->>'link_token') then raise exception 'FAIL joined push %', m; end if;
  if (select joined_family_id from family_referrals where id = (select v::uuid from ctx where k = 'ref29')) <> (select v::uuid from ctx where k = 'fam29') then raise exception 'FAIL referral not joined'; end if;
end $$;
set role anon;
do $$ begin if public.family_referral_preview((select v from ctx where k = 'tok29')) <> '{"status": "used"}'::jsonb then raise exception 'FAIL used family link'; end if; end $$;
reset role;
set role authenticated;
-- Maya: her list shows the family joined with its invite; it's in her Home; she accepts the usual way
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
do $$ declare l jsonb := (select jsonb_agg(x) from jsonb_array_elements(public.my_family_referrals()) x where x->>'family_name' = 'The Kim family'); c jsonb := (select v::jsonb from ctx where k = 'claim29'); begin
  if l->0->>'status' <> 'used' or l->0->>'joined_family_name' <> 'The Kim family' or l->0->>'invite_token' <> c->>'link_token' or (l->0->>'connected')::boolean then raise exception 'FAIL joined in list %', l; end if;
  if not exists (select 1 from jsonb_array_elements(public.my_invites()) x where x->>'link_token' = c->>'link_token') then raise exception 'FAIL not in Maya''s Home'; end if;
  perform public.accept_invite((select v from ctx where k = 'code29'), 'Maya Rodriguez');
  l := (select jsonb_agg(x) from jsonb_array_elements(public.my_family_referrals()) x where x->>'family_name' = 'The Kim family');
  if not (l->0->>'connected')::boolean or l->0->>'invite_token' is not null then raise exception 'FAIL after accept %', l; end if;
  if (select status from family_sitters where family_id = (select v::uuid from ctx where k = 'fam29') and sitter_id = auth.uid()) <> 'needs_consent' then raise exception 'FAIL Maya not waiting to sign'; end if;
end $$;
-- Expired links: status only; Resend brings one back for 30 days
insert into family_referrals (parent_name) values ('Old');
reset role;
update family_referrals set expires_at = now() - interval '1 day' where parent_name = 'Old';
insert into ctx select 'tok29old', token from family_referrals where parent_name = 'Old';
set role anon;
do $$ begin if public.family_referral_preview((select v from ctx where k = 'tok29old')) <> '{"status": "expired"}'::jsonb then raise exception 'FAIL expired family link'; end if; end $$;
reset role;
set role authenticated;
do $$ begin
  if public.resend_family_referral((select id from family_referrals where parent_name = 'Old')) < now() + interval '29 days' then raise exception 'FAIL resend'; end if;
  if (select x->>'status' from jsonb_array_elements(public.my_family_referrals()) x where x->>'parent_name' = 'Old') <> 'open' then raise exception 'FAIL resent status'; end if;
end $$;
-- Be found later: off by default, hers alone
do $$ declare f jsonb; begin
  if public.my_found_later() <> '{"at": null, "on": false}'::jsonb then raise exception 'FAIL found later default %', public.my_found_later(); end if;
  f := public.set_found_later(true);
  if not (f->>'on')::boolean or f->>'at' is null then raise exception 'FAIL found later on %', f; end if;
  begin
    update sitter_profiles set discoverable_later = false where sitter_id = auth.uid();
    raise exception 'FAIL direct write of found later';
  exception when insufficient_privilege then null; end;
  -- her own profile still reads and saves as before
  insert into sitter_profiles (sitter_id, bio) values (auth.uid(), 'Bilingual') on conflict (sitter_id) do update set bio = excluded.bio;
  if (select bio from sitter_profiles where sitter_id = auth.uid()) <> 'Bilingual' then raise exception 'FAIL own profile save'; end if;
  if not (public.my_found_later()->>'on')::boolean then raise exception 'FAIL profile save turned found later off'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ begin
  if (select bio from sitter_profiles where sitter_id = '00000000-0000-0000-0000-00000000000b') <> 'Bilingual' then raise exception 'FAIL Jen reads Maya''s profile'; end if;
  begin
    perform discoverable_later from sitter_profiles;
    raise exception 'FAIL a parent reads found later';
  exception when insufficient_privilege then null; end;
  begin
    perform 1 from sitter_profiles where discoverable_later;
    raise exception 'FAIL a parent filters on found later';
  exception when insufficient_privilege then null; end;
  begin
    perform public.set_found_later(true);
    raise exception 'FAIL a parent set found later';
  exception when others then if sqlerrm <> 'only sitters' then raise exception 'FAIL parent found later: %', sqlerrm; end if; end;
end $$;
reset role;

-- 30. Family members (migration 30): up to 4 adults; parents run the family, helpers (grandma) watch and message.
--     Bea runs the Bell family; Sia is their signed sitter on a live shift; Sue (grandma) joins as a helper, Ben (dad)
--     as a parent, Ada (aunt) as a helper. A 5th is refused; the last parent stays; the email lock holds.
reset role;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000a3001', 'bea30@example.com'),
  ('00000000-0000-0000-0000-0000000a3002', 'sia30@example.com'),
  ('00000000-0000-0000-0000-0000000a3003', 'sue30@example.com'),
  ('00000000-0000-0000-0000-0000000a3004', 'ben30@example.com'),
  ('00000000-0000-0000-0000-0000000a3005', 'ada30@example.com'),
  ('00000000-0000-0000-0000-0000000a3006', 'ivy30@example.com'),
  ('00000000-0000-0000-0000-0000000a3007', 'wrong30@example.com');
create or replace function pg_temp.must_fail(q text, pat text) returns void language plpgsql as $$
begin
  execute q;
  raise exception 'FAIL should have failed: %', q;
exception when others then
  if sqlerrm like 'FAIL%' then raise; end if;
  if sqlerrm not like pat then raise exception 'FAIL % gave "%" (wanted %)', q, sqlerrm, pat; end if;
end $$;
delete from net.sent;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3001');
insert into ctx values ('fam30', (select public.create_family('The Bell family', 'Bea Bell')::text));
insert into kids (family_id, name, avoid_foods) select v::uuid, 'Kit', 'eggs' from ctx where k = 'fam30';
insert into care_items (family_id, type, title) select v::uuid, 'other', 'Feed the cat' from ctx where k = 'fam30';
insert into ctx values ('code30', (select public.create_invite((select v::uuid from ctx where k = 'fam30'), 'Sia')));
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3002');
select public.accept_invite((select v from ctx where k = 'code30'), 'Sia Moon');
select public.sign_consent((select v::uuid from ctx where k = 'fam30'), 'Sia Moon', 'notice-1.0', 'terms-1.0');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3001');
with x as (
  insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
  select v::uuid, '00000000-0000-0000-0000-0000000a3002', now() - interval '10 minutes', now() + interval '3 hours', auth.uid() from ctx where k = 'fam30'
  returning id) insert into ctx select 'shift30', id from x;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3002');
select public.clock_in((select v::uuid from ctx where k = 'shift30'));
with x as (
  insert into logs (shift_id, author_id, kind, data) select v::uuid, auth.uid(), 'photo', '{"caption":"Blocks"}' from ctx where k = 'shift30' returning id)
insert into ctx select 'log30', id from x;
-- the old creator row is a parent
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3001');
do $$ begin
  if (select role from family_parents where user_id = auth.uid()) <> 'parent' then raise exception 'FAIL creator is not a parent'; end if;
  if not public.is_parent_of((select v::uuid from ctx where k = 'fam30')) then raise exception 'FAIL creator is_parent_of'; end if;
end $$;
-- Bea invites Sue (grandma) as a helper, locked to her email
insert into ctx select 'inv30', public.invite_family_member((select v::uuid from ctx where k = 'fam30'), 'Grandma Sue', 'Grandma', 'helper', ' Sue30@Example.com ')::text;
insert into ctx select 'tok30', (select v::jsonb from ctx where k = 'inv30')->>'link_token';
select public.member_invite_sent(((select v::jsonb from ctx where k = 'inv30')->>'id')::uuid);
do $$ declare i family_member_invites; begin
  select * into i from family_member_invites where id = ((select v::jsonb from ctx where k = 'inv30')->>'id')::uuid;
  if i.email <> 'sue30@example.com' or i.role <> 'helper' or i.relation <> 'Grandma' or i.sent_at is null or i.link_token !~ '^[0-9a-f]{40}$'
     or i.expires_at < now() + interval '6 days' or i.expires_at > now() + interval '8 days' then raise exception 'FAIL member invite %', row_to_json(i); end if;
  perform pg_temp.must_fail($q$select public.invite_family_member((select v::uuid from ctx where k = 'fam30'), 'Bea again', 'Mom', 'parent', 'bea30@example.com')$q$, 'already_member');
  perform pg_temp.must_fail($q$select public.invite_family_member((select v::uuid from ctx where k = 'fam30'), 'X', 'Mom', 'boss', null)$q$, 'Pick full access or read only.');
  perform pg_temp.must_fail($q$select public.invite_family_member((select v::uuid from ctx where k = 'fam30'), ' ', 'Mom', 'helper', null)$q$, 'Add their name.');
end $$;
-- Strangers and sitters can't invite members or read invites
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3002');
do $$ begin
  perform pg_temp.must_fail($q$select public.invite_family_member((select v::uuid from ctx where k = 'fam30'), 'Me', 'Other', 'parent', null)$q$, 'not the family owner%');
  if (select count(*) from family_member_invites) <> 0 then raise exception 'FAIL sitter reads member invites'; end if;
  -- the sitter can't join the family she sits for as an adult
  perform pg_temp.must_fail($q$select public.accept_member_invite((select v from ctx where k = 'tok30'))$q$, 'This invite was sent to%');
end $$;
-- Signed out: the preview says only the family name and Bea's first name
reset role;
set role anon;
do $$ declare p jsonb := public.member_invite_preview((select v from ctx where k = 'tok30')); begin
  if p <> jsonb_build_object('status', 'open', 'family_name', 'The Bell family', 'invited_by', 'Bea') then raise exception 'FAIL member preview %', p; end if;
  if public.member_invite_preview(repeat('ab', 20)) <> '{"status": "not_found"}'::jsonb then raise exception 'FAIL unknown member link'; end if;
  if public.member_invite_preview('nope') <> '{"status": "not_found"}'::jsonb then raise exception 'FAIL bad member link'; end if;
  begin perform 1 from family_member_invites; raise exception 'FAIL anon reads member invites'; exception when insufficient_privilege then null; end;
  begin perform public.accept_member_invite((select v from ctx where k = 'tok30')); raise exception 'FAIL anon accepts'; exception when insufficient_privilege then null; end;
  begin perform public.member_invite_details((select v from ctx where k = 'tok30')); raise exception 'FAIL anon details'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set role authenticated;
-- Email lock: someone else signed in can't see the details or join
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3007');
do $$ begin
  perform pg_temp.must_fail($q$select public.member_invite_details((select v from ctx where k = 'tok30'))$q$, 'This invite was sent to s•••@example.com. Sign in with that email, or ask Bea to resend it.');
  perform pg_temp.must_fail($q$select public.accept_member_invite((select v from ctx where k = 'tok30'), 'Wrong')$q$, 'This invite was sent to s•••@example.com%');
  if exists (select 1 from family_parents where user_id = auth.uid()) then raise exception 'FAIL wrong email joined'; end if;
end $$;
-- Sue sees the details and joins as a helper; Bea gets "Sue joined"
reset role;
insert into push_tokens (token, user_id) values ('ExponentPushToken[bea30-phone]', '00000000-0000-0000-0000-0000000a3001'),
  ('ExponentPushToken[sue30-phone]', '00000000-0000-0000-0000-0000000a3003');
delete from net.sent;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3003');
do $$ declare d jsonb := public.member_invite_details((select v from ctx where k = 'tok30')); begin
  if d->>'status' <> 'open' or d->>'family_name' <> 'The Bell family' or d->>'invited_by' <> 'Bea' or d->>'role' <> 'helper'
     or d->>'relation' <> 'Grandma' or d->>'name' <> 'Grandma Sue' or d->'kids' <> '["Kit"]'::jsonb or d->>'block' is not null then raise exception 'FAIL details %', d; end if;
  if public.accept_member_invite((select v from ctx where k = 'tok30'), 'Sue Bell') <> (select v::uuid from ctx where k = 'fam30') then raise exception 'FAIL accept'; end if;
  if (select role || '/' || relation from family_parents where user_id = auth.uid()) <> 'helper/Grandma' then raise exception 'FAIL Sue''s row'; end if;
  if (select role || '/' || full_name from profiles where id = auth.uid()) <> 'parent/Sue Bell' then raise exception 'FAIL Sue''s profile'; end if;
  if public.is_parent_of((select v::uuid from ctx where k = 'fam30')) then raise exception 'FAIL a helper is a parent'; end if;
  if not public.is_family_member((select v::uuid from ctx where k = 'fam30')) then raise exception 'FAIL a helper is not a member'; end if;
  perform pg_temp.must_fail($q$select public.accept_member_invite((select v from ctx where k = 'tok30'))$q$, 'used');
end $$;
reset role;
do $$ begin
  if not exists (select 1 from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[bea30-phone]' and x->>'title' = 'Sue joined The Bell family') then
    raise exception 'FAIL Bea not told Sue joined'; end if;
  if exists (select 1 from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[sue30-phone]') then raise exception 'FAIL Sue told about herself'; end if;
end $$;
insert into family_subscriptions (family_id, status, trial_ends_at) select v::uuid, 'trialing', now() + interval '20 days' from ctx where k = 'fam30';
set role anon;
do $$ begin if public.member_invite_preview((select v from ctx where k = 'tok30')) <> '{"status": "used"}'::jsonb then raise exception 'FAIL used member link'; end if; end $$;
reset role;
set role authenticated;
-- Sue (helper) reads the kids, care plan, shift, log and live location; messages the sitter; hearts a photo; asks for one
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3003');
do $$ declare fid uuid := (select v::uuid from ctx where k = 'fam30'); m jsonb; begin
  if (select count(*) from families where id = fid) <> 1 then raise exception 'FAIL helper sees family'; end if;
  if (select avoid_foods from kids where family_id = fid) <> 'eggs' then raise exception 'FAIL helper reads kids'; end if;
  if (select count(*) from care_items where family_id = fid) <> 1 then raise exception 'FAIL helper reads care plan'; end if;
  if (select count(*) from shifts where family_id = fid and status = 'active') <> 1 then raise exception 'FAIL helper reads shifts'; end if;
  if (select count(*) from logs where shift_id = (select v::uuid from ctx where k = 'shift30')) <> 1 then raise exception 'FAIL helper reads logs'; end if;
  if (select count(*) from family_sitters where family_id = fid) <> 1 then raise exception 'FAIL helper reads sitters'; end if;
  if (select full_name from profiles where id = '00000000-0000-0000-0000-0000000a3002') <> 'Sia Moon' then raise exception 'FAIL helper reads sitter name'; end if;
  if (select full_name from profiles where id = '00000000-0000-0000-0000-0000000a3001') <> 'Bea Bell' then raise exception 'FAIL helper reads Bea''s name'; end if;
  if (select count(*) from family_parents where family_id = fid) <> 2 then raise exception 'FAIL helper reads members'; end if;
  if not public.family_has_plan(fid) then raise exception 'FAIL helper sees the plan state'; end if;
  m := public.family_members(fid);
  if m->>'my_role' <> 'helper' or jsonb_array_length(m->'members') <> 2 or m->'invites' <> '[]'::jsonb or (m->'members'->0->>'name') <> 'Bea Bell'
     or not (m->'members'->0->>'creator')::boolean or not (m->'members'->1->>'me')::boolean then raise exception 'FAIL helper members list %', m; end if;
  insert into messages (family_id, sitter_id, author_id, body) values (fid, '00000000-0000-0000-0000-0000000a3002', auth.uid(), 'Hi Sia, it''s Grandma');
  insert into log_reactions (log_id, parent_id) values ((select v::uuid from ctx where k = 'log30'), auth.uid());
  perform public.ask_for_photo((select v::uuid from ctx where k = 'shift30'));
  if (select count(*) from photo_requests where shift_id = (select v::uuid from ctx where k = 'shift30')) <> 1 then raise exception 'FAIL helper reads photo requests'; end if;
end $$;
-- ...but can't manage: sitters, kids, bookings, billing, members, requirements, the family
do $$ declare fid uuid := (select v::uuid from ctx where k = 'fam30'); n int; begin
  perform pg_temp.must_fail($q$select public.create_invite((select v::uuid from ctx where k = 'fam30'), 'Another sitter')$q$, 'not a parent%');
  perform pg_temp.must_fail($q$insert into kids (family_id, name) select v::uuid, 'Hacked' from ctx where k = 'fam30'$q$, '%row-level security%');
  perform pg_temp.must_fail($q$insert into care_items (family_id, type) select v::uuid, 'meal' from ctx where k = 'fam30'$q$, '%row-level security%');
  perform pg_temp.must_fail($q$insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by) select v::uuid, '00000000-0000-0000-0000-0000000a3002', now() + interval '2 days', now() + interval '2 days 3 hours', auth.uid() from ctx where k = 'fam30'$q$, '%row-level security%');
  perform pg_temp.must_fail($q$select public.set_trial_reminder((select v::uuid from ctx where k = 'fam30'), false)$q$, 'not the family owner%');
  perform pg_temp.must_fail($q$select public.invite_family_member((select v::uuid from ctx where k = 'fam30'), 'Gramps', 'Grandpa', 'helper', null)$q$, 'not the family owner%');
  perform pg_temp.must_fail($q$select public.set_member_role((select v::uuid from ctx where k = 'fam30'), auth.uid(), 'parent')$q$, 'not the family owner%');
  perform pg_temp.must_fail($q$select public.remove_family_member((select v::uuid from ctx where k = 'fam30'), '00000000-0000-0000-0000-0000000a3001')$q$, 'not the family owner%');
  perform pg_temp.must_fail($q$select public.request_extension((select v::uuid from ctx where k = 'shift30'), now() + interval '4 hours')$q$, 'not your family%');
  perform pg_temp.must_fail($q$insert into family_requirements (family_id, kind) select v::uuid, 'cpr' from ctx where k = 'fam30'$q$, '%');
  perform pg_temp.must_fail($q$insert into family_parents (family_id, user_id) select v::uuid, '00000000-0000-0000-0000-0000000a3006' from ctx where k = 'fam30'$q$, 'permission denied%');
  perform pg_temp.must_fail($q$update family_parents set role = 'parent' where user_id = auth.uid()$q$, 'permission denied%');
  if (select count(*) from family_subscriptions) <> 0 then raise exception 'FAIL helper reads the subscription'; end if;
  if (select count(*) from family_member_invites) <> 0 then raise exception 'FAIL helper reads member invites'; end if;
  if (select count(*) from invites where family_id = fid) <> 0 then raise exception 'FAIL helper reads sitter invites'; end if;
  update families set name = 'Hacked' where id = fid;
  update family_sitters set status = 'removed' where family_id = fid;
  get diagnostics n = row_count;
  if n <> 0 or (select name from families where id = fid) <> 'The Bell family' then raise exception 'FAIL helper changed the family'; end if;
end $$;
-- The sitter sees Grandma's message and her heart; Sue got the clock-in style alerts as a member
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3002');
do $$ begin
  if (select count(*) from messages where body = 'Hi Sia, it''s Grandma') <> 1 then raise exception 'FAIL sitter misses helper message'; end if;
  if (select count(*) from log_reactions where log_id = (select v::uuid from ctx where k = 'log30')) <> 1 then raise exception 'FAIL sitter misses helper heart'; end if;
  if (select full_name from profiles where id = '00000000-0000-0000-0000-0000000a3003') <> 'Sue Bell' then raise exception 'FAIL sitter reads helper name'; end if;
end $$;
reset role;
delete from net.sent;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3002');
insert into logs (shift_id, author_id, kind, data) select v::uuid, auth.uid(), 'note', '{"text":"Snack done"}' from ctx where k = 'shift30';
reset role;
do $$ begin
  if not exists (select 1 from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[sue30-phone]') then raise exception 'FAIL helper not alerted about the log'; end if;
  if not exists (select 1 from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[bea30-phone]') then raise exception 'FAIL parent not alerted about the log'; end if;
end $$;
-- The trial reminder goes to parents only
delete from net.sent;
select public.billing_trial_reminder((select v::uuid from ctx where k = 'fam30'));
do $$ begin
  if exists (select 1 from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[sue30-phone]') then raise exception 'FAIL helper got the billing reminder'; end if;
  if not exists (select 1 from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[bea30-phone]') then raise exception 'FAIL parent missed the billing reminder'; end if;
end $$;
set role authenticated;
-- Bea invites Ben (dad, parent, no email) and Ada (aunt, helper): 2 members + 2 open invites = 4; a 5th is refused
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3001');
insert into ctx select 'tok30ben', public.invite_family_member((select v::uuid from ctx where k = 'fam30'), 'Ben', 'Dad', 'parent', null)->>'link_token';
insert into ctx select 'inv30ada', public.invite_family_member((select v::uuid from ctx where k = 'fam30'), 'Ada', 'Aunt', 'helper', 'ada30@example.com')::text;
do $$ declare m jsonb := public.family_members((select v::uuid from ctx where k = 'fam30')); begin
  if m->>'my_role' <> 'parent' or jsonb_array_length(m->'invites') <> 2
     or (select string_agg(x->>'name' || ':' || (x->>'status'), ',' order by x->>'name') from jsonb_array_elements(m->'invites') x) <> 'Ada:open,Ben:open' then raise exception 'FAIL parent members list %', m; end if;
  perform pg_temp.must_fail($q$select public.invite_family_member((select v::uuid from ctx where k = 'fam30'), 'Ivy', 'Other', 'helper', null)$q$, 'family_full');
end $$;
-- Cancel frees a seat; Resend can't bring the cancelled one back
select public.cancel_member_invite(((select v::jsonb from ctx where k = 'inv30ada')->>'id')::uuid);
do $$ begin
  perform pg_temp.must_fail($q$select public.resend_member_invite(((select v::jsonb from ctx where k = 'inv30ada')->>'id')::uuid)$q$, 'closed');
end $$;
insert into ctx select 'inv30ada2', public.invite_family_member((select v::uuid from ctx where k = 'fam30'), 'Ada', 'Aunt', 'helper', 'ada30@example.com')::text;
reset role;
set role anon;
do $$ begin if public.member_invite_preview((select v::jsonb from ctx where k = 'inv30ada')->>'link_token') <> '{"status": "closed"}'::jsonb then raise exception 'FAIL cancelled member link'; end if; end $$;
reset role;
set role authenticated;
-- Ben joins as a parent; Ada joins as a helper: 4 of 4
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3004');
select public.accept_member_invite((select v from ctx where k = 'tok30ben'), 'Ben Bell');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3005');
select public.accept_member_invite((select v::jsonb from ctx where k = 'inv30ada2')->>'link_token', 'Ada Bell');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3004');
do $$ declare fid uuid := (select v::uuid from ctx where k = 'fam30'); begin
  if not public.is_parent_of(fid) then raise exception 'FAIL Ben is not a parent'; end if;
  if (select count(*) from family_parents where family_id = fid) <> 4 then raise exception 'FAIL 4 members'; end if;
  if (select count(*) from family_subscriptions) <> 1 then raise exception 'FAIL Ben (parent) reads the subscription'; end if;
  perform pg_temp.must_fail($q$select public.invite_family_member((select v::uuid from ctx where k = 'fam30'), 'Ivy', 'Other', 'helper', null)$q$, 'not the family owner%');
end $$;
-- The database itself refuses a 5th adult
reset role;
do $$ begin
  perform pg_temp.must_fail($q$insert into family_parents (family_id, user_id) select v::uuid, '00000000-0000-0000-0000-0000000a3006' from ctx where k = 'fam30'$q$, 'family_full');
end $$;
set role authenticated;
-- Access (migration 32: the owner only): Ben (full access, not the owner) can't change anyone's access or remove
-- anyone; Bea (the owner) makes Ben read only and back, can't make herself read only, leave or be removed.
do $$ declare fid uuid := (select v::uuid from ctx where k = 'fam30'); begin
  perform pg_temp.must_fail(format('select public.set_member_role(%L, %L, %L)', fid, '00000000-0000-0000-0000-0000000a3001', 'helper'), 'not the family owner%');
  perform pg_temp.must_fail(format('select public.remove_family_member(%L, %L)', fid, '00000000-0000-0000-0000-0000000a3005'), 'not the family owner%');
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3001');
do $$ declare fid uuid := (select v::uuid from ctx where k = 'fam30'); begin
  perform public.set_member_role(fid, '00000000-0000-0000-0000-0000000a3004', 'helper');
  if (select role from family_parents where family_id = fid and user_id = '00000000-0000-0000-0000-0000000a3004') <> 'helper' then raise exception 'FAIL role change'; end if;
  perform public.set_member_role(fid, '00000000-0000-0000-0000-0000000a3004', 'parent');
  perform pg_temp.must_fail(format('select public.set_member_role(%L, auth.uid(), %L)', fid, 'helper'), 'owner_access');
  perform pg_temp.must_fail(format('select public.leave_family(%L)', fid), 'owner_leave');
  perform pg_temp.must_fail(format('select public.remove_family_member(%L, auth.uid())', fid), 'owner_leave');
  -- Bea removes Ben
  perform public.remove_family_member(fid, '00000000-0000-0000-0000-0000000a3004');
end $$;
-- Sue (helper) leaves on her own; a helper can't remove someone else
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3005');
do $$ begin
  perform pg_temp.must_fail(format('select public.remove_family_member(%L, %L)', (select v from ctx where k = 'fam30'), '00000000-0000-0000-0000-0000000a3003'), 'not the family owner%');
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3003');
select public.leave_family((select v::uuid from ctx where k = 'fam30'));
do $$ begin
  if (select count(*) from kids where family_id = (select v::uuid from ctx where k = 'fam30')) <> 0 then raise exception 'FAIL Sue still sees the kids after leaving'; end if;
  if (select count(*) from messages) <> 0 then raise exception 'FAIL Sue still reads messages after leaving'; end if;
end $$;
-- Someone with another family, or a sitter account, can't join
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3006');
insert into ctx values ('fam30b', (select public.create_family('The Ivy family', 'Ivy Ray')::text));
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3001');
insert into ctx select 'tok30ivy', public.invite_family_member((select v::uuid from ctx where k = 'fam30'), 'Ivy', 'Other', 'helper', null)->>'link_token';
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3006');
do $$ begin
  if public.member_invite_details((select v from ctx where k = 'tok30ivy'))->>'block' <> 'other_family' then raise exception 'FAIL other family block'; end if;
  perform pg_temp.must_fail($q$select public.accept_member_invite((select v from ctx where k = 'tok30ivy'))$q$, 'other_family');
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3002');
do $$ begin
  perform pg_temp.must_fail($q$select public.accept_member_invite((select v from ctx where k = 'tok30ivy'))$q$, 'sitter_account');
end $$;
-- Expired links: status only; Resend gives 7 more days
reset role;
update family_member_invites set expires_at = now() - interval '1 day' where link_token = (select v from ctx where k = 'tok30ivy');
set role anon;
do $$ begin if public.member_invite_preview((select v from ctx where k = 'tok30ivy')) <> '{"status": "expired"}'::jsonb then raise exception 'FAIL expired member link'; end if; end $$;
reset role;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3001');
do $$ begin
  if public.resend_member_invite((select id from family_member_invites where link_token = (select v from ctx where k = 'tok30ivy'))) < now() + interval '6 days' then raise exception 'FAIL member resend'; end if;
end $$;
reset role;

-- 31. Requirement requests (migration 31, P79 / P79b / P79c / S53 / S53b / S53c / S17d). Pat Oak (parent), Hal Oak
-- (helper), Sky Day (sitter of the Oak and Elm families), Oz Elm (the other family's parent). Only parents ask and
-- review; the sitter shares her own matching card (or a confirmation) and can't mark it met; the card is readable by the
-- Oak family only while shared with them; only Looks good counts; pushes go to the sitter / the parents.
reset role;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000a3101', 'pat31@example.com'),
  ('00000000-0000-0000-0000-0000000a3102', 'sky31@example.com'),
  ('00000000-0000-0000-0000-0000000a3103', 'hal31@example.com'),
  ('00000000-0000-0000-0000-0000000a3104', 'oz31@example.com');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3101');
insert into ctx values ('fam31', (select public.create_family('The Oak family', 'Pat Oak')::text));
insert into family_requirements (family_id, key, title, details, level, position)
  select v::uuid, x.key, x.title, x.details::jsonb, 'must', x.pos from ctx,
    (values ('background_check', 'Background check', '{"within_months": 12}', 0), ('cpr_first_aid', 'CPR and First Aid', '{}', 1),
            ('cpr_infant', 'Infant CPR', '{}', 2), ('age_18', 'Age 18 or older', '{"proof": "self"}', 3),
            ('non_smoker', 'Non-smoker', '{"proof": "self"}', 4)) x(key, title, details, pos)
  where k = 'fam31';
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3104');
insert into ctx values ('fam31b', (select public.create_family('The Elm family', 'Oz Elm')::text));
reset role;
insert into profiles (id, full_name, role) values ('00000000-0000-0000-0000-0000000a3102', 'Sky Day', 'sitter'), ('00000000-0000-0000-0000-0000000a3103', 'Hal Oak', 'parent')
  on conflict (id) do update set full_name = excluded.full_name;
insert into family_parents (family_id, user_id, role, relation) select v::uuid, '00000000-0000-0000-0000-0000000a3103', 'helper', 'Grandpa' from ctx where k = 'fam31';
insert into family_sitters (family_id, sitter_id, status) select v::uuid, '00000000-0000-0000-0000-0000000a3102', 'active' from ctx where k in ('fam31', 'fam31b');
insert into push_tokens (token, user_id) values ('ExponentPushToken[pat31]', '00000000-0000-0000-0000-0000000a3101'),
  ('ExponentPushToken[sky31]', '00000000-0000-0000-0000-0000000a3102'), ('ExponentPushToken[hal31]', '00000000-0000-0000-0000-0000000a3103');
insert into ctx select 'ola31cred', id::text from sitter_credentials where sitter_id = '00000000-0000-0000-0000-0000000a1902' limit 1;
set role authenticated;
-- Sky's cards: a current CPR and First Aid, an expired one, an Infant CPR, and a background check report she uploads
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3102');
insert into sitter_credentials (sitter_id, kind, title, issued_on, expires_on, file_path) values
  (auth.uid(), 'first_aid', 'CPR and First Aid', current_date - 100, current_date + 600, auth.uid() || '/cards/fa.jpg'),
  (auth.uid(), 'first_aid', 'CPR and First Aid', current_date - 900, current_date - 10, auth.uid() || '/cards/old.jpg'),
  (auth.uid(), 'cpr_infant', 'Infant CPR', current_date - 100, current_date + 600, auth.uid() || '/cards/inf.jpg'),
  (auth.uid(), 'background_check', 'Background check', current_date - 60, null, auth.uid() || '/cards/report.pdf');
insert into ctx select 'fa31', id::text from sitter_credentials where file_path like '%/fa.jpg';
insert into ctx select 'old31', id::text from sitter_credentials where file_path like '%/old.jpg';
insert into ctx select 'inf31', id::text from sitter_credentials where file_path like '%/inf.jpg';
insert into ctx select 'bg31', id::text from sitter_credentials where file_path like '%/report.pdf';
do $$ begin
  if (select verified_at from sitter_credentials where id = (select v::uuid from ctx where k = 'bg31')) is not null then raise exception 'FAIL uploaded report starts verified'; end if;
  -- she can't ask, and can't write requests directly
  perform pg_temp.must_fail($q$select public.ask_requirements((select v::uuid from ctx where k = 'fam31'), auth.uid(), array['cpr_first_aid'])$q$, 'not a parent%');
  perform pg_temp.must_fail($q$insert into requirement_requests (family_id, sitter_id, req_key, status) select v::uuid, auth.uid(), 'cpr_first_aid', 'met' from ctx where k = 'fam31'$q$, 'permission denied%');
end $$;
-- Hal (helper) and Oz (other family) can't ask
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3103');
do $$ begin
  perform pg_temp.must_fail($q$select public.ask_requirements((select v::uuid from ctx where k = 'fam31'), '00000000-0000-0000-0000-0000000a3102', array['cpr_first_aid'])$q$, 'not a parent%');
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3104');
do $$ begin
  perform pg_temp.must_fail($q$select public.ask_requirements((select v::uuid from ctx where k = 'fam31'), '00000000-0000-0000-0000-0000000a3102', array['cpr_first_aid'])$q$, 'not a parent%');
end $$;
-- Pat asks for both CPR cards with a note; Sky gets one push
reset role;
delete from net.sent;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3101');
do $$ begin
  perform pg_temp.must_fail($q$select public.ask_requirements((select v::uuid from ctx where k = 'fam31'), '00000000-0000-0000-0000-0000000a1902', array['cpr_first_aid'])$q$, 'not your sitter');
  perform pg_temp.must_fail($q$select public.ask_requirements((select v::uuid from ctx where k = 'fam31'), '00000000-0000-0000-0000-0000000a3102', array['water_safety'])$q$, 'unknown requirement%');
  perform pg_temp.must_fail($q$select public.ask_requirements((select v::uuid from ctx where k = 'fam31'), '00000000-0000-0000-0000-0000000a3102', array[]::text[])$q$, 'Pick what to ask for.');
  if public.ask_requirements((select v::uuid from ctx where k = 'fam31'), '00000000-0000-0000-0000-0000000a3102', array['cpr_first_aid', 'cpr_infant'], ' For Mia ') <> 2 then raise exception 'FAIL ask count'; end if;
  if (select string_agg(req_key || ':' || status || ':' || note, ',' order by req_key) from requirement_requests) <> 'cpr_first_aid:asked:For Mia,cpr_infant:asked:For Mia' then
    raise exception 'FAIL asked rows'; end if;
  -- nothing shared yet: Pat can't see her cards or files
  if (select count(*) from sitter_credentials where sitter_id = '00000000-0000-0000-0000-0000000a3102') <> 0 then raise exception 'FAIL parent reads unshared cards'; end if;
  if public.can_read_sitter_file('00000000-0000-0000-0000-0000000a3102/cards/fa.jpg') then raise exception 'FAIL parent reads an unshared card photo'; end if;
end $$;
reset role;
do $$ begin
  if (select count(*) from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[sky31]'
      and x->>'title' = 'The Oak family asked for CPR and First Aid, Infant CPR' and x->>'body' = 'For Mia' and x->'data'->>'url' = '/sitter/requests') <> 1 then
    raise exception 'FAIL ask push'; end if;
  if exists (select 1 from net.sent, jsonb_array_elements(body) x where x->>'to' in ('ExponentPushToken[pat31]', 'ExponentPushToken[hal31]')) then raise exception 'FAIL ask pushed the family'; end if;
end $$;
delete from net.sent;
set role authenticated;
-- Sky sees the request; share must be her own, matching, unexpired card
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3102');
do $$ declare m jsonb := public.my_requirement_requests(); begin
  if jsonb_array_length(m) <> 1 or m->0->>'family_name' <> 'The Oak family' or jsonb_array_length(m->0->'requests') <> 2
     or m->0->'requests'->0->>'title' <> 'CPR and First Aid' or m->0->'requests'->0->'kinds' <> '["first_aid", "cpr_child"]'::jsonb
     or m->0->'requests'->0->>'asked_by' <> 'Pat' then raise exception 'FAIL my requests %', m; end if;
  insert into ctx select 'rq31fa', id::text from requirement_requests where req_key = 'cpr_first_aid';
  insert into ctx select 'rq31inf', id::text from requirement_requests where req_key = 'cpr_infant';
  perform pg_temp.must_fail($q$select public.share_requirement((select v::uuid from ctx where k = 'rq31fa'), (select v::uuid from ctx where k = 'inf31'))$q$, 'That one isn''t a CPR and First Aid card.');
  perform pg_temp.must_fail($q$select public.share_requirement((select v::uuid from ctx where k = 'rq31fa'), (select v::uuid from ctx where k = 'ola31cred'))$q$, 'not your credential');
  perform pg_temp.must_fail($q$select public.share_requirement((select v::uuid from ctx where k = 'rq31fa'), (select v::uuid from ctx where k = 'old31'))$q$, 'That one has expired%');
  perform pg_temp.must_fail($q$select public.share_requirement((select v::uuid from ctx where k = 'rq31fa'))$q$, 'Pick one of your certificates to share.');
  perform public.share_requirement((select v::uuid from ctx where k = 'rq31fa'), (select v::uuid from ctx where k = 'fa31'), 'Renewed in June');
  if (select status || ':' || sitter_note from requirement_requests where id = (select v::uuid from ctx where k = 'rq31fa')) <> 'shared:Renewed in June' then raise exception 'FAIL shared row'; end if;
  -- she can't mark it met
  perform pg_temp.must_fail($q$select public.review_requirement((select v::uuid from ctx where k = 'rq31fa'), true)$q$, 'not a parent%');
  perform pg_temp.must_fail($q$update requirement_requests set status = 'met'$q$, 'permission denied%');
end $$;
reset role;
do $$ begin
  if (select count(*) from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[pat31]' and x->>'title' = 'Sky shared CPR and First Aid'
      and x->'data'->>'url' = '/parent/shared/' || (select v from ctx where k = 'rq31fa')) <> 1 then raise exception 'FAIL share push'; end if;
  if exists (select 1 from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[hal31]') then raise exception 'FAIL share pushed a helper'; end if;
end $$;
delete from net.sent;
set role authenticated;
-- Hal (helper) sees what she shared, but can't review or remove it
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3103');
do $$ declare rows jsonb := public.family_requirement_requests((select v::uuid from ctx where k = 'fam31'), '00000000-0000-0000-0000-0000000a3102'); begin
  if jsonb_array_length(rows) <> 5 or rows->1->'request'->>'status' <> 'shared' or rows->1->'request'->'credential'->>'file_path' <> '00000000-0000-0000-0000-0000000a3102/cards/fa.jpg'
     or rows->0->'request' <> 'null'::jsonb or rows->2->'request'->'credential' <> 'null'::jsonb then raise exception 'FAIL helper rows %', rows; end if;
  if (select count(*) from requirement_requests) <> 2 then raise exception 'FAIL helper reads requests'; end if;
  if (select count(*) from sitter_credentials) <> 1 then raise exception 'FAIL helper reads the shared card row'; end if;
  if not public.can_read_sitter_file('00000000-0000-0000-0000-0000000a3102/cards/fa.jpg') then raise exception 'FAIL helper can''t open the shared card'; end if;
  if public.can_read_sitter_file('00000000-0000-0000-0000-0000000a3102/cards/inf.jpg') then raise exception 'FAIL helper opens an unshared card'; end if;
  perform pg_temp.must_fail($q$select public.review_requirement((select v::uuid from ctx where k = 'rq31fa'), true)$q$, 'not a parent%');
  perform pg_temp.must_fail($q$select public.cancel_requirement_request((select v::uuid from ctx where k = 'rq31fa'))$q$, 'not a parent%');
end $$;
-- Oz (the Elm family, Sky sits for them too) sees nothing of it
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3104');
do $$ begin
  if public.can_read_sitter_file('00000000-0000-0000-0000-0000000a3102/cards/fa.jpg') then raise exception 'FAIL another family opens Sky''s card'; end if;
  if not public.can_read_sitter_file('00000000-0000-0000-0000-0000000a3102/photo/me.jpg') then raise exception 'FAIL her family can''t see her photo'; end if;
  if (select count(*) from sitter_credentials where sitter_id = '00000000-0000-0000-0000-0000000a3102') <> 0 then raise exception 'FAIL another family reads Sky''s cards'; end if;
  if (select count(*) from requirement_requests) <> 0 then raise exception 'FAIL another family reads the requests'; end if;
  perform pg_temp.must_fail($q$select public.family_requirement_requests((select v::uuid from ctx where k = 'fam31'), '00000000-0000-0000-0000-0000000a3102')$q$, 'not in this family');
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a20c1');
do $$ begin
  if public.can_read_sitter_file('00000000-0000-0000-0000-0000000a3102/photo/me.jpg') then raise exception 'FAIL stranger sees her photo'; end if;
  if public.can_read_sitter_file('00000000-0000-0000-0000-0000000a3102/cards/fa.jpg') then raise exception 'FAIL stranger opens her card'; end if;
end $$;
-- Shared isn't met; Pat taps Looks good, then it counts
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3101');
do $$ begin
  if (select st.reason from public.sitter_requirement_status((select v::uuid from ctx where k = 'fam31'), '00000000-0000-0000-0000-0000000a3102') st
      join family_requirements fr on fr.id = st.requirement_id where fr.key = 'cpr_first_aid') <> 'shared' then raise exception 'FAIL shared counted as met'; end if;
  perform public.review_requirement((select v::uuid from ctx where k = 'rq31fa'), true);
  if (select st.met::text || st.reason from public.sitter_requirement_status((select v::uuid from ctx where k = 'fam31'), '00000000-0000-0000-0000-0000000a3102') st
      join family_requirements fr on fr.id = st.requirement_id where fr.key = 'cpr_first_aid') <> 'truevalid' then raise exception 'FAIL Looks good not met'; end if;
  perform pg_temp.must_fail($q$select public.review_requirement((select v::uuid from ctx where k = 'rq31fa'), true)$q$, 'Nothing to look at yet.');
end $$;
reset role;
do $$ begin
  if (select count(*) from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[sky31]' and x->>'title' = 'Looks good: CPR and First Aid'
      and x->>'body' = 'The Oak family saw what you shared.') <> 1 then raise exception 'FAIL looks good push'; end if;
end $$;
delete from net.sent;
set role authenticated;
-- Sky uploads a new photo of the card: back to "shared" for Pat to look again
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3102');
update sitter_credentials set file_path = auth.uid() || '/cards/fa2.jpg' where id = (select v::uuid from ctx where k = 'fa31');
do $$ begin
  if (select status from requirement_requests where id = (select v::uuid from ctx where k = 'rq31fa')) <> 'shared' then raise exception 'FAIL new card stayed met'; end if;
end $$;
reset role;
do $$ begin
  if (select count(*) from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[pat31]' and x->>'title' = 'Sky updated CPR and First Aid') <> 1 then
    raise exception 'FAIL updated card push'; end if;
end $$;
delete from net.sent;
set role authenticated;
-- Pat asks again with a note; the photo is no longer open to the family. Sky says she has no Infant CPR.
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3101');
do $$ begin
  perform public.review_requirement((select v::uuid from ctx where k = 'rq31fa'), false, 'The photo is blurry');
  if (select status || ':' || note || ':' || (credential_id is null)::text from requirement_requests where id = (select v::uuid from ctx where k = 'rq31fa')) <> 'asked:The photo is blurry:true' then
    raise exception 'FAIL ask again'; end if;
  if public.can_read_sitter_file('00000000-0000-0000-0000-0000000a3102/cards/fa2.jpg') then raise exception 'FAIL card open after ask again'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3102');
select public.decline_requirement((select v::uuid from ctx where k = 'rq31inf'), 'Booked a class for Nov 2');
reset role;
do $$ begin
  if (select count(*) from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[sky31]' and x->>'title' = 'The Oak family asked again for CPR and First Aid'
      and x->>'body' = 'The photo is blurry') <> 1 then raise exception 'FAIL ask again push'; end if;
  if (select count(*) from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[pat31]' and x->>'title' = 'Sky doesn''t have Infant CPR'
      and x->>'body' = 'Booked a class for Nov 2') <> 1 then raise exception 'FAIL decline push'; end if;
end $$;
set role authenticated;
-- Self-declared: a confirmation with a note, no file; age 18 follows her birthday when she gave one
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3101');
select public.ask_requirements((select v::uuid from ctx where k = 'fam31'), '00000000-0000-0000-0000-0000000a3102', array['non_smoker', 'age_18', 'background_check']);
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3102');
insert into sitter_profiles (sitter_id, birthdate) values (auth.uid(), current_date - interval '16 years');
do $$ begin
  perform pg_temp.must_fail(format('select public.share_requirement(%L, %L)', (select id from requirement_requests where req_key = 'non_smoker'), (select v from ctx where k = 'fa31')), 'Nothing to attach%');
  perform pg_temp.must_fail(format('select public.share_requirement(%L)', (select id from requirement_requests where req_key = 'age_18')), 'under_18');
  perform public.share_requirement((select id from requirement_requests where req_key = 'non_smoker'), null, 'Never smoked');
  perform public.share_requirement((select id from requirement_requests where req_key = 'background_check'), (select v::uuid from ctx where k = 'bg31'));
end $$;
-- Pat: the report she uploaded is open to the family; Looks good counts; an expired card stops counting
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3101');
do $$ begin
  if not public.can_read_sitter_file('00000000-0000-0000-0000-0000000a3102/cards/report.pdf') then raise exception 'FAIL parent can''t open the shared report'; end if;
  perform public.review_requirement((select id from requirement_requests where req_key = 'background_check'), true);
  perform public.review_requirement((select id from requirement_requests where req_key = 'non_smoker'), true);
end $$;
reset role;
update sitter_credentials set expires_on = current_date - 1 where id = (select v::uuid from ctx where k = 'bg31');
update requirement_requests set status = 'met' where req_key = 'background_check';
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3101');
do $$ declare s text; begin
  select string_agg(st.reason, ',' order by fr.position) into s
    from public.sitter_requirement_status((select v::uuid from ctx where k = 'fam31'), '00000000-0000-0000-0000-0000000a3102') st
    join family_requirements fr on fr.id = st.requirement_id;
  if s <> 'expired,asked,declined,asked,valid' then raise exception 'FAIL statuses %', s; end if;
  -- removing a request; a removed requirement takes its requests along
  perform public.cancel_requirement_request((select id from requirement_requests where req_key = 'age_18'));
  delete from family_requirements where key = 'non_smoker' and family_id = (select v::uuid from ctx where k = 'fam31');
  if (select string_agg(req_key, ',' order by req_key) from requirement_requests) <> 'background_check,cpr_first_aid,cpr_infant' then raise exception 'FAIL cancel / removed requirement'; end if;
end $$;
-- Sky deletes the report she shared: the request goes back to asked
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3102');
delete from sitter_credentials where id = (select v::uuid from ctx where k = 'bg31');
do $$ begin
  if (select status || ':' || (credential_id is null)::text from requirement_requests where req_key = 'background_check') <> 'asked:true' then raise exception 'FAIL deleted card kept the request'; end if;
end $$;
reset role;

-- 32. Family seats (migration 32): 4 seats; the owner (families.created_by) adds people with Full access or Read only,
--     changes access, removes them and manages billing. Oli owns the Oak family; Dee has full access; Ray is read
--     only; Kai has an open invite. Oli hands the family to Dee, then leaves.
reset role;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000a3201', 'oli32@example.com'),
  ('00000000-0000-0000-0000-0000000a3202', 'dee32@example.com'),
  ('00000000-0000-0000-0000-0000000a3203', 'ray32@example.com');
insert into push_tokens (token, user_id) values ('ExponentPushToken[oli32]', '00000000-0000-0000-0000-0000000a3201'),
  ('ExponentPushToken[dee32]', '00000000-0000-0000-0000-0000000a3202'), ('ExponentPushToken[ray32]', '00000000-0000-0000-0000-0000000a3203');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3201');
insert into ctx values ('fam32', (select public.create_family('The Oak family', 'Oli Oak')::text));
insert into kids (family_id, name) select v::uuid, 'Pip' from ctx where k = 'fam32';
insert into ctx select 'tok32dee', public.invite_family_member((select v::uuid from ctx where k = 'fam32'), 'Dee', 'Dad', 'full', null)->>'link_token';
insert into ctx select 'tok32ray', public.invite_family_member((select v::uuid from ctx where k = 'fam32'), 'Ray', 'Grandpa', 'read_only', null)->>'link_token';
do $$ begin
  if not public.is_family_owner((select v::uuid from ctx where k = 'fam32')) then raise exception 'FAIL the creator is the owner'; end if;
  perform pg_temp.must_fail($q$select public.invite_family_member((select v::uuid from ctx where k = 'fam32'), 'X', 'Other', 'admin', null)$q$, 'Pick full access or read only.');
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3202');
do $$ declare d jsonb := public.member_invite_details((select v from ctx where k = 'tok32dee')); begin
  if d->>'access' <> 'full' or d->>'role' <> 'parent' then raise exception 'FAIL invite access %', d; end if;
end $$;
select public.accept_member_invite((select v from ctx where k = 'tok32dee'), 'Dee Oak');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3203');
select public.accept_member_invite((select v from ctx where k = 'tok32ray'), 'Ray Oak');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3201');
insert into ctx select 'inv32kai', public.invite_family_member((select v::uuid from ctx where k = 'fam32'), 'Kai', 'Aunt', 'read_only', null)::text;
do $$ declare m jsonb := public.family_members((select v::uuid from ctx where k = 'fam32')); begin
  if m->>'owner' <> '00000000-0000-0000-0000-0000000a3201' or not (m->>'i_own')::boolean or m->>'my_access' <> 'full'
     or (m->>'seats_used')::int <> 4 or jsonb_array_length(m->'invites') <> 1 or m->'invites'->0->>'access' <> 'read_only'
     or (select string_agg((x->>'name') || ':' || (x->>'access') || ':' || (x->>'owner'), ',' order by x->>'joined_at') from jsonb_array_elements(m->'members') x)
        <> 'Oli Oak:full:true,Dee Oak:full:false,Ray Oak:read_only:false' then raise exception 'FAIL owner members list %', m; end if;
end $$;
-- Dee (full access, not the owner): sees the members and the seat count, no invites; can't manage seats or billing,
-- can't take the family over by writing created_by; still does what a parent does (kids, the requirement mode)
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3202');
do $$ declare fid uuid := (select v::uuid from ctx where k = 'fam32'); m jsonb := public.family_members((select v::uuid from ctx where k = 'fam32')); n int; begin
  if m->>'owner' <> '00000000-0000-0000-0000-0000000a3201' or (m->>'i_own')::boolean or m->>'my_access' <> 'full'
     or (m->>'seats_used')::int <> 4 or m->'invites' <> '[]'::jsonb or jsonb_array_length(m->'members') <> 3 then raise exception 'FAIL full-access members list %', m; end if;
  if public.is_family_owner(fid) then raise exception 'FAIL Dee is the owner'; end if;
  if not public.is_parent_of(fid) then raise exception 'FAIL Dee has no full access'; end if;
  if (select count(*) from family_member_invites) <> 0 then raise exception 'FAIL Dee reads the member invites'; end if;
  perform pg_temp.must_fail($q$select public.invite_family_member((select v::uuid from ctx where k = 'fam32'), 'Zed', 'Other', 'full', null)$q$, 'not the family owner%');
  perform pg_temp.must_fail($q$select public.cancel_member_invite(((select v::jsonb from ctx where k = 'inv32kai')->>'id')::uuid)$q$, 'not the family owner%');
  perform pg_temp.must_fail($q$select public.resend_member_invite(((select v::jsonb from ctx where k = 'inv32kai')->>'id')::uuid)$q$, 'not the family owner%');
  perform pg_temp.must_fail($q$select public.member_invite_sent(((select v::jsonb from ctx where k = 'inv32kai')->>'id')::uuid)$q$, 'not the family owner%');
  perform pg_temp.must_fail(format('select public.set_member_access(%L, %L, %L)', fid, '00000000-0000-0000-0000-0000000a3203', 'full'), 'not the family owner%');
  perform pg_temp.must_fail(format('select public.remove_family_member(%L, %L)', fid, '00000000-0000-0000-0000-0000000a3203'), 'not the family owner%');
  perform pg_temp.must_fail(format('select public.transfer_family_ownership(%L, auth.uid())', fid), 'not the family owner%');
  perform pg_temp.must_fail(format('select public.set_trial_reminder(%L, false)', fid), 'not the family owner%');
  perform pg_temp.must_fail(format('update families set created_by = auth.uid() where id = %L', fid), 'permission denied%');
  update families set requirement_mode = 'block' where id = fid;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL Dee can''t set the requirement mode'; end if;
  update families set requirement_mode = 'warn' where id = fid;
  insert into kids (family_id, name) values (fid, 'Bo');
  update kids set avoid_foods = 'nuts' where family_id = fid and name = 'Pip';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL Dee can''t edit a kid'; end if;
end $$;
-- Ray (read only): reads the kids and their care info, can't edit them
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3203');
do $$ declare fid uuid := (select v::uuid from ctx where k = 'fam32'); m jsonb := public.family_members((select v::uuid from ctx where k = 'fam32')); n int; begin
  if m->>'my_access' <> 'read_only' or m->'invites' <> '[]'::jsonb then raise exception 'FAIL read-only members list %', m; end if;
  if (select avoid_foods from kids where family_id = fid and name = 'Pip') <> 'nuts' then raise exception 'FAIL Ray reads the kids'; end if;
  update kids set avoid_foods = '' where family_id = fid;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL Ray edited a kid'; end if;
  perform pg_temp.must_fail(format('insert into kids (family_id, name) values (%L, %L)', fid, 'Hacked'), '%row-level security%');
  perform pg_temp.must_fail(format('select public.set_trial_reminder(%L, false)', fid), 'not the family owner%');
  perform pg_temp.must_fail(format('select public.invite_family_member(%L, %L, null, %L, null)', fid, 'Zed', 'full'), 'not the family owner%');
end $$;
-- Billing: the owner sets the reminder; the reminder push goes to the owner only
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3201');
select public.set_trial_reminder((select v::uuid from ctx where k = 'fam32'), true);
reset role;
update family_subscriptions set status = 'trialing', trial_ends_at = now() + interval '3 days' where family_id = (select v::uuid from ctx where k = 'fam32');
delete from net.sent;
select public.billing_trial_reminder((select v::uuid from ctx where k = 'fam32'));
do $$ begin
  if not exists (select 1 from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[oli32]') then raise exception 'FAIL owner missed the trial reminder'; end if;
  if exists (select 1 from net.sent, jsonb_array_elements(body) x where x->>'to' in ('ExponentPushToken[dee32]', 'ExponentPushToken[ray32]')) then raise exception 'FAIL non-owner got the trial reminder'; end if;
end $$;
delete from net.sent;
set role authenticated;
-- The owner changes access: Ray full, then read only again; the owner keeps full access and can't leave yet
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3201');
do $$ declare fid uuid := (select v::uuid from ctx where k = 'fam32'); begin
  perform public.set_member_access(fid, '00000000-0000-0000-0000-0000000a3203', 'full');
  if (select role from family_parents where family_id = fid and user_id = '00000000-0000-0000-0000-0000000a3203') <> 'parent' then raise exception 'FAIL set full access'; end if;
  perform public.set_member_access(fid, '00000000-0000-0000-0000-0000000a3203', 'read_only');
  if (select role from family_parents where family_id = fid and user_id = '00000000-0000-0000-0000-0000000a3203') <> 'helper' then raise exception 'FAIL set read only'; end if;
  perform pg_temp.must_fail(format('select public.set_member_access(%L, %L, %L)', fid, '00000000-0000-0000-0000-0000000a3203', 'boss'), 'Pick full access or read only.');
  perform pg_temp.must_fail(format('select public.set_member_access(%L, auth.uid(), %L)', fid, 'read_only'), 'owner_access');
  perform pg_temp.must_fail(format('select public.leave_family(%L)', fid), 'owner_leave');
  -- transfer: only to a full-access member, not to yourself
  perform pg_temp.must_fail(format('select public.transfer_family_ownership(%L, %L)', fid, '00000000-0000-0000-0000-0000000a3203'), 'needs_full_access');
  perform pg_temp.must_fail(format('select public.transfer_family_ownership(%L, auth.uid())', fid), 'already_owner');
  perform pg_temp.must_fail(format('select public.transfer_family_ownership(%L, %L)', fid, '00000000-0000-0000-0000-0000000a3006'), 'not a member%');
  perform public.transfer_family_ownership(fid, '00000000-0000-0000-0000-0000000a3202');
  if public.is_family_owner(fid) then raise exception 'FAIL Oli is still the owner'; end if;
  if not public.is_parent_of(fid) then raise exception 'FAIL Oli lost full access'; end if;
  if (select count(*) from family_member_invites) <> 0 then raise exception 'FAIL the old owner reads the invites'; end if;
  perform pg_temp.must_fail(format('select public.set_trial_reminder(%L, false)', fid), 'not the family owner%');
  perform pg_temp.must_fail(format('select public.remove_family_member(%L, %L)', fid, '00000000-0000-0000-0000-0000000a3202'), 'not the family owner%');
end $$;
reset role;
do $$ begin
  if not exists (select 1 from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[dee32]' and x->>'title' = 'Oli made you the owner of The Oak family') then
    raise exception 'FAIL new owner not told'; end if;
end $$;
set role authenticated;
-- Dee is the owner now: she sees Kai's invite, manages billing; Oli (the old owner) can leave
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3202');
do $$ declare fid uuid := (select v::uuid from ctx where k = 'fam32'); m jsonb := public.family_members((select v::uuid from ctx where k = 'fam32')); begin
  if not (m->>'i_own')::boolean or m->>'owner' <> '00000000-0000-0000-0000-0000000a3202' or jsonb_array_length(m->'invites') <> 1
     or m->'members'->0->>'name' <> 'Dee Oak' then raise exception 'FAIL new owner list %', m; end if;
  perform public.set_trial_reminder(fid, false);
  perform public.cancel_member_invite(((select v::jsonb from ctx where k = 'inv32kai')->>'id')::uuid);
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3201');
select public.leave_family((select v::uuid from ctx where k = 'fam32'));
do $$ begin
  if exists (select 1 from family_parents where user_id = auth.uid()) then raise exception 'FAIL Oli didn''t leave'; end if;
  if (select count(*) from kids where family_id = (select v::uuid from ctx where k = 'fam32')) <> 0 then raise exception 'FAIL Oli still sees the kids'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3202');
do $$ begin
  if (select count(*) from family_parents where family_id = (select v::uuid from ctx where k = 'fam32')) <> 2 then raise exception 'FAIL 2 left'; end if;
end $$;
reset role;

-- 33. Parent phones (migration 33): nobody reads profiles.phone from the table; family_contacts gives the family's
-- adults (with phones) to its members (full access and read only) and to sitters who signed the notice, no one else.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000a3301', 'pam33@example.com'),
  ('00000000-0000-0000-0000-0000000a3302', 'sky33@example.com'),
  ('00000000-0000-0000-0000-0000000a3303', 'nia33@example.com'),
  ('00000000-0000-0000-0000-0000000a3304', 'gus33@example.com'),
  ('00000000-0000-0000-0000-0000000a3305', 'dan33@example.com');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3301');
insert into ctx values ('fam33', (select public.create_family('The Pine family', 'Pam Pine')::text));
insert into ctx values ('code33a', (select public.create_invite((select v::uuid from ctx where k = 'fam33'), 'Sky')));
insert into ctx values ('code33b', (select public.create_invite((select v::uuid from ctx where k = 'fam33'), 'Nia')));
do $$ begin
  if public.set_my_phone(' (813) 555-0142 ') <> '(813) 555-0142' then raise exception 'FAIL set phone'; end if;
  if public.my_phone() <> '(813) 555-0142' then raise exception 'FAIL my_phone'; end if;
  perform pg_temp.must_fail($q$select public.set_my_phone('call me')$q$, 'Enter a phone number%');
  perform pg_temp.must_fail($q$select public.set_my_phone('12345')$q$, 'Enter a phone number%');
  perform pg_temp.must_fail($q$select public.set_my_phone('+1 813 555 0142 0000 99')$q$, 'Enter a phone number%');
  -- the column itself isn't readable, not even her own; the rest of the row is
  perform pg_temp.must_fail($q$select phone from profiles where id = auth.uid()$q$, 'permission denied%');
  perform pg_temp.must_fail($q$select * from profiles where id = auth.uid()$q$, 'permission denied%');
  if (select full_name from profiles where id = auth.uid()) <> 'Pam Pine' then raise exception 'FAIL profile columns lost'; end if;
end $$;
-- Sky accepts and signs; Nia only accepts (no notice yet)
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3302');
select public.accept_invite((select v from ctx where k = 'code33a'), 'Sky Lane');
select public.sign_consent((select v::uuid from ctx where k = 'fam33'), 'Sky Lane', 'notice-1.0', 'terms-1.0');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3303');
select public.accept_invite((select v from ctx where k = 'code33b'), 'Nia Ross');
-- Dan joins as a read-only member (helper) with his own phone; Gus is in no family
reset role;
insert into profiles (id, full_name, role) values ('00000000-0000-0000-0000-0000000a3305', 'Dan Pine', 'parent') on conflict (id) do update set full_name = excluded.full_name;
insert into family_parents (family_id, user_id, role, relation) select v::uuid, '00000000-0000-0000-0000-0000000a3305', 'helper', 'Dad' from ctx where k = 'fam33';
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3305');
select public.set_my_phone('813.555.0199');
do $$ declare fid uuid := (select v::uuid from ctx where k = 'fam33'); n int; begin
  -- read-only member: sees both adults, owner first
  select count(*) into n from public.family_contacts(fid);
  if n <> 2 then raise exception 'FAIL helper sees % contacts', n; end if;
  if (select full_name || '|' || phone from public.family_contacts(fid) limit 1) <> 'Pam Pine|(813) 555-0142' then raise exception 'FAIL owner first'; end if;
  perform pg_temp.must_fail($q$select phone from profiles$q$, 'permission denied%');
end $$;
-- full-access member (the owner) sees Dan's phone too
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3301');
do $$ begin
  if (select phone from public.family_contacts((select v::uuid from ctx where k = 'fam33')) where relation = 'Dad') <> '813.555.0199' then raise exception 'FAIL owner reads Dan''s phone'; end if;
end $$;
-- the signed sitter gets names, relations and phones; she still can't read the column
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3302');
do $$ declare fid uuid := (select v::uuid from ctx where k = 'fam33'); begin
  if (select string_agg(full_name || ':' || coalesce(phone, '-'), ',') from public.family_contacts(fid)) <> 'Pam Pine:(813) 555-0142,Dan Pine:813.555.0199' then
    raise exception 'FAIL sitter contacts %', (select string_agg(full_name || ':' || coalesce(phone, '-'), ',') from public.family_contacts(fid)); end if;
  perform pg_temp.must_fail($q$select phone from profiles where id = '00000000-0000-0000-0000-0000000a3301'$q$, 'permission denied%');
  if (select full_name from profiles where id = '00000000-0000-0000-0000-0000000a3301') <> 'Pam Pine' then raise exception 'FAIL sitter lost parent names'; end if;
  -- not for a family she doesn't sit for
  perform pg_temp.must_fail(format('select * from public.family_contacts(%L)', (select v from ctx where k = 'fam30')), 'not allowed');
end $$;
-- the sitter who hasn't signed the notice, a stranger and signed-out callers get nothing
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3303');
do $$ begin
  perform pg_temp.must_fail(format('select * from public.family_contacts(%L)', (select v from ctx where k = 'fam33')), 'not allowed');
  perform pg_temp.must_fail($q$select phone from profiles$q$, 'permission denied%');
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3304');
do $$ begin
  perform pg_temp.must_fail(format('select * from public.family_contacts(%L)', (select v from ctx where k = 'fam33')), 'not allowed');
  perform pg_temp.must_fail($q$select public.family_contacts(null)$q$, 'not allowed');
end $$;
reset role;
set role anon;
do $$ begin
  begin perform public.family_contacts((select v::uuid from ctx where k = 'fam33')); raise exception 'FAIL anon reads contacts'; exception when insufficient_privilege then null; end;
  begin perform public.set_my_phone('8135550142'); raise exception 'FAIL anon sets a phone'; exception when insufficient_privilege then null; end;
end $$;
reset role;
-- a removed sitter loses them
update family_sitters set status = 'removed' where sitter_id = '00000000-0000-0000-0000-0000000a3302';
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3302');
do $$ begin
  perform pg_temp.must_fail(format('select * from public.family_contacts(%L)', (select v from ctx where k = 'fam33')), 'not allowed');
end $$;
-- clearing works
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3301');
do $$ begin
  if public.set_my_phone('  ') is not null then raise exception 'FAIL clear phone'; end if;
end $$;
do $$ begin
  if public.my_phone() is not null then raise exception 'FAIL phone still there'; end if;
end $$;
reset role;

-- 34. Edit tasks on a booked shift (migration 34, P5e). Ria Moss (parent), Sol Diaz (sitter), Han Moss (read only):
-- only full-access parents add / change / remove tasks, only on an upcoming or live shift, each change pushes the
-- sitter; nobody changes the tasks of a completed or cancelled shift, not even directly.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000a3401', 'ria34@example.com'),
  ('00000000-0000-0000-0000-0000000a3402', 'sol34@example.com'),
  ('00000000-0000-0000-0000-0000000a3403', 'han34@example.com');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3401');
insert into ctx values ('fam34', (select public.create_family('The Moss family', 'Ria Moss')::text));
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3402');
select public.register_push_token('ExponentPushToken[sol34]', 'ios');
reset role;
update profiles set full_name = 'Sol Diaz' where id = '00000000-0000-0000-0000-0000000a3402';
insert into profiles (id, full_name, role) values ('00000000-0000-0000-0000-0000000a3403', 'Han Moss', 'parent') on conflict (id) do update set full_name = excluded.full_name;
insert into family_parents (family_id, user_id, role, relation) select v::uuid, '00000000-0000-0000-0000-0000000a3403', 'helper', 'Grandpa' from ctx where k = 'fam34';
insert into family_sitters (family_id, sitter_id, status) select v::uuid, '00000000-0000-0000-0000-0000000a3402', 'active' from ctx where k = 'fam34';
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
  select v::uuid, '00000000-0000-0000-0000-0000000a3402', now() + interval '1 day', now() + interval '1 day 4 hours', '00000000-0000-0000-0000-0000000a3401' from ctx where k = 'fam34';
insert into ctx select 'shift34', id::text from shifts where family_id = (select v::uuid from ctx where k = 'fam34');
-- an older shift that's done, with one task
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by, status, clock_in_at, clock_out_at)
  select v::uuid, '00000000-0000-0000-0000-0000000a3402', now() - interval '3 days', now() - interval '3 days' + interval '4 hours', '00000000-0000-0000-0000-0000000a3401', 'completed', now() - interval '3 days', now() - interval '3 days' + interval '4 hours' from ctx where k = 'fam34';
insert into ctx select 'old34', id::text from shifts where family_id = (select v::uuid from ctx where k = 'fam34') and status = 'completed';
alter table shift_tasks disable trigger shift_tasks_open_only;
insert into shift_tasks (shift_id, title) select v::uuid, 'Old task' from ctx where k = 'old34';
alter table shift_tasks enable trigger shift_tasks_open_only;
insert into ctx select 'oldtask34', id::text from shift_tasks where shift_id = (select v::uuid from ctx where k = 'old34');
delete from net.sent;
set role authenticated;
-- Ria adds a task with a time; Sol is told; position goes to the end
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3401');
insert into shift_tasks (shift_id, title, position) select v::uuid, 'Bath', 0 from ctx where k = 'shift34';
do $$ declare sid uuid := (select v::uuid from ctx where k = 'shift34'); r shift_tasks; begin
  r := public.add_shift_task(sid, '  Pick up   milk ', (select starts_at + interval '1 hour' from shifts where id = sid));
  if r.title <> 'Pick up milk' or r.position <> 1 then raise exception 'FAIL add_shift_task %', r; end if;
  insert into ctx values ('task34', r.id::text);
  perform pg_temp.must_fail(format('select public.add_shift_task(%L, %L)', sid, '   '), 'Add what needs doing.');
  perform pg_temp.must_fail(format('select public.add_shift_task(%L, %L, %L)', sid, 'Too late', now() + interval '5 days'), 'Pick a time during the shift.');
end $$;
reset role;
do $$ declare sid text := (select v from ctx where k = 'shift34'); begin
  if not exists (select 1 from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[sol34]'
                 and x->>'title' = 'Ria added a task: Pick up milk' and x->'data'->>'url' = '/sitter/shift/' || sid) then
    raise exception 'FAIL sitter not told about the new task %', (select json_agg(body) from net.sent); end if;
  if (select count(*) from net.sent) <> 1 then raise exception 'FAIL booking-time insert or a refused add pushed'; end if;
end $$;
delete from net.sent;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3401');
-- no time is fine; edit: title and time change -> push; saving the same values again sends nothing
do $$ declare tid uuid := (select v::uuid from ctx where k = 'task34'); r shift_tasks; begin
  perform public.add_shift_task((select v::uuid from ctx where k = 'shift34'), 'Tidy toys');
  r := public.edit_shift_task(tid, 'Pick up oat milk', null);
  if r.title <> 'Pick up oat milk' or r.due_at is not null then raise exception 'FAIL edit_shift_task %', r; end if;
  perform public.edit_shift_task(tid, 'Pick up oat milk', null);
end $$;
reset role;
do $$ begin
  if (select string_agg(x->>'title', ' | ' order by s.id) from net.sent s, jsonb_array_elements(body) x) <> 'Ria added a task: Tidy toys | Ria changed a task: Pick up oat milk' then
    raise exception 'FAIL edit pushes %', (select string_agg(x->>'title', ' | ' order by s.id) from net.sent s, jsonb_array_elements(body) x); end if;
end $$;
delete from net.sent;
set role authenticated;
-- Sol (sitter), Han (read only) and a stranger can't add, edit or remove; Sol and Han still read them
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3402');
do $$ declare sid uuid := (select v::uuid from ctx where k = 'shift34'); tid uuid := (select v::uuid from ctx where k = 'task34'); begin
  if (select count(*) from shift_tasks where shift_id = sid) <> 3 then raise exception 'FAIL sitter reads % tasks', (select count(*) from shift_tasks where shift_id = sid); end if;
  perform pg_temp.must_fail(format('select public.add_shift_task(%L, %L)', sid, 'Sitter task'), 'not allowed');
  perform pg_temp.must_fail(format('select public.edit_shift_task(%L, %L)', tid, 'Mine'), 'not allowed');
  perform pg_temp.must_fail(format('select public.delete_shift_task(%L)', tid), 'not allowed');
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3403');
do $$ declare sid uuid := (select v::uuid from ctx where k = 'shift34'); tid uuid := (select v::uuid from ctx where k = 'task34'); n int; begin
  if (select count(*) from shift_tasks where shift_id = sid) <> 3 then raise exception 'FAIL helper reads tasks'; end if;
  perform pg_temp.must_fail(format('select public.add_shift_task(%L, %L)', sid, 'Grandpa task'), 'not allowed');
  perform pg_temp.must_fail(format('select public.delete_shift_task(%L)', tid), 'not allowed');
  update shift_tasks set title = 'x' where id = tid;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL helper updated a task directly'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin
  perform pg_temp.must_fail(format('select public.add_shift_task(%L, %L)', (select v from ctx where k = 'shift34'), 'x'), 'not allowed');
  perform pg_temp.must_fail(format('select public.delete_shift_task(%L)', (select v from ctx where k = 'task34')), 'not allowed');
end $$;
-- a completed shift: the functions refuse, and so does a direct write
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3401');
do $$ declare old uuid := (select v::uuid from ctx where k = 'old34'); ot uuid := (select v::uuid from ctx where k = 'oldtask34'); begin
  perform pg_temp.must_fail(format('select public.add_shift_task(%L, %L)', old, 'Late add'), 'This shift is over%');
  perform pg_temp.must_fail(format('select public.edit_shift_task(%L, %L)', ot, 'Renamed'), 'This shift is over%');
  perform pg_temp.must_fail(format('select public.delete_shift_task(%L)', ot), 'This shift is over%');
  perform pg_temp.must_fail(format('insert into shift_tasks (shift_id, title) values (%L, %L)', old, 'Direct'), 'This shift is over%');
  perform pg_temp.must_fail(format('update shift_tasks set title = %L where id = %L', 'Direct', ot), 'This shift is over%');
  perform pg_temp.must_fail(format('delete from shift_tasks where id = %L', ot), 'This shift is over%');
end $$;
-- live shift: still editable; delete pushes "removed"
reset role;
update shifts set starts_at = now() - interval '10 minutes', ends_at = now() + interval '3 hours' where id = (select v::uuid from ctx where k = 'shift34');
delete from net.sent;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3402');
select public.clock_in((select v::uuid from ctx where k = 'shift34'));
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3401');
do $$ declare tid uuid := (select v::uuid from ctx where k = 'task34'); begin
  perform public.delete_shift_task(tid);
  if exists (select 1 from shift_tasks where id = tid) then raise exception 'FAIL task not deleted'; end if;
  perform public.add_shift_task((select v::uuid from ctx where k = 'shift34'), 'Snack');
end $$;
reset role;
do $$ begin
  if not exists (select 1 from net.sent, jsonb_array_elements(body) x where x->>'title' = 'Ria removed a task: Pick up oat milk') then raise exception 'FAIL no push for the delete'; end if;
end $$;
-- cancelled: refused
reset role;
update shifts set status = 'cancelled' where id = (select v::uuid from ctx where k = 'shift34');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3401');
do $$ begin
  perform pg_temp.must_fail(format('select public.add_shift_task(%L, %L)', (select v from ctx where k = 'shift34'), 'x'), 'This shift is over%');
end $$;
reset role;
set role anon;
do $$ begin
  begin perform public.add_shift_task((select v::uuid from ctx where k = 'shift34'), 'x'); raise exception 'FAIL anon adds a task'; exception when insufficient_privilege then null; end;
end $$;
reset role;
-- deleting the shift itself still removes its tasks
delete from shifts where id = (select v::uuid from ctx where k = 'old34');
do $$ begin
  if exists (select 1 from shift_tasks where id = (select v::uuid from ctx where k = 'oldtask34')) then raise exception 'FAIL tasks left behind'; end if;
end $$;

-- 35. Booking requests (migration 35, P6d / P6e / S33s). Pia Moss (parent), Rae Diaz (her sitter), Oli Park (parent of
-- another family), the stranger. The booking drawer asks one sitter: a single date or a repeating series (one push);
-- only a full-access parent of the sitter's family can ask; the sitter reads only what was sent to her; she answers a
-- series at once: ticked dates are booked with their tasks (her time off on them given up), a clash is reported for
-- that date only, the rest declined; one push to the parents; the parent cancels what's left.
reset role;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000a3501', 'pia-parent@example.com'),
  ('00000000-0000-0000-0000-0000000a3502', 'rae-sitter@example.com'),
  ('00000000-0000-0000-0000-0000000a3503', 'oli-parent@example.com');
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3501');
insert into ctx values ('fam35', (select public.create_family('The Moss family', 'Pia Moss')::text));
insert into kids (family_id, name) select v::uuid, 'Nia' from ctx where k = 'fam35';
select public.register_push_token('ExponentPushToken[pia35]', 'ios');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3502');
select public.register_push_token('ExponentPushToken[rae35]', 'ios');
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3503');
insert into ctx values ('fam35b', (select public.create_family('The Park family', 'Oli Park')::text));
reset role;
update profiles set full_name = 'Rae Diaz' where id = '00000000-0000-0000-0000-0000000a3502';
insert into family_sitters (family_id, sitter_id, status) select v::uuid, '00000000-0000-0000-0000-0000000a3502', 'active' from ctx where k = 'fam35';
-- dates 20, 22, 24, 26 days out, 6 – 10 PM (UTC is fine here)
insert into ctx select 'w35', jsonb_agg(jsonb_build_object('starts', (current_date + d)::timestamptz + interval '18 hours',
  'ends', (current_date + d)::timestamptz + interval '22 hours', 'tasks', jsonb_build_array('6:30 Dinner · Nia', '  ', '8:00 Bath · Nia')) order by d)::text
  from unnest(array[20, 22, 24, 26]) d;
delete from net.sent;
set role authenticated;

-- Refused: a stranger, another family's parent, no dates, a past date, overlapping dates, more than 60 dates
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin
  perform pg_temp.must_fail(format('select public.create_booking_request(%L, %L::jsonb, %L, null)', '00000000-0000-0000-0000-0000000a3502', (select v from ctx where k = 'w35'), '{}'), 'you can only ask%');
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3503');
do $$ begin
  perform pg_temp.must_fail(format('select public.create_booking_request(%L, %L::jsonb, %L, null)', '00000000-0000-0000-0000-0000000a3502', (select v from ctx where k = 'w35'), '{}'), 'you can only ask%');
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3501');
do $$ declare rae text := '00000000-0000-0000-0000-0000000a3502'; begin
  perform pg_temp.must_fail(format('select public.create_booking_request(%L, %L::jsonb, %L, null)', rae, '[]', '{}'), 'pick a day and time');
  perform pg_temp.must_fail(format('select public.create_booking_request(%L, %L::jsonb, %L, null)', rae,
    jsonb_build_array(jsonb_build_object('starts', now() - interval '1 hour', 'ends', now() + interval '2 hours')), '{}'), 'pick a time that hasn''t started yet');
  perform pg_temp.must_fail(format('select public.create_booking_request(%L, %L::jsonb, %L, null)', rae,
    jsonb_build_array(jsonb_build_object('starts', now() + interval '1 day', 'ends', now() + interval '1 day 3 hours'),
                      jsonb_build_object('starts', now() + interval '1 day 2 hours', 'ends', now() + interval '1 day 5 hours')), '{}'), 'two of these dates overlap');
  perform pg_temp.must_fail(format('select public.create_booking_request(%L, %L::jsonb, %L, null)', rae,
    (select jsonb_agg(jsonb_build_object('starts', now() + make_interval(days => d), 'ends', now() + make_interval(days => d, hours => 2))) from generate_series(1, 61) d), '{}'), 'ask for at most 60 dates%');
  if (select count(*) from shift_requests) <> 0 then raise exception 'FAIL a refused request was saved'; end if;
end $$;

-- A single date with tasks, then a 4-date series; one push each to Rae
do $$ declare res jsonb; begin
  res := public.create_booking_request('00000000-0000-0000-0000-0000000a3502',
    jsonb_build_array(jsonb_build_object('starts', (current_date + 15)::timestamptz + interval '18 hours', 'ends', (current_date + 15)::timestamptz + interval '22 hours',
      'tasks', jsonb_build_array('7:00 Snack · Nia'))), '{}', null, 'Back by 10');
  if res->>'series_id' is not null or jsonb_array_length(res->'request_ids') <> 1 then raise exception 'FAIL single booking request %', res; end if;
  insert into ctx values ('one35', res->'request_ids'->>0);
  res := public.create_booking_request('00000000-0000-0000-0000-0000000a3502', (select v::jsonb from ctx where k = 'w35'), '{}', null);
  if res->>'series_id' is null or jsonb_array_length(res->'request_ids') <> 4 then raise exception 'FAIL series %', res; end if;
  insert into ctx values ('ser35', res->>'series_id');
  if (select count(*) from shift_requests where series_id = (res->>'series_id')::uuid and kind = 'booking' and first_to_accept and expires_at = starts_at
      and tasks = array['6:30 Dinner · Nia', '8:00 Bath · Nia'] and cardinality(kid_ids) = 1) <> 4 then raise exception 'FAIL series rows'; end if;
  if (select count(*) from shift_request_sitters) <> 5 then raise exception 'FAIL parent reads the asked rows'; end if;
end $$;
reset role;
do $$ begin
  if (select count(*) from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[rae35]') <> 2 then
    raise exception 'FAIL expected two pushes to the sitter %', (select json_agg(body) from net.sent); end if;
  if not exists (select 1 from net.sent, jsonb_array_elements(body) x where x->>'title' = 'Pia asks you to sit') then raise exception 'FAIL single push'; end if;
  if not exists (select 1 from net.sent, jsonb_array_elements(body) x where x->>'title' = 'Pia asks you to sit 4 times'
                 and x->>'body' ~ '^[A-Z][a-z]{2}(, [A-Z][a-z]{2})* · [A-Z][a-z]{2} \d+ – [A-Z][a-z]{2} \d+ · ') then
    raise exception 'FAIL series push %', (select json_agg(body) from net.sent); end if;
end $$;
delete from net.sent;
-- Rae already has a shift on the third date (Pia booked it by hand earlier) and time off on the second
insert into shifts (family_id, sitter_id, starts_at, ends_at, created_by)
  select v::uuid, '00000000-0000-0000-0000-0000000a3502', (current_date + 24)::timestamptz + interval '17 hours', (current_date + 24)::timestamptz + interval '19 hours',
    '00000000-0000-0000-0000-0000000a3501' from ctx where k = 'fam35';
insert into sitter_time_off (sitter_id, starts, ends, note) values ('00000000-0000-0000-0000-0000000a3502', current_date + 21, current_date + 23, 'Away');
set role authenticated;

-- Oli and the stranger see nothing and can't answer
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3503');
do $$ begin
  if (select count(*) from shift_requests) + (select count(*) from shift_request_sitters) <> 0 then raise exception 'FAIL other family sees the requests'; end if;
  perform pg_temp.must_fail(format('select public.answer_booking_series(%L, %L)', (select v from ctx where k = 'ser35'), '{}'), 'this request wasn''t sent to you');
  perform pg_temp.must_fail(format('select public.cancel_shift_request(%L)', (select v from ctx where k = 'one35')), 'request not found');
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin
  if (select count(*) from shift_requests) <> 0 then raise exception 'FAIL stranger sees booking requests'; end if;
end $$;

-- Rae reads her five, accepts dates 1 – 3 (giving up her time off) and leaves date 4: 1 and 2 booked with their
-- tasks, 3 clashes (reported, still open), 4 declined
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3502');
do $$ declare ids uuid[]; res jsonb; begin
  if (select count(*) from shift_requests) <> 5 or (select count(*) from shift_request_sitters) <> 5 then raise exception 'FAIL sitter reads her requests'; end if;
  ids := array(select id from shift_requests where series_id = (select v::uuid from ctx where k = 'ser35') order by starts_at);
  res := public.answer_booking_series((select v::uuid from ctx where k = 'ser35'), ids[1:3], true);
  if (select string_agg(x->>'result', ',' order by o) from jsonb_array_elements(res) with ordinality t(x, o)) <> 'booked,booked,busy,declined' then
    raise exception 'FAIL series answer %', res; end if;
  if (select count(*) from shifts s join shift_requests q on q.shift_id = s.id where q.series_id = (select v::uuid from ctx where k = 'ser35') and s.sitter_id = auth.uid()) <> 2 then
    raise exception 'FAIL booked shifts'; end if;
  if (select count(*) from shift_tasks t join shift_requests q on q.shift_id = t.shift_id where q.id = ids[1]) <> 2 then raise exception 'FAIL tasks not on the shift'; end if;
  if (select string_agg(title, '|' order by position) from shift_tasks t join shift_requests q on q.shift_id = t.shift_id where q.id = ids[2]) <> '6:30 Dinner · Nia|8:00 Bath · Nia' then
    raise exception 'FAIL task order'; end if;
  if exists (select 1 from sitter_time_off where starts <= current_date + 22 and ends >= current_date + 22) then raise exception 'FAIL time off not given up'; end if;
  if (select count(*) from sitter_time_off) <> 2 then raise exception 'FAIL time off not split around the date'; end if;
  if (select status from shift_requests where id = ids[3]) <> 'open' or (select status from shift_requests where id = ids[4]) <> 'open' then raise exception 'FAIL unbooked dates closed'; end if;
  if (select status from shift_request_sitters where request_id = ids[4]) <> 'declined' then raise exception 'FAIL not declined'; end if;
  insert into ctx values ('ser35_3', ids[3]::text);
  -- answering again changes nothing that was answered
  res := public.answer_booking_series((select v::uuid from ctx where k = 'ser35'), '{}');
  if (select string_agg(x->>'result', ',' order by o) from jsonb_array_elements(res) with ordinality t(x, o)) <> 'filled,filled,declined,declined' then
    raise exception 'FAIL second answer %', res; end if;
end $$;
reset role;
do $$ begin
  if not exists (select 1 from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[pia35]' and x->>'title' = 'Rae accepted 2 of 4 shifts') then
    raise exception 'FAIL answer push %', (select json_agg(body) from net.sent); end if;
  if (select count(*) from net.sent, jsonb_array_elements(body) x where x->>'to' = 'ExponentPushToken[pia35]') <> 2 then raise exception 'FAIL one push per answer'; end if;
end $$;
set role authenticated;

-- Pia sees the answers and cancels the date that's still open; the single date: Rae accepts, it's booked with its task
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3501');
do $$ begin
  if (select count(*) from shift_requests where series_id = (select v::uuid from ctx where k = 'ser35') and status = 'filled') <> 2 then raise exception 'FAIL parent sees filled'; end if;
  perform public.cancel_shift_request((select v::uuid from ctx where k = 'ser35_3'));
  if (select status from shift_requests where id = (select v::uuid from ctx where k = 'ser35_3')) <> 'cancelled' then raise exception 'FAIL cancel a date'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000a3502');
do $$ declare res jsonb; begin
  res := public.accept_shift_request((select v::uuid from ctx where k = 'one35'));
  if res->>'result' <> 'booked' then raise exception 'FAIL single accept %', res; end if;
  if (select string_agg(title, '|') from shift_tasks where shift_id = (res->>'shift_id')::uuid) <> '7:00 Snack · Nia' then raise exception 'FAIL single task'; end if;
end $$;
reset role;

select 'ALL RLS SCENARIOS PASSED' as result;
