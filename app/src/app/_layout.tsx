import { Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { KeyboardProvider, KeyboardToolbar } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { InviteHead } from '@/components/inviteLink';
import { Loading } from '@/components/ui';
import '@/lib/location-sharing'; // registers the background location task at startup
import { listenForAlertTaps, registerForPush } from '@/lib/push';
import { SessionProvider, useSession } from '@/lib/session';
import { color } from '@/theme';

SplashScreen.preventAutoHideAsync();

function Routes() {
  const { loading, session, profile, family, sitterLinks } = useSession();
  const signedIn = !!session;
  const isParent = signedIn && profile?.role === 'parent' && !!family;
  const isSitter = signedIn && profile?.role === 'sitter' && sitterLinks.length > 0;
  const needsOnboarding = signedIn && !isParent && !isSitter;
  const ready = isParent || isSitter;
  // Invite link pages (S0b): their link-preview tags go in even while the app loads, so the exported HTML has them.
  const inviteLink = usePathname().startsWith('/i/');

  // Once signed in to a family: the system asks to allow notifications, and tapped alerts open their screen.
  useEffect(() => {
    if (!ready) return;
    void registerForPush();
    return listenForAlertTaps();
  }, [ready]);

  const head = inviteLink ? <InviteHead /> : null;
  if (loading)
    return (
      <>
        {head}
        <Loading />
      </>
    );

  return (
    <>
      {head}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.canvas } }}>
        <Stack.Screen name="index" />
        {/* Invite link babybadger.app/i/<token> (S0b–S0d): open signed in or out, so no guard. */}
        <Stack.Screen name="i/[token]" />
        {/* Generated wireframe layouts, for side-by-side checks during development only. */}
        <Stack.Protected guard={__DEV__}>
          <Stack.Screen name="wireframe/[id]" />
          <Stack.Screen name="dev-login" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="welcome" />
        </Stack.Protected>
        <Stack.Protected guard={needsOnboarding}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={isParent}>
          <Stack.Screen name="parent" />
        </Stack.Protected>
        <Stack.Protected guard={isSitter}>
          <Stack.Screen name="sitter" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold, Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold });
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <SessionProvider>
          <StatusBar style="dark" />
          <Routes />
        </SessionProvider>
        {/* iOS-style bar above the keyboard: previous / next field and Done (number pads have no return key). */}
        <KeyboardToolbar doneText="Done" />
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
