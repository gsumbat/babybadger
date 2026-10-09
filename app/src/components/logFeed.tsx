import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { LOG_ICON, PhotoThumb } from '@/components/LogTimeline';
import { Text } from '@/components/Text';
import { Icon } from '@/components/ui';
import { isRideTask, LOG_FILTERS, type LogFilter, type LogRow, type LogReaction, shiftLogApi, shortClock } from '@/lib/shift-log';
import { cardShadow, color, font, CHIP_HEIGHT } from '@/theme';

// The P77 log, shared by the log page (P77) and the shift report's Logs card (P5): the type chips
// (All / Food / Sleep / Activities / Photos), the timeline card and "Love it" on photos.
const TICK = (stroke: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
const HEART_PATH = 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z';
const HEART = (filled: boolean) => `<svg viewBox="0 0 24 24" fill="${filled ? '#8A5A7A' : 'none'}" stroke="#8A5A7A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${HEART_PATH}"/></svg>`;
const LOVE_INK = '#8A5A7A';

/** The type chips, edge to edge so the row scrolls past the gutter (pass `inset` inside a padded card). */
export function LogTypeChips({ filter, onChange, inset = 20 }: { filter: LogFilter; onChange: (f: LogFilter) => void; inset?: number }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -inset, flexGrow: 0 }} contentContainerStyle={[st.chips, { paddingHorizontal: inset }]}>
      {LOG_FILTERS.filter((f) => f.value !== 'photos').map((f) => {
        const on = filter === f.value;
        return (
          <Pressable key={f.value} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onChange(f.value)} style={[st.chip, on && st.chipOn]}>
            {on ? <SvgXml xml={TICK(color.primaryStrong)} width={16} height={16} style={{ flexShrink: 0 }} /> : null}
            <Text style={[st.chipText, on && { color: color.primaryStrong }]}>{f.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** The Photos card under the log (P5 / P77): photos aren't in the timeline or the chips any more; a 3-column grid,
 * newest first, each with its "Love it" heart (migration 26) when onLove is given. Nothing when there are no photos. */
export function PhotoCard({ photos, loved, onLove }: { photos: { id: string; photo_path: string | null; happened_at: string }[]; loved?: Set<string>; onLove?: (logId: string) => void }) {
  const list = photos.filter((p) => p.photo_path).sort((a, b) => b.happened_at.localeCompare(a.happened_at));
  if (!list.length) return null;
  return (
    <View style={st.photoCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={st.photoTitle}>Photos</Text>
        <Text style={st.photoCount}>{list.length}</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {list.map((p) => {
          const on = !!loved?.has(p.id);
          return (
            <View key={p.id} style={st.photoCell}>
              <PhotoThumb path={p.photo_path!} height={104} />
              <Text style={st.photoTime}>{shortClock(p.happened_at)}</Text>
              {onLove ? (
                <Pressable accessibilityRole="button" accessibilityLabel={on ? 'Loved' : 'Love it'} accessibilityState={{ selected: on }} onPress={() => onLove(p.id)} hitSlop={6} style={st.photoHeart}>
                  <SvgXml xml={HEART(on)} width={16} height={16} />
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** The timeline rows (no card around them), or the empty line for the filter. Without `onLove` (Ava’s report, P5h)
 * photos show no "Love it". */
export function LogEntries({ rows, filter, loved, onLove, live = true }: { rows: LogRow[]; filter: LogFilter; loved?: Set<string>; onLove?: (logId: string) => void; live?: boolean }) {
  if (!rows.length) return <Text style={st.empty}>{filter === 'all' ? (live ? 'Nothing logged yet.' : 'Nothing logged.') : `No ${LOG_FILTERS.find((f) => f.value === filter)!.label.toLowerCase()} logged.`}</Text>;
  return (
    <View>
      {rows.map((r, i) => (
        <Entry key={r.key} row={r} last={i === rows.length - 1} loved={!!r.logId && !!loved?.has(r.logId)} onLove={onLove && r.kind === 'photo' && r.logId ? () => onLove(r.logId!) : undefined} />
      ))}
    </View>
  );
}

/** "Love it" on a photo entry (migration 26): optimistic, rolled back with an alert if the save fails. */
export function useLogLove(shiftId: string, uid: string, reactions: LogReaction[], setReactions: (f: (rs: LogReaction[]) => LogReaction[]) => void) {
  const mine = new Set(reactions.filter((r) => r.parent_id === uid && r.kind === 'love').map((r) => r.log_id));
  async function toggle(logId: string) {
    const isLoved = mine.has(logId);
    const row: LogReaction = { log_id: logId, parent_id: uid, kind: 'love', shift_id: shiftId, created_at: new Date().toISOString() };
    setReactions((rs) => (isLoved ? rs.filter((r) => !(r.log_id === logId && r.parent_id === uid)) : [...rs, row]));
    try {
      if (isLoved) await shiftLogApi.unlove(logId, uid);
      else await shiftLogApi.love(logId, uid);
    } catch (e) {
      setReactions((rs) => (isLoved ? [...rs, row] : rs.filter((r) => !(r.log_id === logId && r.parent_id === uid))));
      const text = e instanceof Error ? e.message : String(e);
      if (Platform.OS === 'web') globalThis.alert?.(`Couldn’t save\n${text}`);
      else Alert.alert('Couldn’t save', text);
    }
  }
  return { mine, toggle };
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
  chips: { flexDirection: 'row', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: CHIP_HEIGHT, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line },
  chipOn: { backgroundColor: color.primaryTint, borderWidth: 1.5, borderColor: color.primary },
  chipText: { fontFamily: font.bodySemi, fontSize: 13, color: color.ink },
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
  photoCard: { gap: 10, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  photoTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  photoCount: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2 },
  // Three across: (card width - 2 gaps) / 3.
  photoCell: { width: '31.6%', gap: 4 },
  photoTime: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  photoHeart: { position: 'absolute', right: 6, top: 6, width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  empty: { fontFamily: font.body, fontSize: 14, color: color.ink2, paddingBottom: 12 },
});
