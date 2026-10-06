import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { IncidentCard as Card } from '@/lib/alerts-logic';
import { color, font } from '@/theme';

const TRIANGLE = '<svg viewBox="0 0 24 24" fill="none" stroke="#C2412D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17h0"/></svg>';

/** The red incident card from P9 ("Injury · Leo"), also on the parents' live Home (P4i). One white button on the
 * left; the right slot stays empty for "Call Maya" (no phone number stored yet) so the button keeps its width. */
export function IncidentCard({ card, action, onAction }: { card: Card; action: string; onAction: () => void }) {
  return (
    <View style={st.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <SvgXml xml={TRIANGLE} width={22} height={22} style={{ flexShrink: 0 }} />
        <Text style={st.title}>{card.title}</Text>
        <Text style={st.time}>{card.time}</Text>
      </View>
      <Text style={st.body} numberOfLines={3}>
        {card.body}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={onAction} style={st.btn}>
          <Text style={st.btnText}>{action}</Text>
        </Pressable>
        <View style={{ flexGrow: 1, flexBasis: 0 }} />
      </View>
    </View>
  );
}

// Values from wireframe P9.
const st = StyleSheet.create({
  card: { backgroundColor: color.badTint, borderRadius: 16, padding: 16, gap: 10 },
  title: { fontFamily: font.bodyBold, fontSize: 16, color: color.badInk, flexShrink: 1 },
  time: { fontFamily: font.body, fontSize: 13, color: '#6E2215', marginLeft: 'auto' },
  body: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: '#6E2215' },
  btn: { height: 44, flexGrow: 1, flexBasis: 0, borderRadius: 999, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: font.displayBold, fontSize: 15, color: color.ink },
});
