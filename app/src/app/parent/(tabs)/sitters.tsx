import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { shortName } from '@/components/addChild';
import { MARKETPLACE } from '@/lib/features';
import { findComingSoon, openPool, openPoolWeek, PickTimeSheet } from '@/components/pool';
import { Button, ErrorText, Icon, Screen } from '@/components/ui';
import { useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { inviteApi, type InviteRow } from '@/lib/invites';
import { poolData, statusFor, tabLabel, tonightWindow, type DotKind } from '@/lib/pool';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe P54, translated from its HTML (app/src/wireframes/P54.tsx); P54b when there are no sitters and no
// open invites yet. "When do you need someone?": Today opens P42 Sitter pool for today (6 – 10 PM, or from the next
// half hour), This week opens P43 Who's free for this week, Pick a time opens the sheet (canvas P54d / P54f / P54g: Today /
// Week / Month) and then P42. The line under each pool avatar is real for today's window (lib/pool-logic): On shift,
// Free today, Until 9 PM, Busy (booked with this
// family), Away (a day off), Not free / No hours (her S11 hours), Needs to sign. An active sitter opens P11; one who
// still has to sign opens P25. IN PROGRESS: waiting invites open P25; expired ("Resend") and declined ones open P27,
// where they're resent or removed.
// Left out until built: Find a new sitter (P48: the card says "Coming soon", canvas P54e), meet requests (P53),
// saved sitters (P51).
export default function Sitters() {
  const { family } = useSession();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const [pool, invites] = await Promise.all([poolData(fid), openInvites(fid)]);
    return { ...pool, invites, now: new Date() };
  }, [fid]);
  const [picking, setPicking] = useState(false);

  // Windows follow the time of the last load (the tab reloads each time it's shown).
  const loadedAt = data?.now;
  const tonight = useMemo(() => tonightWindow(loadedAt ?? new Date()), [loadedAt]);
  const now = loadedAt ?? new Date();

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
  const invites = data?.invites ?? [];
  const nowMs = +now;
  const inviteState = (inv: InviteRow) => (inv.declined_at ? 'declined' : +new Date(inv.expires_at) < nowMs ? 'expired' : 'waiting');

  const findCard = (
    <Pressable accessibilityRole="button" onPress={findComingSoon} style={st.find}>
      <View style={st.findIcon}>
        <Icon name="search" size={24} />
      </View>
      <View style={{ flexGrow: 1, flexShrink: 1 }}>
        <Text style={st.findTitle}>Find a new sitter</Text>
        <Text style={st.findSub}>Coming soon: verified sitters near you</Text>
      </View>
      <Icon name="chevron-right" size={20} tint={color.primaryStrong} />
    </Pressable>
  );

  return (
    <Screen
      gap={12}
      header={
        // P54 header: 8 px under the title (the shared tab header uses 12).
        <View style={st.head}>
          <Text style={st.title}>Sitters</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/parent/invite')} style={st.inviteBtn}>
            <Icon name="plus" size={16} strokeWidth={2.2} />
            <Text style={st.inviteText}>Invite</Text>
          </Pressable>
        </View>
      }>
      <ErrorText>{error}</ErrorText>

      {data && !sitters.length && !invites.length ? (
        <>
          {/* P54b: no sitters yet. */}
          <View style={st.empty}>
            <View style={st.emptyIcon}>
              <Icon name="users" size={34} />
            </View>
            <Text style={st.emptyTitle}>No sitters yet</Text>
            <Text style={st.emptyBody}>Invite someone you already know and trust. They join your pool once they accept and sign the notice.</Text>
            <Button label="Invite a sitter" onPress={() => router.push('/parent/invite')} style={st.emptyBtn} />
          </View>
          {MARKETPLACE ? findCard : null}
        </>
      ) : null}

      {sitters.length ? (
        <>
          <View style={st.when}>
            <Text style={st.whenTitle}>When do you need someone?</Text>
            <View style={st.chips}>
              <Pressable accessibilityRole="button" onPress={() => openPool(tonight)} style={st.chip}>
                <Text style={st.chipText}>Today</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => openPoolWeek(new Date())} style={st.chip}>
                <Text style={st.chipText}>This week</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setPicking(true)} style={st.chip}>
                <Icon name="calendar" size={16} tint={color.ink} />
                <Text style={st.chipText}>{' '}Pick a time</Text>
              </Pressable>
            </View>
            <Text style={st.whenSub}>{MARKETPLACE ? 'We check your pool first, then show new sitters nearby.' : 'We check who in your pool is free.'}</Text>
          </View>

          <View style={st.labelRow}>
            <Text style={st.label}>YOUR POOL · {sitters.length}</Text>
            <Text accessibilityRole="link" onPress={() => openPool(tonight)} style={st.link}>
              See availability
            </Text>
          </View>
          <View style={st.pool}>
            {sitters.map((s, i) => {
              const { label, dot } = tabLabel(data ? statusFor(data, s.sitter_id, tonight, { onShiftNow: true }) : { state: 'no_hours' }, tonight, now);
              return (
                <Pressable key={s.sitter_id} accessibilityRole="button" onPress={() => (s.status === 'active' ? router.push({ pathname: '/parent/sitter/[id]', params: { id: s.sitter_id } }) : openSitter(s.sitter_id))} style={st.poolItem}>
                  <View>
                    <View style={[st.poolAvatar, { backgroundColor: AVATAR[i % AVATAR.length] }]}>
                      <Text style={st.poolLetter}>{(s.profile?.full_name || '?')[0].toUpperCase()}</Text>
                    </View>
                    <View style={[st.poolDot, { backgroundColor: DOT[dot] }]} />
                  </View>
                  <Text style={st.poolName} numberOfLines={1}>
                    {firstName(s.profile?.full_name)}
                  </Text>
                  <Text style={st.poolStatus} numberOfLines={1}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {MARKETPLACE ? findCard : null}
        </>
      ) : !sitters.length && invites.length ? (
        findCard
      ) : null}

      {invites.length ? (
        <>
          <Text style={st.label}>IN PROGRESS</Text>
          <View style={st.listCard}>
            {invites.map((inv, i) => {
              const state = inviteState(inv);
              const sub =
                state === 'expired'
                  ? `Expired ${shortDate(inv.expires_at)}`
                  : state === 'declined'
                    ? `Declined · ${shortDate(inv.declined_at!)}`
                    : inv.opened_at
                      ? 'Opened · hasn’t joined yet'
                      : `Sent ${shortDate(inv.created_at)} · not opened`;
              const pill = PILL[state];
              return (
                <Pressable
                  key={inv.id}
                  accessibilityRole="button"
                  onPress={() => (state === 'waiting' ? openInvite(inv.id) : router.push('/parent/sitter-list'))}
                  style={[st.row, i < invites.length - 1 && st.line]}>
                  <View style={[st.smallAvatar, { backgroundColor: state === 'declined' ? color.ink : '#5F6D74' }]}>
                    <Text style={st.smallLetter}>{(inv.sitter_name || '?').trim()[0]?.toUpperCase() ?? '?'}</Text>
                  </View>
                  <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
                    <Text style={st.rowTitle}>Invite to {shortName(inv.sitter_name)}</Text>
                    <Text style={st.rowSub}>{sub}</Text>
                  </View>
                  <View style={[st.pill, { backgroundColor: pill.bg }]}>
                    <View style={[st.pillDot, { backgroundColor: pill.dot }]} />
                    <Text style={[st.pillText, { color: pill.ink }]}>{pill.label}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <PickTimeSheet
        visible={picking}
        onClose={() => setPicking(false)}
        onPick={(w) => {
          setPicking(false);
          openPool(w);
        }}
      />
    </Screen>
  );
}

/** Invites not accepted or cancelled: waiting, expired (P54 "Expired Sep 29 · Resend") and declined. */
async function openInvites(familyId: string) {
  const r = await supabase.from('invites').select('*').eq('family_id', familyId).is('accepted_at', null).is('cancelled_at', null).order('created_at', { ascending: false });
  if (r.error) throw new Error(r.error.message);
  return r.data as InviteRow[];
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// Avatar colors of the pool in wireframe P54, in order.
const AVATAR = [color.primary, '#5E7F6A', '#8A6A4E', '#6F6194', '#5F6D74'];
// P54 dots: on shift green, free blue, busy / away grey, needs to sign amber.
const DOT: Record<DotKind, string> = { ok: color.ok, free: color.primary, grey: '#AEB8C2', warn: color.warn };
// P54 "Resend" pill; Waiting and Declined as on P27.
const PILL = {
  waiting: { bg: color.warnTint, dot: color.warn, ink: color.warnInk, label: 'Waiting' },
  expired: { bg: color.muted, dot: '#8A979D', ink: color.ink2, label: 'Resend' },
  declined: { bg: color.badTint, dot: color.bad, ink: color.badInk, label: 'Declined' },
};

// Values from wireframe P54.
const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingHorizontal: 20, paddingBottom: 8 },
  title: { flexShrink: 1, fontFamily: font.display, fontSize: 26, color: color.ink },
  inviteBtn: { height: 36, paddingHorizontal: 12, borderRadius: 999, backgroundColor: color.primaryTint, flexDirection: 'row', alignItems: 'center', gap: 4 },
  inviteText: { fontFamily: font.bodyBold, fontSize: 14, color: color.primary },
  when: { padding: 16, gap: 12, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  whenTitle: { fontFamily: font.display, fontSize: 19, color: color.ink, marginVertical: -4.22 },
  chips: { flexDirection: 'row', gap: 6, overflow: 'hidden' },
  chip: { height: 40, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
  chipText: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  whenSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  link: { fontFamily: font.bodyBold, fontSize: 14, color: color.primary, textDecorationLine: 'underline' },
  // Five avatars fill the row exactly (330 - 5 × 60 = 4 gaps of 7.5, P54's space-between); fewer keep the same gap.
  pool: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 7.5, rowGap: 12, paddingVertical: 14, paddingHorizontal: 10, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  poolItem: { width: 60, alignItems: 'center', gap: 4 },
  poolAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  poolLetter: { fontFamily: font.displayBold, fontSize: 23, color: '#FFFFFF' },
  poolDot: { position: 'absolute', right: 0, bottom: 0, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#FFFFFF' },
  poolName: { fontFamily: font.bodySemi, fontSize: 13, color: color.ink },
  // white-space: nowrap in P54: a longer line ("Needs to sign") runs past the 60 px column instead of wrapping.
  poolStatus: { width: 84, marginHorizontal: -12, textAlign: 'center', fontFamily: font.body, fontSize: 11, color: color.ink2 },
  find: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: color.primaryTint, borderRadius: 24 },
  findIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  findTitle: { fontFamily: font.display, fontSize: 18, color: color.primaryStrong, marginVertical: -3.42 },
  findSub: { fontFamily: font.body, fontSize: 13, color: color.primaryStrong },
  // P54b
  empty: { alignItems: 'center', gap: 10, paddingTop: 28, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: font.display, fontSize: 22, color: color.ink, marginVertical: -4.62, marginTop: 4, textAlign: 'center' },
  emptyBody: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2, textAlign: 'center' },
  emptyBtn: { alignSelf: 'stretch', marginTop: 8 },
  listCard: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  smallAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  smallLetter: { fontFamily: font.displayBold, fontSize: 16, color: '#FFFFFF' },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  rowSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  // Vertically centred in the row, like P54 (align-items: center); never squeezed by a long name.
  pill: { flexShrink: 0, height: 26, paddingHorizontal: 10, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6 },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontFamily: font.bodyBold, fontSize: 12 },
});
