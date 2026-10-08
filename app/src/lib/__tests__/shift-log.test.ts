import { describe, expect, it } from '@jest/globals';

import { chipRule, type HouseRule, shiftRuleRows } from '../house-rules-logic';
import {
  isRideTask,
  kidLogs,
  kidTag,
  kidTasks,
  lengthBetween,
  logTitle,
  lovedLogs,
  nextPhotoDue,
  openPhotoRequest,
  photoAskWaiting,
  reportTitle,
  rulesStrip,
  shiftLogRows,
  shortClock,
  taskForKid,
  type PhotoRequest,
} from '../shift-log-logic';
import type { LogEntry } from '../types';

// Oct 7, 2026 local times.
const at = (h: number, m = 0) => new Date(2026, 9, 7, h, m).toISOString();
const KIDS = [
  { id: 'ava', name: 'Ava' },
  { id: 'leo', name: 'Leo' },
];

function log(id: string, kind: LogEntry['kind'], when: string, data: Record<string, string> = {}, kid_ids: string[] = [], photo_path: string | null = null): LogEntry {
  return { id, shift_id: 's', author_id: 'm', kind, kid_ids, data, photo_path, urgent: false, happened_at: when };
}
function rule(key: string): HouseRule {
  return { ...chipRule(key), id: key, family_id: 'f', must_since: null, created_at: '2026-10-06T10:00:00Z', updated_at: '2026-10-06T10:00:00Z' };
}

// The P77 wireframe's afternoon.
const LOGS = [
  log('snack', 'food', at(15, 30), { meal: 'snack', what: 'Apple slices, crackers', amount: 'all' }, ['ava']),
  log('nap', 'nap', at(17, 12), { started_at: '3:45 PM', ended_at: '5:10 PM', how: 'easily', note: 'On the couch after the park' }, ['leo']),
  log('park', 'activity', at(16, 30), { what: 'park', duration: '1 h', note: 'Leo found a frog and named it Pickles' }, ['ava', 'leo']),
  log('photo', 'photo', at(16, 32), { caption: 'Snack break on the bench' }, ['ava', 'leo'], 's/p.jpg'),
];
const TASKS = [
  { id: 't1', title: 'Pick up Ava', done_at: at(15, 24) },
  { id: 't2', title: 'Homework', done_at: null },
];

describe('shiftLogRows (P77 timeline)', () => {
  it('reads like the wireframe, newest first, with the nap split and the done task', () => {
    const rows = shiftLogRows(LOGS, TASKS, KIDS);
    expect(rows.map((r) => [r.title, r.kid, shortClock(r.at), r.detail])).toEqual([
      ['Nap ended', 'Leo', '5:10', '1 h 25 min · fell asleep easily'],
      ['Photo update', 'Both', '4:32', '“Snack break on the bench”'],
      ['Park', 'Both', '4:30', '1 h · Leo found a frog and named it Pickles'],
      ['Nap started', 'Leo', '3:45', 'On the couch after the park'],
      ['Snack', 'Ava', '3:30', 'Apple slices, crackers · ate all'],
      ['Pick up Ava', '', '3:24', ''],
    ]);
    expect(rows[1]).toMatchObject({ logId: 'photo', photoPath: 's/p.jpg', kind: 'photo' });
    expect(rows[5]).toMatchObject({ kind: 'task', logId: null });
  });
  it('filters by chip; tasks only under All', () => {
    expect(shiftLogRows(LOGS, TASKS, KIDS, 'food').map((r) => r.title)).toEqual(['Snack']);
    expect(shiftLogRows(LOGS, TASKS, KIDS, 'sleep').map((r) => r.title)).toEqual(['Nap ended', 'Nap started']);
    expect(shiftLogRows(LOGS, TASKS, KIDS, 'activities').map((r) => r.title)).toEqual(['Park']);
    expect(shiftLogRows(LOGS, TASKS, KIDS, 'photos').map((r) => r.title)).toEqual(['Photo update']);
  });
  it('a nap still going is one "Nap started" row at its start time', () => {
    const rows = shiftLogRows([log('n', 'nap', at(14, 5), { started_at: '2:00 PM', how: 'took a while' })], [], KIDS);
    expect(rows.map((r) => [r.title, shortClock(r.at), r.detail])).toEqual([['Nap started', '2:00', 'took a while to fall asleep']]);
  });
  it('a nap typed before midnight and logged after it stays on the earlier day', () => {
    const rows = shiftLogRows([log('n', 'nap', new Date(2026, 9, 8, 0, 20).toISOString(), { started_at: '11:30 PM', ended_at: '12:15 AM' })], [], KIDS);
    expect(rows[0]).toMatchObject({ title: 'Nap ended', detail: '45 min' });
  });
});

