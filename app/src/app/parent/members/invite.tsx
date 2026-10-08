import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, Share, StyleSheet, View } from 'react-native';

import { AccessSwitch, BackHeader, memberStyles as ms, RowsCard } from '@/components/familyMembers';
import { SelectField } from '@/components/SelectField';
import { Text } from '@/components/Text';
import { Button, ErrorText, Field, Icon, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import {
  can,
  defaultRole,
  emailOk,
  managesSeatsLine,
  MAX_FAMILY_MEMBERS,
  memberErrorText,
  memberInviteSubject,
  memberInviteText,
  memberLinkUrl,
  ownerFirstName,
  RELATIONS,
  roleLabel,
  seatsLine,
  seatsUsed,
  shortDay,
  type MemberInvite,
  type MemberRole,
  type Relation,
} from '@/lib/family-members';
import { membersApi } from '@/lib/family-members-api';
import { inviteMailto } from '@/lib/invite-links';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';

// Wireframes P78b Add a family member (Full access on), P78br (off = Read only) and P78s Invite sent. Only the owner
// (migration 32) gets here. "4 seats · 2 used" on top; a name, the relation (SelectField), the "Full access" switch
// (Mom and Dad start on, relatives off, until it's touched; the line under it says what that access does) and an
// optional email (locks the link to that email, migration 30). Send by text / Email / Copy link make the babybadger.app/m/<token> link on the
// first tap (invite_family_member), stamp it sent and show P78s. Editing the form after the link was made cancels that
// link and makes a new one. `?id=<invite>` opens P78s for an invite from the P78 list.
// Not drawn: a phone number (sign-in is by email; Send by text picks the person in the share sheet).
type Form = { name: string; relation: Relation | ''; role: MemberRole; email: string };
type Made = { id: string; link_token: string; expires_at: string; saved: Form };

export default function InviteMember() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { family, profile, familyRole, isOwner } = useSession();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const [list, kids] = await Promise.all([membersApi.list(fid, profile!.id), api.kids(fid).catch(() => [])]);
    return { ...list, kids: kids.map((k) => k.name.trim().split(/\s+/)[0]) };
  }, [fid]);
  const [sent, setSent] = useState<Made | null>(null);
  if (!data && !error) return <Loading />;
  if (!can(familyRole, 'manage_members', data?.i_own ?? isOwner))
    return (
      <Screen gap={12} header={<BackHeader title="Add a family member" />}>
        <Text style={ms.lead}>{managesSeatsLine(ownerFirstName(data?.members ?? []))}</Text>
      </Screen>
    );
  const existing = params.id ? data?.invites.find((i) => i.id === params.id) : undefined;
  const kids = data?.kids ?? [];
  const textFor = (name: string, token: string) => memberInviteText({ name, from: profile?.full_name, family: family?.name, kids, token });
  if (existing)
    return <Sent invite={existing} used={seatsUsed(data!.members, data!.invites, data!.seats_used)} textFor={textFor} />;
  if (sent)
    return (
      <Sent
        invite={{ id: sent.id, link_token: sent.link_token, expires_at: sent.expires_at, name: sent.saved.name.trim(), relation: sent.saved.relation || null, role: sent.saved.role, email: sent.saved.email.trim() || null }}
        used={seatsUsed(data?.members ?? [], data?.invites ?? [], data?.seats_used) + 1}
        textFor={textFor}
      />
    );
  return <InviteForm kids={kids} used={seatsUsed(data?.members ?? [], data?.invites ?? [], data?.seats_used)} textFor={textFor} onSent={setSent} loadErr={error} />;
}

