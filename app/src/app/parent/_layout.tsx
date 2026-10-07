import { Stack } from 'expo-router';

import { color } from '@/theme';

export default function ParentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.canvas } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="shift/[id]" />
      <Stack.Screen name="shift/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="trip/[id]" />
      <Stack.Screen name="invite" options={{ presentation: 'modal' }} />
      <Stack.Screen name="kid/[id]" />
      <Stack.Screen name="kid/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="kid/routine" />
      <Stack.Screen name="care/index" />
      <Stack.Screen name="care/item" options={{ presentation: 'modal' }} />
      {/* P28–P32 open from the invite (itself a modal), so they're a modal too. */}
      <Stack.Screen name="requirements/setup" options={{ presentation: 'modal' }} />
      {/* Billing (P36–P41): plans and the trial-started screen are modals, like the store sheet they replace. */}
      <Stack.Screen name="plans" options={{ presentation: 'modal' }} />
      <Stack.Screen name="trial-started" options={{ presentation: 'modal', gestureEnabled: false }} />
    </Stack>
  );
}
