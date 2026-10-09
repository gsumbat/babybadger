// kid-insights: "Prepare a summary" on Ava’s report (P5h → P5j). A parent getting ready for a pediatrician visit gets
// a plain-language summary of the kid's sitter logs in a range, with questions to ask (markdown: "## " headings,
// "- " bullets; the app reads it with lib/kid-report summaryLines).
// POST { kidId, since, until? } (ISO dates)  →  { summary }
// Reads only with the caller's own session (their JWT), so RLS decides what they may see; never the service role.
// Deploy:  supabase functions deploy kid-insights
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
import { createClient } from 'npm:@supabase/supabase-js@2';

const MODEL = 'claude-haiku-5-5';
const MAX_ENTRIES = 400;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const SYSTEM = `You help a parent prepare for a pediatrician visit from their babysitters' logs about one child.
Summarize, for the period given: feeding (meals, snacks, bottles: amounts, milk, how much was drunk and the time between bottles, compared with the planned bottles when given), sleep (naps, lengths, how they went), diapers and potty, activities, incidents, and anything unusual or changing over the period.
Then list 3 to 6 questions the parent may want to ask the pediatrician.
Write in plain, warm, short language for a parent. Do not diagnose and do not give medical advice. Do not invent facts that are not in the logs. If the logs are thin or cover few days, say so.
Format: markdown with "## " headings and "- " bullets only. No tables, no bold, no preamble.`;

type Log = { kind: string; data: Record<string, string> | null; kid_ids: string[] | null; urgent: boolean; happened_at: string; shift_id: string };
type CareItem = { title: string; starts: string | null; ends: string | null; every_minutes?: number | null; details?: { amount?: number; amount_oz?: number; unit?: string; milk?: string } | null };
type Kid = { name: string; birthdate: string | null; avoid_foods?: string; allergies?: string; health_notes?: string; family_id: string };

const KEEP: Record<string, string[]> = {
  food: ['meal', 'what', 'amount'],
  nap: ['started_at', 'ended_at', 'how', 'note'],
  activity: ['what', 'duration', 'note'],
  diaper: ['diaper', 'potty', 'note'],
  note: ['category', 'text'],
  photo: ['caption'],
  incident: ['type', 'where', 'text'],
};
const DIAPER: Record<string, string> = { wet: 'wet (#1)', dirty: 'dirty (#2)', both: 'wet and dirty', dry: 'dry' };

/** One line per log: "2026-10-05 13:10 nap: started_at=1:00 PM; ended_at=2:30 PM; how=easily". A bottle (food, meal
 * 'bottle', the app's S5b) reads "food: meal=bottle; bottle=4 oz formula; drank=all". */
function line(l: Log, tz: string): string {
  const when = new Date(l.happened_at).toLocaleString('sv-SE', { timeZone: tz, hour12: false }).slice(0, 16);
  const d = l.data ?? {};
  if (l.kind === 'food' && d.meal === 'bottle' && (d.bottle_amount || d.milk)) {
    const bottle = [d.bottle_amount ? `${d.bottle_amount} ${d.bottle_unit === 'ml' ? 'ml' : 'oz'}` : '', d.milk ?? ''].filter(Boolean).join(' ');
    const parts = ['meal=bottle', bottle ? `bottle=${bottle}` : '', d.amount ? `drank=${d.amount}` : ''].filter(Boolean);
    return `${when} food${l.urgent ? ' (urgent)' : ''}: ${parts.join('; ')}`;
  }
  const fields = (KEEP[l.kind] ?? Object.keys(d))
    .filter((k) => d[k])
    .map((k) => `${k}=${k === 'diaper' ? (DIAPER[d[k]] ?? d[k]) : String(d[k]).replace(/\s+/g, ' ').slice(0, 200)}`);
  return `${when} ${l.kind}${l.urgent ? ' (urgent)' : ''}${fields.length ? `: ${fields.join('; ')}` : ''}`;
}

function validZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function ageText(birthdate: string | null): string {
  if (!birthdate) return 'unknown';
  const [y, m, d] = birthdate.split('-').map(Number);
  const now = new Date();
  let months = (now.getFullYear() - y) * 12 + (now.getMonth() - (m - 1));
  if (now.getDate() < d) months -= 1;
  return months < 24 ? `${Math.max(0, months)} months` : `${Math.floor(months / 12)} years ${months % 12} months`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  try {
    const auth = req.headers.get('Authorization') ?? '';
    const token = auth.replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'Sign in first.' }, 401);
    // The caller's own client: every read below goes through RLS as them.
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
    const { data: user, error: userErr } = await db.auth.getUser(token);
    if (userErr || !user.user) return json({ error: 'Sign in first.' }, 401);

    const { kidId, since, until, tz } = await req.json().catch(() => ({}));
    if (typeof kidId !== 'string' || typeof since !== 'string' || isNaN(Date.parse(since))) return json({ error: 'kidId and since are required.' }, 400);
    if (until !== undefined && (typeof until !== 'string' || isNaN(Date.parse(until)))) return json({ error: 'until must be a date.' }, 400);
    const zone = typeof tz === 'string' && tz.length < 64 && validZone(tz) ? tz : 'America/New_York';
    if (!Deno.env.get('ANTHROPIC_API_KEY')) return json({ error: 'Summaries are not set up yet.' }, 503);

    const { data: kid, error: kidErr } = await db.from('kids').select('*').eq('id', kidId).maybeSingle<Kid>();
    if (kidErr) return json({ error: kidErr.message }, 500);
    if (!kid) return json({ error: 'Child not found.' }, 404);

    // Her logs in the range, as the app reads them (api.kidLogsSince): her shifts (shift_kids), logs for her or the
    // whole family (kid_ids empty).
    const { data: links, error: linkErr } = await db.from('shift_kids').select('shift_id, shift:shifts(ends_at)').eq('kid_id', kidId);
    if (linkErr) return json({ error: linkErr.message }, 500);
    const ids = ((links ?? []) as unknown as { shift_id: string; shift: { ends_at: string } | null }[]).filter((r) => r.shift && r.shift.ends_at >= since).map((r) => r.shift_id);
    let logs: Log[] = [];
    if (ids.length) {
      let q = db.from('logs').select('kind, data, kid_ids, urgent, happened_at, shift_id').in('shift_id', ids).gte('happened_at', since);
      if (until) q = q.lte('happened_at', until);
      const { data, error } = await q.order('happened_at', { ascending: false }).limit(2000);
      if (error) return json({ error: error.message }, 500);
      logs = ((data ?? []) as Log[]).filter((l) => !(l.kid_ids ?? []).length || (l.kid_ids ?? []).includes(kidId));
    }
    if (!logs.length) return json({ error: `Nothing logged for ${kid.name} in this time.` }, 422);

    // The parent's planned bottles (care plan P20a) to compare with what was logged. Best effort: none when unreadable.
    const { data: care } = await db.from('care_items').select('*').eq('kid_id', kidId).eq('type', 'bottle');
    const planned = ((care ?? []) as CareItem[]).map((c) => {
      const d = c.details ?? {};
      const amount = d.amount ?? d.amount_oz;
      const what = [amount ? `${amount} ${d.unit === 'ml' ? 'ml' : 'oz'}` : '', d.milk ?? ''].filter(Boolean).join(' ') || 'a bottle';
      const every = c.every_minutes ? `every ${c.every_minutes % 60 ? `${c.every_minutes} min` : `${c.every_minutes / 60} h`}` : '';
      return [what, every, c.starts ? `from ${c.starts.slice(0, 5)}` : '', c.ends ? `until ${c.ends.slice(0, 5)}` : ''].filter(Boolean).join(' ');
    });

    // The newest MAX_ENTRIES, then oldest first so changes over time read in order. Photos carry only a caption.
    const kept = logs.slice(0, MAX_ENTRIES).reverse();
    const shifts = new Set(kept.map((l) => l.shift_id)).size;
    const profile = [
      `Child: ${kid.name}, age ${ageText(kid.birthdate)}.`,
      kid.allergies ? `Allergies: ${kid.allergies}.` : '',
      kid.avoid_foods ? `Foods to avoid: ${kid.avoid_foods}.` : '',
      kid.health_notes ? `Health notes from the parent: ${kid.health_notes}.` : '',
      planned.length ? `Planned bottles (the parent's care plan): ${planned.join('; ')}.` : '',
    ].filter(Boolean).join('\n');
    const period = `Period: ${since.slice(0, 10)} to ${(until ?? new Date().toISOString()).slice(0, 10)}, ${shifts} sitter shift${shifts === 1 ? '' : 's'}, ${kept.length} log entries${logs.length > kept.length ? ` (the newest ${kept.length} of ${logs.length})` : ''}.`;
    const digest = kept.map((l) => line(l, zone)).join('\n');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1200,
        // Low effort keeps thinking short so the summary fits in max_tokens.
        output_config: { effort: 'low' },
        system: SYSTEM,
        messages: [{ role: 'user', content: `${profile}\n${period}\n\nSitter logs (local time, kind: fields):\n${digest}` }],
      }),
    });
    if (!res.ok) {
      console.error('kid-insights anthropic', res.status, await res.text().catch(() => ''));
      return json({ error: res.status === 429 ? 'Too many summaries right now. Try again in a minute.' : 'Couldn’t prepare the summary. Try again.' }, 502);
    }
    const msg = (await res.json()) as { stop_reason?: string; content?: { type: string; text?: string }[] };
    if (msg.stop_reason === 'refusal') return json({ error: 'Couldn’t prepare a summary from these logs.' }, 502);
    const summary = (msg.content ?? []).filter((b) => b.type === 'text').map((b) => b.text ?? '').join('').trim();
    if (!summary) return json({ error: 'Couldn’t prepare the summary. Try again.' }, 502);
    return json({ summary });
  } catch (e) {
    console.error('kid-insights', e);
    return json({ error: e instanceof Error ? e.message : 'Something went wrong.' }, 500);
  }
});
