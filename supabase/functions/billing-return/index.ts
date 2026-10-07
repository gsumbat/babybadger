// billing-return: where Stripe Checkout and the billing portal send the browser back to. Stripe only accepts
// https links, so this public page forwards to the app's own link (babybadger://billing/success, …), which closes
// the in-app browser. Deploy WITHOUT JWT verification (the browser has no Supabase session).
// GET ?status=success|cancel|portal&to=babybadger://billing  →  303 to babybadger://billing/success
function safeReturn(to: string | null): string {
  const s = to ?? '';
  return /^(babybadger|exps?):\/\/[^\s]*$/.test(s) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/[^\s]*)?$/.test(s) ? s : 'babybadger://billing';
}

Deno.serve((req) => {
  const u = new URL(req.url);
  const status = ['success', 'cancel', 'portal'].includes(u.searchParams.get('status') ?? '') ? u.searchParams.get('status')! : 'portal';
  const to = safeReturn(u.searchParams.get('to')).replace(/\/+$/, '');
  return new Response(null, { status: 303, headers: { Location: `${to}/${status}`, 'Cache-Control': 'no-store' } });
});
