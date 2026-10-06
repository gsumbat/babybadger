import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { KidDot, kidSub } from '@/components/bits';
import { LiveMap } from '@/components/LiveMap';
import { ActionGrid, dayPart, ErrorText, HomeHeader, Icon, initialsOf, Screen } from '@/components/ui';
import { api, useQuery, useShiftLive } from '@/lib/data';
import { dayOf, firstName, timeOf } from '@/lib/format';
import { describeLog, parentHomeState, workedMinutes } from '@/lib/shift-logic';
import { useSession } from '@/lib/session';
import type { Kid, Shift } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';

// Wireframes P4 (live), P4a (setup), P4b (idle), P4c (starting soon), P4d (ended), translated from their HTML
// (app/src/wireframes/P4*.tsx). Left out until built: Message / Call / Ask for photo, kids' devices and places,
// Needs you (invoices, requests), Approve hours, "On my way", requirements and care plan steps.
export default function ParentHome() {
  const { family, profile } = useSession();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const [shifts, kids, sitters] = await Promise.all([api.familyShifts(fid), api.kids(fid), api.familySitters(fid)]);
    return { shifts, kids, sitters };
  }, [fid]);

  const state = data ? parentHomeState(data.shifts) : null;
  const sitterName = (id: string) => firstName(data?.sitters.find((s) => s.sitter_id === id)?.profile?.full_name);
  const steps = data
    ? [
        { done: data.kids.length > 0, title: 'Add your kids', sub: data.kids.length ? data.kids.map((k) => k.name).join(' and ') : 'Names, birthdays, foods to avoid', go: '/parent/kid/new' as const },
        { done: data.sitters.some((s) => s.status === 'active'), title: 'Invite your sitter', sub: 'Someone you already trust', go: '/parent/invite' as const },
        { done: data.shifts.length > 0, title: 'Book the first shift', sub: 'Pick a day and time', go: '/parent/shift/new' as const },
      ]
    : [];
  const setup = steps.length > 0 && steps.some((s) => !s.done) && state?.kind === 'idle' && !state.next;

  return (
    <Screen
      gap={state?.kind === 'live' ? 12 : 10}
      header={
        <HomeHeader
          eyebrow={setup ? `Welcome, ${firstName(profile?.full_name)}` : dayPart()}
          title={setup ? 'Let’s get set up' : family!.name}
          initials={initialsOf(profile?.full_name)}
          onAvatar={() => router.navigate('/parent/settings')}
        />
      }>
      <ErrorText>{error}</ErrorText>

      {setup && <Setup steps={steps} />}
      {state?.kind === 'live' && <Live shift={state.shift} sitter={sitterName(state.shift.sitter_id)} />}
      {state?.kind === 'soon' && <Soon shift={state.shift} minutes={state.minutes} sitter={sitterName(state.shift.sitter_id)} />}
      {state?.kind === 'ended' && (
        <Ended shift={state.shift} sitter={sitterName(state.shift.sitter_id)} next={data!.shifts.find((s) => s.status === 'scheduled' && new Date(s.starts_at) > new Date())} sitterName={sitterName} />
      )}
      {state?.kind === 'idle' && state.next && <NextShift shift={state.next} sitter={sitterName(state.next.sitter_id)} />}
      {!setup && data && data.kids.length > 0 && (state?.kind === 'idle' || state?.kind === 'ended') && <Kids kids={data.kids} />}

      <Text style={[st.label, { marginTop: 4 }]}>WHAT DO YOU NEED?</Text>
      <ActionGrid
        items={[
          { icon: 'plus', label: 'Book a shift', onPress: () => router.push('/parent/shift/new') },
          { icon: 'users', label: 'Invite a sitter', onPress: () => router.push('/parent/invite') },
          { icon: 'smartphone', label: 'Add a child', onPress: () => router.push('/parent/kid/new') },
          { icon: 'calendar', label: 'Calendar', onPress: () => router.navigate('/parent/calendar') },
        ]}
      />
    </Screen>
  );
}

function LabelRow({ children, link, onLink }: { children: string; link?: string; onLink?: () => void }) {
  return (
    <View style={[st.labelRow]}>
      <Text style={st.label}>{children}</Text>
      {link ? (
        <Text style={st.link} onPress={onLink}>
          {link}
        </Text>
      ) : null}
    </View>
  );
}

function Avatar({ name, size, letterSize, display = true }: { name: string; size: number; letterSize: number; display?: boolean }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: display ? font.display : font.bodyBold, fontSize: letterSize, color: '#FFFFFF' }}>{(name[0] || '?').toUpperCase()}</Text>
    </View>
  );
}

