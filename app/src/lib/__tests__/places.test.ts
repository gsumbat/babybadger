import { describe, expect, it } from '@jest/globals';

import { daysLabel, defaultHomeFor, distanceFt, insidePlace, placeForShift, placesCountLabel, storedDays, storedKidIds, type Place } from '../places-logic';

function place(extra: Partial<Place>): Place {
  return { id: 'x', family_id: 'f', kind: 'home', name: 'Home', address: null, lat: 27.93, lng: -82.48, radius_ft: 150, kid_ids: null, days: null, is_main: false, show_address: true, notes: null, ...extra };
}

describe('places', () => {
  it('measures distance in feet', () => {
    expect(distanceFt({ lat: 0, lng: 0 }, { lat: 0, lng: 0 })).toBe(0);
    // one degree of latitude is about 364,000 ft
    expect(distanceFt({ lat: 27, lng: -82 }, { lat: 28, lng: -82 })).toBeGreaterThan(362_000);
    expect(distanceFt({ lat: 27, lng: -82 }, { lat: 28, lng: -82 })).toBeLessThan(366_000);
    const home = place({});
    expect(insidePlace(home, { lat: 27.9301, lng: -82.48 })).toBe(true); // ~36 ft
    expect(insidePlace(home, { lat: 27.932, lng: -82.48 })).toBe(false); // ~730 ft
    expect(insidePlace(place({ lat: null }), { lat: 27.93, lng: -82.48 })).toBe(false);
  });

  it('labels days like P56', () => {
    expect(daysLabel([1, 2, 3, 4])).toBe('Mon – Thu');
    expect(daysLabel([5, 6, 0])).toBe('Fri – Sun');
    expect(daysLabel(null)).toBe('Every day');
    expect(daysLabel([4])).toBe('Thu');
    expect(daysLabel([1, 3])).toBe('Mon, Wed');
  });

  it('picks the home for a shift', () => {
    const main = place({ id: 'main', is_main: true, days: [1, 2, 3, 4] });
    const sams = place({ id: 'sams', name: "Sam's apartment", days: [5, 6, 0], created_at: '2026-10-02' });
    const school = place({ id: 'school', kind: 'place', days: [1, 2, 3, 4, 5] });
    const all = [sams, school, main];
    expect(placeForShift(all, { place_id: null })?.id).toBe('main');
    expect(placeForShift(all, { place_id: 'sams' })?.id).toBe('sams');
    expect(placeForShift(all, { place_id: 'school' })?.id).toBe('main');
    expect(defaultHomeFor(all, new Date(2026, 9, 9))?.id).toBe('sams'); // Friday
    expect(defaultHomeFor(all, new Date(2026, 9, 6))?.id).toBe('main'); // Tuesday
    expect(defaultHomeFor([], new Date())).toBeUndefined();
  });

  it('stores every kid / every day as null', () => {
    expect(storedKidIds(['a', 'b'], ['a', 'b'])).toBeNull();
    expect(storedKidIds([], ['a', 'b'])).toBeNull();
    expect(storedKidIds(['b'], ['a', 'b'])).toEqual(['b']);
    expect(storedDays([0, 1, 2, 3, 4, 5, 6])).toBeNull();
    expect(storedDays([5, 0, 6])).toEqual([0, 5, 6]);
    expect(placesCountLabel([place({}), place({}), place({ kind: 'place' })])).toBe('2 homes, 1 place');
    expect(placesCountLabel([])).toBe('None yet');
  });
});
