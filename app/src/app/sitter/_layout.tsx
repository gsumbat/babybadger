import { Stack } from 'expo-router';

import { color } from '@/theme';

export default function SitterLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.canvas } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="consent/[familyId]" />
      <Stack.Screen name="shift/[id]" />
      <Stack.Screen name="log/[shiftId]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="join" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
