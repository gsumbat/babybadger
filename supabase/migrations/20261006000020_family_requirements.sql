-- Sitter requirements (wireframes P7a Sitter requirements, P28–P32 the requirements flow from the invite, S27 what a
-- family asks for, on the sitter's side). Design notes on the canvas ("Logic: requirements are per family ...").
-- Runs after migration 19 (sitter_credentials, sitter_languages, sitter_can_be_seen_by).
--   * Requirements are per family. One row per requirement the parent turned on; "Off" = no row.
--   * key = catalogue key: background_check | cpr_first_aid | cpr_infant | newborn_care | water_safety |
--     drivers_license | non_smoker | language:<Language> | custom (a requirement the parent wrote, P31).
--   * level: must (checked before booking) | prefer (P29 "Nice": shown when comparing sitters).
--   * details (jsonb), by key:
--       background_check  {"within_months": 12}
--       drivers_license   {"applies": "car_trips" | "every", "items": ["license","record","insurance","car_seats"],
--                          "kid_ids": [...]}   (P30; license -> her license, record -> her background check,
--                                               insurance / car seats -> she confirms Yes)
--       language:*        {"language": "Spanish"}
--       custom            {"why": "...", "proof": "self" | "document"}   (P31)
--       non_smoker        {"proof": "self"}
--   * families.requirement_mode: P7a / P32 "If a sitter is missing one": warn (default) | block. With block, a sitter
--     who is missing a must-have can still join but can't be booked (enforced below on shifts).
-- How a requirement is met (sitter_requirement_status):
--   * credential keys: a credential of that kind that hasn't expired (background check: issued within the window
--     when the issue date is known). "cpr_first_aid" counts a First Aid or child CPR certificate.
--   * language:*: she lists the language at any level.
--   * self-confirmed (non_smoker, custom with proof self, P30 insurance / car seats): she answered Yes on S27
--     (family_requirement_checks, written by her).
--   * document (custom with proof document): a parent marked it reviewed (family_requirement_checks, written by
--     a parent). Uploading the document isn't built yet.
-- Changing a requirement's wording or details clears the answers given for it, so sitters confirm it again.

