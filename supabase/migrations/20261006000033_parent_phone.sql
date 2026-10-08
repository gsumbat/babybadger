-- Parent phone numbers (wireframes S10 Family "PARENTS" rows with Call / Text, P12b Settings › Account "Phone",
-- P12p the Phone sheet). Needs migration 30 (is_family_member, family_parents.role / relation). Re-runnable.
--
--   * profiles.phone: an adult's own number, set from Settings › Account › Phone (set_my_phone) and read back with
--     my_phone(). Sitters keep their number in sitter_profiles.phone (S40); this column is for family adults.
--   * Nobody reads someone else's phone from the table. profiles_related lets co-members AND sitters of any status
--     (even before they sign the notice) read profile rows, so the table's select grant becomes per-column, without
--     phone. NOTE for later migrations: a new profiles column needs its own `grant select (col)` now.
--   * family_contacts(p_family): the family's adults (user_id, name, relation, role, phone), owner first, for
--       - the family's sitters who are active, i.e. accepted the invite AND signed the notice (is_sitter_of(fid)),
--       - the family's members, full access (parent) and read only (helper) alike (is_family_member(fid)).
--     Everyone else (a stranger, a sitter who hasn't signed yet, a removed sitter, another family) gets an error.

-- ---------------------------------------------------------------- profiles.phone
alter table public.profiles add column if not exists phone text;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_phone_check') then
    alter table public.profiles add constraint profiles_phone_check check (phone is null or length(phone) between 7 and 30);
  end if;
end $$;

-- Reading becomes per-column: every column except phone. Done from the catalog so it covers the columns added by
-- earlier migrations (alert_logs 05, alert_arrivals 21) and stays right when this file runs again.
revoke select on public.profiles from authenticated;
do $$ declare cols text; begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position) into cols
    from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name <> 'phone';
  execute format('grant select (%s) on public.profiles to authenticated', cols);
end $$;
-- Her own row only (profiles_self_update); the app writes it through set_my_phone, which checks the format.
grant update (phone) on public.profiles to authenticated;
grant all on public.profiles to service_role;
revoke all on public.profiles from anon;

-- ---------------------------------------------------------------- my_phone / set_my_phone
create or replace function public.my_phone() returns text
language sql stable security definer set search_path = public as $$
  select phone from profiles where id = auth.uid();
$$;

-- '' or null clears it. Keeps what she typed ("(813) 555-0142") when it has 7 to 15 digits and only phone characters.
create or replace function public.set_my_phone(p_phone text) returns text
language plpgsql security definer set search_path = public as $$
declare v text := nullif(trim(coalesce(p_phone, '')), '');
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if v is not null and (length(v) > 30 or v !~ '^\+?[0-9()\-. ]+$' or length(regexp_replace(v, '\D', '', 'g')) not between 7 and 15) then
    raise exception 'Enter a phone number, like (813) 555-0142.';
  end if;
  update profiles set phone = v where id = auth.uid();
  if not found then raise exception 'no profile'; end if;
  return v;
end $$;

-- ---------------------------------------------------------------- family_contacts
create or replace function public.family_contacts(p_family uuid)
returns table (user_id uuid, full_name text, relation text, role text, phone text)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
begin
  if auth.uid() is null or p_family is null or not (public.is_sitter_of(p_family) or public.is_family_member(p_family)) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
    select fp.user_id, coalesce(p.full_name, ''), fp.relation, fp.role, p.phone
    from family_parents fp
    join families f on f.id = fp.family_id
    left join profiles p on p.id = fp.user_id
    where fp.family_id = p_family
    order by (fp.user_id = f.created_by) desc, (fp.role = 'parent') desc, fp.created_at;
end $$;

-- ---------------------------------------------------------------- grants (re-runnable)
revoke execute on function public.my_phone(), public.set_my_phone(text), public.family_contacts(uuid) from anon, public;
grant execute on function public.my_phone(), public.set_my_phone(text), public.family_contacts(uuid) to authenticated, service_role;
