import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { KidDot } from '@/components/bits';
import { HelperNote } from '@/components/familyMembers';
import { ErrorText, Icon, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { kidCardTitle } from '@/lib/kid-profile';
import { useSession } from '@/lib/session';
import type { Kid } from '@/lib/types';
import { useCanManage } from '@/lib/use-family-role';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe P13k Kids (the kids part of P13 Kids and devices), opened from Settings › Kids and devices and Home's
// "Kids & devices" tile. Each card: the kid's dot, "Ava, 7" and her food line; it opens P55. Kids' devices aren't
// built: each card's "+ Add Ava's device", the "Add a device" row and "Watches and trackers" show dimmed with a
// "Coming soon" pill and don't open anything. "Add a child" opens P18. A read-only member (P4m) sees the list without
// the Add buttons, and the note "Jen manages the kids." Not drawn: no kids yet ("No kids yet." above Add a child).
export default function Kids() {
  const { family } = useSession();
  const manage = useCanManage();
  const fid = family!.id;
  const { data: kids, error } = useQuery(() => api.kids(fid), [fid]);

  if (!kids) return error ? <Screen title="Kids and devices" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  return (
    <Screen
      title="Kids and devices"
      back
      gap={12}
      footer={
        manage ? (
          <Pressable accessibilityRole="button" onPress={() => router.push('/parent/kid/new')} style={({ pressed }) => [st.addChild, pressed && { opacity: 0.85 }]}>
            <Text style={st.addChildText}>Add a child</Text>
          </Pressable>
        ) : undefined
      }>
      {kids.length === 0 ? <Text style={st.empty}>No kids yet.</Text> : null}
      {kids.map((k) => (
        <KidCard key={k.id} kid={k} manage={manage} />
      ))}
      {manage ? (
        <View accessibilityState={{ disabled: true }} style={[st.trackers, st.dim]}>
          <Icon name="smartphone" size={22} tint="#5F6D74" strokeWidth={1.8} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={st.rowTitle}>Add a device</Text>
            <Text style={st.rowSub}>A kid’s phone or tablet</Text>
          </View>
          <Soon />
        </View>
      ) : null}
      <View accessibilityState={{ disabled: true }} style={[st.trackers, st.dim]}>
        <Icon name="watch" size={22} tint="#5F6D74" strokeWidth={1.8} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={st.rowTitle}>Watches and trackers</Text>
          <Text style={st.rowSub}>GPS tag for kids without a phone</Text>
        </View>
        <Soon />
      </View>
      <HelperNote what="the kids" />
    </Screen>
  );
}

function KidCard({ kid, manage }: { kid: Kid; manage: boolean }) {
  const food = [kid.avoid_foods && `avoid ${kid.avoid_foods}`, kid.allergies && `allergic to ${kid.allergies}`].filter(Boolean).join(' · ');
  return (
    <View style={st.card}>
      <Pressable accessibilityRole="button" onPress={() => router.push(`/parent/kid/${kid.id}`)} style={({ pressed }) => [st.kidRow, pressed && { opacity: 0.8 }]}>
        <KidDot kid={kid} size={44} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={st.kidName}>{kidCardTitle(kid.name, kid.birthdate)}</Text>
          {food ? <Text style={st.rowSub}>{food}</Text> : null}
        </View>
        <Icon name="chevron-right" size={18} tint={color.ink2} />
      </Pressable>
      {manage ? (
        <View accessibilityState={{ disabled: true }} style={[st.addKidDevice, st.dim]}>
          <Text style={st.addKidDeviceText}>+ Add {kid.name}’s device</Text>
          <Soon />
        </View>
      ) : null}
    </View>
  );
}

function Soon() {
  return (
    <View style={st.soon}>
      <Text style={st.soonText}>Coming soon</Text>
    </View>
  );
}

// Values from wireframe P13 / P13k.
const st = StyleSheet.create({
  card: { gap: 12, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  kidRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  kidName: { fontFamily: font.displayBold, fontSize: 18, color: color.ink, marginVertical: -3.52 },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  rowSub: { fontFamily: font.body, fontSize: 13, color: color.ink2, marginTop: 2 },
  addKidDevice: { height: 48, borderRadius: 999, borderWidth: 2, borderStyle: 'dashed', borderColor: '#C9D3DD', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addKidDeviceText: { fontFamily: font.displayBold, fontSize: 16, color: color.primary },
  trackers: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  dim: { opacity: 0.55 },
  soon: { height: 24, paddingHorizontal: 9, borderRadius: 999, backgroundColor: color.muted, justifyContent: 'center' },
  soonText: { fontFamily: font.bodyBold, fontSize: 12, color: color.ink2 },
  empty: { fontFamily: font.body, fontSize: 15, color: color.ink2 },
  addChild: { height: 54, borderRadius: 999, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  addChildText: { fontFamily: font.displayBold, fontSize: 17, color: color.primary },
});
