-- Requirement requests: the family's requirements become a request form between a family and their sitter
-- (wireframes P11 / P7a status rows, P79 Ask sheet, P79b document viewer, P79c viewer for a helper, S53 requests,
-- S53b share a credential, S53c "I don't have it", S17d upload a background check). Needs migrations 19, 20, 22, 23
-- and 30 (is_family_member, family_parent_ids). Re-runnable.
--
-- Phase 1 is "bring your own sitter": BabyBadger checks nothing. A parent asks, the sitter shares what she has, and
-- the family looks at it themselves.
--   * requirement_requests: one row per (family, sitter, requirement). req_key = the requirement's key
--     (cpr_first_aid, non_smoker ...), or 'custom:<requirement id>' for a requirement the parent wrote (P31).
--     Languages aren't asked for: they come from her profile (S16), as before.
--   * status: asked (a parent asked) -> shared (she shared a card, a report or a confirmation) -> met (a parent tapped
--     "Looks good") | declined (she said she doesn't have it). "Ask again" puts a shared row back to asked with a note.
--   * A requirement counts as met only when its row is 'met' (and the card she shared hasn't expired; a background
--     check also has to be inside the family's window). This drives the booking gate (Block booking) and every
--     "Meets N of M" line, through requirement_status_core.
--   * Sharing is per family: a card photo or report (sitter_credentials.file_path) is readable by a family only while
--     she has shared it with that family (status shared or met). Every member of the family (parents and helpers) can
--     look at it; only parents ask, review ("Looks good" / "Ask again") or remove a request.
--   * Replacing a shared card (new file or new dates) moves a 'met' row back to 'shared' so the parents look again.
--     Deleting the card puts the request back to 'asked'.
--   * S27's Yes / No (family_requirement_checks) on a self-confirmed requirement now shares it / declines it.
--   * Sitters may now add their own background check report (kind background_check, S17d). Nobody but the service
--     role sets verified_at.
-- Pushes: ask / review -> the sitter (opens S53); share / decline -> the family's parents (opens P79b / P11).

-- ---------------------------------------------------------------- fix: "Age 18 or older" couldn't be saved
-- Migration 20's key check allowed letters and underscores only, so P7a's age_18 (migration 22) was refused.
alter table public.family_requirements drop constraint if exists family_requirements_key_check;
alter table public.family_requirements add constraint family_requirements_key_check
  check (key = 'custom' or key ~ '^[a-z][a-z0-9_]*$' or key ~ '^language:.{1,40}$');

-- ---------------------------------------------------------------- table
create table if not exists public.requirement_requests (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references public.families (id) on delete cascade,
  sitter_id     uuid not null references auth.users (id) on delete cascade,
  req_key       text not null check (length(req_key) between 1 and 80),
  status        text not null default 'asked' check (status in ('asked', 'shared', 'met', 'declined')),
  note          text check (note is null or length(note) <= 300),
  asked_by      uuid references auth.users (id) on delete set null,
  asked_at      timestamptz,
  shared_at     timestamptz,
  credential_id uuid references public.sitter_credentials (id) on delete set null,
  sitter_note   text check (sitter_note is null or length(sitter_note) <= 300),
  reviewed_by   uuid references auth.users (id) on delete set null,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (family_id, sitter_id, req_key)
);
create index if not exists requirement_requests_sitter on public.requirement_requests (sitter_id);
create index if not exists requirement_requests_credential on public.requirement_requests (credential_id) where credential_id is not null;

-- ---------------------------------------------------------------- helpers
-- The request key of a requirement.
create or replace function public.req_key_of(r family_requirements) returns text
language sql immutable as $$
  select case when r.key = 'custom' then 'custom:' || r.id::text else r.key end;
$$;

-- The family's requirement behind a request key (null when it was removed).
create or replace function public.requirement_for_key(p_family uuid, p_key text) returns family_requirements
language sql stable security definer set search_path = public as $$
  select fr.* from family_requirements fr
  where fr.family_id = p_family and (fr.key = p_key or (fr.key = 'custom' and 'custom:' || fr.id::text = p_key))
  limit 1;
$$;

-- Shown title ("Speaks Spanish" for a language).
create or replace function public.req_title(r family_requirements) returns text
language sql immutable as $$
  select case when r.key like 'language:%' then 'Speaks ' || coalesce(nullif(r.details->>'language', ''), substr(r.key, 10)) else r.title end;
$$;

-- Which credential kinds she can share for it; null = self-declared (a confirmation and a note, no file).
create or replace function public.req_credential_kinds(r family_requirements) returns text[]
language sql immutable as $$
  select case
    when r.key = 'cpr_first_aid' then array['first_aid', 'cpr_child']
    when r.key in ('background_check', 'cpr_infant', 'cpr_child', 'first_aid', 'newborn_care', 'water_safety', 'vaccination', 'drivers_license') then array[r.key]
    when r.key = 'custom' and coalesce(r.details->>'proof', 'self') = 'document'
      then array['cpr_infant', 'cpr_child', 'first_aid', 'newborn_care', 'water_safety', 'drivers_license', 'background_check', 'vaccination', 'other']
    else null
  end;
$$;

-- "A sitter of this family" in any state but removed (she can be asked from the moment she accepts the invite).
create or replace function public.sitter_in_family(p_family uuid, p_sitter uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from family_sitters where family_id = p_family and sitter_id = p_sitter and status <> 'removed');
$$;

-- She shared this credential with a family the signed-in user belongs to.
create or replace function public.credential_shared_with_me(p_credential uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and exists (
    select 1 from requirement_requests rr
    where rr.credential_id = p_credential and rr.status in ('shared', 'met') and is_family_member(rr.family_id));
$$;

-- Storage read rule for sitter-files: her own files; her profile photo for families she's linked to; a card photo or
-- report only for a family she shared it with.
create or replace function public.can_read_sitter_file(p_name text) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and (
    split_part(p_name, '/', 1) = auth.uid()::text
    or (split_part(p_name, '/', 2) = 'photo' and split_part(p_name, '/', 1) ~ '^[0-9a-f-]{36}$'
        and sitter_can_be_seen_by(split_part(p_name, '/', 1)::uuid))
    or exists (
      select 1 from sitter_credentials sc join requirement_requests rr on rr.credential_id = sc.id
      where sc.file_path = p_name and rr.status in ('shared', 'met') and is_family_member(rr.family_id))
  );
$$;

-- ---------------------------------------------------------------- stamp
create or replace function public.requirement_requests_stamp() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    new.family_id := old.family_id;
    new.sitter_id := old.sitter_id;
    new.req_key := old.req_key;
    new.created_at := old.created_at;
  end if;
  new.updated_at := clock_timestamp();
  return new;
end $$;
drop trigger if exists requirement_requests_stamp on public.requirement_requests;
create trigger requirement_requests_stamp before insert or update on public.requirement_requests
  for each row execute function public.requirement_requests_stamp();

-- ---------------------------------------------------------------- row level security
alter table public.requirement_requests enable row level security;
drop policy if exists requirement_requests_read on public.requirement_requests;
create policy requirement_requests_read on public.requirement_requests for select
  using (sitter_id = auth.uid() or public.is_family_member(family_id));
-- No write policies: every change goes through the functions below.

revoke all on public.requirement_requests from anon, authenticated;
grant select (id, family_id, sitter_id, req_key, status, note, asked_by, asked_at, shared_at, credential_id, sitter_note,
              reviewed_by, reviewed_at, created_at, updated_at) on public.requirement_requests to authenticated;
grant all on public.requirement_requests to service_role;

-- sitter_credentials: families no longer read every certificate of their sitters. They read the ones BabyBadger
-- verified (P11 badges, for later) and the ones she shared with them.
drop policy if exists sitter_credentials_read on public.sitter_credentials;
create policy sitter_credentials_read on public.sitter_credentials for select using (
  sitter_id = auth.uid()
  or (verified_at is not null and public.sitter_can_be_seen_by(sitter_id))
  or public.credential_shared_with_me(id)
);
-- She may now add her own background check report (S17d); a provider's (verified) row stays read-only for her.
drop policy if exists sitter_credentials_own on public.sitter_credentials;
create policy sitter_credentials_own on public.sitter_credentials for all
  using (sitter_id = auth.uid() and (kind <> 'background_check' or verified_at is null))
  with check (sitter_id = auth.uid());

-- Storage: card photos and reports follow the sharing above.
do $$
begin
  if to_regclass('storage.objects') is null then return; end if;
  execute 'drop policy if exists "sitter files read" on storage.objects';
  execute $p$create policy "sitter files read" on storage.objects for select to authenticated
    using (bucket_id = 'sitter-files' and public.can_read_sitter_file(name))$p$;
end $$;

-- ---------------------------------------------------------------- status: only 'met' counts
-- Reason codes the app turns into words:
--   met:     valid | expiring (the shared card runs out within 30 days; expires_on says when) | speaks (language)
--   not met: not_asked | asked | shared (waiting for a parent) | declined | expired (the shared card ran out) |
--            too_old (background check older than the window) | missing (a language she doesn't list)
create or replace function public.requirement_status_core(p_family uuid, p_sitter uuid)
returns table (requirement_id uuid, met boolean, reason text, expires_on date)
language plpgsql stable security definer set search_path = public as $$
declare
  r family_requirements;
  q requirement_requests;
  c record;
  ok boolean;
  why text;
  exp date;
begin
  for r in select * from family_requirements fr where fr.family_id = p_family order by fr.position, fr.created_at loop
    ok := false; why := 'not_asked'; exp := null;
    if r.key like 'language:%' then
      why := 'missing';
      if exists (
        select 1 from sitter_languages sl
        where sl.sitter_id = p_sitter
          and lower(trim(sl.language)) = lower(trim(coalesce(nullif(r.details->>'language', ''), substr(r.key, 10))))
      ) then ok := true; why := 'speaks'; end if;
    else
      select * into q from requirement_requests rr where rr.family_id = p_family and rr.sitter_id = p_sitter and rr.req_key = req_key_of(r);
      if not found then
        why := 'not_asked';
      elsif q.status <> 'met' then
        why := q.status;
      elsif q.credential_id is null then
        ok := true; why := 'valid';
      else
        select sc.expires_on, sc.issued_on into c from sitter_credentials sc where sc.id = q.credential_id;
        if c.expires_on is not null and c.expires_on < current_date then
          why := 'expired'; exp := c.expires_on;
        elsif r.key = 'background_check' and c.issued_on is not null
            and c.issued_on < current_date - make_interval(months => coalesce(nullif(r.details->>'within_months', '')::int, 12)) then
          why := 'too_old';
        else
          ok := true; exp := c.expires_on;
          why := case when c.expires_on is not null and c.expires_on <= current_date + 30 then 'expiring' else 'valid' end;
        end if;
      end if;
    end if;
    requirement_id := r.id; met := ok; reason := why; expires_on := exp;
    return next;
  end loop;
end $$;

-- ---------------------------------------------------------------- RPCs
-- P79 Ask sheet: a parent asks one sitter of the family for some requirements. Rows already shared or met are left
-- alone; asked / declined ones are asked again. Pushes her once: "The Lee family asked for CPR and First Aid".
-- Returns how many were asked.
create or replace function public.ask_requirements(p_family uuid, p_sitter uuid, p_keys text[], p_note text default null)
returns int
language plpgsql security definer set search_path = public as $$
declare
  k text;
  r family_requirements;
  titles text[] := '{}';
  n int;
  v_note text := nullif(trim(coalesce(p_note, '')), '');
begin
  if not is_parent_of(p_family) then raise exception 'not a parent of this family'; end if;
  if not sitter_in_family(p_family, p_sitter) then raise exception 'not your sitter'; end if;
  if coalesce(cardinality(p_keys), 0) = 0 then raise exception 'Pick what to ask for.'; end if;
  if length(v_note) > 300 then raise exception 'Keep the note under 300 characters.'; end if;
  foreach k in array p_keys loop
    r := requirement_for_key(p_family, k);
    if r.id is null or r.key like 'language:%' then raise exception 'unknown requirement %', k; end if;
    insert into requirement_requests (family_id, sitter_id, req_key, status, note, asked_by, asked_at)
      values (p_family, p_sitter, req_key_of(r), 'asked', v_note, auth.uid(), now())
      on conflict (family_id, sitter_id, req_key) do update
        set status = 'asked', note = excluded.note, asked_by = excluded.asked_by, asked_at = excluded.asked_at,
            credential_id = null, shared_at = null, sitter_note = null, reviewed_by = null, reviewed_at = null
        where requirement_requests.status in ('asked', 'declined');
    get diagnostics n = row_count;
    if n > 0 and not (req_title(r) = any (titles)) then titles := titles || req_title(r); end if;
  end loop;
  if cardinality(titles) > 0 then
    perform notify_users(array[p_sitter], family_name_of(p_family) || ' asked for ' || array_to_string(titles, ', '),
      coalesce(v_note, 'Tap to share it, or say you don''t have it.'), '/sitter/requests');
  end if;
  return cardinality(titles);
end $$;

-- S53b: the sitter shares one of her own credentials of a matching kind, or (self-declared items) a confirmation
-- with an optional note. Pushes the family's parents: "Maya shared CPR and First Aid".
create or replace function public.share_requirement(p_request uuid, p_credential uuid default null, p_note text default null)
returns requirement_requests
language plpgsql security definer set search_path = public as $$
declare
  q requirement_requests;
  r family_requirements;
  kinds text[];
  c sitter_credentials;
  bday date;
  v_note text := nullif(trim(coalesce(p_note, '')), '');
begin
  select * into q from requirement_requests where id = p_request for update;
  if not found or q.sitter_id is distinct from auth.uid() then raise exception 'not your request'; end if;
  if not sitter_in_family(q.family_id, q.sitter_id) then raise exception 'not your family'; end if;
  r := requirement_for_key(q.family_id, q.req_key);
  if r.id is null then raise exception 'This family doesn''t ask for it anymore.'; end if;
  if length(v_note) > 300 then raise exception 'Keep the note under 300 characters.'; end if;
  kinds := req_credential_kinds(r);
  if kinds is not null then
    if p_credential is null then raise exception 'Pick one of your certificates to share.'; end if;
    select * into c from sitter_credentials where id = p_credential;
    if not found or c.sitter_id <> auth.uid() then raise exception 'not your credential'; end if;
    if not (c.kind = any (kinds)) then raise exception 'That one isn''t a % card.', req_title(r); end if;
    if c.expires_on is not null and c.expires_on < current_date then raise exception 'That one has expired. Add the new card first.'; end if;
  else
    if p_credential is not null then raise exception 'Nothing to attach for this one.'; end if;
    if r.key = 'age_18' then
      select birthdate into bday from sitter_profiles where sitter_id = auth.uid();
      if bday is not null and bday > current_date - interval '18 years' then raise exception 'under_18'; end if;
    end if;
  end if;
  update requirement_requests set status = 'shared', credential_id = p_credential, sitter_note = v_note, shared_at = now(),
    reviewed_by = null, reviewed_at = null
    where id = q.id returning * into q;
  perform notify_users(family_parent_ids(q.family_id), adult_first_name(auth.uid(), 'Your sitter') || ' shared ' || req_title(r),
    'Tap to see it.', '/parent/shared/' || q.id);
  return q;
end $$;

-- S53c: she says she doesn't have it (with an optional note). Pushes the parents.
create or replace function public.decline_requirement(p_request uuid, p_note text default null)
returns requirement_requests
language plpgsql security definer set search_path = public as $$
declare
  q requirement_requests;
  r family_requirements;
  v_note text := nullif(trim(coalesce(p_note, '')), '');
begin
  select * into q from requirement_requests where id = p_request for update;
  if not found or q.sitter_id is distinct from auth.uid() then raise exception 'not your request'; end if;
  if not sitter_in_family(q.family_id, q.sitter_id) then raise exception 'not your family'; end if;
  if length(v_note) > 300 then raise exception 'Keep the note under 300 characters.'; end if;
  r := requirement_for_key(q.family_id, q.req_key);
  update requirement_requests set status = 'declined', credential_id = null, sitter_note = v_note, shared_at = now(),
    reviewed_by = null, reviewed_at = null
    where id = q.id returning * into q;
  perform notify_users(family_parent_ids(q.family_id),
    adult_first_name(auth.uid(), 'Your sitter') || ' doesn''t have ' || coalesce(req_title(r), 'it'),
    coalesce(v_note, 'Tap to see her profile.'), '/parent/sitter/' || q.sitter_id);
  return q;
end $$;

-- P79b: a parent looks at what she shared. Looks good -> met; Ask again -> asked, with the parent's note. Pushes her.
create or replace function public.review_requirement(p_request uuid, p_ok boolean, p_note text default null)
returns requirement_requests
language plpgsql security definer set search_path = public as $$
declare
  q requirement_requests;
  r family_requirements;
  v_note text := nullif(trim(coalesce(p_note, '')), '');
  fam text;
begin
  select * into q from requirement_requests where id = p_request for update;
  if not found or not is_parent_of(q.family_id) then raise exception 'not a parent of this family'; end if;
  if q.status <> 'shared' then raise exception 'Nothing to look at yet.'; end if;
  if length(v_note) > 300 then raise exception 'Keep the note under 300 characters.'; end if;
  r := requirement_for_key(q.family_id, q.req_key);
  fam := family_name_of(q.family_id);
  if coalesce(p_ok, false) then
    update requirement_requests set status = 'met', reviewed_by = auth.uid(), reviewed_at = now() where id = q.id returning * into q;
    perform notify_users(array[q.sitter_id], 'Looks good: ' || coalesce(req_title(r), 'your card'), fam || ' saw what you shared.', '/sitter/requests');
  else
    update requirement_requests set status = 'asked', note = v_note, asked_by = auth.uid(), asked_at = now(),
      credential_id = null, shared_at = null, reviewed_by = auth.uid(), reviewed_at = now()
      where id = q.id returning * into q;
    perform notify_users(array[q.sitter_id], fam || ' asked again for ' || coalesce(req_title(r), 'it'),
      coalesce(v_note, 'Tap to share it again.'), '/sitter/requests');
  end if;
  return q;
end $$;

-- A parent removes a request (no push).
create or replace function public.cancel_requirement_request(p_request uuid) returns void
language plpgsql security definer set search_path = public as $$
declare q requirement_requests;
begin
  select * into q from requirement_requests where id = p_request;
  if not found or not is_parent_of(q.family_id) then raise exception 'not a parent of this family'; end if;
  delete from requirement_requests where id = q.id;
end $$;

-- One request as the app shows it (with the requirement and the shared card).
create or replace function public.requirement_request_json(q requirement_requests, r family_requirements, p_with_file boolean)
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', q.id, 'family_id', q.family_id, 'sitter_id', q.sitter_id, 'req_key', q.req_key, 'status', q.status,
    'note', q.note, 'asked_at', q.asked_at, 'asked_by', adult_first_name(q.asked_by, null), 'shared_at', q.shared_at,
    'sitter_note', q.sitter_note, 'reviewed_at', q.reviewed_at, 'reviewed_by', adult_first_name(q.reviewed_by, null),
    'title', req_title(r), 'level', r.level, 'kinds', to_jsonb(req_credential_kinds(r)), 'why', r.details->>'why',
    'credential', (select jsonb_build_object('id', sc.id, 'kind', sc.kind, 'title', sc.title, 'issuer', sc.issuer,
                     'issued_on', sc.issued_on, 'expires_on', sc.expires_on,
                     'file_path', case when p_with_file then sc.file_path end)
                   from sitter_credentials sc where sc.id = q.credential_id));
$$;

-- S53 / Home "Needs you": the signed-in sitter's requests, grouped by family (families she still sits for, requests
-- whose requirement still exists), the family's oldest ask first.
create or replace function public.my_requirement_requests() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('family_id', g.family_id, 'family_name', family_name_of(g.family_id), 'requests', g.items)
                     order by g.first_at)
    from (
      select q.family_id, min(coalesce(q.asked_at, q.created_at)) as first_at,
             jsonb_agg(requirement_request_json(q, r, true) order by r.position, r.created_at) as items
      from requirement_requests q
      cross join lateral requirement_for_key(q.family_id, q.req_key) r
      where q.sitter_id = auth.uid() and r.id is not null and sitter_in_family(q.family_id, q.sitter_id)
      group by q.family_id
    ) g), '[]'::jsonb);
