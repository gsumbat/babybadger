import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Toggle } from '@/components/credentials';
import { Text, TextInput } from '@/components/Text';
import { Button, ErrorText, Loading, Screen } from '@/components/ui';
import { cleanLanguage, languageChips, LEVELS, saveLanguages, sitterBundle, sitterProfileApi, sortLanguages, type LanguageLevel } from '@/lib/credentials';
import { useQuery } from '@/lib/data';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { cardShadow, color, font, SECTION_GAP } from '@/theme';

type Lang = { language: string; level: LanguageLevel };

// Wireframe S16 Languages, from app/src/wireframes/S16.tsx (S16b: "+ Add language" open). Opened from S13 / S14 /
// Me (S39) "Languages". Chips (40 tall): English and Spanish first (tap to turn on or off), then the other languages
// she added ("Portuguese ✕", tap to remove), then "+ Add language", which opens a field to type any other language
// (return or Add adds it). A new language starts as "Good"; LEVEL sets Basic / Good / Fluent / Native for each.
// Save replaces the saved list and the "Happy to teach a language" switch. Languages count from her profile for a
// family's language requirement (no request).
// Not drawn: the empty list (the LEVEL card is hidden until a language is on).
export default function Languages() {
  const { session } = useSession();
  const uid = session!.user.id;
  const { data } = useQuery(() => sitterBundle(uid), [uid]);
  const [list, setList] = useState<Lang[] | null>(null);
  const [teach, setTeach] = useState<boolean | null>(null);
  const [typed, setTyped] = useState('');
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  if (!data) return <Loading />;

  const langs = list ?? sortLanguages(data.langs).map((l) => ({ language: l.language, level: l.level }));
  const teaches = teach ?? data.profile?.teaches_language ?? false;

  const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
  function add(name: string) {
    const language = cleanLanguage(name);
    setTyped('');
    setAdding(false);
    if (!language || langs.some((l) => same(l.language, language))) return;
    setList([...langs, { language, level: 'conversational' }]);
  }
  function toggle(language: string) {
    if (langs.some((l) => same(l.language, language))) setList(langs.filter((l) => !same(l.language, language)));
    else setList([...langs, { language, level: 'conversational' }]);
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

      <View style={st.chips}>
        {languageChips(langs).map((c) => (
          <Pressable
            key={c.language}
            accessibilityRole={c.fixed ? 'checkbox' : 'button'}
            accessibilityState={c.fixed ? { checked: c.on } : undefined}
            accessibilityLabel={c.fixed ? c.language : `Remove ${c.language}`}
            onPress={() => toggle(c.language)}
            style={[st.chip, c.on && st.chipOn]}>
            <Text style={[st.chipText, c.on && { color: color.primary }]}>{c.fixed ? (c.on ? `✓ ${c.language}` : c.language) : `${c.language}  ✕`}</Text>
          </Pressable>
        ))}
        {!adding ? (
          <Pressable accessibilityRole="button" onPress={() => setAdding(true)} style={st.chip}>
            <Text style={st.chipText}>+ Add language</Text>
          </Pressable>
        ) : null}
      </View>
      {adding ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={typed}
            onChangeText={setTyped}
            onSubmitEditing={() => add(typed)}
            returnKeyType="done"
            submitBehavior="submit"
            autoFocus
            autoCapitalize="words"
            placeholder="Type a language"
            placeholderTextColor={color.quiet}
            accessibilityLabel="Type a language"
            maxLength={40}
            style={st.input}
          />
          <Button label="Add" kind="tonal" disabled={!cleanLanguage(typed)} onPress={() => add(typed)} style={st.addBtn} />
        </View>
      ) : null}

      {langs.length ? (
        <>
          <Text style={st.label}>LEVEL</Text>
          <View style={st.card}>
            {langs.map((l, i) => (
              <View key={l.language} style={[st.lang, i < langs.length - 1 && st.line]}>
                <Text style={st.langName}>{l.language}</Text>
                <View style={st.seg}>
                  {LEVELS.map((lv) => {
                    const on = lv.value === l.level;
                    return (
                      <Pressable
                        key={lv.value}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={`${l.language}: ${lv.label}`}
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
        </>
      ) : null}

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
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6, marginTop: SECTION_GAP },
  seg: { flexDirection: 'row', gap: 4, padding: 4, backgroundColor: color.muted, borderRadius: 12 },
  segItem: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  segText: { fontFamily: font.bodyMedium, fontSize: 13, color: color.ink2 },
  segTextOn: { fontFamily: font.bodyBold, color: color.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipOn: { backgroundColor: color.primaryTint, borderWidth: 1.5, borderColor: color.primary },
  addBtn: { height: 50, paddingHorizontal: 22 },
  input: { flexGrow: 1, flexShrink: 1, height: 50, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: color.lineStrong, fontFamily: font.body, fontSize: 16, color: color.ink },
  chip: { height: 40, paddingHorizontal: 14, justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 999, borderWidth: 1, borderColor: color.line },
  chipText: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  teach: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  teachTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  teachSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
});
