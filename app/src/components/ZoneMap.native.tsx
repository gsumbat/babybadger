// Native map for trips (P8) and the clock-in zone (S22): zone circles, the route since the trip started and "you".
// iOS ignores custom pin colors in Expo Go builds; circles carry the colors instead.
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';

import type { LatLng } from '@/lib/places-logic';
import type { LocationPoint } from '@/lib/types';
import { color } from '@/theme';

import type { MapZone } from './ZoneMap';

export type { MapZone } from './ZoneMap';

const FT_TO_M = 0.3048;

export function ZoneMap({ zones, points = [], you, height = 250, flush, youLabel }: { zones: MapZone[]; points?: LocationPoint[]; you?: LatLng | null; height?: number; flush?: boolean; youLabel?: string }) {
  const ref = useRef<MapView>(null);
  const last = points[points.length - 1];
  const all = [...zones, ...points, ...(you ? [you] : [])].map((p) => ({ latitude: p.lat, longitude: p.lng }));
  const key = all.length;

  useEffect(() => {
    if (!all.length) return;
    ref.current?.fitToCoordinates(all, { edgePadding: { top: 60, right: 50, bottom: 60, left: 50 }, animated: true });
    // refit when a point is added
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const first = all[0];
  return (
    <View style={{ height, borderRadius: flush ? 0 : 20, overflow: 'hidden', backgroundColor: '#E7EDEB' }}>
      <MapView
        ref={ref}
        style={{ flex: 1 }}
        initialRegion={first ? { ...first, latitudeDelta: 0.03, longitudeDelta: 0.03 } : undefined}
        showsUserLocation={false}
        toolbarEnabled={false}>
        {zones.map((z) => (
          <Circle
            key={z.id}
            center={{ latitude: z.lat, longitude: z.lng }}
            radius={z.radius_ft * FT_TO_M}
            strokeColor={z.tone === 'dest' ? color.accent : color.primary}
            fillColor={z.tone === 'dest' ? 'rgba(232,185,190,0.18)' : 'rgba(71,105,138,0.12)'}
            strokeWidth={2}
          />
        ))}
        {zones.map((z) => (
          <Marker key={`m-${z.id}`} coordinate={{ latitude: z.lat, longitude: z.lng }} title={z.label} pinColor={z.tone === 'dest' ? color.accent : color.primary} />
        ))}
        {points.length > 1 && <Polyline coordinates={points.map((p) => ({ latitude: p.lat, longitude: p.lng }))} strokeColor={color.primary} strokeWidth={5} />}
        {you ? <Marker coordinate={{ latitude: you.lat, longitude: you.lng }} title={youLabel} pinColor="#2F6FD6" /> : last ? <Marker coordinate={{ latitude: last.lat, longitude: last.lng }} pinColor={color.primary} /> : null}
      </MapView>
    </View>
  );
}