end $$;

-- P11 / P7a / P79b: every requirement of the family for one sitter, with its request (null = not asked). Any member
-- of the family (helpers read-only); languages carry "speaks" from her profile instead of a request.
create or replace function public.family_requirement_requests(p_family uuid, p_sitter uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_family_member(p_family) then raise exception 'not in this family'; end if;
  if not exists (select 1 from family_sitters where family_id = p_family and sitter_id = p_sitter) then raise exception 'not your sitter'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'requirement_id', r.id, 'key', r.key, 'req_key', req_key_of(r), 'title', req_title(r), 'level', r.level,
      'kinds', to_jsonb(req_credential_kinds(r)), 'language', r.key like 'language:%',
      'speaks', case when r.key like 'language:%' then exists (
          select 1 from sitter_languages sl where sl.sitter_id = p_sitter
            and lower(trim(sl.language)) = lower(trim(coalesce(nullif(r.details->>'language', ''), substr(r.key, 10))))) end,
      'request', (select requirement_request_json(q, r, q.status in ('shared', 'met'))
                  from requirement_requests q where q.family_id = p_family and q.sitter_id = p_sitter and q.req_key = req_key_of(r)))
      order by r.position, r.created_at)
    from family_requirements r where r.family_id = p_family), '[]'::jsonb);
