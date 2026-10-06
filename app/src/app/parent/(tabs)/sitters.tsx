import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button, ErrorText, Icon, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { dayOf, firstName } from '@/lib/format';
import { inviteApi } from '@/lib/invites';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe P54, translated from its HTML (app/src/wireframes/P54.tsx); P54b when there are no sitters and no
// open invites yet. An invite in progress, or a sitter who still has to sign, opens P25 (parent/invite/[id]); active
// sitters stay as they are until P11 Sitter profile is built.
// Left out until built: "When do you need someone?", availability, Find a new sitter (P54 and P54b), meet requests,
// saved sitters.
export default function Sitters() {
  const { family } = useSession();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const [sitters, invites, shifts] = await Promise.all([api.familySitters(fid), inviteApi.pending(fid), api.familyShifts(fid)]);
    return { sitters, invites, shifts };
  }, [fid]);

  const openInvite = (id: string) => router.push({ pathname: '/parent/invite/[id]', params: { id } });
  // A sitter who joined but hasn't signed: her accepted invite shows how far she's got (P25).
  async function openSitter(sitterId: string) {
    try {
      const id = await inviteApi.acceptedBy(fid, sitterId);
      if (id) openInvite(id);
    } catch (e) {
      Alert.alert('Could not open', errorText(e));
    }
  }

  const sitters = data?.sitters ?? [];
  const onShift = (id: string) => data?.shifts.some((s) => s.sitter_id === id && s.status === 'active');
  const status = (s: (typeof sitters)[number]) => (s.status !== 'active' ? 'Needs to sign' : onShift(s.sitter_id) ? 'On shift' : 'Active');
  const dot = (s: (typeof sitters)[number]) => (s.status !== 'active' ? color.warn : onShift(s.sitter_id) ? color.ok : color.primary);

  return (
    <Screen
      gap={12}
      header={
        // P54 header: 8 px under the title (the shared tab header uses 12), Invite pinned to the top.
        <View style={st.head}>
          <Text style={st.title}>Sitters</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/parent/invite')} style={st.inviteBtn}>
            <Icon name="plus" size={16} strokeWidth={2.2} />
            <Text style={st.inviteText}>Invite</Text>
          </Pressable>
        </View>
      }>
      <ErrorText>{error}</ErrorText>

      {data && !sitters.length && !data.invites.length ? (
        // P54b: no sitters yet.
        <View style={st.empty}>
          <View style={st.emptyIcon}>
            <Icon name="users" size={34} />
          </View>
          <Text style={st.emptyTitle}>No sitters yet</Text>
          <Text style={st.emptyBody}>Invite someone you already know and trust. They join your pool once they accept and sign the notice.</Text>
          <Button label="Invite a sitter" onPress={() => router.push('/parent/invite')} style={st.emptyBtn} />
        </View>
      ) : null}

      {sitters.length ? (
        <>
          <Text style={st.label}>YOUR POOL · {sitters.length}</Text>
          <View style={st.pool}>
            {sitters.map((s, i) => (
              <Pressable key={s.sitter_id} accessibilityRole="button" disabled={s.status === 'active'} onPress={() => openSitter(s.sitter_id)} style={st.poolItem}>
                <View>
                  <View style={[st.poolAvatar, { backgroundColor: AVATAR[i % AVATAR.length] }]}>
                    <Text style={st.poolLetter}>{(s.profile?.full_name || '?')[0].toUpperCase()}</Text>
                  </View>
                  <View style={[st.poolDot, { backgroundColor: dot(s) }]} />
                </View>
                <Text style={st.poolName} numberOfLines={1}>
                  {firstName(s.profile?.full_name)}
                </Text>
                <Text style={st.poolStatus} numberOfLines={1}>
                  {status(s)}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {!!data?.invites.length && (
        <>
          <Text style={st.label}>IN PROGRESS</Text>
          <View style={st.listCard}>
            {data.invites.map((inv, i) => (
              <Pressable key={inv.id} accessibilityRole="button" onPress={() => openInvite(inv.id)} style={[st.row, i < data.invites.length - 1 && st.line]}>
                <View style={[st.smallAvatar, { backgroundColor: '#5F6D74' }]}>
                  <Text style={st.smallLetter}>{(inv.sitter_name || '?')[0].toUpperCase()}</Text>
                </View>
                <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
                  <Text style={st.rowTitle}>Invite to {inv.sitter_name || 'sitter'}</Text>
                  <Text style={st.rowSub}>
                    Code {inv.code} · expires {dayOf(inv.expires_at)}
                  </Text>
                </View>
                {inv.declined_at ? (
                  <View style={[st.pill, { backgroundColor: color.muted }]}>
                    <View style={[st.pillDot, { backgroundColor: '#8A979D' }]} />
                    <Text style={[st.pillText, { color: color.ink2 }]}>Declined</Text>
                  </View>
                ) : (
                  <View style={st.pill}>
                    <View style={[st.pillDot, { backgroundColor: color.warn }]} />
                    <Text style={st.pillText}>Waiting</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

// Avatar colors of the pool in wireframe P54, in order.
const AVATAR = [color.primary, '#5E7F6A', '#8A6A4E', '#6F6194', '#5F6D74'];

// Values from wireframe P54.
const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingHorizontal: 20, paddingBottom: 8 },
  title: { flexShrink: 1, fontFamily: font.display, fontSize: 26, color: color.ink },
  inviteBtn: { height: 36, paddingHorizontal: 12, borderRadius: 999, backgroundColor: color.primaryTint, flexDirection: 'row', alignItems: 'center', gap: 4 },
  inviteText: { fontFamily: font.bodyBold, fontSize: 14, color: color.primary },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  pool: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, paddingVertical: 14, paddingHorizontal: 10, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  poolItem: { width: 60, alignItems: 'center', gap: 4 },
  poolAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  poolLetter: { fontFamily: font.displayBold, fontSize: 23, color: '#FFFFFF' },
  poolDot: { position: 'absolute', right: 0, bottom: 0, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#FFFFFF' },
  poolName: { fontFamily: font.bodySemi, fontSize: 13, color: color.ink },
  poolStatus: { fontFamily: font.body, fontSize: 11, color: color.ink2 },
  // P54b
  empty: { alignItems: 'center', gap: 10, paddingTop: 28, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: font.display, fontSize: 22, color: color.ink, marginVertical: -4.62, marginTop: 4, textAlign: 'center' },
  emptyBody: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2, textAlign: 'center' },
  emptyBtn: { alignSelf: 'stretch', marginTop: 8 },
  listCard: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  smallAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  smallLetter: { fontFamily: font.displayBold, fontSize: 16, color: '#FFFFFF' },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  rowSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  pill: { alignSelf: 'flex-start', height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: color.warnTint, flexDirection: 'row', alignItems: 'center', gap: 6 },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontFamily: font.bodyBold, fontSize: 12, color: color.warnInk },
});
