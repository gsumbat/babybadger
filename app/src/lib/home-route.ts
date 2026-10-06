import { useSession } from './session';
import { kv } from './storage';
import type { Role } from './types';

/** Where the app should land for the signed-in person. Signed out: P0 Sign in. */
export function useHomeRoute() {
  const { session, profile, family, sitterLinks } = useSession();
  if (!session) return '/sign-in' as const;
  if (profile?.role === 'parent' && family) return '/parent' as const;
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
