// What the signed-in adult may do in their family (migration 30). Parents manage everything; a family helper (e.g.
// grandma) reads the kids, care plan, rules, places, schedule and updates and messages the sitter. Screens hide the
// Add / Edit / Book / Approve controls for helpers and show a calm line instead ("Jen manages the care plan.").
// The pure rules are in lib/family-members (can, canManage, managedByLine, routeForRole); the database enforces them.
import { useQuery } from './data';
import { canManage, managedByLine, parentFirstNames } from './family-members';
import { membersApi } from './family-members-api';
import { useSession } from './session';

/** true for a parent (and before migration 30); false for a family helper. */
export function useCanManage() {
  return canManage(useSession().familyRole);
}

/** The parents' first names, loaded only for a helper (a parent never needs them). */
export function useParentNames(): string[] {
  const { family, profile, familyRole } = useSession();
  const helper = !canManage(familyRole);
  const { data } = useQuery(async () => {
    if (!helper || !family || !profile) return [];
    const list = await membersApi.list(family.id, profile.id).catch(() => null);
    return parentFirstNames(list?.members ?? []);
  }, [family?.id, profile?.id, helper]);
  return data ?? [];
}

/** A helper's read-only line: "Jen manages the care plan." ('' for a parent). */
export function useManagedBy(what: string) {
  const manage = useCanManage();
  const names = useParentNames();
  return manage ? '' : managedByLine(names, what);
}
