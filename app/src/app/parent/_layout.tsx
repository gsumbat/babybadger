import { Stack } from 'expo-router';

import { useSession } from '@/lib/session';
import { color } from '@/theme';

export default function ParentLayout() {
  // Read-only members (role 'helper', migration 30, P4m) see the kids, schedule, live shift and updates and message the
  // sitter. Screens that manage the family (sitters, pay, requirements, bookings, kids, the care plan, places) need full
  // access; seats and billing are the owner's (migration 32). The database refuses those writes too. Keep these lists
  // in step with PARENT_ONLY / OWNER_ONLY_ROUTES in lib/family-members (they send push taps to a screen you can open).
  const { familyRole, isOwner } = useSession();
  const parent = familyRole === 'parent';
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.canvas } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="shift/[id]" />
      <Stack.Screen name="trip/[id]" />
      <Stack.Screen name="kid/[id]" />
      <Stack.Screen name="kid/care" />
      <Stack.Screen name="care/index" />
      <Stack.Screen name="care/view" />
      {/* Read only for a read-only member (P20h, P56h, P74h, P19v, P20v): the editors they open are below. */}
      <Stack.Screen name="kid/routine" />
      <Stack.Screen name="places/index" />
      <Stack.Screen name="rules/index" />
      <Stack.Screen name="members/index" />
      <Stack.Screen name="members/[id]" />
      <Stack.Protected guard={isOwner}>
        <Stack.Screen name="members/invite" />
      </Stack.Protected>
      <Stack.Protected guard={parent}>
        <Stack.Screen name="shift/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="invite" options={{ presentation: 'modal' }} />
        <Stack.Screen name="invite/[id]" />
        <Stack.Screen name="sitter-list" />
        <Stack.Screen name="setup" />
        <Stack.Screen name="kid/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="care/item" options={{ presentation: 'modal' }} />
        <Stack.Screen name="places/new" />
        <Stack.Screen name="places/[id]" />
        <Stack.Screen name="rules/add" />
        <Stack.Screen name="rules/rule" />
        <Stack.Screen name="pool" />
        <Stack.Screen name="pool-ask" />
        <Stack.Screen name="pool-week" />
        <Stack.Screen name="request/[id]" />
        <Stack.Screen name="requirements/index" />
        {/* P28–P32 open from the invite (itself a modal), so they're a modal too. */}
        <Stack.Screen name="requirements/setup" options={{ presentation: 'modal' }} />
        {/* Billing (P36–P41): plans and the trial-started screen are modals, like the store sheet they replace. */}
        <Stack.Screen name="plans" options={{ presentation: 'modal' }} />
        <Stack.Screen name="trial-started" options={{ presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="subscription" />
        <Stack.Screen name="cancel" />
      </Stack.Protected>
    </Stack>
  );
}
