import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Empty, Screen } from '@/components/ui';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe S37. Messaging isn't in this build yet (family chips, thread, quick replies and the composer are left out);
// the white header is kept so the tab matches the design.
export default function Messages() {
  const { top } = useSafeAreaInsets();
  return (
    <Screen
      bleedTop
      header={
        <View style={[st.header, { paddingTop: top + 16 }]}>
          <Text style={st.title}>Messages</Text>
        </View>
      }>
      <Empty icon="message-square" title="Messages are coming next">
        You’ll chat here with your family or sitter, one thread per family. For now, use your usual texting app.
      </Empty>
    </Screen>
  );
}

// Values from wireframe S37.
const st = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: color.line },
  title: { fontFamily: font.display, fontSize: 24, color: color.ink },
});
