import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { LockedMap } from '@/components/billing';
import { ErrorText, Icon, Loading, Screen } from '@/components/ui';
import { type MapZone, ZoneMap } from '@/components/ZoneMap';
import { usePlan } from '@/lib/billing';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { errorText } from '@/lib/supabase';
import { placesOrEmpty, tripDest, tripEta, tripHeading, tripsApi, tripSteps, tripSub, useTripLive } from '@/lib/trips';
import { color, font } from '@/theme';

// Wireframe P8 "Trip in progress", translated from its HTML (app/src/wireframes/P8.tsx). Opened from a trip push
// (C2), a trip row on Alerts (P9) and the "On a trip" pill on the live Home (P4). The map shows the home and
// destination zones and the route since the trip started (a sketch on the web preview). Left out: Call (no phone
// number stored; its slot stays empty). Not drawn: the pill and heading for the other states (waiting / arrived /
// ended) and the Not now / Let her go buttons on a "Somewhere else" trip that waits for a parent.
export default function TripView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trip, points, error } = useTripLive(id);
  const fid = trip?.family_id;
  const { data } = useQuery(async () => {
    if (!trip) return null;
    const [places, kids, people] = await Promise.all([placesOrEmpty(trip.family_id), api.kids(trip.family_id), api.profilesById([trip.sitter_id])]);
    return { places, kids, sitter: firstName(people[trip.sitter_id]?.full_name) };
  }, [fid, trip?.sitter_id]);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [busy, setBusy] = useState<'yes' | 'no'>();
  const back = () => (router.canGoBack() ? router.back() : router.replace('/parent'));
  const plan = usePlan();

  // No plan (billing on): trips are paused (P40), the map shows the P4l lock.
  if (!plan.hasPlan)
    return (
      <Screen title="Trip" back onBack={back}>
        <View style={{ borderRadius: 24, overflow: 'hidden' }}>
          <LockedMap height={320} />
        </View>
      </Screen>
    );
  if (!trip || !data) return error ? <Screen title="Trip" back onBack={back}><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const { places, kids, sitter } = data;
  const dest = tripDest(trip, places);
  const destPlace = places.find((p) => p.id === trip.place_id);
  const start = places.find((p) => p.id === trip.start_place_id);
  const last = points[points.length - 1];
  const eta = tripEta(trip, destPlace, last);
  const zones: MapZone[] = [];
  if (start?.lat != null && start.lng != null) zones.push({ id: start.id, lat: start.lat, lng: start.lng, radius_ft: start.radius_ft, label: start.kind === 'home' ? 'Home' : start.name, tone: 'home' });
  if (destPlace?.lat != null && destPlace.lng != null) zones.push({ id: destPlace.id, lat: destPlace.lat, lng: destPlace.lng, radius_ft: destPlace.radius_ft, label: destPlace.name, tone: 'dest' });
  const steps = tripSteps(trip, start, dest);
  const pill = trip.status === 'pending' ? 'Waiting for you' : trip.status === 'active' ? 'On a trip' : trip.status === 'arrived' ? 'Arrived' : 'Trip ended';

  async function answer(ok: boolean) {
    setBusy(ok ? 'yes' : 'no');
    try {
      await tripsApi.answer(trip!.id, ok);
    } catch (e) {
      Alert.alert('Couldn’t answer', errorText(e));
    } finally {
      setBusy(undefined);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#E7EDEB' }}>
      <ZoneMap zones={zones} points={points} height={height} flush />
      <View style={[st.top, { top: insets.top + 16 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back} style={st.back}>
          <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
        </Pressable>
        <View style={st.pill}>
          <View style={st.pillDot} />
          <Text style={st.pillText}>{pill}</Text>
        </View>
      </View>
      <View style={st.sheet}>
        <View style={st.grabber} />
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ gap: 2, flexShrink: 1 }}>
            <Text style={st.title}>{tripHeading(trip, dest)}</Text>
            <Text style={st.sub}>{tripSub(trip, sitter, kids)}</Text>
          </View>
          {eta ? (
            <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
              <Text style={st.eta}>{eta.min} min</Text>
              <Text style={st.etaSub}>arrive ~{eta.at}</Text>
            </View>
          ) : null}
        </View>
        <View>
          {steps.map((s, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ width: 16, alignItems: 'center' }}>
                <View style={[st.node, i === 0 ? (s.done ? st.nodeOk : st.nodeOpen) : s.done ? st.nodeDest : st.nodeOpenDest]} />
                {i < steps.length - 1 ? <View style={st.stem} /> : null}
              </View>
              <View style={{ flexShrink: 1 }}>
                <Text style={st.stepTitle}>{s.title}</Text>
                <Text style={st.stepSub}>{s.sub}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {trip.status === 'pending' ? (
            <>
              <Pressable accessibilityRole="button" onPress={busy ? undefined : () => answer(false)} style={st.btn}>
                {busy === 'no' ? <ActivityIndicator color={color.primary} /> : <Text style={st.btnText}>Not now</Text>}
              </Pressable>
              <Pressable accessibilityRole="button" onPress={busy ? undefined : () => answer(true)} style={[st.btn, { backgroundColor: color.primary }]}>
                {busy === 'yes' ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[st.btnText, { color: '#FFFFFF' }]}>Let {sitter} go</Text>}
              </Pressable>
            </>
          ) : (
            <>
              <Pressable accessibilityRole="button" onPress={() => router.push(`/parent/messages?sitter=${trip.sitter_id}`)} style={st.btn}>
                <Text style={st.btnText}>Message {sitter}</Text>
              </Pressable>
              {/* "Call" needs the sitter's phone number (not stored yet): the slot stays empty. */}
              <View style={{ flexGrow: 1, flexBasis: 0 }} />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

// Values from wireframe P8.
const st = StyleSheet.create({
  top: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#FFFFFF', backgroundColor: color.primaryTint },
  pillDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.primary },
  pillText: { fontFamily: font.bodyBold, fontSize: 13, color: color.primary },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, gap: 14, paddingTop: 12, paddingHorizontal: 20, paddingBottom: 32, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: '#C3CCD5' },
  title: { fontFamily: font.display, fontSize: 20, color: color.ink },
  sub: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  eta: { fontFamily: font.display, fontSize: 24, color: color.primary, marginVertical: -5 },
  etaSub: { fontFamily: font.body, fontSize: 13, color: '#5F6D74' },
  node: { width: 12, height: 12, marginTop: 4, borderRadius: 6 },
  nodeOk: { backgroundColor: color.ok },
  nodeOpen: { borderWidth: 2, borderColor: color.ok },
  nodeDest: { backgroundColor: color.accent },
  nodeOpenDest: { borderWidth: 2, borderColor: color.accent },
  stem: { width: 2, height: 28, backgroundColor: '#DDE3EA' },
  stepTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  stepSub: { fontFamily: font.body, fontSize: 13, color: '#5F6D74' },
  btn: { flexGrow: 1, flexBasis: 0, height: 48, borderRadius: 999, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: font.displayBold, fontSize: 16, color: color.primary },
});
