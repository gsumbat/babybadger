// Sitter "Hours and pay" (wireframe S7): hours from clocked-in shifts times each family's hourly rate
// (family_sitters.rate, set on the invite, P23). Pure logic, no I/O.
import type { Shift } from './types';

export type PayPeriod = 'week' | 'month';
export type PayShift = Pick<Shift, 'id' | 'family_id' | 'status' | 'clock_in_at' | 'clock_out_at'>;

/** Monday 00:00 of this week to the next Monday (S7 "Sep 28 – Oct 4"), or the 1st of this month to the next 1st. */
export function periodRange(period: PayPeriod, now = new Date()): { from: Date; to: Date } {
  if (period === 'month') return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(now.getFullYear(), now.getMonth() + 1, 1) };
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  return { from, to: new Date(from.getFullYear(), from.getMonth(), from.getDate() + 7) };
}

const md = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** "Sep 28 – Oct 4" / "Oct 1 – 31" (the range's last day). */
export function periodLabel(r: { from: Date; to: Date }) {
  const last = new Date(r.to.getFullYear(), r.to.getMonth(), r.to.getDate() - 1);
  return last.getMonth() === r.from.getMonth() ? `${md(r.from)} – ${last.getDate()}` : `${md(r.from)} – ${md(last)}`;
}

/** Minutes worked on a finished shift (clocked in and out); 0 otherwise. */
export function paidMinutes(s: PayShift): number {
  if (!s.clock_in_at || !s.clock_out_at) return 0;
  return Math.max(0, Math.round((+new Date(s.clock_out_at) - +new Date(s.clock_in_at)) / 60_000));
}

export type FamilyPay = { family_id: string; minutes: number; rate: number | null; earned: number };

/** Finished shifts that started (clocked in) inside the range, per family, plus the totals. Newest shifts first. */
export function payFor(shifts: PayShift[], rates: Record<string, number | null | undefined>, r: { from: Date; to: Date }) {
  const done = shifts
    .filter((s) => s.status === 'completed' && paidMinutes(s) > 0)
    .filter((s) => {
      const t = +new Date(s.clock_in_at!);
      return t >= +r.from && t < +r.to;
    })
    .sort((a, b) => +new Date(b.clock_in_at!) - +new Date(a.clock_in_at!));
  const byFamily = new Map<string, FamilyPay>();
  for (const s of done) {
    const rate = rates[s.family_id] == null ? null : Number(rates[s.family_id]);
    const row = byFamily.get(s.family_id) ?? { family_id: s.family_id, minutes: 0, rate, earned: 0 };
    const min = paidMinutes(s);
    row.minutes += min;
    row.earned += rate == null ? 0 : (min / 60) * rate;
    byFamily.set(s.family_id, row);
  }
  const families = [...byFamily.values()].map((f) => ({ ...f, earned: Math.round(f.earned * 100) / 100 }));
  return {
    shifts: done,
    families,
    minutes: families.reduce((n, f) => n + f.minutes, 0),
    earned: Math.round(families.reduce((n, f) => n + f.earned, 0) * 100) / 100,
  };
}

/** S7 total: "48H 30M". */
export function hoursBig(min: number) {
  return `${Math.floor(min / 60)}H ${min % 60}M`;
}

/** Family row: "8 h 02 m" / "45 min". */
export function hoursShort(min: number) {
  const h = Math.floor(min / 60);
  return h ? `${h} h ${(min % 60).toString().padStart(2, '0')} m` : `${min} min`;
}

/** "$1,304" (whole dollars, as S7 and S39 draw them). */
export function dollars(n: number) {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

/** "The Lee family" -> "Lee family"; "Lee" for "Invoice the Lees" and the timesheet. */
export function familyTitle(name: string) {
  return name.replace(/^the\s+/i, '').trim() || name;
}
export function familyShort(name: string) {
  return familyTitle(name).replace(/\s+family$/i, '').trim() || name;
}
/** "Lee" -> "Lees", "Ortiz" -> "Ortizes". */
export function plural(name: string) {
  return /(s|x|z|ch|sh)$/i.test(name) ? `${name}es` : `${name}s`;
}