end $$;

-- ---------------------------------------------------------------- keeping requests in step
-- A new card or new dates on a shared credential: parents look again ('met' -> 'shared') and get a push.
-- Removing the card sends the request back to 'asked'.
create or replace function public.sitter_credentials_requests() returns trigger
language plpgsql security definer set search_path = public as $$
declare q requirement_requests; r family_requirements;
begin
  if tg_op = 'DELETE' then
    update requirement_requests set status = 'asked', credential_id = null, shared_at = null, reviewed_by = null, reviewed_at = null
      where credential_id = old.id and status in ('shared', 'met');
    return old;
  end if;
  if new.file_path is distinct from old.file_path or new.expires_on is distinct from old.expires_on
     or new.issued_on is distinct from old.issued_on or new.kind is distinct from old.kind then
    for q in
      update requirement_requests set status = 'shared', shared_at = now(), reviewed_by = null, reviewed_at = null
        where credential_id = new.id and status = 'met' returning *
    loop
      r := requirement_for_key(q.family_id, q.req_key);
      perform notify_users(family_parent_ids(q.family_id), adult_first_name(q.sitter_id, 'Your sitter') || ' updated ' || coalesce(req_title(r), new.title),
        'Tap to check it again.', '/parent/shared/' || q.id);
    end loop;
  end if;
  return new;
