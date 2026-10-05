import { router } from 'expo-router';

import { Button, Card, Label, Pill, Row, Screen, T } from '@/components/ui';
import { useSession } from '@/lib/session';

export default function Families() {
  const { sitterLinks } = useSession();
  return (
    <Screen title="Families" right={<Button label="Join" icon="plus" kind="tonal" style={{ height: 40 }} onPress={() => router.push('/sitter/join')} />}>
      <Label>Families you work with</Label>
      <Card style={{ paddingVertical: 4 }}>
        {sitterLinks.map((l, i) => (
          <Row
            key={l.family_id}
            icon="home"
            title={l.family.name}
            sub={l.status === 'active' ? 'Notice signed · location shared only on shift' : 'Sign the location notice to get booked'}
            right={<Pill label={l.status === 'active' ? 'Active' : 'Sign notice'} kind={l.status === 'active' ? 'ok' : 'warn'} />}
            onPress={l.status === 'needs_consent' ? () => router.push(`/sitter/consent/${l.family_id}`) : undefined}
            last={i === sitterLinks.length - 1}
          />
        ))}
      </Card>
      <T variant="muted">Each family sees your location only during their own shifts.</T>
    </Screen>
  );
}
