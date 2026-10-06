import { Image } from 'expo-image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { KeyboardChatScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import type Reanimated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { tabBarHeight } from '@/components/tabs';
import { ErrorText } from '@/components/ui';
import { timeOf } from '@/lib/format';
import { messagesApi, type ThreadItem } from '@/lib/messages';
import { cardShadow, color, font } from '@/theme';
import { Text, TextInput } from '@/components/Text';

// Messages thread, translated from wireframes P10 (parent) and S37 (sitter): app/src/wireframes/P10.tsx, S37.tsx.
// P10 and S37 differ in a few values (incoming bubble corner, day label color, chip text size, send icon, photo size);
// `side` picks the set.

export type Side = 'parent' | 'sitter';

// Height of the Previous / Next / Done bar above the keyboard (app/_layout), as in components/ui Screen.
const KEYBOARD_TOOLBAR = 42;

const SEND_P10 = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SEND_S37 = '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export const CHEVRON_S37 = '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" fill="none" stroke="#4B5960" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export type QuickReply = { label: string; onPress: () => void };

/** Whole thread screen: header, messages, quick replies and composer. Sits above the tab bar. */
export function Thread({
  side,
  header,
  items,
  clockedIn,
  placeholder,
  quick,
  onSend,
  busy,
  error,
}: {
  side: Side;
  header: ReactNode;
  items: ThreadItem[];
  /** Clock-in pill text: "Maya clocked in" (P10) / "You clocked in" (S37). */
  clockedIn: string;
  placeholder: string;
  quick: QuickReply[];
  onSend: (text: string) => Promise<boolean>;
  busy?: boolean;
  error?: string;
}) {
  const insets = useSafeAreaInsets();
  const lift = tabBarHeight(insets.bottom) - KEYBOARD_TOOLBAR;
  const scroll = useRef<Reanimated.ScrollView>(null);
  const [text, setText] = useState('');
  const p = side === 'parent';

  async function send() {
    const body = text.trim();
    if (!body || busy) return;
    if (await onSend(body)) setText('');
  }

  return (
    <View style={st.screen}>
      {header}
      <KeyboardChatScrollView
        ref={scroll}
        offset={lift}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={st.main}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}>
        {items.map((it) => {
          if (it.kind === 'day')
            return (
              <Text key={it.key} style={[st.day, { color: p ? '#5F6D74' : '#6B7980' }]}>
                {it.label}
              </Text>
            );
          if (it.kind === 'clockIn')
            return (
              <View key={it.key} style={st.pillOk}>
                <Text style={st.pillOkText}>
                  {clockedIn} · {timeOf(it.at)}
                </Text>
              </View>
            );
          const m = it.message;
          if (m.photo_path) {
            // P10: a photo from the sitter (left, caption · time). S37: her own photo (right, "Sent … · seen").
            return it.mine ? (
              <View key={it.key} style={st.photoMine}>
                <MessagePhoto path={m.photo_path} style={{ width: 200, height: 130 }} />
                <Text style={[st.photoCaption, { color: '#6B7980' }]}>
                  Sent {timeOf(m.created_at)}
                  {it.seen ? ' · seen' : ''}
                </Text>
              </View>
            ) : (
              <View key={it.key} style={st.photoTheirs}>
                <MessagePhoto path={m.photo_path} style={{ width: 220, height: 150, borderWidth: 1, borderColor: '#D5DCE4' }} />
                <Text style={[st.photoCaption, { color: '#5F6D74' }]}>{[m.body, timeOf(m.created_at)].filter(Boolean).join(' · ')}</Text>
              </View>
            );
          }
          return it.mine ? (
            <View key={it.key} style={st.mine}>
              <Text style={st.mineText}>{m.body}</Text>
            </View>
          ) : (
            <View key={it.key} style={[st.theirs, { borderTopLeftRadius: p ? 24 : 18 }]}>
              <Text style={st.theirsText}>{m.body}</Text>
            </View>
          );
        })}
      </KeyboardChatScrollView>
      <KeyboardStickyView offset={{ closed: 0, opened: lift }}>
        <View style={st.footer}>
          <ErrorText>{error}</ErrorText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} keyboardShouldPersistTaps="handled">
            {quick.map((q) => (
              <Pressable key={q.label} accessibilityRole="button" disabled={busy} onPress={q.onPress} style={({ pressed }) => [st.quick, pressed && { opacity: 0.7 }]}>
                <Text style={[st.quickText, { fontSize: p ? 14 : 13 }]}>{q.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={st.composer}>
            <TextInput
              accessibilityLabel={placeholder}
              placeholder={placeholder}
              placeholderTextColor="#6B7980"
              value={text}
              onChangeText={setText}
              returnKeyType="send"
              submitBehavior="submit"
              onSubmitEditing={send}
              style={st.input}
            />
            <Pressable accessibilityRole="button" accessibilityLabel="Send" disabled={busy || !text.trim()} onPress={send} style={({ pressed }) => [st.send, pressed && { opacity: 0.85 }]}>
              <SvgXml xml={p ? SEND_P10 : SEND_S37} width={22} height={22} style={{ flexShrink: 0 }} />
            </Pressable>
          </View>
        </View>
      </KeyboardStickyView>
    </View>
  );
}

/** S37 family chips ("Lee family", "Ortiz family · 1"), also used on the parent side to switch sitters. */
export function ThreadChips({ chips, onPick }: { chips: { key: string; label: string; dot: string; unread: number; on: boolean }[]; onPick: (key: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {chips.map((c) => (
        <Pressable
          key={c.key}
          accessibilityRole="button"
          accessibilityState={{ selected: c.on }}
          onPress={() => onPick(c.key)}
          style={[st.chip, c.on ? st.chipOn : st.chipOff]}>
          <View style={[st.dot, { backgroundColor: c.dot }]} />
          <Text style={[st.chipText, { color: c.on ? '#34526E' : color.ink }]}>
            {c.label}
            {c.unread ? ` · ${c.unread}` : ''}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

/** Green "On shift until 7:00 PM" line under the name (P10, S37). */
export function OnShift({ children }: { children: string }) {
  return (
    <View style={st.onShift}>
      <View style={st.onShiftDot} />
      <Text style={st.onShiftText}>{children}</Text>
    </View>
  );
}

function MessagePhoto({ path, style }: { path: string; style: object }) {
  const [uri, setUri] = useState<string | null>(null);
  useEffect(() => {
    messagesApi.photoUrl(path).then(setUri);
  }, [path]);
  return <View style={[st.photo, style]}>{uri ? <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" /> : null}</View>;
}

// Values from wireframes P10 / S37.
export const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.canvas },
  main: { gap: 10, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 16 },
  day: { fontFamily: font.body, fontSize: 13, alignSelf: 'center' },
  pillOk: { alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: color.okTint, borderRadius: 999 },
  pillOkText: { fontFamily: font.bodySemi, fontSize: 13, color: color.okInk },
  mine: { alignSelf: 'flex-end', maxWidth: 260, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.primary, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 6, borderBottomLeftRadius: 18 },
  mineText: { fontFamily: font.body, fontSize: 15, color: '#FFFFFF', lineHeight: 21 },
  theirs: { alignSelf: 'flex-start', maxWidth: 260, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 6, ...cardShadow },
  theirsText: { fontFamily: font.body, fontSize: 15, color: color.ink, lineHeight: 21 },
  photoMine: { alignSelf: 'flex-end', alignItems: 'flex-end', gap: 4 },
  photoTheirs: { alignSelf: 'flex-start', gap: 4, maxWidth: 220 },
  photo: { borderRadius: 18, overflow: 'hidden', backgroundColor: color.accentTint },
  photoCaption: { fontFamily: font.body, fontSize: 12 },
  footer: { gap: 10, paddingTop: 10, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: color.line },
  quick: { height: 36, paddingHorizontal: 12, justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 999, borderWidth: 1, borderColor: color.line },
  quickText: { fontFamily: font.bodySemi, color: color.ink },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { flex: 1, minWidth: 0, height: 48, paddingHorizontal: 16, borderRadius: 24, borderWidth: 1, borderColor: color.lineStrong, fontFamily: font.body, fontSize: 16, color: color.ink },
  send: { width: 48, height: 48, borderRadius: 24, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingHorizontal: 12, borderRadius: 999 },
  chipOn: { backgroundColor: color.primaryTint },
  chipOff: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line },
  dot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontFamily: font.bodyBold, fontSize: 13 },
  onShift: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onShiftDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.ok },
  onShiftText: { fontFamily: font.body, fontSize: 13, color: color.okInk },
});
