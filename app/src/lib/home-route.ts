import { isLinkToken } from './invite-links';
import { useSession } from './session';
import { kv } from './storage';
import type { Role } from './types';

/** Where the app should land for the signed-in person. Signed out: P0 Sign in. */
export function useHomeRoute() {
  const { session, profile, family, sitterLinks } = useSession();
  if (!session) return '/sign-in' as const;
  // An invite link opened before signing in (S0b/S0c) comes back after sign-in, unless she's a parent.
  const pending = peekPendingInvite();
  if (pending && profile?.role !== 'parent') return `/i/${pending}` as const;
  if (profile?.role === 'parent' && family) return familySetupPending(family.id) ? ('/parent/setup' as const) : ('/parent' as const);
  if (profile?.role === 'sitter' && sitterLinks.length) return '/sitter' as const;
  return '/onboarding' as const;
}

// The role tapped on P1 Welcome before signing in. Saved on the device (the app may be closed while the
// person fetches the code from their email) and read once by onboarding, which then skips the role chooser.
const SIGNUP_ROLE = 'bb.signupRole';

export function isRole(v: unknown): v is Role {
  return v === 'parent' || v === 'sitter';
}

/** Remember the chosen role for after sign-in; `null` forgets it (plain sign-in). */
export function rememberSignupRole(role: Role | null) {
  try {
    if (role) kv.set(SIGNUP_ROLE, role);
    else kv.remove(SIGNUP_ROLE);
  } catch {
    // Storage unavailable: onboarding just shows the role chooser.
  }
}

/** The role chosen before sign-in, if any. Call `rememberSignupRole(null)` once it's used. */
export function peekSignupRole(): Role | null {
  try {
    const v = kv.get(SIGNUP_ROLE);
    return isRole(v) ? v : null;
  } catch {
    return null;
  }
}

// P2 "Who are we looking after?": shown once, right after a new parent creates the family (onboarding sets this to
// the new family's id). Existing parents never have it, so they go straight to Home. Cleared when P2 moves on.
const FAMILY_SETUP = 'bb.familySetup';

export function markFamilySetup(familyId: string | null) {
  try {
    if (familyId) kv.set(FAMILY_SETUP, familyId);
    else kv.remove(FAMILY_SETUP);
  } catch {
    // Storage unavailable: the parent lands on Home's setup checklist (P4a) instead.
  }
}

export function familySetupPending(familyId: string): boolean {
  try {
    return kv.get(FAMILY_SETUP) === familyId;
  } catch {
    return false;
  }
}

// Invite link opened on this phone (babybadger.app/i/<token>, S0b–S0d): the link's token (never the 6-digit code): kept until she accepts or declines it, or the
// link turns out to be used / expired, so closing the app while she fetches the email code doesn't lose it.
const PENDING_INVITE = 'bb.pendingInvite';

export function rememberPendingInvite(token: string | null) {
  try {
    if (token) kv.set(PENDING_INVITE, token);
    else kv.remove(PENDING_INVITE);
  } catch {
    // Storage unavailable: she opens the link again, or enters the code (S51).
  }
}

export function peekPendingInvite(): string | null {
  try {
    const v = kv.get(PENDING_INVITE);
    return isLinkToken(v) ? v : null;
  } catch {
    return null;
  }
}
