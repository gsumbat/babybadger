import { describe, expect, it } from '@jest/globals';

import { alertShift, buildAlerts, incidentCard, incidentData, incidentReady, incidentTime, logRow, type IncidentDraft } from '../alerts-logic';
import { timeOf } from '../format';
import { describeLog } from '../shift-logic';
import type { Kid, LogEntry, Shift } from '../types';

const kid = (id: string, name: string, gender: Kid['gender'] = null): Kid => ({ id, family_id: 'f', name, birthdate: null, avoid_foods: '', notes: '', gender });
const kids = [kid('ava', 'Ava', 'girl'), kid('leo', 'Leo', 'boy')];
const log = (over: Partial<LogEntry>): LogEntry => ({
  id: 'l1', shift_id: 's1', author_id: 'm', kind: 'note', kid_ids: [], data: {}, photo_path: null, urgent: false, happened_at: '2026-10-06T20:00:00.000Z', ...over,
});
const shift: Shift = {
  id: 's1', family_id: 'f', sitter_id: 'm', note: '', starts_at: '2026-10-06T19:00:00.000Z', ends_at: '2026-10-06T23:00:00.000Z',
  status: 'active', clock_in_at: '2026-10-06T19:02:00.000Z', clock_out_at: null,
};
const draft: IncidentDraft = { kidIds: ['leo'], type: 'Fall or bump', when: '4:38 PM', where: ' Backyard ', text: 'Scraped his knee. ' };

describe('incident draft (S24)', () => {
  it('needs a kid, a kind and what happened', () => {
    expect(incidentReady(draft)).toBe(true);
    expect(incidentReady({ ...draft, kidIds: [] })).toBe(false);
    expect(incidentReady({ ...draft, type: '' })).toBe(false);
    expect(incidentReady({ ...draft, text: '  ' })).toBe(false);
    expect(incidentReady({ ...draft, where: '' })).toBe(true);
  });
  it('stores type, where and text, trimmed, empties left out', () => {
    expect(incidentData(draft)).toEqual({ type: 'Fall or bump', where: 'Backyard', text: 'Scraped his knee.' });
    expect(incidentData({ ...draft, where: '' })).toEqual({ type: 'Fall or bump', text: 'Scraped his knee.' });
  });
  it('reads the picked time today, last night if it is later than now, now if empty', () => {
    const now = new Date(2026, 9, 6, 17, 0);
    expect(incidentTime('4:38 PM', now)).toEqual(new Date(2026, 9, 6, 16, 38));
    expect(incidentTime('11:50 PM', now)).toEqual(new Date(2026, 9, 5, 23, 50));
    expect(incidentTime('', now)).toBe(now);
  });
});

describe('describeLog incident', () => {
  it('matches the push text (migration 15)', () => {
    expect(describeLog({ kind: 'incident', data: { type: 'Fall or bump', where: 'Backyard', text: 'Scraped his knee.' } })).toEqual({ title: 'Incident: Fall or bump', detail: 'Backyard · Scraped his knee.' });
    expect(describeLog({ kind: 'incident', data: {} })).toEqual({ title: 'Incident: Other', detail: '' });
  });
});

describe('Alerts (P9)', () => {
  it('shows the live shift, else the latest one that started today', () => {
    const now = new Date('2026-10-06T22:00:00.000Z');
    const done = { ...shift, id: 'done', status: 'completed' as const, clock_out_at: '2026-10-06T21:00:00.000Z' };
    const old = { ...done, id: 'old', clock_in_at: '2026-10-01T19:00:00.000Z' };
    expect(alertShift([done, shift], now)?.id).toBe('s1');
    expect(alertShift([old, done], now)?.id).toBe('done');
    expect(alertShift([old], now)).toBeNull();
  });
  it('titles a fall "Injury · Leo", other kinds by name, body = what happened', () => {
    const fall = log({ kind: 'incident', urgent: true, kid_ids: ['leo'], data: { type: 'Fall or bump', where: 'Backyard', text: 'Scraped his knee.' } });
    expect(incidentCard(fall, kids)).toMatchObject({ title: 'Injury · Leo', body: 'Scraped his knee.', shiftId: 's1' });
    expect(incidentCard({ ...fall, data: { type: 'Fever or sick' } }, kids)).toMatchObject({ title: 'Fever or sick · Leo', body: 'Fever or sick' });
  });
  it('writes food like the wireframe, other logs like the timeline', () => {
    const snack = log({ kind: 'food', kid_ids: ['ava'], data: { meal: 'snack', what: 'Apple slices, crackers', amount: 'all' } });
    expect(logRow(snack, kids)).toMatchObject({ icon: 'food', title: 'Ava ate all of her snack', sub: `Apple slices, crackers · ${timeOf(snack.happened_at)}` });
    expect(logRow({ ...snack, kid_ids: ['ava', 'leo'] }, kids).title).toBe('Ava and Leo ate all of their snack');
    const nap = log({ kind: 'nap', kid_ids: ['leo'], data: { started_at: '1:00 PM', ended_at: '2:30 PM' } });
    expect(logRow(nap, kids)).toMatchObject({ icon: 'nap', title: 'Leo · Nap', sub: `1:00 PM – 2:30 PM · ${timeOf(nap.happened_at)}` });
  });
  it('puts incidents on top and the rest newest first, with clock-in/out and a late notice', () => {
    const fall = log({ id: 'inc', kind: 'incident', urgent: true, kid_ids: ['leo'], data: { type: 'Fall or bump', text: 'Bump' }, happened_at: '2026-10-06T20:30:00.000Z' });
    const snack = log({ id: 'snack', kind: 'food', kid_ids: ['ava'], data: { meal: 'snack', amount: 'some' }, happened_at: '2026-10-06T20:00:00.000Z' });
    const late = { ...shift, late_at: '2026-10-06T18:50:00.000Z', late_minutes: 10, late_note: 'Traffic' } as Shift;
    const { incidents, rows } = buildAlerts({ ...late, clock_out_at: '2026-10-06T22:00:00.000Z' }, [snack, fall], kids, 'Maya');
    expect(incidents.map((c) => c.id)).toEqual(['inc']);
    expect(rows.map((r) => r.title)).toEqual(['Maya clocked out', 'Ava ate some of her snack', 'Maya clocked in', 'Maya is running late']);
    expect(rows[3].sub).toBe(`10 min · Traffic · ${timeOf('2026-10-06T18:50:00.000Z')}`);
  });
  it('works before the late columns exist', () => {
    expect(buildAlerts(shift, [], kids, 'Maya').rows.map((r) => r.title)).toEqual(['Maya clocked in']);
  });
});
