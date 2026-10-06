// Incidents (S24) and the parents' Alerts feed (P9). An incident is a log row (kind 'incident', urgent), so the
// database pushes it to both parents at once (migration 15) and it shows in the timeline and the shift report.
import { incidentData, incidentTime, type IncidentDraft } from './alerts-logic';
import { supabase } from './supabase';

/** Same upload as the log sheets (S5 / S47): private shift-photos bucket, folder = shift id. */
export async function uploadShiftPhoto(shiftId: string, uri: string): Promise<string> {
  const path = `${shiftId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const body = await (await fetch(uri)).arrayBuffer();
  const up = await supabase.storage.from('shift-photos').upload(path, body, { contentType: 'image/jpeg' });
  if (up.error) throw up.error;
  return path;
}

/** S24 "Send to parents". */
export async function sendIncident(shiftId: string, authorId: string, draft: IncidentDraft, photoUri?: string | null, now = new Date()) {
  const photo_path = photoUri ? await uploadShiftPhoto(shiftId, photoUri) : null;
  const { error } = await supabase.from('logs').insert({
    shift_id: shiftId,
    author_id: authorId,
    kind: 'incident',
    kid_ids: draft.kidIds,
    data: incidentData(draft),
    photo_path,
    urgent: true,
    happened_at: incidentTime(draft.when, now).toISOString(),
  });
  if (error) throw error;
}
