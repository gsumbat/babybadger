import { describe, expect, it } from '@jest/globals';

import {
  addKindFor,
  ageCheck,
  askable,
  askDefaults,
  askedLine,
  askLabel,
  countsAsMet,
  datesLine,
  decidesLine,
  isExpired,
  isPdf,
  kindsFor,
  matchingCredentials,
  parentState,
  parentSub,
  progressLine,
  selfPrompt,
  sitterState,
  sitterSub,
  STATE_LABEL,
  usDate,
  waitingOnHer,
  type FamilyReqRow,
  type ReqRequest,
} from '../requirement-requests';

const TODAY = new Date(2026, 9, 7); // Oct 7, 2026

function request(over: Partial<ReqRequest> = {}): ReqRequest {
  return {
    id: 'q1',
    family_id: 'f',
    sitter_id: 's',
    req_key: 'cpr_first_aid',
    status: 'asked',
    note: null,
    asked_at: '2026-10-06T12:00:00Z',
    asked_by: 'Jen',
    shared_at: null,
    sitter_note: null,
    reviewed_at: null,
    reviewed_by: null,
    title: 'CPR and First Aid',
    level: 'must',
    kinds: ['first_aid', 'cpr_child'],
    why: null,
    credential: null,
    ...over,
  };
}

function row(key: string, req: Partial<ReqRequest> | null, over: Partial<FamilyReqRow> = {}): FamilyReqRow {
  return {
    requirement_id: `r-${key}`,
    key,
    req_key: key,
    title: key,
    level: 'must',
    kinds: kindsFor(key),
    language: false,
    speaks: null,
    request: req ? request({ req_key: key, ...req }) : null,
    ...over,
  };
}

const card = (expires_on: string | null) => ({ id: 'c', kind: 'first_aid', title: 'CPR and First Aid', issuer: 'American Red Cross', issued_on: '2025-06-01', expires_on });

describe('which cards count', () => {
  it('maps requirement keys to credential kinds', () => {
    expect(kindsFor('cpr_first_aid')).toEqual(['first_aid', 'cpr_child']);
    expect(kindsFor('cpr_infant')).toEqual(['cpr_infant']);
    expect(kindsFor('background_check')).toEqual(['background_check']);
    expect(kindsFor('drivers_license')).toEqual(['drivers_license']);
    expect(kindsFor('vaccination')).toEqual(['vaccination']);
    // self-declared
    expect(kindsFor('non_smoker')).toBeNull();
    expect(kindsFor('pets')).toBeNull();
    expect(kindsFor('age_18')).toBeNull();
    expect(kindsFor('references')).toBeNull();
    expect(kindsFor('custom', { proof: 'self' })).toBeNull();
    expect(kindsFor('custom', { proof: 'document' })).toContain('other');
  });
  it('lists her matching cards, current ones first', () => {
    const creds = [
      { id: 'old', kind: 'first_aid', expires_on: '2026-09-01' },
      { id: 'inf', kind: 'cpr_infant', expires_on: '2027-01-01' },
      { id: 'new', kind: 'first_aid', expires_on: '2028-03-01' },
      { id: 'child', kind: 'cpr_child', expires_on: null },
    ];
    expect(matchingCredentials(['first_aid', 'cpr_child'], creds, TODAY).map((m) => [m.cred.id, m.expired])).toEqual([
      ['child', false],
      ['new', false],
      ['old', true],
    ]);
    expect(matchingCredentials(null, creds, TODAY)).toEqual([]);
  });
  it('opens the matching S15 tile from Add new', () => {
    expect(addKindFor(['first_aid', 'cpr_child'])).toBe('first_aid');
    expect(addKindFor(['background_check'])).toBe('background_check');
    expect(addKindFor(null)).toBeNull();
  });
});

