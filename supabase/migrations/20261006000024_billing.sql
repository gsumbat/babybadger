-- Parent subscription "BabyBadger Family" through Stripe (wireframes P36–P41, docs/billing.md).
--   * One row per family. Only the Stripe webhook (Edge Function, service role) writes it; parents read their own.
--   * family_has_plan(fid): trialing / active, or past_due until 7 days after the period ended (P40 grace).
--   * remind_trial: P38 "Remind me before it ends" (the webhook pushes 3 days before the trial ends).
-- Safe to run more than once.

create table if not exists public.family_subscriptions (
  family_id              uuid primary key references public.families (id) on delete cascade,
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  status                 text not null default 'none'
                         check (status in ('trialing', 'active', 'past_due', 'paused', 'canceled', 'incomplete', 'none')),
  plan                   text check (plan in ('monthly', 'yearly')),
  trial_ends_at          timestamptz,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  paused_until           timestamptz,
  had_trial              boolean not null default false,
  remind_trial           boolean not null default true,
  payer_id               uuid references auth.users (id) on delete set null,
  updated_at             timestamptz not null default now()
);
alter table public.family_subscriptions enable row level security;

drop policy if exists family_subscriptions_parent_read on public.family_subscriptions;
create policy family_subscriptions_parent_read on public.family_subscriptions
  for select using (public.is_parent_of(family_id));

-- Parents read; nobody but the server (service role) inserts, updates or deletes.
revoke all on public.family_subscriptions from anon, authenticated;
grant select on public.family_subscriptions to authenticated;
grant all on public.family_subscriptions to service_role;

-- Does the family have the plan right now? Members of the family (and the server) can ask.
create or replace function public.family_has_plan(fid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((
    select s.status in ('trialing', 'active')
        or (s.status = 'past_due' and s.current_period_end is not null and now() < s.current_period_end + interval '7 days')
    from family_subscriptions s
    where s.family_id = fid
      and (auth.uid() is null or is_parent_of(fid) or is_sitter_of(fid, false))
  ), false);
$$;
revoke execute on function public.family_has_plan(uuid) from public, anon;
grant execute on function public.family_has_plan(uuid) to authenticated, service_role;

-- P38 "Remind me before it ends": a parent of the family turns the trial reminder on or off.
create or replace function public.set_trial_reminder(p_family uuid, p_on boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_parent_of(p_family) then raise exception 'not a parent of this family' using errcode = '42501'; end if;
  insert into family_subscriptions (family_id, remind_trial) values (p_family, coalesce(p_on, true))
    on conflict (family_id) do update set remind_trial = excluded.remind_trial, updated_at = now();
end $$;
revoke execute on function public.set_trial_reminder(uuid, boolean) from public, anon;
grant execute on function public.set_trial_reminder(uuid, boolean) to authenticated;

-- Stripe's customer.subscription.trial_will_end arrives 3 days before the trial ends: the webhook calls this to push
-- the family's parents (when the reminder is on). Server only.
create or replace function public.billing_trial_reminder(p_family uuid) returns void
language plpgsql security definer set search_path = public as $$
declare s family_subscriptions;
begin
  select * into s from family_subscriptions where family_id = p_family;
  if not found or not s.remind_trial or s.trial_ends_at is null then return; end if;
  perform notify_users(
    array(select user_id from family_parents where family_id = p_family),
    'Your free trial ends ' || to_char(s.trial_ends_at at time zone 'America/New_York', 'Mon FMDD'),
    case when s.cancel_at_period_end then 'Your plan won’t renew. Resubscribe anytime in Settings.'
         else 'Then BabyBadger Family renews. Change or cancel in Settings › Subscription.' end,
    '/parent/subscription');
end $$;
revoke execute on function public.billing_trial_reminder(uuid) from public, anon, authenticated;
grant execute on function public.billing_trial_reminder(uuid) to service_role;

-- Settings and Home refresh when the webhook changes the row.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'family_subscriptions') then
    alter publication supabase_realtime add table public.family_subscriptions;
  end if;
end $$;
