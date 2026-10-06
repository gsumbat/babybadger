import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import type { LocationPoint } from '@/lib/types';
import { color } from '@/theme';

export function LiveMap({ points, height = 220, flush }: { points: LocationPoint[]; height?: number; flush?: boolean }) {
  const ref = useRef<MapView>(null);
  const last = points[points.length - 1];

  useEffect(() => {
    if (!last) return;
    ref.current?.animateToRegion({ latitude: last.lat, longitude: last.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 400);
  }, [last]);

  return (
    <View style={{ height, borderRadius: flush ? 0 : 20, overflow: 'hidden', backgroundColor: '#E7EDEB' }}>
      <MapView
        ref={ref}
        style={{ flex: 1 }}
        initialRegion={last ? { latitude: last.lat, longitude: last.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 } : undefined}
        showsUserLocation={false}
        toolbarEnabled={false}>
        {points.length > 1 && (
          <Polyline coordinates={points.map((p) => ({ latitude: p.lat, longitude: p.lng }))} strokeColor={color.primary} strokeWidth={4} />
        )}
        {last && <Marker coordinate={{ latitude: last.lat, longitude: last.lng }} pinColor={color.primary} />}
      </MapView>
    </View>
  );
}
