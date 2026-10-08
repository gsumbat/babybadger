import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { CIcon, SitterAvatar, type CredPath } from '@/components/credentials';
import { PayRow } from '@/components/payRow';
import { Icon, Pill, Screen } from '@/components/ui';
import { availabilityApi, availabilitySummary } from '@/lib/availability';
import { backgroundCheck, backgroundStatus, certificates, expired, expiringSoon, languagesLine, profileLine, profileStrength, shortName, sitterBundle } from '@/lib/credentials';
import { useQuery } from '@/lib/data';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe S39, translated from its HTML (app/src/wireframes/S39.tsx).
// "My profile · N%" opens S13; PROFILE AND CREDENTIALS rows open S40, S14, S17 and S16 (migration 19; before it runs
// the rows just have no summary); "Settings, privacy and help" opens S12.
// Money › Hours and pay opens S7 (components/payRow). "What families see" opens S19. Left out until built: Work's Get
// found (S35, marketplace: phase 1 has none), Money's Invoices and payouts (S30). WORK › "Invite a family you sit
// for" opens S52 / S52b (sitter/invite-family).
// Not drawn: the Certifications row with nothing expiring (sub-line lists them, no pill) and the background check
// row before she has added a report (no pill). Phase 1 checks nothing: the background check reads Added / Expired
// (never Cleared / In progress).
const SETTINGS =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>';

export default function Me() {
  const { profile, session, sitterLinks, signOut } = useSession();
  const uid = session!.user.id;
  // sitter_availability arrives with migration 12; until it's run the row just has no summary.
  const { data: hours } = useQuery(() => availabilityApi.mine(uid).catch(() => []), [uid]);
  // Profile and credentials (migration 19); sitterBundle never throws, so the rows render before it runs.
  const { data: me } = useQuery(() => sitterBundle(uid), [uid]);
  const active = sitterLinks.filter((l) => l.status === 'active');
  const name = profile?.full_name || 'You';
  const short = shortName(name) || name;
  const famLine = `${active.length} ${active.length === 1 ? 'family' : 'families'}`;
  const certs = certificates(me?.creds ?? []);
  const soon = expiringSoon(me?.creds ?? []).length;
  const gone = expired(me?.creds ?? []).length;
  const bg = backgroundStatus(backgroundCheck(me?.creds ?? []));
  const strength = me && !me.missing ? profileStrength(me.profile, me.creds, me.langs).percent : null;
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
          <SitterAvatar name={name} photoPath={me?.profile?.photo_path} size={60} fontSize={26} />
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text style={st.name}>{short}</Text>
            <Text style={st.sub13}>{[profileLine(me?.profile ?? null), famLine].filter(Boolean).join(' · ')}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/sitter/profile')} style={st.profileBtn}>
            <Text style={st.profileBtnText}>{strength != null ? `My profile · ${strength}%` : 'My profile'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/sitter/family-view')} style={[st.profileBtn, st.previewBtn]}>
            <Text style={[st.profileBtnText, { color: color.ink }]}>What families see</Text>
          </Pressable>
        </View>
      </View>

      <Text style={st.label}>PROFILE AND CREDENTIALS</Text>
      <View style={st.card}>
        <MeRow icon="edit" title="Personal details" sub="Name, photo, phone, area, about me" onPress={() => router.push('/sitter/details')} line />
        <MeRow
          icon="award"
          iconBg={color.warnTint}
          title="Certifications"
          sub={soon || gone ? undefined : certs.map((c) => c.title).join(' · ') || undefined}
          right={gone ? <Pill label={`${gone} expired`} kind="bad" /> : soon ? <Pill label={`${soon} expiring`} kind="warn" /> : undefined}
          onPress={() => router.push('/sitter/credentials')}
          line
        />
        <MeRow
          icon="shield"
          title="Background check"
          right={bg === 'added' ? <Pill label="Added" kind="ok" /> : bg === 'expired' ? <Pill label="Expired" kind="bad" /> : undefined}
          onPress={() => router.push('/sitter/background')}
          line
        />
        <MeRow icon="globe" title="Languages" sub={languagesLine(me?.langs ?? []) || undefined} onPress={() => router.push('/sitter/languages')} />
      </View>

      <Text style={st.label}>WORK</Text>
      <View style={st.card}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/sitter/availability')} style={[st.row, st.rowLine]}>
          <View style={st.rowIcon}>
            <Icon name="clock" size={18} />
          </View>
          <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
            <Text style={st.rowTitle}>Availability and time off</Text>
            {hours?.length ? (
              <Text style={st.sub12} numberOfLines={1}>
                {availabilitySummary(hours)}
              </Text>
            ) : null}
          </View>
          <Icon name="chevron-right" size={18} tint={color.ink2} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/sitter/invite-family')} style={st.row}>
          <View style={st.rowIcon}>
            <Icon name="send" size={18} />
          </View>
          <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
            <Text style={st.rowTitle}>Invite a family you sit for</Text>
            <Text style={st.sub12} numberOfLines={1}>
              They see your shifts with their kids
            </Text>
          </View>
          <Icon name="chevron-right" size={18} tint={color.ink2} />
        </Pressable>
      </View>

      <Text style={st.label}>MONEY</Text>
      <PayRow sitterId={uid} />

      <View style={st.card}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/sitter/privacy')} style={st.row}>
          <View style={st.rowIcon}>
            <SvgXml xml={SETTINGS} width={18} height={18} style={{ flexShrink: 0 }} />
          </View>
          <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
            <Text style={st.rowTitle}>Settings, privacy and help</Text>
            <Text style={st.sub12} numberOfLines={1}>
              Location sharing, notifications, help
            </Text>
          </View>
          <Icon name="chevron-right" size={18} tint={color.ink2} />
        </Pressable>
      </View>

      {/* Sign out at the bottom of Me, like parents' P12b (S39). */}
      <Pressable accessibilityRole="button" onPress={signOut} style={({ pressed }) => [st.signOut, pressed && { opacity: 0.8 }]}>
        <Text style={st.signOutText}>Sign out</Text>
      </Pressable>
      <Text style={st.note}>Alerts to this phone stop until you sign in again.</Text>
    </Screen>
  );
}

