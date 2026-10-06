// Care plan pieces shared by P7, P20 and P20a: the type icons (from wireframe P20a) and their tile colors (P20).
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import type { CareType } from '@/lib/types';

const PATHS: Record<CareType, string> = {
  nap: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  bottle: '<path d="M9 2.5h6M10 2.5v3l-2 2.5V20a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 16 20V8l-2-2.5v-3"/><path d="M8 12h8"/>',
  meal: '<path d="M5 3v8a2 2 0 0 0 2 2v8M9 3v8a2 2 0 0 1-2 2M7 3v6M16 21V3c2.5 1.5 3.5 4 3.5 7s-1.5 4-3.5 4"/>',
  diaper: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  bedtime: '<path d="M3 12h18v2a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6z"/><path d="M6 12V5.5A2.5 2.5 0 0 1 10.5 4"/>',
  medicine: '<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="M9.5 8.5l5 7"/>',
  activity: '<circle cx="12" cy="12" r="9"/><path d="M3.5 9.5c5 1 12 1 17 0M3.5 14.5c5-1 12-1 17 0"/>',
  other: '<path d="M12 5v14M5 12h14"/>',
};

export function careIconXml(type: CareType, stroke: string) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${PATHS[type]}</svg>`;
}

// P20 draws nap (lilac), bottle (blush) and diaper / bedtime (blue). Meal shares the bottle's food color (P7's
// "Food" tag); medicine, activity and other use the blue.
const BLUE = { bg: '#DCE7F1', fg: '#47698A' };
const FOOD = { bg: '#F3E1E3', fg: '#7A4E0E' };
export const CARE_TINT: Record<CareType, { bg: string; fg: string }> = {
  nap: { bg: '#E0D8F5', fg: '#5B3FA8' },
  bottle: FOOD,
  meal: FOOD,
  diaper: BLUE,
  bedtime: BLUE,
  medicine: BLUE,
  activity: BLUE,
  other: BLUE,
};

/** P20's 34px rounded tile with the type icon. */
export function CareIcon({ type }: { type: CareType }) {
  const t = CARE_TINT[type];
  return (
    <View style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 14, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
      <SvgXml xml={careIconXml(type, t.fg)} width={22} height={22} />
    </View>
  );
}
