// Messages (wireframes P10, S37): one thread per family × sitter, shared by the family's parents and that sitter.
// Tables, rules and push alerts: supabase/migrations/20261006000010_messages.sql.
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import type { Message, ReadMark } from './message-thread';
import { threadKey } from './message-thread';
import { supabase } from './supabase';
import type { Shift } from './types';

export * from './message-thread';

function must<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

// Badges listen here so they drop as soon as a thread is marked read on this phone.
const listeners = new Set<() => void>();
const changed = () => listeners.forEach((l) => l());

export const messagesApi = {
  async thread(familyId: string, sitterId: string) {
    const [messages, reads, shifts] = await Promise.all([
      supabase.from('messages').select('*').eq('family_id', familyId).eq('sitter_id', sitterId).order('created_at', { ascending: false }).limit(300),
      supabase.from('message_reads').select('*').eq('family_id', familyId).eq('sitter_id', sitterId),
      supabase.from('shifts').select('*').eq('family_id', familyId).eq('sitter_id', sitterId).neq('status', 'cancelled').order('starts_at', { ascending: false }).limit(60),
    ]);
    return {
      messages: (must(messages) as Message[]).reverse(),
      reads: must(reads) as ReadMark[],
      shifts: must(shifts) as Shift[],
    };
  },
  async send(familyId: string, sitterId: string, authorId: string, body: string, photoPath: string | null = null) {
    return must(await supabase.from('messages').insert({ family_id: familyId, sitter_id: sitterId, author_id: authorId, body, photo_path: photoPath }).select().single()) as Message;
  },
  /** Uploads a picked photo to the thread's folder; returns its storage path. */
  async uploadPhoto(familyId: string, sitterId: string, uri: string) {
    const path = `${familyId}/${sitterId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const body = await (await fetch(uri)).arrayBuffer();
    const up = await supabase.storage.from('message-photos').upload(path, body, { contentType: 'image/jpeg' });
    if (up.error) throw up.error;
    return path;
  },
  async photoUrl(path: string) {
    const { data } = await supabase.storage.from('message-photos').createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  },
  async markRead(familyId: string, sitterId: string) {
    const { error } = await supabase.rpc('mark_thread_read', { p_family: familyId, p_sitter: sitterId });
    if (!error) changed();
  },
  /** Unread count per thread (key: threadKey). */
  async unread() {
    const { data, error } = await supabase.rpc('unread_messages');
    if (error) return {} as Record<string, number>;
    return Object.fromEntries(((data ?? []) as { family_id: string; sitter_id: string; unread: number }[]).map((r) => [threadKey(r.family_id, r.sitter_id), r.unread]));
  },
};

const channelName = (base: string) => `${base}-${Math.random().toString(36).slice(2, 10)}`;

/** One thread, kept live with Realtime. Marks it read while it's open. */
export function useThread(familyId: string | undefined, sitterId: string | undefined) {
  type State = Awaited<ReturnType<typeof messagesApi.thread>> & { key: string };
  const [data, setData] = useState<State | null>(null);
  const [error, setError] = useState('');
  const key = familyId && sitterId ? threadKey(familyId, sitterId) : '';
  const current = useRef(key);
  useEffect(() => {
    current.current = key;
  }, [key]);

  const load = useCallback(async () => {
    if (!familyId || !sitterId) return;
    const k = threadKey(familyId, sitterId);
    try {
      setError('');
      const t = await messagesApi.thread(familyId, sitterId);
      // switched to another thread while this one loaded: drop the stale answer
      if (current.current !== k) return;
      setData({ ...t, key: k });
      messagesApi.markRead(familyId, sitterId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [familyId, sitterId]);

  // Tabs stay mounted: only mark new messages read while this screen is the one on top.
  const focused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      load();
      return () => {
        focused.current = false;
      };
    }, [load]),
  );

  useEffect(() => {
    // load the thread, then listen for changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    if (!familyId || !sitterId) return;
    const mine = (r: { sitter_id?: string }) => r.sitter_id === sitterId;
    const ch = supabase
      .channel(channelName(`messages-${familyId}-${sitterId}`))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `family_id=eq.${familyId}` }, (p) => {
        const m = p.new as Message;
        if (!mine(m)) return;
        setData((d) => (d && !d.messages.some((x) => x.id === m.id) ? { ...d, messages: [...d.messages, m] } : d));
        if (focused.current && AppState.currentState === 'active') messagesApi.markRead(familyId, sitterId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reads', filter: `family_id=eq.${familyId}` }, (p) => {
        const r = p.new as ReadMark;
        if (!mine(r)) return;
        setData((d) => (d ? { ...d, reads: [...d.reads.filter((x) => x.user_id !== r.user_id), r] } : d));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shifts', filter: `family_id=eq.${familyId}` }, (p) => {
        const s = p.new as Shift;
        if (!mine(s)) return;
        setData((d) => (d ? { ...d, shifts: [s, ...d.shifts.filter((x) => x.id !== s.id)] } : d));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [familyId, sitterId, load]);

  /** Adds a message this phone just sent (Realtime may echo it; duplicates are skipped). */
  const add = useCallback((m: Message) => setData((d) => (d && !d.messages.some((x) => x.id === m.id) ? { ...d, messages: [...d.messages, m] } : d)), []);

  return { thread: data && data.key === key ? data : null, error, reload: load, add };
}

/** Unread counts per thread, for the Messages tab badge and the S37 chips. Updates live. */
export function useUnread(enabled = true) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const refresh = () => {
      messagesApi.unread().then((c) => alive && setCounts(c));
    };
    refresh();
    listeners.add(refresh);
    const ch = supabase
      .channel(channelName('messages-unread'))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, refresh)
      .subscribe();
    const app = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    return () => {
      alive = false;
      listeners.delete(refresh);
      supabase.removeChannel(ch);
      app.remove();
    };
  }, [enabled]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { counts, total };
}
