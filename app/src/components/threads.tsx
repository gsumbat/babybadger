// One family × sitter thread with its sending logic, shared by the Messages tabs (S37 / P10 with chips) and the stacked
// thread screens opened from a shift or a profile (S37t `sitter/thread/[familyId]`, P10 `parent/thread/[sitterId]`).
// The screens only draw the header; messages, quick replies, composer, photo send (sitter), "Ask for a photo"
// (parent) and the read markers live here and in components/messages.
import * as ImagePicker from 'expo-image-picker';
import { useState, type ReactNode } from 'react';
import { Alert, Platform } from 'react-native';

import { Thread } from '@/components/messages';
import { api, useQuery } from '@/lib/data';
import { buildThread, messagesApi, useThread } from '@/lib/messages';
import { useCanManage } from '@/lib/use-family-role';
import type { Profile, Shift } from '@/lib/types';

/** "The Lee family" → "Lee family" (S37 chips and headers). */
export const shortFamily = (name: string) => name.replace(/^the\s+/i, '');

/** "Jen Lee" → "Jen L." */
export function shortName(full?: string) {
  const parts = (full ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.` : parts[0];
}

function useSend() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
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
  return { busy, err, setErr, run };
}

/** The sitter's thread with one family (S37 / S37t). Quick replies: Running late, Send a photo, All good here. */
export function SitterThread({
  familyId,
  familyName,
  uid,
  header,
  stacked,
}: {
  familyId: string;
  familyName: string;
  uid: string;
  header: (h: { parents: Profile[]; onShift?: Shift }) => ReactNode;
  stacked?: boolean;
}) {
  const { thread, error: threadError, add } = useThread(familyId, uid);
  const { data: parents } = useQuery(() => api.familyParents(familyId), [familyId]);
  const { busy, err, setErr, run } = useSend();
  const onShift = thread?.shifts.find((s) => s.status === 'active');
  const items = thread ? buildThread(thread.messages, thread.shifts, thread.reads, (m) => m.author_id === uid) : [];
  const parentName = shortName(parents?.[0]?.full_name);
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

  return (
    <Thread
      side="sitter"
      stacked={stacked}
      header={header({ parents: parents ?? [], onShift })}
      items={items}
      clockedIn="You clocked in"
      placeholder={`Message ${parentName.split(' ')[0] || shortFamily(familyName)}`}
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

/** The family's thread with one sitter (P10). Any member can write, read-only ones too; only full access gets the
 * "Running late" quick reply (P10r), since only they book and move shifts. */
export function ParentThread({
  familyId,
  sitterId,
  sitterName,
  uid,
  header,
  stacked,
}: {
  familyId: string;
  sitterId: string;
  sitterName: string;
  uid: string;
  header: (h: { onShift?: Shift }) => ReactNode;
  stacked?: boolean;
}) {
  const manage = useCanManage();
  const { thread, error: threadError, add } = useThread(familyId, sitterId);
  const { busy, err, run } = useSend();
  const onShift = thread?.shifts.find((s) => s.status === 'active');
  const items = thread ? buildThread(thread.messages, thread.shifts, thread.reads, (m) => m.author_id !== sitterId) : [];
  const send = (body: string) => run(async () => add(await messagesApi.send(familyId, sitterId, uid, body)));

  return (
    <Thread
      side="parent"
      stacked={stacked}
      header={header({ onShift })}
      items={items}
      clockedIn={`${sitterName} clocked in`}
      placeholder={`Message ${sitterName}`}
      quick={[
        { label: 'Ask for a photo', onPress: () => send('Can you send a photo?') },
        ...(manage ? [{ label: 'Running late', onPress: () => send('Running late') }] : []),
      ]}
      onSend={send}
      busy={busy}
      error={err || threadError}
    />
  );
}
