import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { DotPill, ReqTile } from '@/components/requirements';
import { Quote, reqReqStyles } from '@/components/requirementRequests';
import { Text } from '@/components/Text';
import { Loading, Screen } from '@/components/ui';
import { useQuery } from '@/lib/data';
import { requirementRequestsApi, shortDay, SITTER_LABEL, SITTER_PILL, sitterState, sitterSub, type ReqRequest } from '@/lib/requirement-requests-api';
import { reqIcon } from '@/lib/requirements';
import { color, font, SECTION_GAP } from '@/theme';

// Wireframe S53 Requests, from app/src/wireframes/S53.tsx. Opened from Home "Needs you", Me › Certifications (S14) and
// the "The Lee family asked for …" push (/sitter/requests). One section per family: who asked and when, the parent's
// note, then each request with Asked / Shared, waiting / Looks good ✓ / You don't have it / Expired. Asked, expired,
// declined and shared rows open S53b (a card) or S53d (a confirmation); Looks good rows don't open.
// Not drawn: no requests ("Nothing asked yet."), a family with different notes per request (the first one shows).
export default function Requests() {
  const { data } = useQuery(() => requirementRequestsApi.mine(), []);
  if (!data) return <Loading />;

  const open = (q: ReqRequest) => router.push({ pathname: '/sitter/requests/[id]', params: { id: q.id } });

  return (
    <Screen back title="Requests" gap={12}>
      <Text style={reqReqStyles.lead}>Families you sit for can ask to see a card or a report. Only the family that asked sees what you share.</Text>
      {!data.length ? <Text style={reqReqStyles.small}>Nothing asked yet.</Text> : null}
      {data.map((g, gi) => {
        const asked = [...g.requests].filter((q) => q.asked_at).sort((a, b) => a.asked_at!.localeCompare(b.asked_at!));
        const first = asked[0];
        const note = g.requests.find((q) => q.status === 'asked' && q.note)?.note;
        return (
          <View key={g.family_id} style={{ gap: 12, marginTop: SECTION_GAP }}>
            <View style={st.head}>
              <Text style={reqReqStyles.label}>{g.family_name.toUpperCase()}</Text>
              {first ? (
                <Text style={st.meta}>
                  {first.asked_by ? `Asked by ${first.asked_by} · ` : ''}
                  {shortDay(first.asked_at)}
                </Text>
              ) : null}
            </View>
            {note ? <Quote who={first?.asked_by || 'They asked'} text={note} /> : null}
            <View style={reqReqStyles.listCard}>
              {g.requests.map((q, i) => {
                const s = sitterState(q);
                const tappable = s !== 'met';
                return (
                  <Pressable key={q.id} accessibilityRole={tappable ? 'button' : undefined} disabled={!tappable} onPress={() => open(q)} style={({ pressed }) => [st.row, i < g.requests.length - 1 && st.line, pressed && { opacity: 0.8 }]}>
                    <ReqTile icon={reqIcon({ key: q.req_key, title: q.title })} size={36} />
                    <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
                      <Text style={st.title}>{q.title}</Text>
                      <Text style={st.sub} numberOfLines={2}>
                        {s === 'asked' && q.note ? (q.kinds ? 'Share a photo of your card' : 'Confirm it for this family') : sitterSub(q)}
                      </Text>
                    </View>
                    <View>
                      <DotPill label={SITTER_LABEL[s]} kind={SITTER_PILL[s]} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

// Values from wireframe S53.
const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  meta: { fontFamily: font.body, fontSize: 13, color: color.ink2, flexShrink: 1, textAlign: 'right' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 58 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  title: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  sub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
});