end $$;
drop trigger if exists sitter_credentials_requests on public.sitter_credentials;
create trigger sitter_credentials_requests after update on public.sitter_credentials
  for each row execute function public.sitter_credentials_requests();
drop trigger if exists sitter_credentials_requests_delete on public.sitter_credentials;
create trigger sitter_credentials_requests_delete before delete on public.sitter_credentials
  for each row execute function public.sitter_credentials_requests();

-- S27 Yes / No on a self-confirmed requirement shares it (waiting for a parent) or declines it. A parent's mark on a
-- document requirement (the old review path) counts as Looks good.
create or replace function public.family_requirement_checks_requests() returns trigger
language plpgsql security definer set search_path = public as $$
declare r family_requirements; fid uuid;
begin
  select * into r from family_requirements where id = new.requirement_id;
  if not found or r.key like 'language:%' then return new; end if;
  fid := r.family_id;
  if new.checked_by = new.sitter_id and requirement_proof(r.id) = 'self' then
    insert into requirement_requests (family_id, sitter_id, req_key, status, shared_at)
      values (fid, new.sitter_id, req_key_of(r), case when new.answer then 'shared' else 'declined' end, now())
      on conflict (family_id, sitter_id, req_key) do update
        set status = excluded.status, shared_at = excluded.shared_at, credential_id = null, reviewed_by = null, reviewed_at = null
        where not (requirement_requests.status = 'met' and excluded.status = 'shared');
  elsif new.checked_by is distinct from new.sitter_id and new.answer and requirement_proof(r.id) = 'document' then
    insert into requirement_requests (family_id, sitter_id, req_key, status, reviewed_by, reviewed_at)
      values (fid, new.sitter_id, req_key_of(r), 'met', new.checked_by, now())
      on conflict (family_id, sitter_id, req_key) do update set status = 'met', reviewed_by = excluded.reviewed_by, reviewed_at = excluded.reviewed_at;
  end if;
  return new;
