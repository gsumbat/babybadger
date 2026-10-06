import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { RuleCard, RuleRow, RuleSection } from '@/components/houseRules';
import { Button, ErrorText, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { familyRulesState, groupRules, joinNames, ruleIcon } from '@/lib/house-rules';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe P74 House rules, from app/src/wireframes/P74.tsx. Opened from Settings (P12b) and the Home setup step
// (P4a). Rows open P76; "+ Add rules" opens P75. Rules save as they're added or changed (P75 / P76), so Save just
// closes the list. The note under it names the active sitters who still have to agree to the current Must rules.
// Left out until built: "Preview" (no wireframe for the parent's preview). Food rules use P75's "FOOD AND ROUTINE"
// heading, since P74 draws no food rule.
export default function HouseRules() {
  const { family } = useSession();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const sitters = (await api.familySitters(fid)).filter((s) => s.status === 'active');
    const { rules, pending } = await familyRulesState(fid, sitters.map((s) => s.sitter_id));
    return { rules, pending: pending.map((id) => firstName(sitters.find((s) => s.sitter_id === id)?.profile?.full_name)) };
  }, [fid]);

  if (!data) return error ? <Screen title="House rules" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const sections = groupRules(data.rules);

  return (
    <Screen
      title="House rules"
      subtitle="What every sitter agrees to"
      back
      gap={8}
      footer={
        <View style={{ gap: 4 }}>
          <Button label="Save" onPress={() => router.back()} />
          {data.pending.length ? <Text style={st.note}>{joinNames(data.pending)} will be asked to agree before {data.pending.length === 1 ? 'her' : 'their'} next shift.</Text> : null}
        </View>
      }>
      <ErrorText>{error}</ErrorText>
      {sections.map((s, i) => (
        <View key={s.label} style={{ gap: 8 }}>
          <RuleSection label={s.label} right={i === 0 && s.label === 'UPDATES AND LOGS' ? 'Sitters get reminders' : undefined} />
          <RuleCard>
            {s.rules.map((r, n) => (
              <RuleRow key={r.id} icon={ruleIcon(r)} title={r.title} sub={r.sub} strength={r.strength} last={n === s.rules.length - 1} onPress={() => router.push(`/parent/rules/rule?id=${r.id}`)} />
            ))}
          </RuleCard>
        </View>
      ))}
      <Pressable accessibilityRole="button" onPress={() => router.push('/parent/rules/add')} style={st.add}>
        <Text style={st.addText}>+ Add rules</Text>
      </Pressable>
    </Screen>
  );
}

const st = StyleSheet.create({
  add: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 46, borderRadius: 999, borderWidth: 2, borderColor: '#C9D3DD', borderStyle: 'dashed' },
  addText: { fontFamily: font.displayBold, fontSize: 16, color: color.primary },
  note: { fontFamily: font.body, fontSize: 12, color: color.ink2, textAlign: 'center' },
});
