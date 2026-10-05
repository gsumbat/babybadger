import { router } from 'expo-router';

import { Button, Card, ErrorText, Label, Row, Screen, T } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { useSession } from '@/lib/session';

export default function Family() {
  const { family, profile, session, signOut } = useSession();
  const { data: kids, error } = useQuery(() => api.kids(family!.id), [family!.id]);
  return (
    <Screen title="Family" subtitle={family!.name}>
      <ErrorText>{error}</ErrorText>
      <Label right={<Button label="Add" icon="plus" kind="ghost" style={{ height: 32 }} onPress={() => router.push('/parent/kid/new')} />}>Kids</Label>
      {kids?.length ? (
        <Card style={{ paddingVertical: 4 }}>
          {kids.map((k, i) => (
            <Row key={k.id} icon="smile" title={k.name} sub={k.avoid_foods ? `Avoid: ${k.avoid_foods}` : k.notes || undefined} last={i === kids.length - 1} />
          ))}
        </Card>
      ) : (
        <T variant="muted">No kids added yet.</T>
      )}
      <Label>Account</Label>
      <Card style={{ paddingVertical: 4 }}>
        <Row icon="user" title={profile?.full_name || 'You'} sub={session?.user.email ?? undefined} last />
      </Card>
      <Button label="Sign out" kind="outline" onPress={signOut} />
    </Screen>
  );
}
