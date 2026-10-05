import { router } from 'expo-router';
import { Alert, Share } from 'react-native';

import { Avatar, Button, Card, ErrorText, Label, Pill, Row, Screen, T } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { inviteMessage } from '@/lib/format';
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
            <Card key={inv.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar name={inv.sitter_name || '?'} size={40} />
              <Row
                title={`${inv.sitter_name || 'Invite'} · code ${inv.code}`}
                sub={`Expires ${new Date(inv.expires_at).toLocaleDateString()}`}
                right={
                  <>
                    <Button label="Share" kind="ghost" style={{ height: 36 }} onPress={() => Share.share({ message: inviteMessage(family!.name, inv.code) })} />
                    <Button label="Cancel" kind="ghost" style={{ height: 36 }} onPress={() => cancel(inv.id)} />
                  </>
                }
                last
              />
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}