end $$;
drop trigger if exists family_requirement_checks_requests on public.family_requirement_checks;
create trigger family_requirement_checks_requests after insert or update on public.family_requirement_checks
  for each row execute function public.family_requirement_checks_requests();

-- New wording or details on a requirement: she shares it again. A removed requirement takes its requests with it.
create or replace function public.family_requirements_recheck() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    delete from requirement_requests where family_id = old.family_id and req_key = req_key_of(old);
    return old;
  end if;
  if new.title is distinct from old.title or new.details is distinct from old.details then
    delete from family_requirement_checks where requirement_id = new.id;
    update requirement_requests set status = 'asked', credential_id = null, shared_at = null, sitter_note = null,
      reviewed_by = null, reviewed_at = null, asked_at = coalesce(asked_at, now())
      where family_id = new.family_id and req_key = req_key_of(new) and status <> 'asked';
  end if;
  return new;
end $$;
drop trigger if exists family_requirements_recheck on public.family_requirements;
create trigger family_requirements_recheck after update on public.family_requirements
  for each row execute function public.family_requirements_recheck();
drop trigger if exists family_requirements_recheck_delete on public.family_requirements;
create trigger family_requirements_recheck_delete after delete on public.family_requirements
  for each row execute function public.family_requirements_recheck();

