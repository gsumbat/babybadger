import { router } from 'expo-router';
import { Alert, Share, View } from 'react-native';

import { Avatar, Button, Card, ErrorText, Label, Pill, Row, Screen, T } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { dayOf, inviteMessage } from '@/lib/format';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';

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
    <Screen title="Sitters" right={<Button label="Invite" icon="user-plus" kind="tonal" style={{ height: 40 }} onPress={() => router.push('/parent/invite')} />}>
      <ErrorText>{error}</ErrorText>
      <Label>Your sitters</Label>
      {data?.sitters.length ? (
        <Card style={{ paddingVertical: 4 }}>
          {data.sitters.map((s, i) => (
            <Row
              key={s.sitter_id}
              title={s.profile?.full_name || 'New sitter'}
              sub={s.status === 'active' ? 'Signed the location notice' : 'Joined · still needs to sign the notice'}
              right={<Pill label={s.status === 'active' ? 'Active' : 'Needs consent'} kind={s.status === 'active' ? 'ok' : 'warn'} />}
              last={i === data.sitters.length - 1}
            />
          ))}
        </Card>
      ) : (
        <T variant="muted">No sitters yet. Invite the sitter you already know.</T>
      )}
      {!!data?.invites.length && (
        <>
          <Label>Waiting to join</Label>
          {data.invites.map((inv) => (
            <Card key={inv.id} style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar name={inv.sitter_name || '?'} size={40} />
                <View style={{ flex: 1 }}>
                  <T variant="strong">{inv.sitter_name || 'Invite'} · code {inv.code}</T>
                  <T variant="small">Expires {dayOf(inv.expires_at)}</T>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button label="Share code" icon="share" kind="tonal" style={{ flex: 1, height: 40 }} onPress={() => Share.share({ message: inviteMessage(family!.name, inv.code) })} />
                <Button label="Cancel" kind="ghost" style={{ height: 40 }} onPress={() => cancel(inv.id)} />
              </View>
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}
