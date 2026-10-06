import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { KidDot } from '@/components/bits';
import { Text, TextInput } from '@/components/Text';
import { Button, ErrorText, Loading, Screen, SheetHeader } from '@/components/ui';
import { api, useQuery, useShiftLive } from '@/lib/data';
import { firstName } from '@/lib/format';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { destOptions, MODES, placeAt, placesOrEmpty, type TripMode, tripsApi } from '@/lib/trips';
import { color, font } from '@/theme';

// Wireframe S8 "Start a trip", translated from its HTML (app/src/wireframes/S8.tsx). Opened from S4's Trip tile, as a
// sheet over the shift. "Where to?" lists the family's saved places (a place named in one of today's tasks comes
// first with "On today's plan · 4:10 PM"; the place she's in now is left out), then "Somewhere else", which the
// parents approve first (migration 17). Not drawn: the name field under "Somewhere else" once it's picked.

/** S8 radio: 20 round, primary ring and dot when picked (the HTML's accent-color radio). */
function Radio({ on }: { on: boolean }) {
  return <View style={[st.radio, on && st.radioOn]}>{on ? <View style={st.radioDot} /> : null}</View>;
}

export default function StartTrip() {
  const { shiftId } = useLocalSearchParams<{ shiftId: string }>();
  const { session } = useSession();
  const { bundle, error } = useShiftLive(shiftId);
  const fid = bundle?.shift.family_id;
  const { data: places } = useQuery(() => (fid ? placesOrEmpty(fid) : Promise.resolve([])), [fid]);
  const { data: parents } = useQuery(() => (fid ? api.familyParents(fid) : Promise.resolve([])), [fid]);
  const [dest, setDest] = useState<string | 'other' | null>(null);
  const [other, setOther] = useState('');
  const [kidIds, setKidIds] = useState<string[] | null>(null);
  const [mode, setMode] = useState<TripMode>('car');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [openedAt] = useState(() => Date.now());

  // Where she is now: her latest shared point (sent every minute while on shift).
  const last = bundle?.points[bundle.points.length - 1];
  const fresh = last && openedAt - +new Date(last.recorded_at) < 15 * 60_000 ? { lat: last.lat, lng: last.lng } : null;
  const here = places ? placeAt(places, fresh)?.id : undefined;
  const options = places && bundle ? destOptions(places, bundle.tasks.filter((t) => !t.done_at), here) : [];
  const first = options[0]?.id ?? 'other';
  useEffect(() => {
    // pick the first destination once the places and the shift's plan have both loaded
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (places && bundle && dest === null) setDest(first);
  }, [places, bundle, dest, first]);
  const kids = bundle?.kids ?? [];
  const chosen = kidIds ?? kids.map((k) => k.id);
  const parent = firstName(parents?.[0]?.full_name) || 'The family';

  if (!bundle || !places) return error ? <Screen title="Start a trip" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;

  const ready = dest !== null && (dest !== 'other' || other.trim().length > 0);

  async function start() {
    if (!ready) return;
    setBusy(true);
    setErr('');
    try {
      await tripsApi.start({ shiftId, sitterId: session!.user.id, placeId: dest === 'other' ? null : dest, customDest: other, kidIds: chosen, mode });
      router.back();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  const toggleKid = (id: string) => setKidIds(chosen.includes(id) ? chosen.filter((k) => k !== id) : [...chosen, id]);

  return (
    <Screen
      bleedTop
      bg={color.surface}
      gap={16}
      header={<SheetHeader title="Start a trip" />}
      footer={
        <>
          <Button label="Start trip" onPress={start} busy={busy} disabled={!ready} />
          <Text style={st.foot}>{dest === 'other' ? `${parent} is asked first, then gets an alert when you leave.` : `${parent} gets an alert when you leave and when you arrive.`}</Text>
        </>
      }>
      <View style={{ gap: 8 }}>
        <Text style={st.label}>Where to?</Text>
        {options.map((o) => {
          const on = dest === o.id;
          return (
            <Pressable key={o.id} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => setDest(o.id)} style={on ? st.optOn : st.opt}>
              <Radio on={on} />
              <View style={[st.circle, { backgroundColor: on ? color.accent : color.accentTint }]} />
              <View style={{ flexShrink: 1 }}>
                <Text style={on ? st.optTitleOn : st.optTitle}>{o.name}</Text>
                {o.sub ? <Text style={st.optSubOn}>{o.sub}</Text> : null}
              </View>
            </Pressable>
          );
        })}
        <Pressable accessibilityRole="radio" accessibilityState={{ checked: dest === 'other' }} onPress={() => setDest('other')} style={[st.other, dest === 'other' && { borderColor: color.primary, backgroundColor: color.primaryTint }]}>
          <Radio on={dest === 'other'} />
          <View style={{ flexShrink: 1 }}>
            <Text style={st.optTitle}>Somewhere else</Text>
            <Text style={st.otherSub}>Parents are asked first</Text>
          </View>
        </Pressable>
        {dest === 'other' && (
          <TextInput value={other} onChangeText={setOther} placeholder="Where are you going?" placeholderTextColor={color.quiet} maxLength={120} autoFocus style={st.input} />
        )}
      </View>

      {kids.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={st.label}>Who&apos;s coming</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {kids.map((k) => {
              const on = chosen.includes(k.id);
              return (
                <Pressable key={k.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => toggleKid(k.id)} style={[st.kid, on && st.kidOn]}>
                  <KidDot kid={k} size={30} />
                  <Text style={st.kidText}>{k.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <View style={st.seg}>
        {MODES.map((m) => (
          <Pressable key={m.value} accessibilityRole="button" accessibilityState={{ selected: mode === m.value }} onPress={() => setMode(m.value)} style={[st.segItem, mode === m.value && { backgroundColor: '#FFFFFF' }]}>
            <Text style={mode === m.value ? st.segOn : st.segOff}>{m.label}</Text>
          </Pressable>
        ))}
      </View>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

// Values from wireframe S8.
const st = StyleSheet.create({
  label: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: color.line },
  optOn: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingHorizontal: 14, borderRadius: 999, borderWidth: 2, borderColor: color.primary, backgroundColor: color.primaryTint },
  circle: { width: 32, height: 32, borderRadius: 16, flexShrink: 0 },
  optTitle: { fontFamily: font.bodyMedium, fontSize: 15, color: color.ink },
  optTitleOn: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  optSubOn: { fontFamily: font.body, fontSize: 13, color: color.primaryStrong },
  other: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 14, borderRadius: 999, borderWidth: 2, borderColor: '#C9D3DD', borderStyle: 'dashed' },
  otherSub: { fontFamily: font.body, fontSize: 13, color: '#5F6D74' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: color.quiet, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioOn: { borderColor: color.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: color.primary },
  input: { minHeight: 50, borderWidth: 1, borderColor: color.lineStrong, borderRadius: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 14, fontFamily: font.body, fontSize: 16, color: color.ink },
  kid: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, paddingLeft: 4, paddingRight: 14, borderRadius: 999, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF' },
  kidOn: { borderWidth: 2, borderColor: color.primary, backgroundColor: color.accentTint },
  kidText: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  seg: { flexDirection: 'row', gap: 4, padding: 4, backgroundColor: color.muted, borderRadius: 12 },
  segItem: { flex: 1, height: 40, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  segOn: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  segOff: { fontFamily: font.body, fontSize: 15, color: color.ink2 },
  foot: { fontFamily: font.body, fontSize: 13, color: color.ink2, textAlign: 'center' },
});
