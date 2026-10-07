import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, Share, View } from 'react-native';

import { BackHeader, INVITE_COLOR, MemberAvatar, MemberPill, memberColor, MembersNote, memberStyles as ms, RolePill, RowsCard } from '@/components/familyMembers';
import { Text } from '@/components/Text';
import { ErrorText, Icon, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { can, invitePill, inviteSub, isFull, MAX_FAMILY_MEMBERS, memberErrorText, memberInviteText, memberSub, memberTitle, type MemberInvite } from '@/lib/family-members';
import { membersApi } from '@/lib/family-members-api';
import { namesLine } from '@/lib/invite-links';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { color } from '@/theme';

// Wireframes P78 Family members (Settings › Family members) and P78f (4 of 4). Members first (the family's creator, then
// by join date) with their relation and a Parent / Family helper pill; parents also see the open and expired invites
// with Resend (7 more days, then the share sheet) / Cancel. "Add a family member" opens P78b; at 4 of 4 (members plus
// open invites) it's replaced by the note. Rows open P78c (someone else) or P78e (you). Helpers see the members only
// and no Add button. Before migration 30 runs everyone shows as a parent and Add says the database needs the update.
export default function FamilyMembers() {
  const { family, profile, familyRole } = useSession();
  const fid = family!.id;
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const { data, error, reload } = useQuery(async () => {
    const [list, kids] = await Promise.all([membersApi.list(fid, profile!.id), api.kids(fid).catch(() => [])]);
    return { ...list, kids: kids.map((k) => k.name.trim().split(/\s+/)[0]) };
  }, [fid]);
  if (!data && !error) return <Loading />;
  const members = data?.members ?? [];
  const invites = data?.invites ?? [];
  const max = data?.max ?? MAX_FAMILY_MEMBERS;
  const manage = can(data?.my_role ?? familyRole, 'manage_members');
  const full = isFull(members, invites, max);
  const kids = namesLine(data?.kids ?? []);

  async function resend(i: MemberInvite) {
    setBusy(i.id);
    setErr('');
    try {
      await membersApi.resend(i.id);
      await Share.share({ message: memberInviteText({ name: i.name, from: profile?.full_name, family: family?.name, kids: data?.kids ?? [], token: i.link_token }) });
      await reload();
    } catch (e) {
      setErr(memberErrorText(errorText(e), i.name));
    } finally {
      setBusy(null);
    }
  }

  function cancel(i: MemberInvite) {
    const go = async () => {
      setBusy(i.id);
      setErr('');
      try {
        await membersApi.cancel(i.id);
        await reload();
      } catch (e) {
        setErr(memberErrorText(errorText(e)));
      } finally {
        setBusy(null);
      }
    };
    const q = `Cancel the invite to ${i.name || 'this person'}?`;
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(q)) void go();
      return;
    }
    Alert.alert(q, 'The link stops working.', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel invite', style: 'destructive', onPress: () => void go() },
    ]);
  }

  const add = () => {
    if (!data?.ready) return setErr('Adding family members needs the latest database update (migration 30).');
    router.push('/parent/members/invite');
  };

  let other = 0;
  return (
    <Screen
      gap={12}
      header={<BackHeader title="Family members" />}
      footer={
        !manage ? undefined : full ? (
          <Text style={ms.fullNote}>{`Your family has ${max} members, the most a plan covers.`}</Text>
        ) : (
          <Pressable accessibilityRole="button" onPress={add} style={({ pressed }) => [ms.primaryBtn, pressed && { opacity: 0.85 }]}>
            <Icon name="plus" size={20} tint="#FFFFFF" strokeWidth={2.2} />
            <Text style={ms.primaryText}>Add a family member</Text>
          </Pressable>
        )
      }>
      <Text style={ms.lead}>{`Adults who look after ${kids || 'your kids'}. One plan covers up to ${max}.`}</Text>
      <ErrorText>{error || err}</ErrorText>
      <Text style={ms.section}>{`MEMBERS · ${members.length} OF ${max}`}</Text>
      <RowsCard>
        {members.map((m, i) => {
          const bg = memberColor(m.me ? 0 : other++, m.me);
          return (
            <Pressable
              key={m.user_id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/parent/members/[id]', params: { id: m.user_id } })}
              style={[ms.row, i < members.length - 1 && ms.line]}>
              <MemberAvatar name={m.name} bg={bg} />
              <View style={ms.rowText}>
                <Text style={ms.name} numberOfLines={1}>
                  {memberTitle(m)}
                </Text>
                {memberSub(m) ? <Text style={ms.sub}>{memberSub(m)}</Text> : null}
              </View>
              <RolePill role={m.role} />
            </Pressable>
          );
        })}
      </RowsCard>
      {manage && invites.length ? (
        <>
          <Text style={[ms.section, { marginTop: 2 }]}>INVITES</Text>
          <RowsCard>
            {invites.map((inv, i) => {
              const pill = invitePill(inv);
              return (
                <View key={inv.id} style={[i < invites.length - 1 && ms.line, busy === inv.id && { opacity: 0.6 }]}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push({ pathname: '/parent/members/invite', params: { id: inv.id } })}
                    style={ms.row}>
                    <MemberAvatar name={inv.name} bg={INVITE_COLOR} />
                    <View style={ms.rowText}>
                      <Text style={ms.name} numberOfLines={1}>
                        {inv.name || 'Family member'}
                      </Text>
                      <Text style={ms.sub}>{inviteSub(inv)}</Text>
                    </View>
                    <MemberPill kind={pill.kind} label={pill.label} />
                  </Pressable>
                  <View style={ms.actions}>
                    <Pressable accessibilityRole="button" disabled={!!busy} onPress={() => void resend(inv)} style={[ms.action, { backgroundColor: color.primaryTint }]}>
                      <Text style={[ms.actionText, { color: color.primary }]}>Resend</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" disabled={!!busy} onPress={() => cancel(inv)} style={ms.action}>
                      <Text style={[ms.actionText, { color: color.badInk }]}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </RowsCard>
        </>
      ) : null}
      <MembersNote>Parents manage sitters, pay and the plan. Family helpers see the kids and updates, and can message the sitter.</MembersNote>
    </Screen>
  );
}
