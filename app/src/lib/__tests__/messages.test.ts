import { describe, expect, it } from '@jest/globals';

import { buildThread, dayLabel, type Message } from '../message-thread';

const now = new Date('2026-10-06T22:00:00');
const msg = (id: string, author: string, at: string, extra: Partial<Message> = {}): Message => ({
  id, family_id: 'f', sitter_id: 'maya', author_id: author, body: id, photo_path: null, created_at: new Date(at).toISOString(), ...extra,
});

describe('dayLabel', () => {
  it('says Today, otherwise MM/DD/YYYY', () => {
    expect(dayLabel('2026-10-06T08:00:00', now)).toBe('Today');
    expect(dayLabel('2026-10-05T08:00:00', now)).toBe('10/05/2026');
  });
});

describe('buildThread', () => {
  const parentSide = (m: Message) => m.author_id !== 'maya';
  const messages = [
    msg('old', 'jen', '2026-10-05T09:00:00'),
    msg('tooth', 'jen', '2026-10-06T15:10:00'),
    msg('yogurt', 'maya', '2026-10-06T15:12:00'),
    msg('dan', 'dan', '2026-10-06T15:20:00'),
  ];
  const shifts = [{ id: 's1', clock_in_at: new Date('2026-10-06T15:02:00').toISOString() }];

  it('merges clock-ins and messages in time order with a label per day', () => {
    const items = buildThread(messages, shifts, [], parentSide, now);
    expect(items.map((i) => (i.kind === 'message' ? i.message.id : i.kind === 'day' ? i.label : 'in'))).toEqual(['10/05/2026', 'old', 'Today', 'in', 'tooth', 'yogurt', 'dan']);
  });

  it('puts both parents on the parent side and the sitter on the other', () => {
    const items = buildThread(messages, [], [], parentSide, now).filter((i) => i.kind === 'message');
    expect(items.map((i) => i.kind === 'message' && i.mine)).toEqual([true, true, false, true]);
  });

  it('marks a message seen only when the other side read after it', () => {
    const reads = [
      { family_id: 'f', sitter_id: 'maya', user_id: 'maya', read_at: new Date('2026-10-06T15:15:00').toISOString() },
      { family_id: 'f', sitter_id: 'maya', user_id: 'dan', read_at: new Date('2026-10-06T16:00:00').toISOString() },
    ];
    const seen = (side: (m: Message) => boolean) =>
      Object.fromEntries(buildThread(messages, [], reads, side, now).flatMap((i) => (i.kind === 'message' ? [[i.message.id, i.seen]] : [])));
    // parent view: Maya read tooth but not Dan's later message; the co-parent reading doesn't count
    expect(seen(parentSide)).toEqual({ old: true, tooth: true, yogurt: false, dan: false });
    // sitter view: her yogurt reply was read by Dan
    expect(seen((m) => m.author_id === 'maya')).toEqual({ old: false, tooth: false, yogurt: true, dan: false });
  });
});
