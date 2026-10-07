// Sitter requirements data (migration 20). Types and pure logic are in ./requirements-logic.ts and re-exported here.
// Every read is safe to call before migrations 19 / 20 run: the screens get empty lists and show the
// needsMigration20 banner instead of crashing.
import { supabase } from './supabase';
import { diffDrafts, summarize, type ReqDraft, type ReqStatusRow, type ReqSummary, type Requirement, type RequirementMode } from './requirements-logic';

export * from './requirements-logic';

function must<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

/** True when the error means migration 20 (or 19, which it needs) hasn't been run yet. */
export function needsMigration20(error: unknown) {
  const msg = error instanceof Error ? error.message : String((error as { message?: string })?.message ?? error ?? '');
  return /family_requirement|requirement_mode|sitter_requirement_status|sitter_credentials|sitter_languages/i.test(msg) && /does not exist|schema cache|not found|could not find/i.test(msg);
}
export const MIGRATION_20_TEXT = 'Sitter requirements need the latest database update (migration 20).';

function normalize(r: Requirement): Requirement {
  return { ...r, details: r.details && typeof r.details === 'object' ? r.details : {} };
}

/** The family's requirements in list order. Throws before migration 20 (use familyRequirements for a safe read). */
export async function requirementsOf(familyId: string): Promise<Requirement[]> {
  return (must(await supabase.from('family_requirements').select('*').eq('family_id', familyId).order('position').order('created_at')) as Requirement[]).map(normalize);
}

/** The family's requirements; [] before migration 20 runs (or on any error). */
export async function familyRequirements(familyId: string): Promise<Requirement[]> {
  return requirementsOf(familyId).catch(() => [] as Requirement[]);
}

/** The family's requirements, and whether migration 20 is still missing (then [] and missing = true, so the screen
 * renders with the banner). Other errors throw. */
export async function requirementsOrMissing(familyId: string): Promise<{ saved: Requirement[]; missing: boolean }> {
  try {
    return { saved: await requirementsOf(familyId), missing: false };
  } catch (e) {
    if (needsMigration20(e)) return { saved: [], missing: true };
    throw e;
  }
}

/** Per requirement: met or not and why (sitter_requirement_status). Throws before migration 20. */
export async function statusRows(familyId: string, sitterId: string): Promise<ReqStatusRow[]> {
  return must(await supabase.rpc('sitter_requirement_status', { p_family: familyId, p_sitter: sitterId })) as ReqStatusRow[];
}

const EMPTY: ReqSummary & { missingMigration: boolean } = { met: 0, total: 0, missing: [], allMet: true, expiring: [], missingMigration: false };

/** How a sitter stands on the family's must-haves: { met, total, missing (titles), allMet }. Never throws: before
 * migration 20 (or on any error) it reads as "no requirements" (total 0, allMet true). Used by the sitter lists
 * (P21 / P27) and P7a / P26. */
export async function requirementStatus(familyId: string, sitterId: string): Promise<ReqSummary & { missingMigration: boolean }> {
  try {
    const [reqs, rows] = await Promise.all([requirementsOf(familyId), statusRows(familyId, sitterId)]);
    return { ...summarize(reqs, rows), missingMigration: false };
  } catch (e) {
    return { ...EMPTY, missingMigration: needsMigration20(e) };
  }
}

/** Her own Yes / No answers (S27), by requirement id. */
export async function myAnswers(sitterId: string, requirementIds: string[]): Promise<Record<string, boolean>> {
  if (!requirementIds.length) return {};
  const rows = must(await supabase.from('family_requirement_checks').select('requirement_id, answer, checked_by').eq('sitter_id', sitterId).in('requirement_id', requirementIds)) as {
    requirement_id: string;
    answer: boolean;
    checked_by: string | null;
  }[];
  return Object.fromEntries(rows.filter((r) => r.checked_by === sitterId).map((r) => [r.requirement_id, r.answer]));
}

export const requirementsApi = {
  /** P7a / P32 "If a sitter is missing one". 'warn' before migration 20. */
  async mode(familyId: string): Promise<RequirementMode> {
    const r = await supabase.from('families').select('requirement_mode').eq('id', familyId).maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return ((r.data as { requirement_mode?: RequirementMode } | null)?.requirement_mode ?? 'warn') as RequirementMode;
  },
  async setMode(familyId: string, mode: RequirementMode) {
    must(await supabase.from('families').update({ requirement_mode: mode }).eq('id', familyId));
  },
  /** Writes the draft over the saved rows: adds, changes and removes in one go. */
  async save(familyId: string, saved: Requirement[], drafts: ReqDraft[]) {
    const { add, update, remove } = diffDrafts(saved, drafts);
    if (remove.length) must(await supabase.from('family_requirements').delete().in('id', remove));
    for (const u of update) must(await supabase.from('family_requirements').update(u.fields).eq('id', u.id));
    if (add.length) must(await supabase.from('family_requirements').insert(add.map((a) => ({ ...a, family_id: familyId }))));
  },
  /** S27: the sitter answers Yes / No for herself. */
  async answer(requirementId: string, sitterId: string, answer: boolean) {
    must(await supabase.from('family_requirement_checks').upsert({ requirement_id: requirementId, sitter_id: sitterId, answer }, { onConflict: 'requirement_id,sitter_id' }));
  },
};
