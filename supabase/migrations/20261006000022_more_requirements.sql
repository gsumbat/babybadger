-- More sitter requirements on P7a: Age 18 or older, References, Vaccinations, OK with pets.
--   * age_18, references, pets: the sitter confirms them on S27 (details {"proof": "self"}); no schema change needed.
--   * Vaccinations is a certificate she adds on S15 (Tdap and flu shots): new sitter_credentials kind 'vaccination',
--     counted by the requirement status like the other certificates.
-- Safe to run more than once.

alter table public.sitter_credentials drop constraint if exists sitter_credentials_kind_check;
alter table public.sitter_credentials add constraint sitter_credentials_kind_check
  check (kind in ('cpr_infant', 'cpr_child', 'first_aid', 'newborn_care', 'water_safety', 'drivers_license', 'background_check', 'vaccination', 'other'));

create or replace function public.requirement_proof(rid uuid) returns text
language sql stable security definer set search_path = public as $$
  select case
    when r.key in ('background_check', 'cpr_first_aid', 'cpr_infant', 'cpr_child', 'first_aid', 'newborn_care', 'water_safety', 'vaccination') then 'credential'
    when r.key = 'drivers_license' then 'mixed'
    when r.key like 'language:%' then 'language'
    when coalesce(r.details->>'proof', 'self') = 'document' then 'document'
    else 'self'
  end
  from family_requirements r where r.id = rid;
$$;

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
