-- Sitter profile and credentials (wireframes S13 My profile, S40 Personal details, S14 Credentials, S15 Add a
-- certification, S41 Certification detail, S18 Renew, S16 Languages, S17 Background check; parents see them on
-- P11 Sitter profile). Design notes nS4, nP7a.
--   * sitter_profiles = the sitter's own details (S40: phone, home area, about me; S13 About: ages, driving, rate;
--     S16 "Happy to teach a language"; S40 photo). Her name stays in profiles.full_name.
--   * sitter_credentials = one row per certificate. kind is the S15 tile:
--       first_aid        "CPR and First Aid"
--       cpr_infant       "Infant CPR"
--       cpr_child        child / adult CPR on its own
--       newborn_care     "Newborn care"
--       water_safety     "Water safety"
--       drivers_license  "Driver's license"
--       other            "Special needs care", "Early childhood ed." and "Other" (title says which)
--       background_check S17. Run by the provider: only the service role writes these rows.
--     verified_at = BabyBadger checked it with the issuer ("Verified"); null = "In review". Only the service role
--     sets it: sitters have no column grant on it, and changing the card, dates or kind clears it (re-review).
--     "Expiring" (30 days) and "Expired" come from expires_on in the app; no server job.
--   * sitter_languages = self-reported, one row per language with a level (S16 Basic / Good / Fluent / Native =
--     basic / conversational / fluent / native).
-- Who can read: the sitter, and parents of any family she is (or was) linked to through family_sitters or an
-- accepted invite (sitter_can_be_seen_by). Only she writes.
-- Files (private bucket sitter-files, path <sitter_id>/<folder>/<file>):
--   * <sitter_id>/photo/...  profile photo: the sitter and those parents read it.
--   * <sitter_id>/cards/...  card photos: only the sitter (S15: "Families see the badge and expiry date, never
--     the card or its number"; S27: documents are never shared).
-- Re-runnable: "if not exists", "create or replace", policies dropped first.

-- ---------------------------------------------------------------- tables
create table if not exists public.sitter_profiles (
  sitter_id         uuid primary key references auth.users (id) on delete cascade,
  phone             text check (phone is null or length(phone) <= 30),
  home_area         text check (home_area is null or length(home_area) <= 80),
  bio               text check (bio is null or length(bio) <= 300),
  years_experience  int check (years_experience is null or years_experience between 0 and 60),
  ages_from         int check (ages_from is null or ages_from between 0 and 18),
  ages_to           int check (ages_to is null or ages_to between 0 and 18),
  can_drive         boolean,
  own_car           boolean,
  rate              numeric(7, 2) check (rate is null or (rate >= 0 and rate < 10000)),
  teaches_language  boolean not null default false,
  photo_path        text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.sitter_credentials (
  id           uuid primary key default gen_random_uuid(),
  sitter_id    uuid not null references auth.users (id) on delete cascade,
  kind         text not null check (kind in ('cpr_infant', 'cpr_child', 'first_aid', 'newborn_care', 'water_safety', 'drivers_license', 'background_check', 'other')),
  title        text not null check (length(trim(title)) between 1 and 80),
  issuer       text check (issuer is null or length(issuer) <= 120),
  issued_on    date,
  expires_on   date,
  file_path    text,
  verified_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (expires_on is null or issued_on is null or expires_on >= issued_on)
);
create index if not exists sitter_credentials_sitter on public.sitter_credentials (sitter_id);

create table if not exists public.sitter_languages (
  sitter_id  uuid not null references auth.users (id) on delete cascade,
  language   text not null check (length(trim(language)) between 1 and 40),
  level      text not null default 'conversational' check (level in ('native', 'fluent', 'conversational', 'basic')),
  created_at timestamptz not null default now(),
  primary key (sitter_id, language)
);

-- ---------------------------------------------------------------- who may see a sitter
-- The sitter herself, or a parent of a family where she is in family_sitters (any status) or accepted an invite
-- that wasn't cancelled. Security definer so policies can look across tables without recursion.
create or replace function public.sitter_can_be_seen_by(p_sitter uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and (
    auth.uid() = p_sitter
    or exists (select 1 from family_sitters fs join family_parents fp on fp.family_id = fs.family_id
               where fs.sitter_id = p_sitter and fp.user_id = auth.uid())
    or exists (select 1 from invites i join family_parents fp on fp.family_id = i.family_id
               where i.accepted_by = p_sitter and i.cancelled_at is null and fp.user_id = auth.uid())
  );
$$;

-- ---------------------------------------------------------------- stamps
-- Keeps the owner fixed, stamps updated_at, and sends a credential back to review when its card, dates or kind change.
create or replace function public.sitter_rows_stamp() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    new.sitter_id := old.sitter_id;
    new.created_at := old.created_at;
    if tg_table_name = 'sitter_credentials'
       and (new.file_path is distinct from old.file_path or new.issued_on is distinct from old.issued_on
            or new.expires_on is distinct from old.expires_on or new.kind is distinct from old.kind)
       and new.verified_at is not distinct from old.verified_at then
      new.verified_at := null;
    end if;
  end if;
  new.updated_at := clock_timestamp();
  return new;
end $$;
drop trigger if exists sitter_profiles_stamp on public.sitter_profiles;
create trigger sitter_profiles_stamp before insert or update on public.sitter_profiles
  for each row execute function public.sitter_rows_stamp();
drop trigger if exists sitter_credentials_stamp on public.sitter_credentials;
create trigger sitter_credentials_stamp before insert or update on public.sitter_credentials
  for each row execute function public.sitter_rows_stamp();

-- ---------------------------------------------------------------- row level security
alter table public.sitter_profiles    enable row level security;
alter table public.sitter_credentials enable row level security;
alter table public.sitter_languages   enable row level security;

drop policy if exists sitter_profiles_read on public.sitter_profiles;
create policy sitter_profiles_read on public.sitter_profiles for select using (public.sitter_can_be_seen_by(sitter_id));
drop policy if exists sitter_profiles_own on public.sitter_profiles;
create policy sitter_profiles_own on public.sitter_profiles for all
  using (sitter_id = auth.uid()) with check (sitter_id = auth.uid());

drop policy if exists sitter_credentials_read on public.sitter_credentials;
create policy sitter_credentials_read on public.sitter_credentials for select using (public.sitter_can_be_seen_by(sitter_id));
-- Her own certificates; the background check is the provider's (service role).
drop policy if exists sitter_credentials_own on public.sitter_credentials;
create policy sitter_credentials_own on public.sitter_credentials for all
  using (sitter_id = auth.uid() and kind <> 'background_check')
  with check (sitter_id = auth.uid() and kind <> 'background_check');

drop policy if exists sitter_languages_read on public.sitter_languages;
create policy sitter_languages_read on public.sitter_languages for select using (public.sitter_can_be_seen_by(sitter_id));
drop policy if exists sitter_languages_own on public.sitter_languages;
create policy sitter_languages_own on public.sitter_languages for all
  using (sitter_id = auth.uid()) with check (sitter_id = auth.uid());

-- ---------------------------------------------------------------- grants
grant select, insert, update, delete on public.sitter_profiles to authenticated;
grant select, insert, update, delete on public.sitter_languages to authenticated;
-- Credentials: no grant on verified_at for insert / update (BabyBadger sets it). The stamp trigger may still
-- clear it, since triggers don't need column grants.
revoke insert, update on public.sitter_credentials from authenticated;
grant select, delete on public.sitter_credentials to authenticated;
grant insert (sitter_id, kind, title, issuer, issued_on, expires_on, file_path) on public.sitter_credentials to authenticated;
grant update (kind, title, issuer, issued_on, expires_on, file_path) on public.sitter_credentials to authenticated;
grant all on public.sitter_profiles, public.sitter_credentials, public.sitter_languages to service_role;
revoke all on public.sitter_profiles, public.sitter_credentials, public.sitter_languages from anon;

revoke execute on function public.sitter_can_be_seen_by(uuid) from public, anon;
grant execute on function public.sitter_can_be_seen_by(uuid) to authenticated, service_role;
revoke execute on function public.sitter_rows_stamp() from public, anon, authenticated;

-- ---------------------------------------------------------------- storage
-- Skipped where there is no Storage (the plain-Postgres RLS test).
do $$
begin
  if to_regclass('storage.objects') is null then return; end if;
  insert into storage.buckets (id, name, public) values ('sitter-files', 'sitter-files', false) on conflict (id) do nothing;
  execute 'drop policy if exists "sitter writes own files" on storage.objects';
  execute $p$create policy "sitter writes own files" on storage.objects for insert to authenticated
    with check (bucket_id = 'sitter-files' and (storage.foldername(name))[1] = auth.uid()::text
                and (storage.foldername(name))[2] in ('photo', 'cards'))$p$;
  execute 'drop policy if exists "sitter replaces own files" on storage.objects';
  execute $p$create policy "sitter replaces own files" on storage.objects for update to authenticated
    using (bucket_id = 'sitter-files' and (storage.foldername(name))[1] = auth.uid()::text)
    with check (bucket_id = 'sitter-files' and (storage.foldername(name))[1] = auth.uid()::text)$p$;
  execute 'drop policy if exists "sitter removes own files" on storage.objects';
  execute $p$create policy "sitter removes own files" on storage.objects for delete to authenticated
    using (bucket_id = 'sitter-files' and (storage.foldername(name))[1] = auth.uid()::text)$p$;
  execute 'drop policy if exists "sitter files read" on storage.objects';
  execute $p$create policy "sitter files read" on storage.objects for select to authenticated
    using (bucket_id = 'sitter-files' and (
      (storage.foldername(name))[1] = auth.uid()::text
      or ((storage.foldername(name))[2] = 'photo'
          and public.sitter_can_be_seen_by(((storage.foldername(name))[1])::uuid))
    ))$p$;
end $$;
