import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { CHEVRON_S37, OnShift, Thread, ThreadChips } from '@/components/messages';
import { Empty, Screen, initialsOf } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { timeOf } from '@/lib/format';
import { buildThread, messagesApi, threadKey, useThread, useUnread } from '@/lib/messages';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe S37 (app/src/wireframes/S37.tsx): chips switch between the families she has signed for; the thread is
// with that family's parents. `?family=` (push alerts) opens that family's thread.
// Family colors follow join order, like the Families tab (S50).
const DOTS = ['#2F6FD6', '#D9822B', '#8676B3'];

/** "The Lee family" → "Lee family" (S37 chips and header). */
const shortFamily = (name: string) => name.replace(/^the\s+/i, '');

/** "Jen Lee" → "Jen L." */
function shortName(full?: string) {
  const parts = (full ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.` : parts[0];
}

export default function Messages() {
  const { session, sitterLinks } = useSession();
  const uid = session!.user.id;
  const params = useLocalSearchParams<{ family?: string }>();
  const { top } = useSafeAreaInsets();
  // Dots keep each family's place in join order (S50), so they're numbered before the unsigned ones drop out.
  const families = useMemo(
    () =>
      [...sitterLinks]
        .sort((a, b) => +new Date(a.joined_at) - +new Date(b.joined_at))
        .map((l, i) => ({ ...l, dot: DOTS[i % DOTS.length] }))
        .filter((l) => l.status === 'active'),
    [sitterLinks],
  );
  const [picked, setPicked] = useState<{ id: string; param?: string }>();
  const wanted = picked && picked.param === params.family ? picked.id : params.family;
  const chosen = families.find((f) => f.family_id === wanted) ?? families[0];
  const { thread, error: threadError, add } = useThread(chosen?.family_id, uid);
  const { counts } = useUnread(families.length > 1);
  const { data: parents } = useQuery(async () => (chosen ? api.familyParents(chosen.family_id) : []), [chosen?.family_id]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const titleBlock = (
    <View style={[st.header, { paddingTop: top + 16 }]}>
      <Text style={st.title}>Messages</Text>
    </View>
  );
  if (!chosen)
    return (
      <Screen bleedTop header={titleBlock}>
        <Empty icon="message-square" title="No families yet">
          Once you join a family and sign their notice, you can message the parents here.
        </Empty>
      </Screen>
    );

  const familyId = chosen.family_id;
  const parent = parents?.[0];
  const parentName = shortName(parent?.full_name);
  const onShift = thread?.shifts.find((s) => s.status === 'active');
  const items = thread ? buildThread(thread.messages, thread.shifts, thread.reads, (m) => m.author_id === uid) : [];

  async function run(job: () => Promise<void>) {
    setBusy(true);
    setErr('');
    try {
      await job();
      return true;
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  const send = (body: string) => run(async () => add(await messagesApi.send(familyId, uid, uid, body)));

  // "Send a photo": camera or library (the two choices of the log photo screen), then it sends right away.
  async function sendPhoto(camera: boolean) {
    const perm = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return setErr('Allow camera or photos access in Settings to send a photo.');
    const res = camera
      ? await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: true });
    if (res.canceled) return;
    await run(async () => {
      const path = await messagesApi.uploadPhoto(familyId, uid, res.assets[0].uri);
      add(await messagesApi.send(familyId, uid, uid, '', path));
    });
  }
  function askPhoto() {
    if (Platform.OS === 'web') return sendPhoto(false);
    Alert.alert('Send a photo', undefined, [
      { text: 'Camera', onPress: () => sendPhoto(true) },
      { text: 'Library', onPress: () => sendPhoto(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  const header = (
    <View style={[st.header, { paddingTop: top + 16 }]}>
      <Text style={st.title}>Messages</Text>
      {families.length > 1 ? (
        <ThreadChips
          chips={families.map((f) => ({
            key: f.family_id,
            label: shortFamily(f.family.name),
            dot: f.dot,
            unread: f.family_id === familyId ? 0 : (counts[threadKey(f.family_id, uid)] ?? 0),
            on: f.family_id === familyId,
          }))}
          onPick={(id) => setPicked({ id, param: params.family })}
        />
      ) : null}
      <Pressable accessibilityRole="button" onPress={() => router.push(`/sitter/family/${familyId}`)} style={({ pressed }) => [st.person, pressed && { opacity: 0.85 }]}>
        <View style={st.avatar}>
          <Text style={st.avatarText}>{initialsOf(parent?.full_name)}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={st.name}>{[parentName, shortFamily(chosen.family.name)].filter(Boolean).join(' · ')}</Text>
          {onShift ? <OnShift>{`You're on shift until ${timeOf(onShift.ends_at)}`}</OnShift> : null}
        </View>
        <SvgXml xml={CHEVRON_S37} width={20} height={20} style={{ flexShrink: 0 }} />
      </Pressable>
    </View>
  );

  return (
    <Thread
      side="sitter"
      header={header}
      items={items}
      clockedIn="You clocked in"
      placeholder={`Message ${parentName.split(' ')[0] || shortFamily(chosen.family.name)}`}
      quick={[
        { label: 'Running late', onPress: () => send('Running late') },
        { label: 'Send a photo', onPress: askPhoto },
        { label: 'All good here', onPress: () => send('All good here') },
      ]}
      onSend={send}
      busy={busy}
      error={err || threadError}
    />
  );
}

// Values from wireframe S37.
const st = StyleSheet.create({
  header: { gap: 12, paddingHorizontal: 20, paddingBottom: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: color.line },
  title: { fontFamily: font.display, fontSize: 24, color: color.ink },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.ink, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  name: { fontFamily: font.displayBold, fontSize: 17, color: color.ink },
});
