import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Hero } from '@/components/Hero';
import { Button } from '@/components/ui';
import type { Role } from '@/lib/types';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

/**
 * Wireframe P1 Welcome. Shared by the signed-out route below and onboarding (signed in, no role yet).
 * "I have a kid code" is not built (kid app), so the link row keeps only the right-hand link.
 */
export function WelcomeView({ onRole, link, onLink }: { onRole: (role: Role) => void; link: string; onLink: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: color.canvas }}>
      <Hero />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 28, gap: 10 }}>
        <Text style={{ fontFamily: font.display, fontSize: 28, lineHeight: 34, color: color.ink }}>{"Know how the day is going, even when you're away"}</Text>
        <Text style={{ fontFamily: font.body, fontSize: 16, lineHeight: 23, color: color.ink2 }}>Your sitter clocks in and you see the shift: where they are, tasks done, meals eaten.</Text>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: Math.max(insets.bottom, 32), gap: 10 }}>
        <Button label="I'm a parent" onPress={() => onRole('parent')} />
        <Button label="I'm a sitter" kind="secondary" onPress={() => onRole('sitter')} />
        <Text accessibilityRole="link" style={{ fontFamily: font.body, fontSize: 14, color: color.primary, textDecorationLine: 'underline', alignSelf: 'flex-end', paddingTop: 6 }} onPress={onLink}>
          {link}
        </Text>
      </View>
    </View>
  );
}

// Signed out: picking a role goes to P0 Sign in with the role; onboarding uses it after the code is verified.
export default function Welcome() {
  return (
    <WelcomeView
      onRole={(role) => router.push({ pathname: '/sign-in', params: { role } })}
      link="Sign in"
      onLink={() => (router.canGoBack() ? router.back() : router.replace('/sign-in'))}
    />
  );
}
