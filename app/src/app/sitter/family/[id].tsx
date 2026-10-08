import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { kidShade } from '@/components/bits';
import { ErrorText, Icon, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { contactName, dialable, mapsUrl, routineGroups } from '@/lib/family-page-logic';
import { ageLabel } from '@/lib/kid-profile';
import { homesOf } from '@/lib/places';
import { placesOrEmpty } from '@/lib/trips';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe S10, translated from its HTML (app/src/wireframes/S10.tsx). Opened from the shift page (S4b) and the
// Families tab. ROUTINES: each kid's day from the care plan (P20), then the family-wide items ("Everyone"), read only.
// PARENTS: the family's adults from family_contacts (migration 33: only sitters who signed the notice), with Text and
// Call when they saved a phone ("No phone added" otherwise; the section is hidden before migration 33 runs).
// HOME: each home from places_for_sitter (the address is blank when the family hides it: "Address not shared", no
// Maps link). The location-sharing card opens S12.
export default function SitterFamily() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sitterLinks } = useSession();
  const name = sitterLinks.find((l) => l.family_id === id)?.family.name ?? 'Family';
  const { data: kids, error } = useQuery(() => api.kids(id!), [id]);
  const { data: care } = useQuery(() => api.careItems(id!).catch(() => []), [id]);
  const { data: contacts } = useQuery(() => api.familyContacts(id!).catch(() => null), [id]);
  const { data: places } = useQuery(() => placesOrEmpty(id!), [id]);
  const routines = routineGroups(care ?? [], kids ?? []);
  const homes = homesOf(places ?? []);
  const list = kids ?? [];
  const avoid = list.filter((k) => k.avoid_foods || k.allergies);
  const doctors = list.filter((k) => k.pediatrician);
  const rows: (typeof list)[] = [];
  for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));

  return (
    <Screen
      gap={12}
      header={
        <View style={st.header}>
          <BackButton />
          <View style={st.familyDot} />
          <Text style={st.title} numberOfLines={1}>
            {name}
          </Text>
        </View>
      }>
      <ErrorText>{error}</ErrorText>
      {avoid.map((k) => (
        <View key={k.id} style={st.avoid}>
          <Text style={st.avoidTitle}>{k.name} · food to avoid</Text>
          <Text style={st.avoidText}>{[k.avoid_foods, k.allergies && `allergic to ${k.allergies}`].filter(Boolean).join(' · ')}</Text>
        </View>
      ))}
      <View style={{ gap: 10 }}>
        {rows.map((r) => (
          <View key={r[0].id} style={{ flexDirection: 'row', gap: 10 }}>
            {r.map((k) => (
              <View key={k.id} style={st.kidCard}>
                <View style={[st.kidDot, { backgroundColor: kidShade(k.color) }]}>
                  <Text style={st.kidLetter}>{k.name[0]?.toUpperCase()}</Text>
                </View>
                <Text style={st.kidName}>
                  {k.name}
                  {k.birthdate ? `, ${ageLabel(k.birthdate)}` : ''}
                </Text>
                <Text style={st.kidSub}>{[k.health_notes, k.comfort_item && `comfort: ${k.comfort_item}`, k.notes].filter(Boolean).join(' · ') || 'No notes yet'}</Text>
              </View>
            ))}
            {r.length === 1 ? <View style={{ flex: 1 }} /> : null}
          </View>
        ))}
      </View>
      {routines.length > 0 && (
        <>
          <Text style={st.label}>ROUTINES</Text>
          <View style={[st.card, { paddingTop: 0, paddingBottom: 8 }]}>
            {routines.map((g) => (
              <View key={g.key}>
                <View style={st.groupHead}>
                  {g.kid ? <View style={[st.groupDot, { backgroundColor: kidShade(g.kid.color) }]} /> : null}
                  <Text style={st.groupTitle}>{g.title}</Text>
                </View>
                {g.rows.map((r, i) => (
                  <View key={r.id} style={[st.rRow, i < g.rows.length - 1 && st.line]}>
                    <Text style={st.rTitle}>{r.title}</Text>
                    <Text style={st.rWhen}>{r.when}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </>
      )}
      {!!contacts?.length && (
        <>
          <Text style={st.label}>PARENTS</Text>
          <View style={st.card}>
            {contacts.map((c, i) => {
              const tel = dialable(c.phone);
              const who = contactName(c);
              return (
                <View key={c.user_id} style={[st.pRow, i < contacts.length - 1 && st.line]}>
                  <View style={{ flexShrink: 1 }}>
                    <Text style={st.emName}>{who}</Text>
                    <Text style={st.emSub}>{c.phone || 'No phone added'}</Text>
                  </View>
                  {tel ? (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Pressable accessibilityRole="button" accessibilityLabel={`Text ${who}`} onPress={() => Linking.openURL(`sms:${tel}`)} style={st.call}>
                        <Icon name="message-square" size={20} strokeWidth={2} />
                      </Pressable>
                      <Pressable accessibilityRole="button" accessibilityLabel={`Call ${who}`} onPress={() => Linking.openURL(`tel:${tel}`)} style={st.call}>
                        <Icon name="phone" size={20} strokeWidth={2} />
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </>
      )}
      {doctors.length > 0 && (
        <>
          <Text style={st.label}>EMERGENCY</Text>
          <View style={st.card}>
            {doctors.map((k, i) => {
              const phone = (k.pediatrician ?? '').replace(/[^\d+]/g, '');
              return (
                <View key={k.id} style={[st.emRow, i < doctors.length - 1 && st.line]}>
                  <View style={{ flexShrink: 1 }}>
                    <Text style={st.emName}>Pediatrician · {k.name}</Text>
                    <Text style={st.emSub}>{k.pediatrician}</Text>
                  </View>
                  {phone.length >= 7 ? (
                    <Pressable accessibilityRole="button" accessibilityLabel={`Call pediatrician for ${k.name}`} onPress={() => Linking.openURL(`tel:${phone}`)} style={st.call}>
                      <Icon name="phone" size={20} strokeWidth={2} />
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        </>
      )}
      {homes.length > 0 && (
        <>
          <Text style={st.label}>HOME</Text>
          <View style={st.card}>
            {homes.map((h, i) => {
              const url = mapsUrl(h.address, Platform.OS);
              return (
                <View key={h.id} style={[st.pRow, i < homes.length - 1 && st.line]}>
                  <View style={{ flexShrink: 1, minWidth: 0 }}>
                    <Text style={st.emName}>{homes.length > 1 ? h.name || 'Home' : 'Home address'}</Text>
                    <Text style={st.emSub}>{h.address?.trim() || 'Address not shared'}</Text>
                  </View>
                  {url ? (
                    <Pressable accessibilityRole="link" onPress={() => Linking.openURL(url)} style={st.maps}>
                      <SvgXml xml={PIN} width={18} height={18} style={{ flexShrink: 0 }} />
                      <Text style={st.mapsText}>Open in Maps</Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        </>
      )}
      <Pressable accessibilityRole="button" onPress={() => router.push('/sitter/privacy')} style={st.shareRow}>
        <Icon name="shield" size={22} />
        <View style={{ flexGrow: 1, flexShrink: 1 }}>
          <Text style={st.emName}>Location sharing with this family</Text>
          <Text style={st.shareSub}>Only while clocked in · consent signed</Text>
        </View>
        <Icon name="chevron-right" size={20} tint={color.ink2} />
      </Pressable>
    </Screen>
  );
}

// S10 "Open in Maps" pin, from the wireframe.
const PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>';

function BackButton() {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={st.back}>
      <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
    </Pressable>
  );
}

// Values from wireframe S10.
const st = StyleSheet.create({
  // paddingBottom 12 in the wireframe; Screen's content adds 4 on top.
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  familyDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2F6FD6' },
  title: { fontFamily: font.display, fontSize: 22, color: color.ink, flexShrink: 1 },
  avoid: { gap: 2, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.badTint, borderRadius: 12 },
  avoidTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.badInk },
  avoidText: { fontFamily: font.body, fontSize: 14, color: '#6E2215' },
  kidCard: { flex: 1, gap: 8, padding: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  kidDot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  kidLetter: { fontFamily: font.bodyBold, fontSize: 16, color: '#FFFFFF' },
  kidName: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  kidSub: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6, marginTop: 4 },
  card: { paddingVertical: 4, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  emRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  emName: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  emSub: { fontFamily: font.body, fontSize: 13, color: '#5F6D74' },
  call: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  shareRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  shareSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, paddingBottom: 2 },
  groupDot: { width: 10, height: 10, borderRadius: 5 },
  groupTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.ink },
  rRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 40 },
  rTitle: { fontFamily: font.body, fontSize: 15, color: color.ink, flexShrink: 1 },
  rWhen: { fontFamily: font.body, fontSize: 14, color: color.ink2, textAlign: 'right', flexShrink: 1 },
  pRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 60 },
  maps: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 999, backgroundColor: color.primaryTint, flexShrink: 0 },
  mapsText: { fontFamily: font.bodyBold, fontSize: 14, color: color.primary },
});
