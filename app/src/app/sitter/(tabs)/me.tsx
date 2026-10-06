import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName, Screen } from '@/components/ui';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';

// Wireframe S39, translated from its HTML (app/src/wireframes/S39.tsx).
// Left out until built: My profile and What families see, certifications, background check, languages,
// availability, Get found, hours and pay, invoices and payouts.
export default function Me() {
  const { profile, session, sitterLinks, signOut } = useSession();
  const active = sitterLinks.filter((l) => l.status === 'active');
  const name = profile?.full_name || 'You';
  const short = name.split(/\s+/).length > 1 ? `${name.split(/\s+/)[0]} ${name.split(/\s+/).slice(-1)[0][0]}.` : name;
  return (
    <Screen title="Me" gap={8}>
      <View style={st.profile}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={st.avatar}>
            <Text style={st.avatarText}>{(name[0] || '?').toUpperCase()}</Text>
          </View>
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text style={st.name}>{short}</Text>
            <Text style={st.sub13}>
              {active.length} {active.length === 1 ? 'family' : 'families'} · {session?.user.email}
            </Text>
          </View>
        </View>
      </View>

      <Text style={st.label}>WORK</Text>
      <View style={st.card}>
        <Row icon="users" title="Families" sub={sitterLinks.map((l) => l.family.name.replace(/^The /, '')).join(' · ') || 'Join with a code from a parent'} onPress={() => router.navigate('/sitter/families')} />
        <Row icon="calendar" title="Calendar" sub="Shifts families booked with you" onPress={() => router.navigate('/sitter/calendar')} />
        <Row icon="plus" title="Join a family" sub="Enter a parent's invite code" onPress={() => router.push('/sitter/join')} last />
      </View>

      <Text style={st.label}>PRIVACY</Text>
      <View style={st.card}>
        <Row icon="shield" title="Location sharing" sub="Only while you're clocked in · each family sees only its own shifts" last />
      </View>

      <Pressable accessibilityRole="button" onPress={signOut} style={st.signOut}>
        <Text style={st.signOutText}>Sign out</Text>
      </Pressable>
    </Screen>
  );
}

function Row({ icon, title, sub, onPress, last }: { icon: IconName; title: string; sub: string; onPress?: () => void; last?: boolean }) {
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} disabled={!onPress} onPress={onPress} style={[st.row, !last && st.line]}>
      <View style={st.rowIcon}>
        <Icon name={icon} size={18} />
      </View>
      <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        <Text style={st.rowTitle}>{title}</Text>
        <Text style={st.sub12} numberOfLines={1}>
          {sub}
        </Text>
      </View>
      {onPress ? <Icon name="chevron-right" size={18} tint={color.ink2} /> : null}
    </Pressable>
  );
}

// Values from wireframe S39.
const st = StyleSheet.create({
  profile: { gap: 10, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: font.display, fontSize: 26, color: '#FFFFFF' },
  name: { fontFamily: font.display, fontSize: 20, color: color.ink, marginVertical: -4.02 },
  sub13: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  sub12: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  card: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 46, paddingVertical: 3 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  rowIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, lineHeight: 19, color: color.ink },
  signOut: { height: 48, borderRadius: 999, borderWidth: 1, borderColor: color.lineStrong, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  signOutText: { fontFamily: font.displayBold, fontSize: 16, color: color.ink },
});
