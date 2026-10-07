// Invite choices and states (wireframes P23 Invite access, P24 Review and send, P25 Invite pending, P26 Invite
// accepted, S1 Family invite). Needs migration 11 (20261006000011_invite_access.sql).
import type { LinkPreview } from './invite-links';
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
export type InviteRow = Invite &
  Partial<InviteChoices> & { created_at: string; opened_at?: string | null; declined_at?: string | null; accepted_by: string | null; sitter_email?: string | null; sent_at?: string | null; link_token?: string | null };

/** Home "Needs you" (S0e): an open invite sent to the signed-in sitter's email (my_invites, migration 28). */
export type MyInvite = { link_token: string; family_name: string; kids: string; created_at: string };

/** Migration 28 hasn't been run yet (the column / function doesn't exist). */
export function needsMigration28(e: unknown) {
  const m = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e ?? '');
  return /sitter_email|invite_link_preview|invite_sent|my_invites|schema cache|does not exist/i.test(m);
}

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

/** P25 steps, in order. The Credentials step (sitter requirements) is added by the screen when the family has any. */
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
    // select('*'): link_token arrives with migration 28 (null before, and the text then gives the code only).
    const row = await supabase.from('invites').select('*').eq('family_id', familyId).eq('code', code).single();
    if (row.error) throw row.error;
    const r = row.data as InviteRow;
    return { id: r.id, code, token: r.link_token ?? null };
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
  /** P3 "Email (optional)" (migration 28). Before it runs only an empty email can be saved. */
  async setEmail(id: string, email: string) {
    const v = email.trim() || null;
    const { error } = await supabase.from('invites').update({ sitter_email: v }).eq('id', id);
    if (error && (v || !needsMigration28(error))) throw new Error(needsMigration28(error) ? 'Sending to an email needs the latest database update (migration 28). Leave the email empty for now.' : error.message);
  },
  /** P24 Send by text / Email / Copy link: marks the invite sent; an existing sitter with that email gets a push (S0e).
   * Quietly does nothing before migration 28. */
  async sent(id: string) {
    const { error } = await supabase.rpc('invite_sent', { p_invite: id });
    if (error && !needsMigration28(error)) throw error;
  },
  /** S0b / S0c: what anyone with the link may see (works signed out; by token only). 'unknown' when it can't be checked. */
  async linkPreview(token: string): Promise<LinkPreview> {
    const { data, error } = await supabase.rpc('invite_link_preview', { p_token: token });
    if (error || !data) return { status: 'unknown' };
    return data as LinkPreview;
  },
  /** Signed in: the link's 6-digit code (for preview / accept / decline), or why the link can't be used. */
  async codeForLink(token: string): Promise<{ status: LinkPreview['status']; code?: string }> {
    const { data, error } = await supabase.rpc('invite_code_for_link', { p_token: token });
    if (error) throw error;
    return data as { status: LinkPreview['status']; code?: string };
  },
  /** Home "Needs you": open invites sent to my email. Empty before migration 28. */
  async mine(): Promise<MyInvite[]> {
    const { data, error } = await supabase.rpc('my_invites');
    if (error) return [];
    return (data ?? []) as MyInvite[];
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