describe('parent status', () => {
  it('labels every state', () => {
    expect(parentState(row('cpr_first_aid', null), TODAY)).toBe('not_asked');
    expect(parentState(row('cpr_first_aid', { status: 'asked' }), TODAY)).toBe('asked');
    expect(parentState(row('cpr_first_aid', { status: 'shared', credential: card('2028-01-01') }), TODAY)).toBe('shared');
    expect(parentState(row('cpr_first_aid', { status: 'met', credential: card('2028-01-01') }), TODAY)).toBe('met');
    expect(parentState(row('cpr_infant', { status: 'declined' }), TODAY)).toBe('declined');
    expect(parentState(row('lang', null, { language: true, speaks: true }), TODAY)).toBe('speaks');
    expect(Object.values(STATE_LABEL).slice(0, 6)).toEqual(['Not asked', 'Asked', 'Shared, see it', 'Looks good ✓', 'Doesn’t have it', 'Expired']);
  });
  it('reads Expired once the shared card ran out, even after Looks good', () => {
    expect(isExpired('2026-10-06', TODAY)).toBe(true);
    expect(isExpired('2026-10-07', TODAY)).toBe(false);
    expect(isExpired(null, TODAY)).toBe(false);
    expect(parentState(row('cpr_first_aid', { status: 'met', credential: card('2026-10-01') }), TODAY)).toBe('expired');
    expect(parentState(row('cpr_first_aid', { status: 'shared', credential: card('2026-10-01') }), TODAY)).toBe('expired');
  });
  it('counts only Looks good (and a language on her profile) as met', () => {
    expect(countsAsMet(row('cpr_first_aid', { status: 'met', credential: card('2028-01-01') }), TODAY)).toBe(true);
    expect(countsAsMet(row('non_smoker', { status: 'met', kinds: null }), TODAY)).toBe(true);
    expect(countsAsMet(row('cpr_first_aid', { status: 'shared', credential: card('2028-01-01') }), TODAY)).toBe(false);
    expect(countsAsMet(row('cpr_first_aid', { status: 'asked' }), TODAY)).toBe(false);
    expect(countsAsMet(row('cpr_first_aid', { status: 'met', credential: card('2026-01-01') }), TODAY)).toBe(false);
    expect(countsAsMet(row('cpr_first_aid', null), TODAY)).toBe(false);
    expect(countsAsMet(row('lang', null, { language: true, speaks: true }), TODAY)).toBe(true);
  });
  it('pre-checks the must-haves she has not shared', () => {
    const rows = [
      row('cpr_first_aid', null),
      row('cpr_infant', { status: 'met', credential: card('2028-01-01') }),
      row('non_smoker', { status: 'shared', kinds: null }),
      row('pets', { status: 'declined', kinds: null }),
      row('water_safety', null, { level: 'prefer' }),
      row('language:Spanish', null, { language: true, speaks: false, level: 'prefer' }),
      row('vaccination', { status: 'met', credential: card('2026-01-01') }),
    ];
    expect(askable(rows, TODAY).map((r) => r.key)).toEqual(['cpr_first_aid', 'pets', 'water_safety', 'vaccination']);
    expect(askDefaults(rows, TODAY)).toEqual(['cpr_first_aid', 'pets', 'vaccination']);
    expect(progressLine(rows, TODAY)).toBe('1 of 5 look good · 1 to look at');
    expect(askLabel('Maya', rows, TODAY)).toBe('Ask Maya');
    expect(askLabel('Maya', [rows[1]], TODAY)).toBe('');
    expect(progressLine([rows[1]], TODAY)).toBe('All 1 look good');
  });
});

