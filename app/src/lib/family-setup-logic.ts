// Add a child (P21, P22) and Settings › Sitters (P27): pure helpers, no I/O. Re-exported by ./family-setup.

/** Does this sitter see this kid? */
export function seesKid(kidIds: string[] | null | undefined, kidId: string) {
  return kidIds == null || kidIds.includes(kidId);
}

/** "Maya", "Maya and Priya", "Maya, Priya and Dana". */
export function namesList(names: string[]) {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** "Sep 2026" for P21's "Your sitter since Sep 2026". */
export function monthYear(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
