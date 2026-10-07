// Sitter hours and pay (wireframes S7, S39 › Money): her shifts and each family's hourly rate. Logic: ./pay-logic.ts.
import { api } from './data';
import { supabase } from './supabase';

export * from './pay-logic';

export const payApi = {
  async load(sitterId: string) {
    const [shifts, rates] = await Promise.all([
      api.sitterShifts(sitterId),
      // rate arrives with migration 11; until it's run every family earns $0.
      supabase
        .from('family_sitters')
        .select('family_id, rate')
        .eq('sitter_id', sitterId)
        .then((r) => (r.error ? [] : ((r.data ?? []) as { family_id: string; rate: number | null }[]))),
    ]);
    return { shifts, rates: Object.fromEntries(rates.map((r) => [r.family_id, r.rate])) as Record<string, number | null> };
  },
};