// P4a
function Setup({ steps }: { steps: { done: boolean; title: string; sub: string; go: '/parent/kid/new' | '/parent/invite' | '/parent/shift/new' }[] }) {
  const done = steps.filter((s) => s.done).length;
  const current = steps.findIndex((s) => !s.done);
  return (
    <>
      <View style={st.labelRow}>
        <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: color.ink }}>
          {done} of {steps.length} done
        </Text>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: color.ink2 }}>About 5 minutes</Text>
      </View>
      <View style={st.setupTrack}>
        <View style={[st.setupFill, { width: `${(done / steps.length) * 100}%` }]} />
      </View>
      {steps.map((s, i) => {
        const now = i === current;
        return (
          <Pressable key={s.title} accessibilityRole="button" onPress={() => router.push(s.go)} style={[st.step, now && st.stepNow]}>
            {s.done ? (
              <View style={[st.num, { backgroundColor: color.ok }]}>
                <Icon name="check" size={18} tint="#FFFFFF" strokeWidth={2.6} />
              </View>
            ) : now ? (
              <View style={[st.num, { backgroundColor: color.primary }]}>
                <Text style={[st.numText, { color: '#FFFFFF' }]}>{i + 1}</Text>
              </View>
            ) : (
              <View style={[st.num, { borderWidth: 2, borderColor: color.lineStrong }]}>
                <Text style={st.numText}>{i + 1}</Text>
              </View>
            )}
            <View style={{ flexGrow: 1, flexShrink: 1 }}>
              <Text style={[st.stepTitle, s.done && { color: color.ink2, textDecorationLine: 'line-through' }]}>{s.title}</Text>
              <Text style={st.sub12}>{s.sub}</Text>
            </View>
            <Icon name="chevron-right" size={18} tint={color.ink2} />
          </Pressable>
        );
      })}
      <View style={st.dashed}>
        <Text style={{ fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 }}>When a sitter is on shift, this screen turns into the live map with your kids’ plan.</Text>
      </View>
    </>
  );
}

// P4
function Live({ shift, sitter }: { shift: Shift; sitter: string }) {
  const { bundle } = useShiftLive(shift.id);
  if (!bundle) return null;
  const done = bundle.tasks.filter((t) => t.done_at);
  const next = bundle.tasks.find((t) => !t.done_at);
  const last = [...done].sort((a, b) => +new Date(b.done_at!) - +new Date(a.done_at!))[0];
  const mins = workedMinutes(bundle.shift);
  const hm = (iso: string) => timeOf(iso).replace(/\s?[AP]M$/i, '');
  return (
    <>
      <Pressable onPress={() => router.push(`/parent/shift/${shift.id}`)} style={st.liveCard}>
        <View style={st.liveTop}>
          <Avatar name={sitter} size={44} letterSize={16} display={false} />
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text style={st.liveTitle}>
              {sitter} is with {bundle.kids.map((k) => k.name).join(' and ') || 'the kids'}
            </Text>
            <Text style={st.sub14}>
              {Math.floor(mins / 60)} h {mins % 60} m in · until {timeOf(shift.ends_at)}
            </Text>
          </View>
        </View>
        <View>
          <LiveMap points={bundle.points} height={220} flush />
          <View style={st.onShift}>
            <View style={st.greenDot8} />
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: color.okInk }}>On shift</Text>
          </View>
        </View>
      </Pressable>
      <Pressable onPress={() => router.push(`/parent/shift/${shift.id}`)} style={st.planCard}>
        <View style={st.labelRow}>
          <Text style={st.bold15}>Today’s plan</Text>
          <Text style={st.sub14}>
            {done.length} of {bundle.tasks.length} done
          </Text>
        </View>
        <View style={st.track}>
          <View style={[st.trackFill, { width: `${bundle.tasks.length ? (done.length / bundle.tasks.length) * 100 : 0}%` }]} />
        </View>
        {next ? (
          <View style={st.planRow}>
            <Text style={[st.sub14, { width: 40 }]}>Next</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: color.ink, flexShrink: 1 }}>
              {next.due_at ? `${hm(next.due_at)} ` : ''}
              {next.title}
            </Text>
          </View>
        ) : null}
        {last ? (
          <View style={st.planRow}>
            <Text style={[st.sub14, { width: 40 }]}>{hm(last.done_at!)}</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: color.ink, flexShrink: 1 }}>{last.title}</Text>
          </View>
        ) : null}
        <View style={st.logRow}>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: color.ink, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold }}>Today’s log</Text> · {bundle.logs.length ? [...new Set(bundle.logs.map((l) => describeLog(l).title.toLowerCase()))].slice(0, 4).join(', ') : 'nothing yet'}
          </Text>
          <Icon name="chevron-right" size={18} tint={color.ink2} />
        </View>
      </Pressable>
    </>
  );
}

