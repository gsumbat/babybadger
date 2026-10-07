import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CIcon, Toggle } from '@/components/credentials';
import { Text, TextInput } from '@/components/Text';
import { Button, ErrorText, Loading, Screen } from '@/components/ui';
import { cleanLanguage, LEVELS, saveLanguages, sitterBundle, sitterProfileApi, sortLanguages, suggestions, type LanguageLevel } from '@/lib/credentials';
import { useQuery } from '@/lib/data';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';

type Lang = { language: string; level: LanguageLevel };

// Wireframe S16 Languages, from app/src/wireframes/S16.tsx. Opened from S13 / S14 / Me (S39) "Languages".
// Each language has a level (Basic / Good / Fluent / Native); typing a name and pressing return, or tapping a
// suggestion, adds it as "Good". Save replaces the saved list and the "Happy to teach a language" switch.
// Not drawn: the empty list (the card is hidden until a language is added).
export default function Languages() {
  const { session } = useSession();
  const uid = session!.user.id;
  const { data } = useQuery(() => sitterBundle(uid), [uid]);
  const [list, setList] = useState<Lang[] | null>(null);
  const [teach, setTeach] = useState<boolean | null>(null);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  if (!data) return <Loading />;

  const langs = list ?? sortLanguages(data.langs).map((l) => ({ language: l.language, level: l.level }));
  const teaches = teach ?? data.profile?.teaches_language ?? false;

  function add(name: string) {
    const language = cleanLanguage(name);
    setTyped('');
    if (!language || langs.some((l) => l.language.toLowerCase() === language.toLowerCase())) return;
    setList([...langs, { language, level: 'conversational' }]);
  }

  async function save() {
    setBusy(true);
    setErr('');
    try {
      const pending = cleanLanguage(typed);
      const final = pending && !langs.some((l) => l.language.toLowerCase() === pending.toLowerCase()) ? [...langs, { language: pending, level: 'conversational' as const }] : langs;
      await saveLanguages(uid, final);
      if (teaches !== (data!.profile?.teaches_language ?? false)) await sitterProfileApi.save(uid, { teaches_language: teaches });
      router.back();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen back title="Languages" gap={12} footer={<Button label="Save" busy={busy} disabled={data.missing} onPress={save} />}>
      <Text style={st.intro}>Add every language you can use with kids. Families can look for a sitter who speaks theirs.</Text>
      <ErrorText>{data.error || err}</ErrorText>

      {langs.length ? (
        <View style={st.card}>
          {langs.map((l, i) => (
            <View key={l.language} style={[st.lang, i < langs.length - 1 && st.line]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={st.langName}>{l.language}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${l.language}`} onPress={() => setList(langs.filter((x) => x.language !== l.language))} hitSlop={8}>
                  <Text style={st.remove}>Remove</Text>
                </Pressable>
              </View>
              <View style={st.seg}>
                {LEVELS.map((lv) => {
                  const on = lv.value === l.level;
                  return (
                    <Pressable
                      key={lv.value}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      onPress={() => setList(langs.map((x) => (x.language === l.language ? { ...x, level: lv.value } : x)))}
                      style={[st.segItem, on && { backgroundColor: '#FFFFFF' }]}>
                      <Text style={[st.segText, on && st.segTextOn]}>{lv.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View>
        <TextInput
          value={typed}
          onChangeText={setTyped}
          onSubmitEditing={() => add(typed)}
          returnKeyType="done"
          submitBehavior="submit"
          placeholder="Add a language"
          placeholderTextColor={color.quiet}
          accessibilityLabel="Add a language"
          maxLength={40}
          style={st.input}
        />
        <View style={st.plus} pointerEvents="none">
          <CIcon name="plus" tint={color.ink2} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {suggestions(langs).map((s) => (
          <Pressable key={s} accessibilityRole="button" accessibilityLabel={`Add ${s}`} onPress={() => add(s)} style={st.chip}>
            <Text style={st.chipText}>{s}</Text>
          </Pressable>
        ))}
      </View>

      <View style={st.teach}>
        <View style={{ flexShrink: 1 }}>
          <Text style={st.teachTitle}>Happy to teach a language</Text>
          <Text style={st.teachSub}>Shows on your profile as a skill</Text>
        </View>
        <Toggle on={teaches} onPress={() => setTeach(!teaches)} label="Happy to teach a language" />
      </View>
    </Screen>
  );
}

// Values from wireframe S16.
const st = StyleSheet.create({
  intro: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  card: { paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  lang: { gap: 8, paddingVertical: 12 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  langName: { fontFamily: font.bodySemi, fontSize: 16, color: color.ink, flexShrink: 1 },
  remove: { fontFamily: font.bodySemi, fontSize: 13, color: color.badInk, textDecorationLine: 'underline' },
  seg: { flexDirection: 'row', gap: 4, padding: 4, backgroundColor: color.muted, borderRadius: 12 },
  segItem: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  segText: { fontFamily: font.bodyMedium, fontSize: 13, color: color.ink2 },
  segTextOn: { fontFamily: font.bodyBold, color: color.ink },
  input: { height: 50, paddingLeft: 44, paddingRight: 14, borderRadius: 8, borderWidth: 1, borderColor: color.lineStrong, fontFamily: font.body, fontSize: 16, color: color.ink },
  plus: { position: 'absolute', top: 14, left: 14 },
  chip: { height: 40, paddingHorizontal: 14, justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 999, borderWidth: 1, borderColor: color.line },
  chipText: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  teach: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  teachTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  teachSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
});
