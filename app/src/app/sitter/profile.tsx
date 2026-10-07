import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { CredPill, CredRow, SitterAvatar, credStyles, credTileKey } from '@/components/credentials';
import { Text } from '@/components/Text';
import { ErrorText, Loading, Pill, Screen } from '@/components/ui';
import { agesLabel, backgroundCheck, backgroundStatus, certificates, driveLabel, expiryLine, languagesLine, longDate, monthYear, profileLine, profileStrength, shortName, sitterBundle, toDay } from '@/lib/credentials';
import { useQuery } from '@/lib/data';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';

// Wireframe S13 My profile, from app/src/wireframes/S13.tsx. Opened from Me (S39) "My profile · N%".
// "Edit details and photo" opens S40; CREDENTIALS "Manage" opens S14; each certificate opens S41, the background
// check S17, languages S16. Left out until built: "Preview" (S19 What families see). The ABOUT rows (Ages, Can drive
// kids, Rate) show only when set: no screen edits them yet. Not drawn: the background check row before the provider
// has started one ("Not started"), and no ABOUT card when nothing is set.
export default function Profile() {
  const { session, profile } = useSession();
  const uid = session!.user.id;
  const { data } = useQuery(() => sitterBundle(uid), [uid]);
  if (!data) return <Loading />;

  const name = profile?.full_name || 'You';
  const strength = profileStrength(data.profile, data.creds, data.langs);
  const certs = certificates(data.creds);
  const bg = backgroundCheck(data.creds);
  const bgStatus = backgroundStatus(bg);
  const p = data.profile;
  const about = [
    ['Ages', agesLabel(p?.ages_from ?? null, p?.ages_to ?? null)],
    ['Can drive kids', driveLabel(p?.can_drive ?? null, p?.own_car ?? null)],
    ['Rate', p?.rate != null ? `$${Number(p.rate).toFixed(Number(p.rate) % 1 ? 2 : 0)} / hour` : ''],
  ].filter(([, v]) => v);

  return (
    <Screen back title="My profile" gap={14}>
      <ErrorText>{data.error}</ErrorText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <SitterAvatar name={name} photoPath={p?.photo_path} size={72} fontSize={31} />
        <View style={{ gap: 2, flexShrink: 1 }}>
          <Text style={st.name}>{shortName(name) || name}</Text>
          {profileLine(p) ? <Text style={st.sub14}>{profileLine(p)}</Text> : null}
          <Pressable accessibilityRole="link" onPress={() => router.push('/sitter/details')} hitSlop={6}>
            <Text style={credStyles.link}>Edit details and photo</Text>
          </Pressable>
        </View>
      </View>

      <View style={st.strength}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Text style={st.strengthTitle}>Profile strength</Text>
          <Text style={st.percent}>{strength.percent}%</Text>
        </View>
        <View style={st.bar}>
          <View style={[st.barFill, { width: `${strength.percent}%` }]} />
        </View>
        <Text style={st.tip}>{strength.next}</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={credStyles.label}>CREDENTIALS</Text>
        <Pressable accessibilityRole="link" onPress={() => router.push('/sitter/credentials')} hitSlop={6}>
          <Text style={credStyles.link}>Manage</Text>
        </Pressable>
      </View>
      <View style={credStyles.listCard}>
        {certs.map((c) => (
          <CredRow key={c.id} tile={credTileKey(c)} title={c.title} sub={expiryLine(c)} right={<CredPill c={c} />} onPress={() => router.push({ pathname: '/sitter/credentials/[id]', params: { id: c.id } })} />
        ))}
        <CredRow
          tile="background"
          title="Background check"
          sub={bgStatus === 'cleared' && bg?.verified_at ? `Cleared ${monthYear(toDay(new Date(bg.verified_at)))}` : bgStatus === 'expired' && bg?.expires_on ? `Expired ${longDate(bg.expires_on)}` : bgStatus === 'in_progress' ? 'Usually 2–5 business days' : 'Not started'}
          right={bgStatus === 'cleared' ? <Pill label="Verified" kind="ok" /> : bgStatus === 'expired' ? <Pill label="Expired" kind="bad" /> : bgStatus === 'in_progress' ? <Pill label="In progress" kind="info" /> : undefined}
          onPress={() => router.push('/sitter/background')}
        />
        <CredRow
          tile="languages"
          title="Languages"
          sub={languagesLine(data.langs) || 'Add the languages you speak'}
          right={data.langs.length ? <Pill label={String(data.langs.length)} kind="muted" /> : undefined}
          onPress={() => router.push('/sitter/languages')}
          last
        />
      </View>

      {about.length ? (
        <>
          <Text style={[credStyles.label, { marginTop: 2 }]}>ABOUT</Text>
          <View style={credStyles.listCard}>
            {about.map(([k, v], i) => (
              <View key={k} style={[st.aboutRow, i < about.length - 1 && st.line]}>
                <Text style={st.aboutKey}>{k}</Text>
                <Text style={st.aboutValue}>{v}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

// Values from wireframe S13.
const st = StyleSheet.create({
  name: { fontFamily: font.display, fontSize: 24, color: color.ink, marginVertical: -5.22 },
  sub14: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  strength: { gap: 10, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  strengthTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink, flexShrink: 1 },
  percent: { fontFamily: font.display, fontSize: 20, color: color.primary },
  bar: { height: 10, backgroundColor: color.muted, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: 10, backgroundColor: color.primary, borderRadius: 5 },
  tip: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  aboutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 50 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  aboutKey: { fontFamily: font.body, fontSize: 15, color: color.ink, flexShrink: 1 },
  aboutValue: { fontFamily: font.body, fontSize: 15, color: color.ink2, flexShrink: 1 },
});