describe('small helpers', () => {
  it('kid tags', () => {
    expect(kidTag([], KIDS)).toBe('');
    expect(kidTag(['leo'], KIDS)).toBe('Leo');
    expect(kidTag(['ava', 'leo'], KIDS)).toBe('Both');
    expect(kidTag(['a', 'b', 'c'], [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }])).toBe('All');
    expect(kidTag(['a', 'b'], [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }])).toBe('A, B');
  });
  it('lengths and ride tasks', () => {
    expect(lengthBetween(new Date(at(15, 45)), new Date(at(17, 10)))).toBe('1 h 25 min');
    expect(lengthBetween(new Date(at(15)), new Date(at(16)))).toBe('1 h');
    expect(lengthBetween(new Date(at(16)), new Date(at(15)))).toBe('');
    expect(isRideTask('Pick up Ava')).toBe(true);
    expect(isRideTask('Drop off Leo at soccer')).toBe(true);
    expect(isRideTask('Bath')).toBe(false);
  });
  it('loved logs', () => {
    expect([...lovedLogs([{ log_id: 'a', kind: 'love' }, { log_id: 'a', kind: 'love' }, { log_id: 'b', kind: 'love' }])]).toEqual(['a', 'b']);
  });
});

describe('rulesStrip (P77 / P77b)', () => {
  const rules = [rule('meals'), rule('naps'), rule('activities'), rule('photos')];
  const clockIn = at(15, 2);
  it('on track: what is logged and when the next photo is due', () => {
    const now = new Date(at(17, 15));
    const next = nextPhotoDue(rules, LOGS, clockIn);
    expect(shortClock(next!.toISOString())).toBe('6:32');
    expect(rulesStrip(shiftRuleRows(rules, LOGS, KIDS, clockIn, now), next)).toEqual({ ok: true, lead: 'House rules on track.', text: 'Meals, nap and activity logged · next photo due 6:32' });
  });
  it('logs due: amber with what is missing', () => {
    const now = new Date(at(17, 15));
    const rows = shiftRuleRows(rules, [LOGS[0]], KIDS, clockIn, now);
    expect(rulesStrip(rows, nextPhotoDue(rules, [LOGS[0]], clockIn))).toEqual({ ok: false, lead: 'House rules: 3 logs due.', text: 'Nap, activity and photo update' });
  });
  it('no log rules: no strip; a photo rule alone before any photo: just the next one', () => {
    expect(rulesStrip(shiftRuleRows([rule('phone')], LOGS, KIDS, clockIn), null)).toBeNull();
    const now = new Date(at(15, 30));
    const r = [rule('photos')];
    expect(rulesStrip(shiftRuleRows(r, [], KIDS, clockIn, now), nextPhotoDue(r, [], clockIn))).toEqual({ ok: true, lead: 'House rules on track.', text: 'Next photo due 5:02' });
  });
});

