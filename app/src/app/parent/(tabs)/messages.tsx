import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnShift, Thread, ThreadChips } from '@/components/messages';
import { Empty, ErrorText, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName, timeOf } from '@/lib/format';
import { buildThread, messagesApi, threadKey, useThread, useUnread } from '@/lib/messages';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe P10 (app/src/wireframes/P10.tsx): the family's thread with one sitter. With several signed sitters,
// S37's chip row switches between them (P10 draws only one thread). Opened as a tab, so no back button.
// `?sitter=` (push alerts) opens that sitter's thread.
const DOTS = ['#2F6FD6', '#D9822B', '#8676B3'];

export default function Messages() {
  const { session, family } = useSession();
  const uid = session!.user.id;
  const params = useLocalSearchParams<{ sitter?: string }>();
  const { data: sitters, error } = useQuery(async () => (family ? api.familySitters(family.id) : []), [family?.id]);
  const active = useMemo(() => (sitters ?? []).filter((s) => s.status === 'active').sort((a, b) => +new Date(a.joined_at) - +new Date(b.joined_at)), [sitters]);
  // a chip pick holds until an alert opens another sitter's thread
  const [picked, setPicked] = useState<{ id: string; param?: string }>();
  const wanted = picked && picked.param === params.sitter ? picked.id : params.sitter;
  const chosen = active.find((s) => s.sitter_id === wanted) ?? active[0];
  const { thread, error: threadError, add } = useThread(family?.id, chosen?.sitter_id);
  const { counts } = useUnread(active.length > 1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const { top } = useSafeAreaInsets();

  if (!sitters && !error) return <Loading />;
  if (!family || !chosen)
    return (
      <Screen title="Messages">
        <ErrorText>{error}</ErrorText>
        <Empty icon="message-square" title="No sitters yet">
          Once a sitter joins and signs your notice, you can message her here.
        </Empty>
      </Screen>
    );

  const name = firstName(chosen.profile?.full_name);
  const onShift = thread?.shifts.find((s) => s.status === 'active');
  const items = thread ? buildThread(thread.messages, thread.shifts, thread.reads, (m) => m.author_id !== chosen.sitter_id) : [];

  async function send(body: string) {
    setBusy(true);
    setErr('');
    try {
      add(await messagesApi.send(family!.id, chosen!.sitter_id, uid, body));
      return true;
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  const person = (
    <View style={st.person}>
      <View style={st.avatar}>
        <Text style={st.avatarText}>{name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={st.name}>{name}</Text>
        {onShift ? <OnShift>{`On shift until ${timeOf(onShift.ends_at)}`}</OnShift> : null}
      </View>
    </View>
  );

  const header =
    active.length > 1 ? (
      <View style={[st.headerStack, { paddingTop: top + 16 }]}>
        <ThreadChips
          chips={active.map((s, i) => ({
            key: s.sitter_id,
            label: firstName(s.profile?.full_name),
            dot: DOTS[i % DOTS.length],
            unread: s.sitter_id === chosen.sitter_id ? 0 : (counts[threadKey(family.id, s.sitter_id)] ?? 0),
            on: s.sitter_id === chosen.sitter_id,
          }))}
          onPick={(id) => setPicked({ id, param: params.sitter })}
        />
        {person}
      </View>
    ) : (
      <View style={[st.header, { paddingTop: top + 12 }]}>{person}</View>
    );

  return (
    <Thread
      side="parent"
      header={header}
      items={items}
      clockedIn={`${name} clocked in`}
      placeholder={`Message ${name}`}
      quick={[
        { label: 'Ask for a photo', onPress: () => send('Can you send a photo?') },
        { label: 'Running late', onPress: () => send('Running late') },
      ]}
      onSend={send}
      busy={busy}
      error={err || threadError}
    />
  );
}

// Values from wireframe P10 (header) and S37 (header with chips).
const st = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: color.line },
  headerStack: { gap: 12, paddingHorizontal: 20, paddingBottom: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: color.line },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: font.bodyBold, fontSize: 16, color: '#FFFFFF' },
  name: { fontFamily: font.displayBold, fontSize: 17, color: color.ink },
});
