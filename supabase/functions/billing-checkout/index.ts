// billing-checkout: a parent starts "BabyBadger Family" (wireframe P36 "Start free trial").
// POST { familyId, plan: 'monthly' | 'yearly', returnTo?: 'babybadger://billing' }  →  { url }  (Stripe Checkout)
// Needs the caller's Supabase session (Authorization: Bearer <access token>; supabase.functions.invoke sends it).
// Secrets: STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY, APP_RETURN_URL (see docs/billing.md).
// Self-contained on purpose: it can be pasted into Supabase › Edge Functions as one file.
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const TRIAL_DAYS = 30;
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { httpClient: Stripe.createFetchHttpClient() });
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

/** Where the browser goes back to: only the app's own links (or localhost for the web preview). */
function safeReturn(to: unknown): string {
  const s = typeof to === 'string' ? to : '';
  return /^(babybadger|exps?):\/\/[^\s]*$/.test(s) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/[^\s]*)?$/.test(s) ? s : 'babybadger://billing';
}
function returnUrl(status: string, to: string) {
  const base = Deno.env.get('APP_RETURN_URL') || `${Deno.env.get('SUPABASE_URL')}/functions/v1/billing-return`;
  return `${base}?status=${status}&to=${encodeURIComponent(to)}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  try {
    // 1. Who is calling? (verifies the Supabase JWT)
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data: auth, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !auth.user) return json({ error: 'Sign in first.' }, 401);
    const user = auth.user;

    const { familyId, plan, returnTo } = await req.json().catch(() => ({}));
    if (typeof familyId !== 'string' || (plan !== 'monthly' && plan !== 'yearly')) return json({ error: 'familyId and plan (monthly | yearly) are required.' }, 400);
    const price = Deno.env.get(plan === 'monthly' ? 'STRIPE_PRICE_MONTHLY' : 'STRIPE_PRICE_YEARLY');
    if (!price || !Deno.env.get('STRIPE_SECRET_KEY')) return json({ error: 'Billing is not set up yet.' }, 503);

    // 2. Only the family's owner (families.created_by, migration 32) manages the plan. Other members, with full access or
    // read only, are covered by it.
    const { data: owner } = await admin.from('families').select('id').eq('id', familyId).eq('created_by', user.id).maybeSingle();
    const { data: member } = await admin.from('family_parents').select('user_id').eq('family_id', familyId).eq('user_id', user.id).maybeSingle();
    if (!owner || !member) return json({ error: 'Only the family’s owner can manage the subscription.', code: 'not_owner' }, 403);
    const { data: fam } = await admin.from('families').select('name').eq('id', familyId).maybeSingle();
    const { data: sub } = await admin.from('family_subscriptions').select('*').eq('family_id', familyId).maybeSingle();

    // A family with a live plan changes it in the billing portal instead.
    if (sub?.stripe_subscription_id && ['trialing', 'active', 'past_due', 'paused'].includes(sub.status)) {
      return json({ error: 'This family already has a plan. Manage it in Settings › Subscription.', code: 'already_subscribed' }, 409);
    }

    // 3. One Stripe customer per family, reused for every checkout.
    let customer = sub?.stripe_customer_id as string | null | undefined;
    if (!customer) {
      const c = await stripe.customers.create({
        email: user.email ?? undefined,
        name: fam?.name ?? undefined,
        metadata: { family_id: familyId, payer_id: user.id },
      });
      customer = c.id;
      const { error } = await admin
        .from('family_subscriptions')
        .upsert({ family_id: familyId, stripe_customer_id: customer, updated_at: new Date().toISOString() }, { onConflict: 'family_id' });
      if (error) throw error;
    }

    // 4. Checkout: card up front, 30-day trial only for a family that never had one.
    const to = safeReturn(returnTo);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer,
      client_reference_id: familyId,
      line_items: [{ price, quantity: 1 }],
      payment_method_collection: 'always',
      subscription_data: {
        ...(sub?.had_trial ? {} : { trial_period_days: TRIAL_DAYS, trial_settings: { end_behavior: { missing_payment_method: 'cancel' } } }),
        metadata: { family_id: familyId, payer_id: user.id },
      },
      metadata: { family_id: familyId, payer_id: user.id },
      success_url: returnUrl('success', to),
      cancel_url: returnUrl('cancel', to),
    });
    return json({ url: session.url });
  } catch (e) {
    console.error('billing-checkout', e);
    return json({ error: e instanceof Error ? e.message : 'Something went wrong.' }, 500);
  }
});