// P4c
function Soon({ shift, minutes, sitter }: { shift: Shift; minutes: number; sitter: string }) {
  const { bundle } = useShiftLive(shift.id);
  const avoid = (bundle?.kids ?? []).filter((k) => k.avoid_foods || k.allergies);
  return (
    <>
      <Pressable onPress={() => router.push(`/parent/shift/${shift.id}`)} style={st.blue}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flexShrink: 1 }}>
            <Text style={st.blueSmall}>{sitter} starts in</Text>
            <Text style={st.blueBig}>{minutes === 0 ? 'now' : `${minutes} min`}</Text>
            <Text style={[st.blueSmall, { fontSize: 14, opacity: 0.9 }]}>
              {timeOf(shift.starts_at)} – {timeOf(shift.ends_at)}
            </Text>
          </View>
          <Avatar name={sitter} size={52} letterSize={23} />
        </View>
      </Pressable>
      <View style={st.note}>
        <Text style={st.noteText}>Her location starts sharing when she clocks in at your home. Not before.</Text>
      </View>
      {bundle && bundle.tasks.length > 0 && (
        <>
          <LabelRow>TODAY’S PLAN</LabelRow>
          <View style={[st.listCard, { paddingVertical: 4, paddingHorizontal: 16 }]}>
            {bundle.tasks.map((t, i) => (
              <View key={t.id} style={[st.planItem, i < bundle.tasks.length - 1 && st.line]}>
                <Text style={[st.semi14, { width: 44 }]}>{t.due_at ? timeOf(t.due_at).replace(/\s?[AP]M$/i, '') : ''}</Text>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: color.ink, flexGrow: 1, flexShrink: 1 }}>{t.title}</Text>
              </View>
            ))}
          </View>
        </>
      )}
      {avoid.map((k) => (
        <View key={k.id} style={st.avoid}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: color.badInk }}>{k.name} · food to avoid</Text>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: '#6E2215' }}>
            {[k.avoid_foods, k.allergies && `allergic to ${k.allergies}`].filter(Boolean).join(' · ')} · shown to {sitter} at clock-in
          </Text>
        </View>
      ))}
    </>
  );
}

// P4d
function Ended({ shift, sitter, next, sitterName }: { shift: Shift; sitter: string; next?: Shift; sitterName: (id: string) => string }) {
  const { bundle } = useShiftLive(shift.id);
  const mins = workedMinutes(shift);
  return (
    <>
      <View style={st.endCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={sitter} size={48} letterSize={21} />
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text style={st.endTitle}>
              {sitter} clocked out · {timeOf(shift.clock_out_at!)}
            </Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: color.ink2 }}>Location sharing stopped</Text>
          </View>
        </View>
        <View style={st.statsBox}>
          <Num v={`${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`} l="Hours" />
          <Num v={bundle ? `${bundle.tasks.filter((t) => t.done_at).length}/${bundle.tasks.length}` : '–'} l="Tasks" />
          <Num v={bundle ? String(bundle.logs.filter((l) => l.kind === 'food').length) : '–'} l="Meals" />
          <Num v={bundle ? String(bundle.logs.filter((l) => l.photo_path).length) : '–'} l="Photos" />
        </View>
        {shift.note ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Icon name="message-square" size={18} tint={color.ink2} />
            <Text style={{ fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink, flexShrink: 1 }}>“{shift.note}”</Text>
          </View>
        ) : null}
        <Pressable accessibilityRole="button" onPress={() => router.push(`/parent/shift/${shift.id}`)} style={st.primaryBtn}>
          <Text style={st.primaryBtnText}>Read report</Text>
        </Pressable>
      </View>
      {next && (
        <>
          <LabelRow link="Calendar" onLink={() => router.navigate('/parent/calendar')}>
            COMING UP
          </LabelRow>
          <Pressable onPress={() => router.push(`/parent/shift/${next.id}`)} style={st.comingCard}>
            <Avatar name={sitterName(next.sitter_id)} size={36} letterSize={16} />
            <View style={{ flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: color.ink }}>
                {dayOf(next.starts_at)} · {timeOf(next.starts_at)} – {timeOf(next.ends_at)}
              </Text>
              <Text style={st.sub12}>{sitterName(next.sitter_id)}</Text>
            </View>
            <View style={st.pill}>
              <View style={[st.greenDot8, { width: 7, height: 7, backgroundColor: color.primary }]} />
              <Text style={[st.pillText, { color: color.primaryStrong }]}>Booked</Text>
            </View>
          </Pressable>
        </>
      )}
    </>
  );
}

