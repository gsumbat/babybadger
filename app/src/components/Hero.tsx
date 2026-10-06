import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color, font } from '@/theme';

// Wireframe P1: blue panel with rounded bottom, the waving mascot and the wordmark.
export function Hero({ height = 440 }: { height?: number }) {
  const insets = useSafeAreaInsets();
  const img = Math.min(230, height - 180);
  return (
    <View style={[st.hero, { height: height + insets.top, paddingTop: insets.top + 56 }]}>
      <Image source={require('@/assets/images/badger-mascot.png')} style={{ width: img * 0.817, height: img }} contentFit="contain" accessibilityLabel="BabyBadger mascot waving" />
      <Text style={st.word}>BabyBadger</Text>
    </View>
  );
}

const st = StyleSheet.create({
  hero: { backgroundColor: color.primary, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 28 },
  word: { fontFamily: font.display, fontSize: 40, color: '#FFFFFF' },
});
