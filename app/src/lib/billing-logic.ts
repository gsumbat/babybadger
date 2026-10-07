// Parent subscription "BabyBadger Family" (Stripe; wireframes P36–P41). Pure logic, tested in __tests__/billing.test.ts.
// The row is public.family_subscriptions (migration 24), written only by the Stripe webhook.

export type SubStatus = 'trialing' | 'active' | 'past_due' | 'paused' | 'canceled' | 'incomplete' | 'none';
export type Plan = 'monthly' | 'yearly';

export type FamilySubscription = {
  family_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubStatus;
  plan: Plan | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  paused_until: string | null;
  had_trial: boolean;
  remind_trial: boolean;
  payer_id: string | null;
  updated_at: string;
};

/** What the parent sees. `canceling` = trial or paid plan that won't renew; `ended` = canceled. */
export type PlanState = 'none' | 'trialing' | 'active' | 'past_due' | 'paused' | 'canceling' | 'ended';

export const TRIAL_DAYS = 30;
/** P40: a failed payment keeps everything working this long after the period ended (same as family_has_plan()). */
export const GRACE_DAYS = 7;
/** P40 / P41: family data kept after the plan ends (copy only; nothing deletes it yet). */
export const DATA_KEPT_MONTHS = 12;
/** P41 "Pause instead?": Stripe pause_collection for 1–3 months. */
export const PAUSE_MONTHS = [1, 2, 3] as const;

export const PRICES: Record<Plan, { amount: string; per: string; perShort: string; note: string }> = {
  yearly: { amount: '$119.88', per: 'per year', perShort: '/year', note: 'Works out to $9.99/mo' },
  monthly: { amount: '$11.99', per: 'per month', perShort: '/month', note: 'Flexible, cancel anytime' },
};

const DAY = 86_400_000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** "Nov 6" */
export function shortDate(d: string | Date | null | undefined) {
  if (!d) return '';
  const x = new Date(d);
  return `${MONTHS[x.getMonth()]} ${x.getDate()}`;
}
/** "Thu, Oct 15" */
export function longDate(d: string | Date | null | undefined) {
  if (!d) return '';
  const x = new Date(d);
  return `${WEEKDAYS[x.getDay()]}, ${shortDate(x)}`;
}
export function addDays(d: Date, n: number) {
  return new Date(d.getTime() + n * DAY);
}
export function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

export function planState(sub: FamilySubscription | null | undefined): PlanState {
  if (!sub) return 'none';
  switch (sub.status) {
    case 'trialing':
    case 'active':
      return sub.cancel_at_period_end ? 'canceling' : sub.status;
    case 'past_due':
      return 'past_due';
    case 'paused':
      return 'paused';
    case 'canceled':
      return 'ended';
    default:
      // none / incomplete (checkout started, never finished)
      return 'none';
  }
}

/** When a past-due family loses access (P40 "Everything keeps working until Fri, Nov 20"). */
export function graceEnds(sub: Pick<FamilySubscription, 'current_period_end'> | null | undefined): Date | null {
  return sub?.current_period_end ? addDays(new Date(sub.current_period_end), GRACE_DAYS) : null;
}

/** Same rule as public.family_has_plan(): trialing / active (even if it won't renew), or past due within the grace. */
export function hasPlan(sub: FamilySubscription | null | undefined, now = new Date()) {
  const s = planState(sub);
  if (s === 'trialing' || s === 'active' || s === 'canceling') return true;
  if (s === 'past_due') {
    const g = graceEnds(sub);
    return !!g && now < g;
  }
  return false;
}

/** The last day of full access for a plan that won't renew (P41 "Full access until"). */
export function accessEnds(sub: FamilySubscription | null | undefined) {
  if (!sub) return null;
  if (sub.status === 'trialing' && sub.trial_ends_at) return sub.trial_ends_at;
  return sub.current_period_end ?? sub.trial_ends_at;
}

/** P12b Settings › Subscription row value. */
export function settingsValue(sub: FamilySubscription | null | undefined, now = new Date()) {
  const s = planState(sub);
  switch (s) {
    case 'trialing':
      return `Free trial · ends ${shortDate(sub!.trial_ends_at)}`;
    case 'active':
      return `Family · ${sub!.plan ?? 'monthly'}`;
    case 'canceling':
      return `Ends ${shortDate(accessEnds(sub))}`;
    case 'past_due':
      return hasPlan(sub, now) ? 'Payment issue' : 'Paused · payment issue';
    case 'paused':
      return sub!.paused_until ? `Paused until ${shortDate(sub!.paused_until)}` : 'Paused';
    case 'ended':
      return 'Ended · resubscribe';
    default:
      return 'Start free trial';
  }
}

