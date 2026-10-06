import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { cardStyle, KidDot, SafetyBox } from '@/components/bits';
import { Card, ErrorText, Icon, Label, Screen, T } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { ageLabel } from '@/lib/kid-profile';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';

// Wireframe S10: one family, its kids, what to avoid, emergency info.
export default function SitterFamily() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sitterLinks } = useSession();
  const name = sitterLinks.find((l) => l.family_id === id)?.family.name ?? 'Family';
  const { data: kids, error } = useQuery(() => api.kids(id!), [id]);
  const doctors = (kids ?? []).filter((k) => k.pediatrician);

  return (
    <Screen title={name} back>
      <ErrorText>{error}</ErrorText>
      <SafetyBox kids={kids ?? []} />
      <View style={st.grid}>
        {(kids ?? []).map((k) => (
          <View key={k.id} style={[cardStyle, st.kid]}>
            <KidDot kid={k} />
            <Text style={st.kidName}>
              {k.name}
              {k.birthdate ? `, ${ageLabel(k.birthdate)}` : ''}
            </Text>
            <T variant="small">{[k.health_notes, k.comfort_item && `comfort: ${k.comfort_item}`, k.notes].filter(Boolean).join(' · ') || 'No notes yet'}</T>
          </View>
        ))}
      </View>
      {doctors.length > 0 && (
        <>
          <Label>Emergency</Label>
          <Card style={{ paddingVertical: 4 }}>
            {doctors.map((k, i) => (
              <View key={k.id} style={[st.row, i < doctors.length - 1 && st.line]}>
                <View style={{ flex: 1 }}>
                  <T variant="strong">Pediatrician · {k.name}</T>
                  <T variant="small">{k.pediatrician}</T>
                </View>
              </View>
            ))}
          </Card>
        </>
      )}
      <View style={[cardStyle, st.row, { paddingHorizontal: 16 }]}>
        <Icon name="shield" size={20} tint={color.primary} />
        <View style={{ flex: 1 }}>
          <T variant="strong">Location sharing with this family</T>
          <T variant="small">Only while clocked in · notice signed</T>
        </View>
      </View>
    </Screen>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kid: { width: '48%', flexGrow: 1, padding: 14, gap: 6 },
  kidName: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
});
