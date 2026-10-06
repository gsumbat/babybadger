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

select 'ALL RLS SCENARIOS PASSED' as result;
