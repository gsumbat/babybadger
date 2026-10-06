import { StyleSheet, Text, View } from 'react-native';

import { cardStyle, SetRow } from '@/components/bits';
import { Avatar, Button, Card, Label, Screen, T } from '@/components/ui';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';

// Wireframe S39 (the parts this build has: profile, families, privacy, sign out).
export default function Me() {
  const { profile, session, sitterLinks, signOut } = useSession();
  const active = sitterLinks.filter((l) => l.status === 'active').length;
  return (
    <Screen title="Me">
      <View style={[cardStyle, st.profile]}>
        <Avatar name={profile?.full_name || '?'} size={56} />
        <View style={{ flex: 1 }}>
          <Text style={st.name}>{profile?.full_name || 'You'}</Text>
          <T variant="small">
            {active} {active === 1 ? 'family' : 'families'} · {session?.user.email}
          </T>
        </View>
      </View>
      <Label>Work</Label>
      <Card style={{ paddingVertical: 0 }}>
        <SetRow label="Families" value={sitterLinks.map((l) => l.family.name).join(', ') || 'None yet'} last />
      </Card>
      <Label>Privacy</Label>
      <Card style={{ paddingVertical: 0 }}>
        <SetRow label="Location sharing" value="Only while clocked in" />
        <SetRow label="Who sees it" value="That shift’s family" last />
      </Card>
      <Button label="Sign out" kind="outline" onPress={signOut} />
    </Screen>
  );
}

const st = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  name: { fontFamily: font.display, fontSize: 20, color: color.ink },
});
