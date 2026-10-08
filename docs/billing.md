# Billing: "BabyBadger Family" with Stripe

Parents pay for one plan per family through **Stripe** (not App Store / Google Play in-app purchase). The plan covers
4 seats (full access or read only); sitters are always free. US only. Only the family's **owner** (`families.created_by`,
migration 32) starts, changes or cancels the plan: the billing Edge Functions, `set_trial_reminder` and the screens
(behind `Stack.Protected guard={isOwner}`) check it, and the trial reminder push goes to the owner only. Everyone else
sees no Subscription row and no billing banners; the paused map says "Jen can restart the plan". Build and test everything in Stripe **test mode** first.

| Plan | Price | Copy |
|---|---|---|
| Yearly | $119.88 / year | "Works out to $9.99/mo", "SAVE 20%" |
| Monthly | $11.99 / month | "Flexible, cancel anytime" |

- 30-day free trial, card collected up front (Stripe Checkout). A family gets the trial once (`had_trial`).
- Failed payment: everything keeps working for 7 days after the period ended while Stripe retries (P40).
- After a plan ends the family's data is kept 12 months (copy only; nothing deletes it yet).

## How it fits together

```
App (P36 "Start free trial")
  └─ supabase.functions.invoke('billing-checkout')  → Stripe Checkout URL
       └─ in-app browser (expo-web-browser auth session) → Stripe Checkout (P37)
            └─ Stripe redirects to https://<project>.supabase.co/functions/v1/billing-return?status=success&to=babybadger://billing
                 └─ 303 to babybadger://billing/success → the in-app browser closes itself → P38
Stripe ──webhook──▶ billing-webhook ──service role──▶ public.family_subscriptions ──Realtime──▶ app
```

Why the `billing-return` hop: Stripe's `success_url` / `cancel_url` must be `https` links, so Stripe can't send the
browser straight to `babybadger://`. The small `billing-return` function (public, no JWT) answers with a redirect to
the app link the app asked for. Only `babybadger://`, `exp://` / `exps://` (Expo Go) and `http://localhost` (web
preview) links are allowed, anything else falls back to `babybadger://billing`. If the phone opens the app with the
link instead, the route `app/src/app/billing/[status].tsx` sends it to P38 or P39.

## Pieces in the repo

