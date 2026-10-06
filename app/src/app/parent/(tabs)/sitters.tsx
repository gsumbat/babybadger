import { router } from 'expo-router';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';

import { Avatar, Button, Card, ErrorText, Icon, Label, Pill, Screen, T } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { dayOf, inviteMessage } from '@/lib/format';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { color, font } from '@/theme';

// Wireframes P27 / P54: active sitters, open invites, invite button.
export default function Sitters() {
  const { family } = useSession();
  const fid = family!.id;
  const { data, error, reload } = useQuery(async () => {
    const [sitters, invites] = await Promise.all([api.familySitters(fid), api.openInvites(fid)]);
    return { sitters, invites };
  }, [fid]);

  async function cancel(id: string) {
    const { error: e } = await supabase.from('invites').update({ cancelled_at: new Date().toISOString() }).eq('id', id);
    if (e) Alert.alert('Could not cancel', errorText(e));
    reload();
  }

  return (
    <Screen
      title="Sitters"
      right={<Button label="Invite" icon="plus" kind="tonal" style={{ height: 40 }} onPress={() => router.push('/parent/invite')} />}
      footer={<Button label="Invite a sitter" icon="plus" onPress={() => router.push('/parent/invite')} />}>
      <ErrorText>{error}</ErrorText>
      <Label>Active</Label>
      {data?.sitters.length ? (
        <Card style={{ paddingVertical: 4 }}>
          {data.sitters.map((s, i) => (
            <View key={s.sitter_id} style={[st.row, i < data.sitters.length - 1 && st.line]}>
              <Avatar name={s.profile?.full_name || '?'} />
              <View style={{ flex: 1 }}>
                <Text style={st.name}>{s.profile?.full_name || 'New sitter'}</Text>
                <T variant="small">{s.status === 'active' ? 'Signed the location notice' : 'Joined · still needs to sign the notice'}</T>
              </View>
              <Pill label={s.status === 'active' ? 'Active' : 'Needs to sign'} kind={s.status === 'active' ? 'ok' : 'warn'} />
            </View>
          ))}
        </Card>
      ) : (
        <T variant="muted">No sitters yet. Invite the sitter you already know.</T>
      )}

      {!!data?.invites.length && (
        <>
          <Label>Invites</Label>
          <Card style={{ paddingVertical: 4 }}>
            {data.invites.map((inv, i) => (
              <View key={inv.id} style={[{ paddingVertical: 10, gap: 8 }, i < data.invites.length - 1 && st.line]}>
                <View style={st.rowTight}>
                  <Avatar name={inv.sitter_name || '?'} bg="#5F6D74" />
                  <View style={{ flex: 1 }}>
                    <Text style={st.name}>{inv.sitter_name || 'Invite'}</Text>
                    <T variant="small">
                      Code {inv.code} · expires {dayOf(inv.expires_at)}
                    </T>
                  </View>
                  <Pill label="Waiting" kind="warn" />
                </View>
                <View style={{ flexDirection: 'row', gap: 8, paddingLeft: 56 }}>
                  <Button label="Share code" kind="tonal" style={{ height: 38, paddingHorizontal: 14 }} onPress={() => Share.share({ message: inviteMessage(family!.name, inv.code) })} />
                  <Button label="Cancel" kind="ghost" style={{ height: 38 }} onPress={() => cancel(inv.id)} />
                </View>
              </View>
            ))}
          </Card>
        </>
      )}

      <View style={st.note}>
        <Icon name="eye" size={18} tint={color.primary} />
        <T variant="small" style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>
          Sitters who haven’t accepted see nothing about your family beyond the invite.
        </T>
      </View>
    </Screen>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 68 },
  rowTight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  name: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  note: { flexDirection: 'row', gap: 10, backgroundColor: color.primaryTint, borderRadius: 16, padding: 12, alignItems: 'center' },
});
