-- Sitter's age (S40 Personal details "Birthday"; P11 and S13 show "24 years old", never the date).
--   * sitter_profiles.birthdate. Read like the rest of her profile (sitter_can_be_seen_by), written only by her.
--   * "Age 18 or older" (P7a) is decided by her birthday when she has entered one; otherwise her own Yes on S27.
-- Safe to run more than once.

alter table public.sitter_profiles add column if not exists birthdate date;
alter table public.sitter_profiles drop constraint if exists sitter_profiles_birthdate_check;
alter table public.sitter_profiles add constraint sitter_profiles_birthdate_check
  check (birthdate is null or (birthdate > date '1900-01-01' and birthdate <= current_date - interval '13 years'));
grant select (birthdate), insert (birthdate), update (birthdate) on public.sitter_profiles to authenticated;

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

    if r.key in ('background_check', 'cpr_first_aid', 'cpr_infant', 'cpr_child', 'first_aid', 'newborn_care', 'water_safety', 'vaccination', 'drivers_license') then
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

    elsif r.key = 'age_18' and (select sp.birthdate from sitter_profiles sp where sp.sitter_id = p_sitter) is not null then
      -- her birthday on S40 decides; without one, her own Yes counts (below)
      if (select sp.birthdate from sitter_profiles sp where sp.sitter_id = p_sitter) <= current_date - interval '18 years' then
        ok := true; why := 'valid';
      else
        why := 'missing';
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