| What | Where |
|---|---|
| Table, `family_has_plan()`, `set_trial_reminder()`, `billing_trial_reminder()` | `supabase/migrations/20261006000024_billing.sql` |
| Checkout session (the owner only, creates/reuses the family's Stripe customer, 30-day trial if never had one) | `supabase/functions/billing-checkout/index.ts` |
| Billing portal session (receipts, card, switch plan; `flow: 'payment_method_update'` for P40) | `supabase/functions/billing-portal/index.ts` |
| Cancel at period end (with reason), pause 1/2/3 months, resume (P41) | `supabase/functions/billing-manage/index.ts` |
| Stripe webhook (signature checked, writes the row with the service role, sends the trial reminder push) | `supabase/functions/billing-webhook/index.ts` |
| Browser return redirect | `supabase/functions/billing-return/index.ts` |
| App logic (tested) / hooks and calls | `app/src/lib/billing-logic.ts`, `app/src/lib/billing.ts` |
| Screens | `parent/plans` (P36), `parent/trial-started` (P38), `parent/subscription` (P39), `parent/cancel` (P41), Home banner (P40), live map lock (P4l) |

Each function is one self-contained file, so it can be pasted into the Supabase dashboard as is.

## Feature flag

Billing is **off** unless the app is started with `EXPO_PUBLIC_BILLING=1` (in `app/.env.local`, or in the EAS build
profile's `env`). Off: Settings › Subscription reads "Coming soon", nothing is locked, no Stripe call is made. Turn it
on only after every step below works in test mode, otherwise families without a plan lose the live map and booking.

## Step 1. Stripe account and products (test mode)

1. Create the new Stripe account for BabyBadger (country United States). Leave **Test mode** on (toggle top right).
2. **Product catalog › Add product**
   - Name: `BabyBadger Family`. Description: `Live map, trips, care plan and reports for your family. Both parents, unlimited sitters.`
   - Price 1: **Recurring**, `$11.99` USD, **Monthly**. Save.
   - Add another price: **Recurring**, `$119.88` USD, **Yearly**. Save.
   - Don't set a trial on the prices (the trial is set by `billing-checkout`, so a family gets it only once).
3. Open each price and copy its ID (`price_...`). You need them for `STRIPE_PRICE_MONTHLY` and `STRIPE_PRICE_YEARLY`.
4. **Developers › API keys**: copy the **Secret key** (`sk_test_...`) for `STRIPE_SECRET_KEY`. Never paste it in the app
   or in chat; it only goes into Supabase secrets.
5. **Settings › Billing › Subscriptions and emails**
   - Manage failed payments: Smart Retries on; "If all retries for a payment fail": **Cancel the subscription**.
   - Customer emails: turn on "Send emails about upcoming renewals" / "trial ending" reminders and "Send emails when
     card payments fail" (Stripe's email reminder before the trial ends; our app push goes 3 days before).
   - Free trial: "If the customer did not provide a payment method" → cancel (Checkout always collects one anyway).
6. **Settings › Business › Public details**: business name `BabyBadger`, support email, statement descriptor
   `BABYBADGER`. **Settings › Branding**: logo and brand color `#47698A` (Checkout and the portal use them).

## Step 2. Customer portal

**Settings › Billing › Customer portal** (test mode):

- Invoices: **Show invoice history** on.
- Customer information: allow updating email and billing address.
- Payment methods: **allow customers to update payment methods** on.
- Cancellations: **allow customers to cancel subscriptions** on, **Cancel at end of billing period**; ask for a reason
  (optional). (P41 also cancels from inside the app through `billing-manage`; both end the same way.)
- Subscriptions: **allow customers to switch plans** on; add the `BabyBadger Family` product with both prices.
  Proration: "Prorate charges and credits" (P39 says "Unused days count toward it").
- Pause: **allow customers to pause subscriptions** if your portal shows the option (P41 pauses from inside the app
  through `billing-manage` either way).
- Default redirect link: leave empty (each portal session sets its own return link).
- Save.

## Step 3. Database

Run `supabase/migrations/20261006000024_billing.sql` in the Supabase **SQL Editor** (paste the whole file, Run). It
is safe to run again. It creates `public.family_subscriptions` (parents of the family can read their row; only the
server writes), `family_has_plan(fid)`, `set_trial_reminder(fid, on)` and `billing_trial_reminder(fid)` (server only;
uses the `notify_users` push helper from migration 10), and adds the table to Realtime.

## Step 4. Edge Functions

Five functions: `billing-checkout`, `billing-portal`, `billing-manage`, `billing-webhook`, `billing-return`.

**JWT verification:** `billing-checkout`, `billing-portal`, `billing-manage` keep it **on** (the app sends the
parent's session). `billing-webhook` (Stripe calls it) and `billing-return` (the browser calls it) must have it
**off**; they check the Stripe signature / only redirect.

### Option A: Supabase dashboard

For each function:

1. Supabase › **Edge Functions › Deploy a new function › Via Editor**.
2. Name it exactly as above (e.g. `billing-checkout`).
3. Delete the sample code, paste the whole `supabase/functions/<name>/index.ts`, **Deploy function**.
4. For `billing-webhook` and `billing-return`: open the function › **Details** (or Settings) › turn **Enforce JWT
   verification / Verify JWT** **off** › Save.

### Option B: command line

```bash
cd "/Users/gs/Documents/George/Claude cowork/JOBBADGER/BABYBADGER/babybadger-app"
npx supabase login
npx supabase functions deploy billing-checkout --project-ref odsszoefdgepjdfvpwnn
npx supabase functions deploy billing-portal   --project-ref odsszoefdgepjdfvpwnn
npx supabase functions deploy billing-manage   --project-ref odsszoefdgepjdfvpwnn
npx supabase functions deploy billing-webhook  --project-ref odsszoefdgepjdfvpwnn --no-verify-jwt
npx supabase functions deploy billing-return   --project-ref odsszoefdgepjdfvpwnn --no-verify-jwt
```

### Secrets

Supabase › **Edge Functions › Secrets** (or `npx supabase secrets set NAME=value --project-ref odsszoefdgepjdfvpwnn`):

| Name | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` from Step 1 (later the live key) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from Step 5 |
| `STRIPE_PRICE_MONTHLY` | the monthly `price_...` |
| `STRIPE_PRICE_YEARLY` | the yearly `price_...` |
| `APP_RETURN_URL` | `https://odsszoefdgepjdfvpwnn.supabase.co/functions/v1/billing-return` (optional: this is also the default) |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to Edge Functions automatically.

## Step 5. Stripe webhook

1. Stripe › **Developers › Webhooks › Add endpoint** (test mode).
2. Endpoint URL: `https://odsszoefdgepjdfvpwnn.supabase.co/functions/v1/billing-webhook`
3. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end` (sends our "trial ends" push, 3 days before)
   - `customer.subscription.paused`, `customer.subscription.resumed`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Add endpoint, then **Reveal** the signing secret (`whsec_...`) and save it as `STRIPE_WEBHOOK_SECRET` (Step 4).

## Step 6. Turn it on in the app and test

1. In `app/.env.local` add `EXPO_PUBLIC_BILLING=1`, restart `npx expo start -c`.
2. Settings › Subscription reads "Start free trial" → P36 → Start free trial → Stripe Checkout opens in the in-app
   browser. Test card `4242 4242 4242 4242`, any future date, any CVC, ZIP `33602`.
3. The browser closes, P38 shows "Your free trial is on" with the trial end date; Settings reads
   "Free trial · ends <date>". In Supabase › Table editor › `family_subscriptions` the row reads `trialing`.
4. P39: Receipts / Manage open the Stripe portal. Cancel subscription → P41 → the row gets
   `cancel_at_period_end = true`, P39 reads "Ending", "Keep my plan" undoes it.
5. To try a failed payment: in Stripe, use **Billing › Test clocks** (create a customer on a test clock, start a trial,
   advance the clock past the trial with card `4000 0000 0000 0341`): the row turns `past_due` and Home shows P40.
6. Webhook deliveries and errors: Stripe › Developers › Webhooks › the endpoint; function logs: Supabase › Edge
   Functions › billing-webhook › Logs.

Going live later: create the same product, prices, portal settings and webhook in **live mode**, replace the four
Stripe secrets with the live values, and run a real-card test.

## What the app locks without a plan (billing on)

`usePlan()` in `app/src/lib/billing.ts` is the single check. A family **has the plan** while trialing, active (also
when set to cancel at the period end), or past due within 7 days of the period end. Without it (no plan, ended,
paused, or past due beyond the grace), following P40's lists:

- Still works: kid Help alerts, messages with the sitter, past reports and receipts, Settings.
- Paused: the live map (P4 shows the P4l lock card) and trip maps (P8), new bookings (`parent/shift/new` opens P36),
  care plan edits (`parent/care/item` opens P36; for anyone but the owner they go back Home instead).

New families see P36 once after first-run setup (P2 → P3), closable. The database does not enforce the plan yet
(`family_has_plan()` exists for when it should).