function Num({ v, l }: { v: string; l: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text style={{ fontFamily: font.display, fontSize: 22, color: color.ink, marginVertical: -4.62 }}>{v}</Text>
      <Text style={st.sub12}>{l}</Text>
    </View>
  );
}

// P4b
function NextShift({ shift, sitter }: { shift: Shift; sitter: string }) {
  const { bundle } = useShiftLive(shift.id);
  const kids = bundle?.kids.map((k) => k.name).join(' and ');
  return (
    <Pressable onPress={() => router.push(`/parent/shift/${shift.id}`)} style={st.nextCard}>
      <View style={st.labelRow}>
        <Text style={st.label}>NEXT SHIFT</Text>
        <View style={[st.pill, { backgroundColor: color.primaryTint }]}>
          <View style={[st.greenDot8, { width: 7, height: 7, backgroundColor: color.primary }]} />
          <Text style={[st.pillText, { color: color.primaryStrong }]}>Booked</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={sitter} size={48} letterSize={21} />
        <View style={{ flexShrink: 1 }}>
          <Text style={st.when}>
            {dayOf(shift.starts_at)} · {timeOf(shift.starts_at)} – {timeOf(shift.ends_at)}
          </Text>
          <Text style={st.sub14}>
            {sitter}
            {kids ? ` with ${kids}` : ''}
            {bundle?.tasks.length ? ` · ${bundle.tasks.length} tasks` : ''}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function Kids({ kids }: { kids: Kid[] }) {
  return (
    <>
      <LabelRow link="Add" onLink={() => router.push('/parent/kid/new')}>
        KIDS
      </LabelRow>
      <View style={[st.listCard, { paddingHorizontal: 16 }]}>
        {kids.map((k, i) => (
          <View key={k.id} style={[st.kidRow, i < kids.length - 1 && st.line]}>
            <KidDot kid={k} />
            <View style={{ flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: color.ink }}>{k.name}</Text>
              {kidSub(k) ? <Text style={st.sub12}>{kidSub(k)}</Text> : null}
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

// Values from wireframes P4-P4d.
const st = StyleSheet.create({
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  link: { fontFamily: font.bodySemi, fontSize: 14, color: color.primary, textDecorationLine: 'underline' },
  sub12: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  sub14: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  semi14: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink2 },
  bold15: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  listCard: { backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  // P4a
  setupTrack: { height: 8, borderRadius: 4, backgroundColor: '#DDE3EA', overflow: 'hidden' },
  setupFill: { height: 8, backgroundColor: color.primary },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  stepNow: { backgroundColor: color.primaryTint, borderRadius: 16, borderWidth: 2, borderColor: color.primary },
  num: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: font.displayBold, fontSize: 15, color: '#5F6D74' },
  stepTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  dashed: { paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: color.lineStrong, borderStyle: 'dashed' },
  // P4
  liveCard: { backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden', ...cardShadow },
  liveTop: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  liveTitle: { fontFamily: font.displayBold, fontSize: 17, color: color.ink },
  onShift: { position: 'absolute', top: 10, left: 10, height: 28, paddingHorizontal: 10, borderRadius: 999, backgroundColor: color.okTint, flexDirection: 'row', alignItems: 'center', gap: 6 },
  greenDot8: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.ok },
  planCard: { gap: 10, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  track: { height: 6, borderRadius: 3, backgroundColor: color.muted, overflow: 'hidden' },
  trackFill: { height: 6, backgroundColor: color.ok },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: color.divider },
  // P4c
  blue: { gap: 12, padding: 16, backgroundColor: color.primary, borderRadius: 20 },
  blueSmall: { fontFamily: font.body, fontSize: 13, color: '#FFFFFF', opacity: 0.85 },
  blueBig: { fontFamily: font.display, fontSize: 40, color: '#FFFFFF', marginVertical: -10.04 },
  note: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 12 },
  noteText: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.primaryStrong },
  planItem: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  avoid: { gap: 2, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: color.badTint, borderRadius: 12 },
  // P4d
  endCard: { gap: 14, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  endTitle: { fontFamily: font.displayBold, fontSize: 19, color: color.ink, marginVertical: -3.72 },
  statsBox: { flexDirection: 'row', gap: 4, paddingVertical: 10, paddingHorizontal: 4, backgroundColor: color.canvas, borderRadius: 14 },
  primaryBtn: { height: 50, borderRadius: 999, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  comingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  pill: { height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: color.okTint, flexDirection: 'row', alignItems: 'center', gap: 6 },
  pillText: { fontFamily: font.bodyBold, fontSize: 12, color: color.okInk },
  // P4b
  nextCard: { gap: 10, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  when: { fontFamily: font.display, fontSize: 20, color: color.ink, marginVertical: -4.02 },
  kidRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
});
