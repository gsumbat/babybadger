// Invite choices and states (wireframes P23 Invite access, P24 Review and send, P25 Invite pending, P26 Invite
// accepted, S1 Family invite). Needs migration 11 (20261006000011_invite_access.sql).
import { supabase } from './supabase';
import type { Invite, Profile, SitterLink } from './types';

export type PaySchedule = 'weekly' | 'per_shift';

/** What the parent chooses on P23. kid_ids null = every kid, now and later. */
export type InviteChoices = {
  kid_ids: string[] | null;
  can_drive: boolean;
  can_trip: boolean;
  can_message: boolean;
  rate: number | null;
  pay_schedule: PaySchedule;
};

/** An invite row with migration 11's columns. */
export type InviteRow = Invite & Partial<InviteChoices> & { created_at: string; opened_at?: string | null; declined_at?: string | null; accepted_by: string | null };

/** S1: what preview_invite returns. */
export type InvitePreview = {
  family_id: string;
  family_name: string;
  invited_by: string;
  rate: number | null;
  pay_schedule: PaySchedule;
  kids: { name: string; color: string | null; age: number | null; birthdate?: string | null }[];
};

export const PAY_OPTIONS: { value: PaySchedule; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'per_shift', label: 'Per shift' },
];

/** "20" -> 20, "22.5" / "22,50" -> 22.5, "$20" -> 20; empty or unreadable -> null. */
export function parseRate(text: string): number | null {
  const t = text.replace(/[$\s]/g, '').replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 && n < 10000 ? Math.round(n * 100) / 100 : null;
}

/** 20 -> "$20", 22.5 -> "$22.50". */
export function money(n: number) {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

/** P24 pill: "$20 / hr, weekly". */
export function payLine(rate: number | null | undefined, pay: PaySchedule | undefined) {
  if (rate == null) return null;
  return `${money(Number(rate))} / hr, ${pay === 'per_shift' ? 'per shift' : 'weekly'}`;
}

/** Selected kid ids -> what's stored: every kid chosen = null (also covers kids added later). */
export function kidIdsFor(selected: string[], allKidIds: string[]): string[] | null {
  return allKidIds.every((id) => selected.includes(id)) ? null : allKidIds.filter((id) => selected.includes(id));
}

/** P25 steps, in order. Credentials (P25's 4th step) waits for sitter requirements (P28–P32). */
export type InviteStep = 'sent' | 'opened' | 'reviewing' | 'ready';

/** How far the invite has got: the steps that are done. Signed = family_sitters.status 'active'. */
export function stepsDone(inv: Pick<InviteRow, 'opened_at' | 'accepted_at'>, signed: boolean): InviteStep[] {
  const done: InviteStep[] = ['sent'];
  if (inv.opened_at || inv.accepted_at) done.push('opened');
  if (signed) done.push('reviewing', 'ready');
  return done;
}

export const inviteApi = {
  async create(familyId: string, sitterName: string, c: InviteChoices) {
    const { data, error } = await supabase.rpc('create_invite', {
      p_family: familyId,
      p_sitter_name: sitterName,
      p_kid_ids: c.kid_ids,
      p_can_drive: c.can_drive,
      p_can_trip: c.can_trip,
      p_can_message: c.can_message,
      p_rate: c.rate,
      p_pay_schedule: c.pay_schedule,
    });
    if (error) throw error;
    const code = data as string;
    const row = await supabase.from('invites').select('id').eq('family_id', familyId).eq('code', code).single();
    if (row.error) throw row.error;
    return { id: (row.data as { id: string }).id, code };
  },
  /** Going back from P24 to P23/P3 and on again edits the same invite instead of making a second code. */
  async update(id: string, sitterName: string, c: InviteChoices) {
    const { error } = await supabase.from('invites').update({ sitter_name: sitterName, ...c }).eq('id', id);
    if (error) throw error;
  },
  async get(id: string) {
    const r = await supabase.from('invites').select('*').eq('id', id).single();
    if (r.error) throw new Error(r.error.message);
    return r.data as InviteRow;
  },
  /** Sitters tab "In progress": not accepted, cancelled or expired. Declined ones stay so the parent sees them. */
  async pending(familyId: string) {
    const r = await supabase
      .from('invites')
      .select('*')
      .eq('family_id', familyId)
      .is('accepted_at', null)
      .is('cancelled_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (r.error) throw new Error(r.error.message);
    return r.data as InviteRow[];
  },
  /** Latest invite a sitter accepted from this family (P25 for a sitter who still has to sign). */
  async acceptedBy(familyId: string, sitterId: string) {
    const r = await supabase.from('invites').select('id').eq('family_id', familyId).eq('accepted_by', sitterId).order('accepted_at', { ascending: false }).limit(1);
    if (r.error) throw new Error(r.error.message);
    return (r.data as { id: string }[])[0]?.id ?? null;
  },
  /** The sitter link, her name and when she signed (P25 progress, P26). */
  async sitterOf(familyId: string, sitterId: string) {
    const [link, prof, consent] = await Promise.all([
      supabase.from('family_sitters').select('*').eq('family_id', familyId).eq('sitter_id', sitterId).maybeSingle(),
      supabase.from('profiles').select('id, full_name, role').eq('id', sitterId).maybeSingle(),
      supabase.from('consents').select('signed_at').eq('family_id', familyId).eq('sitter_id', sitterId).order('signed_at', { ascending: false }).limit(1),
    ]);
    if (link.error) throw new Error(link.error.message);
    return {
      link: link.data as (SitterLink & Partial<InviteChoices>) | null,
      profile: prof.data as Profile | null,
      signedAt: ((consent.data ?? []) as { signed_at: string }[])[0]?.signed_at ?? null,
    };
  },
  async cancel(id: string) {
    const { error } = await supabase.from('invites').update({ cancelled_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },
  async preview(code: string) {
    const { data, error } = await supabase.rpc('preview_invite', { p_code: code });
    if (error) throw error;
    return data as InvitePreview;
  },
  async decline(code: string) {
    const { error } = await supabase.rpc('decline_invite', { p_code: code });
    if (error) throw error;
  },
};
