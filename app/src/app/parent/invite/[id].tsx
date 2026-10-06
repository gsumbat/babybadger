import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { ErrorText, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { dayOf, firstName, inviteMessage, timeOf } from '@/lib/format';
import { inviteApi, stepsDone, type InviteRow, type InviteStep } from '@/lib/invites';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import type { Kid } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframes P25 Invite pending (app/src/wireframes/P25.tsx) and P26 Invite accepted (P26.tsx). Opened after sending
// an invite (P24) and from the Sitters tab (an invite in progress, or a sitter who still has to sign). Once the
// sitter has signed the notice, the same screen shows P26. It checks again every 15 seconds while open.

// Check marks from the wireframes (P25 15 px, P26 18 px).
const TICK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export default function InviteStatus() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { family } = useSession();
  const fid = family!.id;
  const { data, error, reload } = useQuery(async () => {
    const invite = await inviteApi.get(id!);
    const sitter = invite.accepted_by ? await inviteApi.sitterOf(fid, invite.accepted_by) : null;
    const signed = sitter?.link?.status === 'active';
    const kids = signed ? await api.kids(fid) : [];
    return { invite, sitter, signed, kids };
  }, [id, fid]);

  useEffect(() => {
    if (data?.signed) return;
    const t = setInterval(() => void reload(), 15000);
    return () => clearInterval(t);
  }, [data?.signed, reload]);

  if (!data) return error ? <Screen title="Invite" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const name = firstName(data.sitter?.profile?.full_name || data.invite.sitter_name);
  if (data.signed) return <Accepted name={name} signedAt={data.sitter?.signedAt ?? data.invite.accepted_at} kidIds={data.sitter?.link?.kid_ids ?? null} kids={data.kids} />;
  return <Pending invite={data.invite} name={name} familyName={family!.name} />;
}

