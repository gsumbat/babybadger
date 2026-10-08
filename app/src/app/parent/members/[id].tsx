import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AccessSwitch, BackHeader, DangerButton, MemberAvatar, memberColor, MemberRolePill, memberStyles as ms, RowsCard } from '@/components/familyMembers';
import { Text } from '@/components/Text';
import { ErrorText, Icon, type IconName, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { can, isOwnerMember, memberErrorText, ownerFirstName, shortDay, type MemberRole } from '@/lib/family-members';
import { membersApi } from '@/lib/family-members-api';
import { namesLine } from '@/lib/invite-links';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { color, font } from '@/theme';

// Wireframes P78c Family member (the owner looks at Sue, read only), P78g (the owner looks at Sam, full access), P78t
// Make Sam the owner (confirm) and P78e You (read only). Only the owner changes someone's access (the "Full access"
// switch saves at once), hands the family over ("Make Sam the owner", full-access members only) or removes someone.
// Anyone but the owner can leave; the owner makes someone else the owner first (the database checks all of it).
// Anyone else looking at a member sees their pill only.
// Not drawn: you with full access (P78e's layout with the full-access rows), the owner looking at herself (no Leave).
function confirmThen(title: string, body: string, action: string, go: () => void, destructive = true) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title} ${body}`)) go();
    return;
  }
  Alert.alert(title, body, [
    { text: 'Keep', style: 'cancel' },
    { text: action, style: destructive ? 'destructive' : 'default', onPress: go },
  ]);
}

export default function Member() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { family, profile, familyRole, isOwner, refresh } = useSession();
  const fid = family!.id;
  const { data, error, reload } = useQuery(async () => {
    const [list, kids] = await Promise.all([membersApi.list(fid, profile!.id), api.kids(fid).catch(() => [])]);
    return { ...list, kids: kids.map((k) => k.name.trim().split(/\s+/)[0]) };
  }, [fid]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  if (!data && !error) return <Loading />;
  const members = data?.members ?? [];
  const index = members.filter((m) => !m.me).findIndex((m) => m.user_id === id);
  const m = members.find((x) => x.user_id === id);
  if (!m)
    return (
      <Screen gap={12} header={<BackHeader title="Family member" />}>
        <ErrorText>{error || 'This person isn’t in your family anymore.'}</ErrorText>
      </Screen>
    );
  const iOwn = data?.i_own ?? isOwner;
  const manage = can(data?.my_role ?? familyRole, 'manage_members', iOwn) && !!data?.ready;
  const theirsOwner = isOwnerMember(m);
  const first = m.name.trim().split(/\s+/)[0] || 'They';
  const kidNames = namesLine(data?.kids ?? []);
  const kids = kidNames || 'the kids';
  const kidsOwn = kidNames ? `${kidNames}’s` : 'The kids’';
  const owner = ownerFirstName(members) || 'The owner';
  const parents = namesLine(members.filter((x) => x.role === 'parent').map((x) => x.name.trim().split(/\s+/)[0]));

  async function setRole(role: MemberRole) {
    if (role === m!.role) return;
    setBusy(true);
    setErr('');
    try {
      await membersApi.setRole(fid, m!.user_id, role);
      await reload();
    } catch (e) {
      setErr(memberErrorText(errorText(e)));
    } finally {
      setBusy(false);
    }
  }

  function makeOwner() {
    confirmThen(
      `Make ${first} the owner?`,
      `${first} will manage seats and the subscription. You keep full access and can leave the family after.`,
      'Make owner',
      async () => {
        setBusy(true);
        setErr('');
        try {
          await membersApi.transfer(fid, m!.user_id);
          await refresh();
          await reload();
        } catch (e) {
          setErr(memberErrorText(errorText(e)));
        } finally {
          setBusy(false);
        }
      },
      false,
    );
  }

  function remove() {
    confirmThen(`Remove ${first} from your family?`, `${first} keeps their account but stops seeing ${kids}.`, 'Remove', async () => {
      setBusy(true);
      setErr('');
      try {
        await membersApi.remove(fid, m!.user_id);
        router.back();
      } catch (e) {
        setErr(memberErrorText(errorText(e)));
        setBusy(false);
      }
    });
  }

  function leave() {
    confirmThen(`Leave ${family?.name ?? 'the family'}?`, `You stop seeing ${kids}. You can be invited again.`, 'Leave', async () => {
      setBusy(true);
      setErr('');
      try {
        await membersApi.leave(fid);
        await refresh();
        router.replace('/');
      } catch (e) {
        setErr(memberErrorText(errorText(e)));
        setBusy(false);
      }
    });
  }

  // P78c: "Grandma" / "Joined Oct 7"; P78e (you): "Grandma" / "The Lee family · joined Oct 7".
  const sub = m.relation ?? '';
  const day = m.joined_at ? shortDay(m.joined_at) : '';
  const joined = m.me ? [family?.name, day && `joined ${day}`].filter(Boolean).join(' · ') : day ? `Joined ${day}` : '';
  const readOnlySelf = m.me && m.role === 'helper';
  const fullSelf = m.me && m.role === 'parent' && !theirsOwner;
  const canTransfer = manage && !m.me && m.role === 'parent' && !theirsOwner;

  return (
    <Screen
      gap={12}
      header={<BackHeader title={m.me ? 'You' : m.name || 'Family member'} />}
      footer={
        m.me ? (
          theirsOwner ? undefined : <DangerButton label="Leave family" onPress={leave} busy={busy} />
        ) : manage && !theirsOwner ? (
          <View style={{ gap: 8 }}>
            {canTransfer ? (
              <Pressable accessibilityRole="button" disabled={busy} onPress={makeOwner} style={({ pressed }) => [ms.tonalBtn, st.ownerBtn, (pressed || busy) && { opacity: 0.7 }]}>
                <Text style={ms.tonalText}>{`Make ${first} the owner`}</Text>
              </Pressable>
            ) : null}
            <View style={{ flexDirection: 'row' }}>
              <DangerButton label="Remove from family" onPress={remove} busy={busy} />
            </View>
          </View>
        ) : undefined
      }>
      <View style={ms.profileCard}>
        <MemberAvatar name={m.name} bg={memberColor(index < 0 ? 0 : index, m.me)} size={56} />
        <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0, gap: 2 }}>
          <Text style={ms.profileName}>{m.name || 'Family member'}</Text>
          {sub ? <Text style={ms.profileSub}>{sub}</Text> : null}
          {joined ? <Text style={ms.profileJoined}>{joined}</Text> : null}
        </View>
        <MemberRolePill member={m} />
      </View>
      {readOnlySelf ? (
        <>
          <Text style={[ms.section, { marginTop: 2 }]}>WHAT YOU CAN DO</Text>
          <RowsCard>
            <CanRow icon="eye" text={`${kidsOwn} care info, schedule, live shifts and updates`} />
            <CanRow icon="message-square" text="Message the sitter and send hearts on photos" />
            <CanRow icon="lock" text={`${parents || 'The family'} manage sitters, pay and the plan`} last />
          </RowsCard>
          <Text style={ms.note13}>{`You have read-only access. Only ${owner} can change it. Leaving keeps your account; you can be invited again.`}</Text>
        </>
      ) : fullSelf ? (
        <>
          <Text style={[ms.section, { marginTop: 2 }]}>WHAT YOU CAN DO</Text>
          <RowsCard>
            <CanRow icon="calendar" text="Book shifts, edit the care plan and manage sitters" />
            <CanRow icon="message-square" text="Message the sitter and send hearts on photos" />
            <CanRow icon="lock" text={`${owner} manages seats and the subscription`} last />
          </RowsCard>
          <Text style={ms.note13}>Leaving keeps your account; you can be invited again.</Text>
        </>
      ) : m.me && theirsOwner ? (
        <Text style={ms.note13}>You’re the owner: you manage seats and the subscription. To leave, make someone with full access the owner first.</Text>
      ) : manage ? (
        <>
          <Text style={[ms.section, { marginTop: 2 }]}>ACCESS</Text>
          <AccessSwitch role={m.role} onChange={setRole} disabled={busy} />
          <Text style={ms.note13}>{`Changes right away. ${first} keeps their account; removing them only takes them out of your family.`}</Text>
        </>
      ) : null}
      <ErrorText>{err || error}</ErrorText>
    </Screen>
  );
}

function CanRow({ icon, text, last }: { icon: IconName; text: string; last?: boolean }) {
  return (
    <View style={[st.canRow, !last && ms.line]}>
      <Icon name={icon} size={20} tint={color.primary} />
      <Text style={st.canText}>{text}</Text>
    </View>
  );
}

// Values from wireframes P78c, P78g and P78e.
const st = StyleSheet.create({
  ownerBtn: { flex: 0, height: 54 },
  canRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 12 },
  canText: { flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
});
