import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Icon, Screen } from '@/components/ui';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe S39, translated from its HTML (app/src/wireframes/S39.tsx).
// Left out until built: My profile and What families see, Profile and credentials (personal details, certifications,
// background check, languages), Work (availability, Get found), Money (hours and pay, invoices and payouts), and the
// S12 settings screen: until it exists, "Settings, privacy and help" asks to sign out.
const SETTINGS =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>';

export default function Me() {
  const { profile, sitterLinks, signOut } = useSession();
  const active = sitterLinks.filter((l) => l.status === 'active');
  const name = profile?.full_name || 'You';
  const short = name.split(/\s+/).length > 1 ? `${name.split(/\s+/)[0]} ${name.split(/\s+/).slice(-1)[0][0]}.` : name;
  // Alert has no buttons on the web build, so the browser's confirm stands in there.
  const settings = () => {
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('Sign out?')) signOut();
      return;
    }
    Alert.alert('Settings, privacy and help', 'Each family sees your location only while you’re clocked in for their shift.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };
  return (
    <Screen
      gap={8}
      header={
        <View style={st.header}>
          <Text style={st.title}>Me</Text>
        </View>
      }>
      <View style={st.profile}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={st.avatar}>
            <Text style={st.avatarText}>{(name[0] || '?').toUpperCase()}</Text>
          </View>
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text style={st.name}>{short}</Text>
            <Text style={st.sub13}>
              {active.length} {active.length === 1 ? 'family' : 'families'}
            </Text>
          </View>
        </View>
      </View>

      <View style={st.card}>
        <Pressable accessibilityRole="button" onPress={settings} style={st.row}>
          <View style={st.rowIcon}>
            <SvgXml xml={SETTINGS} width={18} height={18} />
          </View>
          <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
            <Text style={st.rowTitle}>Settings, privacy and help</Text>
            <Text style={st.sub12} numberOfLines={1}>
              Location sharing, notifications, sign out
            </Text>
          </View>
          <Icon name="chevron-right" size={18} tint={color.ink2} />
        </Pressable>
      </View>
    </Screen>
  );
}

// Values from wireframe S39. The header keeps 4 at the bottom: the wireframe has 8 and Screen's content adds 4.
const st = StyleSheet.create({
  header: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 4 },
  title: { fontFamily: font.display, fontSize: 26, color: color.ink },
  profile: { gap: 10, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: font.display, fontSize: 26, color: '#FFFFFF' },
  name: { fontFamily: font.display, fontSize: 20, color: color.ink, marginVertical: -4.02 },
  sub13: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  sub12: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  card: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 46, paddingVertical: 3 },
  rowIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, lineHeight: 19, color: color.ink },
});
