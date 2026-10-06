// P57 map preview on the phone: the address centered, the zone drawn as a circle, the house pin on top.
// Not interactive (it's a preview). Without a map position yet it shows the wireframe's drawn map.
import { View } from 'react-native';
import MapView, { Circle } from 'react-native-maps';

import { color } from '@/theme';

import { MapSketch, PIcon, ZonePill, placeStyles } from './places';

const FT_TO_M = 0.3048;

export function PlaceMap({ lat, lng, radiusFt, label }: { lat: number | null; lng: number | null; radiusFt: number; label: string }) {
  if (lat == null || lng == null) return <MapSketch label={label} zone={false} />;
  const r = radiusFt * FT_TO_M;
  // The zone fills about 3/4 of the 128 px height.
  const latitudeDelta = ((2 * r) / 111_320) * 1.35;
  const region = { latitude: lat, longitude: lng, latitudeDelta, longitudeDelta: latitudeDelta };
  return (
    <View style={placeStyles.mapBox} pointerEvents="none">
      <MapView
        key={`${lat},${lng},${radiusFt}`}
        style={{ flex: 1 }}
        initialRegion={region}
        region={region}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        showsUserLocation={false}>
        <Circle center={{ latitude: lat, longitude: lng }} radius={r} strokeColor={color.primary} strokeWidth={2} fillColor="rgba(71,105,138,0.16)" />
      </MapView>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: color.primary, borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
          <PIcon name="home" size={14} tint="#FFFFFF" width={2.4} />
        </View>
      </View>
      <View style={{ position: 'absolute', right: 10, bottom: 10 }}>
        <ZonePill label={label} />
      </View>
    </View>
  );
}
