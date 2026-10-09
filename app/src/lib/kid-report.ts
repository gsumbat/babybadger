// Pure rules for a kid's report (P55 THIS WEEK → "Ava’s report"): the range chips, the PATTERNS tiles and bars, the
// HISTORY day groups and the doctor-visit summary's simple markdown.
import { bottleLog, ML_PER_OZ } from './bottle';
import { parseTimeOnDay } from './shift-logic';
import type { BottleUnit, LogEntry } from './types';

export type ReportRange = 'today' | 'week' | 'month' | '3m' | '6m' | '1y';
/** The range chips, in order. Week is the default. */
export const REPORT_RANGES: { value: ReportRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: '3m', label: '3 months' },
  { value: '6m', label: '6 months' },
  { value: '1y', label: '1 year' },
];
export const DEFAULT_RANGE: ReportRange = 'week';

export function isReportRange(v: unknown): v is ReportRange {
  return REPORT_RANGES.some((r) => r.value === v);
}

/** P5h doctor card line: "A summary of Ava’s week…" (day / week / month / 3 months / 6 months / year). */
export const RANGE_WORD: Record<ReportRange, string> = { today: 'day', week: 'week', month: 'month', '3m': '3 months', '6m': '6 months', '1y': 'year' };

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const DAY = 24 * 3600_000;

/** Where a range starts, at local midnight: Today = this morning, Week = the last 7 days with today, Month / 3 / 6
 * months / 1 year = the same date that many months back. */
export function rangeSince(range: ReportRange, now = new Date()): Date {
  const d = startOfDay(now);
  if (range === 'today') return d;
  if (range === 'week') return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 6);
  const months = { month: 1, '3m': 3, '6m': 6, '1y': 12 }[range];
  return new Date(d.getFullYear(), d.getMonth() - months, d.getDate());
}

/** Calendar days from `since` to `now`, both counted ("Week" = 7). */
export function rangeDayCount(since: Date, now = new Date()): number {
  return Math.round((+startOfDay(now) - +startOfDay(since)) / DAY) + 1;
}

/** P5j caps line span: "Oct 2 – 8", "Sep 9 – Oct 8", "Oct 9, 2025 – Oct 8, 2026", "Oct 8" for one day. */
export function spanLabel(from: Date, to: Date): string {
  const md = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (dayKey(from) === dayKey(to)) return md(to);
  if (from.getFullYear() !== to.getFullYear()) return `${md(from)}, ${from.getFullYear()} – ${md(to)}, ${to.getFullYear()}`;
  if (from.getMonth() === to.getMonth()) return `${md(from)} – ${to.getDate()}`;
  return `${md(from)} – ${md(to)}`;
}

