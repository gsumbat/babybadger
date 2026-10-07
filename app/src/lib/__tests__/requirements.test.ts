import { describe, expect, it } from '@jest/globals';

import {
  basedOnLine,
  catalogueDraft,
  customDraft,
  diffDrafts,
  familyShort,
  languageDraft,
  meetsLine,
  modeNote,
  proofOf,
  recommended,
  reqIcon,
  requirementKind,
  requirementLabel,
  reviewRows,
  reviewSub,
  seatLabel,
  setChoice,
  sitterBanner,
  sitterRows,
  sortDrafts,
  startDrafts,
  summarize,
  toDrafts,
  youngestUnder5,
  type ReqStatusRow,
  type Requirement,
} from '../requirements-logic';

const TODAY = new Date(2026, 9, 6); // Oct 6, 2026
const KIDS = [
  { id: 'ava', name: 'Ava', birthdate: '2019-03-02' },
  { id: 'leo', name: 'Leo', birthdate: '2022-05-10' },
];

function req(key: string, extra: Partial<Requirement> = {}): Requirement {
  return { id: key, family_id: 'f', key, title: key, details: {}, level: 'must', position: 0, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z', ...extra };
}
function status(id: string, met: boolean, reason: ReqStatusRow['reason'], expires_on: string | null = null): ReqStatusRow {
  return { requirement_id: id, met, reason, expires_on };
}

describe('recommended (P28)', () => {
  it('builds the set from the kids and the invite', () => {
    expect(recommended(KIDS, true, TODAY)).toEqual([
      { key: 'background_check', why: 'Everyone' },
      { key: 'cpr_first_aid', why: 'Everyone' },
      { key: 'cpr_infant', why: 'Leo is 4' },
      { key: 'drivers_license', why: 'You allow driving' },
    ]);
    expect(recommended([KIDS[0]], false, TODAY).map((r) => r.key)).toEqual(['background_check', 'cpr_first_aid']);
  });
  it('names the kids', () => {
    expect(basedOnLine(KIDS, true, TODAY)).toBe('Based on Ava 7, Leo 4 and the permissions you chose');
    expect(basedOnLine(KIDS, false, TODAY)).toBe('Based on Ava 7, Leo 4');
    expect(youngestUnder5(KIDS, TODAY)?.kid.name).toBe('Leo');
  });
  it('starts from the set or from nothing', () => {
    expect(startDrafts('recommended', KIDS, false, TODAY).map((d) => [d.key, d.level])).toEqual([
      ['background_check', 'must'],
      ['cpr_first_aid', 'must'],
      ['cpr_infant', 'must'],
    ]);
    expect(startDrafts('blank', KIDS, true, TODAY)).toEqual([]);
  });
});

describe('drafts', () => {
  it('Must / Nice / Off on a catalogue row', () => {
    let d = setChoice([], 'water_safety', 'prefer');
    expect(d.map((x) => [x.key, x.level, x.title])).toEqual([['water_safety', 'prefer', 'Water safety']]);
    d = setChoice(d, 'water_safety', 'must');
    expect(d[0].level).toBe('must');
    expect(setChoice(d, 'water_safety', 'off')).toEqual([]);
  });
  it('saves in catalogue order, then languages, then the parent’s own', () => {
    const d = [customDraft('Comfortable with dogs', 'Biscuit', 'self', 'prefer'), languageDraft('Spanish'), catalogueDraft('non_smoker'), catalogueDraft('background_check')];
    expect(sortDrafts(d).map((x) => x.key)).toEqual(['background_check', 'non_smoker', 'language:Spanish', 'custom']);
  });
  it('diffs against what is saved', () => {
    const saved = [req('background_check', { position: 0 }), req('water_safety', { position: 1, level: 'prefer' }), req('cpr_infant', { position: 2 })];
    const drafts = toDrafts(saved)
      .filter((d) => d.key !== 'cpr_infant')
      .map((d) => (d.key === 'water_safety' ? { ...d, level: 'must' as const } : d));
    drafts.push(catalogueDraft('cpr_first_aid'));
    const { add, update, remove } = diffDrafts(saved, drafts);
    expect(remove).toEqual(['cpr_infant']);
    expect(add.map((a) => [a.key, a.position])).toEqual([['cpr_first_aid', 1]]);
    expect(update).toEqual([{ id: 'water_safety', fields: { level: 'must', position: 2 } }]);
    const inOrder = [req('background_check', { position: 0 }), req('cpr_infant', { position: 1 }), req('water_safety', { position: 2 })];
    expect(diffDrafts(inOrder, toDrafts(inOrder))).toEqual({ add: [], update: [], remove: [] });
  });
});

describe('lines', () => {
  it('P32 rows: CPR rows merge, Driving and self-confirmed subs', () => {
    const d = [
      catalogueDraft('background_check'),
      catalogueDraft('cpr_first_aid'),
      catalogueDraft('cpr_infant'),
      catalogueDraft('drivers_license'),
      catalogueDraft('non_smoker'),
      languageDraft('Spanish'),
      customDraft('Comfortable with dogs', '', 'self', 'prefer'),
    ];
    expect(reviewRows(d, 'must', KIDS, TODAY).map((r) => [r.title, r.sub])).toEqual([
      ['Background check', ''],
      ['CPR and First Aid · Infant CPR', ''],
      ['Driving', 'Car trips only · seats for Ava, Leo'],
      ['Non-smoker', 'Self-confirmed'],
    ]);
    expect(reviewRows(d, 'prefer', KIDS, TODAY).map((r) => [r.title, r.sub, r.icon])).toEqual([
      ['Speaks Spanish', '', 'globe'],
      ['Comfortable with dogs', 'Self-confirmed', 'dog'],
    ]);
    expect(reviewSub({ key: 'drivers_license', details: { applies: 'every', items: ['license'] } }, KIDS, TODAY)).toBe('Every shift');
    expect(reviewSub(customDraft('Letter from a vet', '', 'document', 'must'), KIDS, TODAY)).toBe('Document');
  });
  it('seat labels', () => {
    expect(KIDS.map((k) => seatLabel(k, TODAY))).toEqual(['Ava · booster', 'Leo · car seat']);
  });
  it('proof and icons', () => {
    expect(proofOf({ key: 'cpr_infant', details: {} })).toBe('credential');
    expect(proofOf({ key: 'drivers_license', details: {} })).toBe('mixed');
    expect(proofOf({ key: 'custom', details: { proof: 'document' } })).toBe('document');
    expect(proofOf({ key: 'non_smoker', details: {} })).toBe('self');
    expect(reqIcon({ key: 'custom', title: 'Homework help' })).toBe('doc');
  });
  it('family names', () => {
    expect(familyShort('The Lee family')).toBe('the Lees');
    expect(familyShort('Garcia')).toBe('Garcia');
    expect(modeNote('block')).toMatch(/can’t book her/);
  });
});

describe('status', () => {
  const reqs = [
    req('background_check', { position: 0 }),
    req('cpr_infant', { position: 1, title: 'Infant CPR' }),
    req('drivers_license', { position: 2, title: 'Driving' }),
    req('language:Spanish', { position: 3, level: 'prefer', details: { language: 'Spanish' } }),
  ];
  it('counts must-haves only', () => {
    const s = summarize(reqs, [status('background_check', true, 'valid'), status('cpr_infant', false, 'expired', '2026-09-01'), status('drivers_license', true, 'valid'), status('language:Spanish', false, 'missing')]);
    expect(s).toMatchObject({ met: 2, total: 3, missing: ['Infant CPR'], allMet: false });
    expect(requirementLabel(s)).toBe('Missing 1: Infant CPR');
    expect(requirementKind(s)).toBe('warn');
  });
  it('labels', () => {
    expect(requirementLabel({ total: 3, missing: [] })).toBe('Meets all requirements');
    expect(requirementLabel({ total: 3, missing: ['Infant CPR', 'Driving'] })).toBe('Missing 2: Infant CPR, Driving');
    expect(requirementLabel({ total: 0, missing: [] })).toBe('');
    // no status rows yet (before migration 20, or nothing known) = missing everything
    expect(summarize(reqs, []).missing).toEqual(['Background check', 'Infant CPR', 'Driving']);
  });
  it('P7a line', () => {
    const s = summarize(reqs, [status('background_check', true, 'valid'), status('cpr_infant', true, 'expiring', '2026-10-22'), status('drivers_license', true, 'valid')]);
    expect(meetsLine('Maya', s)).toBe('Maya meets all 3 today. Her Infant CPR expires Oct 22.');
    expect(meetsLine('Maya', summarize(reqs, [status('background_check', true, 'valid')]))).toBe('Maya is missing 2: Infant CPR, Driving.');
  });
});

describe('S27 rows', () => {
  const reqs = [
    req('background_check', { position: 0 }),
    req('cpr_first_aid', { position: 1 }),
    req('cpr_infant', { position: 2 }),
    req('drivers_license', { position: 3, details: { items: ['license', 'record', 'car_seats'] } }),
    req('non_smoker', { position: 4 }),
    req('dogs', { key: 'custom', title: 'Comfortable with dogs', position: 5, level: 'prefer', details: { why: 'Biscuit, a big friendly lab', proof: 'self' } }),
  ];
  const rows = [
    status('background_check', true, 'valid'),
    status('cpr_first_aid', true, 'valid'),
    status('cpr_infant', true, 'expiring', '2026-10-22'),
    status('drivers_license', false, 'unconfirmed'),
    status('non_smoker', false, 'unconfirmed'),
    status('dogs', false, 'unconfirmed'),
  ];
  const creds = [
    { kind: 'background_check', verified_at: '2026-08-12T10:00:00Z', expires_on: null },
    { kind: 'cpr_infant', verified_at: '2026-01-02T10:00:00Z', expires_on: '2026-10-22' },
  ];
  it('matches the wireframe', () => {
    const out = sitterRows(reqs, rows, creds, {});
    expect(out.map((r) => [r.title, r.sub, r.state, !!r.confirmId])).toEqual([
      ['Background check', 'Verified Aug 2026', 'have', false],
      ['CPR, First Aid, Infant CPR', 'Verified · Infant expires Oct 22', 'have', false],
      ['Driving', 'License ✓ record ✓ car seats', 'confirm', true],
      ['Non-smoker', 'Confirm for this family', 'confirm', true],
      ['Comfortable with dogs', '“Biscuit, a big friendly lab”', 'nice', false],
    ]);
    const s = summarize(reqs, rows);
    expect(sitterBanner(s, out)).toEqual({ bold: '3 of 5 must-haves done.', rest: 'Confirm the last 2 below so the family can book you.', done: false });
  });
  it('a missing credential links out instead of asking', () => {
    const out = sitterRows([req('water_safety')], [status('water_safety', false, 'missing')], [], {});
    expect(out[0]).toMatchObject({ state: 'missing', sub: 'Add it to your profile' });
    expect(sitterBanner({ met: 0, total: 1 }, out).rest).toBe('Add or confirm the last one below so the family can book you.');
  });
});
