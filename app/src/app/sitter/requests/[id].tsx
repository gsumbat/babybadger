import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CIcon } from '@/components/credentials';
import { DotPill } from '@/components/requirements';
import { BigButton, CheckBox, LinkButton, NoteInput, NoteSheet, Quote, Radio, reqReqStyles } from '@/components/requirementRequests';
import { Text } from '@/components/Text';
import { ErrorText, Loading, Screen } from '@/components/ui';
import { credentialSub, sitterCredentials, sitterProfile, shortExpiry } from '@/lib/credentials';
import { useQuery } from '@/lib/data';
import { addKindFor, ageCheck, isSelfDeclared, matchingCredentials, requestErrorText, requirementRequestsApi, selfPrompt } from '@/lib/requirement-requests-api';
import { useSession } from '@/lib/session';
import { cardShadow, color, font, SECTION_GAP } from '@/theme';

// Wireframes S53b Share a card and S53d Share a confirmation, from app/src/wireframes/S53b.tsx / S53d.tsx; S53c "I
// don't have it" is the sheet at the bottom. Opened from S53. A card request lists her cards of a matching kind
// (current first; expired ones dimmed and off); "Add a new card" opens S15 (or S17d for a background check) with
// ?share=, which saves the card and shares it. Self-declared requests (non-smoker, OK with pets, age 18+, references,
// the parent's own) share a confirmation and a note; Age 18+ uses her birthday when she gave one.
// Not drawn: no cards of that kind yet (only "Add a new card"), a birthday under 18 (the line, no Share button).
export default function ShareRequest() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const uid = session!.user.id;
  const { data, error } = useQuery(async () => {
    const [groups, creds, profile] = await Promise.all([requirementRequestsApi.mine(), sitterCredentials(uid).catch(() => []), sitterProfile(uid).catch(() => null)]);
    const g = groups.find((x) => x.requests.some((q) => q.id === id));
    const q = g?.requests.find((x) => x.id === id);
    if (!g || !q) throw new Error('This request isn’t there anymore.');
    return { family: g.family_name, q, creds, birthdate: profile?.birthdate ?? null };
  }, [id, uid]);
  const [pick, setPick] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [decline, setDecline] = useState(false);
  const [err, setErr] = useState('');
  if (!data) return error ? <Screen back title="Share"><ErrorText>{error}</ErrorText></Screen> : <Loading />;

  const { q, family } = data;
  const self = isSelfDeclared(q);
  const cards = matchingCredentials(q.kinds, data.creds);
  const chosen = pick ?? (q.credential && cards.some((c) => c.cred.id === q.credential!.id && !c.expired) ? q.credential.id : cards.find((c) => !c.expired)?.cred.id ?? null);
  const age = q.req_key === 'age_18' ? ageCheck(data.birthdate) : null;
  const blocked = age?.ok === false;
  const ready = self ? (age ? age.ok : confirmed) : !!chosen;

  async function share() {
    setBusy(true);
    setErr('');
    try {
      await requirementRequestsApi.share(q.id, self ? null : chosen, note);
      router.back();
    } catch (e) {
      setErr(requestErrorText(e));
    } finally {
      setBusy(false);
    }
  }
  function addNew() {
    const kind = addKindFor(q.kinds);
    if (kind === 'background_check') return router.push({ pathname: '/sitter/background', params: { share: q.id } });
    router.push({ pathname: '/sitter/credentials/add', params: { share: q.id, ...(kind ? { kind } : {}) } });
  }

  return (
    <Screen
      back
      title={self ? q.title : `Share ${q.title}`}
      gap={12}
      footer={
        <View style={{ gap: 2 }}>
          {!blocked ? (
            <View style={{ flexDirection: 'row' }}>
              <BigButton label={`Share with ${family.replace(/^The /, 'the ')}`} onPress={share} busy={busy} disabled={!ready} />
            </View>
          ) : null}
          <LinkButton label={self ? 'That’s not me' : 'I don’t have it'} onPress={() => setDecline(true)} danger />
        </View>
      }>
      <Text style={reqReqStyles.lead}>{self ? `Nothing to upload. Confirm it for ${family.replace(/^The /, 'the ')}.` : `With ${family.replace(/^The /, 'the ')} only. They see the photo of your card and its dates.`}</Text>
      {q.note ? <Quote who={`${q.asked_by || 'They'} asked`} text={q.note} /> : null}

      {self ? (
        age ? (
          <View style={[st.confirm, !age.ok && { opacity: 0.6 }]}>
            <CIcon name={age.ok ? 'check' : 'warn'} tint={age.ok ? color.ok : color.warnInk} />
            <Text style={st.confirmText}>{age.line}</Text>
          </View>
        ) : (
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: confirmed }} onPress={() => setConfirmed((c) => !c)} style={st.confirm}>
            <CheckBox on={confirmed} />
            <Text style={st.confirmText}>{selfPrompt(q.req_key, q.title)}</Text>
          </Pressable>
        )
      ) : (
        <>
          <Text style={[reqReqStyles.label, { marginTop: SECTION_GAP }]}>YOUR CARDS</Text>
          {cards.map(({ cred, expired }) => {
            const on = !expired && chosen === cred.id;
            return (
              <Pressable
                key={cred.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: on, disabled: expired }}
                disabled={expired}
                onPress={() => setPick(cred.id)}
                style={[st.choice, on && st.choiceOn, expired && { opacity: 0.5 }]}>
                <Radio on={on} />
                <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
                  <Text style={st.choiceTitle}>{cred.title}</Text>
                  <Text style={st.choiceSub}>{expired && cred.expires_on ? [cred.issuer, `ended ${shortExpiry(cred.expires_on)}`].filter(Boolean).join(' · ') : credentialSub(cred)}</Text>
                </View>
                {expired ? (
                  <View>
                    <DotPill label="Expired" kind="bad" />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
          <Pressable accessibilityRole="button" onPress={addNew} style={st.add}>
            <CIcon name="plus" tint={color.primary} />
            <Text style={st.addText}>{q.req_key === 'background_check' ? 'Upload a report' : 'Add a new card'}</Text>
          </Pressable>
        </>
      )}

      {!blocked ? <NoteInput label="Note for the family (optional)" value={note} onChange={setNote} /> : null}
      {q.req_key === 'age_18' && !age ? <Text style={reqReqStyles.small}>Add your birthday in Personal details and it’s used instead.</Text> : null}
      <ErrorText>{err}</ErrorText>

      <NoteSheet
        open={decline}
        onClose={() => setDecline(false)}
        title={`Don’t have ${q.title}?`}
        sub={`We’ll tell ${family.replace(/^The /, 'the ')}. You can still share it later.`}
        label="Note (optional)"
        placeholder="Booked a class for Nov 2."
        button={`Tell ${family.replace(/^The /, 'the ')}`}
        onSend={async (n) => {
          await requirementRequestsApi.decline(q.id, n);
          router.back();
        }}
      />
    </Screen>
  );
}

// Values from wireframes S53b / S53d.
const st = StyleSheet.create({
  confirm: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  confirmText: { flexShrink: 1, fontFamily: font.bodySemi, fontSize: 16, color: color.ink },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF' },
  choiceOn: { backgroundColor: color.primaryTint, borderWidth: 2, borderColor: color.primary, paddingHorizontal: 13 },
  choiceTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  choiceSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  add: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 14, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: '#C9D3DD' },
  addText: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary },
});
