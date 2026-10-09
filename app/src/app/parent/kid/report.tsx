import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { PhotoThumb } from '@/components/LogTimeline';
import { LogEntries } from '@/components/logFeed';
import { Text } from '@/components/Text';
import { Button, Chip, ErrorText, Icon, Label, Loading, Screen } from '@/components/ui';
import { plannedEvery } from '@/lib/bottle';
import { repeatLabel } from '@/lib/care-plan';
import { api, useQuery } from '@/lib/data';
import { kidInsights } from '@/lib/kid-insights';
import { pronouns } from '@/lib/kid-profile';
import { amountLabel, bottleIn, bottleTimes, bottleTotal, dayBuckets, DEFAULT_RANGE, formatMinutes, groupByDay, isReportRange, kidPatterns, mainMilk, perDay, RANGE_WORD, REPORT_RANGES, rangeDayCount, rangeSince, shortMinutes, spanLabel, summaryLines, type KidPatterns, type ReportRange } from '@/lib/kid-report';
import { reportTitle, shiftLogRows } from '@/lib/shift-log-logic';
import type { LogEntry } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';

// Wireframe P5h "Ava’s report", opened from the kid profile's THIS WEEK card (P55): her logs in a range across all
// her shifts (Today · Week · Month · 3 / 6 months · 1 year, kept in the route as ?range=, Week by default).
// Doctor card → "Prepare a summary" (kid-insights Edge Function) and the summary takes its place (P5j), with Copy and
// Share. PATTERNS tiles and per-day bars come from lib/kid-report; PHOTOS 3 across (9, then "Show all N"); HISTORY one
// card per day with that day's "Shift report ›". Nothing here edits, so read-only members see the same page.
export default function KidReport() {
  const params = useLocalSearchParams<{ kidId: string; range?: string }>();
  const kidId = params.kidId;
  const range: ReportRange = isReportRange(params.range) ? params.range : DEFAULT_RANGE;
  const { data, error } = useQuery(async () => {
    const now = new Date();
    const since = rangeSince(range, now);
    const kid = await api.kid(kidId);
    // Her care plan for P5m's "Plan: every 3 hrs" (an empty plan when it can't be read).
    const [kids, logs, care] = await Promise.all([api.kids(kid.family_id), api.kidLogsSince(kidId, since.toISOString()), api.kidCareItems(kidId).catch(() => [])]);
    return { kid, kids, logs, care, since, now, range };
  }, [kidId, range]);
  // The summary belongs to the range it was made for; another chip shows the doctor card again.
  const [summary, setSummary] = useState<{ range: ReportRange; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [aiErr, setAiErr] = useState('');
  const [copied, setCopied] = useState(false);
  const [allPhotos, setAllPhotos] = useState(false);

  if (!data) return error ? <Screen title="" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const { kid, kids, logs, care, since, now } = data;
  const fresh = data.range === range;
  const p = kidPatterns(logs);
  const bottleUnit = bottleTotal(p.feeding)?.unit;
  const photos = logs.filter((l) => l.kind === 'photo' && l.photo_path);
  const shiftCount = new Set(logs.map((l) => l.shift_id)).size;
  const shown = summary && summary.range === range ? summary.text : null;

  const pick = (r: ReportRange) => {
    setAiErr('');
    setCopied(false);
    setAllPhotos(false);
    // setParams keeps the choice in the route, so back / forward land on the same range.
    router.setParams({ range: r });
  };

  async function prepare() {
    setBusy(true);
    setAiErr('');
    try {
      const text = await kidInsights(kidId, since.toISOString(), now.toISOString());
      setSummary({ range, text });
      setCopied(false);
    } catch (e) {
      setAiErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const caps = `${kid.name} · ${spanLabel(since, now)} · from ${shiftCount} sitter shift${shiftCount === 1 ? '' : 's'}`.toUpperCase();
  const shareText = shown ? `${kid.name} · ${spanLabel(since, now)}\n\n${shown}\n\nWritten by AI from sitter logs. Not medical advice: share it with your pediatrician.` : '';

  return (
    <Screen title={reportTitle(kid.name)} back gap={12}>
      <ErrorText>{error}</ErrorText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.chips} contentContainerStyle={st.chipRow}>
        {REPORT_RANGES.map((r) => (
          <Chip key={r.value} label={r.label} on={r.value === range} onPress={() => pick(r.value)} />
        ))}
      </ScrollView>

      {!fresh ? (
        <Loading />
      ) : !logs.length ? (
        <Text style={st.empty}>Nothing logged for {kid.name} in this time.</Text>
      ) : (
        <>
          {shown ? (
            <>
              <Label>Doctor visit summary</Label>
              <View style={st.card}>
                <Text style={st.caps}>{caps}</Text>
                <View style={{ gap: 6 }}>
                  {summaryLines(shown).map((l, i) =>
                    l.type === 'h' ? (
                      <Text key={i} style={[st.sumHead, i > 0 && { marginTop: 6 }]}>{l.text}</Text>
                    ) : l.type === 'li' ? (
                      <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
                        <Text style={st.sumText}>•</Text>
                        <Text style={[st.sumText, { flexShrink: 1 }]}>{l.text}</Text>
                      </View>
                    ) : (
                      <Text key={i} style={st.sumText}>{l.text}</Text>
                    ),
                  )}
                </View>
              </View>
              <Text style={st.aiNote}>Written by AI from sitter logs. Not medical advice: share it with your pediatrician.</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button
                  kind="tonal"
                  icon="copy"
                  label={copied ? 'Copied' : 'Copy'}
                  style={{ flex: 1 }}
                  onPress={async () => {
                    await Clipboard.setStringAsync(shareText);
                    setCopied(true);
                  }}
                />
                <Button icon="share" label="Share" style={{ flex: 1 }} onPress={() => Share.share({ message: shareText })} />
              </View>
            </>
          ) : (
            <View style={st.doctor}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={st.doctorIcon}>
                  <Icon name="clipboard" size={22} tint={color.primary} />
                </View>
                <View style={{ flexShrink: 1, gap: 2 }}>
                  <Text style={st.doctorTitle}>Getting ready for a doctor visit?</Text>
                  <Text style={st.doctorSub}>
                    A summary of {kid.name}’s {RANGE_WORD[range]} from {pronouns(kid.gender).poss} sitter logs, with questions to ask.
                  </Text>
                </View>
              </View>
              <ErrorText>{aiErr}</ErrorText>
              <Button label={busy ? 'Preparing…' : 'Prepare a summary'} busy={busy} onPress={prepare} />
            </View>
          )}

          <Label>Patterns</Label>
          <Patterns p={p} perDayOn={range !== 'today'} times={bottleTimes(logs)} every={plannedEvery(care, kidId)} now={now} />
          {range !== 'today' && p.feeding.total ? <Bars title="Meals and snacks" logs={logs} kinds={['food']} since={since} now={now} /> : null}
          {range !== 'today' && bottleUnit ? <Bars title="Bottles" unit={bottleUnit} logs={logs} kinds={['food']} since={since} now={now} value={(l) => bottleIn(l, bottleUnit)} /> : null}
          {range !== 'today' && p.diapers.total ? <Bars title="Diapers" logs={logs} kinds={['diaper']} since={since} now={now} /> : null}

          {photos.length ? (
            <>
              <Label
                right={
                  photos.length > 9 ? (
                    <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setAllPhotos((v) => !v)}>
                      <Text style={st.link}>{allPhotos ? 'Show less' : `Show all ${photos.length}`}</Text>
                    </Pressable>
                  ) : undefined
                }>
                Photos
              </Label>
              <View style={{ gap: 8 }}>
                {chunk(allPhotos ? photos : photos.slice(0, 9), 3).map((row, r) => (
                  <View key={r} style={{ flexDirection: 'row', gap: 8 }}>
                    {[0, 1, 2].map((c) => (row[c] ? <PhotoThumb key={row[c].id} path={row[c].photo_path!} height={104} style={st.thumb} /> : <View key={c} style={st.thumb} />))}
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <Label>History</Label>
          <History logs={logs} kids={kids} kidId={kidId} now={now} />
        </>
      )}
    </Screen>
  );
}

function chunk<T>(xs: T[], n: number): T[][] {
  return Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i * n, i * n + n));
}

type TileProps = { value: string; label: string; sub?: string; detail?: string; bad?: boolean };
function Tile({ value, label, sub, detail, bad }: TileProps) {
  return (
    <View style={[st.tile, bad && { backgroundColor: color.badTint, shadowOpacity: 0, elevation: 0 }]}>
      <Text style={[st.tileNum, bad && { color: color.badInk }]}>{value}</Text>
      <Text style={[st.tileLabel, bad && { color: color.badInk }]}>{label}</Text>
      {sub ? <Text style={st.tileSub}>{sub}</Text> : null}
      {detail ? <Text style={st.tileSub}>{detail}</Text> : null}
    </View>
  );
}

/** P5m bottle tiles. With amounts: "26 oz" / "Bottles a day" / "7 bottles · formula" / "Drank all at 6 of 7"; without
 * (older logs with no amount): the count. */
function bottleTile(f: KidPatterns['feeding'], perDayOn: boolean, days: number): TileProps {
  const total = bottleTotal(f);
  const count = `${f.bottles} bottle${f.bottles === 1 ? '' : 's'}`;
  const answered = f.drank.none + f.drank.some + f.drank.most + f.drank.all;
  const detail = answered ? `Drank all at ${f.drank.all} of ${answered}` : undefined;
  const milk = mainMilk(f.milk);
  if (!total) return { value: String(f.bottles), label: f.bottles === 1 ? 'Bottle' : 'Bottles', sub: perDayOn && days ? `${perDay(f.bottles, days)} a day` : milk || undefined, detail };
  const daily = perDayOn && days;
  return { value: amountLabel(daily ? total.amount / days : total.amount, total.unit), label: daily ? 'Bottles a day' : 'Bottles in all', sub: [count, milk].filter(Boolean).join(' · '), detail };
}

/** "Last at 3:05 PM" (today), "Last Wed at 3:05 PM". */
function lastAt(iso: string, now: Date): string {
  const d = new Date(iso);
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return d.toDateString() === now.toDateString() ? `Last at ${time}` : `Last ${d.toLocaleDateString('en-US', { weekday: 'short' })} at ${time}`;
}

type BottleTimes = ReturnType<typeof bottleTimes>;

/** PATTERNS: 2 tiles a row, only the ones with data (incidents always, red when any). */
function Patterns({ p, perDayOn, times, every, now }: { p: KidPatterns; perDayOn: boolean; times: BottleTimes; every: number | null; now: Date }) {
  const day = (n: number) => (perDayOn && p.days ? `${perDay(n, p.days)} a day` : undefined);
  const { feeding: f, sleep: s, diapers: d } = p;
  const eaten = f.meals + f.snacks;
  const plan = every ? `Plan: ${repeatLabel(every).toLowerCase()}` : undefined;
  const tiles: TileProps[] = [
    ...(eaten ? [{ value: String(eaten), label: 'Meals and snacks', sub: day(eaten), detail: `${f.meals} meal${f.meals === 1 ? '' : 's'} · ${f.snacks} snack${f.snacks === 1 ? '' : 's'}` }] : []),
    ...(f.bottles ? [bottleTile(f, perDayOn, p.days)] : []),
    // "3 h 10 m / Between bottles / Last at 3:05 PM / Plan: every 3 hrs" (gaps on the same day only).
    ...(times.avgMin != null ? [{ value: shortMinutes(times.avgMin), label: 'Between bottles', sub: times.last ? lastAt(times.last, now) : undefined, detail: plan }] : []),
    ...(s.naps
      ? [{ value: String(s.naps), label: s.naps === 1 ? 'Nap' : 'Naps', sub: s.timed ? `${formatMinutes(s.totalMin / s.timed)} on average` : day(s.naps), detail: s.timed ? `${formatMinutes(s.totalMin)} asleep in all` : undefined }]
      : []),
    ...(d.total ? [{ value: String(d.total), label: 'Diapers', sub: day(d.total), detail: [d.wet && `${d.wet} wet`, d.dirty && `${d.dirty} dirty`, d.both && `${d.both} both`].filter(Boolean).join(' · ') || undefined }] : []),
    ...(d.potty ? [{ value: String(d.potty), label: d.potty === 1 ? 'Potty try' : 'Potty tries', sub: day(d.potty), detail: `${d.pottySuccess} success${d.pottySuccess === 1 ? '' : 'es'}` }] : []),
    ...(p.activities ? [{ value: String(p.activities), label: p.activities === 1 ? 'Activity' : 'Activities', sub: day(p.activities) }] : []),
    { value: String(p.incidents), label: p.incidents === 1 ? 'Incident' : 'Incidents', sub: p.incidents ? 'See the history below' : 'None logged', bad: p.incidents > 0 },
  ];
  return (
    <View style={{ gap: 8 }}>
      {chunk(tiles, 2).map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
          {row.map((t) => (
            <Tile key={t.label} {...t} />
          ))}
          {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
        </View>
      ))}
      {perDayOn && p.days ? <Text style={st.footnote}>A day means a day with a sitter log ({p.days} day{p.days === 1 ? '' : 's'}).</Text> : null}
    </View>
  );
}

/** "Meals and snacks by day" (P5h): plain bars, a day each, or a week each past 45 days. With a unit and `value`
 * the bars add up amounts: "Bottles by day (oz)" (P5m). */
function Bars({ title, unit, logs, kinds, since, now, value }: { title: string; unit?: string; logs: LogEntry[]; kinds: LogEntry['kind'][]; since: Date; now: Date; value?: (l: LogEntry) => number }) {
  const buckets = dayBuckets(logs, kinds, since, now, value).map((b) => ({ ...b, count: Math.round(b.count) }));
  const weekly = rangeDayCount(since, now) > 45;
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const md = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return (
    <View style={st.card}>
      <Text style={st.cardTitle}>
        {title} by {weekly ? 'week' : 'day'}
        {unit ? ` (${unit})` : ''}
      </Text>
      <View style={st.bars}>
        {buckets.map((b, i) => (
          <View key={i} style={st.barCol}>
            {buckets.length <= 7 && b.count ? <Text style={st.barNum}>{b.count}</Text> : null}
            <View style={[st.bar, { height: Math.max(3, (b.count / max) * 64), backgroundColor: b.count ? color.primary : color.line }]} />
          </View>
        ))}
      </View>
      {buckets.length <= 7 ? (
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {buckets.map((b, i) => (
            <Text key={i} style={[st.barDay, { flex: 1 }]}>
              {b.start.toLocaleDateString('en-US', { weekday: 'narrow' })}
            </Text>
          ))}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={st.barDay}>{md(buckets[0].start)}</Text>
          <Text style={st.barDay}>{md(now)}</Text>
        </View>
      )}
    </View>
  );
}

/** HISTORY: a white card per day, newest first, with "Shift report ›" for that day's shift (one per shift on days
 * with more than one, labelled by start time). */
function History({ logs, kids, kidId, now }: { logs: LogEntry[]; kids: { id: string; name: string }[]; kidId: string; now: Date }) {
  const shiftOf = new Map(logs.map((l) => [l.id, l.shift_id]));
  const firstAt = new Map<string, string>();
  for (const l of logs) if (!firstAt.has(l.shift_id) || l.happened_at < firstAt.get(l.shift_id)!) firstAt.set(l.shift_id, l.happened_at);
  const days = groupByDay(shiftLogRows(logs, [], kids, 'all', kidId), now);
  return (
    <View style={{ gap: 12 }}>
      {days.map((g) => {
        const shifts = [...new Set(g.rows.map((r) => (r.logId ? shiftOf.get(r.logId) : undefined)).filter((x): x is string => !!x))];
        return (
          <View key={g.key} style={st.card}>
            <View style={st.cardHead}>
              <Text style={st.cardTitle}>{g.label}</Text>
              <View style={{ flexDirection: 'row', gap: 12, flexShrink: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {shifts.map((id) => (
                  <Pressable key={id} accessibilityRole="link" hitSlop={8} onPress={() => router.push(`/parent/shift/${id}?kidId=${kidId}`)}>
                    <Text style={st.link}>
                      {shifts.length > 1 ? `${new Date(firstAt.get(id)!).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} report ›` : 'Shift report ›'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <LogEntries rows={g.rows} filter="all" live={false} />
          </View>
        );
      })}
    </View>
  );
}

// P5h / P5j values
const st = StyleSheet.create({
  // Range chips edge to edge so the row scrolls past the gutter (as P5's kid chips).
  chips: { marginHorizontal: -20, flexGrow: 0 },
  chipRow: { gap: 8, paddingHorizontal: 20 },
  empty: { fontFamily: font.body, fontSize: 14, color: color.ink2, paddingVertical: 12 },
  doctor: { gap: 12, padding: 16, backgroundColor: color.primaryTint, borderRadius: 24 },
  doctorIcon: { width: 44, height: 44, flexShrink: 0, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  doctorTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.primaryStrong },
  doctorSub: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  card: { gap: 10, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  cardTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  caps: { fontFamily: font.bodyBold, fontSize: 12, letterSpacing: 0.6, color: color.ink2 },
  sumHead: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  sumText: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  aiNote: { fontFamily: font.body, fontSize: 12, lineHeight: 17, color: color.ink2, textAlign: 'center', paddingHorizontal: 12 },
  tile: { flex: 1, minWidth: 0, gap: 2, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 18, ...cardShadow },
  tileNum: { fontFamily: font.display, fontSize: 26, color: color.ink, marginVertical: -4 },
  tileLabel: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  tileSub: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  footnote: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 82 },
  barCol: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  bar: { alignSelf: 'stretch', borderRadius: 4 },
  barNum: { fontFamily: font.bodyBold, fontSize: 11, color: color.ink2 },
  barDay: { fontFamily: font.body, fontSize: 11, color: color.ink2, textAlign: 'center' },
  thumb: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, height: 104, borderRadius: 12 },
  link: { fontFamily: font.bodySemi, fontSize: 14, color: color.primary },
});
