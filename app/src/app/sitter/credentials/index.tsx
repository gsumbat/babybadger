import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { CIcon, CredPill, CredRow, credStyles, credTileKey } from '@/components/credentials';
import { Text } from '@/components/Text';
import { Button, ErrorText, Loading, Pill, Screen } from '@/components/ui';
import { backgroundCheck, backgroundStatus, certificates, credentialSub, daysUntil, expiringSoon, isSafety, languagesLine, monthYear, sitterBundle, toDay } from '@/lib/credentials';
import { useQuery } from '@/lib/data';
import { askedLine, requirementRequestsApi, usDate, waitingOnHer } from '@/lib/requirement-requests-api';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';

// Wireframe S14 Credentials, from app/src/wireframes/S14.tsx. Opened from Me (S39) "Certifications" and S13 "Manage".
// The amber banner names the certificate expiring soonest (within 30 days) and opens S18. SAFETY = CPR / first aid /
// water safety plus the background check (S17); SKILLS = the rest plus Languages (S16). A certificate row opens S41;
// "Add a certification" opens S15. Not drawn: the screen with no certificates (both cards keep their fixed rows), and
// "Not started" for a background check the provider hasn't begun.
// REQUESTS (migration 31): one row per family still waiting on her ("The Lee family asked for: CPR and First Aid,
// Infant CPR" · "Share what you have · Tap to answer") opens S53. The background check row opens S17d; a report she
// uploaded reads "Checkr report · 08/12/2026" with a Saved pill.
export default function Credentials() {
  const { session } = useSession();
  const uid = session!.user.id;
  const { data } = useQuery(() => sitterBundle(uid), [uid]);
  const { data: asks } = useQuery(() => requirementRequestsApi.mine(), [uid]);
  if (!data) return <Loading />;
  const waiting = (asks ?? []).map((g) => ({ g, open: waitingOnHer(g.requests) })).filter((x) => x.open.length);

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

      {waiting.length ? (
        <>
          <Text style={credStyles.label}>REQUESTS</Text>
          {waiting.map(({ g, open: o }) => (
            <Pressable key={g.family_id} accessibilityRole="button" onPress={() => router.push('/sitter/requests')} style={st.req}>
              <View style={st.reqIcon}>
                <CIcon name="list" tint={color.warnInk} />
              </View>
              <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
                <Text style={st.reqTitle}>{askedLine(g.family_name, o.map((q) => q.title))}</Text>
                <Text style={st.reqSub}>Share what you have · Tap to answer</Text>
              </View>
              <CIcon name="chevron" size={18} tint={color.ink2} />
            </Pressable>
          ))}
        </>
      ) : null}

      <Text style={credStyles.label}>SAFETY</Text>
      <View style={credStyles.listCard}>
        {safety.map((c) => (
          <CredRow key={c.id} tile={credTileKey(c)} title={c.title} sub={credentialSub(c)} right={<CredPill c={c} />} onPress={() => open(c.id)} />
        ))}
        <CredRow
          tile="background"
          title="Background check"
          sub={
            bgStatus === 'cleared' && bg?.verified_at
              ? `Cleared ${monthYear(toDay(new Date(bg.verified_at)))} · renews yearly`
              : bgStatus === 'expired'
                ? 'Expired · renews yearly'
                : bg
                  ? [bg.issuer ? `${bg.issuer} report` : 'Report', usDate(bg.issued_on)].filter(Boolean).join(' · ')
                  : 'Upload a report you have'
          }
          right={bgStatus === 'cleared' ? <Pill label="Verified" kind="ok" /> : bgStatus === 'expired' ? <Pill label="Expired" kind="bad" /> : bg ? <Pill label="Saved" kind="muted" /> : undefined}
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
  req: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  reqIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: color.warnTint, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reqTitle: { fontFamily: font.bodySemi, fontSize: 15, lineHeight: 20, color: color.ink },
  reqSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
});
