// Booking sends a request (migration 35): the database calls. The rules (who may ask, booking each date, pushes)
// live in the database; dates and wording in ./booking-logic.ts. Single requests also use ./pool-requests.ts.
import { supabase } from './supabase';
import type { AskedSitter, ShiftRequest } from './pool-requests-logic';
import type { TimeWindow } from './pool-logic';
import type { BookingItem } from './booking-logic';

export * from './booking-logic';

/** Shown instead of the screen's action when migration 35 hasn't been run yet. */
export const NEEDS_BOOKING_MIGRATION = 'This needs the latest database update (migration 35).';

function must<T>(r: { data: T | null; error: { message: string; code?: string } | null }): T {
  if (r.error) {
    const missing = r.error.code === 'PGRST202' || r.error.code === '42703' || /could not find the function|does not exist/i.test(r.error.message);
    throw new Error(missing ? NEEDS_BOOKING_MIGRATION : r.error.message.charAt(0).toUpperCase() + r.error.message.slice(1));
  }
  return r.data as T;
}

export type SeriesResult = { request_id: string; result: 'booked' | 'declined' | 'busy' | 'missing_requirement' | 'failed' | string; message?: string };

export const bookingApi = {
  /** P6d / P6e "Send request": one window per date, each with its task lines. */
  async create(p: { sitterId: string; windows: (TimeWindow & { tasks: string[] })[]; kidIds: string[]; placeId?: string | null; note?: string }) {
    return must(
      await supabase.rpc('create_booking_request', {
        p_sitter: p.sitterId,
        p_windows: p.windows.map((w) => ({ starts: w.start.toISOString(), ends: w.end.toISOString(), tasks: w.tasks })),
        p_kid_ids: p.kidIds,
        p_place: p.placeId ?? null,
        p_note: p.note ?? '',
      }),
    ) as { series_id: string | null; request_ids: string[] };
  },
  /** Every date of a series (a sitter only gets the ones sent to her) with her answer, first date first. */
  async series(seriesId: string): Promise<BookingItem[]> {
    const reqs = must(await supabase.from('shift_requests').select('*').eq('series_id', seriesId).order('starts_at')) as ShiftRequest[];
    if (!reqs.length) return [];
    const asked = must(await supabase.from('shift_request_sitters').select('*').in('request_id', reqs.map((r) => r.id))) as AskedSitter[];
    return reqs.map((request) => ({ request, asked: asked.find((a) => a.request_id === request.id) }));
  },
  /** S33s "Accept 11 shifts" (accept = the ticked dates) / "Decline all" (accept empty). */
  async answer(seriesId: string, accept: string[], clearTimeOff: boolean) {
    return must(await supabase.rpc('answer_booking_series', { p_series: seriesId, p_accept: accept, p_clear_time_off: clearTimeOff })) as SeriesResult[];
  },
};