describe('photo requests (S4p / P77c)', () => {
  const req = (id: string, when: string): PhotoRequest => ({ id, shift_id: 's', parent_id: 'jen', created_at: when });
  it('the newest request stays open until a photo is logged after it', () => {
    expect(openPhotoRequest([], LOGS)).toBeNull();
    expect(openPhotoRequest([req('a', at(16, 0)), req('b', at(16, 40))], LOGS)?.id).toBe('b');
    expect(openPhotoRequest([req('a', at(16, 0))], LOGS)).toBeNull(); // the 4:32 photo answered it
  });
  it('the parent waits 10 minutes, or less when a photo arrives', () => {
    expect(photoAskWaiting([req('b', at(16, 40))], LOGS, new Date(at(16, 45)))).toBe(true);
    expect(photoAskWaiting([req('b', at(16, 40))], LOGS, new Date(at(16, 51)))).toBe(false);
    expect(photoAskWaiting([req('b', at(16, 40))], [...LOGS, log('p2', 'photo', at(16, 44))], new Date(at(16, 45)))).toBe(false);
  });
});

describe('kid-specific report and log', () => {
  const logs = [
    log('snack', 'food', at(15, 30), { what: 'Apple slices' }, ['ava']),
    log('nap', 'nap', at(15, 45), {}, ['leo']),
    log('park', 'activity', at(16, 30), { what: 'Park' }, ['ava', 'leo']),
    log('note', 'note', at(17), { text: 'All good' }),
  ];
  const tasks = [
    { id: 't1', title: 'Picked up Ava', done_at: at(15, 24) },
    { id: 't2', title: 'Soccer for Leo', done_at: at(16) },
    { id: 't3', title: 'Dinner', done_at: at(18) },
  ];

  it('keeps her logs and whole-family logs, drops logs only for other kids', () => {
    expect(kidLogs(logs, 'ava').map((l) => l.id)).toEqual(['snack', 'park', 'note']);
    expect(kidLogs(logs, 'leo').map((l) => l.id)).toEqual(['nap', 'park', 'note']);
    expect(kidLogs(logs, null)).toHaveLength(4);
  });

  it('matches tasks by name', () => {
    expect(taskForKid('Picked up Ava', KIDS, 'ava')).toBe(true);
    expect(taskForKid('Soccer for Leo', KIDS, 'ava')).toBe(false);
    expect(taskForKid('Dinner', KIDS, 'ava')).toBe(true);
    expect(taskForKid('Bath for Ava and Leo', KIDS, 'leo')).toBe(true);
    expect(taskForKid('Leonard’s book', KIDS, 'ava')).toBe(true); // "Leo" inside a longer word is not Leo
    expect(kidTasks(tasks, KIDS, 'ava').map((t) => t.id)).toEqual(['t1', 't3']);
    expect(kidTasks(tasks, KIDS, null)).toHaveLength(3);
  });

  it('filters P77 rows by kid and tags family entries "Everyone"', () => {
    const rows = shiftLogRows(logs, tasks, KIDS, 'all', 'ava');
    expect(rows.map((r) => r.key)).toEqual(['task-t3', 'note', 'park', 'snack', 'task-t1']);
    expect(rows.find((r) => r.key === 'note')!.kid).toBe('Everyone');
    expect(rows.find((r) => r.key === 'park')!.kid).toBe('Both');
    expect(rows.find((r) => r.key === 'snack')!.kid).toBe('Ava');
    // No kid selected: the family entry has no tag, every log shows.
    const all = shiftLogRows(logs, tasks, KIDS, 'all');
    expect(all.find((r) => r.key === 'note')!.kid).toBe('');
    expect(all).toHaveLength(7);
    // Type chips still apply on top.
    expect(shiftLogRows(logs, tasks, KIDS, 'food', 'leo')).toEqual([]);
    // One kid on the shift: no "Everyone" tag.
    expect(shiftLogRows(logs, [], [KIDS[0]], 'all', 'ava').find((r) => r.key === 'note')!.kid).toBe('');
  });

  it('titles', () => {
    expect(reportTitle('Ava')).toBe('Ava’s report');
    expect(reportTitle(null)).toBe('Shift report');
    expect(logTitle('Ava', true)).toBe('Ava’s log');
    expect(logTitle(null, true)).toBe('Today’s log');
    expect(logTitle(undefined, false)).toBe('Shift log');
  });
});
