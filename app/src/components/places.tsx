// Pieces shared by the Homes and places screens (wireframes P56, P57, P58).
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { kidBadge } from '@/components/bits';
import type { Kid } from '@/lib/types';
import { font } from '@/theme';
import { Text } from '@/components/Text';

const svg = (paths: string, stroke: string, width = 1.8) =>
  `<svg viewBox="0 0 24 24"><g fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;

// Icon paths copied from the wireframes.
export const PLACE_PATHS = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
  school: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
  ball: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5l4 3-1.5 4.5h-5L8 10.5z"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/><path d="M12 10v5M9.5 12.5h5"/>',
  pin: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  locate: '<path d="M12 3l7 18-7-4-7 4z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
} as const;

export function PIcon({ name, size = 20, tint, width }: { name: keyof typeof PLACE_PATHS; size?: number; tint: string; width?: number }) {
  return <SvgXml xml={svg(PLACE_PATHS[name], tint, width)} width={size} height={size} style={{ flexShrink: 0 }} />;
}

/** P56 40×40 tile: blue for the main home, pink for other homes, gray for places. */
export function PlaceTile({ icon, main, kind }: { icon: 'home' | 'school' | 'ball' | 'heart' | 'pin'; main?: boolean; kind: 'home' | 'place' }) {
  const [bg, fg] = kind === 'place' ? ['#E8ECF1', '#4B5960'] : main ? ['#DCE7F1', '#47698A'] : ['#F3E1E3', '#9A4F64'];
  return (
    <View style={[st.tile, { backgroundColor: bg }]}>
      <PIcon name={icon} size={21} tint={fg} />
    </View>
  );
}

/** P56 overlapping 22 px kid circles with a white ring. */
export function KidStack({ kids }: { kids: Pick<Kid, 'id' | 'name' | 'color'>[] }) {
  if (!kids.length) return null;
  return (
    <View style={{ flexDirection: 'row', paddingLeft: 6 }}>
      {kids.map((k) => (
        <View key={k.id} style={st.ring}>
          <View style={[st.dot, { backgroundColor: kidBadge(k).bg }]}>
            <Text style={[st.dotText, { color: kidBadge(k).ink }]}>{k.name[0]?.toUpperCase()}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** P57 map pill: "Clock-in zone · 150 ft". */
export function ZonePill({ label }: { label: string }) {
  return (
    <View style={st.pill}>
      <Text style={st.pillText}>{label}</Text>
    </View>
  );
}

/** The wireframe's drawn map (P57): green ground, white roads, the zone circle and the house pin. Used on the web
 * preview (no native maps there) and before an address has a map position (then without the zone). */
export function MapSketch({ label, height = 128, zone = true }: { label?: string; height?: number; zone?: boolean }) {
  return (
    <View style={[st.sketch, { height }]}>
      <View style={[st.road, { top: 44, height: 14, left: 0, right: 0 }]} />
      <View style={[st.road, { top: 0, bottom: 0, left: 228, width: 12 }]} />
      <View style={[st.road, { top: 98, height: 8, left: 0, right: 0 }]} />
      {zone ? (
        <View style={st.center} pointerEvents="none">
          <View style={st.zone} />
          <View style={st.pin}>
            <PIcon name="home" size={14} tint="#FFFFFF" width={2.4} />
          </View>
        </View>
      ) : null}
      {label ? (
        <View style={st.pillSpot}>
          <ZonePill label={label} />
        </View>
      ) : null}
    </View>
  );
}

/** P57 / P58 segmented pill: 34 high, 13 px labels (a little smaller than the shared Segmented). */
export function PlaceSeg<V extends string | number>({ options, value, onChange }: { options: { value: V; label: string }[]; value: V | undefined; onChange: (v: V) => void }) {
  return (
    <View style={st.seg}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={String(o.value)} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onChange(o.value)} style={[st.segItem, on && { backgroundColor: '#FFFFFF' }]}>
            <Text style={[st.segText, on && st.segTextOn]} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const placeStyles = StyleSheet.create({
  mapBox: { height: 128, borderRadius: 18, overflow: 'hidden', backgroundColor: '#E9EFE4' },
});

const st = StyleSheet.create({
  seg: { flexDirection: 'row', gap: 4, padding: 4, backgroundColor: '#E8ECF1', borderRadius: 999 },
  segItem: { flex: 1, minWidth: 0, height: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  segText: { fontFamily: font.bodyMedium, fontSize: 13, color: '#4B5960' },
  segTextOn: { fontFamily: font.bodyBold, color: '#1B2328' },
  tile: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ring: { marginLeft: -6, borderRadius: 999, borderWidth: 2, borderColor: '#FFFFFF' },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  dotText: { fontFamily: font.displayBold, fontSize: 10, color: '#FFFFFF' },
  pill: { height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#FFFFFF', justifyContent: 'center' },
  pillText: { fontFamily: font.bodyBold, fontSize: 12, color: '#1B2328' },
  pillSpot: { position: 'absolute', right: 10, bottom: 10 },
  sketch: { borderRadius: 18, overflow: 'hidden', backgroundColor: '#E9EFE4' },
  road: { position: 'absolute', backgroundColor: '#FFFFFF' },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  zone: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(71,105,138,0.16)', borderWidth: 2, borderColor: '#47698A' },
  pin: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#47698A', borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
});
