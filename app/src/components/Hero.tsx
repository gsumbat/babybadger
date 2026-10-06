import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe P1: blue panel with rounded bottom, the waving mascot (188x230) and the 40px wordmark, centred in the
// space under a 56px top padding. The blue runs up under the status bar.
export function Hero() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[st.hero, { height: 440 + insets.top, paddingTop: insets.top + 56 }]}>
      <View style={st.inner}>
        <Image source={require('@/assets/images/badger-mascot.png')} style={{ width: 188, height: 230 }} contentFit="contain" accessibilityLabel="BabyBadger mascot waving" />
        <Text style={st.word}>BabyBadger</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  hero: { flexShrink: 0, paddingHorizontal: 24, backgroundColor: color.primary, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  inner: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 28 },
  // line-height: 1 in the wireframe; Baloo keeps its natural box and the margins trim it to 40px.
  word: { fontFamily: font.display, fontSize: 40, color: '#FFFFFF', marginVertical: -12.04 },
});