export type PillKind = 'ok' | 'info' | 'warn' | 'muted' | 'bad';
/** P39 header pill. */
export function statePill(s: PlanState): { label: string; kind: PillKind } {
  switch (s) {
    case 'active':
      return { label: 'Active', kind: 'ok' };
    case 'trialing':
      return { label: 'Free trial', kind: 'info' };
    case 'canceling':
      return { label: 'Ending', kind: 'warn' };
    case 'past_due':
      return { label: 'Payment issue', kind: 'warn' };
    case 'paused':
      return { label: 'Paused', kind: 'muted' };
    case 'ended':
      return { label: 'Ended', kind: 'bad' };
    default:
      return { label: 'No plan', kind: 'muted' };
  }
}

/** P39 blue card: "Monthly · $11.99". */
export function planTitle(plan: Plan | null | undefined) {
  const p = plan ?? 'monthly';
  return `${p === 'yearly' ? 'Yearly' : 'Monthly'} · ${PRICES[p].amount}`;
}

/** P39 blue card, line under the title. */
export function planLine(sub: FamilySubscription | null | undefined, now = new Date()) {
  const s = planState(sub);
  const p = PRICES[sub?.plan ?? 'monthly'];
  switch (s) {
    case 'active':
      return `Renews ${shortDate(sub!.current_period_end)} · Card`;
    case 'trialing':
      return `Free until ${shortDate(sub!.trial_ends_at)} · then ${p.amount}${p.perShort}`;
    case 'canceling':
      return `Ends ${shortDate(accessEnds(sub))} · won’t renew`;
    case 'past_due':
      return hasPlan(sub, now) ? `Payment due · retrying your card` : 'Paused · payment didn’t go through';
    case 'paused':
      return sub!.paused_until ? `Paused until ${shortDate(sub!.paused_until)} · no charges` : 'Paused · no charges';
    case 'ended':
      return `Ended ${shortDate(sub!.current_period_end)}`;
    default:
      return '';
  }
}

/** P36 sub-line under the title. */
export function plansIntro(hadTrial: boolean) {
  return hadTrial ? 'One plan for your household. Cancel anytime.' : `Free for ${TRIAL_DAYS} days. Cancel anytime.`;
}
/** P36 main button. */
export function plansButton(hadTrial: boolean) {
  return hadTrial ? 'Subscribe' : 'Start free trial';
}
/** P36 footer: "Then $119.88/year from Nov 6 unless you cancel. We remind you 3 days before." */
export function plansFooter(plan: Plan, hadTrial: boolean, now = new Date()) {
  const p = PRICES[plan];
  if (hadTrial) return `${p.amount}${p.perShort}, starting today. Cancel anytime in Settings.`;
  return `Then ${p.amount}${p.perShort} from ${shortDate(addDays(now, TRIAL_DAYS))} unless you cancel. We remind you 3 days before.`;
}

/** P38 timeline: today → reminder (3 days before) → first charge. */
export function trialTimeline(trialEnds: string | Date | null | undefined, now = new Date()) {
  const end = trialEnds ? new Date(trialEnds) : addDays(now, TRIAL_DAYS);
  const total = TRIAL_DAYS * DAY;
  const left = Math.max(0, end.getTime() - now.getTime());
  const done = Math.min(1, Math.max(0, 1 - left / total));
  return {
    endsLong: longDate(end),
    reminder: shortDate(addDays(end, -3)),
    firstCharge: shortDate(end),
    // P38 draws a sliver on day one (8%)
    progress: Math.max(0.08, done),
  };
}

/** P41 "Pause instead?" button and the date it resumes. */
export function pauseLabel(months: number) {
  return `Pause for ${months} ${months === 1 ? 'month' : 'months'}`;
}
export function pauseUntil(months: number, now = new Date()) {
  return shortDate(addMonths(now, months));
}

/** P41 reason chips (sent to Stripe as cancellation feedback). */
export const CANCEL_REASONS = ['Too expensive', 'Only need it some months', 'Sitter didn’t want it', 'Missing a feature', 'Other'] as const;

/** P40 Home banner (shown while past due and still inside the grace). */
export function paymentIssueText(sub: FamilySubscription | null | undefined) {
  return `Everything keeps working until ${longDate(graceEnds(sub))} while we retry your card. Update your card to avoid a pause.`;
}

/** P41 Refund "Contact us". PLACEHOLDER: George to confirm the support address. */
export const SUPPORT_EMAIL = 'help@babybadger.app';
