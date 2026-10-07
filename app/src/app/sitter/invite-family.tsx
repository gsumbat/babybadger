import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Platform, Pressable, Share, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { Button, ErrorText, Field, Icon, Loading, Pill, Screen } from '@/components/ui';
import { useQuery } from '@/lib/data';
import { emailOk, familyInviteSubject, familyInviteText, familyLinkUrl, referralPill, referralSub, referralTitle, type Referral } from '@/lib/family-links';
import { familyLinkApi } from '@/lib/family-referrals';
import { inviteMailto } from '@/lib/invite-links';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';

// Wireframes S52 Invite a family and S52b Family invites (sent list). Opened from Me (S39) "Invite a family you sit
// for". A sitter invites a family she ALREADY sits for (phase 1: no marketplace; a family only reaches her through
// her own link). Send by text / Email / Copy link make the babybadger.app/f/<token> link (migration 29) on the first
// tap; the family's page is S0f, and when a parent connects (P3d) she gets "The Kim family joined BabyBadger" and the
// family's invite shows here as "Joined · review" (opens S1 through /i/<token>).
// With invites already sent the screen opens on the list (S52b); "Invite another family" opens the form.
// Not drawn: the empty list (she lands on the form instead), and before migration 29 runs (the form shows, sharing
// says the database needs the update).
type Details = { parent_name: string; family_name: string; email: string };

export default function InviteFamily() {
  const params = useLocalSearchParams<{ new?: string }>();
  const { profile } = useSession();
  const { data: list, reload, error } = useQuery(() => familyLinkApi.mine(), []);
  const [form, setForm] = useState(params.new === '1');
  if (list === undefined && !error) return <Loading />;
  if (form || !list?.length)
    return (
      <InviteForm
        sitter={profile?.full_name ?? ''}
        hasList={!!list?.length}
        onDone={async () => {
          await reload();
          setForm(false);
        }}
      />
    );
  return <SentList list={list} sitter={profile?.full_name ?? ''} reload={reload} onNew={() => setForm(true)} error={error} />;
}

