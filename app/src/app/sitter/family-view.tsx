import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SitterAvatar } from '@/components/credentials';
import { CredGrid, profileStyles, SpeaksBlock } from '@/components/sitterProfile';
import { Text } from '@/components/Text';
import { Button, ErrorText, Loading, Pill, Screen } from '@/components/ui';
import { familyCredentials, familyViewLines, shortName, sitterBundle } from '@/lib/credentials';
import { useQuery } from '@/lib/data';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';

const NEVER_SHOWN = ['Card photos', 'Certificate numbers', 'Full report', 'Other families'];

// Wireframe S19 What families see, from app/src/wireframes/S19.tsx. Opened from S13 "Preview" (`?from=profile`, Edit
// profile goes back) and S39 "What families see" (Edit profile opens S13). Her own data, read-only, drawn with P11's
// pieces (components/sitterProfile): the credentials a family sees (verified, not expired; amber "Expires Oct 22"
// within 30 days, as P11 shows it), SPEAKS, her about-me in quotes. Lines under the name come from S13's ABOUT data
// (years with kids, ages, drives, rate); a line with nothing set is left out. Not drawn: no about-me (left out).
export default function FamilyView() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { session, profile } = useSession();
  const uid = session!.user.id;
  // sitterBundle never throws: before migration 19 the card shows just her name.
  const { data } = useQuery(() => sitterBundle(uid), [uid]);
  if (!data) return <Loading />;

  const full = profile?.full_name || 'You';
  const p = data.profile;
  const lines = familyViewLines(p).filter(Boolean);
  const bio = p?.bio?.trim();
  const edit = () => (from === 'profile' ? router.back() : router.push('/sitter/profile'));

  return (
    <Screen back title="What families see" gap={12} footer={<Button label="Edit profile" kind="tonal" onPress={edit} style={st.footerBtn} />}>
      <ErrorText>{data.error}</ErrorText>
      <View style={st.note}>
        <Text style={st.noteText}>{"This is a preview. Families see this when you're invited or, later, in the sitter pool."}</Text>
      </View>
      <View style={st.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <SitterAvatar name={full} photoPath={p?.photo_path} size={64} fontSize={28} />
          <View style={{ flexShrink: 1 }}>
            <Text style={st.name}>{shortName(full) || full}</Text>
            {lines.map((l) => (
              <Text key={l} style={st.meta}>
                {l}
              </Text>
            ))}
          </View>
        </View>
        <CredGrid creds={familyCredentials(data.creds)} />
        <SpeaksBlock langs={data.langs} />
        {bio ? <Text style={st.bio}>{`"${bio}"`}</Text> : null}
      </View>
      <Text style={[profileStyles.label, { marginTop: 2 }]}>NEVER SHOWN TO FAMILIES</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {NEVER_SHOWN.map((t) => (
          <Pill key={t} label={t} kind="muted" />
        ))}
      </View>
    </Screen>
  );
}

// Values from wireframe S19.
const st = StyleSheet.create({
  note: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 12 },
  noteText: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.primaryStrong },
  card: { gap: 14, padding: 18, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  name: { fontFamily: font.display, fontSize: 22, color: color.ink, marginVertical: -4.62 },
  meta: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  bio: { fontFamily: font.body, fontSize: 14, lineHeight: 21, color: color.ink },
  // S19 footer: 4 above, 32 below.
  footerBtn: { marginTop: -4 },
});