/** "2026-10-05" in local time. */
export function dayKey(d: Date | string): string {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

/** HISTORY day heading: "Today", "Yesterday", "Mon, Oct 5" ("Mon, Oct 5, 2025" in another year). */
export function dayHeading(d: Date | string, now = new Date()): string {
  const x = new Date(d);
  const diff = Math.round((+startOfDay(now) - +startOfDay(x)) / DAY);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return x.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', ...(x.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}) });
}

/** Rows (newest first) grouped by their local day, in the same order. */
export function groupByDay<R extends { at: string }>(rows: R[], now = new Date()): { key: string; label: string; rows: R[] }[] {
  const out: { key: string; label: string; rows: R[] }[] = [];
  for (const r of rows) {
    const key = dayKey(r.at);
    const g = out[out.length - 1];
    if (g && g.key === key) g.rows.push(r);
    else out.push({ key, label: dayHeading(r.at, now), rows: [r] });
  }
  return out;
}

/** A nap's length in minutes from its typed times ("1:00 PM" – "2:30 PM") on the day it was logged; a nap past
 * midnight ends the next day. Null without both times, or when it reads longer than 16 h (a typo). */
export function napMinutes(l: Pick<LogEntry, 'kind' | 'data' | 'happened_at'>): number | null {
  const d = l.data ?? {};
  if (l.kind !== 'nap' || !d.started_at || !d.ended_at) return null;
  const day = new Date(l.happened_at);
  const start = parseTimeOnDay(d.started_at, day);
  let end = parseTimeOnDay(d.ended_at, day);
  if (!start || !end) return null;
  if (+end <= +start) end = new Date(+end + DAY);
  const min = Math.round((+end - +start) / 60000);
  return min > 0 && min <= 16 * 60 ? min : null;
}

/** P5m's short form: "3 h 10 m", "45 m", "2 h". */
export function shortMinutes(min: number): string {
  const m = Math.round(min);
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? (r ? `${h} h ${r} m` : `${h} h`) : `${r} m`;
}

/** "1 h 25 min", "40 min", "2 h". */
export function formatMinutes(min: number): string {
  const m = Math.round(min);
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? (r ? `${h} h ${r} min` : `${h} h`) : `${r} min`;
}

/** A bottle amount in a food log ("4 oz", "120 ml"); null when the amount is a word ("all", "some"). */
export function bottleAmount(text: string | undefined): { amount: number; unit: 'oz' | 'ml' } | null {
  const m = text?.match(/(\d+(?:[.,]\d+)?)\s*(oz|ml)\b/i);
  return m ? { amount: Number(m[1].replace(',', '.')), unit: m[2].toLowerCase() as 'oz' | 'ml' } : null;
}

type FoodLog = Pick<LogEntry, 'kind' | 'data'>;

/** A bottle's amount: the S5b fields (bottle_amount + bottle_unit), else an older log's "4 oz" typed in its amount or
 * what. Null when there's none. */
export function bottleOf(l: FoodLog): { amount: number; unit: BottleUnit } | null {
  const b = bottleLog(l);
  if (b?.amount) return { amount: b.amount, unit: b.unit };
  const d = l.data ?? {};
  return bottleAmount(d.amount) ?? bottleAmount(d.what);
}

/** A food log is a bottle when its meal is "bottle" or its amount has oz / ml. */
export function isBottleFood(l: FoodLog): boolean {
  return l.kind === 'food' && ((l.data?.meal ?? '').toLowerCase() === 'bottle' || !!bottleOf(l));
}

/** An amount in a unit: "26 oz", "4.5 oz", "780 ml". */
export function amountLabel(n: number, unit: BottleUnit): string {
  return unit === 'ml' ? `${Math.round(n)} ml` : `${Math.round(n * 10) / 10} oz`;
}

export type Feeding = {
  total: number;
  meals: number;
  snacks: number;
  bottles: number;
  /** Bottle amounts by unit, and how many bottles had each (the majority unit is the kid's). */
  oz: number;
  ml: number;
  ozBottles: number;
  mlBottles: number;
  /** S5b "How much did she drink?" answers. */
  drank: { none: number; some: number; most: number; all: number };
  /** Bottles by milk ("formula": 5). */
  milk: Record<string, number>;
};

/** All the bottles' amounts in the kid's unit (the one most of them were logged in, oz on a tie), mixing units at
 * 29.57 ml an ounce; null when no bottle had an amount. */
export function bottleTotal(f: Pick<Feeding, 'oz' | 'ml' | 'ozBottles' | 'mlBottles'>): { amount: number; unit: BottleUnit } | null {
  if (!f.ozBottles && !f.mlBottles) return null;
  const unit: BottleUnit = f.mlBottles > f.ozBottles ? 'ml' : 'oz';
  return { unit, amount: unit === 'oz' ? f.oz + f.ml / ML_PER_OZ : f.ml + f.oz * ML_PER_OZ };
}

/** A bottle log's amount in a unit (P5m bars "Bottles by day (oz)"); 0 without one. */
export function bottleIn(l: FoodLog, unit: BottleUnit): number {
  const a = bottleOf(l);
  if (!a) return 0;
  if (a.unit === unit) return a.amount;
  return unit === 'oz' ? a.amount / ML_PER_OZ : a.amount * ML_PER_OZ;
}

/** The milk most bottles were ('' when none said). */
export function mainMilk(milk: Record<string, number>): string {
  return Object.entries(milk).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
}

/** P5m "Between bottles": the average gap between one bottle and the next on the same day (a night between two days
 * isn't a gap), how many gaps that is, and the last bottle's time. */
export function bottleTimes(logs: Pick<LogEntry, 'kind' | 'data' | 'happened_at'>[]): { avgMin: number | null; gaps: number; last: string | null } {
  const times = logs.filter(isBottleFood).map((l) => l.happened_at).sort((a, b) => +new Date(a) - +new Date(b));
  let sum = 0;
  let gaps = 0;
  for (let i = 1; i < times.length; i++) {
    if (dayKey(times[i]) !== dayKey(times[i - 1])) continue;
    const min = (+new Date(times[i]) - +new Date(times[i - 1])) / 60000;
    if (min <= 0) continue;
    sum += min;
    gaps++;
  }
  return { avgMin: gaps ? sum / gaps : null, gaps, last: times[times.length - 1] ?? null };
}

export type KidPatterns = {
  /** Days that have at least one log: the per-day averages divide by these (the sitter isn't there every day). */
  days: number;
  feeding: Feeding;
  sleep: { naps: number; timed: number; totalMin: number };
  diapers: { total: number; wet: number; dirty: number; both: number; dry: number; potty: number; pottySuccess: number };
  activities: number;
  incidents: number;
  photos: number;
};

/** PATTERNS from her logs in the range. A food log is a bottle when its meal is "bottle" or its amount has oz / ml
 * (isBottleFood); snacks are meal "snack"; the rest are meals. A potty try is any potty answer but "not today". */
export function kidPatterns(logs: Pick<LogEntry, 'kind' | 'data' | 'happened_at'>[]): KidPatterns {
  const p: KidPatterns = {
    days: new Set(logs.map((l) => dayKey(l.happened_at))).size,
    feeding: { total: 0, meals: 0, snacks: 0, bottles: 0, oz: 0, ml: 0, ozBottles: 0, mlBottles: 0, drank: { none: 0, some: 0, most: 0, all: 0 }, milk: {} },
    sleep: { naps: 0, timed: 0, totalMin: 0 },
    diapers: { total: 0, wet: 0, dirty: 0, both: 0, dry: 0, potty: 0, pottySuccess: 0 },
    activities: 0,
    incidents: 0,
    photos: 0,
  };
  for (const l of logs) {
    const d = l.data ?? {};
    if (l.kind === 'food') {
      p.feeding.total++;
      if (isBottleFood(l)) {
        const f = p.feeding;
        f.bottles++;
        const amt = bottleOf(l);
        if (amt) {
          f[amt.unit] += amt.amount;
          f[amt.unit === 'oz' ? 'ozBottles' : 'mlBottles']++;
        }
        const b = bottleLog(l);
        if (b && (b.drank === 'none' || b.drank === 'some' || b.drank === 'most' || b.drank === 'all')) f.drank[b.drank]++;
        if (b?.milk) f.milk[b.milk] = (f.milk[b.milk] ?? 0) + 1;
      } else if ((d.meal ?? '').toLowerCase() === 'snack') p.feeding.snacks++;
      else p.feeding.meals++;
    } else if (l.kind === 'nap') {
      p.sleep.naps++;
      const min = napMinutes(l);
      if (min != null) {
        p.sleep.timed++;
        p.sleep.totalMin += min;
      }
    } else if (l.kind === 'diaper') {
      p.diapers.total++;
      if (d.diaper === 'wet' || d.diaper === 'dirty' || d.diaper === 'both' || d.diaper === 'dry') p.diapers[d.diaper]++;
      if (d.potty && d.potty !== 'not today') {
        p.diapers.potty++;
        if (d.potty.startsWith('success')) p.diapers.pottySuccess++;
      }
    } else if (l.kind === 'activity') p.activities++;
    else if (l.kind === 'incident') p.incidents++;
    else if (l.kind === 'photo') p.photos++;
  }
  return p;
}

/** "2.5" a day (one decimal, none when whole); '' with no days. */
export function perDay(n: number, days: number): string {
  if (!days) return '';
  const v = Math.round((n / days) * 10) / 10;
  return String(v);
}

/** Per-day bars for some log kinds from `since` to today: one bucket a day, or a week per bucket past 45 days so
 * 3 months to a year stay readable. Oldest first. Each log counts 1, or `value` of it (P5m: a bottle's ounces). */
export function dayBuckets<L extends Pick<LogEntry, 'kind' | 'happened_at'>>(logs: L[], kinds: LogEntry['kind'][], since: Date, now = new Date(), value: (l: L) => number = () => 1): { start: Date; count: number }[] {
  const days = rangeDayCount(since, now);
  const step = days > 45 ? 7 : 1;
  const from = startOfDay(since);
  const out = Array.from({ length: Math.ceil(days / step) }, (_, i) => ({ start: new Date(from.getFullYear(), from.getMonth(), from.getDate() + i * step), count: 0 }));
  for (const l of logs) {
    if (!kinds.includes(l.kind)) continue;
    const i = Math.floor(Math.round((+startOfDay(new Date(l.happened_at)) - +from) / DAY) / step);
    if (i >= 0 && i < out.length) out[i].count += value(l);
  }
  return out;
}

export type SummaryLine = { type: 'h' | 'li' | 'p'; text: string };
/** The doctor-visit summary's markdown, read simply: "## " (or "#", "###") headings, "- " / "* " bullets, other
 * lines as text; **bold** marks dropped, blank lines skipped. */
export function summaryLines(md: string): SummaryLine[] {
  return md
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l): SummaryLine => {
      const clean = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '$1').trim();
      const h = l.match(/^#{1,4}\s+(.*)$/);
      if (h) return { type: 'h', text: clean(h[1]) };
      const li = l.match(/^[-*•]\s+(.*)$/);
      if (li) return { type: 'li', text: clean(li[1]) };
      return { type: 'p', text: clean(l) };
    });
}
