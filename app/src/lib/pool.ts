// Data for the family's sitter pool (P54 Sitters tab, P42 Sitter pool). The status logic is in ./pool-logic.ts.
import { availabilityApi, type Availability, type SitterAway } from './availability';
import { api } from './data';
import type { Shift } from './types';
import { poolStatus, type PoolStatus, type TimeWindow } from './pool-logic';

export * from './pool-logic';

/** The family's sitters (oldest link first, so avatar colors stay put), their shifts with the family, weekly hours and
 * days off. Hours and days off come back empty before migration 12 runs. */
export async function poolData(familyId: string) {
  const [links, shifts, away] = await Promise.all([api.familySitters(familyId), api.familyShifts(familyId), availabilityApi.familyTimeOff(familyId).catch((): SitterAway[] => [])]);
  const sitters = [...links].sort((a, b) => (a.joined_at ?? '').localeCompare(b.joined_at ?? ''));
  const hours = await availabilityApi.hoursOf(sitters.filter((s) => s.status === 'active').map((s) => s.sitter_id)).catch((): Availability[] => []);
  return { sitters, shifts, hours, away };
}

export type PoolData = Awaited<ReturnType<typeof poolData>>;

/** One sitter's status for a window. */
export function statusFor(d: Pick<PoolData, 'sitters' | 'shifts' | 'hours' | 'away'>, sitterId: string, w: TimeWindow, opts: { onShiftNow?: boolean } = {}): PoolStatus {
  const link = d.sitters.find((s) => s.sitter_id === sitterId);
  return poolStatus(
    {
      linkStatus: link?.status ?? 'removed',
      hours: d.hours.filter((h) => h.sitter_id === sitterId),
      timeOff: d.away.filter((t) => t.sitter_id === sitterId),
      shifts: d.shifts.filter((s: Shift) => s.sitter_id === sitterId),
    },
    w,
    opts,
  );
}
