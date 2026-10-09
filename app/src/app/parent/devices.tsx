import { StyleSheet, View } from 'react-native';

import { KidDot } from '@/components/bits';
import { HelperNote } from '@/components/familyMembers';
import { ErrorText, Icon, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe P13k Devices, opened from Settings › Devices and trackers and Home's "Devices" tile. Only devices and
// trackers: the kids themselves (profile, day, care plan) are reached from Home's Kids list and the Care plan, so no
// kid cards here. Nothing in it is built yet (it needs the kid app, after phase 1): one "Ava’s phone or tablet" row
// per kid and "Watches and trackers", all dimmed with a "Coming soon" pill, not tappable. A read-only member (P4m)
// sees the same rows and the note "Jen manages the devices."
export default function Devices() {
  const { family } = useSession();
  const fid = family!.id;
  const { data: kids, error } = useQuery(() => api.kids(fid), [fid]);

  if (!kids) return error ? <Screen title="Devices" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  return (
    <Screen title="Devices" back gap={12}>
      <Text style={st.intro}>See where your kids are and check in with them, from their own phone or a GPS tracker.</Text>
      <View accessibilityState={{ disabled: true }} style={[st.card, st.dim]}>
        {kids.map((k, n) => (
          <View key={k.id} style={[st.row, n < kids.length - 1 && st.rowLine]}>
            <KidDot kid={k} size={36} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={st.rowTitle}>{k.name}’s phone or tablet</Text>
              <Text style={st.rowSub}>Location, battery, messages</Text>
            </View>
            <Soon />
          </View>
        ))}
        {kids.length === 0 ? (
          <View style={st.row}>
            <Icon name="smartphone" size={22} tint="#5F6D74" strokeWidth={1.8} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={st.rowTitle}>A kid’s phone or tablet</Text>
              <Text style={st.rowSub}>Location, battery, messages</Text>
            </View>
            <Soon />
          </View>
        ) : null}
      </View>
      <View accessibilityState={{ disabled: true }} style={[st.card, st.row, st.dim]}>
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

function Soon() {
  return (
    <View style={st.soon}>
      <Text style={st.soonText}>Coming soon</Text>
    </View>
  );
}

// Values from wireframe P13k.
const st = StyleSheet.create({
  intro: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink2 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: color.divider },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  rowSub: { fontFamily: font.body, fontSize: 13, color: color.ink2, marginTop: 2 },
  dim: { opacity: 0.55 },
  soon: { height: 24, paddingHorizontal: 9, borderRadius: 999, backgroundColor: color.muted, justifyContent: 'center' },
  soonText: { fontFamily: font.bodyBold, fontSize: 12, color: color.ink2 },
});
