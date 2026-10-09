// "Prepare a summary" on Ava’s report (P5h → P5j): the kid-insights Edge Function reads her logs in the range with
// the caller's own session (RLS) and returns a doctor-visit summary in simple markdown (see lib/kid-report summaryLines).
import { supabase } from './supabase';

export async function kidInsights(kidId: string, since: string, until?: string): Promise<string> {
  // The phone's time zone, so the log times in the summary read as local times.
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { data, error } = await supabase.functions.invoke('kid-insights', { body: { kidId, since, ...(until ? { until } : {}), ...(tz ? { tz } : {}) } });
  if (error) {
    // FunctionsHttpError carries the function's JSON { error } in its response.
    const ctx = (error as { context?: Response }).context;
    let msg = '';
    try {
      msg = ctx && typeof ctx.json === 'function' ? ((await ctx.json()) as { error?: string }).error ?? '' : '';
    } catch {
      msg = '';
    }
    throw new Error(msg || 'Couldn’t prepare the summary. Try again.');
  }
  const summary = (data as { summary?: string } | null)?.summary?.trim();
  if (!summary) throw new Error('Couldn’t prepare the summary. Try again.');
  return summary;
}
