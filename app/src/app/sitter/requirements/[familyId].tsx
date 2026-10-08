import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { DotPill, ReqTile, reqSvg } from '@/components/requirements';
import { Button, ErrorText, Loading, Screen } from '@/components/ui';
import { sitterCredentials } from '@/lib/credentials';
import { useQuery } from '@/lib/data';
import {
  familyLower,
  familyShort,
  MIGRATION_20_TEXT,
  myAnswers,
  needsMigration20,
  requirementsApi,
  requirementsOf,
  sitterBanner,
  sitterRows,
  statusRows,
  summarize,
  type SitterReqRow,
} from '@/lib/requirements';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe S27 Family requirements (what a family asks for), from app/src/wireframes/S27.tsx. In the join flow it
// comes right after accepting the invite (S1 -> S27 -> S42 house rules -> S2 notice; `?next=consent`), and is skipped
// when the family has no requirements. Credentials she already has count on their own; Yes / No answers the ones she
// confirms for this family. "Add a certification" opens S15.
// Not drawn: the "Missing" pill and its link (a missing certificate opens S15, a background check S17, a language
// S16), the "Confirmed" pill after a Yes, the banner once every must-have is done, the "Done" footer outside the join
// flow, a document requirement waiting for the parent ("Shared").
export default function FamilyRequirements() {
  const { familyId, next } = useLocalSearchParams<{ familyId: string; next?: string }>();
  const { session, sitterLinks } = useSession();
  const uid = session!.user.id;
  const joining = next === 'consent';
  const familyName = sitterLinks.find((l) => l.family_id === familyId)?.family.name ?? 'The family';
  const { data, error, reload } = useQuery(async () => {
    const reqs = await requirementsOf(familyId!);
    const [rows, creds, answers] = await Promise.all([statusRows(familyId!, uid), sitterCredentials(uid).catch(() => []), myAnswers(uid, reqs.map((r) => r.id))]);
    return { reqs, rows, creds, answers };
  }, [familyId, uid]);
  const [busy, setBusy] = useState<string>();
  const [err, setErr] = useState('');

  const empty = !!data && !data.reqs.length;
  useEffect(() => {
    // nothing to show in the join flow: go straight on to the house rules / notice
    if (joining && (empty || (error && !data))) router.replace(`/sitter/consent/${familyId}`);
  }, [joining, empty, error, data, familyId]);

  if (error && !data) return <Screen title="Requirements" back><ErrorText>{needsMigration20(error) ? MIGRATION_20_TEXT : error}</ErrorText></Screen>;
  if (!data || (joining && empty)) return <Loading />;

  const summary = summarize(data.reqs, data.rows);
  const rows = sitterRows(data.reqs, data.rows, data.creds, data.answers);
  const banner = sitterBanner(summary, rows);

  async function answer(id: string, yes: boolean) {
    setBusy(id);
    setErr('');
    try {
      await requirementsApi.answer(id, uid, yes);
      await reload();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(undefined);
    }
  }

  function addFor(r: SitterReqRow) {
    if (r.key === 'background_check') router.push('/sitter/background');
    else if (r.key.startsWith('language:')) router.push('/sitter/languages');
    else router.push('/sitter/credentials/add');
  }

  return (
    <Screen
      title={`What ${familyShort(familyName)} ask for`}
      back
      gap={10}
      footer={
        <View style={{ gap: 6, marginTop: -4, marginBottom: -4 }}>
          <Button label={joining ? 'Continue to house rules' : 'Done'} onPress={() => (joining ? router.replace(`/sitter/consent/${familyId}`) : router.back())} />
          <Pressable accessibilityRole="button" onPress={() => router.push('/sitter/credentials/add')} style={st.addCert}>
            <Text style={st.addCertText}>Add a certification</Text>
          </Pressable>
        </View>
      }>
      <View style={[st.banner, banner.done && { backgroundColor: color.okTint }]}>
        <SvgXml xml={reqSvg(banner.done ? 'check' : 'warn', banner.done ? color.okInk : color.warnInk)} width={22} height={22} style={{ flexShrink: 0 }} />
        <Text style={st.bannerText}>
          <Text style={[st.bannerBold, banner.done && { color: color.okInk }]}>{banner.bold}</Text> {banner.rest}
        </Text>
      </View>
      <View style={st.card}>
        {rows.map((r, i) => {
          const pill = r.state === 'have' ? <DotPill label="You have it" kind="ok" />
            : r.state === 'confirmed' ? <DotPill label="Confirmed" kind="ok" />
            : r.state === 'confirm' ? <DotPill label="Confirm" kind="info" />
            : r.state === 'nice' ? <DotPill label="Nice to have" kind="muted" />
            : r.state === 'review' ? <DotPill label="Shared" kind="info" />
            : <DotPill label="Missing" kind="bad" />;
          const head = (
            <View style={st.row}>
              <ReqTile icon={r.icon} size={36} />
              <View style={st.rowText}>
                <Text style={st.rowTitle}>{r.title}</Text>
                {r.sub ? <Text style={st.rowSub}>{r.sub}</Text> : null}
              </View>
              {pill}
            </View>
          );
          return (
            <View key={r.ids.join()} style={i < rows.length - 1 && st.line}>
              {r.state === 'missing' ? (
                <Pressable accessibilityRole="button" accessibilityLabel={`Add ${r.title}`} onPress={() => addFor(r)} style={({ pressed }) => pressed && { opacity: 0.8 }}>
                  {head}
                </Pressable>
              ) : (
                head
              )}
              {r.confirmId && (r.state === 'confirm' || r.answer === false) ? (
                <View style={st.answers}>
                  {[true, false].map((yes) => {
                    const on = r.answer === yes || (r.answer == null && yes);
                    return (
                      <Pressable
                        key={String(yes)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: r.answer === yes, busy: busy === r.confirmId }}
                        disabled={!!busy}
                        onPress={() => answer(r.confirmId!, yes)}
                        style={[st.answer, on ? st.answerOn : st.answerOff]}>
                        <Text style={[st.answerText, on && { color: '#FFFFFF' }]}>{yes ? 'Yes' : 'No'}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
      <Text style={st.note}>What you share here goes to {familyLower(familyName)} only. Other families never see it.</Text>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

// Values from wireframe S27.
const st = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.warnTint, borderRadius: 14 },
  bannerText: { flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  bannerBold: { fontFamily: font.bodyBold, color: color.warnInk },
  card: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 58 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  rowText: { flexGrow: 1, flexShrink: 1, minWidth: 0 },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  rowSub: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  answers: { flexDirection: 'row', gap: 8, paddingBottom: 10, paddingLeft: 46 },
  answer: { height: 34, paddingHorizontal: 14, borderRadius: 999, justifyContent: 'center' },
  answerOn: { backgroundColor: color.primary },
  answerOff: { borderWidth: 1, borderColor: color.lineStrong },
  answerText: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink },
  note: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  addCert: { height: 36, alignItems: 'center', justifyContent: 'center' },
  addCertText: { fontFamily: font.bodySemi, fontSize: 14, color: color.primary, textDecorationLine: 'underline' },
});
