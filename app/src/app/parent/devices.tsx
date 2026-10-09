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

// Wireframe P13 Kids and devices, from app/src/wireframes/P13.tsx, opened from Settings › Devices and trackers and
// Home's "Devices" tile. One card per kid ("Ava, 7", "No device yet") with her device row or "+ Add Ava's device",
// the note "Parents see kids' devices anytime", "Watches and trackers", and the footer Add a child / Add a device.
// Kids' devices need the kid app (P14 Add a device, P15 Connect code, K1 pairing, P17 device settings), which comes
// after phase 1: every device action shows dimmed with a "Coming soon" pill and opens nothing. The kid's name isn't a
// link here (her profile and day are on Home and the Care plan). A read-only member (P4m) sees the cards without the
// add buttons or footer, and the note "Jen manages the devices."
export default function Devices() {
  const { family } = useSession();
  const manage = useCanManage();
  const fid = family!.id;
  const { data: kids, error } = useQuery(() => api.kids(fid), [fid]);

  if (!kids) return error ? <Screen title="Devices" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  return (
    <Screen
      title="Devices"
      back
      gap={12}
      footer={
        manage ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable accessibilityRole="button" onPress={() => router.push('/parent/kid/new')} style={({ pressed }) => [st.foot, st.footSoft, pressed && { opacity: 0.85 }]}>
              <Text style={st.footSoftText}>Add a child</Text>
            </Pressable>
            <View accessibilityRole="button" accessibilityState={{ disabled: true }} accessibilityHint="Coming soon" style={[st.foot, st.footMain, st.dim]}>
              <Text style={st.footMainText}>Add a device</Text>
            </View>
          </View>
        ) : undefined
      }>
      {kids.length === 0 ? <Text style={st.empty}>No kids yet.</Text> : null}
      {kids.map((k) => (
        <KidCard key={k.id} kid={k} manage={manage} />
      ))}
      <View style={st.note}>
        <Icon name="shield" size={22} tint={color.primaryStrong} strokeWidth={1.8} />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={st.noteTitle}>Parents see kids’ devices anytime</Text>
          <Text style={st.noteText}>Sitters see them only during their own shift.</Text>
        </View>
      </View>
      <View accessibilityState={{ disabled: true }} style={[st.trackers, st.dim]}>
        <Icon name="watch" size={22} tint="#5F6D74" strokeWidth={1.8} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={st.rowTitle}>Watches and trackers</Text>
          <Text style={st.rowSub}>GPS tag for kids without a phone</Text>
        </View>
        <Soon />
      </View>
      <HelperNote what="the devices" />
    </Screen>
  );
}

function KidCard({ kid, manage }: { kid: Kid; manage: boolean }) {
  return (
    <View style={st.card}>
      <View style={st.kidRow}>
        <KidDot kid={kid} size={44} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={st.kidName}>{kidCardTitle(kid.name, kid.birthdate)}</Text>
          <Text style={st.rowSub}>No device yet</Text>
        </View>
      </View>
      {manage ? (
        <View accessibilityRole="button" accessibilityState={{ disabled: true }} accessibilityHint="Coming soon" style={[st.addKidDevice, st.dim]}>
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

// Values from wireframe P13.
const st = StyleSheet.create({
  card: { gap: 12, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  kidRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  kidName: { fontFamily: font.displayBold, fontSize: 18, color: color.ink, marginVertical: -3.52 },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  rowSub: { fontFamily: font.body, fontSize: 13, color: color.ink2, marginTop: 2 },
  addKidDevice: { height: 48, borderRadius: 999, borderWidth: 2, borderStyle: 'dashed', borderColor: '#C9D3DD', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addKidDeviceText: { fontFamily: font.displayBold, fontSize: 16, color: color.primary },
  note: { flexDirection: 'row', gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: color.primaryTint, borderRadius: 16 },
  noteTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.primaryStrong },
  noteText: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  trackers: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  dim: { opacity: 0.55 },
  soon: { height: 24, paddingHorizontal: 9, borderRadius: 999, backgroundColor: color.muted, justifyContent: 'center' },
  soonText: { fontFamily: font.bodyBold, fontSize: 12, color: color.ink2 },
  empty: { fontFamily: font.body, fontSize: 15, color: color.ink2 },
  foot: { flex: 1, height: 54, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  footSoft: { backgroundColor: color.primaryTint },
  footSoftText: { fontFamily: font.displayBold, fontSize: 17, color: color.primary },
  footMain: { backgroundColor: color.primary },
  footMainText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
});
