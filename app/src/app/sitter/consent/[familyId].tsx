import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { Button, ErrorText, Field, Icon, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { sitterRulesState } from '@/lib/house-rules';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { NOTICE_VERSION, TERMS_VERSION } from '@/lib/types';
import { cardShadow, color, font, SECTION_GAP } from '@/theme';
import { Text } from '@/components/Text';

// [LEGAL REVIEW] Placeholder text. Final notice wording depends on state law and must come from counsel.
const NOTICE = (parents: string) => [
  ['Who is monitoring', `${parents || 'The parents'} (“the family”) use BabyBadger to see the location of the person caring for their children. BabyBadger provides the app; the family decides to use it.`],
  ['What is collected', 'Your phone’s location, clock-in and clock-out times, trips you start, and entries you add (food, notes, photos).'],
  ['When', 'Only from clock-in to clock-out. If you forget to clock out, sharing stops automatically 2 hours after the shift’s end time.'],
  ['Why', 'So the family knows their children are safe and where they are during pick-ups and outings.'],
  ['Who sees it', 'Parents in this family. Not other families, and not BabyBadger staff except for support you ask for.'],
  ['How long it’s kept', '[RETENTION PERIOD], then deleted.'],
  ['Your choices', 'You can see everything the family sees, and you can leave the family at any time. Without location, you can’t clock in for this family.'],
  ['Contact', '[CONTACT FOR PRIVACY QUESTIONS]'],
];

// Checkbox tick from the wireframes (2.6 stroke).
const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export default function Consent() {
  const { familyId, rules } = useLocalSearchParams<{ familyId: string; rules?: string }>();
  const { sitterLinks, profile, session, refresh } = useSession();
  // House rules (S42) come before the notice when the family has Must rules she hasn't agreed to yet.
  useEffect(() => {
    if (rules || !familyId || !session) return;
    let live = true;
    sitterRulesState(familyId, session.user.id).then((r) => {
      if (live && r.needsAgreement) router.replace(`/sitter/rules/${familyId}?next=consent`);
    });
    return () => {
      live = false;
    };
  }, [familyId, rules, session]);
  const family = sitterLinks.find((l) => l.family_id === familyId)?.family.name ?? 'This family';
  const { data: parents } = useQuery(() => api.familyParents(familyId!), [familyId]);
  const parentNames = (parents ?? []).map((p) => p.full_name).filter(Boolean).join(' and ');
  const [read, setRead] = useState(false);
  const [reading, setReading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [name, setName] = useState(profile?.full_name ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  // Reading progress for the bar under the S2a header: how much of the notice has been on screen.
  const [box, setBox] = useState({ y: 0, view: 0, content: 0 });
  const progress = box.content ? Math.min(1, (box.y + box.view) / box.content) : 0;

  async function sign() {
    setBusy(true);
    setErr('');
    const { error } = await supabase.rpc('sign_consent', { p_family: familyId, p_signed_name: name.trim(), p_notice_version: NOTICE_VERSION, p_terms_version: TERMS_VERSION });
    setBusy(false);
    if (error) return setErr(errorText(error));
    await refresh();
    router.replace('/sitter');
  }

  // Wireframe S2a, translated from its HTML (app/src/wireframes/S2a.tsx): its own header, a reading-progress bar,
  // the scrolling notice and a fixed footer. Left out until built: download a copy.
  if (reading)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.canvas }} edges={['top', 'left', 'right']}>
        <View style={st.header}>
          <BackButton onPress={() => setReading(false)} />
          <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
            <Text style={st.noticeTitle}>Monitoring notice</Text>
            <Text style={st.noticeSub}>{family} · v1.0</Text>
          </View>
        </View>
        <View style={st.progress}>
          <View style={[st.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={st.noticeBody}
          scrollEventThrottle={32}
          onLayout={(e) => setBox((b) => ({ ...b, view: e.nativeEvent.layout.height }))}
          onContentSizeChange={(_, h) => setBox((b) => ({ ...b, content: h }))}
          onScroll={(e) => setBox((b) => ({ ...b, y: e.nativeEvent.contentOffset.y }))}>
          <View style={st.short}>
            <Text style={st.shortLabel}>IN SHORT</Text>
            <Text style={st.shortText}>{family} sees your location only between clock-in and clock-out. Nothing is shared between shifts. You can see everything they see.</Text>
          </View>
          {NOTICE(parentNames).map(([h, b], i) => (
            <View key={h} style={{ gap: 4 }}>
              <Text style={st.h}>
                {i + 1}. {h}
              </Text>
              <Text style={st.body}>{b}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={st.noticeFooter}>
          <Button
            label="I’ve read it"
            onPress={() => {
              setRead(true);
              setReading(false);
            }}
          />
          <Text style={st.legal}>[LEGAL REVIEW] Final wording depends on state law, e.g. employee monitoring notice rules.</Text>
        </View>
      </SafeAreaView>
    );

  // Wireframe S2, translated from its HTML (app/src/wireframes/S2.tsx). Left out until built: the Terms and Privacy
  // policy documents (their rows; the words stay in the agreement line).
  return (
    <Screen
      header={
        <View style={st.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={st.caption}>Before your first shift</Text>
        </View>
      }
      footer={
        <View style={{ gap: 6 }}>
          <Button label="Sign and allow location" onPress={sign} busy={busy} disabled={!read || !agree || name.trim().length < 2} />
          <Text style={st.footNote}>A signed copy goes to you and the family. Next, your phone asks for location.</Text>
        </View>
      }>
      <Text style={st.title}>Location is shared only while you’re working</Text>
      <View style={st.timeline}>
        <View style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden' }}>
          <View style={{ flex: 1, backgroundColor: color.muted }} />
          <View style={{ flex: 2, backgroundColor: color.primary }} />
          <View style={{ flex: 1, backgroundColor: color.muted }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={st.off}>Off</Text>
          <Text style={st.onWindow}>Clock in → Clock out</Text>
          <Text style={st.off}>Off</Text>
        </View>
      </View>
      <View style={st.facts}>
        {[
          ['Employer', family],
          ['Collected', 'Location, times, entries'],
          ['Seen by', 'Parents in this family'],
          ['Kept for', '[RETENTION PERIOD]'],
        ].map(([k, v], i) => (
          <View key={k} style={[st.fact, i < 3 && { borderBottomWidth: 1, borderBottomColor: color.divider }]}>
            <Text style={st.factKey}>{k}</Text>
            <Text style={st.factVal}>{v}</Text>
          </View>
        ))}
      </View>
      <View style={{ gap: 6, marginTop: SECTION_GAP }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={st.label}>READ BEFORE YOU SIGN</Text>
          <Text style={st.labelRight}>Required</Text>
        </View>
        <View style={st.docs}>
          <Pressable accessibilityRole="button" onPress={() => setReading(true)} style={st.docRow}>
            <View style={st.docIcon}>
              <Icon name="file-text" size={19} tint={color.primary} />
            </View>
            <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
              <Text style={st.docTitle}>Monitoring notice</Text>
              <Text style={st.docSub}>From {family} · 2 min read</Text>
            </View>
            <Icon name="chevron-right" size={18} tint={color.ink2} />
          </Pressable>
        </View>
      </View>
      {/* Agreeing before reading opens the notice first. */}
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: agree }} onPress={() => (read ? setAgree((x) => !x) : setReading(true))} style={st.agreeRow}>
        <View style={[st.check, agree && st.checkOn]}>{agree ? <SvgXml xml={CHECK} width={16} height={16} style={{ flexShrink: 0 }} /> : null}</View>
        <View style={{ flexShrink: 1 }}>
          <Text style={st.agree}>
            I’ve read and agree to the{' '}
            <Text style={st.link} onPress={() => setReading(true)}>
              monitoring notice
            </Text>
            , <Text style={st.link}>Terms</Text> and <Text style={st.link}>Privacy policy</Text>
          </Text>
        </View>
      </Pressable>
      <Field label="Type your full name to sign" value={name} onChangeText={setName} autoComplete="name" placeholder="Full name" style={{ minHeight: 46, height: 46 }} />
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onPress} style={st.back}>
      <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
    </Pressable>
  );
}

const st = StyleSheet.create({
  // shared header (S2 and S2a)
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  // S2 values
  caption: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink2, flexShrink: 1 },
  title: { fontFamily: font.display, fontSize: 24, lineHeight: 29, color: color.ink },
  timeline: { gap: 8, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  off: { fontFamily: font.body, fontSize: 13, color: color.quiet, flexShrink: 1 },
  onWindow: { fontFamily: font.bodyBold, fontSize: 13, color: color.primary, flexShrink: 1 },
  facts: { paddingVertical: 4, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  fact: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9 },
  factKey: { fontFamily: font.body, fontSize: 14, color: color.ink2, flexShrink: 1 },
  factVal: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink, flexShrink: 1 },
  label: { fontFamily: font.bodyBold, fontSize: 13, letterSpacing: 0.6, color: color.ink2, flexShrink: 1 },
  labelRight: { fontFamily: font.bodyBold, fontSize: 12, color: color.ink2, flexShrink: 1 },
  docs: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  docTitle: { fontFamily: font.bodySemi, fontSize: 15, lineHeight: 19, color: color.ink },
  docSub: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  agreeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, minHeight: 44 },
  agree: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  link: { fontFamily: font.bodyBold, color: color.primary, textDecorationLine: 'underline' },
  footNote: { fontFamily: font.body, fontSize: 13, color: color.ink2, textAlign: 'center' },
  // S2a values
  noticeTitle: { fontFamily: font.display, fontSize: 22, color: color.ink, marginVertical: -4.62 },
  noticeSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  progress: { height: 4, marginHorizontal: 20, backgroundColor: color.muted, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: color.primary },
  noticeBody: { gap: 14, paddingTop: 12, paddingHorizontal: 20, paddingBottom: 8 },
  noticeFooter: { gap: 6, paddingTop: 6, paddingHorizontal: 20, paddingBottom: 28 },
  short: { backgroundColor: color.primaryTint, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, gap: 6 },
  shortLabel: { fontFamily: font.bodyBold, fontSize: 13, letterSpacing: 0.4, color: color.primaryStrong },
  shortText: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  h: { fontFamily: font.display, fontSize: 17, color: color.ink, marginVertical: -2.62 },
  body: { fontFamily: font.body, fontSize: 14, lineHeight: 21, color: color.ink },
  legal: { fontFamily: font.body, fontSize: 12, color: color.ink2, textAlign: 'center' },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 50 },
  docIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: color.lineStrong, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: color.primary, borderColor: color.primary },
});