-- ---------------------------------------------------------------- carry over earlier answers (once)
-- Her S27 Yes / No answers become shared / declined requests; a parent's reviewed document becomes met.
insert into public.requirement_requests (family_id, sitter_id, req_key, status, shared_at, reviewed_by, reviewed_at)
  select fr.family_id, fc.sitter_id, public.req_key_of(fr),
         case when fc.checked_by = fc.sitter_id then (case when fc.answer then 'shared' else 'declined' end) else 'met' end,
         fc.checked_at,
         case when fc.checked_by is distinct from fc.sitter_id then fc.checked_by end,
         case when fc.checked_by is distinct from fc.sitter_id then fc.checked_at end
  from public.family_requirement_checks fc
  join public.family_requirements fr on fr.id = fc.requirement_id
  where fr.key not like 'language:%'
    and ((fc.checked_by = fc.sitter_id and public.requirement_proof(fr.id) = 'self')
         or (fc.checked_by is distinct from fc.sitter_id and fc.answer and public.requirement_proof(fr.id) = 'document'))
on conflict (family_id, sitter_id, req_key) do nothing;

-- ---------------------------------------------------------------- grants
revoke execute on function public.req_key_of(family_requirements), public.req_title(family_requirements),
  public.req_credential_kinds(family_requirements), public.requirement_for_key(uuid, text) from public, anon, authenticated;
