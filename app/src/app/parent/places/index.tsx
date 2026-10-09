import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { KidStack, PIcon, PlaceTile } from '@/components/places';
import { HelperNote } from '@/components/familyMembers';
import { ErrorText, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { daysLabel, homesOf, otherPlacesOf, placeIcon, placesApi, type Place } from '@/lib/places';
import { useSession } from '@/lib/session';
import type { Kid } from '@/lib/types';
import { useCanManage } from '@/lib/use-family-role';
import { cardShadow, color, font, SECTION_GAP } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe P56 Homes and places, from app/src/wireframes/P56.tsx. Opened from Settings (P12b). Rows open P57;
// "Add a home address" / "Add a place" open P58 with that kind picked. Design note nP14.
// Not drawn: the tab bar (this is a pushed screen, like House rules); times on other places ("School · 8–3",
// "Thu 4:30", "Visits": no times are stored, the row shows the days or nothing); an empty card shows only its add row.
// A family helper (P56h) reads the list: no add rows, rows don't open the editor (P57), an empty section reads
// "None yet", and the note "Jen manages homes and places." at the end.
export default function Places() {
  const { family } = useSession();
  const manage = useCanManage();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const [places, kids] = await Promise.all([placesApi.list(fid), api.kids(fid)]);
    return { places, kids };
  }, [fid]);

  if (!data) return error ? <Screen title="Homes and places" back><ErrorText>{needsMigration(error)}</ErrorText></Screen> : <Loading />;
  const homes = homesOf(data.places);
  const others = otherPlacesOf(data.places);

  return (
    <Screen title="Homes and places" back gap={10}>
      <Text style={st.section}>HOMES · {homes.length}</Text>
      <Text style={st.lead}>Where the kids live. A sitter can clock in only at a home address.</Text>
      <View style={st.card}>
        {homes.map((p, i) => (
          <PlaceRow key={p.id} place={p} kids={data.kids} open={manage} line={manage || i < homes.length - 1} />
        ))}
        {manage ? <AddRow label="Add a home address" onPress={() => router.push('/parent/places/new?kind=home')} /> : homes.length ? null : <NoneRow />}
      </View>
      <Text style={[st.section, { marginTop: SECTION_GAP }]}>OTHER PLACES · {others.length}</Text>
      <Text style={st.lead}>You get an alert when the sitter and kids arrive or leave.</Text>
      <View style={st.card}>
        {others.map((p, i) => (
          <PlaceRow key={p.id} place={p} kids={data.kids} open={manage} line={manage || i < others.length - 1} />
        ))}
        {manage ? <AddRow label="Add a place" onPress={() => router.push('/parent/places/new?kind=place')} /> : others.length ? null : <NoneRow />}
      </View>
      <HelperNote what="homes and places" />
    </Screen>
  );
}

function needsMigration(error: string) {
  return /places/.test(error) && /does not exist|schema cache/i.test(error) ? 'Homes and places need the latest database update (migration 16).' : error;
}

function PlaceRow({ place, kids, open, line }: { place: Place; kids: Kid[]; open: boolean; line: boolean }) {
  const who = place.kid_ids?.length ? kids.filter((k) => place.kid_ids!.includes(k.id)) : kids;
  // Homes always say when (null = every day); other places only when days are set.
  const when = place.kind === 'home' || place.days?.length ? daysLabel(place.days) : '';
  return (
    <Pressable accessibilityRole="button" disabled={!open} onPress={() => router.push(`/parent/places/${place.id}`)} style={({ pressed }) => [st.row, line && st.rowLine, pressed && { opacity: 0.8 }]}>
      <PlaceTile icon={placeIcon(place)} main={place.is_main} kind={place.kind} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={st.name} numberOfLines={1}>{place.name}</Text>
          {place.is_main ? (
            <View style={st.main}>
              <Text style={st.mainText}>MAIN</Text>
            </View>
          ) : null}
        </View>
        {place.address ? <Text style={st.address} numberOfLines={1}>{place.address}</Text> : null}
        {who.length || when ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <KidStack kids={who} />
            {when ? <Text style={st.when}>{when}</Text> : null}
          </View>
        ) : null}
      </View>
      {open ? <PIcon name="chevron" size={18} tint={color.ink2} /> : null}
    </Pressable>
  );
}

/** A read-only member's empty section (no add row to show). */
function NoneRow() {
  return (
    <View style={st.add}>
      <Text style={st.address}>None yet</Text>
    </View>
  );
}

function AddRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [st.add, pressed && { opacity: 0.8 }]}>
      <View style={st.addIcon}>
        <PIcon name="plus" size={18} tint={color.primary} width={2.2} />
      </View>
      <Text style={st.addText}>{label}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  section: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  lead: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2, marginTop: -4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 14, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  // Every place row has the divider the wireframe draws above the add row (it always follows).
  rowLine: { borderBottomWidth: 1, borderBottomColor: color.divider },
  name: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink, flexShrink: 1 },
  main: { height: 22, paddingHorizontal: 8, borderRadius: 999, backgroundColor: color.primaryTint, justifyContent: 'center' },
  mainText: { fontFamily: font.bodyBold, fontSize: 11, color: color.primaryStrong },
  address: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  when: { fontFamily: font.body, fontSize: 12, color: color.quiet },
  add: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  addIcon: { width: 40, height: 40, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center' },
  addText: { fontFamily: font.bodyBold, fontSize: 15, color: color.primary },
});
