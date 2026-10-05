import { Button, Card, Label, Row, Screen, T } from '@/components/ui';
import { useSession } from '@/lib/session';

export default function Me() {
  const { profile, session, signOut } = useSession();
  return (
    <Screen title="Me">
      <Card style={{ paddingVertical: 4 }}>
        <Row icon="user" title={profile?.full_name || 'You'} sub={session?.user.email ?? undefined} last />
      </Card>
      <Label>Coming next</Label>
      <T variant="muted">Certifications, availability, pay and invoices are designed and come in the next build.</T>
      <Button label="Sign out" kind="outline" onPress={signOut} />
    </Screen>
  );
}
