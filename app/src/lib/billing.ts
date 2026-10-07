// Parent subscription through Stripe (docs/billing.md). The app never talks to Stripe directly: Supabase Edge
// Functions open Checkout / the billing portal, and the webhook keeps public.family_subscriptions current.
//
// Off unless EXPO_PUBLIC_BILLING=1, so the app keeps working before Stripe is set up: then every family "has the
// plan" and Settings › Subscription reads "Coming soon".
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { hasPlan, planState, type FamilySubscription, type Plan, type PlanState } from './billing-logic';
import { useSession } from './session';
import { kv } from './storage';
import { supabase } from './supabase';

export * from './billing-logic';

export const BILLING_ON = process.env.EXPO_PUBLIC_BILLING === '1';

// ---------------------------------------------------------------- shared store (one fetch for every screen)
type Entry = { sub: FamilySubscription | null; loaded: boolean };
const store = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();
const channels = new Map<string, ReturnType<typeof supabase.channel>>();

function emit(fid: string) {
  listeners.get(fid)?.forEach((l) => l());
}

export async function fetchSubscription(fid: string): Promise<FamilySubscription | null> {
  // Before migration 24 runs the table is missing: treat it as "no plan yet".
  const { data, error } = await supabase.from('family_subscriptions').select('*').eq('family_id', fid).maybeSingle();
  if (error) return null;
  if (data) return data as FamilySubscription;
  // A family helper can't read the row (migration 30) but the family's plan covers them: family_has_plan says whether
  // the live map is on. They only ever see "covered" or "paused", never the plan's details.
  const { data: on } = await supabase.rpc('family_has_plan', { fid });
  return on === true ? coveredPlan(fid) : null;
}

/** What a family helper's app knows about the family's plan: on. */
function coveredPlan(fid: string): FamilySubscription {
  return {
    family_id: fid,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    status: 'active',
    plan: null,
    trial_ends_at: null,
    current_period_end: null,
    cancel_at_period_end: false,
    paused_until: null,
    had_trial: true,
    remind_trial: false,
    payer_id: null,
    updated_at: new Date(0).toISOString(),
  };
}

export async function refreshPlan(fid: string) {
  const sub = await fetchSubscription(fid);
  store.set(fid, { sub, loaded: true });
  emit(fid);
  return sub;
}

