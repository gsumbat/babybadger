import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { CIcon, CredPill, CredRow, credStyles, credTileKey } from '@/components/credentials';
import { Text } from '@/components/Text';
import { Button, ErrorText, Loading, Pill, Screen } from '@/components/ui';
import { backgroundCheck, backgroundStatus, certificates, credentialSub, daysUntil, expiringSoon, isSafety, languagesLine, monthYear, sitterBundle, toDay } from '@/lib/credentials';
import { useQuery } from '@/lib/data';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';

// Wireframe S14 Credentials, from app/src/wireframes/S14.tsx. Opened from Me (S39) "Certifications" and S13 "Manage".
// The amber banner names the certificate expiring soonest (within 30 days) and opens S18. SAFETY = CPR / first aid /
// water safety plus the background check (S17); SKILLS = the rest plus Languages (S16). A certificate row opens S41;
// "Add a certification" opens S15. Not drawn: the screen with no certificates (both cards keep their fixed rows), and
// "Not started" for a background check the provider hasn't begun.
export default function Credentials() {
  const { session } = useSession();
  const uid = session!.user.id;
  const { data } = useQuery(() => sitterBundle(uid), [uid]);
  if (!data) return <Loading />;

  const certs = certificates(data.creds);
  const safety = certs.filter((c) => isSafety(c.kind));
  const skills = certs.filter((c) => !isSafety(c.kind));
  const soon = expiringSoon(data.creds)[0];
  const bg = backgroundCheck(data.creds);
  const bgStatus = backgroundStatus(bg);
  const open = (id: string) => router.push({ pathname: '/sitter/credentials/[id]', params: { id } });

  return (
    <Screen back title="Credentials" gap={12} footer={<Button label="Add a certification" icon="plus" disabled={data.missing} onPress={() => router.push('/sitter/credentials/add')} />}>
      <ErrorText>{data.error}</ErrorText>
      {soon?.expires_on ? (
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/sitter/credentials/renew', params: { id: soon.id } })} style={st.banner}>
          <CIcon name="bell" tint={color.warnInk} />
          <Text style={st.bannerText}>
            <Text style={st.bannerBold}>
              {soon.title} expires in {daysUntil(soon.expires_on)} {daysUntil(soon.expires_on) === 1 ? 'day' : 'days'}.
            </Text>{' '}
            Renew to keep the badge.
          </Text>
          <CIcon name="chevron" size={18} tint={color.warnInk} />
        </Pressable>
      ) : null}

      <Text style={credStyles.label}>SAFETY</Text>
      <View style={credStyles.listCard}>
        {safety.map((c) => (
          <CredRow key={c.id} tile={credTileKey(c)} title={c.title} sub={credentialSub(c)} right={<CredPill c={c} />} onPress={() => open(c.id)} />
        ))}
        <CredRow
          tile="background"
          title="Background check"
          sub={bgStatus === 'cleared' && bg?.verified_at ? `Cleared ${monthYear(toDay(new Date(bg.verified_at)))} · renews yearly` : bgStatus === 'expired' ? 'Expired · renews yearly' : bgStatus === 'in_progress' ? 'Usually 2–5 business days' : 'Not started'}
          right={bgStatus === 'cleared' ? <Pill label="Verified" kind="ok" /> : bgStatus === 'expired' ? <Pill label="Expired" kind="bad" /> : bgStatus === 'in_progress' ? <Pill label="In progress" kind="info" /> : undefined}
          onPress={() => router.push('/sitter/background')}
          last
        />
      </View>

      <Text style={[credStyles.label, { marginTop: 2 }]}>SKILLS</Text>
      <View style={credStyles.listCard}>
        {skills.map((c) => (
          <CredRow key={c.id} tile={credTileKey(c)} title={c.title} sub={credentialSub(c)} right={<CredPill c={c} />} onPress={() => open(c.id)} />
        ))}
        <CredRow
          tile="languages"
          title="Languages"
          sub={languagesLine(data.langs, true) || 'Add the languages you speak'}
          right={<Pill label="Self-reported" kind="muted" />}
          onPress={() => router.push('/sitter/languages')}
          last
        />
      </View>
    </Screen>
  );
}

// Values from wireframe S14.
const st = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.warnTint, borderRadius: 14 },
  bannerText: { flexGrow: 1, flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  bannerBold: { fontFamily: font.bodyBold, fontSize: 14, lineHeight: 20, color: color.warnInk },
});