revoke execute on function public.requirement_request_json(requirement_requests, family_requirements, boolean) from public, anon, authenticated;
revoke execute on function public.requirement_requests_stamp(), public.sitter_credentials_requests(),
  public.family_requirement_checks_requests() from public, anon, authenticated;
revoke execute on function public.family_requirements_recheck() from public, anon, authenticated;
-- Used inside policies, so signed-in users need them.
revoke execute on function public.sitter_in_family(uuid, uuid), public.credential_shared_with_me(uuid), public.can_read_sitter_file(text) from public, anon;
grant execute on function public.sitter_in_family(uuid, uuid), public.credential_shared_with_me(uuid), public.can_read_sitter_file(text) to authenticated, service_role;
revoke execute on function public.ask_requirements(uuid, uuid, text[], text), public.share_requirement(uuid, uuid, text),
  public.decline_requirement(uuid, text), public.review_requirement(uuid, boolean, text), public.cancel_requirement_request(uuid),
  public.my_requirement_requests(), public.family_requirement_requests(uuid, uuid) from public, anon;
grant execute on function public.ask_requirements(uuid, uuid, text[], text), public.share_requirement(uuid, uuid, text),
  public.decline_requirement(uuid, text), public.review_requirement(uuid, boolean, text), public.cancel_requirement_request(uuid),
  public.my_requirement_requests(), public.family_requirement_requests(uuid, uuid) to authenticated, service_role;
