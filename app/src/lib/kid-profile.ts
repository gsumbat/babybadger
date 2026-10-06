// Helpers for the child profile: US-format birthdays, age labels and age-based food suggestions.

/** Format digits as the user types: "0914" -> "09/14", "09142025" -> "09/14/2025". */
export function maskUSDate(text: string): string {
  const d = text.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** "09/14/2025" -> "2025-09-14" (ISO for the database), or null if it isn't a real past date. */
export function parseUSDate(text: string, today = new Date()): string | null {
  const m = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [mm, dd, yyyy] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(yyyy, mm - 1, dd);
  if (date.getFullYear() !== yyyy || date.getMonth() !== mm - 1 || date.getDate() !== dd) return null;
  if (date > today || yyyy < today.getFullYear() - 25) return null;
  return `${m[3]}-${m[1]}-${m[2]}`;
}

/** "2025-09-14" -> "09/14/2025" */
export function isoToUS(iso: string | null | undefined): string {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[2]}/${m[3]}/${m[1]}` : '';
}

export function ageInMonths(iso: string, today = new Date()): number {
  const [y, mo, d] = iso.split('-').map(Number);
  let months = (today.getFullYear() - y) * 12 + (today.getMonth() - (mo - 1));
  if (today.getDate() < d) months -= 1;
  return Math.max(0, months);
}

/** "3 months", "14 months", "1 year", "6 years". */
export function ageLabel(iso: string | null, today = new Date()): string {
  if (!iso) return '';
  const m = ageInMonths(iso, today);
  if (m < 1) return 'Newborn';
  if (m < 24) return m < 12 || m % 12 !== 0 ? `${m} month${m === 1 ? '' : 's'}` : '1 year';
  const y = Math.floor(m / 12);
  return `${y} years`;
}

/** Foods parents most often keep away from a child this age (choking hazards and early-years rules). */
export function suggestedFoods(ageMonths: number | null): string[] {
  if (ageMonths === null) return ['Peanuts', 'Tree nuts', 'Shellfish', 'Eggs', 'Dairy'];
  if (ageMonths < 12) return ['Honey', 'Cow’s milk', 'Whole nuts', 'Whole grapes'];
  if (ageMonths < 48) return ['Whole nuts', 'Whole grapes', 'Popcorn', 'Hard candy', 'Hot dogs'];
  return ['Peanuts', 'Tree nuts', 'Shellfish', 'Eggs', 'Dairy'];
}

export const KID_COLORS = ['#E8B9BE', '#9DB8E8', '#F2C08A', '#C3B5E0', '#9ED3B4'] as const;

/** "Peanuts, honey" plus allergies, as one line for the sitter's warning banner. */
export function safetyLine(k: { name: string; avoid_foods?: string; allergies?: string }): string | null {
  const parts = [k.avoid_foods && `avoid ${k.avoid_foods}`, k.allergies && `allergic to ${k.allergies}`].filter(Boolean);
  return parts.length ? `${k.name} · ${parts.join(' · ')}` : null;
}
