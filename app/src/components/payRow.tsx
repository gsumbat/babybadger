// S39 Me › MONEY › "Hours and pay" (opens S7), with this week's earnings ("$342 this week").
// "Invoices and payouts" (S30) is left out until payouts are built.
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Icon } from '@/components/ui';
import { useQuery } from '@/lib/data';
import { dollars, payApi, payFor, periodRange } from '@/lib/pay';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

const CARD =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="14" rx="2.5"/><path d="M3 10h18M16 15h2"/></svg>';

export function PayRow({ sitterId }: { sitterId: string }) {
  const { data } = useQuery(() => payApi.load(sitterId).catch(() => null), [sitterId]);
  const earned = data ? payFor(data.shifts, data.rates, periodRange('week')).earned : null;
  return (
    <View style={st.card}>
      <Pressable accessibilityRole="button" onPress={() => router.push('/sitter/pay')} style={st.row}>
        <View style={st.rowIcon}>
          <SvgXml xml={CARD} width={18} height={18} style={{ flexShrink: 0 }} />
        </View>
        <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
          <Text style={st.rowTitle}>Hours and pay</Text>
          {earned != null ? <Text style={st.sub12}>{dollars(earned)} this week</Text> : null}
        </View>
        <Icon name="chevron-right" size={18} tint={color.ink2} />
      </Pressable>
    </View>
  );
}

// Values from wireframe S39 (same as Me's other rows).
const st = StyleSheet.create({
  card: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 46, paddingVertical: 3 },
  rowIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, lineHeight: 19, color: color.ink },
  sub12: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
});
