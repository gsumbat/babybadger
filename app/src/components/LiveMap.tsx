// Web / fallback: maps need a native build. Shows the latest position as text and a simple route sketch.
import { StyleSheet, View } from 'react-native';

import { routeLengthM } from '@/lib/shift-logic';
import type { LocationPoint } from '@/lib/types';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

export function LiveMap({ points, height = 220, flush }: { points: LocationPoint[]; height?: number; flush?: boolean }) {
  const last = points[points.length - 1];
  // Sketch the route inside the box so the shape is visible without a map.
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const spanLat = maxLat - minLat || 1;
  const spanLng = maxLng - minLng || 1;
  return (
    <View style={[s.box, { height }, flush && { borderRadius: 0 }]} accessibilityLabel={last ? `Last location ${last.lat.toFixed(4)}, ${last.lng.toFixed(4)}` : 'No location yet'}>
      {points.map((p, i) => (
        <View
          key={p.id}
          style={[
            s.dot,
            i === points.length - 1 ? s.dotLast : null,
            { left: `${8 + ((p.lng - minLng) / spanLng) * 84}%`, top: `${8 + (1 - (p.lat - minLat) / spanLat) * 76}%` },
          ]}
        />
      ))}
      <Text style={s.caption}>
        {last
          ? `${last.lat.toFixed(4)}, ${last.lng.toFixed(4)} · ${new Date(last.recorded_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · ${(routeLengthM(points) / 1609).toFixed(1)} mi`
          : 'Waiting for the first location…'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderRadius: 20, backgroundColor: '#E7EDEB', overflow: 'hidden', justifyContent: 'flex-end' },
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: color.primary, opacity: 0.5 },
  dotLast: { width: 18, height: 18, borderRadius: 9, opacity: 1, borderWidth: 3, borderColor: '#FFFFFF' },
  caption: { margin: 10, alignSelf: 'flex-end', backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, fontFamily: font.body, fontSize: 12, color: color.ink2 },
});
