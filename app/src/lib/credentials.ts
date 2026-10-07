// Sitter profile and credentials data (migration 19). Types and pure logic are in ./credentials-logic.ts and
// re-exported here. The sitter writes her own rows; parents of a family she's linked to read them (P11).
// Files go to the private sitter-files bucket: <sitter_id>/photo/... (families may read) and <sitter_id>/cards/...
// (only she can; families never see a card, S15).
import type { Credential, CredentialInput, LanguageLevel, SitterLanguage, SitterProfile } from './credentials-logic';
import { supabase } from './supabase';

export * from './credentials-logic';

function must<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

const BUCKET = 'sitter-files';
const CRED_COLS = 'id, sitter_id, kind, title, issuer, issued_on, expires_on, file_path, verified_at, created_at, updated_at';
const BASE_COLS = 'sitter_id, phone, home_area, bio, years_experience, ages_from, ages_to, can_drive, own_car, rate, teaches_language, photo_path';
// birthdate arrives with migration 23; until it's run, reads fall back to the columns without it.
const PROFILE_COLS = `${BASE_COLS}, birthdate`;
const missingColumn = (e: unknown) => /birthdate/.test(String((e as { message?: string })?.message ?? e));

/** True when the error means migration 19 hasn't been run yet. */
export function needsMigration19(error: unknown) {
  const msg = error instanceof Error ? error.message : String((error as { message?: string })?.message ?? error ?? '');
  return /sitter_(profiles|credentials|languages)|sitter-files/i.test(msg) && /does not exist|schema cache|not found|could not find/i.test(msg);
}
export const MIGRATION_19_TEXT = 'Your profile and credentials need the latest database update (migration 19).';

/** Every certificate (and the background check) of the sitter, soonest expiry first. Throws before migration 19. */
export async function sitterCredentials(sitterId: string): Promise<Credential[]> {
  const rows = must(await supabase.from('sitter_credentials').select(CRED_COLS).eq('sitter_id', sitterId).order('created_at')) as Credential[];
  return rows.sort((a, b) => (a.expires_on ?? '9999').localeCompare(b.expires_on ?? '9999'));
}

/** The sitter's languages (self-reported). Throws before migration 19. */
export async function sitterLanguages(sitterId: string): Promise<SitterLanguage[]> {
  return must(await supabase.from('sitter_languages').select('sitter_id, language, level').eq('sitter_id', sitterId).order('created_at')) as SitterLanguage[];
}

/** S40 details; null until she saves them. Throws before migration 19. */
export async function sitterProfile(sitterId: string): Promise<SitterProfile | null> {
  const r = await supabase.from('sitter_profiles').select(PROFILE_COLS).eq('sitter_id', sitterId).maybeSingle();
  if (r.error && missingColumn(r.error)) return must(await supabase.from('sitter_profiles').select(BASE_COLS).eq('sitter_id', sitterId).maybeSingle()) as SitterProfile | null;
  return must(r) as SitterProfile | null;
}

export type SitterBundle = { profile: SitterProfile | null; creds: Credential[]; langs: SitterLanguage[]; missing: boolean; error: string };

/** Profile, credentials and languages together. Never throws: before migration 19 (or on any error) it comes back
 * empty with `missing` set, so screens still render and show the migration banner. */
export async function sitterBundle(sitterId: string): Promise<SitterBundle> {
  try {
    const [profile, creds, langs] = await Promise.all([sitterProfile(sitterId), sitterCredentials(sitterId), sitterLanguages(sitterId)]);
    return { profile, creds, langs, missing: false, error: '' };
  } catch (e) {
    const missing = needsMigration19(e);
    return { profile: null, creds: [], langs: [], missing, error: missing ? MIGRATION_19_TEXT : e instanceof Error ? e.message : String(e) };
  }
}

export const credentialApi = {
  async get(id: string) {
    return must(await supabase.from('sitter_credentials').select(CRED_COLS).eq('id', id).single()) as Credential;
  },
  async add(sitterId: string, fields: CredentialInput) {
    return must(await supabase.from('sitter_credentials').insert({ ...fields, sitter_id: sitterId }).select(CRED_COLS).single()) as Credential;
  },
  /** Changing the card, dates or kind sends it back to review (the database clears verified_at). */
  async update(id: string, fields: Partial<CredentialInput>) {
    return must(await supabase.from('sitter_credentials').update(fields).eq('id', id).select(CRED_COLS).single()) as Credential;
  },
  async remove(c: Pick<Credential, 'id' | 'file_path'>) {
    must(await supabase.from('sitter_credentials').delete().eq('id', c.id));
    if (c.file_path) await supabase.storage.from(BUCKET).remove([c.file_path]).catch(() => {});
  },
};

export const sitterProfileApi = {
  /** Saves S40 (and S16's "Happy to teach a language"); only the given fields change. */
  async save(sitterId: string, fields: Partial<Omit<SitterProfile, 'sitter_id'>>) {
    return must(await supabase.from('sitter_profiles').upsert({ ...fields, sitter_id: sitterId }, { onConflict: 'sitter_id' }).select(fields.birthdate !== undefined ? PROFILE_COLS : BASE_COLS).single()) as SitterProfile;
  },
  async setName(sitterId: string, fullName: string) {
    must(await supabase.from('profiles').update({ full_name: fullName }).eq('id', sitterId));
  },
};

/** S16 Save: the list replaces what was saved. */
export async function saveLanguages(sitterId: string, langs: { language: string; level: LanguageLevel }[]) {
  const before = await sitterLanguages(sitterId);
  const keep = new Set(langs.map((l) => l.language));
  const gone = before.filter((b) => !keep.has(b.language)).map((b) => b.language);
  if (gone.length) must(await supabase.from('sitter_languages').delete().eq('sitter_id', sitterId).in('language', gone));
  if (langs.length) must(await supabase.from('sitter_languages').upsert(langs.map((l) => ({ ...l, sitter_id: sitterId })), { onConflict: 'sitter_id,language' }));
}

async function upload(path: string, uri: string, contentType: string) {
  const body = await (await fetch(uri)).arrayBuffer();
  const up = await supabase.storage.from(BUCKET).upload(path, body, { contentType, upsert: true });
  if (up.error) throw up.error;
  return path;
}

/** S15 card photo. Only the sitter can read it back. */
export function uploadCard(sitterId: string, uri: string) {
  return upload(`${sitterId}/cards/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`, uri, 'image/jpeg');
}

/** S40 profile photo. Families she's linked to can read it. */
export function uploadPhoto(sitterId: string, uri: string) {
  return upload(`${sitterId}/photo/${Date.now()}.jpg`, uri, 'image/jpeg');
}

/** Signed link (1 hour) for a photo or card; null when it can't be read. */
export async function sitterFileUrl(path: string | null | undefined) {
  if (!path) return null;
  try {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}
