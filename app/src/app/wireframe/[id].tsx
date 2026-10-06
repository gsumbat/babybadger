import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WIREFRAMES } from '@/wireframes';
import { Text } from '@/components/Text';

// Development only: shows a wireframe exactly as generated from its HTML, to compare with the real screen.
export default function WireframePreview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const Screen = WIREFRAMES[id ?? ''];
  if (!Screen)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>No generated wireframe {id}</Text>
      </View>
    );
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Screen />
    </SafeAreaView>
  );
}