/** S39 list row: 32 tinted icon tile, title over an optional sub-line, then a pill or the chevron. */
function MeRow({ icon, iconBg = color.primaryTint, title, sub, right, onPress, line }: { icon: CredPath; iconBg?: string; title: string; sub?: string; right?: ReactNode; onPress: () => void; line?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[st.row, line && st.rowLine]}>
      <View style={[st.rowIcon, { backgroundColor: iconBg }]}>
        <CIcon name={icon} size={18} tint={iconBg === color.warnTint ? color.warnInk : color.primary} />
      </View>
      <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        <Text style={st.rowTitle}>{title}</Text>
        {sub ? (
          <Text style={st.sub12} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
      {right ? <View style={{ alignSelf: 'flex-start' }}>{right}</View> : <Icon name="chevron-right" size={18} tint={color.ink2} />}
    </Pressable>
  );
}

// Values from wireframe S39. The header keeps 4 at the bottom: the wireframe has 8 and Screen's content adds 4.
const st = StyleSheet.create({
  profileBtn: { flexGrow: 1, flexBasis: 0, height: 40, borderRadius: 999, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  previewBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.lineStrong },
  profileBtnText: { fontFamily: font.bodyBold, fontSize: 14, color: color.primary },
  rowLine: { borderBottomWidth: 1, borderBottomColor: color.divider },
  header: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 4 },
  title: { fontFamily: font.display, fontSize: 26, color: color.ink },
  profile: { gap: 10, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  name: { fontFamily: font.display, fontSize: 20, color: color.ink, marginVertical: -4.02 },
  sub13: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  sub12: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  card: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 46, paddingVertical: 3 },
  rowIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, lineHeight: 19, color: color.ink },
  // P12b sign out: white pill, 1.5 px line-strong border, red label.
  signOut: { height: 54, marginTop: 8, borderRadius: 999, borderWidth: 1.5, borderColor: color.lineStrong, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  signOutText: { fontFamily: font.displayBold, fontSize: 17, color: color.badInk, includeFontPadding: false },
  note: { fontFamily: font.body, fontSize: 13, color: color.ink2, textAlign: 'center' },
});
