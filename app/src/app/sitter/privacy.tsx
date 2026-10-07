import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { CIcon } from '@/components/credentials';
import { Text } from '@/components/Text';
import { Icon, Screen } from '@/components/ui';
import { familyColor } from '@/lib/calendar-logic';
import { api, useQuery } from '@/lib/data';
import { useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';

// Wireframe S12 Privacy, per family, from app/src/wireframes/S12.tsx. Opened from Me (S39) "Settings, privacy and help".
// The banner says whether any family can see her location right now (only while she's clocked in). One card per
// family: consent state and what that family sees ("Photos you send" only where she can message them).
// Left out until built: "View notice" (no read-only copy of the signed notice yet), "Withdraw consent", "Download my
// data", "Delete my account". Not drawn: the on-shift banner, a family she hasn't signed for yet ("Not signed yet",
// no chips), and the "Sign out" row (it lived on Me's old settings prompt; kept here so sign-out stays reachable).
export default function Privacy() {
  const { session, sitterLinks, signOut } = useSession();
  const uid = session!.user.id;
  const { data } = useQuery(async () => {
    const [shifts, links] = await Promise.all([
      api.sitterShifts(uid),
      supabase.from('family_sitters').select('family_id, can_message').eq('sitter_id', uid).neq('status', 'removed'),
    ]);
    return { onShift: shifts.find((s) => s.status === 'active'), canMessage: Object.fromEntries((links.data ?? []).map((l) => [l.family_id, l.can_message !== false])) as Record<string, boolean> };
  }, [uid]);

  const onShiftFamily = data?.onShift ? sitterLinks.find((l) => l.family_id === data.onShift!.family_id)?.family.name : undefined;

  function confirmSignOut() {
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('Sign out?')) signOut();
      return;
    }
    Alert.alert('Sign out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <Screen back title="Privacy" gap={12}>
      <View style={st.banner}>
        <CIcon name="shield" size={28} tint="#FFFFFF" />
        <View style={{ flexShrink: 1 }}>
          <Text style={st.bannerTitle}>{data?.onShift ? 'You’re on shift' : 'You’re off shift'}</Text>
          <Text style={st.bannerSub}>{data?.onShift ? `${onShiftFamily ?? 'This family'} can see your location until you clock out.` : 'No family can see your location right now.'}</Text>
        </View>
      </View>

      {sitterLinks.length ? <Text style={[st.label, { marginTop: 4 }]}>EACH FAMILY SEES</Text> : null}
      {sitterLinks.map((l) => {
        const signed = l.status === 'active';
        const chips = ['Location on shift', 'Hours', 'Tasks, food, notes', ...(data?.canMessage[l.family_id] ? ['Photos you send'] : [])];
        return (
          <View key={l.family_id} style={st.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[st.dot, { backgroundColor: familyColor(sitterLinks, l.family_id).dot }]} />
              <Text style={st.family} numberOfLines={1}>
                {l.family.name}
              </Text>
              <View style={[st.pill, !signed && { backgroundColor: color.warnTint }]}>
                <Text style={[st.pillText, !signed && { color: color.warnInk }]}>{signed ? 'Consent signed' : 'Not signed yet'}</Text>
              </View>
            </View>
            {signed ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {chips.map((c) => (
                  <View key={c} style={st.chip}>
                    <Text style={st.chipText}>{c}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}

      <View style={st.listCard}>
        <Pressable accessibilityRole="button" onPress={confirmSignOut} style={st.row}>
          <Text style={st.rowText}>Sign out</Text>
          <Icon name="chevron-right" size={20} tint="#5F6D74" />
        </Pressable>
      </View>
    </Screen>
  );
}

// Values from wireframe S12.
const st = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: color.primary, borderRadius: 20 },
  bannerTitle: { fontFamily: font.bodyBold, fontSize: 16, color: '#FFFFFF' },
  bannerSub: { fontFamily: font.body, fontSize: 14, color: '#FFFFFF', opacity: 0.9 },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  card: { gap: 10, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  dot: { width: 10, height: 10, borderRadius: 5 },
  family: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink, flexShrink: 1 },
  pill: { height: 26, marginLeft: 'auto', paddingHorizontal: 10, backgroundColor: color.okTint, borderRadius: 999, justifyContent: 'center', flexShrink: 0 },
  pillText: { fontFamily: font.bodyBold, fontSize: 12, color: color.okInk },
  chip: { height: 28, paddingHorizontal: 10, backgroundColor: color.muted, borderRadius: 999, justifyContent: 'center' },
  chipText: { fontFamily: font.body, fontSize: 13, color: color.ink },
  listCard: { paddingVertical: 4, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52 },
  rowText: { fontFamily: font.body, fontSize: 15, color: color.ink, flexShrink: 1 },
});