// ---------------------------------------------------------------- P25
// Left out until built: the Credentials step (sitter requirements, P28–P32), "See it from Maya’s side · Open her
// text" (no text is sent from the app), the Reminder row (no reminders are sent). "Copy link" copies the invite
// text, as on P24.
function Pending({ invite, name, familyName }: { invite: InviteRow; name: string; familyName: string }) {
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState('');
  const accepted = !!invite.accepted_at;
  const declined = !!invite.declined_at;
  const done = stepsDone(invite, false);
  const msg = inviteMessage(familyName, invite.code);
  const steps: { key: InviteStep; title: string; sub: string }[] = [
    { key: 'sent', title: 'Invite sent', sub: `${dayOf(invite.created_at)} ${timeOf(invite.created_at)}` },
    { key: 'opened', title: 'Opened', sub: invite.opened_at ? `${name} entered the code · ${timeOf(invite.opened_at)}` : `${name} enters the code` },
    { key: 'reviewing', title: 'Reviewing what you’ll see', sub: 'She agrees to location sharing and signs the notice' },
    { key: 'ready', title: 'Ready to book', sub: 'You can send her a first shift' },
  ];
  const current = steps.find((s) => !done.includes(s.key))?.key;

  async function cancel() {
    try {
      await inviteApi.cancel(invite.id);
      router.back();
    } catch (e) {
      setErr(errorText(e));
    }
  }

  return (
    <Screen
      title={name}
      back
      gap={12}
      right={
        declined ? (
          <View style={[st.pill, { backgroundColor: color.muted }]}>
            <View style={[st.pillDot, { backgroundColor: '#8A979D' }]} />
            <Text style={[st.pillText, { color: color.ink2 }]}>Declined</Text>
          </View>
        ) : (
          <View style={[st.pill, { backgroundColor: color.warnTint }]}>
            <View style={[st.pillDot, { backgroundColor: color.warn }]} />
            <Text style={[st.pillText, { color: color.warnInk }]}>Waiting</Text>
          </View>
        )
      }
      footer={
        accepted ? undefined : (
          <View style={{ gap: 4, marginTop: -4 }}>
            {!declined && (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable accessibilityRole="button" onPress={() => Share.share({ message: msg })} style={st.tonalBtn}>
                  <Text style={st.tonalText}>Resend</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={async () => {
                    await Clipboard.setStringAsync(msg);
                    setCopied(true);
                  }}
                  style={st.tonalBtn}>
                  <Text style={st.tonalText}>{copied ? 'Copied' : 'Copy invite'}</Text>
                </Pressable>
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                Alert.alert('Cancel invite?', `Code ${invite.code} stops working.`, [
                  { text: 'Keep it', style: 'cancel' },
                  { text: 'Cancel invite', style: 'destructive', onPress: cancel },
                ])
              }
              style={st.cancelBtn}>
              <Text style={st.cancelText}>Cancel invite</Text>
            </Pressable>
          </View>
        )
      }>
      <View style={st.timeline}>
        {steps.map((s, i) => {
          const isDone = done.includes(s.key);
          const isNow = s.key === current;
          const last = i === steps.length - 1;
          return (
            <View key={s.key} style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ alignItems: 'center', gap: 3 }}>
                {isDone ? (
                  <View style={[st.node, { backgroundColor: color.ok }]}>
                    <SvgXml xml={TICK} width={15} height={15} />
                  </View>
                ) : isNow ? (
                  <View style={[st.node, st.nodeNow]}>
                    <View style={st.nodeDot} />
                  </View>
                ) : (
                  <View style={[st.node, st.nodeLater]} />
                )}
                {!last && <View style={[st.connector, { backgroundColor: isDone ? color.ok : '#DDE3EA' }]} />}
              </View>
              <View style={{ flexShrink: 1, paddingBottom: 10 }}>
                <Text style={[st.stepTitle, !isDone && !isNow && { color: '#5F6D74' }]}>{s.title}</Text>
                <Text style={st.stepSub}>{s.sub}</Text>
              </View>
            </View>
          );
        })}
      </View>
      {!accepted && (
        <View style={st.facts}>
          <View style={st.fact}>
            <Text style={st.factKey}>Expires</Text>
            <Text style={st.factVal}>{dayOf(invite.expires_at)}</Text>
          </View>
        </View>
      )}
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

// ---------------------------------------------------------------- P26
// Left out until built: the Requirements row (P28–P32) and "See her profile" (P11).
function Accepted({ name, signedAt, kidIds, kids }: { name: string; signedAt: string | null; kidIds: string[] | null; kids: Kid[] }) {
  const lookAfter = kids.filter((k) => !kidIds || kidIds.includes(k.id)).map((k) => k.name);
  const when = signedAt ? `Accepted ${dayOf(signedAt).replace(/^(Today|Tomorrow)$/, (d) => d.toLowerCase())} at ${timeOf(signedAt)}` : '';
  const signedPill = (
    <View style={[st.pill, { backgroundColor: color.okTint }]}>
      <View style={[st.pillDot, { backgroundColor: color.ok }]} />
      <Text style={[st.pillText, { color: color.okInk }]}>Signed</Text>
    </View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.canvas }} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={st.accBody}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <View style={{ width: 112, height: 112 }}>
            <View style={st.halo} />
            <View style={st.bigAvatar}>
              <Text style={st.bigLetter}>{name[0]?.toUpperCase()}</Text>
            </View>
            <View style={st.badge}>
              <SvgXml xml={TICK} width={18} height={18} />
            </View>
          </View>
          <Text style={st.accTitle}>{name} joined your family</Text>
          {when ? <Text style={st.accSub}>{when}</Text> : null}
        </View>
        <View style={st.facts}>
          <View style={[st.fact, st.line]}>
            <Text style={st.factKey}>Location consent</Text>
            {signedPill}
          </View>
          <View style={[st.fact, !!lookAfter.length && st.line]}>
            <Text style={st.factKey}>Monitoring notice</Text>
            {signedPill}
          </View>
          {lookAfter.length ? (
            <View style={st.fact}>
              <Text style={st.factKey}>Can look after</Text>
              <Text style={st.factVal}>{lookAfter.join(', ')}</Text>
            </View>
          ) : null}
        </View>
        <View style={st.info}>
          <Text style={st.infoText}>
            <Text style={st.infoBold}>Nothing is shared yet.</Text> Location sharing starts only when {name} clocks in for a shift.
          </Text>
        </View>
        <View style={{ flexGrow: 1 }} />
        <Pressable accessibilityRole="button" onPress={() => router.push('/parent/shift/new')} style={st.primaryBtn}>
          <Text style={st.primaryText}>Book her first shift</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// Values from wireframes P25 and P26.
const st = StyleSheet.create({
  pill: { alignSelf: 'center', height: 26, paddingHorizontal: 10, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontFamily: font.bodyBold, fontSize: 12 },
  timeline: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 6, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  node: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  nodeNow: { backgroundColor: '#FFFFFF', borderWidth: 3, borderColor: color.primary },
  nodeDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: color.primary },
  nodeLater: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: color.lineStrong },
  connector: { width: 2, minHeight: 14, flexGrow: 1 },
  stepTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  stepSub: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  facts: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 16, ...cardShadow },
  fact: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 48 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  factKey: { flexShrink: 1, fontFamily: font.body, fontSize: 15, color: color.ink },
  factVal: { flexShrink: 1, fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  tonalBtn: { flex: 1, height: 48, borderRadius: 999, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  tonalText: { fontFamily: font.displayBold, fontSize: 17, color: color.primary },
  cancelBtn: { height: 40, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontFamily: font.bodySemi, fontSize: 15, color: color.badInk },
  // P26
  accBody: { flexGrow: 1, gap: 16, paddingTop: 60, paddingHorizontal: 20, paddingBottom: 32 },
  halo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 56, backgroundColor: color.primaryTint },
  bigAvatar: { position: 'absolute', top: 18, left: 18, width: 76, height: 76, borderRadius: 38, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  bigLetter: { fontFamily: font.display, fontSize: 33, color: '#FFFFFF', textAlign: 'center' },
  badge: { position: 'absolute', right: 2, bottom: 4, width: 34, height: 34, borderRadius: 17, borderWidth: 3, borderColor: color.canvas, backgroundColor: color.ok, alignItems: 'center', justifyContent: 'center' },
  accTitle: { fontFamily: font.display, fontSize: 28, color: color.ink, marginVertical: -5.43, textAlign: 'center' },
  accSub: { fontFamily: font.body, fontSize: 15, color: color.ink2, textAlign: 'center' },
  info: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: color.primaryTint },
  infoText: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  infoBold: { fontFamily: font.bodyBold, color: color.primaryStrong },
  primaryBtn: { height: 54, borderRadius: 999, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
});
