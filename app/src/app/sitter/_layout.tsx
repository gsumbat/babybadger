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
      {/* S8 Start a trip: a sheet over the shift, like the logs. */}
      <Stack.Screen name="trip/[shiftId]" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.92], sheetGrabberVisible: true, sheetCornerRadius: 28 }} />
      <Stack.Screen name="clockin/[shiftId]" />
      {/* S26 Meet the new child: a sheet the "Tell Maya about Mia" push opens. */}
      <Stack.Screen name="kid/[id]" options={{ presentation: 'formSheet', sheetAllowedDetents: 'fitToContents', sheetGrabberVisible: true, sheetCornerRadius: 24 }} />
      <Stack.Screen name="join" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
