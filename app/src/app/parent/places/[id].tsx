import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { PIcon, PlaceSeg } from '@/components/places';
import { PlaceMap } from '@/components/PlaceMap';
import { Banner, ErrorText, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import {
  canGeocode,
  DAY_LETTER,
  DEFAULT_RADIUS_FT,
  geocode,
  homesOf,
  peekPlaceDraft,
  placesApi,
  RADIUS_OPTIONS,
  storedDays,
  storedKidIds,
  WEEK_MON_FIRST,
  zoneLabel,
  type Place,
  type PlaceKind,
} from '@/lib/places';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';
import { Text, TextInput } from '@/components/Text';

// Wireframe P57 Edit a home, from app/src/wireframes/P57.tsx. `/parent/places/<id>` edits a saved home or place;
// `/parent/places/draft?kind=` is a new one, filled from the address picked on P58. Design note nP14.
// Rules: one Main home per family (the database moves Main when another home takes it); the only home is always
// Main; every kid / every day is stored as null so kids added later stay included. A changed address is looked up
// on the phone's map; without a map position the home saves but sitters can't clock in there yet.
// Not drawn (no artboard yet): the same screen for an "Other place" (alert zone wording, no Main switch, no arriving
// notes); the "not found on the map" hint; the "move the upcoming shifts first" message on remove.
export default function PlaceEdit() {
  const { id, kind: kindParam } = useLocalSearchParams<{ id: string; kind?: string }>();
  const isNew = id === 'draft';
  const { family } = useSession();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const [places, kids] = await Promise.all([placesApi.list(fid), api.kids(fid)]);
    return { places, kids, place: isNew ? null : (places.find((p) => p.id === id) ?? null) };
  }, [fid, id]);

  const [form, setForm] = useState<Form | null>(null);
  const [geoFor, setGeoFor] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState<'save' | 'remove'>();
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!data || form) return;
    const f = initialForm(data.place, isNew ? peekPlaceDraft() : null, kindParam === 'place' ? 'place' : 'home', homesOf(data.places).length, data.kids.map((k) => k.id));
    // fill the form once the place has loaded
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(f);
    setGeoFor(f.lat != null ? f.address.trim() : null);
  }, [data, form, isNew, kindParam]);

  if (!data || !form) return error ? <Screen title="Home" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  if (!isNew && !data.place) return <Screen title="Home" back><ErrorText>This address was removed.</ErrorText></Screen>;

  const place = data.place;
  const home = form.kind === 'home';
  const otherHomes = homesOf(data.places).filter((h) => h.id !== place?.id);
  const onlyHome = home && otherHomes.length === 0;
  const allKids = data.kids.map((k) => k.id);
  const set = (patch: Partial<Form>) => setForm({ ...form, ...patch });

  async function locate(address: string) {
    const a = address.trim();
    if (!a || a === geoFor) return null;
    setLocating(true);
    const at = await geocode(a);
    setLocating(false);
    setGeoFor(a);
    return at;
  }

  async function lookUp() {
    if (!form) return;
    const a = form.address.trim();
    if (!canGeocode || !a || a === geoFor) return;
    const at = await locate(a);
    setForm((f) => (f && f.address.trim() === a ? { ...f, lat: at?.lat ?? null, lng: at?.lng ?? null } : f));
  }

  async function save() {
    if (!form || !form.name.trim()) return;
    setBusy('save');
    setErr('');
    try {
      let { lat, lng } = form;
      const a = form.address.trim();
      if (!a) [lat, lng] = [null, null];
      else if (a !== geoFor && canGeocode) {
        const at = await locate(a);
        [lat, lng] = [at?.lat ?? null, at?.lng ?? null];
      }
      const isMain = home && (onlyHome || form.isMain);
      const saved = await placesApi.upsert(
        fid,
        {
          kind: form.kind,
          name: form.name.trim(),
          address: a || null,
          lat,
          lng,
          radius_ft: form.radius,
          kid_ids: storedKidIds(form.kidIds, allKids),
          days: storedDays(form.days),
          is_main: isMain,
          show_address: form.showAddress,
          notes: home ? form.notes.trim() || null : (place?.notes ?? null),
        },
        place?.id,
      );
      // Main switched off on the main home: the next home becomes Main (there's always one).
      if (home && place?.is_main && !saved.is_main && otherHomes[0]) await placesApi.upsert(fid, toInput({ ...otherHomes[0], is_main: true }), otherHomes[0].id);
      router.back();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(undefined);
    }
  }

  async function remove() {
    if (!place) return;
    setBusy('remove');
    setErr('');
    try {
      if (home) {
        const upcoming = await placesApi.upcomingShiftsAt(place.id);
        if (upcoming) {
          setErr(`${upcoming === 1 ? 'A shift is' : `${upcoming} shifts are`} booked at ${place.name}. Move ${upcoming === 1 ? 'it' : 'them'} to another home first.`);
          return;
        }
      }
      await placesApi.remove(place.id);
      if (home && place.is_main && otherHomes[0]) await placesApi.upsert(fid, toInput({ ...otherHomes[0], is_main: true }), otherHomes[0].id);
      router.back();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(undefined);
    }
  }

  const title = form.name.trim() || (home ? 'Home' : 'Place');
  const noMap = form.lat == null && !!form.address.trim() && !locating;

  return (
    <Screen
      title={title}
      back
      gap={12}
      right={
        <Pressable accessibilityRole="button" onPress={save} disabled={!!busy || !form.name.trim()} style={({ pressed }) => [st.save, (!form.name.trim() || !!busy) && { opacity: 0.5 }, pressed && { opacity: 0.8 }]}>
          {busy === 'save' ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={st.saveText}>Save</Text>}
        </Pressable>
      }>
      <View style={{ gap: 6, marginTop: -4 }}>
        <Text style={st.label}>Name</Text>
        <View style={st.box}>
          <TextInput accessibilityLabel="Name" value={form.name} onChangeText={(name) => set({ name })} maxLength={80} placeholder={home ? 'Home' : 'Lincoln Elementary'} placeholderTextColor={color.quiet} style={st.input} />
        </View>
      </View>
      <View style={{ gap: 6 }}>
        <Text style={st.label}>Address</Text>
        <View style={st.box}>
          <TextInput accessibilityLabel="Address" value={form.address} onChangeText={(address) => set({ address })} onBlur={lookUp} onSubmitEditing={lookUp} returnKeyType="search" autoCorrect={false} placeholderTextColor={color.quiet} style={st.input} />
          {locating ? <ActivityIndicator size="small" color={color.ink2} /> : <PIcon name="search" size={18} tint={color.ink2} />}
        </View>
      </View>
      <PlaceMap lat={form.lat} lng={form.lng} radiusFt={form.radius} label={zoneLabel({ kind: form.kind, radius_ft: form.radius })} />
      {noMap ? (
        <Banner kind="warn" icon="map-pin">
          {canGeocode
            ? `We couldn’t find this address on the map. Check it: ${home ? 'sitters can’t clock in here' : 'arrive and leave alerts don’t work'} until it’s found.`
            : 'The map position is looked up in the app on your phone. You can save now and open it there later.'}
        </Banner>
      ) : null}
      <View style={{ gap: 8 }}>
        <Text style={st.label}>{home ? 'Clock-in zone size' : 'Alert zone size'}</Text>
        <PlaceSeg options={RADIUS_OPTIONS.map((r) => ({ value: r.ft, label: `${r.label} · ${r.ft} ft` }))} value={form.radius} onChange={(radius) => set({ radius })} />
      </View>
      <View style={[st.card, { paddingVertical: 12, gap: 10 }]}>
        <Text style={st.section}>{home ? 'WHO STAYS HERE, AND WHEN' : 'WHO GOES HERE, AND WHEN'}</Text>
        {data.kids.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {data.kids.map((k) => {
              const on = form.kidIds.includes(k.id);
              return (
                <Pressable key={k.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => set({ kidIds: on ? form.kidIds.filter((x) => x !== k.id) : [...form.kidIds, k.id] })} style={[st.chip, on ? st.chipOn : st.chipOff]}>
                  {on ? <PIcon name="check" size={16} tint={color.primaryStrong} width={2.4} /> : null}
                  <Text style={[st.chipText, { color: on ? color.primaryStrong : color.ink }]}>{k.name}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {WEEK_MON_FIRST.map((d) => {
            const on = form.days.includes(d);
            return (
              <Pressable key={d} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]} onPress={() => set({ days: on ? form.days.filter((x) => x !== d) : [...form.days, d] })} style={[st.day, on ? st.dayOn : st.dayOff]}>
                <Text style={[st.dayText, { color: on ? '#FFFFFF' : color.ink2 }]}>{DAY_LETTER[d]}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={st.small}>{home ? 'Shifts on these days start here. You can change it per shift.' : 'You get an alert when the sitter and kids arrive or leave.'}</Text>
      </View>
      <View style={[st.card, { paddingVertical: 0 }]}>
        {home ? <Switch label="Main address" sub="Shown first when you book a shift" value={onlyHome || form.isMain} onChange={(isMain) => !onlyHome && set({ isMain })} /> : null}
        <Switch label="Sitters see the address" sub={home ? 'Only during shifts at this home' : 'Only during shifts'} value={form.showAddress} onChange={(showAddress) => set({ showAddress })} last />
      </View>
      {home ? (
        <View style={{ gap: 6 }}>
          <Text style={st.label}>Arriving notes for sitters</Text>
          <View style={st.box}>
            <TextInput accessibilityLabel="Arriving notes for sitters" value={form.notes} onChangeText={(notes) => set({ notes })} maxLength={300} placeholder="Gate code · where to park" placeholderTextColor={color.quiet} style={st.input} />
          </View>
        </View>
      ) : null}
      <ErrorText>{err}</ErrorText>
      {place ? (
        <Pressable accessibilityRole="button" onPress={remove} disabled={!!busy} style={st.remove}>
          {busy === 'remove' ? <ActivityIndicator color={color.badInk} /> : <Text style={st.removeText}>Remove this address</Text>}
        </Pressable>
      ) : null}
    </Screen>
  );
}

type Form = {
  kind: PlaceKind;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  radius: number;
  kidIds: string[];
  days: number[];
  isMain: boolean;
  showAddress: boolean;
  notes: string;
};

function initialForm(p: Place | null, draft: ReturnType<typeof peekPlaceDraft>, kind: PlaceKind, homeCount: number, allKids: string[]): Form {
  if (p)
    return {
      kind: p.kind,
      name: p.name,
      address: p.address ?? '',
      lat: p.lat,
      lng: p.lng,
      radius: p.radius_ft,
      kidIds: p.kid_ids?.length ? p.kid_ids : allKids,
      days: p.days?.length ? p.days : [0, 1, 2, 3, 4, 5, 6],
      isMain: p.is_main,
      showAddress: p.show_address,
      notes: p.notes ?? '',
    };
  const k = draft?.kind ?? kind;
  return {
    kind: k,
    // The family's first home is simply "Home" (P57); anything else gets named by the parent.
    name: k === 'home' && homeCount === 0 ? 'Home' : '',
    address: draft?.address ?? '',
    lat: draft?.lat ?? null,
    lng: draft?.lng ?? null,
    radius: k === 'home' ? DEFAULT_RADIUS_FT : 300,
    kidIds: allKids,
    days: [0, 1, 2, 3, 4, 5, 6],
    isMain: k === 'home' && homeCount === 0,
    showAddress: true,
    notes: '',
  };
}

function toInput(p: Place) {
  const { id: _id, family_id: _f, created_at: _c, updated_at: _u, ...rest } = p;
  return rest;
}

/** P57 switch row: 56 high, 50×30 track. */
function Switch({ label, sub, value, onChange, last }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} accessibilityLabel={label} onPress={() => onChange(!value)} style={[st.switchRow, !last && st.line]}>
      <View style={{ flex: 1 }}>
        <Text style={st.switchTitle}>{label}</Text>
        <Text style={st.small}>{sub}</Text>
      </View>
      <View style={[st.track, { backgroundColor: value ? color.primary : color.lineStrong }]}>
        <View style={[st.knob, value ? { right: 3 } : { left: 3 }]} />
      </View>
    </Pressable>
  );
}

const st = StyleSheet.create({
  save: { height: 36, paddingHorizontal: 14, borderRadius: 999, backgroundColor: color.primary, justifyContent: 'center', alignItems: 'center', minWidth: 62 },
  saveText: { fontFamily: font.bodyBold, fontSize: 14, color: '#FFFFFF' },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2 },
  box: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: color.lineStrong },
  input: { flex: 1, minWidth: 0, padding: 0, fontFamily: font.body, fontSize: 15, color: color.ink },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 14, ...cardShadow },
  section: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 999 },
  chipOn: { backgroundColor: color.primaryTint, borderWidth: 1.5, borderColor: color.primary },
  chipOff: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line },
  chipText: { fontFamily: font.bodySemi, fontSize: 13 },
  day: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  dayOn: { backgroundColor: color.primary },
  dayOff: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line },
  dayText: { fontFamily: font.bodyBold, fontSize: 13 },
  small: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  switchTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  track: { width: 50, height: 30, borderRadius: 15, flexShrink: 0 },
  knob: { position: 'absolute', top: 3, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF' },
  remove: { alignSelf: 'center', padding: 6 },
  removeText: { fontFamily: font.bodyBold, fontSize: 14, color: color.badInk, textDecorationLine: 'underline' },
});
