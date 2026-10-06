// Web / fallback for ZoneMap (maps need a native build): a plain box that sketches the zones, the route and "you"
// in their real positions, with the wireframes' white name labels (P8 "Home" / "Soccer fields", S22 "Lee home").
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { LatLng } from '@/lib/places-logic';
import type { LocationPoint } from '@/lib/types';
import { color, font } from '@/theme';

export type MapZone = { id: string; lat: number; lng: number; radius_ft: number; label: string; tone: 'home' | 'dest' };

export function ZoneMap({ zones, points = [], you, height = 250, flush, youLabel }: { zones: MapZone[]; points?: LocationPoint[]; you?: LatLng | null; height?: number; flush?: boolean; youLabel?: string }) {
  const all: LatLng[] = [...zones, ...points, ...(you ? [you] : [])];
  if (!all.length) return <View style={[s.box, { height }, flush && { borderRadius: 0 }]} />;
  const lats = all.map((p) => p.lat);
  const lngs = all.map((p) => p.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const spanLat = maxLat - minLat || 1;
  const spanLng = maxLng - minLng || 1;
  const pos = (p: LatLng) => ({ left: `${10 + ((p.lng - minLng) / spanLng) * 80}%` as const, top: `${12 + (1 - (p.lat - minLat) / spanLat) * 70}%` as const });
  const last = points[points.length - 1];
  return (
    <View style={[s.box, { height }, flush && { borderRadius: 0 }]}>
      {points.map((p) => (
        <View key={p.id} style={[s.dot, pos(p)]} />
      ))}
      {zones.map((z) => (
        <View key={z.id} style={[s.anchor, pos(z)]}>
          <View style={[s.zone, z.tone === 'dest' ? s.zoneDest : s.zoneHome]} />
          <Text style={s.label}>{z.label}</Text>
        </View>
      ))}
      {last && !you ? <View style={[s.me, pos(last)]} /> : null}
      {you ? (
        <View style={[s.anchor, pos(you)]}>
          <View style={s.me} />
          {youLabel ? <Text style={s.label}>{youLabel}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

// Values from wireframes P8 / S22 (map ground, zone rings, white labels).
const s = StyleSheet.create({
  box: { borderRadius: 20, backgroundColor: '#E7EDEB', overflow: 'hidden' },
  anchor: { position: 'absolute', alignItems: 'center', gap: 6, transform: [{ translateX: -12 }, { translateY: -12 }] },
  zone: { width: 24, height: 24, borderRadius: 12, borderWidth: 3, borderColor: '#FFFFFF' },
  zoneHome: { backgroundColor: color.primary },
  zoneDest: { backgroundColor: color.accent },
  dot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: color.primary, opacity: 0.6 },
  me: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#2F6FD6', borderWidth: 3, borderColor: '#FFFFFF' },
  label: { backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, fontFamily: font.bodyBold, fontSize: 12, color: color.ink, overflow: 'hidden' },
});