// ---------------------------------------------------------------- S52
function InviteForm({ sitter, hasList, onDone }: { sitter: string; hasList: boolean; onDone: () => Promise<void> }) {
  const [d, setD] = useState<Details>({ parent_name: '', family_name: '', email: '' });
  const [made, setMade] = useState<{ id: string; token: string; saved: Details } | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: keyof Details) => (v: string) => {
    setCopied(false);
    setD((x) => ({ ...x, [k]: v }));
  };

  /** Makes the link on the first tap (or saves edited details), and returns its token. */
  async function ensure(): Promise<string | null> {
    setErr('');
    try {
      if (!made) {
        const r = await familyLinkApi.create(d);
        setMade({ ...r, saved: d });
        return r.token;
      }
      if (JSON.stringify(made.saved) !== JSON.stringify(d)) {
        await familyLinkApi.update(made.id, d);
        setMade({ ...made, saved: d });
      }
      return made.token;
    } catch (e) {
      setErr(errorText(e));
      return null;
    }
  }

  async function run(action: (token: string) => Promise<boolean>) {
    setBusy(true);
    try {
      const token = await ensure();
      if (token && (await action(token))) await onDone();
    } finally {
      setBusy(false);
    }
  }

  const textFor = (token: string) => familyInviteText({ parent: d.parent_name, sitter, token });
  // The preview shows the link shortened, as the board draws it.
  const preview = familyInviteText({ parent: d.parent_name, sitter, token: '0'.repeat(40) });
  const [before] = preview.split(familyLinkUrl('0'.repeat(40)));
  const shortLink = made ? `babybadger.app/f/${made.token.slice(0, 4)}…` : 'babybadger.app/f/…';

  return (
    <Screen
      title="Invite a family"
      back
      onBack={hasList ? () => void onDone() : undefined}
      gap={12}
      footer={
        <View style={{ gap: 8, marginTop: -4 }}>
          <Button
            label="Send by text"
            busy={busy}
            disabled={!emailOk(d.email)}
            onPress={() =>
              run(async (token) => {
                const r = await Share.share({ message: textFor(token) });
                return r.action === Share.sharedAction;
              })
            }
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              accessibilityRole="button"
              disabled={busy || !emailOk(d.email)}
              onPress={() =>
                run(async (token) => {
                  await Linking.openURL(inviteMailto(d.email.trim() || null, familyInviteSubject(sitter), textFor(token))).catch(() => {});
                  return true;
                })
              }
              style={st.tonalBtn}>
              <Text style={st.tonalText}>Email</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={busy || !emailOk(d.email)}
              onPress={() =>
                run(async (token) => {
                  await Clipboard.setStringAsync(familyLinkUrl(token));
                  setCopied(true);
                  return false;
                })
              }
              style={st.tonalBtn}>
              <Text style={st.tonalText}>{copied ? 'Copied' : 'Copy link'}</Text>
            </Pressable>
          </View>
        </View>
      }>
      <Text style={st.lead}>A family you already sit for. They see your shifts with their kids and choose what you see.</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Field label="Parent’s first name" value={d.parent_name} onChangeText={set('parent_name')} placeholder="Dana" autoCapitalize="words" style={st.input48} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Field label="Family name" value={d.family_name} onChangeText={set('family_name')} placeholder="The Kim family" autoCapitalize="words" style={st.input48} />
        </View>
      </View>
      <Field
        label="Email (optional)"
        value={d.email}
        onChangeText={set('email')}
        placeholder="dana@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        hint={emailOk(d.email) ? undefined : 'Check the email.'}
        style={st.input48}
      />
      <Text style={[st.muted14, { marginTop: 2 }]}>They’ll get this:</Text>
      <View style={st.msgCard}>
        <Text style={st.msg}>
          {before}
          <Text style={st.msgLink}>{shortLink}</Text>
        </Text>
      </View>
      <View style={st.info}>
        <Icon name="shield" size={24} tint={color.primary} />
        <View style={{ flexShrink: 1, gap: 4 }}>
          <Text style={st.infoTitle}>Only through your link</Text>
          <Text style={st.infoBody}>Families find you only from a link you send. They choose what you see, and you accept first.</Text>
        </View>
      </View>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

// ---------------------------------------------------------------- S52b
function SentList({ list, sitter, reload, onNew, error }: { list: Referral[]; sitter: string; reload: () => Promise<void>; onNew: () => void; error: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState('');

  async function resend(r: Referral) {
    setBusy(r.id);
    setErr('');
    try {
      await familyLinkApi.resend(r.id);
      await Share.share({ message: familyInviteText({ parent: r.parent_name, sitter, token: r.token }) });
      await reload();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(null);
    }
  }

  async function cancel(r: Referral) {
    const go = async () => {
      setBusy(r.id);
      setErr('');
      try {
        await familyLinkApi.cancel(r.id);
        await reload();
      } catch (e) {
        setErr(errorText(e));
      } finally {
        setBusy(null);
      }
    };
    const q = `Cancel the invite to ${referralTitle(r)}?`;
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(q)) await go();
      return;
    }
    Alert.alert(q, 'The link stops working.', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel invite', style: 'destructive', onPress: () => void go() },
    ]);
  }

  return (
    <Screen title="Family invites" back gap={12} footer={<Button label="Invite another family" onPress={onNew} style={{ marginTop: -4 }} />}>
      <Text style={st.lead}>Families you sit for, invited from your phone. When one joins, you review their invite.</Text>
      <Text style={st.label}>SENT</Text>
      {list.map((r) => {
        const pill = referralPill(r);
        return (
          <View key={r.id} style={[st.card, busy === r.id && { opacity: 0.6 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={st.cardTitle} numberOfLines={1}>
                {referralTitle(r)}
              </Text>
              <Pill label={pill.label} kind={pill.kind} />
            </View>
            <Text style={st.cardSub}>{referralSub(r)}</Text>
            {r.status === 'used' ? (
              r.invite_token ? (
                <View style={st.links}>
                  <Text accessibilityRole="link" style={st.link} onPress={() => router.push(`/i/${r.invite_token}`)}>
                    Review invite
                  </Text>
                </View>
              ) : null
            ) : (
              <View style={st.links}>
                <Text accessibilityRole="link" style={st.link} onPress={busy ? undefined : () => void resend(r)}>
                  Resend
                </Text>
                <Text accessibilityRole="link" style={[st.link, { color: color.badInk }]} onPress={busy ? undefined : () => void cancel(r)}>
                  Cancel
                </Text>
              </View>
            )}
          </View>
        );
      })}
      <Text style={st.note}>Links work for 30 days. Up to 20 open invites.</Text>
      <ErrorText>{err || error}</ErrorText>
    </Screen>
  );
}

// Values from wireframes S52 and S52b (S52's footer is P24's; S52b's cards are S12's family cards).
const st = StyleSheet.create({
  lead: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  input48: { minHeight: 48, height: 48, borderColor: color.lineStrong },
  muted14: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  msgCard: { paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  msg: { fontFamily: font.body, fontSize: 15, lineHeight: 21, color: color.ink },
  msgLink: { color: color.primaryStrong, textDecorationLine: 'underline' },
  info: { flexDirection: 'row', gap: 12, backgroundColor: color.primaryTint, borderRadius: 16, padding: 16 },
  infoTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.primaryStrong },
  infoBody: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  tonalBtn: { flex: 1, height: 48, borderRadius: 999, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  tonalText: { fontFamily: font.displayBold, fontSize: 17, color: color.primary },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  card: { gap: 8, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  cardTitle: { flexGrow: 1, flexShrink: 1, fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  cardSub: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  links: { flexDirection: 'row', gap: 16 },
  link: { fontFamily: font.bodySemi, fontSize: 14, color: color.primary, textDecorationLine: 'underline' },
  note: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2, textAlign: 'center' },
});