function watch(fid: string, fn: () => void) {
  let set = listeners.get(fid);
  if (!set) listeners.set(fid, (set = new Set()));
  set.add(fn);
  if (!channels.has(fid)) {
    // Realtime: the webhook's writes show up without a refresh. Unique name per subscription (see CLAUDE.md).
    const ch = supabase
      .channel(`family-sub-${fid}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_subscriptions', filter: `family_id=eq.${fid}` }, () => void refreshPlan(fid))
      .subscribe();
    channels.set(fid, ch);
  }
  return () => {
    set!.delete(fn);
    if (set!.size === 0) {
      const ch = channels.get(fid);
      if (ch) void supabase.removeChannel(ch);
      channels.delete(fid);
    }
  };
}

// Coming back to the app (from the browser, or later) re-reads the plan.
AppState.addEventListener('change', (s) => {
  if (s === 'active' && BILLING_ON) for (const fid of listeners.keys()) if (listeners.get(fid)?.size) void refreshPlan(fid);
});

export type PlanInfo = {
  /** EXPO_PUBLIC_BILLING === '1' */
  enabled: boolean;
  loaded: boolean;
  sub: FamilySubscription | null;
  state: PlanState;
  /** Live map, trips, new bookings and care plan edits are open (always true while billing is off). */
  hasPlan: boolean;
  refresh: () => Promise<void>;
};

/** The family's plan. The one place the app decides what's open (P40's lists). */
export function usePlan(): PlanInfo {
  const { family } = useSession();
  const fid = family?.id ?? '';
  const [, force] = useState(0);
  useEffect(() => {
    if (!BILLING_ON || !fid) return;
    const stop = watch(fid, () => force((n) => n + 1));
    if (!store.get(fid)?.loaded) void refreshPlan(fid);
    return stop;
  }, [fid]);
  const refresh = useCallback(async () => {
    if (BILLING_ON && fid) await refreshPlan(fid);
  }, [fid]);
  const entry = store.get(fid);
  const sub = entry?.sub ?? null;
  if (!BILLING_ON) return { enabled: false, loaded: true, sub: null, state: 'active', hasPlan: true, refresh };
  return { enabled: true, loaded: !!entry?.loaded, sub, state: planState(sub), hasPlan: !entry?.loaded || hasPlan(sub), refresh };
}

/**
 * Booking and care plan edits (P40 "New bookings and care plan edits" pause): call at the top of those screens.
 * Without a plan it swaps the screen for P36. Returns false while it does.
 */
export function useRequirePlan() {
  const plan = usePlan();
  const blocked = plan.enabled && plan.loaded && !plan.hasPlan;
  useEffect(() => {
    if (blocked) router.replace('/parent/plans?from=gate');
  }, [blocked]);
  return !blocked;
}

// ---------------------------------------------------------------- Edge Functions
async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    // FunctionsHttpError carries the function's JSON { error } in its response.
    const ctx = (error as { context?: Response }).context;
    let msg = '';
    try {
      msg = ctx && typeof ctx.json === 'function' ? ((await ctx.json()) as { error?: string }).error ?? '' : '';
    } catch {
      msg = '';
    }
    throw new Error(msg || 'Couldn’t reach billing. Try again.');
  }
  return data as T;
}

/** The app link Stripe sends the browser back to (babybadger://billing in a build, exp://…/--/billing in Expo Go). */
function returnTo() {
  return Linking.createURL('billing');
}

export type BrowserResult = 'success' | 'cancel' | 'closed';

async function openInBrowser(url: string): Promise<BrowserResult> {
  const back = returnTo();
  // An auth session closes itself when Stripe redirects to our link (through the billing-return function).
  const r = await WebBrowser.openAuthSessionAsync(url, back);
  if (r.type === 'success') return /\/success(\?|$)/.test(r.url) ? 'success' : /\/cancel(\?|$)/.test(r.url) ? 'cancel' : 'closed';
  return 'closed';
}

/** P36 → Stripe Checkout (P37) → back in the app. Resolves when the browser closes. */
export async function startCheckout(fid: string, plan: Plan): Promise<BrowserResult> {
  const { url } = await invoke<{ url: string }>('billing-checkout', { familyId: fid, plan, returnTo: returnTo() });
  const result = await openInBrowser(url);
  await waitForWebhook(fid, result === 'success');
  return result;
}

/** P39 "Manage", receipts, switching plan; P40 "Update payment" (flow = payment_method_update). */
export async function openPortal(fid: string, flow?: 'payment_method_update'): Promise<void> {
  const { url } = await invoke<{ url: string }>('billing-portal', { familyId: fid, flow, returnTo: returnTo() });
  await openInBrowser(url);
  await refreshPlan(fid);
}

/** P41: cancel at the end of the period, pause 1–3 months, or undo either. */
export async function manageSubscription(fid: string, action: 'cancel' | 'pause' | 'resume', opts: { months?: number; reason?: string } = {}) {
  await invoke<{ ok: true }>('billing-manage', { familyId: fid, action, ...opts });
  await refreshPlan(fid);
}

/** P38 "Remind me before it ends". */
export async function setTrialReminder(fid: string, on: boolean) {
  const { error } = await supabase.rpc('set_trial_reminder', { p_family: fid, p_on: on });
  if (error) throw error;
  await refreshPlan(fid);
}

/** After Checkout the webhook lands a second or two later: re-read until the plan shows up (about 10 s at most). */
async function waitForWebhook(fid: string, expectPlan: boolean) {
  let sub = await refreshPlan(fid);
  for (let i = 0; expectPlan && !hasPlan(sub) && i < 8; i++) {
    await new Promise((r) => setTimeout(r, 1200));
    sub = await refreshPlan(fid);
  }
}

// ---------------------------------------------------------------- P36 once after first-run setup
// parent/setup (P2) marks the new family; Home shows P36 the next time it's in front, then forgets the mark.
const PLANS_INTRO = 'bb.plansIntro';

export function markPlansIntro(fid: string) {
  try {
    kv.set(PLANS_INTRO, fid);
  } catch {
    // Storage unavailable: no intro; Settings › Subscription still opens P36.
  }
}

/** True once for the marked family (and clears the mark). */
export function takePlansIntro(fid: string) {
  try {
    if (kv.get(PLANS_INTRO) !== fid) return false;
    kv.remove(PLANS_INTRO);
    return true;
  } catch {
    return false;
  }
}
