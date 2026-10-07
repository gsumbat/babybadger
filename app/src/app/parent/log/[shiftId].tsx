import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { LOG_ICON, PhotoThumb } from '@/components/LogTimeline';
import { Text } from '@/components/Text';
import { Button, ErrorText, Icon, Loading, Screen } from '@/components/ui';
import { useQuery, useShiftLive } from '@/lib/data';
import { firstName, timeOf } from '@/lib/format';
import { rulesApi, shiftRuleRows } from '@/lib/house-rules';
import { useSession } from '@/lib/session';
import { isRideTask, LOG_FILTERS, type LogFilter, type LogRow, nextPhotoDue, photoAskWaiting, rulesStrip, shiftLogApi, shiftLogRows, shortClock, useShiftReactions } from '@/lib/shift-log';
import { cardShadow, color, font } from '@/theme';

// P77 icons from the wireframe: the chip tick, the strip tick, the bell (P77b, S4's strip) and the "Love it" heart.
const TICK = (stroke: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
const BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="#7A4E0E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>';
const HEART_PATH = 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z';
const HEART = (filled: boolean) => `<svg viewBox="0 0 24 24" fill="${filled ? '#8A5A7A' : 'none'}" stroke="#8A5A7A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${HEART_PATH}"/></svg>`;
const LOVE_INK = '#8A5A7A';

// Wireframe P77 Shift log, from app/src/wireframes/P77.tsx. Opened from "Today's log" on the live view (P4) and from
// the report's Logs card (P5 "See all"). Filter chips All / Food / Sleep / Activities / Photos; the house-rules strip
// (lib/shift-log-logic rulesStrip: green on track, amber P77b when logs are due; hidden with no log rules); the
// timeline newest first, a nap with start and end as two rows, done tasks under All ("Picked up Ava"); "Love it" on
// photo entries (migration 26, the sitter gets a push). Footer: Message Maya (P10 on her thread), Ask for a photo
// (ask_for_photo, once per 10 minutes; "Photo asked" while it waits, P77c). Live while the shift is on: logs and tasks
// through useShiftLive, hearts and requests through useShiftReactions (each its own channel).
// Left out until built: the place under a pick-up ("Lincoln Elementary": tasks store no place), opening a photo.
// Not drawn: an empty filter ("No photos yet."), the ended shift (P77d: "Shift log", no Ask for a photo).
export default function ShiftLog() {
  const { shiftId } = useLocalSearchParams<{ shiftId: string }>();
  const { session } = useSession();
  const uid = session!.user.id;
  const { bundle, error } = useShiftLive(shiftId);
  const fid = bundle?.shift.family_id;
  // House rules (migration 09); before it runs there are none and the strip stays hidden.
  const { data: rules } = useQuery(() => (fid ? rulesApi.rules(fid).catch(() => []) : Promise.resolve([])), [fid]);
  const { reactions, requests, setReactions, setRequests } = useShiftReactions(shiftId);
  const [filter, setFilter] = useState<LogFilter>('all');
  const [asking, setAsking] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!bundle) return error ? <Screen back title="Today’s log"><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const { shift, logs, tasks, kids, sitter } = bundle;
  const name = firstName(sitter?.full_name);
  const live = shift.status === 'active';
  const at = live ? new Date(now) : new Date(shift.clock_out_at ?? shift.ends_at);
  const rows = shiftLogRows(logs, tasks, kids, filter);
  const strip = rulesStrip(shiftRuleRows(rules ?? [], logs, kids, shift.clock_in_at, at), live ? nextPhotoDue(rules ?? [], logs, shift.clock_in_at) : null);
  const mine = new Set(reactions.filter((r) => r.parent_id === uid && r.kind === 'love').map((r) => r.log_id));
  const waiting = photoAskWaiting(requests, logs, new Date(now));
  const subtitle = live
    ? `${name} · on shift since ${timeOf(shift.clock_in_at ?? shift.starts_at)}`
    : `${name} · ${new Date(shift.starts_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${shortClock(shift.clock_in_at ?? shift.starts_at)} – ${timeOf(shift.clock_out_at ?? shift.ends_at)}`;

  function say(title: string, text: string) {
    if (Platform.OS === 'web') globalThis.alert?.(`${title}\n${text}`);
    else Alert.alert(title, text);
  }

  async function toggleLove(logId: string) {
    const loved = mine.has(logId);
    // Optimistic: the heart flips at once; the realtime echo is ignored as a duplicate.
    setReactions((rs) => (loved ? rs.filter((r) => !(r.log_id === logId && r.parent_id === uid)) : [...rs, { log_id: logId, parent_id: uid, kind: 'love', shift_id: shift.id, created_at: new Date().toISOString() }]));
    try {
      if (loved) await shiftLogApi.unlove(logId, uid);
      else await shiftLogApi.love(logId, uid);
    } catch (e) {
      setReactions((rs) => (loved ? [...rs, { log_id: logId, parent_id: uid, kind: 'love', shift_id: shift.id, created_at: new Date().toISOString() }] : rs.filter((r) => !(r.log_id === logId && r.parent_id === uid))));
      say('Couldn’t save', e instanceof Error ? e.message : String(e));
    }
  }

  async function ask() {
    setAsking(true);
    try {
      const r = await shiftLogApi.askForPhoto(shift.id);
      setRequests((qs) => (qs.some((q) => q.id === r.id) ? qs : [r, ...qs]));
    } catch (e) {
      say('Couldn’t ask', e instanceof Error ? e.message : String(e));
    } finally {
      setAsking(false);
    }
  }

  const message = (
    <Button label={`Message ${name}`} kind="tonal" onPress={() => router.push({ pathname: '/parent/messages', params: { sitter: shift.sitter_id } })} style={st.half} />
  );
  return (
    <Screen
      back
      title={live ? 'Today’s log' : 'Shift log'}
      subtitle={subtitle}
      gap={10}
      footer={
        <View style={st.footer}>
          {message}
          {live ? <Button label={waiting ? 'Photo asked' : 'Ask for a photo'} kind="tonal" onPress={ask} busy={asking} disabled={waiting} style={st.half} /> : null}
        </View>
      }>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginTop: -2, flexGrow: 0 }} contentContainerStyle={st.chips}>
        {LOG_FILTERS.map((f) => {
          const on = filter === f.value;
          return (
            <Pressable key={f.value} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setFilter(f.value)} style={[st.chip, on && st.chipOn]}>
              {on ? <SvgXml xml={TICK(color.primaryStrong)} width={16} height={16} style={{ flexShrink: 0 }} /> : null}
              <Text style={[st.chipText, on && { color: color.primaryStrong }]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {strip ? (
        <Pressable accessibilityRole="link" onPress={() => router.push('/parent/rules')} style={[st.strip, !strip.ok && { backgroundColor: color.warnTint }]}>
          <SvgXml xml={strip.ok ? TICK(color.okInk) : BELL} width={18} height={18} style={{ flexShrink: 0 }} />
          <Text style={st.stripText}>
            <Text style={[st.stripBold, !strip.ok && { color: color.warnInk }]}>{strip.lead}</Text>
            {strip.text ? ` ${strip.text}` : ''}
          </Text>
        </Pressable>
      ) : null}

      <View style={st.card}>
        {rows.length ? (
          rows.map((r, i) => <Entry key={r.key} row={r} last={i === rows.length - 1} loved={!!r.logId && mine.has(r.logId)} onLove={r.kind === 'photo' && r.logId ? () => toggleLove(r.logId!) : undefined} />)
        ) : (
          <Text style={st.empty}>{filter === 'all' ? 'Nothing logged yet.' : `No ${LOG_FILTERS.find((f) => f.value === filter)!.label.toLowerCase()} logged yet.`}</Text>
        )}
      </View>
    </Screen>
  );
}

/** One P77 timeline row: 36 px icon on the connecting line, title + kid tag + time, detail, photo + Love it. */
function Entry({ row, last, loved, onLove }: { row: LogRow; last: boolean; loved: boolean; onLove?: () => void }) {
  const ic = row.kind === 'task' ? { icon: isRideTask(row.title) ? ('truck' as const) : ('check' as const), bg: color.primaryTint, fg: color.primary } : (LOG_ICON[row.kind] ?? LOG_ICON.note);
  return (
    <View style={st.row}>
      {!last ? <View style={st.line} /> : null}
      <View style={[st.icon, { backgroundColor: ic.bg }]}>
        <Icon name={ic.icon} size={18} tint={ic.fg} />
      </View>
      <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[st.title, row.urgent && { color: color.badInk }]}>{row.title}</Text>
          {row.kid ? (
            <View style={st.kid}>
              <Text style={st.kidText}>{row.kid}</Text>
            </View>
          ) : null}
          <Text style={st.time}>{shortClock(row.at)}</Text>
        </View>
        {row.detail ? <Text style={st.detail}>{row.detail}</Text> : null}
        {row.photoPath || onLove ? (
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
            {row.photoPath ? <PhotoThumb path={row.photoPath} height={64} style={{ width: 92 }} /> : null}
            {onLove ? (
              <Pressable accessibilityRole="button" accessibilityState={{ selected: loved }} onPress={onLove} hitSlop={6} style={st.love}>
                <SvgXml xml={HEART(loved)} width={14} height={14} style={{ flexShrink: 0 }} />
                <Text style={st.loveText}>{loved ? 'Loved' : 'Love it'}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

// Values from wireframe P77.
const st = StyleSheet.create({
  chips: { flexDirection: 'row', gap: 6, paddingHorizontal: 20 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line },
  chipOn: { backgroundColor: color.primaryTint, borderWidth: 1.5, borderColor: color.primary },
  chipText: { fontFamily: font.bodySemi, fontSize: 13, color: color.ink },
  strip: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: color.okTint, borderRadius: 14 },
  stripText: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink, flexShrink: 1 },
  stripBold: { fontFamily: font.bodyBold, color: color.okInk },
  card: { paddingTop: 14, paddingHorizontal: 14, paddingBottom: 2, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', gap: 12, paddingBottom: 12 },
  line: { position: 'absolute', left: 17, top: 38, bottom: -6, width: 2, backgroundColor: color.line },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { fontFamily: font.bodyBold, fontSize: 14, color: color.ink, flexShrink: 1 },
  kid: { paddingVertical: 2, paddingHorizontal: 7, backgroundColor: color.muted, borderRadius: 999, flexShrink: 1 },
  kidText: { fontFamily: font.bodyBold, fontSize: 11, color: color.ink2 },
  time: { fontFamily: font.body, fontSize: 12, color: color.ink2, marginLeft: 'auto', flexShrink: 0 },
  detail: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  love: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 30, alignSelf: 'flex-end', paddingHorizontal: 10, borderRadius: 999, backgroundColor: color.accentTint },
  loveText: { fontFamily: font.bodyBold, fontSize: 12, color: LOVE_INK },
  empty: { fontFamily: font.body, fontSize: 14, color: color.ink2, paddingBottom: 12 },
  // P77 footer: 4 above, 26 below (the shared footer has 8 / 32).
  footer: { flexDirection: 'row', gap: 10, marginTop: -4, marginBottom: -6 },
  half: { flexGrow: 1, flexBasis: 0 },
});
