// billing-manage: P41 "Cancel or pause" without leaving the app.
// POST { familyId, action: 'cancel', reason?: string }          → cancels at the end of the period (or the trial)
// POST { familyId, action: 'pause', months: 1 | 2 | 3 }          → Stripe pause_collection (no charges, plan paused)
// POST { familyId, action: 'resume' }                            → undoes a pending cancel and/or a pause
// Returns { ok: true }. The row is updated right away; the webhook confirms it a moment later.
// Needs the caller's Supabase session. Secret: STRIPE_SECRET_KEY.
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
const iso = (unix?: number | null) => (unix ? new Date(unix * 1000).toISOString() : null);

// P41 reason chips → Stripe's cancellation feedback (the chip text goes in the comment).
const FEEDBACK: Record<string, Stripe.SubscriptionUpdateParams.CancellationDetails.Feedback> = {
  'Too expensive': 'too_expensive',
  'Only need it some months': 'unused',
  'Missing a feature': 'missing_features',
  'Sitter didn’t want it': 'other',
  Other: 'other',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  try {
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data: auth, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !auth.user) return json({ error: 'Sign in first.' }, 401);
    if (!Deno.env.get('STRIPE_SECRET_KEY')) return json({ error: 'Billing is not set up yet.' }, 503);

    const { familyId, action, months, reason } = await req.json().catch(() => ({}));
    if (typeof familyId !== 'string' || !['cancel', 'pause', 'resume'].includes(action)) return json({ error: 'familyId and action are required.' }, 400);
    const { data: parent } = await admin.from('family_parents').select('*').eq('family_id', familyId).eq('user_id', auth.user.id).maybeSingle();
    // Family helpers (migration 30, role 'helper') are covered by the plan but can't manage it. Before migration 30 there
    // is no role column: every row is a parent.
    if (!parent || (parent as { role?: string }).role === 'helper') return json({ error: 'Only a parent of this family can do that.' }, 403);
    const { data: row } = await admin.from('family_subscriptions').select('stripe_subscription_id').eq('family_id', familyId).maybeSingle();
    if (!row?.stripe_subscription_id) return json({ error: 'No plan to change.' }, 404);

    const current = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
    if (current.status === 'canceled') return json({ error: 'This plan has already ended.' }, 409);

    let sub: Stripe.Subscription;
    if (action === 'cancel') {
      const text = typeof reason === 'string' ? reason.slice(0, 200) : '';
      sub = await stripe.subscriptions.update(current.id, {
        cancel_at_period_end: true,
        ...(text ? { cancellation_details: { feedback: FEEDBACK[text] ?? 'other', comment: text } } : {}),
      });
    } else if (action === 'pause') {
      const n = Number(months);
      if (![1, 2, 3].includes(n)) return json({ error: 'Pause for 1, 2 or 3 months.' }, 400);
      if (current.status !== 'active') return json({ error: 'Only a paid plan can be paused.' }, 409);
      const until = new Date();
      until.setMonth(until.getMonth() + n);
      sub = await stripe.subscriptions.update(current.id, {
        pause_collection: { behavior: 'void', resumes_at: Math.floor(until.getTime() / 1000) },
      });
    } else {
      sub = await stripe.subscriptions.update(current.id, { cancel_at_period_end: false, pause_collection: '' });
    }

    // Show the change at once; the webhook writes the full row again a moment later.
    const paused = !!sub.pause_collection;
    await admin
      .from('family_subscriptions')
      .update({
        cancel_at_period_end: !!sub.cancel_at_period_end,
        paused_until: iso(sub.pause_collection?.resumes_at),
        ...(paused ? { status: 'paused' } : action === 'resume' ? { status: sub.status === 'trialing' ? 'trialing' : sub.status === 'past_due' ? 'past_due' : 'active' } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('family_id', familyId);
    return json({ ok: true });
  } catch (e) {
    console.error('billing-manage', e);
    return json({ error: e instanceof Error ? e.message : 'Something went wrong.' }, 500);
  }
});
