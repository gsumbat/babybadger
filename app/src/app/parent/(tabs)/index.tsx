import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cardStyle, KidDot, kidSub, Progress, SafetyBox, TaskRows } from '@/components/bits';
import { LiveMap } from '@/components/LiveMap';
import { ActionGrid, Avatar, Button, Card, dayPart, ErrorText, HomeHeader, Icon, initialsOf, Label, Pill, Screen, T } from '@/components/ui';
import { api, useQuery, useShiftLive } from '@/lib/data';
import { dayOf, firstName, timeOf } from '@/lib/format';
import { describeLog, formatDuration, parentHomeState, workedMinutes } from '@/lib/shift-logic';
import { useSession } from '@/lib/session';
import type { Kid, Shift } from '@/lib/types';
import { color, font } from '@/theme';

// Wireframes P4 (live), P4a (setup), P4b (idle), P4c (starting soon), P4d (ended).
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
        { done: data.shifts.length > 0, title: 'Book the first shift', sub: 'Pick a day and time, add tasks', go: '/parent/shift/new' as const },
      ]
    : [];
  const setup = steps.length > 0 && steps.some((s) => !s.done) && state?.kind === 'idle' && !state.next;
  const me = firstName(profile?.full_name);

  return (
    <Screen
      header={
        <HomeHeader
          eyebrow={setup ? `Welcome, ${me}` : dayPart()}
          title={setup ? 'Let’s get set up' : family!.name}
          initials={initialsOf(profile?.full_name)}
          onAvatar={() => router.navigate('/parent/settings')}
        />
      }>
      <ErrorText>{error}</ErrorText>

      {setup && <Setup steps={steps} />}
      {state?.kind === 'live' && <Live shift={state.shift} sitter={sitterName(state.shift.sitter_id)} />}
      {state?.kind === 'soon' && <Soon shift={state.shift} minutes={state.minutes} sitter={sitterName(state.shift.sitter_id)} />}
      {state?.kind === 'ended' && <Ended shift={state.shift} sitter={sitterName(state.shift.sitter_id)} next={data!.shifts.find((s) => s.status === 'scheduled' && new Date(s.starts_at) > new Date())} nextSitter={sitterName} />}
      {state?.kind === 'idle' && state.next && <NextShift shift={state.next} sitter={sitterName(state.next.sitter_id)} />}

      {!setup && data && data.kids.length > 0 && state?.kind !== 'live' && state?.kind !== 'soon' && <Kids kids={data.kids} />}

      <Label>What do you need?</Label>
      <ActionGrid
        items={[
          { icon: 'plus', label: 'Book a shift', onPress: () => router.push('/parent/shift/new') },
          { icon: 'user-plus', label: 'Invite a sitter', onPress: () => router.push('/parent/invite') },
          { icon: 'smile', label: 'Add a child', onPress: () => router.push('/parent/kid/new') },
          { icon: 'calendar', label: 'Calendar', onPress: () => router.navigate('/parent/calendar') },
        ]}
      />
    </Screen>
  );
}

function Setup({ steps }: { steps: { done: boolean; title: string; sub: string; go: '/parent/kid/new' | '/parent/invite' | '/parent/shift/new' }[] }) {
  const done = steps.filter((s) => s.done).length;
  const current = steps.findIndex((s) => !s.done);
  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <T variant="strong">
          {done} of {steps.length} done
        </T>
        <T variant="muted">About 5 minutes</T>
      </View>
      <Progress value={done} total={steps.length} />
      {steps.map((s, i) => (
        <Pressable key={s.title} accessibilityRole="button" onPress={() => router.push(s.go)} style={[st.step, i === current && st.stepCurrent]}>
          {s.done ? (
            <View style={[st.num, { backgroundColor: color.ok, borderColor: color.ok }]}>
              <Icon name="check" size={16} tint="#FFFFFF" />
            </View>
          ) : (
            <View style={[st.num, i === current && { backgroundColor: color.primary, borderColor: color.primary }]}>
              <Text style={[st.numText, i === current && { color: '#FFFFFF' }]}>{i + 1}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[st.stepTitle, s.done && st.struck]}>{s.title}</Text>
            <T variant="small">{s.sub}</T>
          </View>
          <Icon name="chevron-right" size={18} tint={color.ink2} />
        </Pressable>
      ))}
      <View style={st.hint}>
        <T variant="small">When a sitter is on shift, this screen turns into the live map with your kids’ plan.</T>
      </View>
    </>
  );
}

