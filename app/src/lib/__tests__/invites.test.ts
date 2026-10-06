import { describe, expect, it, jest } from '@jest/globals';

jest.mock('../supabase', () => ({ supabase: {} }));

// eslint-disable-next-line import/first
import { kidIdsFor, money, parseRate, payLine, stepsDone } from '../invites';

describe('invite pay (P23, P24)', () => {
  it('reads the rate field', () => {
    expect(parseRate('20')).toBe(20);
    expect(parseRate('$22.5')).toBe(22.5);
    expect(parseRate('22,50')).toBe(22.5);
    expect(parseRate('')).toBeNull();
    expect(parseRate('abc')).toBeNull();
    expect(parseRate('-3')).toBeNull();
  });
  it('writes the pill', () => {
    expect(money(20)).toBe('$20');
    expect(money(22.5)).toBe('$22.50');
    expect(payLine(20, 'weekly')).toBe('$20 / hr, weekly');
    expect(payLine(18.75, 'per_shift')).toBe('$18.75 / hr, per shift');
    expect(payLine(null, 'weekly')).toBeNull();
  });
});

describe('who she looks after (P23)', () => {
  it('stores every kid as null, a subset as the list', () => {
    expect(kidIdsFor(['a', 'b'], ['a', 'b'])).toBeNull();
    expect(kidIdsFor(['b'], ['a', 'b'])).toEqual(['b']);
  });
});

describe('invite progress (P25)', () => {
  it('moves through sent, opened, signed', () => {
    expect(stepsDone({ opened_at: null, accepted_at: null }, false)).toEqual(['sent']);
    expect(stepsDone({ opened_at: '2026-10-06T17:50:00Z', accepted_at: null }, false)).toEqual(['sent', 'opened']);
    expect(stepsDone({ opened_at: null, accepted_at: '2026-10-06T18:00:00Z' }, true)).toEqual(['sent', 'opened', 'reviewing', 'ready']);
  });
});
