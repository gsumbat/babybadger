import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { PIcon, PlaceSeg } from '@/components/places';
import { Banner, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { canGeocode, currentAddress, searchAddresses, setPlaceDraft, splitAddress, type AddressResult, type PlaceKind } from '@/lib/places';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';
import { Text, TextInput } from '@/components/Text';

// Wireframe P58 Add a place, from app/src/wireframes/P58.tsx (`?kind=home|place` from P56's add rows).
// Typing searches the phone's map (expo-location geocoding); a result or "Use where I am now" opens P57 with that
// address as a new, unsaved home or place. Design note nP14: either parent can add their own home.
// Not drawn: "Other place" picked (the hint reads P56's line for places and the co-parent note hides); a search with
// no match, and the web preview (no map search there): the typed address shows as the only row, saved without a map
// position; searching / locating spinners; location turned off.
export default function AddPlace() {
  const params = useLocalSearchParams<{ kind?: string }>();
  const { family, profile } = useSession();
  const fid = family!.id;
  const [kind, setKind] = useState<PlaceKind>(params.kind === 'place' ? 'place' : 'home');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AddressResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [err, setErr] = useState('');
  const run = useRef(0);
  const { data } = useQuery(() => api.familyParents(fid), [fid]);
  const otherParent = data?.find((p) => p.id !== profile?.id);

  useEffect(() => {
    const q = query.trim();
    const n = ++run.current;
    if (!canGeocode || q.length < 4) {
      // nothing to look up: clear the old matches
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      const found = await searchAddresses(q);
      if (n !== run.current) return;
      setResults(found);
      setSearching(false);
    }, 450);
    return () => clearTimeout(t);
  }, [query]);

  function open(r: AddressResult) {
    setPlaceDraft({ kind, address: r.address, lat: r.lat, lng: r.lng });
    router.replace(`/parent/places/draft?kind=${kind}`);
  }

  async function useHere() {
    setErr('');
    setLocating(true);
    const here = await currentAddress();
    setLocating(false);
    if (!here) return setErr('Turn on location for BabyBadger to use where you are now.');
    open(here);
  }

  const typed = query.trim();
  // No map match (or the web preview, which has no map search): the typed address is the one row.
  const rows: (AddressResult & { hint?: boolean })[] = results.length ? results : typed.length >= 4 && !searching ? [{ address: typed, lat: null, lng: null, hint: true }] : [];

  return (
    <Screen title="Add a place" back gap={14}>
      <View style={{ gap: 8 }}>
        <Text style={st.label}>What kind of place?</Text>
        <PlaceSeg
          options={[
            { value: 'home', label: 'Home address' },
            { value: 'place', label: 'Other place' },
          ]}
          value={kind}
          onChange={setKind}
        />
        <Text style={st.hint}>
          {kind === 'home'
            ? 'Add a home when the kids live in more than one place, like a second parent’s home. Sitters can clock in there.'
            : 'You get an alert when the sitter and kids arrive or leave.'}
        </Text>
      </View>
      <View style={st.search}>
        <PIcon name="search" size={20} tint={color.primary} />
        <TextInput
          accessibilityLabel="Search an address"
          value={query}
          onChangeText={setQuery}
          placeholder="Search an address"
          placeholderTextColor={color.quiet}
          autoCorrect={false}
          autoFocus
          returnKeyType="search"
          style={st.searchInput}
        />
        {searching ? <ActivityIndicator color={color.primary} /> : null}
      </View>
      <Pressable accessibilityRole="button" onPress={useHere} disabled={locating} style={({ pressed }) => [st.here, pressed && { opacity: 0.8 }]}>
        <View style={st.hereIcon}>{locating ? <ActivityIndicator size="small" color={color.primary} /> : <PIcon name="locate" size={18} tint={color.primary} />}</View>
        <Text style={st.hereText}>Use where I am now</Text>
      </Pressable>
      {err ? <Banner kind="warn" icon="map-pin">{err}</Banner> : null}
      {rows.length ? (
        <View style={st.card}>
          {rows.map((r, i) => {
            const { line1, line2 } = splitAddress(r.address);
            return (
              <Pressable key={r.address} accessibilityRole="button" onPress={() => open(r)} style={({ pressed }) => [st.result, i < rows.length - 1 && st.line, pressed && { opacity: 0.8 }]}>
                <PIcon name="pin" size={20} tint={color.ink2} />
                <View style={{ flexShrink: 1, minWidth: 0 }}>
                  <Text style={st.line1}>{line1}</Text>
                  {r.hint ? <Text style={st.line2}>Not found on the map yet. You can still save it.</Text> : line2 ? <Text style={st.line2}>{line2}</Text> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {kind === 'home' && otherParent ? (
        <View style={st.note}>
          <PIcon name="users" size={20} tint={color.ink2} />
          <Text style={st.noteText}>{firstName(otherParent.full_name)} is a parent on this family, so they can add and edit their own home too.</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const st = StyleSheet.create({
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2 },
  hint: { fontFamily: font.body, fontSize: 12, lineHeight: 17, color: color.ink2 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 50, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1.5, borderColor: color.primary },
  searchInput: { flex: 1, minWidth: 0, padding: 0, fontFamily: font.body, fontSize: 16, color: color.ink },
  here: { flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'flex-start' },
  hereIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  hereText: { fontFamily: font.bodyBold, fontSize: 15, color: color.primary },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 14, ...cardShadow },
  result: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  line1: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  line2: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.muted, borderRadius: 16 },
  noteText: { flexShrink: 1, fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
});
