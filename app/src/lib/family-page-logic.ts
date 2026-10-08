// The sitter's Family page (wireframe S10 / S10b): each kid's day from the care plan, the family's adults with their
// phones (family_contacts, migration 33) and the home address. Pure functions, tested in
// __tests__/family-page-logic.test.ts.
import { daysLabel, EVERY_DAY, itemLine, repeatLabel, sortItems, timeRangeLabel } from './care-plan';
import type { CareItem, Kid } from './types';

/** One adult of the family as family_contacts returns it. */
export type FamilyContact = { user_id: string; full_name: string; relation: string | null; role: 'parent' | 'helper'; phone: string | null };

/** "Jen (mom)", "Sue (grandma)"; just "Jen Lee" without a relation. */
export function contactName(c: Pick<FamilyContact, 'full_name' | 'relation'>): string {
  const name = c.full_name.trim();
  if (!c.relation || c.relation === 'Other') return name || 'Family member';
  const first = name.split(/\s+/)[0] || c.relation;
  return `${first} (${c.relation.toLowerCase()})`;
}

/** What tel: / sms: get: the digits with a leading +; null when it can't be a phone number (fewer than 7 digits). */
export function dialable(phone: string | null | undefined): string | null {
  const p = (phone ?? '').replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  return p.replace(/\D/g, '').length >= 7 ? p : null;
}

/** A routine row: "Nap" · "1:00 – 2:30 PM"; "Bottle · 4 oz formula" · "Every 3 hrs"; "Soccer" · "4:30 PM · Thursdays". */
export type RoutineRow = { id: string; title: string; when: string };
export type RoutineGroup = { key: string; kid: Kid | null; title: string; rows: RoutineRow[] };

export function routineRow(item: CareItem): RoutineRow {
  const time = item.starts || item.ends ? timeRangeLabel(item.starts, item.ends) : '';
  const days = (item.days & EVERY_DAY) === EVERY_DAY ? '' : daysLabel(item.days);
  return { id: item.id, title: itemLine(item), when: [time, repeatLabel(item.every_minutes), days].filter(Boolean).join(' · ') || 'Any time' };
}

/** S10 ROUTINES: one group per kid in the family's kid order ("Leo's day"), then whole-family items ("Everyone").
 * Kids without items are left out; items of a kid she can't see are dropped. */
export function routineGroups(items: CareItem[], kids: Kid[]): RoutineGroup[] {
  const groups: RoutineGroup[] = kids
    .map((k) => ({ key: k.id, kid: k, title: `${k.name}’s day`, rows: sortItems(items.filter((i) => i.kid_id === k.id)).map(routineRow) }))
    .filter((g) => g.rows.length);
  const family = sortItems(items.filter((i) => !i.kid_id)).map(routineRow);
  if (family.length) groups.push({ key: 'family', kid: null, title: 'Everyone', rows: family });
  return groups;
}

/** "Open in Maps": Apple Maps on iOS, Google Maps elsewhere. Only with an address: when the family keeps it from
 * sitters (places.show_address off) there is no link either. */
export function mapsUrl(address: string | null | undefined, os: string): string | null {
  const a = address?.trim();
  if (!a) return null;
  const q = encodeURIComponent(a);
  return os === 'ios' ? `https://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/** An adult the sitter can reach from the shift page: name for the row / chooser, what she typed, what to dial. */
export type ReachableContact = { user_id: string; name: string; phone: string; tel: string };

/** The shift page's contact row (S4b / S4c under the tiles, S4 under the tasks): the adults with a dialable phone, in
 * family_contacts' order (owner first). The row shows the first one; with more than one, Text and Call open a chooser.
 * Empty (no phone saved, or family_contacts not there yet) = no row. */
export function reachableContacts(contacts: FamilyContact[] | null | undefined): ReachableContact[] {
  return (contacts ?? []).flatMap((c) => {
    const tel = dialable(c.phone);
    return tel ? [{ user_id: c.user_id, name: contactName(c), phone: (c.phone ?? '').trim(), tel }] : [];
  });
}
