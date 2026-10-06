import { Stack } from 'expo-router';

import { color } from '@/theme';

export default function SitterLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.canvas } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="consent/[familyId]" />
      <Stack.Screen name="shift/[id]" />
      <Stack.Screen name="family/[id]" />
      {/* Logs open as a bottom sheet over the shift, like wireframes S5 / S44. */}
      <Stack.Screen name="log/[shiftId]" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.92], sheetGrabberVisible: true, sheetCornerRadius: 28 }} />
      <Stack.Screen name="join" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
