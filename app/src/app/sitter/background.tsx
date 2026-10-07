import { StyleSheet, View } from 'react-native';

import { CIcon } from '@/components/credentials';
import { Text } from '@/components/Text';
import { ErrorText, Loading, Pill, Screen } from '@/components/ui';
import { backgroundCheck, backgroundStatus, longDate, monthDay, sitterBundle, toDay } from '@/lib/credentials';
import { useQuery } from '@/lib/data';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';

// Wireframe S17 Background check, from app/src/wireframes/S17.tsx. Opened from Me (S39), S13 and S14.
// The check is run by a provider with her consent (design note nS4); its row in sitter_credentials is written by the
// service role only. Steps: permission (the row exists) → identity → records → result (cleared = verified).
// Left out until built: the provider itself ([PROVIDER] / [FEE] placeholders stay out), its per-step progress
// (while it runs, the screen shows the wireframe's drawing: identity done, records being checked), reading the report, disputes, and "Contact support".
// Not drawn: "Not started" (no check yet), "Cleared" (every step done) and "Expired".
export default function Background() {
  const { session } = useSession();
  const uid = session!.user.id;
  const { data } = useQuery(() => sitterBundle(uid), [uid]);
  if (!data) return <Loading />;

  const bg = backgroundCheck(data.creds);
  const status = backgroundStatus(bg);
  const pill = { none: <Pill label="Not started" kind="muted" />, in_progress: <Pill label="In progress" kind="info" />, cleared: <Pill label="Cleared" kind="ok" />, expired: <Pill label="Expired" kind="bad" /> }[status];
  const started = status !== 'none';
  const done = status === 'cleared';
  const steps: { title: string; sub: string; state: 'done' | 'now' | 'later' }[] = [
    { title: 'You gave permission', sub: bg ? `Signed ${monthDay(toDay(new Date(bg.created_at)))} · disclosure and consent` : 'Disclosure and consent', state: started ? 'done' : 'now' },
    { title: 'Identity confirmed', sub: 'Photo ID matched your selfie', state: started ? 'done' : 'later' },
    { title: 'Records being checked', sub: 'Usually 2–5 business days. We will notify you.', state: done ? 'done' : started ? 'now' : 'later' },
    {
      title: 'Result',
      sub: done && bg?.verified_at ? `Cleared ${longDate(toDay(new Date(bg.verified_at)))}${bg.expires_on ? ` · renews ${longDate(bg.expires_on)}` : ''}` : 'You see it first, before any family',
      state: done ? 'done' : 'later',
    },
  ];

  return (
    <Screen back title="Background check" gap={12}>
      <ErrorText>{data.error}</ErrorText>
      <View style={st.statusCard}>
        <View style={st.statusHead}>
          <Text style={st.statusTitle}>Status</Text>
          {pill}
        </View>
        {steps.map((s, i) => (
          <View key={s.title} style={{ flexDirection: 'row', gap: 14 }}>
            <View style={{ alignItems: 'center', gap: 4 }}>
              {s.state === 'done' ? (
                <View style={[st.dot, { backgroundColor: color.ok }]}>
                  <CIcon name="check" size={16} tint="#FFFFFF" />
                </View>
              ) : s.state === 'now' ? (
                <View style={[st.dot, { backgroundColor: '#FFFFFF', borderWidth: 3, borderColor: color.primary }]}>
                  <View style={st.nowDot} />
                </View>
              ) : (
                <View style={[st.dot, { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: color.lineStrong }]} />
              )}
              {i < steps.length - 1 ? <View style={[st.stem, { backgroundColor: s.state === 'done' ? color.ok : '#DDE3EA' }]} /> : null}
            </View>
            <View style={{ paddingBottom: 14, flexShrink: 1 }}>
              <Text style={[st.stepTitle, s.state === 'later' && { color: '#5F6D74' }]}>{s.title}</Text>
              <Text style={st.stepSub}>{s.sub}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={st.label}>WHAT IS CHECKED</Text>
      <View style={st.card}>
        {['Identity and past addresses', 'National and county criminal records', 'National sex offender registry', 'Driving record, if you drive kids'].map((t) => (
          <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <CIcon name="check" size={18} tint={color.ok} />
            <Text style={st.checked}>{t}</Text>
          </View>
        ))}
      </View>

      <View style={st.info}>
        <CIcon name="eye" tint={color.primaryStrong} />
        <Text style={st.infoText}>
          <Text style={st.infoBold}>Your report stays yours.</Text> Families only see &quot;Background check · Verified&quot; and the date. You can read the full report and dispute anything that&apos;s wrong.
        </Text>
      </View>
      <Text style={st.foot}>Renews every 12 months</Text>
    </Screen>
  );
}

// Values from wireframe S17.
const st = StyleSheet.create({
  statusCard: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 2, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  statusHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14 },
  statusTitle: { fontFamily: font.displayBold, fontSize: 18, color: color.ink, flexShrink: 1 },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nowDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: color.primary },
  stem: { width: 2, minHeight: 18, flexGrow: 1 },
  stepTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  stepSub: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  card: { gap: 10, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  checked: { fontFamily: font.body, fontSize: 14, color: color.ink, flexShrink: 1 },
  info: { flexDirection: 'row', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 14 },
  infoText: { flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  infoBold: { fontFamily: font.bodyBold, fontSize: 14, lineHeight: 20, color: color.primaryStrong },
  foot: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
});
