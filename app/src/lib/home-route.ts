import { useSession } from './session';

/** Where the app should land for the signed-in person. */
export function useHomeRoute() {
  const { session, profile, family, sitterLinks } = useSession();
  if (!session) return '/sign-in' as const;
  if (profile?.role === 'parent' && family) return '/parent' as const;
  if (profile?.role === 'sitter' && sitterLinks.length) return '/sitter' as const;
  return '/onboarding' as const;
}
