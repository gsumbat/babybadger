import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button, Card, ErrorText, Label, Row, Screen, T } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { ageLabel } from '@/lib/kid-profile';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';

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
            <Row
              key={k.id}
              left={
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: k.color || color.accent, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: font.display, fontSize: 18, color: color.ink }}>{k.name[0]?.toUpperCase()}</Text>
                </View>
              }
              title={k.name}
              sub={[k.birthdate && ageLabel(k.birthdate), k.avoid_foods && `avoid ${k.avoid_foods}`, k.allergies && `allergic to ${k.allergies}`].filter(Boolean).join(' · ') || undefined}
              last={i === kids.length - 1}
            />
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
