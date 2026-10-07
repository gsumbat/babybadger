// billing-webhook: Stripe tells us about the family's subscription; we keep public.family_subscriptions in step.
// Deploy WITHOUT JWT verification (Stripe signs the request instead; we check the signature).
// Events: checkout.session.completed, customer.subscription.created / updated / deleted / trial_will_end,
//         invoice.paid, invoice.payment_failed.
// Secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (see docs/billing.md).
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { httpClient: Stripe.createFetchHttpClient() });
const crypto = Stripe.createSubtleCryptoProvider();
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

const iso = (unix?: number | null) => (unix ? new Date(unix * 1000).toISOString() : null);
const idOf = (x: unknown): string | null => (typeof x === 'string' ? x : x && typeof x === 'object' && 'id' in x ? String((x as { id: string }).id) : null);

/** Our status for a Stripe subscription (pause_collection counts as paused; see the migration's check list). */
function statusOf(sub: Stripe.Subscription): string {
  if (sub.pause_collection && (sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due')) return 'paused';
  switch (sub.status) {
    case 'trialing':
    case 'active':
    case 'past_due':
    case 'paused':
    case 'canceled':
    case 'incomplete':
      return sub.status;
    case 'unpaid':
      return 'past_due';
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'none';
  }
}

/** Writes the family's row from the subscription as Stripe has it now (works for every event, in any order). */
async function sync(subOrId: Stripe.Subscription | string, hintFamily?: string | null) {
  const sub = typeof subOrId === 'string' ? await stripe.subscriptions.retrieve(subOrId) : subOrId;
  const customer = idOf(sub.customer);
  let familyId = sub.metadata?.family_id || hintFamily || null;
  if (!familyId && customer) {
    const { data } = await admin.from('family_subscriptions').select('family_id').eq('stripe_customer_id', customer).maybeSingle();
    familyId = data?.family_id ?? null;
  }
  if (!familyId) {
    console.warn('billing-webhook: no family for subscription', sub.id);
    return null;
  }
  const { data: existing } = await admin.from('family_subscriptions').select('had_trial, stripe_subscription_id, status').eq('family_id', familyId).maybeSingle();
  // An old canceled subscription never overwrites a newer one.
  if (existing?.stripe_subscription_id && existing.stripe_subscription_id !== sub.id && sub.status === 'canceled' && existing.status !== 'canceled') return familyId;

  const item = sub.items?.data?.[0];
  const interval = item?.price?.recurring?.interval;
  // Newer Stripe API versions keep the period on the item, older ones on the subscription.
  const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end ?? (item as unknown as { current_period_end?: number })?.current_period_end;
  const row = {
    family_id: familyId,
    stripe_customer_id: customer,
    stripe_subscription_id: sub.id,
    status: statusOf(sub),
    plan: interval === 'year' ? 'yearly' : interval === 'month' ? 'monthly' : null,
    trial_ends_at: iso(sub.trial_end),
    current_period_end: iso(periodEnd),
    cancel_at_period_end: !!(sub.cancel_at_period_end || (sub.cancel_at && sub.status !== 'canceled')),
    paused_until: iso(sub.pause_collection?.resumes_at),
    had_trial: !!existing?.had_trial || !!sub.trial_end,
    payer_id: sub.metadata?.payer_id || null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await admin.from('family_subscriptions').upsert(row, { onConflict: 'family_id' });
  if (error) throw error;
  return familyId;
}

/** The subscription an invoice belongs to (moved under parent.subscription_details in newer API versions). */
function invoiceSubscription(inv: Stripe.Invoice): string | null {
  const x = inv as unknown as { subscription?: unknown; parent?: { subscription_details?: { subscription?: unknown } } };
  return idOf(x.subscription) ?? idOf(x.parent?.subscription_details?.subscription);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });
  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature ?? '', Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '', undefined, crypto);
  } catch (e) {
    console.warn('billing-webhook: bad signature', e instanceof Error ? e.message : e);
    return new Response('Bad signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        const subId = idOf(s.subscription);
        if (s.mode === 'subscription' && subId) await sync(subId, s.client_reference_id ?? s.metadata?.family_id);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed': {
        // Read it fresh so events arriving out of order still leave the latest state.
        const sub = event.data.object as Stripe.Subscription;
        await sync(sub.id);
        break;
      }
      case 'customer.subscription.trial_will_end': {
        // Stripe sends this 3 days before the trial ends: our push (P36 "We remind you 3 days before").
        const sub = event.data.object as Stripe.Subscription;
        const familyId = await sync(sub.id);
        if (familyId) {
          const { error } = await admin.rpc('billing_trial_reminder', { p_family: familyId });
          if (error) console.warn('billing-webhook: reminder not sent', error.message);
        }
        break;
      }
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const subId = invoiceSubscription(event.data.object as Stripe.Invoice);
        if (subId) await sync(subId);
        break;
      }
      default:
        break;
    }
    return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    // 500 makes Stripe retry later.
    console.error('billing-webhook', event.type, e);
    return new Response('Webhook handler failed', { status: 500 });
  }
});
