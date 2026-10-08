// What the signed-in adult may do in their family (migrations 30 and 32). Full access (role 'parent') manages the
// family; read only (role 'helper', e.g. grandma) reads the kids, care plan, rules, places, schedule and updates and
// messages the sitter. Screens hide the Add / Edit / Book / Approve controls for read-only members and show a calm line
// instead ("Jen manages the care plan."). Seats and the subscription are the owner's (families.created_by).
// The pure rules are in lib/family-members (can, canManage, managedByLine, routeForRole); the database enforces them.
import { useQuery } from './data';
import { canManage, managedByLine, ownerFirstName, parentFirstNames } from './family-members';
import { membersApi } from './family-members-api';
import { useSession } from './session';

/** true for full access (and before migration 30); false for read only. */
export function useCanManage() {
  return canManage(useSession().familyRole);
}

/** true for the family's owner: seats (P78) and the subscription. */
export function useIsOwner() {
  return useSession().isOwner;
}

/** The full-access members' first names, loaded only for a read-only member (full access never needs them). */
export function useParentNames(): string[] {
  const { family, profile, familyRole } = useSession();
  const readOnly = !canManage(familyRole);
  const { data } = useQuery(async () => {
    if (!readOnly || !family || !profile) return [];
    const list = await membersApi.list(family.id, profile.id).catch(() => null);
    return parentFirstNames(list?.members ?? []);
  }, [family?.id, profile?.id, readOnly]);
  return data ?? [];
}

/** The owner's first name ("Jen"), loaded only for someone who isn't the owner ('' until it loads). */
export function useOwnerName(): string {
  const { family, profile, isOwner } = useSession();
  const { data } = useQuery(async () => {
    if (isOwner || !family || !profile) return '';
    const list = await membersApi.list(family.id, profile.id).catch(() => null);
    return ownerFirstName(list?.members ?? []);
  }, [family?.id, profile?.id, isOwner]);
  return data ?? '';
}

/** A read-only member's line: "Jen manages the care plan." ('' for full access). */
export function useManagedBy(what: string) {
  const manage = useCanManage();
  const names = useParentNames();
  return manage ? '' : managedByLine(names, what);
}
