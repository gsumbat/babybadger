import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { shortName } from '@/components/addChild';
import { MARKETPLACE } from '@/lib/features';
import { findComingSoon, openPoolWeek, PickTimeSheet } from '@/components/pool';
import { Text } from '@/components/Text';
import { ErrorText, Icon, Screen } from '@/components/ui';
import { namesLabel } from '@/lib/availability';
import { dayKey } from '@/lib/calendar-logic';
import { credentialState, sitterBundle } from '@/lib/credentials';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { poolData, poolRow, slotOf, statusFor, timeText, tonightWindow, windowLabel, type PoolGroup, type TimeWindow } from '@/lib/pool';
import { askLabel } from '@/lib/pool-requests';
import { requirementStatus } from '@/lib/requirements';
import { useSession } from '@/lib/session';
import { cardShadow, color, font, SECTION_GAP, CHIP_HEIGHT } from '@/theme';

// Wireframe P42 Sitter pool, from app/src/wireframes/P42.tsx. Opened from the Sitters tab (P54) for a time window
// (?start=ISO&end=ISO; tonight when missing). The family's active sitters, grouped by lib/pool-logic: FREE THE WHOLE
// TIME (her S11 hours cover it, no day off, not booked with this family then), PARTLY FREE ("Free until 9:00 PM"), NOT
// FREE (dimmed: Booked / Away until … / not free that evening / no hours set). Rows open P11. Change opens the
// "Pick a time" sheet (canvas P54d / P54f / P54g). Week opens P43 Who's free for the window's week, day and part of the
// day. Filter chips show only when the pool has 2+ sitters and the filter can match:
// Meets requirements (family has requirements; lib/requirements), Drives (an unexpired driver's license she shared with the family),
// one chip per other language a sitter speaks (sitter_languages; P42 draws Spanish). None are on at first.
// Left out until built: Find new (P48, "Coming soon"). The main button asks the free sitters at once (P45): "Ask Maya"
// with one free sitter, "Ask both free sitters" with two, "Ask 3 free sitters" with more (only those the filters
// show). With nobody free it stays "Book a shift" (booking by hand, sitter, day and times filled in); one sitter can
// also be booked directly from her profile (P11 "Book a shift").
export default function Pool() {
  const params = useLocalSearchParams<{ start?: string; end?: string }>();
  const { family } = useSession();
  const fid = family!.id;
  const win: TimeWindow = useMemo(() => {
    const start = params.start ? new Date(params.start) : null;
    const end = params.end ? new Date(params.end) : null;
    return start && end && !isNaN(+start) && !isNaN(+end) && +end > +start ? { start, end } : tonightWindow();
  }, [params.start, params.end]);

  const { data, error } = useQuery(async () => {
    const [pool, kids] = await Promise.all([poolData(fid), api.kids(fid)]);
    const active = pool.sitters.filter((s) => s.status === 'active');
    const [reqs, bundles] = await Promise.all([Promise.all(active.map((s) => requirementStatus(fid, s.sitter_id))), Promise.all(active.map((s) => sitterBundle(s.sitter_id)))]);
    return { ...pool, kids, active, reqs, bundles };
  }, [fid]);

  const [filters, setFilters] = useState<string[]>([]);
  const [picking, setPicking] = useState(false);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.active.map((s, i) => {
      const status = statusFor(data, s.sitter_id, win);
      const done = data.shifts.filter((x) => x.sitter_id === s.sitter_id && x.status === 'completed').length;
      const bundle = data.bundles[i];
      return {
        id: s.sitter_id,
        name: s.profile?.full_name || 'Sitter',
        color: AVATAR[data.sitters.indexOf(s) % AVATAR.length],
        row: poolRow(status, win, done),
        meets: data.reqs[i].allMet,
        drives: bundle.creds.some((c) => c.kind === 'drivers_license' && credentialState(c) !== 'expired'),
        langs: bundle.langs.map((l) => l.language),
      };
    });
  }, [data, win]);

  // Filters that can match something in this pool.
  const chips = useMemo(() => {
    if (rows.length < 2) return [];
    const out: { key: string; label: string }[] = [];
    if (data?.reqs.some((r) => r.total > 0)) out.push({ key: 'meets', label: 'Meets requirements' });
    if (rows.some((r) => r.drives)) out.push({ key: 'drives', label: 'Drives' });
    const langs = [...new Set(rows.flatMap((r) => r.langs))].filter((l) => l !== 'English').sort((a, b) => (a === 'Spanish' ? -1 : b === 'Spanish' ? 1 : a.localeCompare(b)));
    for (const l of langs.slice(0, 2)) out.push({ key: `lang:${l}`, label: l });
    return out;
  }, [rows, data]);
  const on = filters.filter((f) => chips.some((c) => c.key === f));
  const shown = rows.filter((r) => on.every((f) => (f === 'meets' ? r.meets : f === 'drives' ? r.drives : r.langs.includes(f.slice(5)))));
  const group = (g: PoolGroup) => shown.filter((r) => r.row.group === g);
  const free = group('free');

  const kidNames = namesLabel((data?.kids ?? []).map((k) => k.name));
  const count = data?.active.length ?? 0;

  const ask = askLabel(free.map((r) => firstName(r.name)));
  function book() {
    if (ask) {
      router.push({ pathname: '/parent/pool-ask', params: { start: win.start.toISOString(), end: win.end.toISOString(), pick: free.map((r) => r.id).join(',') } });
      return;
    }
    router.push({ pathname: '/parent/shift/new', params: { day: dayKey(win.start), start: timeText(win.start), end: timeText(win.end) } });
  }

  const section = (g: PoolGroup, title: string) => {
    const list = group(g);
    if (!list.length) return null;
    return (
      <>
        <Text style={[st.label, { marginTop: SECTION_GAP }]}>
          {title} · {list.length}
        </Text>
        <View style={st.card}>
          {list.map((r, i) => {
            const pill = PILL[r.row.pillKind];
            return (
              <Pressable
                key={r.id}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/parent/sitter/[id]', params: { id: r.id } })}
                style={[st.row, i < list.length - 1 && st.line, g === 'not_free' && { opacity: 0.55 }]}>
                <View style={[st.avatar, { backgroundColor: r.color }]}>
                  <Text style={st.avatarText}>{r.name[0].toUpperCase()}</Text>
                </View>
                <View style={st.rowText}>
                  <Text style={st.name}>{shortName(r.name)}</Text>
                  <Text style={st.sub}>{r.row.sub}</Text>
                </View>
                <View style={[st.pill, { backgroundColor: pill.bg }]}>
                  <View style={[st.pillDot, { backgroundColor: pill.dot }]} />
                  <Text style={[st.pillText, { color: pill.ink }]}>{r.row.pill}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </>
    );
  };

  return (
    <Screen
      gap={10}
      header={
        <View style={st.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/parent/sitters'))} style={st.back}>
            <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
          </Pressable>
          <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
            <Text style={st.title}>Sitter pool</Text>
            <Text style={st.headSub}>
              {count} {count === 1 ? 'sitter' : 'sitters'} your family trusts
            </Text>
          </View>
          {MARKETPLACE ? (
            <Pressable accessibilityRole="button" onPress={findComingSoon} style={st.findBtn}>
              <Icon name="search" size={16} strokeWidth={2.2} />
              <Text style={st.findText}>Find new</Text>
            </Pressable>
          ) : null}
        </View>
      }
      footer={
        data && count ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable accessibilityRole="button" onPress={() => openPoolWeek(win.start, slotOf(win))} style={st.weekBtn}>
              <Icon name="grid" size={20} />
              <Text style={st.weekText}>Week</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={book} style={st.bookBtn}>
              <Text style={st.bookText}>{ask ?? 'Book a shift'}</Text>
            </Pressable>
          </View>
        ) : undefined
      }>
      <ErrorText>{error}</ErrorText>

      <View style={st.timeCard}>
        <View style={st.timeIcon}>
          <Icon name="calendar" size={22} />
        </View>
        <View style={{ flexGrow: 1, flexShrink: 1 }}>
          <Text style={st.timeTitle}>{windowLabel(win)}</Text>
          <Text style={st.sub}>{kidNames ? `For ${kidNames} · at home` : 'At home'}</Text>
        </View>
        <Text accessibilityRole="button" onPress={() => setPicking(true)} style={st.link}>
          Change
        </Text>
      </View>

      {chips.length ? (
        <View style={st.chips}>
          {chips.map((c) => {
            const sel = on.includes(c.key);
            return (
              <Pressable
                key={c.key}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: sel }}
                onPress={() => setFilters(sel ? on.filter((f) => f !== c.key) : [...on, c.key])}
                style={[st.chip, sel && st.chipOn]}>
                {sel ? <Icon name="check" size={16} tint={color.primaryStrong} strokeWidth={2.4} /> : null}
                <Text style={[st.chipText, sel && { color: color.primaryStrong }]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {section('free', 'FREE THE WHOLE TIME')}
      {section('partly', 'PARTLY FREE')}
      {section('not_free', 'NOT FREE')}
      {data && rows.length && !shown.length ? <Text style={st.sub}>No sitters match these filters.</Text> : null}

      <PickTimeSheet
        visible={picking}
        initial={win}
        onClose={() => setPicking(false)}
        onPick={(w) => {
          setPicking(false);
          router.setParams({ start: w.start.toISOString(), end: w.end.toISOString() });
        }}
      />
    </Screen>
  );
}

// Same avatar colors as the Sitters tab (P54), by the sitter's place in the pool.
const AVATAR = [color.primary, '#5E7F6A', '#8A6A4E', '#6F6194', '#5F6D74'];
const PILL = {
  ok: { bg: color.okTint, dot: color.ok, ink: color.okInk },
  warn: { bg: color.warnTint, dot: color.warn, ink: color.warnInk },
  muted: { bg: color.muted, dot: '#8A979D', ink: color.ink2 },
};

// Values from wireframe P42. The header keeps 4 at the bottom: the wireframe has 8 and Screen's content adds 4.
const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.display, fontSize: 22, color: color.ink, marginVertical: -4.62 },
  headSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  findBtn: { height: 36, paddingHorizontal: 12, borderRadius: 999, backgroundColor: color.primaryTint, flexDirection: 'row', alignItems: 'center', gap: 4 },
  findText: { fontFamily: font.bodyBold, fontSize: 14, color: color.primary },
  timeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  timeIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  timeTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  link: { fontFamily: font.bodyBold, fontSize: 14, color: color.primary, textDecorationLine: 'underline' },
  chips: { flexDirection: 'row', gap: 6, overflow: 'hidden' },
  chip: { height: CHIP_HEIGHT, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  chipOn: { backgroundColor: color.primaryTint, borderWidth: 1.5, borderColor: color.primary },
  chipText: { fontFamily: font.bodySemi, fontSize: 13, color: color.ink },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  card: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 62 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  rowText: { flexGrow: 1, flexShrink: 1, minWidth: 0 },
  name: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  sub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  pill: { flexShrink: 0, height: 26, paddingHorizontal: 10, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6 },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontFamily: font.bodyBold, fontSize: 12 },
  weekBtn: { height: 50, paddingHorizontal: 18, borderRadius: 999, backgroundColor: color.primaryTint, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  weekText: { fontFamily: font.displayBold, fontSize: 17, color: color.primary },
  bookBtn: { flexGrow: 1, flexBasis: 0, height: 50, borderRadius: 999, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  bookText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
});
