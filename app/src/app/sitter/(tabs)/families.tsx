import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Icon, Label, Pill, Screen, T } from '@/components/ui';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';

export default function Families() {
  const { sitterLinks } = useSession();
  return (
    <Screen title="Families" right={<Button label="Join" icon="plus" kind="tonal" style={{ height: 40 }} onPress={() => router.push('/sitter/join')} />}>
      <Label>Families you work with</Label>
      <Card style={{ paddingVertical: 4 }}>
        {sitterLinks.map((l, i) => (
          <Pressable
            key={l.family_id}
            accessibilityRole="button"
            onPress={() => router.push(l.status === 'active' ? `/sitter/family/${l.family_id}` : `/sitter/consent/${l.family_id}`)}
            style={[st.row, i < sitterLinks.length - 1 && st.line]}>
            <View style={[st.dot, { backgroundColor: l.status === 'active' ? color.primary : color.warn }]} />
            <View style={{ flex: 1 }}>
              <Text style={st.name}>{l.family.name}</Text>
              <T variant="small">{l.status === 'active' ? 'Notice signed · location shared only on shift' : 'Sign the location notice to get booked'}</T>
            </View>
            {l.status === 'active' ? <Icon name="chevron-right" size={18} tint={color.ink2} /> : <Pill label="Sign notice" kind="warn" />}
          </Pressable>
        ))}
      </Card>
      <View style={st.note}>
        <Icon name="shield" size={18} tint={color.primary} />
        <T variant="small" style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>
          Each family sees your location only during their own shifts.
        </T>
      </View>
    </Screen>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  note: { flexDirection: 'row', gap: 10, backgroundColor: color.primaryTint, borderRadius: 16, padding: 12, alignItems: 'center' },
});
