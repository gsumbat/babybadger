import { describe, expect, it } from '@jest/globals';

import {
  accessEnds,
  graceEnds,
  hasPlan,
  longDate,
  pauseLabel,
  pauseUntil,
  paymentIssueText,
  planLine,
  plansButton,
  plansFooter,
  plansIntro,
  planState,
  planTitle,
  settingsValue,
  shortDate,
  statePill,
  trialTimeline,
  type FamilySubscription,
} from '../billing-logic';

// Local times, so the dates read the same in any time zone.
const NOW = new Date(2026, 9, 7, 10, 0); // Wed, Oct 7 2026
const at = (m: number, d: number) => new Date(2026, m, d, 12, 0).toISOString();
const sub = (over: Partial<FamilySubscription>): FamilySubscription => ({
  family_id: 'f',
  stripe_customer_id: 'cus_1',
  stripe_subscription_id: 'sub_1',
  status: 'active',
  plan: 'monthly',
  trial_ends_at: null,
  current_period_end: at(10, 15), // Nov 15
  cancel_at_period_end: false,
  paused_until: null,
  had_trial: true,
  remind_trial: true,
  payer_id: 'jen',
  updated_at: NOW.toISOString(),
  ...over,
});

describe('planState', () => {
  it('maps the stored status', () => {
    expect(planState(null)).toBe('none');
    expect(planState(sub({ status: 'none' }))).toBe('none');
    expect(planState(sub({ status: 'incomplete' }))).toBe('none');
    expect(planState(sub({ status: 'trialing' }))).toBe('trialing');
    expect(planState(sub({ status: 'active' }))).toBe('active');
    expect(planState(sub({ status: 'past_due' }))).toBe('past_due');
    expect(planState(sub({ status: 'paused' }))).toBe('paused');
    expect(planState(sub({ status: 'canceled' }))).toBe('ended');
  });
  it('a trial or plan that won’t renew is canceling', () => {
    expect(planState(sub({ status: 'active', cancel_at_period_end: true }))).toBe('canceling');
    expect(planState(sub({ status: 'trialing', cancel_at_period_end: true }))).toBe('canceling');
  });
});

describe('hasPlan (same rule as family_has_plan)', () => {
  it('trialing, active and canceling have it; none, paused and ended don’t', () => {
    expect(hasPlan(sub({ status: 'trialing' }), NOW)).toBe(true);
    expect(hasPlan(sub({ status: 'active' }), NOW)).toBe(true);
    expect(hasPlan(sub({ cancel_at_period_end: true }), NOW)).toBe(true);
    expect(hasPlan(null, NOW)).toBe(false);
    expect(hasPlan(sub({ status: 'paused' }), NOW)).toBe(false);
    expect(hasPlan(sub({ status: 'canceled' }), NOW)).toBe(false);
  });
  it('past due keeps it for 7 days after the period ended', () => {
    const due = sub({ status: 'past_due', current_period_end: at(9, 3) }); // Oct 3 → grace until Oct 10
    expect(hasPlan(due, NOW)).toBe(true);
    expect(shortDate(graceEnds(due))).toBe('Oct 10');
    expect(hasPlan(sub({ status: 'past_due', current_period_end: at(8, 28) }), NOW)).toBe(false);
    expect(hasPlan(sub({ status: 'past_due', current_period_end: null }), NOW)).toBe(false);
  });
});

describe('copy', () => {
  it('Settings row', () => {
    expect(settingsValue(null, NOW)).toBe('Start free trial');
    expect(settingsValue(sub({ status: 'trialing', trial_ends_at: at(10, 6) }), NOW)).toBe('Free trial · ends Nov 6');
    expect(settingsValue(sub({}), NOW)).toBe('Family · monthly');
    expect(settingsValue(sub({ plan: 'yearly' }), NOW)).toBe('Family · yearly');
    expect(settingsValue(sub({ status: 'past_due', current_period_end: at(9, 3) }), NOW)).toBe('Payment issue');
    expect(settingsValue(sub({ status: 'past_due', current_period_end: at(8, 1) }), NOW)).toBe('Paused · payment issue');
    expect(settingsValue(sub({ cancel_at_period_end: true }), NOW)).toBe('Ends Nov 15');
    expect(settingsValue(sub({ status: 'paused', paused_until: at(11, 7) }), NOW)).toBe('Paused until Dec 7');
    expect(settingsValue(sub({ status: 'canceled' }), NOW)).toBe('Ended · resubscribe');
  });
  it('P39 card and pill', () => {
    expect(planTitle('monthly')).toBe('Monthly · $11.99');
    expect(planTitle('yearly')).toBe('Yearly · $119.88');
    expect(planLine(sub({}), NOW)).toBe('Renews Nov 15 · Card');
    expect(planLine(sub({ status: 'trialing', plan: 'yearly', trial_ends_at: at(10, 6) }), NOW)).toBe('Free until Nov 6 · then $119.88/year');
    expect(planLine(sub({ cancel_at_period_end: true }), NOW)).toBe('Ends Nov 15 · won’t renew');
    expect(planLine(sub({ status: 'trialing', trial_ends_at: at(10, 6), current_period_end: at(10, 6), cancel_at_period_end: true }), NOW)).toBe('Ends Nov 6 · won’t renew');
    expect(statePill('active')).toEqual({ label: 'Active', kind: 'ok' });
    expect(statePill('trialing').label).toBe('Free trial');
    expect(statePill('past_due').label).toBe('Payment issue');
  });
  it('P36 footer and button', () => {
    expect(plansFooter('yearly', false, NOW)).toBe('Then $119.88/year from Nov 6 unless you cancel. We remind you 3 days before.');
    expect(plansFooter('monthly', false, NOW)).toBe('Then $11.99/month from Nov 6 unless you cancel. We remind you 3 days before.');
    expect(plansFooter('yearly', true, NOW)).toBe('$119.88/year, starting today. Cancel anytime in Settings.');
    expect(plansIntro(false)).toBe('Free for 30 days. Cancel anytime.');
    expect(plansButton(false)).toBe('Start free trial');
    expect(plansButton(true)).toBe('Subscribe');
  });
  it('P38 timeline for a 30-day trial', () => {
    const t = trialTimeline(new Date(2026, 10, 6, 10, 0), NOW);
    expect(t).toEqual({ endsLong: 'Fri, Nov 6', reminder: 'Nov 3', firstCharge: 'Nov 6', progress: 0.08 });
    expect(trialTimeline(null, NOW).firstCharge).toBe('Nov 6');
    expect(trialTimeline(new Date(2026, 9, 22, 10, 0), NOW).progress).toBeCloseTo(0.5);
  });
  it('P41 access end and pause', () => {
    expect(accessEnds(sub({ status: 'trialing', trial_ends_at: at(10, 6) }))).toBe(at(10, 6));
    expect(accessEnds(sub({}))).toBe(at(10, 15));
    expect(pauseLabel(1)).toBe('Pause for 1 month');
    expect(pauseLabel(3)).toBe('Pause for 3 months');
    expect(pauseUntil(2, NOW)).toBe('Dec 7');
  });
  it('P40 banner', () => {
    expect(longDate(new Date(2026, 10, 20))).toBe('Fri, Nov 20');
    expect(paymentIssueText(sub({ status: 'past_due', current_period_end: at(10, 13) }))).toBe(
      'Everything keeps working until Fri, Nov 20 while we retry your card. Update your card to avoid a pause.',
    );
  });
});
