// billing-portal: a parent opens Stripe's billing portal (P39 "Payment method · Manage", receipts, switch plan;
// P40 "Update payment").
// POST { familyId, flow?: 'payment_method_update', returnTo?: 'babybadger://billing' }  →  { url }
// Needs the caller's Supabase session. Secrets: STRIPE_SECRET_KEY, APP_RETURN_URL (see docs/billing.md).
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { httpClient: Stripe.createFetchHttpClient() });
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

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
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data: auth, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !auth.user) return json({ error: 'Sign in first.' }, 401);
    if (!Deno.env.get('STRIPE_SECRET_KEY')) return json({ error: 'Billing is not set up yet.' }, 503);

    const { familyId, flow, returnTo } = await req.json().catch(() => ({}));
    if (typeof familyId !== 'string') return json({ error: 'familyId is required.' }, 400);
    const { data: parent } = await admin.from('family_parents').select('*').eq('family_id', familyId).eq('user_id', auth.user.id).maybeSingle();
    // Family helpers (migration 30, role 'helper') are covered by the plan but can't manage it. Before migration 30 there
    // is no role column: every row is a parent.
    if (!parent || (parent as { role?: string }).role === 'helper') return json({ error: 'Only a parent of this family can do that.' }, 403);

    const { data: sub } = await admin.from('family_subscriptions').select('stripe_customer_id, stripe_subscription_id').eq('family_id', familyId).maybeSingle();
    if (!sub?.stripe_customer_id) return json({ error: 'No plan yet. Start the free trial first.', code: 'no_customer' }, 404);

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: returnUrl('portal', safeReturn(returnTo)),
      ...(flow === 'payment_method_update' ? { flow_data: { type: 'payment_method_update' as const } } : {}),
    });
    return json({ url: session.url });
  } catch (e) {
    console.error('billing-portal', e);
    return json({ error: e instanceof Error ? e.message : 'Something went wrong.' }, 500);
  }
});