function Live({ shift, sitter }: { shift: Shift; sitter: string }) {
  const { bundle } = useShiftLive(shift.id);
  if (!bundle) return null;
  const done = bundle.tasks.filter((t) => t.done_at).length;
  const next = bundle.tasks.find((t) => !t.done_at);
  const kids = bundle.kids.map((k) => k.name).join(' and ');
  return (
    <>
      <Pressable onPress={() => router.push(`/parent/shift/${shift.id}`)} style={[cardStyle, { overflow: 'hidden' }]}>
        <View style={st.liveTop}>
          <Avatar name={sitter} />
          <View style={{ flex: 1 }}>
            <Text style={st.strong16}>
              {sitter} is with {kids || 'the kids'}
            </Text>
            <T variant="muted">
              {formatDuration(workedMinutes(bundle.shift))} in · until {timeOf(shift.ends_at)}
            </T>
          </View>
        </View>
        <View>
          <LiveMap points={bundle.points} height={190} flush />
          <View style={st.onShift}>
            <Pill label="On shift" />
          </View>
        </View>
      </Pressable>
      <SafetyBox kids={bundle.kids} />
      <Card onPress={() => router.push(`/parent/shift/${shift.id}`)}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T variant="strong">Today’s plan</T>
          <T variant="muted">
            {done} of {bundle.tasks.length} done
          </T>
        </View>
        <Progress value={done} total={bundle.tasks.length} tint={color.ok} />
        {next ? (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <T variant="muted">Next</T>
            <T variant="strong">{next.title}</T>
          </View>
        ) : null}
        <View style={st.divider} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <T variant="strong">Today’s log </T>
          <T variant="muted" style={{ flex: 1 }}>
            {bundle.logs.length ? bundle.logs.slice(0, 4).map((l) => describeLog(l).title.toLowerCase()).join(', ') : 'nothing yet'}
          </T>
          <Icon name="chevron-right" size={18} tint={color.ink2} />
        </View>
      </Card>
    </>
  );
}

function Soon({ shift, minutes, sitter }: { shift: Shift; minutes: number; sitter: string }) {
  const { bundle } = useShiftLive(shift.id);
  return (
    <>
      <Pressable onPress={() => router.push(`/parent/shift/${shift.id}`)} style={st.blue}>
        <View style={{ flex: 1 }}>
          <Text style={st.blueSmall}>{minutes === 0 ? `${sitter} starts` : `${sitter} starts in`}</Text>
          <Text style={st.blueBig}>{minutes === 0 ? 'now' : `${minutes} min`}</Text>
          <Text style={st.blueSmall}>
            {timeOf(shift.starts_at)} – {timeOf(shift.ends_at)}
          </Text>
        </View>
        <View style={st.blueAvatar}>
          <Text style={st.blueAvatarText}>{sitter[0]}</Text>
        </View>
      </Pressable>
      <View style={st.hint}>
        <T variant="small">Her location starts sharing when she clocks in at your home. Not before.</T>
      </View>
      {bundle && bundle.tasks.length > 0 && (
        <>
          <Label>Today’s plan</Label>
          <Card style={{ paddingVertical: 4 }}>
            <TaskRows tasks={bundle.tasks} round />
          </Card>
        </>
      )}
      {bundle && <SafetyBox kids={bundle.kids} />}
    </>
  );
}

