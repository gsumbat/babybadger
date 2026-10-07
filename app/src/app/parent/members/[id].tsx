import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { BackHeader, DangerButton, MemberAvatar, memberColor, memberStyles as ms, RoleCards, RolePill, RowsCard } from '@/components/familyMembers';
import { Text } from '@/components/Text';
import { ErrorText, Icon, type IconName, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { can, isLastParent, memberErrorText, shortDay, type MemberRole } from '@/lib/family-members';
import { membersApi } from '@/lib/family-members-api';
import { namesLine } from '@/lib/invite-links';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { color, font } from '@/theme';

// Wireframes P78c Family member (someone else) and P78e You. A parent changes someone's role (saves at once) or removes
// them; anyone can leave. The last parent can't leave, be removed or become a helper (the database checks it too, and
// the note says why). A helper looking at someone else sees their role only.
// Not drawn: a parent looking at herself (P78e with the role cards), the last-parent note.
function confirmThen(title: string, body: string, action: string, go: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title} ${body}`)) go();
    return;
  }
  Alert.alert(title, body, [
    { text: 'Keep', style: 'cancel' },
    { text: action, style: 'destructive', onPress: go },
  ]);
}

export default function Member() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { family, profile, familyRole, refresh } = useSession();
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
  const manage = can(data?.my_role ?? familyRole, 'manage_members') && !!data?.ready;
  const last = isLastParent(members, m.user_id);
  const first = m.name.trim().split(/\s+/)[0] || 'They';
  const kidNames = namesLine(data?.kids ?? []);
  const kids = kidNames || 'the kids';
  const kidsOwn = kidNames ? `${kidNames}’s` : 'The kids’';
  const parents = namesLine(members.filter((x) => x.role === 'parent').map((x) => x.name.trim().split(/\s+/)[0]));

  async function setRole(role: MemberRole) {
    if (role === m!.role) return;
    setBusy(true);
    setErr('');
    try {
      await membersApi.setRole(fid, m!.user_id, role);
      if (m!.me) await refresh();
      await reload();
    } catch (e) {
      setErr(memberErrorText(errorText(e)));
    } finally {
      setBusy(false);
    }
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
  const helperSelf = m.me && m.role === 'helper';

  return (
    <Screen
      gap={12}
      header={<BackHeader title={m.me ? 'You' : m.name || 'Family member'} />}
      footer={
        m.me ? (
          last ? undefined : <DangerButton label="Leave family" onPress={leave} busy={busy} />
        ) : manage && !last ? (
          <DangerButton label="Remove from family" onPress={remove} busy={busy} />
        ) : undefined
      }>
      <View style={ms.profileCard}>
        <MemberAvatar name={m.name} bg={memberColor(index < 0 ? 0 : index, m.me)} size={56} />
        <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0, gap: 2 }}>
          <Text style={ms.profileName}>{m.name || 'Family member'}</Text>
          {sub ? <Text style={ms.profileSub}>{sub}</Text> : null}
          {joined ? <Text style={ms.profileJoined}>{joined}</Text> : null}
        </View>
        <RolePill role={m.role} />
      </View>
      {helperSelf ? (
        <>
          <Text style={[ms.section, { marginTop: 2 }]}>WHAT YOU CAN DO</Text>
          <RowsCard>
            <CanRow icon="eye" text={`${kidsOwn} care info, schedule, live shifts and updates`} />
            <CanRow icon="message-square" text="Message the sitter and send hearts on photos" />
            <CanRow icon="lock" text={`${parents || 'The parents'} manage sitters, pay and the plan`} last />
          </RowsCard>
          <Text style={ms.note13}>Only a parent can change your role. Leaving keeps your account; you can be invited again.</Text>
        </>
      ) : manage ? (
        <>
          <Text style={[ms.section, { marginTop: 2 }]}>ROLE</Text>
          <RoleCards value={m.role} onChange={setRole} disabled={busy || last} />
          <Text style={ms.note13}>
            {last
              ? `${m.me ? 'You’re' : `${first} is`} the only parent. A family needs one, so make someone else a parent first.`
              : m.me
                ? 'Changes right away. A family always keeps at least one parent.'
                : `Changes right away. ${first} keeps their account; removing them only takes them out of your family.`}
          </Text>
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

// Values from wireframes P78c and P78e.
const st = StyleSheet.create({
  canRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 12 },
  canText: { flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
});
