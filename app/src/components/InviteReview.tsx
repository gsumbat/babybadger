import { Pressable, StyleSheet, View } from 'react-native';

import { kidShade } from '@/components/bits';
import { Button, ErrorText, initialsOf, Screen } from '@/components/ui';
import { money, type InvitePreview } from '@/lib/invites';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';
import { ageLabel } from '@/lib/kid-profile';

/** Wireframe S1 Family invite (app/src/wireframes/S1.tsx): who invited her, which kids, the rate and what the family
 * sees, before she accepts (then S27 family requirements, S42 and S2 consent). Shown by JoinCode after a good code. */
export function InviteReview({ invite, onAccept, onDecline, busy, err }: { invite: InvitePreview; onAccept: () => void; onDecline: () => void; busy?: boolean; err?: string }) {
  return (
    <Screen
      gap={14}
      header={
        <View style={st.head}>
          <Text style={st.caption}>New invite</Text>
        </View>
      }
      footer={
        <View style={{ gap: 10, marginTop: 4 }}>
          <Button label="Review and accept" onPress={onAccept} busy={busy} />
          <Pressable accessibilityRole="button" onPress={onDecline} disabled={busy} style={st.decline}>
            <Text style={st.declineText}>Decline</Text>
          </Pressable>
        </View>
      }>
      <View style={st.card}>
        <View style={{ flexDirection: 'row' }}>
          <View style={[st.face, { backgroundColor: color.ink }]}>
            <Text style={st.faceText}>{initialsOf(invite.invited_by)}</Text>
          </View>
          {invite.kids.map((k, i) => (
            <View key={i} style={[st.face, { marginLeft: -14, backgroundColor: kidShade(k.color ?? undefined) }]}>
              <Text style={st.faceText}>{k.name[0]?.toUpperCase()}</Text>
            </View>
          ))}
        </View>
        <View style={{ gap: 4 }}>
          <Text style={st.title}>{invite.family_name} invited you</Text>
          {invite.rate != null ? <Text style={st.rate}>Rate: {money(Number(invite.rate))} per hour</Text> : null}
        </View>
        {invite.kids.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {invite.kids.map((k, i) => (
              <View key={i} style={st.kidPill}>
                <Text style={st.kidPillText}>
                  {k.name}
                  {k.birthdate ? `, ${ageLabel(k.birthdate)}` : k.age != null ? `, ${k.age}` : ''}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <View style={st.see}>
        <Text style={st.seeTitle}>They can see</Text>
        <Text style={st.line}>Your location while clocked in</Text>
        <Text style={st.line}>Hours you log</Text>
        <Text style={st.line}>Tasks, meals, notes, photos</Text>
      </View>
      <View style={st.never}>
        <Text style={st.neverTitle}>They never see</Text>
        <Text style={st.line}>Where you are between shifts</Text>
        <Text style={st.line}>Other families you work for</Text>
      </View>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

// Values from wireframe S1. Content starts 8 px under the caption (Screen's starts 4 px down).
const st = StyleSheet.create({
  head: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 12 },
  caption: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink2 },
  card: { gap: 14, padding: 20, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  face: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  faceText: { fontFamily: font.bodyBold, fontSize: 16, color: '#FFFFFF' },
  title: { fontFamily: font.display, fontSize: 24, color: color.ink, marginVertical: -4.22 },
  rate: { fontFamily: font.body, fontSize: 15, color: color.ink2 },
  kidPill: { height: 32, paddingHorizontal: 12, borderRadius: 999, backgroundColor: color.accentTint, justifyContent: 'center' },
  kidPillText: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  see: { gap: 8, padding: 14, backgroundColor: color.okTint, borderRadius: 16 },
  seeTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.okInk },
  never: { gap: 8, padding: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  neverTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.ink2 },
  line: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  decline: { height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  declineText: { fontFamily: font.displayBold, fontSize: 16, color: color.ink2 },
});