-- ---------------------------------------------------------------- families.requirement_mode
alter table public.families add column if not exists requirement_mode text not null default 'warn';
do $$ begin
  alter table public.families add constraint families_requirement_mode_check check (requirement_mode in ('warn', 'block'));
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------- tables
create table if not exists public.family_requirements (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.families (id) on delete cascade,
  key         text not null check (key = 'custom' or key ~ '^[a-z_]+$' or key ~ '^language:.{1,40}$'),
  title       text not null check (length(trim(title)) between 1 and 120),
  details     jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  level       text not null default 'must' check (level in ('must', 'prefer')),
  position    int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists family_requirements_family on public.family_requirements (family_id);
-- A catalogue requirement appears once per family; custom ones can repeat.
create unique index if not exists family_requirements_key on public.family_requirements (family_id, key) where key <> 'custom';

create table if not exists public.family_requirement_checks (
  requirement_id  uuid not null references public.family_requirements (id) on delete cascade,
  sitter_id       uuid not null references auth.users (id) on delete cascade,
  answer          boolean not null,
  checked_by      uuid references auth.users (id) on delete set null,
  checked_at      timestamptz not null default now(),
  primary key (requirement_id, sitter_id)
);
create index if not exists family_requirement_checks_sitter on public.family_requirement_checks (sitter_id);

-- ---------------------------------------------------------------- helpers
create or replace function public.requirement_family(rid uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select family_id from family_requirements where id = rid;
$$;

-- How a requirement is shown: 'credential' | 'language' | 'self' | 'document' | 'mixed' (driving).
create or replace function public.requirement_proof(rid uuid) returns text
language sql stable security definer set search_path = public as $$
  select case
    when r.key in ('background_check', 'cpr_first_aid', 'cpr_infant', 'cpr_child', 'first_aid', 'newborn_care', 'water_safety') then 'credential'
    when r.key = 'drivers_license' then 'mixed'
    when r.key like 'language:%' then 'language'
    when coalesce(r.details->>'proof', 'self') = 'document' then 'document'
    else 'self'
  end
  from family_requirements r where r.id = rid;
$$;

-- ---------------------------------------------------------------- triggers
create or replace function public.family_requirements_stamp() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    new.family_id := old.family_id;
    new.key := old.key;
    new.updated_at := clock_timestamp();
  end if;
  return new;
end $$;
drop trigger if exists family_requirements_stamp on public.family_requirements;
create trigger family_requirements_stamp before insert or update on public.family_requirements
  for each row execute function public.family_requirements_stamp();

-- New wording or details: earlier answers no longer count.
create or replace function public.family_requirements_recheck() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.title is distinct from old.title or new.details is distinct from old.details then
    delete from family_requirement_checks where requirement_id = new.id;
  end if;
  return new;
end $$;
drop trigger if exists family_requirements_recheck on public.family_requirements;
create trigger family_requirements_recheck after update on public.family_requirements
  for each row execute function public.family_requirements_recheck();

-- Who answered and when is the server's to set; an answer can't move to another requirement or sitter.
create or replace function public.family_requirement_checks_stamp() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    new.requirement_id := old.requirement_id;
    new.sitter_id := old.sitter_id;
  end if;
  new.checked_by := auth.uid();
  new.checked_at := clock_timestamp();
  return new;
end $$;
drop trigger if exists family_requirement_checks_stamp on public.family_requirement_checks;
create trigger family_requirement_checks_stamp before insert or update on public.family_requirement_checks
  for each row execute function public.family_requirement_checks_stamp();

-- ---------------------------------------------------------------- status
-- One row per requirement of the family: met or not, and why (reason codes the app turns into words):
--   met:     valid | expiring (credential runs out within 30 days; expires_on says when) | speaks | confirmed | reviewed
--   not met: missing | expired | too_old (background check older than the window) | unconfirmed | declined |
--            unreviewed
-- No access checks here: only the public wrapper and the booking gate call it.
create or replace function public.requirement_status_core(p_family uuid, p_sitter uuid)
returns table (requirement_id uuid, met boolean, reason text, expires_on date)
language plpgsql stable security definer set search_path = public as $$
declare
  r family_requirements;
  c record;
  kinds text[];
  ok boolean;
  why text;
  exp date;
  ans boolean;
  ans_by uuid;
  item text;
begin
  for r in select * from family_requirements fr where fr.family_id = p_family order by fr.position, fr.created_at loop
    ok := false; why := 'missing'; exp := null;
    select fc.answer, fc.checked_by into ans, ans_by
      from family_requirement_checks fc where fc.requirement_id = r.id and fc.sitter_id = p_sitter;
    if not found then ans := null; ans_by := null; end if;

    if r.key in ('background_check', 'cpr_first_aid', 'cpr_infant', 'cpr_child', 'first_aid', 'newborn_care', 'water_safety', 'drivers_license') then
      kinds := case r.key when 'cpr_first_aid' then array['first_aid', 'cpr_child'] else array[r.key] end;
      -- her best credential of that kind: one that hasn't expired, the latest expiry first
      select sc.expires_on, sc.issued_on into c
        from sitter_credentials sc
        where sc.sitter_id = p_sitter and sc.kind = any (kinds)
        order by (sc.expires_on is null or sc.expires_on >= current_date) desc, sc.expires_on desc nulls first, sc.issued_on desc nulls last
        limit 1;
      if not found then
        why := 'missing';
      elsif c.expires_on is not null and c.expires_on < current_date then
        why := 'expired'; exp := c.expires_on;
      elsif r.key = 'background_check' and c.issued_on is not null
          and c.issued_on < current_date - make_interval(months => coalesce(nullif(r.details->>'within_months', '')::int, 12)) then
        why := 'too_old';
      else
        ok := true; exp := c.expires_on;
        why := case when c.expires_on is not null and c.expires_on <= current_date + 30 then 'expiring' else 'valid' end;
      end if;

      -- Driving (P30): the other ticked items. Record -> her background check; insurance / car seats -> she confirms.
      if r.key = 'drivers_license' and ok then
        for item in select jsonb_array_elements_text(coalesce(r.details->'items', '[]'::jsonb)) loop
          if item = 'record' and not exists (
            select 1 from sitter_credentials sc where sc.sitter_id = p_sitter and sc.kind = 'background_check'
              and (sc.expires_on is null or sc.expires_on >= current_date)
          ) then ok := false; why := 'missing'; exp := null; exit;
          elsif item in ('insurance', 'car_seats') and not coalesce(ans and ans_by = p_sitter, false) then
            ok := false; why := case when ans = false and ans_by = p_sitter then 'declined' else 'unconfirmed' end; exp := null; exit;
          end if;
        end loop;
      end if;

    elsif r.key like 'language:%' then
      if exists (
        select 1 from sitter_languages sl
        where sl.sitter_id = p_sitter
          and lower(trim(sl.language)) = lower(trim(coalesce(nullif(r.details->>'language', ''), substr(r.key, 10))))
      ) then ok := true; why := 'speaks'; end if;

    elsif coalesce(r.details->>'proof', 'self') = 'document' then
      -- a parent marks the document reviewed
      if ans is true and ans_by is distinct from p_sitter then ok := true; why := 'reviewed'; else why := 'unreviewed'; end if;

    else
      -- self-confirmed: her own Yes counts
      if ans is true and ans_by = p_sitter then ok := true; why := 'confirmed';
      elsif ans is false and ans_by = p_sitter then why := 'declined';
      else why := 'unconfirmed'; end if;
    end if;

    requirement_id := r.id; met := ok; reason := why; expires_on := exp;
    return next;
  end loop;
end $$;

-- What the app calls. Parents of the family (for a sitter of the family, or one they may see), and the sitter herself
-- once she has accepted the family's invite. Anyone else gets no rows.
create or replace function public.sitter_requirement_status(p_family uuid, p_sitter uuid)
returns table (requirement_id uuid, met boolean, reason text, expires_on date)
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if (p_sitter = auth.uid() and is_sitter_of(p_family, false))
     or (is_parent_of(p_family) and (
           exists (select 1 from family_sitters fs where fs.family_id = p_family and fs.sitter_id = p_sitter and fs.status <> 'removed')
           or sitter_can_be_seen_by(p_sitter))) then
    return query select * from requirement_status_core(p_family, p_sitter);
  end if;
end $$;

-- ---------------------------------------------------------------- booking gate (P32 "Block booking")
create or replace function public.shifts_requirements_gate() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'scheduled' and (tg_op = 'INSERT' or new.sitter_id <> old.sitter_id)
      and coalesce((select requirement_mode from families where id = new.family_id), 'warn') = 'block'
      and exists (
        select 1 from requirement_status_core(new.family_id, new.sitter_id) s
        join family_requirements fr on fr.id = s.requirement_id
        where fr.level = 'must' and not s.met
      ) then
    raise exception 'this sitter is missing one of your must-have requirements';
  end if;
  return new;
end $$;
drop trigger if exists shifts_requirements_gate on public.shifts;
create trigger shifts_requirements_gate before insert or update on public.shifts
  for each row execute function public.shifts_requirements_gate();

-- ---------------------------------------------------------------- row level security
alter table public.family_requirements enable row level security;
alter table public.family_requirement_checks enable row level security;

drop policy if exists family_requirements_parent on public.family_requirements;
create policy family_requirements_parent on public.family_requirements for all
  using (public.is_parent_of(family_id)) with check (public.is_parent_of(family_id));
-- Sitters of the family read the list from the moment they accept the invite (S27 comes before the S2 notice).
drop policy if exists family_requirements_sitter_read on public.family_requirements;
create policy family_requirements_sitter_read on public.family_requirements for select
  using (public.is_sitter_of(family_id, false));

drop policy if exists family_requirement_checks_read on public.family_requirement_checks;
create policy family_requirement_checks_read on public.family_requirement_checks for select
  using (sitter_id = auth.uid() or public.is_parent_of(public.requirement_family(requirement_id)));
-- The sitter answers for herself (self-confirmed and driving items); a parent marks documents reviewed.
drop policy if exists family_requirement_checks_sitter_write on public.family_requirement_checks;
create policy family_requirement_checks_sitter_write on public.family_requirement_checks for insert
  with check (sitter_id = auth.uid() and public.is_sitter_of(public.requirement_family(requirement_id), false)
              and public.requirement_proof(requirement_id) in ('self', 'mixed'));
drop policy if exists family_requirement_checks_sitter_update on public.family_requirement_checks;
create policy family_requirement_checks_sitter_update on public.family_requirement_checks for update
  using (sitter_id = auth.uid() and public.is_sitter_of(public.requirement_family(requirement_id), false)
         and public.requirement_proof(requirement_id) in ('self', 'mixed'))
  with check (sitter_id = auth.uid() and public.requirement_proof(requirement_id) in ('self', 'mixed'));
drop policy if exists family_requirement_checks_parent_write on public.family_requirement_checks;
create policy family_requirement_checks_parent_write on public.family_requirement_checks for insert
  with check (public.is_parent_of(public.requirement_family(requirement_id)) and public.requirement_proof(requirement_id) = 'document'
              and exists (select 1 from public.family_sitters fs
                          where fs.family_id = public.requirement_family(requirement_id) and fs.sitter_id = family_requirement_checks.sitter_id));
drop policy if exists family_requirement_checks_parent_update on public.family_requirement_checks;
create policy family_requirement_checks_parent_update on public.family_requirement_checks for update
  using (public.is_parent_of(public.requirement_family(requirement_id)) and public.requirement_proof(requirement_id) = 'document')
  with check (public.is_parent_of(public.requirement_family(requirement_id)) and public.requirement_proof(requirement_id) = 'document');
drop policy if exists family_requirement_checks_delete on public.family_requirement_checks;
create policy family_requirement_checks_delete on public.family_requirement_checks for delete
  using (sitter_id = auth.uid() or public.is_parent_of(public.requirement_family(requirement_id)));

-- ---------------------------------------------------------------- grants
-- The blanket grant in 20261005000003_grants.sql only covered tables and functions that existed then.
grant select, update on public.families to authenticated;
grant select, insert, update, delete on public.family_requirements to authenticated;
grant select, insert, update, delete on public.family_requirement_checks to authenticated;
grant all on public.family_requirements, public.family_requirement_checks to service_role;
revoke all on public.family_requirements, public.family_requirement_checks from anon;

revoke execute on function public.family_requirements_stamp() from public, anon, authenticated;
revoke execute on function public.family_requirements_recheck() from public, anon, authenticated;
revoke execute on function public.family_requirement_checks_stamp() from public, anon, authenticated;
revoke execute on function public.shifts_requirements_gate() from public, anon, authenticated;
revoke execute on function public.requirement_status_core(uuid, uuid) from public, anon, authenticated;
grant execute on function public.requirement_status_core(uuid, uuid) to service_role;
-- Used inside the policies above, so signed-in users need them.
revoke execute on function public.requirement_family(uuid), public.requirement_proof(uuid) from public, anon;
grant execute on function public.requirement_family(uuid), public.requirement_proof(uuid) to authenticated, service_role;
revoke execute on function public.sitter_requirement_status(uuid, uuid) from public, anon;
grant execute on function public.sitter_requirement_status(uuid, uuid) to authenticated, service_role;
