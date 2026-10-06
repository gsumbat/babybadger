// Pieces shared by the house rules screens (wireframes P74, S42, S43): the section label, the rules card and a rule
// row with its Must / Prefer pill.
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { type RuleIcon, type RuleStrength, ruleIconXml } from '@/lib/house-rules';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

export function RuleSection({ label, right }: { label: string; right?: string }) {
  return (
    <View style={st.labelRow}>
      <Text style={st.label}>{label}</Text>
      {right ? <Text style={st.labelRight}>{right}</Text> : null}
    </View>
  );
}

export function RuleCard({ children }: { children: ReactNode }) {
  return <View style={st.card}>{children}</View>;
}

export function StrengthPill({ strength }: { strength: RuleStrength }) {
  const must = strength === 'must';
  return (
    <View style={[st.pill, { backgroundColor: must ? color.primary : color.muted }]}>
      <Text style={[st.pillText, { color: must ? '#FFFFFF' : color.ink2 }]}>{must ? 'Must' : 'Prefer'}</Text>
    </View>
  );
}

/** P74 / S43 rows are 46 high (3 padding); S42's are 40 (2 padding). */
export function RuleRow({ icon, title, sub, strength, last, compact, onPress }: { icon: RuleIcon; title: string; sub?: string; strength: RuleStrength; last?: boolean; compact?: boolean; onPress?: () => void }) {
  const inner = (
    <View style={[st.row, compact && st.rowCompact, !last && st.line]}>
      <SvgXml xml={ruleIconXml(icon, color.primary)} width={20} height={20} style={{ flexShrink: 0 }} />
      <View style={st.text}>
        <Text style={st.title}>{title}</Text>
        {sub ? <Text style={st.sub}>{sub}</Text> : null}
      </View>
      <StrengthPill strength={strength} />
    </View>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.8 }}>
      {inner}
    </Pressable>
  ) : (
    inner
  );
}

const st = StyleSheet.create({
  labelRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2 },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6, flexShrink: 1 },
  labelRight: { fontFamily: font.body, fontSize: 12, color: color.ink2, flexShrink: 1 },
  card: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 46, paddingVertical: 3 },
  rowCompact: { minHeight: 40, paddingVertical: 2 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  text: { flexDirection: 'column', minWidth: 0, flexGrow: 1, flexShrink: 1 },
  title: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink, lineHeight: 18 },
  sub: { fontFamily: font.body, fontSize: 12, color: color.ink2, lineHeight: 16 },
  pill: { flexDirection: 'row', alignItems: 'center', height: 24, flexShrink: 0, paddingHorizontal: 9, borderRadius: 999 },
  pillText: { fontFamily: font.bodyBold, fontSize: 11 },
});
