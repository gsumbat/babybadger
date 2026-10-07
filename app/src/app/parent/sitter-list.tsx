import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, Share, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { SITTER_COLORS, shortName } from '@/components/addChild';
import { ErrorText, Icon, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { setupApi, type SitterAccess } from '@/lib/family-setup';
import { inviteMessage } from '@/lib/format';
import { inviteApi, type InviteRow } from '@/lib/invites';
import { requirementStatus } from '@/lib/requirements';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe P27 Sitters (Settings › Sitters), translated from app/src/wireframes/P27.tsx. P54 (the Sitters tab) is the
// pool at a glance; this is the full list to manage. Waiting invites and sitters who joined but haven't signed open
// P25; an expired invite can be resent (7 more days, then the share sheet) or removed; a declined one removed.
// Left out until built: active rows open P11 Sitter profile; the decline reason ("Weekdays don't work", not stored).
// The requirements part of an active row comes from lib/requirements: "· all requirements met", or "· 2 of 3
// requirements met" (not drawn); nothing when the family has no requirements. Not drawn: "Joined · reviewing consent"
// for a sitter who still has to sign (P27's "Opened · reviewing consent"), "Opened · hasn't joined yet", empty sections
// are hidden.
const EYE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#34526E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>';

type Req = Awaited<ReturnType<typeof requirementStatus>> | null;
type Row =
  | { kind: 'joined'; sitter: SitterAccess; index: number }
  | { kind: 'waiting' | 'expired' | 'declined'; invite: InviteRow };

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function confirmThen(title: string, body: string, action: string, go: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title} ${body}`)) go();
    return;
  }
  Alert.alert(title, body, [
    { text: 'Keep it', style: 'cancel' },
    { text: action, style: 'destructive', onPress: go },
  ]);
}

export default function SitterList() {
  const { family } = useSession();
  const fid = family!.id;
  const [err, setErr] = useState('');
  const { data, error, reload } = useQuery(async () => {
    const [sitters, kids, invites] = await Promise.all([
      setupApi.sitters(fid),
      api.kids(fid),
      supabase.from('invites').select('*').eq('family_id', fid).is('accepted_at', null).is('cancelled_at', null).order('created_at', { ascending: false }),
    ]);
    if (invites.error) throw new Error(invites.error.message);
    const active = sitters.filter((s) => s.status === 'active');
    const reqs = await Promise.all(active.map((s) => requirementStatus(fid, s.sitter_id).catch((): Req => null)));
    return { now: Date.now(), sitters, kids, invites: invites.data as InviteRow[], reqs: Object.fromEntries(active.map((s, i) => [s.sitter_id, reqs[i]])) as Record<string, Req> };
  }, [fid]);

  const sitters = data?.sitters ?? [];
  const active = sitters.filter((s) => s.status === 'active');
  const now = data?.now ?? 0;
  const stateOf = (inv: InviteRow): 'waiting' | 'expired' | 'declined' => (inv.declined_at ? 'declined' : +new Date(inv.expires_at) < now ? 'expired' : 'waiting');
  const order = { joined: 0, waiting: 0, expired: 1, declined: 2 };
  const rows: Row[] = [
    ...sitters.flatMap((s, index) => (s.status === 'needs_consent' ? [{ kind: 'joined' as const, sitter: s, index }] : [])),
    ...(data?.invites ?? []).map((invite) => ({ kind: stateOf(invite), invite })),
  ].sort((a, b) => order[a.kind] - order[b.kind]);

  const kidNames = (ids: string[] | null) => (data?.kids ?? []).filter((k) => ids == null || ids.includes(k.id)).map((k) => k.name).join(', ');
  const reqText = (r: Req) => (!r || !r.total ? '' : r.allMet ? 'all requirements met' : `${r.met} of ${r.total} requirements met`);

  const openInvite = (id: string) => router.push({ pathname: '/parent/invite/[id]', params: { id } });
  async function openJoined(sitterId: string) {
    try {
      const id = await inviteApi.acceptedBy(fid, sitterId);
      if (id) openInvite(id);
    } catch (e) {
      setErr(errorText(e));
    }
  }
  async function resend(inv: InviteRow) {
    setErr('');
    try {
      await setupApi.renewInvite(inv.id);
    } catch (e) {
      return setErr(errorText(e));
    }
    await reload();
    Share.share({ message: inviteMessage(family!.name, inv.code) }).catch(() => {});
  }
  function remove(inv: InviteRow) {
    confirmThen('Remove this invite?', `Code ${inv.code} stops working.`, 'Remove', async () => {
      try {
        await inviteApi.cancel(inv.id);
        await reload();
      } catch (e) {
        setErr(errorText(e));
      }
    });
  }

  return (
    <Screen
      gap={12}
      header={
        <View style={st.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={st.back}>
            <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
          </Pressable>
          <Text style={st.title}>Sitters</Text>
        </View>
      }
      footer={
        <Pressable accessibilityRole="button" onPress={() => router.push('/parent/invite')} style={st.inviteBtn}>
          <Icon name="plus" size={20} tint="#FFFFFF" strokeWidth={2.2} />
          <Text style={st.inviteText}>Invite a sitter</Text>
        </Pressable>
      }>
      <ErrorText>{error || err}</ErrorText>

      {active.length ? (
        <>
          <Text style={st.section}>ACTIVE</Text>
          <View style={st.card}>
            {active.map((s, i) => {
              const sub = [kidNames(s.kid_ids), reqText(data?.reqs[s.sitter_id] ?? null)].filter(Boolean).join(' · ');
              return (
                <View key={s.sitter_id} style={[st.row, i < active.length - 1 && st.line]}>
                  <View style={[st.avatar, { backgroundColor: SITTER_COLORS[sitters.indexOf(s) % SITTER_COLORS.length] }]}>
                    <Text style={st.avatarText}>{(s.profile?.full_name || '?')[0].toUpperCase()}</Text>
                  </View>
                  <View style={st.rowText}>
                    <Text style={st.name}>{shortName(s.profile?.full_name)}</Text>
                    {sub ? <Text style={st.sub}>{sub}</Text> : null}
                  </View>
                  <Pill kind="ok" label="Active" />
                </View>
              );
            })}
          </View>
        </>
      ) : null}

      {rows.length ? (
        <>
          <Text style={[st.section, { marginTop: 2 }]}>INVITES</Text>
          <View style={st.card}>
            {rows.map((r, i) => {
              const last = i === rows.length - 1;
              if (r.kind === 'joined')
                return (
                  <Pressable key={r.sitter.sitter_id} accessibilityRole="button" onPress={() => openJoined(r.sitter.sitter_id)} style={!last && st.line}>
                    <View style={st.row}>
                      <Letter name={r.sitter.profile?.full_name} bg="#5F6D74" />
                      <View style={st.rowText}>
                        <Text style={st.name}>{shortName(r.sitter.profile?.full_name)}</Text>
                        <Text style={st.sub}>Joined · reviewing consent</Text>
                      </View>
                      <Pill kind="warn" label="Waiting" />
                    </View>
                  </Pressable>
                );
              const inv = r.invite;
              const sent = `Sent ${shortDate(inv.created_at)} · ${inv.opened_at ? 'opened' : 'not opened'}`;
              if (r.kind === 'waiting')
                return (
                  <Pressable key={inv.id} accessibilityRole="button" onPress={() => openInvite(inv.id)} style={!last && st.line}>
                    <View style={st.row}>
                      <Letter name={inv.sitter_name} bg="#5F6D74" />
                      <View style={st.rowText}>
                        <Text style={st.name}>{shortName(inv.sitter_name)}</Text>
                        <Text style={st.sub}>{inv.opened_at ? 'Opened · hasn’t joined yet' : sent}</Text>
                      </View>
                      <Pill kind="warn" label="Waiting" />
                    </View>
                  </Pressable>
                );
              const declined = r.kind === 'declined';
              return (
                <View key={inv.id} style={!last && st.line}>
                  <View style={st.row}>
                    <Letter name={inv.sitter_name} bg={declined ? color.ink : '#5F6D74'} />
                    <View style={st.rowText}>
                      <Text style={st.name}>{shortName(inv.sitter_name)}</Text>
                      <Text style={st.sub}>{declined ? `Declined · ${shortDate(inv.declined_at!)}` : sent}</Text>
                    </View>
                    <Pill kind={declined ? 'bad' : 'muted'} label={declined ? 'Declined' : 'Expired'} />
                  </View>
                  <View style={st.actions}>
                    {declined ? null : (
                      <Pressable accessibilityRole="button" onPress={() => resend(inv)} style={[st.action, { backgroundColor: color.primaryTint }]}>
                        <Text style={[st.actionText, { color: color.primary }]}>Resend</Text>
                      </Pressable>
                    )}
                    <Pressable accessibilityRole="button" onPress={() => remove(inv)} style={st.action}>
                      <Text style={[st.actionText, { color: color.badInk }]}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : null}

      <View style={st.info}>
        <SvgXml xml={EYE} width={22} height={22} />
        <Text style={st.infoText}>Sitters who haven’t accepted see nothing about your family beyond the invite.</Text>
      </View>
    </Screen>
  );
}

function Letter({ name, bg }: { name?: string | null; bg: string }) {
  return (
    <View style={[st.avatar, { backgroundColor: bg }]}>
      <Text style={st.avatarText}>{(name || '?').trim()[0]?.toUpperCase() ?? '?'}</Text>
    </View>
  );
}

const PILL = {
  ok: [color.okTint, color.ok, color.okInk],
  warn: [color.warnTint, color.warn, color.warnInk],
  muted: [color.muted, '#8A979D', color.ink2],
  bad: [color.badTint, color.bad, color.badInk],
} as const;

function Pill({ kind, label }: { kind: keyof typeof PILL; label: string }) {
  const [bg, dot, ink] = PILL[kind];
  return (
    <View style={[st.pill, { backgroundColor: bg }]}>
      <View style={[st.pillDot, { backgroundColor: dot }]} />
      <Text style={[st.pillText, { color: ink }]}>{label}</Text>
    </View>
  );
}

// Values from wireframe P27. The header keeps 4 at the bottom: the wireframe has 8 and Screen's content adds 4.
const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { flexGrow: 1, flexShrink: 1, fontFamily: font.display, fontSize: 22, color: color.ink },
  section: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  card: { paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 68 },
  rowText: { flexGrow: 1, flexShrink: 1, minWidth: 0 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontFamily: font.displayBold, fontSize: 19, color: '#FFFFFF' },
  name: { fontFamily: font.bodySemi, fontSize: 16, color: color.ink },
  sub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 26, paddingHorizontal: 10, borderRadius: 999, flexShrink: 0 },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontFamily: font.bodyBold, fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8, paddingBottom: 12, paddingLeft: 56 },
  action: { height: 34, paddingHorizontal: 12, borderRadius: 999, flexDirection: 'row', alignItems: 'center' },
  actionText: { fontFamily: font.bodyBold, fontSize: 13 },
  info: { flexDirection: 'row', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 14 },
  infoText: { flexShrink: 1, fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink },
  inviteBtn: { height: 54, borderRadius: 999, backgroundColor: color.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  inviteText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
});
