import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Text } from '@/components/Text';
import { RunningLateSheet } from '@/components/timing';
import { ErrorText, Icon, Loading, Screen } from '@/components/ui';
import { ZoneMap } from '@/components/ZoneMap';
import { api, useQuery, useShiftLive } from '@/lib/data';
import { firstName } from '@/lib/format';
import { distanceFt, insidePlace, type LatLng, placeForShift } from '@/lib/places';
import { useSession } from '@/lib/session';
import { clockInState } from '@/lib/shift-logic';
import { errorText } from '@/lib/supabase';
import { clockInShift, currentPosition, distanceLabel, homeTitle, placesOrEmpty, tripsApi, useAwayRequest, zoneLine } from '@/lib/trips';
import { cardShadow, color, font } from '@/theme';

// Wireframe S22 "Clock-in blocked", translated from its HTML (app/src/wireframes/S22.tsx). Opened from the shift page's
// Clock in (S4b) when she's outside the shift's home zone (migration 16 places, radius_ft). "Clock in when I arrive" watches her
// position while this screen is open and clocks her in at the door. "Starting somewhere else?" asks the parents
// (migration 17); once one says yes she can clock in here. Running late opens S21.
// Not drawn: the waiting / yes / no lines on "Starting somewhere else?" and the yes-state tap that clocks in.
const PIN = (stroke: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>`;

export default function ClockInBlocked() {
  const { shiftId } = useLocalSearchParams<{ shiftId: string }>();
  const { sitterLinks } = useSession();
  const { bundle, error } = useShiftLive(shiftId);
  const shift = bundle?.shift;
  const fid = shift?.family_id;
  const { data: places } = useQuery(() => (fid ? placesOrEmpty(fid) : Promise.resolve([])), [fid]);
  const { data: parents } = useQuery(() => (fid ? api.familyParents(fid) : Promise.resolve([])), [fid]);
  const { request } = useAwayRequest(shiftId);
  const [you, setYou] = useState<LatLng | null>(null);
  const [auto, setAuto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lateOpen, setLateOpen] = useState(false);
  const [err, setErr] = useState('');
  const clocking = useRef(false);

  const home = places && shift ? placeForShift(places, shift as typeof shift & { place_id?: string | null }) : undefined;
  const parent = firstName(parents?.[0]?.full_name) || 'A parent';
  const family = sitterLinks.find((l) => l.family_id === fid)?.family.name ?? 'Family';

  async function clockIn() {
    if (!shift || clocking.current) return;
    clocking.current = true;
    setBusy(true);
    setErr('');
    try {
      const mode = await clockInShift(shift.id);
      if (mode === 'denied') Alert.alert('Location is off', 'The family can’t see the map until you allow location for BabyBadger in Settings.');
      // Back to the shift page (S4b), which now shows the shift running (S4).
      if (router.canGoBack()) router.back();
      else router.replace(`/sitter/shift/${shift.id}`);
    } catch (e) {
      clocking.current = false;
      if (/house rules/i.test(errorText(e))) return router.push(`/sitter/rules/${shift.family_id}`);
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  // Her position while the screen is open: the distance label, and the auto clock-in at the door.
  const autoRef = useRef(auto);
  const clockInRef = useRef(clockIn);
  useEffect(() => {
    autoRef.current = auto;
    clockInRef.current = clockIn;
  });
  useEffect(() => {
    if (!home || home.lat == null || Platform.OS === 'web') return;
    let sub: Location.LocationSubscription | null = null;
    let live = true;
    currentPosition().then((p) => live && p && setYou(p));
    Location.watchPositionAsync({ accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 10_000 }, (loc) => {
      const at = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setYou(at);
      if (autoRef.current && shift && insidePlace(home, at) && clockInState(shift, new Date()).kind === 'open') clockInRef.current();
    })
      .then((s) => (live ? (sub = s) : s.remove()))
      .catch(() => null);
    return () => {
      live = false;
      sub?.remove();
    };
  }, [home, shift]);
  // Also clocks in when she was already at the door before clock-in opened (checked every 15 s while it's on).
  useEffect(() => {
    if (!auto || !home || !shift) return;
    const tick = () => {
      if (you && insidePlace(home, you) && clockInState(shift, new Date()).kind === 'open') clockInRef.current();
    };
    tick();
    const t = setInterval(tick, 15_000);
    return () => clearInterval(t);
  }, [auto, home, shift, you]);

  if (!bundle || !places) return error ? <Screen title="Clock in" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  if (!home || home.lat == null || home.lng == null) {
    // No home with a map position: nothing to check (S4b clocks in directly); only reached from an old link.
    return (
      <Screen title="Clock in" back>
        <Text style={st.body}>This family hasn’t saved their home on the map yet, so you can clock in from the shift page.</Text>
      </Screen>
    );
  }

  const away = you ? distanceFt({ lat: home.lat, lng: home.lng }, you) : null;
  const askSub =
    request?.status === 'approved'
      ? 'Tap to clock in where you are.'
      : request?.status === 'pending'
        ? `Asked ${parent} · waiting for an answer`
        : request?.status === 'declined'
          ? `${parent} said no. Clock in at the home.`
          : 'Like school pickup. A parent approves it.';

  function ask() {
    if (request?.status === 'approved') return clockIn();
    if (request?.status === 'pending') return;
    Alert.alert(`Ask ${parent}?`, `${parent} gets an alert and can let you clock in where you are.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Ask', onPress: () => tripsApi.requestAway(shiftId).catch((e) => setErr(errorText(e))) },
    ]);
  }

  return (
    <Screen
      title="Clock in"
      back
      gap={12}
      footer={
        <Pressable accessibilityRole="button" onPress={() => setLateOpen(true)} style={st.late}>
          <Text style={st.lateText}>Running late</Text>
        </Pressable>
      }>
      <ZoneMap zones={[{ id: home.id, lat: home.lat, lng: home.lng, radius_ft: home.radius_ft, label: home.name, tone: 'home' }]} you={you} youLabel={away != null ? `You · ${distanceLabel(away)} away` : 'You'} height={250} />
      <Text style={st.title}>You&apos;re not at {homeTitle(home)} yet</Text>
      <Text style={st.body}>{zoneLine(home)}</Text>
      <Pressable accessibilityRole="switch" accessibilityState={{ checked: auto }} onPress={() => setAuto(!auto)} style={st.card}>
        <View style={{ flexShrink: 1 }}>
          <Text style={st.cardTitle}>Clock in when I arrive</Text>
          <Text style={st.cardSub}>{auto && Platform.OS !== 'web' ? 'Keep this screen open' : 'Starts the timer at the door'}</Text>
        </View>
        {busy ? (
          <ActivityIndicator color={color.primary} />
        ) : (
          <View style={[st.track, { backgroundColor: auto ? color.primary : '#C3CCD5' }]}>
            <View style={[st.knob, auto ? { right: 3 } : { left: 3 }]} />
          </View>
        )}
      </Pressable>
      <Pressable accessibilityRole="button" onPress={ask} style={[st.card, { justifyContent: 'flex-start' }]}>
        <View style={st.pinBox}>
          <SvgXml xml={PIN(color.primary)} width={22} height={22} style={{ flexShrink: 0 }} />
        </View>
        <View style={{ flexGrow: 1, flexShrink: 1 }}>
          <Text style={st.cardTitle}>{request?.status === 'approved' ? `${parent} said yes` : 'Starting somewhere else?'}</Text>
          <Text style={st.cardSub}>{askSub}</Text>
        </View>
        <Icon name="chevron-right" size={18} tint={color.ink2} />
      </Pressable>
      <ErrorText>{err}</ErrorText>
      <RunningLateSheet open={lateOpen} onClose={() => setLateOpen(false)} onCancelled={() => router.replace('/sitter')} shift={bundle.shift} family={family} tasks={bundle.tasks} />
    </Screen>
  );
}

// Values from wireframe S22.
const st = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 24, lineHeight: 28, color: color.ink, marginTop: 2 },
  body: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  cardTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  cardSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  track: { width: 50, height: 30, borderRadius: 15, flexShrink: 0 },
  knob: { position: 'absolute', top: 3, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF' },
  pinBox: { width: 36, height: 36, borderRadius: 14, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  late: { height: 54, borderRadius: 999, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  lateText: { fontFamily: font.displayBold, fontSize: 17, color: color.primary },
});
