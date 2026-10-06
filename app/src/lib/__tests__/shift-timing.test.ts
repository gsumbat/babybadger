import { describe, expect, it } from '@jest/globals';

import {
  clock,
  clockAmPm,
  customEnd,
  extendOptions,
  extensionChoices,
  extraPay,
  familyShort,
  firstTimedTask,
  isAtRisk,
  latestSafeEnd,
  lateText,
  minutesLabel,
  nextShiftAfter,
  requestQuestion,
  riskLine,
  taskPhrase,
  validExtension,
} from '../shift-timing-logic';

// Local times, so the expectations read like the wireframes in any time zone.
const at = (h: number, m = 0, day = 1) => new Date(2026, 9, day, h, m).toISOString();

describe('S21 running late', () => {
  const tasks = [
    { title: 'Snack', due_at: at(16), done_at: null },
    { title: 'Pick up Ava', due_at: at(15, 15), done_at: null },
    { title: 'Homework', due_at: null, done_at: null },
  ];
  it('finds the first timed task that is not done', () => {
    expect(firstTimedTask(tasks)?.title).toBe('Pick up Ava');
    expect(firstTimedTask([{ ...tasks[1], done_at: at(15, 10) }, tasks[0]])?.title).toBe('Snack');
    expect(firstTimedTask([tasks[2]])).toBeUndefined();
  });
  it('flags the task when the late arrival reaches it', () => {
    expect(isAtRisk(at(15), 15, tasks[1])).toBe(true);
    expect(isAtRisk(at(15), 10, tasks[1])).toBe(false);
    expect(isAtRisk(at(15), 30, undefined)).toBe(false);
    expect(isAtRisk(at(15), 0, tasks[1])).toBe(false);
  });
  it('words it like the wireframe', () => {
    expect(riskLine(tasks[1])).toBe('Pick up Ava at 3:15 is at risk.');
    expect(taskPhrase('Pick up Ava')).toBe('pick up Ava');
    expect(lateText('Maya', 15)).toBe('Maya is running 15 min late');
    expect(familyShort('The Lee family')).toBe('Lee family');
    expect(clock(at(15))).toBe('3:00');
    expect(clockAmPm(at(0, 5))).toBe('12:05 AM');
  });
});

describe('S25 extend shift', () => {
  const shift = { id: 'a', starts_at: at(15), ends_at: at(19), status: 'active' as const };
  const ortiz = { id: 'b', starts_at: at(19, 30), ends_at: at(22), status: 'scheduled' as const };
  const tomorrow = { id: 'c', starts_at: at(9, 0, 2), ends_at: at(12, 0, 2), status: 'scheduled' as const };
  const earlier = { id: 'd', starts_at: at(9), ends_at: at(12), status: 'completed' as const };
  const cancelled = { id: 'e', starts_at: at(19, 15), ends_at: at(21), status: 'cancelled' as const };

  it('finds her next shift that day', () => {
    expect(nextShiftAfter(shift, [shift, ortiz, tomorrow, earlier, cancelled])?.id).toBe('b');
    expect(nextShiftAfter(shift, [shift, tomorrow, earlier])).toBeUndefined();
  });
  it('offers the latest safe time when the request runs past it', () => {
    const safe = latestSafeEnd(ortiz);
    expect(clock(safe)).toBe('7:15');
    expect(extensionChoices(shift.ends_at, at(19, 45), safe).map((d) => clock(d))).toEqual(['7:15', '7:45']);
    // the request fits: only the time asked
    expect(extensionChoices(shift.ends_at, at(19, 10), safe).map((d) => clock(d))).toEqual(['7:10']);
    expect(extensionChoices(shift.ends_at, at(19, 45)).map((d) => clock(d))).toEqual(['7:45']);
  });
  it('checks a chosen end like the database', () => {
    expect(validExtension(shift.ends_at, new Date(at(19, 15)))).toBe(true);
    expect(validExtension(shift.ends_at, new Date(at(19)))).toBe(false);
    expect(validExtension(shift.ends_at, new Date(at(18)))).toBe(false);
    expect(validExtension(shift.ends_at, new Date(at(7, 1, 2)))).toBe(false);
  });
  it('reads a custom time after the current end', () => {
    expect(clockAmPm(customEnd('7:50 PM', shift.ends_at)!)).toBe('7:50 PM');
    // past midnight rolls to the next day
    const late = customEnd('12:30 AM', shift.ends_at)!;
    expect(late.getDate()).toBe(2);
    expect(customEnd('soon', shift.ends_at)).toBeNull();
  });
  it('gives the parent 15 to 60 more minutes', () => {
    expect(extendOptions(shift.ends_at).map((d) => clock(d))).toEqual(['7:15', '7:30', '7:45', '8:00']);
  });
  it('prices the extra time only with a rate', () => {
    expect(extraPay(22, 45)).toBe('$22 × 0.75 hr = $16.50');
    expect(extraPay(18.5, 60)).toBe('$18.50 × 1 hr = $18.50');
    expect(extraPay(null, 45)).toBeNull();
    expect(extraPay(22, 0)).toBeNull();
  });
  it('labels the time and the question', () => {
    expect(minutesLabel(45)).toBe('45 min');
    expect(minutesLabel(60)).toBe('1 h');
    expect(minutesLabel(75)).toBe('1 h 15 min');
    expect(requestQuestion('Stuck in a meeting.', at(19, 45))).toBe('Stuck in a meeting. Can you stay until 7:45?');
    expect(requestQuestion('', at(19, 45))).toBe('Can you stay until 7:45?');
  });
});
