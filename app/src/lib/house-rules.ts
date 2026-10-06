// House rules data (migration 09). Types and pure logic are in ./house-rules-logic.ts and re-exported here.
import { supabase } from './supabase';
import type { HouseRule, HouseRuleInput, RuleAgreement } from './house-rules-logic';
import { rulesAgreed } from './house-rules-logic';

export * from './house-rules-logic';

function must<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

function normalize(r: HouseRule): HouseRule {
  return { ...r, sub: r.sub ?? '', options: r.options && typeof r.options === 'object' ? r.options : {} };
}

export const rulesApi = {
  async rules(familyId: string) {
    return (must(await supabase.from('house_rules').select('*').eq('family_id', familyId).order('sort').order('created_at')) as HouseRule[]).map(normalize);
  },
  async rule(id: string) {
    return normalize(must(await supabase.from('house_rules').select('*').eq('id', id).single()) as HouseRule);
  },
  async add(familyId: string, rows: HouseRuleInput[]) {
    if (!rows.length) return [];
    return (must(await supabase.from('house_rules').insert(rows.map((r) => ({ ...r, family_id: familyId }))).select()) as HouseRule[]).map(normalize);
  },
  async update(id: string, fields: Partial<HouseRuleInput>) {
    return normalize(must(await supabase.from('house_rules').update(fields).eq('id', id).select().single()) as HouseRule);
  },
  async remove(id: string) {
    must(await supabase.from('house_rules').delete().eq('id', id));
  },
  /** Parents: every sitter's OK in the family. Sitters: their own. */
  async agreements(familyId: string) {
    return must(await supabase.from('house_rule_agreements').select('*').eq('family_id', familyId)) as RuleAgreement[];
  },
  /** The sitter agrees to the family's current rules (the time is set by the database). */
  async agree(familyId: string, sitterId: string) {
    must(await supabase.from('house_rule_agreements').upsert({ family_id: familyId, sitter_id: sitterId }, { onConflict: 'family_id,sitter_id' }));
  },
};

/** For a sitter: the family's rules and whether she still needs to agree. Before migration 09 runs, nothing is
 * needed (no rules). */
export async function sitterRulesState(familyId: string, sitterId: string) {
  try {
    const [rules, agreements] = await Promise.all([rulesApi.rules(familyId), rulesApi.agreements(familyId)]);
    const mine = agreements.find((a) => a.sitter_id === sitterId);
    return { rules, needsAgreement: !rulesAgreed(rules, mine?.agreed_at) };
  } catch {
    return { rules: [] as HouseRule[], needsAgreement: false };
  }
}

/** For a parent: the family's rules and the sitters (ids) who haven't agreed to the current Must rules. */
export async function familyRulesState(familyId: string, sitterIds: string[]) {
  try {
    const [rules, agreements] = await Promise.all([rulesApi.rules(familyId), rulesApi.agreements(familyId)]);
    const pending = sitterIds.filter((id) => !rulesAgreed(rules, agreements.find((a) => a.sitter_id === id)?.agreed_at));
    return { rules, pending };
  } catch {
    return { rules: [] as HouseRule[], pending: [] as string[] };
  }
}
