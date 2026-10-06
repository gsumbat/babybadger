-- Messages (wireframes P10 Messages with sitter, S37 Messages). One thread per family × sitter: the family's
-- parents and that sitter. Only a sitter who has signed the family's notice (status 'active') can read or write;
-- parents keep reading a removed sitter's old thread but can't write to it.
-- Read markers are per person (two parents read separately); the sitter's photo shows "seen" once a parent read it.
-- A new message pushes to the other side through Expo (same path as migration 05).

create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null,
  sitter_id   uuid not null,
  author_id   uuid not null references auth.users (id),
  body        text not null default '' check (char_length(body) <= 2000),
  photo_path  text,
  created_at  timestamptz not null default now(),
  foreign key (family_id, sitter_id) references public.family_sitters (family_id, sitter_id) on delete cascade,
  check (body <> '' or photo_path is not null)
);
create index messages_thread_time on public.messages (family_id, sitter_id, created_at desc);

create table public.message_reads (
  family_id   uuid not null,
  sitter_id   uuid not null,
  user_id     uuid not null references auth.users (id) on delete cascade,
  read_at     timestamptz not null default now(),
  primary key (family_id, sitter_id, user_id),
  foreign key (family_id, sitter_id) references public.family_sitters (family_id, sitter_id) on delete cascade
);

-- Can the signed-in user read this thread? Parents of the family, or the sitter herself once she has signed.
create or replace function public.can_read_thread(fid uuid, sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_parent_of(fid) or (sid = auth.uid() and public.is_sitter_of(fid));
$$;

-- Can the signed-in user write to it? Same people, and the sitter must still be active in the family.
create or replace function public.can_write_thread(fid uuid, sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_sitter_of_family(fid, sid) and (public.is_parent_of(fid) or (sid = auth.uid() and public.is_sitter_of(fid)));
$$;

alter table public.messages enable row level security;
alter table public.message_reads enable row level security;

create policy messages_read on public.messages for select using (public.can_read_thread(family_id, sitter_id));
create policy messages_insert on public.messages for insert
  with check (author_id = auth.uid() and public.can_write_thread(family_id, sitter_id));
-- No update or delete: a sent message stays as it was.

create policy message_reads_read on public.message_reads for select using (public.can_read_thread(family_id, sitter_id));
-- Markers are written only through mark_thread_read().

create or replace function public.mark_thread_read(p_family uuid, p_sitter uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  if not can_read_thread(p_family, p_sitter) then raise exception 'not your thread'; end if;
  insert into message_reads (family_id, sitter_id, user_id, read_at) values (p_family, p_sitter, auth.uid(), now())
    on conflict (family_id, sitter_id, user_id) do update set read_at = now();
end $$;

-- Unread messages (from anyone else) per thread the signed-in user can read: the tab badge and the S37 chips.
create or replace function public.unread_messages() returns table (family_id uuid, sitter_id uuid, unread int)
language sql stable security definer set search_path = public as $$
  select m.family_id, m.sitter_id, count(*)::int
  from messages m
  left join message_reads r on r.family_id = m.family_id and r.sitter_id = m.sitter_id and r.user_id = auth.uid()
  where m.author_id <> auth.uid()
    and can_read_thread(m.family_id, m.sitter_id)
    and m.created_at > coalesce(r.read_at, '-infinity'::timestamptz)
  group by m.family_id, m.sitter_id;
$$;

-- Sends one alert to every phone of the given people (like notify_parents in migration 05, for any list).
create or replace function public.notify_users(p_users uuid[], p_title text, p_body text, p_url text)
returns void language plpgsql security definer set search_path = public as $$
declare msgs jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
      'to', t.token, 'title', p_title, 'body', p_body, 'sound', 'default', 'data', jsonb_build_object('url', p_url))), '[]'::jsonb)
    into msgs
    from push_tokens t
    where t.user_id = any(p_users);
  if jsonb_array_length(msgs) = 0 then return; end if;
  perform net.http_post(
    url := 'https://exp.host/--/api/v2/push/send',
    body := msgs,
    headers := '{"Content-Type": "application/json", "Accept": "application/json"}'::jsonb);
exception when others then
  raise warning 'push not sent: %', sqlerrm;
end $$;

-- New message → everyone else in the thread. Sitter writes: the parents (opens P10 on that sitter).
-- A parent writes: the sitter (opens S37 on that family) and the other parent.
create or replace function public.push_on_message() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  who text := coalesce((select nullif(split_part(trim(full_name), ' ', 1), '') from profiles where id = new.author_id), 'BabyBadger');
  body text := coalesce(nullif(new.body, ''), 'Sent a photo');
  parents uuid[] := array(select user_id from family_parents where family_id = new.family_id and user_id <> new.author_id);
begin
  if new.author_id = new.sitter_id then
    perform notify_users(parents, who, body, '/parent/messages?sitter=' || new.sitter_id);
  else
    perform notify_users(array[new.sitter_id], who, body, '/sitter/messages?family=' || new.family_id);
    perform notify_users(parents, who, body, '/parent/messages?sitter=' || new.sitter_id);
  end if;
  return new;
end $$;
create trigger messages_push after insert on public.messages for each row execute function public.push_on_message();

-- Photos the sitter sends ("Send a photo", S37). Private bucket, path <family_id>/<sitter_id>/<file>.jpg.
-- Skipped where there is no storage schema (the plain-Postgres RLS test).
do $$ begin
  if to_regclass('storage.objects') is not null then
    insert into storage.buckets (id, name, public) values ('message-photos', 'message-photos', false) on conflict (id) do nothing;
    execute $p$create policy "thread members upload message photos" on storage.objects for insert to authenticated
      with check (bucket_id = 'message-photos'
        and public.can_write_thread(((storage.foldername(name))[1])::uuid, ((storage.foldername(name))[2])::uuid))$p$;
    execute $p$create policy "thread members read message photos" on storage.objects for select to authenticated
      using (bucket_id = 'message-photos'
        and public.can_read_thread(((storage.foldername(name))[1])::uuid, ((storage.foldername(name))[2])::uuid))$p$;
  end if;
end $$;

-- Live threads and badges.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.messages, public.message_reads;
  end if;
end $$;

-- Explicit access (the blanket grant in migration 03 only covered tables that existed then).
grant select, insert on public.messages to authenticated;
grant select on public.message_reads to authenticated;
grant all on public.messages, public.message_reads to service_role;
revoke all on public.messages, public.message_reads from anon;
revoke execute on function public.can_read_thread(uuid, uuid), public.can_write_thread(uuid, uuid) from anon, public;
grant execute on function public.can_read_thread(uuid, uuid), public.can_write_thread(uuid, uuid) to authenticated, service_role;
revoke execute on function public.mark_thread_read(uuid, uuid), public.unread_messages() from anon, public;
grant execute on function public.mark_thread_read(uuid, uuid), public.unread_messages() to authenticated;
revoke execute on function public.notify_users(uuid[], text, text, text) from public, anon, authenticated;
revoke execute on function public.push_on_message() from public, anon, authenticated;