function Ended({ shift, sitter, next, nextSitter }: { shift: Shift; sitter: string; next?: Shift; nextSitter: (id: string) => string }) {
  const { bundle } = useShiftLive(shift.id);
  const mins = workedMinutes(shift);
  return (
    <>
      <Card>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Avatar name={sitter} />
          <View style={{ flex: 1 }}>
            <Text style={st.strong16}>
              {sitter} clocked out · {timeOf(shift.clock_out_at!)}
            </Text>
            <T variant="muted">Location sharing stopped</T>
          </View>
        </View>
        <View style={st.stats}>
          <Num v={`${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`} l="Hours" />
          <Num v={bundle ? `${bundle.tasks.filter((t) => t.done_at).length}/${bundle.tasks.length}` : '–'} l="Tasks" />
          <Num v={bundle ? String(bundle.logs.filter((l) => l.kind === 'food').length) : '–'} l="Meals" />
          <Num v={bundle ? String(bundle.logs.filter((l) => l.photo_path).length) : '–'} l="Photos" />
        </View>
        {shift.note ? <T>“{shift.note}”</T> : null}
        <Button label="Read report" onPress={() => router.push(`/parent/shift/${shift.id}`)} />
      </Card>
      {next && (
        <>
          <Label right={<Text style={st.link} onPress={() => router.navigate('/parent/calendar')}>Calendar</Text>}>Coming up</Label>
          <NextShift shift={next} sitter={nextSitter(next.sitter_id)} compact />
        </>
      )}
    </>
  );
}

function Num({ v, l }: { v: string; l: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontFamily: font.display, fontSize: 20, color: color.ink }}>{v}</Text>
      <T variant="small">{l}</T>
    </View>
  );
}

function NextShift({ shift, sitter, compact }: { shift: Shift; sitter: string; compact?: boolean }) {
  const { bundle } = useShiftLive(shift.id);
  const kids = bundle?.kids.map((k) => k.name).join(' and ');
  return (
    <Card onPress={() => router.push(`/parent/shift/${shift.id}`)}>
      {!compact && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={st.cardLabel}>NEXT SHIFT</Text>
          <Pill label="Booked" kind="info" />
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Avatar name={sitter} size={48} />
        <View style={{ flex: 1 }}>
          <Text style={st.when}>
            {dayOf(shift.starts_at)} · {timeOf(shift.starts_at)} – {timeOf(shift.ends_at)}
          </Text>
          <T variant="muted">
            {sitter}
            {kids ? ` with ${kids}` : ''}
            {bundle?.tasks.length ? ` · ${bundle.tasks.length} tasks` : ''}
          </T>
        </View>
      </View>
    </Card>
  );
}

function Kids({ kids }: { kids: Kid[] }) {
  return (
    <>
      <Label right={<Text style={st.link} onPress={() => router.push('/parent/kid/new')}>Add</Text>}>Kids</Label>
      <Card style={{ paddingVertical: 4 }}>
        {kids.map((k, i) => (
          <View key={k.id} style={[st.kidRow, i < kids.length - 1 && st.divider2]}>
            <KidDot kid={k} />
            <View style={{ flex: 1 }}>
              <T variant="strong">{k.name}</T>
              {kidSub(k) ? <T variant="small">{kidSub(k)}</T> : null}
            </View>
          </View>
        ))}
      </Card>
    </>
  );
}

const st = StyleSheet.create({
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: color.surface, borderRadius: 20, paddingHorizontal: 14, minHeight: 64, borderWidth: 1.5, borderColor: 'transparent', shadowColor: color.edge, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 1 },
  stepCurrent: { borderColor: color.primary, backgroundColor: '#F4F8FB' },
  num: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2 },
  stepTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  struck: { textDecorationLine: 'line-through', color: color.quiet },
  hint: { borderWidth: 1, borderStyle: 'dashed', borderColor: color.lineStrong, borderRadius: 16, padding: 12 },
  liveTop: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  strong16: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  onShift: { position: 'absolute', left: 12, top: 12 },
  divider: { height: 1, backgroundColor: color.divider, marginVertical: 2 },
  divider2: { borderBottomWidth: 1, borderBottomColor: color.divider },
  blue: { backgroundColor: color.primary, borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center' },
  blueSmall: { fontFamily: font.body, fontSize: 14, color: '#FFFFFF', opacity: 0.9 },
  blueBig: { fontFamily: font.display, fontSize: 34, color: '#FFFFFF' },
  blueAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  blueAvatarText: { fontFamily: font.display, fontSize: 20, color: '#FFFFFF' },
  stats: { flexDirection: 'row', backgroundColor: color.canvas, borderRadius: 16, paddingVertical: 10 },
  link: { fontFamily: font.bodySemi, fontSize: 14, color: color.primary },
  cardLabel: { fontFamily: font.bodyBold, fontSize: 13, letterSpacing: 0.6, color: color.ink2 },
  when: { fontFamily: font.display, fontSize: 19, color: color.ink },
  kidRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
});