// ---------------------------------------------------------------- P78b
function InviteForm({ kids, used, textFor, onSent, loadErr }: { kids: string[]; used: number; textFor: (name: string, token: string) => string; onSent: (m: Made) => void; loadErr: string }) {
  const { family, profile } = useSession();
  const [f, setF] = useState<Form>({ name: '', relation: '', role: 'helper', email: '' });
  const [rolePicked, setRolePicked] = useState(false);
  const [made, setMade] = useState<Made | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const ready = f.name.trim().length > 0 && emailOk(f.email);

  /** Makes the link on the first tap (a changed form replaces it). */
  async function ensure(): Promise<Made | null> {
    setErr('');
    try {
      if (made && JSON.stringify(made.saved) === JSON.stringify(f)) return made;
      if (made) await membersApi.cancel(made.id).catch(() => {});
      const r = await membersApi.invite(family!.id, f);
      const m = { ...r, saved: f };
      setMade(m);
      return m;
    } catch (e) {
      setErr(memberErrorText(errorText(e), f.name.trim() || 'them'));
      return null;
    }
  }

  async function run(action: (m: Made) => Promise<boolean>) {
    setBusy(true);
    try {
      const m = await ensure();
      if (m && (await action(m))) {
        await membersApi.sent(m.id).catch(() => {});
        onSent(m);
      }
    } finally {
      setBusy(false);
    }
  }

  // The preview shows the link shortened, as the board draws it.
  const zero = '0'.repeat(40);
  const [before] = textFor(f.name, zero).split(memberLinkUrl(zero));
  const shortLink = made ? `babybadger.app/m/${made.link_token.slice(0, 4)}…` : 'babybadger.app/m/…';

  return (
    <Screen
      gap={12}
      header={<BackHeader title="Add a family member" />}
      footer={
        <View style={{ gap: 8, marginTop: -4 }}>
          <Button
            label="Send by text"
            busy={busy}
            disabled={!ready}
            onPress={() =>
              run(async (m) => {
                const r = await Share.share({ message: textFor(f.name, m.link_token) });
                return r.action === Share.sharedAction;
              })
            }
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              accessibilityRole="button"
              disabled={busy || !ready}
              onPress={() =>
                run(async (m) => {
                  await Linking.openURL(inviteMailto(f.email.trim() || null, memberInviteSubject(profile?.full_name, family?.name), textFor(f.name, m.link_token))).catch(() => {});
                  return true;
                })
              }
              style={[ms.tonalBtn, !ready && { opacity: 0.5 }]}>
              <Text style={ms.tonalText}>Email</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={busy || !ready}
              onPress={() =>
                run(async (m) => {
                  await Clipboard.setStringAsync(memberLinkUrl(m.link_token));
                  return true;
                })
              }
              style={[ms.tonalBtn, !ready && { opacity: 0.5 }]}>
              <Text style={ms.tonalText}>Copy link</Text>
            </Pressable>
          </View>
        </View>
      }>
      <Text style={st.muted14}>{seatsLine(used)}</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Field label="Name" value={f.name} onChangeText={(name) => setF((x) => ({ ...x, name }))} placeholder="Sue" autoCapitalize="words" style={st.input48} />
        </View>
        <SelectField<Relation>
          label="Relation"
          value={f.relation}
          options={RELATIONS.map((r) => ({ value: r, label: r }))}
          onChange={(relation) => setF((x) => ({ ...x, relation, role: rolePicked ? x.role : defaultRole(relation) }))}
          style={{ flex: 1 }}
        />
      </View>
      <Text style={[ms.section, { marginTop: 2 }]}>ACCESS</Text>
      <AccessSwitch
        role={f.role}
        onChange={(role) => {
          setRolePicked(true);
          setF((x) => ({ ...x, role }));
        }}
      />
      <Field
        label="Email (optional)"
        value={f.email}
        onChangeText={(email) => setF((x) => ({ ...x, email }))}
        placeholder="sue@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        hint={emailOk(f.email) ? undefined : 'Check the email.'}
        style={st.input48}
      />
      <Text style={[st.muted14, { marginTop: 2 }]}>They’ll get this:</Text>
      <View style={st.msgCard}>
        <Text style={st.msg}>
          {before}
          <Text style={st.msgLink}>{shortLink}</Text>
        </Text>
      </View>
      <ErrorText>{err || loadErr}</ErrorText>
    </Screen>
  );
}

// ---------------------------------------------------------------- P78s
type SentInvite = Pick<MemberInvite, 'id' | 'link_token' | 'expires_at' | 'name' | 'relation' | 'role' | 'email'>;

function Sent({ invite, used, textFor }: { invite: SentInvite; used: number; textFor: (name: string, token: string) => string }) {
  const [copied, setCopied] = useState(false);
  const name = invite.name.split(/\s+/)[0] || 'them';
  const done = () => (router.canGoBack() ? router.back() : router.replace('/parent/members'));
  return (
    <Screen
      gap={12}
      header={<BackHeader title="Invite sent" onBack={done} />}
      footer={
        <View style={{ gap: 8, marginTop: -4 }}>
          <Button label="Done" onPress={done} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable accessibilityRole="button" onPress={() => void Share.share({ message: textFor(invite.name, invite.link_token) })} style={ms.tonalBtn}>
              <Text style={ms.tonalText}>Send again</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={async () => {
                await Clipboard.setStringAsync(memberLinkUrl(invite.link_token));
                setCopied(true);
              }}
              style={ms.tonalBtn}>
              <Text style={ms.tonalText}>{copied ? 'Copied' : 'Copy link'}</Text>
            </Pressable>
          </View>
        </View>
      }>
      <View style={st.sentCard}>
        <View style={st.check}>
          <Icon name="check" size={28} tint={color.okInk} strokeWidth={2.2} />
        </View>
        <View style={{ flexGrow: 1, flexShrink: 1, gap: 2 }}>
          <Text style={st.sentTitle}>{`Invite sent to ${name}`}</Text>
          <Text style={st.sentSub}>{[invite.relation, roleLabel(invite.role)].filter(Boolean).join(' · ')}</Text>
        </View>
      </View>
      <RowsCard>
        <InfoRow label="To" value={invite.email ? `${name} · ${invite.email}` : name} />
        <InfoRow label="Link works" value={`Until ${shortDay(invite.expires_at)}`} />
        <InfoRow label="Seats" value={`${Math.min(used, MAX_FAMILY_MEMBERS)} of ${MAX_FAMILY_MEMBERS} used with ${name}`} last />
      </RowsCard>
      <Text style={ms.note13}>
        {invite.email
          ? `${name} opens the link and signs in with ${invite.email}. They join right away, covered by your plan. We’ll let you know.`
          : `${name} opens the link and signs in. They join right away, covered by your plan. We’ll let you know.`}
      </Text>
    </Screen>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[st.infoRow, !last && ms.line]}>
      <Text style={st.infoLabel}>{label}</Text>
      <Text style={st.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

// Values from wireframes P78b (P24 / S52 footer and message card) and P78s.
const st = StyleSheet.create({
  input48: { minHeight: 48, height: 48, borderColor: color.lineStrong },
  muted14: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  msgCard: { paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  msg: { fontFamily: font.body, fontSize: 15, lineHeight: 21, color: color.ink },
  msgLink: { color: color.primaryStrong, textDecorationLine: 'underline' },
  sentCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  check: { width: 48, height: 48, borderRadius: 24, backgroundColor: color.okTint, alignItems: 'center', justifyContent: 'center' },
  sentTitle: { fontFamily: font.display, fontSize: 20, lineHeight: 24, color: color.ink },
  sentSub: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, minHeight: 48 },
  infoLabel: { fontFamily: font.body, fontSize: 15, color: color.ink },
  infoValue: { flexShrink: 1, fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
});