describe('sitter side', () => {
  it('writes the Needs you line', () => {
    expect(askedLine('The Lee family', ['CPR and First Aid', 'Infant CPR'])).toBe('The Lee family asked for: CPR and First Aid, Infant CPR');
  });
  it('lists what still waits for her', () => {
    const reqs = [
      request({ id: 'a', status: 'asked' }),
      request({ id: 'b', status: 'shared', credential: card('2028-01-01') }),
      request({ id: 'c', status: 'met', credential: card('2026-01-01') }),
      request({ id: 'd', status: 'declined' }),
    ];
    expect(waitingOnHer(reqs, TODAY).map((q) => q.id)).toEqual(['a', 'c']);
    expect(reqs.map((q) => sitterState(q, TODAY))).toEqual(['asked', 'shared', 'expired', 'declined']);
  });
  it('sub-lines', () => {
    expect(sitterSub(request({ note: 'For Mia' }), TODAY)).toBe('“For Mia”');
    expect(sitterSub(request(), TODAY)).toBe('Share a photo of your card');
    expect(sitterSub(request({ kinds: null }), TODAY)).toBe('Confirm it for this family');
    expect(sitterSub(request({ status: 'shared', credential: card('2028-01-01') }), TODAY)).toBe('CPR and First Aid · they’ll take a look');
    expect(sitterSub(request({ status: 'met', reviewed_by: 'Jen' }), TODAY)).toBe('Jen saw it');
    expect(sitterSub(request({ status: 'declined', sitter_note: 'Class on Nov 2' }), TODAY)).toBe('“Class on Nov 2”');
  });
  it('self-declared confirmations and age', () => {
    expect(selfPrompt('non_smoker', 'Non-smoker')).toBe('I don’t smoke or vape.');
    expect(selfPrompt('pets', 'OK with pets')).toBe('I’m OK with pets.');
    expect(selfPrompt('custom', 'Swims')).toBe('Yes: Swims');
    expect(ageCheck(null, TODAY)).toBeNull();
    expect(ageCheck('2002-03-01', TODAY)).toEqual({ ok: true, line: 'Your birthday says you’re 24.' });
    expect(ageCheck('2008-10-08', TODAY)?.ok).toBe(false);
    expect(ageCheck('2008-10-07', TODAY)?.ok).toBe(true);
  });
});

describe('viewer', () => {
  it('US dates', () => {
    expect(usDate('2026-06-01')).toBe('06/01/2026');
    expect(datesLine({ issued_on: '2025-06-01', expires_on: '2027-06-01' }, TODAY)).toBe('Issued 06/01/2025 · Expires 06/01/2027');
    expect(datesLine({ issued_on: null, expires_on: '2026-09-01' }, TODAY)).toBe('Expired 09/01/2026');
    expect(isPdf('x/cards/report.PDF')).toBe(true);
    expect(isPdf('x/cards/a.jpg')).toBe(false);
  });
});

describe('parent sub-lines', () => {
  it('reads like P11', () => {
    expect(parentSub(row('background_check', null), TODAY)).toBe('Not asked yet');
    expect(parentSub(row('cpr_first_aid', { status: 'asked', asked_at: '2026-10-06' }), TODAY)).toBe('Asked Oct 6');
    expect(parentSub(row('cpr_first_aid', { status: 'shared', shared_at: '2026-10-07', credential: card('2028-01-01') }), TODAY)).toBe('Shared Oct 7 · tap to see it');
    expect(parentSub(row('cpr_infant', { status: 'met', reviewed_by: 'Jen', credential: card('2026-10-22') }), TODAY)).toBe('Jen said it looks good · expires Oct 22');
    expect(parentSub(row('cpr_infant', { status: 'met', reviewed_by: 'Jen', credential: card('2028-10-22') }), TODAY)).toBe('Jen said it looks good');
    expect(parentSub(row('cpr_infant', { status: 'declined', sitter_note: 'Booked a class for Nov 2' }), TODAY)).toBe('“Booked a class for Nov 2”');
    expect(parentSub(row('cpr_infant', { status: 'met', credential: card('2026-09-30') }), TODAY)).toBe('Expired Sep 30');
  });
});

describe('helper line', () => {
  it('names the parents', () => {
    expect(decidesLine(['Jen', 'Sam'])).toBe('Jen and Sam decide if it looks good.');
    expect(decidesLine(['Jen'])).toBe('Jen decides if it looks good.');
    expect(decidesLine([])).toBe('A parent in your family decides if it looks good.');
  });
});
