import { router, useIsFocused } from 'expo-router';
import { type ReactNode, useEffect, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { KidDot, kidSub } from '@/components/bits';
import { MembersNote } from '@/components/familyMembers';
import { LockedMap, PaymentIssueBanner } from '@/components/billing';
import { LiveMap } from '@/components/LiveMap';
import { ParentRequestsNeedYou } from '@/components/poolRequest';
import { AskToStaySheet, WALK_ICON } from '@/components/timing';
import { ActionGrid, dayPart, ErrorText, HomeHeader, Icon, type IconName, initialsOf, Screen } from '@/components/ui';
import { takePlansIntro, usePlan } from '@/lib/billing';
import { api, type ShiftBundle, useQuery, useShiftLive } from '@/lib/data';
import { namesLine } from '@/lib/invite-links';
import { dayOf, firstName, timeOf } from '@/lib/format';
import { dialable } from '@/lib/family-page-logic';
import { describeLog, lateHomeCard, parentHomeState, workedMinutes } from '@/lib/shift-logic';
import { rulesApi } from '@/lib/house-rules';
import { useSession } from '@/lib/session';
import { useCanManage, useParentNames } from '@/lib/use-family-role';
import { type ShiftTiming, usePendingExtension } from '@/lib/shift-timing';
import { lateText } from '@/lib/shift-timing-logic';
import { kv } from '@/lib/storage';
import type { Kid, Shift } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';
import { IncidentCard } from '@/components/IncidentCard';
import { incidentCard } from '@/lib/alerts-logic';
import { isOpenTrip, useShiftTrips } from '@/lib/trips';

// Wireframes P4 (live), P4a (setup), P4e (setup skipped), P4b (idle), P4c (starting soon), P4d (ended), translated
// from their HTML (app/src/wireframes/P4*.tsx). Left out until built: Message / Call / Ask for photo, kids' devices and
// places, Needs you invoices (open pool requests show there, P46), Approve hours, "On my way". P4c shows the sitter's late notice (S21) where it
// draws "On my way". While a trip is open, P4's "On shift" pill reads "On a trip" (P8's pill) and opens P8. P4 has an "Ask Maya to stay longer" link under the live card (S25 request; not drawn yet).
// P4n (late): the start has passed with no clock-in; amber card with Message / Call (the sitter's S40 phone).
// KIDS shows in every state with kids (P4a-P4n, P4m), right after the state's main card (P4c / P4n: after its location note).

// Optional steps (house rules, the care plan) count toward "n of 5 done" but don't keep the setup checklist open on their own.
type Step = { done: boolean; locked?: boolean; optional?: boolean; title: string; next: string; sub: string; go: '/parent/kid/new' | '/parent/rules' | '/parent/care' | '/parent/invite?from=setup' | '/parent/shift/new' };
// Tiles whose screens aren't built yet still show (as drawn) and say so when tapped.
const soon = (what: string) => () => Alert.alert(what, 'Coming soon.');
type Tile = { icon: IconName; label: string; onPress: () => void };
const TILES: Record<string, Tile> = {
  book: { icon: 'plus', label: 'Book a shift', onPress: () => router.push('/parent/shift/new') },
  rules: { icon: 'clipboard', label: 'House rules', onPress: () => router.push('/parent/rules') },
  care: { icon: 'list', label: 'Care plan', onPress: () => router.push('/parent/care') },
  // P13k: the kids list (devices there are Coming soon).
  devices: { icon: 'smartphone', label: 'Kids & devices', onPress: () => router.push('/parent/kids') },
  pay: { icon: 'credit-card', label: 'Pay sitter', onPress: soon('Pay sitter') },
  requirements: { icon: 'shield', label: 'Required', onPress: () => router.push('/parent/requirements') },
};
// All six tiles in three columns, 76 tall, in every state (P4b, P4c, P4d, P4k, P4n). Finding sitters and asking the
// pool live on the Sitters tab, messages on Messages, so they aren't repeated here.
const FULL_TILES = ['book', 'rules', 'care', 'devices', 'pay', 'requirements'];
// P4m: a read-only member (migration 30) doesn't book, pay or set requirements; those tiles are left out.
const HELPER_TILES = ['rules', 'care', 'devices'];

/** Home tab. `full` = the live shift on its own screen (P4, opened from the P4k "Shift now" card). */
export default function ParentHome({ full = false }: { full?: boolean }) {
  const { family, profile, familyRole, isOwner } = useSession();
  const helper = familyRole === 'helper';
  const fid = family!.id;
  // P4m's note names the full-access members ("Jen and Sam manage sitters, pay and the plan").
  const parents = useParentNames();
  // "Jen manages …" / "Jen and Sam manage …" / "Full-access members manage …" (before the names load).
  const parentNames = parents.length ? `${namesLine(parents)} ${parents.length === 1 ? 'manages' : 'manage'}` : 'Full-access members manage';
  const { data, error } = useQuery(async () => {
    // care_items arrives with migration 06; until it's run the care plan step just shows as not done.
    // house_rules arrives with migration 09; same fallback.
    const [shifts, kids, sitters, care, rules] = await Promise.all([api.familyShifts(fid), api.kids(fid), api.familySitters(fid), api.careItems(fid).catch(() => []), rulesApi.rules(fid).catch(() => [])]);
    return { shifts, kids, sitters, careCount: care.length, rulesCount: rules.length };
  }, [fid]);

  // Re-reads the clock every 30 s so "starts in 25 min" counts down and turns into P4n (late) on time.
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);
  const state = data ? parentHomeState(data.shifts) : null;
  const sitterName = (id: string) => firstName(data?.sitters.find((s) => s.sitter_id === id)?.profile?.full_name);
  // Booking opens once the kids are added (each went through the P19 safety step) and a sitter has joined and signed.
  const kidsDone = !!data && data.kids.length > 0;
  const sitterDone = !!data && data.sitters.some((s) => s.status === 'active');
  const bookLock = !kidsDone ? 'Opens after you add your kids' : !sitterDone ? 'Opens when your sitter joins and signs' : '';
  const steps: Step[] = data
    ? [
        { done: kidsDone, title: 'Add your kids', next: 'add your kids', sub: kidsDone ? data.kids.map((k) => k.name).join(' and ') : 'Names, birthdays, foods to avoid', go: '/parent/kid/new' },
        { done: data.rulesCount > 0, optional: true, title: 'House rules', next: 'house rules', sub: 'Optional · Must rules need her OK before booking', go: '/parent/rules' },
        { done: data.careCount > 0, optional: true, title: 'Write the care plan', next: 'write the care plan', sub: 'Optional · tasks, meals, routines', go: '/parent/care' },
        { done: sitterDone, title: 'Invite your sitter', next: 'invite your sitter', sub: 'Someone you trust', go: '/parent/invite?from=setup' },
        { done: data.shifts.length > 0, locked: !!bookLock, title: 'Book the first shift', next: 'book the first shift', sub: bookLock || 'Pick a day and time', go: '/parent/shift/new' },
      ]
    : [];
  // "Skip for now" on P4a is remembered on this phone; the P4e card brings the checklist back.
  const skipKey = `bb_setup_skipped_${fid}`;
  const [skipped, setSkipped] = useState(() => kv.get(skipKey) === '1');
  // Read only never sees the setup checklist (P4a / P4e): setting the family up needs full access.
  const incomplete = !helper && steps.some((s) => !s.done && !s.optional) && state?.kind === 'idle' && !state.next;
  const setup = incomplete && !skipped;
  const explore = incomplete && skipped;

  // P36 once after first-run setup (P2 → P3): when Home is back in front and the family has no plan yet. Only the
  // owner manages the plan (migration 32).
  const plan = usePlan();
  const focused = useIsFocused();
  useEffect(() => {
    if (full || !isOwner || !focused || !plan.enabled || !plan.loaded || plan.state !== 'none') return;
    if (takePlansIntro(fid)) router.push('/parent/plans?from=setup');
  }, [full, isOwner, focused, plan.enabled, plan.loaded, plan.state, fid]);

  // KIDS (P4b's list) in every state that has kids; read only (P4m) and the setup screens have no Add link.
  const kids = data && data.kids.length > 0 ? <Kids kids={data.kids} add={!helper && !setup && !explore} /> : null;

  return (
    <Screen
      gap={state?.kind === 'live' && full ? 12 : 10}
      {...(full ? { title: 'Live shift', back: true } : {})}
      header={
        full ? undefined : <HomeHeader
          eyebrow={setup ? `Welcome, ${firstName(profile?.full_name)}` : dayPart()}
          title={setup ? 'Let’s get set up' : family!.name}
          initials={initialsOf(profile?.full_name)}
          onAvatar={() => router.navigate('/parent/settings')}
        />
      }>
      <ErrorText>{error}</ErrorText>
      {/* P40: payment failed, still inside the grace period. */}
      {!full && !helper && <PaymentIssueBanner />}

      {setup && (
        <Setup
          steps={steps}
          onSkip={() => {
            kv.set(skipKey, '1');
            setSkipped(true);
          }}
        />
      )}
      {setup && kids}
      {explore && (
        <FinishSetup
          steps={steps}
          lock={bookLock && bookLock.replace('Opens', 'Booking opens')}
          onOpen={() => {
            kv.remove(skipKey);
            setSkipped(false);
          }}
        />
      )}
      {explore && kids}
      {state?.kind === 'live' &&
        (full ? <Live shift={state.shift} sitter={sitterName(state.shift.sitter_id)} kids={kids} /> : <ShiftNow shift={state.shift} sitter={sitterName(state.shift.sitter_id)} />)}
      {full && state && state.kind !== 'live' && <Text style={st.sub14}>This shift has ended.</Text>}
      {!full && state?.kind === 'soon' && <Soon shift={state.shift} minutes={state.minutes} sitter={sitterName(state.shift.sitter_id)} kids={kids} />}
      {!full && state?.kind === 'late' && <Late shift={state.shift} minutesLate={state.minutesLate} sitter={sitterName(state.shift.sitter_id)} kids={kids} />}
      {!full && state?.kind === 'ended' && (
        <Ended shift={state.shift} sitter={sitterName(state.shift.sitter_id)} next={data!.shifts.find((s) => s.status === 'scheduled' && new Date(s.starts_at) > new Date())} sitterName={sitterName} kids={kids} />
      )}
      {!full && state?.kind === 'idle' && state.next && <NextShift shift={state.next} sitter={sitterName(state.next.sitter_id)} />}
      {/* Live (P4k) and idle (P4b): the list right under the card. Soon, late and ended place it themselves. */}
      {!setup && !explore && !full && (state?.kind === 'idle' || state?.kind === 'live') && kids}

      {/* P4b "Needs you": open pool requests (P46). Invoices aren't built. */}
      {!setup && !full && !helper && <ParentRequestsNeedYou familyId={fid} />}

      {/* P4a has no grid. Find a sitter and Ask my pool aren't on Home (Sitters tab); Pay sitter says Coming soon; Kids & devices opens P13k; Required opens P7a. */}
      {explore ? (
        // P4e: "Invite a sitter", "House rules" and "Care plan" are built; Kids & devices is left out.
        <>
          <View style={{ gap: 8, marginTop: 2 }}>
            <Text style={st.label}>WHAT DO YOU NEED?</Text>
            <ActionGrid
              items={[
                { icon: 'users', label: 'Invite a sitter', onPress: () => router.push('/parent/invite') },
                { icon: 'shield', label: 'House rules', onPress: () => router.push('/parent/rules') },
                { icon: 'list', label: 'Care plan', onPress: () => router.push('/parent/care') },
              ]}
              height={76}
            />
          </View>
          <LiveNote />
        </>
      ) : state && !setup && !full ? (
        // The grid sits inside the content (gap 10), label to grid 8; the same six tiles in every state.
        <View style={{ gap: 8 }}>
          <Text style={st.label}>WHAT DO YOU NEED?</Text>
          <ActionGrid items={(helper ? HELPER_TILES : FULL_TILES).map((k) => TILES[k])} height={76} columns={3} />
        </View>
      ) : null}
      {helper && state && !full ? (
        <MembersNote>{`You have read-only access. ${parentNames} sitters, pay and the plan.`}</MembersNote>
      ) : null}
    </Screen>
  );
}

/** "3:00 – 7:00 PM": the start drops AM/PM when both ends share it (wireframes P4b-P4d). */
function span(start: string, end: string) {
  const [a, b] = [timeOf(start), timeOf(end)];
  const ap = (t: string) => t.match(/\s?([AP]M)$/i)?.[1];
  return ap(a) && ap(a) === ap(b) ? `${a.replace(/\s?[AP]M$/i, '')} – ${b}` : `${a} – ${b}`;
}

function LabelRow({ children, link, onLink }: { children: string; link?: string; onLink?: () => void }) {
  return (
    <View style={[st.labelRow, { marginTop: 2 }]}>
      <Text style={st.label}>{children}</Text>
      {link ? (
        <Text style={st.link} onPress={onLink}>
          {link}
        </Text>
      ) : null}
    </View>
  );
}

function Avatar({ name, size, letterSize, face = font.display }: { name: string; size: number; letterSize: number; face?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: face, fontSize: letterSize, color: '#FFFFFF' }}>{(name[0] || '?').toUpperCase()}</Text>
    </View>
  );
}

// P4a
function Setup({ steps, onSkip }: { steps: Step[]; onSkip: () => void }) {
  const done = steps.filter((s) => s.done).length;
  const current = steps.findIndex((s) => !s.done && !s.locked);
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
        if (s.locked && !s.done)
          return (
            <View key={s.title} accessibilityState={{ disabled: true }} style={[st.step, st.stepLocked]}>
              <View style={[st.num, { backgroundColor: '#E1E6EC' }]}>
                <Icon name="lock" size={16} tint="#5F6D74" strokeWidth={2} />
              </View>
              <View style={{ flexGrow: 1, flexShrink: 1 }}>
                <Text style={[st.stepTitle, { color: '#5F6D74' }]}>{s.title}</Text>
                <Text style={[st.sub12, { color: '#5F6D74' }]}>{s.sub}</Text>
              </View>
            </View>
          );
        return (
          <Pressable key={s.title} accessibilityRole="button" onPress={() => router.push(s.go)} style={[st.step, now && st.stepNow]}>
            {s.done ? (
              <View style={[st.num, { backgroundColor: color.ok }]}>
                <Icon name="check" size={16} tint="#FFFFFF" strokeWidth={2.8} />
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
            {s.done ? null : <Icon name="chevron-right" size={18} tint={color.ink2} />}
          </Pressable>
        );
      })}
      <LiveNote />
      <Text accessibilityRole="button" onPress={onSkip} style={st.skip}>
        Skip for now, explore the app
      </Text>
    </>
  );
}

function LiveNote() {
  return (
    <View style={st.dashed}>
      <Text style={{ fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 }}>When a sitter is on shift, this screen turns into the live map with your kids’ plan.</Text>
    </View>
  );
}

// P4e: the checklist folded into one card; tapping it brings P4a back.
function FinishSetup({ steps, lock, onOpen }: { steps: Step[]; lock: string; onOpen: () => void }) {
  const done = steps.filter((s) => s.done).length;
  const i = steps.findIndex((s) => !s.done && !s.locked);
  const next = steps[i];
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Finish setting up" onPress={onOpen} style={st.finish}>
      <View style={st.labelRow}>
        <Text style={st.label}>FINISH SETTING UP</Text>
        <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: color.ink }}>
          {done} of {steps.length} done
        </Text>
      </View>
      <View style={st.setupTrack}>
        <View style={[st.setupFill, { width: `${(done / steps.length) * 100}%` }]} />
      </View>
      {next ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={[st.num, { backgroundColor: color.primary }]}>
            <Text style={[st.numText, { color: '#FFFFFF' }]}>{i + 1}</Text>
          </View>
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text style={st.stepTitle}>Next: {next.next}</Text>
            <Text style={st.sub12}>{next.sub}</Text>
          </View>
          <Icon name="chevron-right" size={18} tint={color.ink2} />
        </View>
      ) : null}
      {lock ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="lock" size={16} tint="#5F6D74" strokeWidth={2} />
          <Text style={{ fontFamily: font.body, fontSize: 13, color: '#5F6D74', flexShrink: 1 }}>{lock}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

// P4
function Live({ shift, sitter, kids }: { shift: Shift; sitter: string; kids: ReactNode }) {
  const { bundle } = useShiftLive(shift.id);
  const { pending } = usePendingExtension(shift.id);
  const { trips } = useShiftTrips(shift.id);
  const openTrip = trips.find(isOpenTrip);
  const [askOpen, setAskOpen] = useState(false);
  const plan = usePlan();
  const { familyRole } = useSession();
  if (!bundle) return null;
  const done = bundle.tasks.filter((t) => t.done_at);
  const next = bundle.tasks.find((t) => !t.done_at);
  const last = [...done].sort((a, b) => +new Date(b.done_at!) - +new Date(a.done_at!))[0];
  const mins = workedMinutes(bundle.shift);
  const hm = (iso: string) => timeOf(iso).replace(/\s?[AP]M$/i, '');
  // P4i: an injury on this shift shows on top, newest first, and opens Alerts (P9).
  const injuries = bundle.logs.filter((l) => l.kind === 'incident').sort((a, b) => +new Date(b.happened_at) - +new Date(a.happened_at));
  return (
    <>
      {injuries.map((l) => (
        <IncidentCard key={l.id} card={incidentCard(l, bundle.kids)} action="See alerts" onAction={() => router.push('/parent/alerts')} />
      ))}
      <Pressable onPress={() => router.push(`/parent/shift/${shift.id}`)} style={st.liveCard}>
        <View style={st.liveTop}>
          <Avatar name={sitter} size={44} letterSize={16} face={font.bodyBold} />
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
          {plan.hasPlan ? <LiveMap points={bundle.points} height={220} flush /> : <LockedMap />}
          {!plan.hasPlan ? null : openTrip ? (
            // P8's "On a trip" pill in place of "On shift" while a trip is open; it opens the trip (P8).
            <Pressable accessibilityRole="button" onPress={() => router.push(`/parent/trip/${openTrip.id}`)} style={[st.onShift, st.onTrip]}>
              <View style={[st.greenDot8, { backgroundColor: color.primary }]} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: color.primary }}>{openTrip.status === 'pending' ? 'Trip · needs you' : 'On a trip'}</Text>
            </Pressable>
          ) : (
            <View style={st.onShift}>
              <View style={st.greenDot8} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: color.okInk }}>On shift</Text>
            </View>
          )}
        </View>
      </Pressable>
      {/* Not in wireframe P4: asks her to stay longer (she answers on S25). An open request shows instead. */}
      {/* Read only sees an open request but can't ask (it changes the booking and the pay). */}
      {familyRole === 'helper' ? (
        pending ? <Text style={st.askLink}>{`Asked ${sitter} to stay until ${timeOf(pending.new_ends_at)} · waiting`}</Text> : null
      ) : (
        <Text accessibilityRole="button" onPress={() => setAskOpen(true)} style={st.askLink}>
          {pending ? `Asked ${sitter} to stay until ${timeOf(pending.new_ends_at)} · waiting` : `Ask ${sitter} to stay longer`}
        </Text>
      )}
      <AskToStaySheet open={askOpen} onClose={() => setAskOpen(false)} shift={bundle.shift} sitter={sitter} />
      {kids}
      <Pressable onPress={() => router.push(`/parent/shift/${shift.id}`)} style={st.planCard}>
        {/* P4i: with no tasks on the shift the plan header and bar are left out; the log row stays. */}
        {bundle.tasks.length ? (
          <>
            <View style={st.labelRow}>
              <Text style={st.bold15}>Today’s plan</Text>
              <Text style={st.sub14}>
                {done.length} of {bundle.tasks.length} done
              </Text>
            </View>
            <View style={st.track}>
              <View style={[st.trackFill, { width: `${(done.length / bundle.tasks.length) * 100}%` }]} />
            </View>
          </>
        ) : null}
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
        {/* P4's "Today's log" row opens the full log (P77). */}
        <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/parent/log/[shiftId]', params: { shiftId: shift.id } })} style={st.logRow}>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: color.ink, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold }}>Today’s log</Text> · {bundle.logs.length ? [...new Set(bundle.logs.map((l) => describeLog(l).title.toLowerCase()))].slice(0, 4).join(', ') : 'nothing yet'}
          </Text>
          <Icon name="chevron-right" size={18} tint={color.ink2} />
        </Pressable>
      </Pressable>
    </>
  );
}

// P4k: the live shift as one card at the top of the normal Home; "See live" opens the full view (P4).
function ShiftNow({ shift, sitter }: { shift: Shift; sitter: string }) {
  const { bundle } = useShiftLive(shift.id);
  const { trips } = useShiftTrips(shift.id);
  const openTrip = trips.find(isOpenTrip);
  if (!bundle) return null;
  const done = bundle.tasks.filter((t) => t.done_at).length;
  const next = bundle.tasks.find((t) => !t.done_at);
  const mins = workedMinutes(bundle.shift);
  const hm = (iso: string) => timeOf(iso).replace(/\s?[AP]M$/i, '');
  const injuries = bundle.logs.filter((l) => l.kind === 'incident').sort((a, b) => +new Date(b.happened_at) - +new Date(a.happened_at));
  const plan = bundle.tasks.length
    ? `Plan ${done} of ${bundle.tasks.length}${next ? ` · Next ${next.due_at ? `${hm(next.due_at)} ` : ''}${next.title}` : ''}`
    : `Today’s log · ${bundle.logs.length ? `${bundle.logs.length} ${bundle.logs.length === 1 ? 'entry' : 'entries'}` : 'nothing yet'}`;
  return (
    <>
      {/* P4i: an injury still shows on top, above the card. */}
      {injuries.map((l) => (
        <IncidentCard key={l.id} card={incidentCard(l, bundle.kids)} action="See alerts" onAction={() => router.push('/parent/alerts')} />
      ))}
      <Pressable accessibilityRole="button" onPress={() => router.push('/parent/live')} style={st.nowCard}>
        <View style={st.labelRow}>
          <Text style={st.label}>SHIFT NOW</Text>
          <View style={st.pill}>
            <View style={[st.greenDot8, { width: 7, height: 7 }]} />
            <Text style={st.pillText}>{openTrip ? (openTrip.status === 'pending' ? 'Trip · needs you' : 'On a trip') : 'On shift'}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={sitter} size={48} letterSize={21} />
          <View style={{ flexShrink: 1 }}>
            <Text style={st.when}>
              {sitter} is with {bundle.kids.map((k) => k.name).join(' and ') || 'the kids'}
            </Text>
            <Text style={st.sub14}>
              {Math.floor(mins / 60)} h {mins % 60} m in · until {timeOf(shift.ends_at)}
            </Text>
          </View>
        </View>
        <View style={st.nowFoot}>
          <Text style={[st.sub14, { flexShrink: 1 }]} numberOfLines={1}>
            {plan}
          </Text>
          <Text style={st.nowLink}>See live ›</Text>
        </View>
      </Pressable>
    </>
  );
}

// P4c
function Soon({ shift, minutes, sitter, kids }: { shift: Shift; minutes: number; sitter: string; kids: ReactNode }) {
  const { bundle } = useShiftLive(shift.id);
  // The late notice (S21) arrives live through the shift's Realtime updates.
  const late = (bundle?.shift ?? shift) as ShiftTiming;
  return (
    <>
      <Pressable onPress={() => router.push(`/parent/shift/${shift.id}`)} style={st.blue}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flexShrink: 1 }}>
            <Text style={st.blueSmall}>{sitter} starts in</Text>
            <Text style={st.blueBig}>{minutes === 0 ? 'now' : `${minutes} min`}</Text>
            <Text style={[st.blueSmall, { fontSize: 14, opacity: 0.9 }]}>
              {span(shift.starts_at, shift.ends_at)}
            </Text>
          </View>
          <Avatar name={sitter} size={52} letterSize={23} />
        </View>
        {late.late_minutes ? (
          <View style={st.onWay}>
            <SvgXml xml={WALK_ICON} width={20} height={20} style={{ flexShrink: 0 }} />
            <Text style={st.onWayText}>
              <Text style={{ fontFamily: font.bodyBold }}>{lateText(sitter, late.late_minutes)}</Text>
              {late.late_note ? ` · ${late.late_note}` : ''}
            </Text>
          </View>
        ) : null}
      </Pressable>
      <BeforeClockIn shift={shift} bundle={bundle} sitter={sitter} kids={kids} />
    </>
  );
}

/** P4c / P4n below the card: the location note, KIDS, TODAY'S PLAN (Edit opens this shift's tasks, P5e) and food to avoid. */
function BeforeClockIn({ shift, bundle, sitter, kids }: { shift: Shift; bundle: ShiftBundle | null; sitter: string; kids: ReactNode }) {
  const manage = useCanManage();
  const avoid = (bundle?.kids ?? []).filter((k) => k.avoid_foods || k.allergies);
  return (
    <>
      <View style={st.note}>
        <Text style={st.noteText}>Her location starts sharing when she clocks in at your home. Not before.</Text>
      </View>
      {kids}
      {bundle && bundle.tasks.length > 0 && (
        <>
          <LabelRow link={manage ? 'Edit' : undefined} onLink={() => router.push(`/parent/shift/${shift.id}`)}>
            TODAY’S PLAN
          </LabelRow>
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

// P4n: past the start, no clock-in. Amber card; her S21 "running late" notice replaces the words while it still holds.
function Late({ shift, minutesLate, sitter, kids }: { shift: Shift; minutesLate: number; sitter: string; kids: ReactNode }) {
  const { bundle } = useShiftLive(shift.id);
  const notice = (bundle?.shift ?? shift) as ShiftTiming;
  const card = lateHomeCard(sitter, minutesLate, span(shift.starts_at, shift.ends_at), notice);
  // Her number from her profile (S40, sitter_profiles.phone; parents of her families may read it). No number, no Call.
  const { data: phone } = useQuery(() => api.sitterPhone(shift.sitter_id), [shift.sitter_id]);
  const tel = dialable(phone);
  return (
    <>
      <Pressable onPress={() => router.push(`/parent/shift/${shift.id}`)} style={st.lateCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={sitter} size={48} letterSize={21} />
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text style={st.lateTitle}>{card.title}</Text>
            <Text style={st.lateSub}>{card.sub}</Text>
          </View>
        </View>
        {card.said ? (
          <View style={st.lateSaid}>
            <SvgXml xml={WALK_ICON.replace('#FFFFFF', color.warnInk)} width={20} height={20} style={{ flexShrink: 0 }} />
            <Text style={st.lateSaidText}>{card.said}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/parent/thread/[sitterId]', params: { sitterId: shift.sitter_id } })} style={st.lateBtn}>
            <Text style={st.lateBtnText}>Message {sitter}</Text>
          </Pressable>
          {tel ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`Call ${sitter}`} onPress={() => Linking.openURL(`tel:${tel}`)} style={st.lateBtn}>
              <Text style={st.lateBtnText}>Call</Text>
            </Pressable>
          ) : null}
        </View>
      </Pressable>
      <BeforeClockIn shift={shift} bundle={bundle} sitter={sitter} kids={kids} />
    </>
  );
}

// P4d
function Ended({ shift, sitter, next, sitterName, kids }: { shift: Shift; sitter: string; next?: Shift; sitterName: (id: string) => string; kids: ReactNode }) {
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
      {kids}
      {next && (
        <>
          <LabelRow link="Calendar" onLink={() => router.navigate('/parent/calendar')}>
            COMING UP
          </LabelRow>
          <Pressable onPress={() => router.push(`/parent/shift/${next.id}`)} style={st.comingCard}>
            <Avatar name={sitterName(next.sitter_id)} size={36} letterSize={16} face={font.displayBold} />
            <View style={{ flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: color.ink }}>
                {dayOf(next.starts_at)} · {span(next.starts_at, next.ends_at)}
              </Text>
              <Text style={st.sub12}>{sitterName(next.sitter_id)}</Text>
            </View>
            <View style={st.pill}>
              <View style={[st.greenDot8, { width: 7, height: 7 }]} />
              <Text style={st.pillText}>Confirmed</Text>
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
        <View style={st.pill}>
          <View style={[st.greenDot8, { width: 7, height: 7 }]} />
          <Text style={st.pillText}>Confirmed</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={sitter} size={48} letterSize={21} />
        <View style={{ flexShrink: 1 }}>
          <Text style={st.when}>
            {dayOf(shift.starts_at)} · {span(shift.starts_at, shift.ends_at)}
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

function Kids({ kids, add = true }: { kids: Kid[]; add?: boolean }) {
  return (
    <>
      <LabelRow link={add ? 'Add' : undefined} onLink={() => router.push('/parent/kid/new')}>
        KIDS
      </LabelRow>
      <View style={[st.listCard, { paddingHorizontal: 16 }]}>
        {kids.map((k, i) => (
          <Pressable key={k.id} accessibilityRole="button" onPress={() => router.push(`/parent/kid/${k.id}`)} style={[st.kidRow, i < kids.length - 1 && st.line]}>
            <KidDot kid={k} />
            <View style={{ flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: color.ink }}>{k.name}</Text>
              {kidSub(k) ? <Text style={[st.sub12, { lineHeight: 17, marginTop: 2 }]}>{kidSub(k)}</Text> : null}
            </View>
            <Icon name="chevron-right" size={18} tint={color.ink2} />
          </Pressable>
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
  stepNow: { backgroundColor: color.primaryTint, borderRadius: 16, borderWidth: 2, borderColor: color.primary, shadowOpacity: 0, elevation: 0 },
  num: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: font.displayBold, fontSize: 15, color: '#5F6D74' },
  stepTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  // P4a locked step: flat grey card, lock in a grey circle, no chevron.
  stepLocked: { backgroundColor: '#EEF1F4', shadowOpacity: 0, elevation: 0 },
  skip: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary, textDecorationLine: 'underline', textAlign: 'center', marginTop: 2 },
  // P4e Finish setting up card.
  finish: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 14, paddingHorizontal: 16, gap: 10, ...cardShadow },
  dashed: { paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: color.lineStrong, borderStyle: 'dashed' },
  // P4
  liveCard: { backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden', ...cardShadow },
  liveTop: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  liveTitle: { fontFamily: font.displayBold, fontSize: 17, color: color.ink },
  onShift: { position: 'absolute', top: 10, left: 10, height: 28, paddingHorizontal: 10, borderRadius: 999, backgroundColor: color.okTint, flexDirection: 'row', alignItems: 'center', gap: 6 },
  onTrip: { height: 32, paddingHorizontal: 12, backgroundColor: color.primaryTint, borderWidth: 1, borderColor: '#FFFFFF' },
  greenDot8: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.ok },
  planCard: { gap: 10, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  track: { height: 6, borderRadius: 3, backgroundColor: color.muted, overflow: 'hidden' },
  trackFill: { height: 6, backgroundColor: color.ok },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: color.divider },
  // P4c
  blue: { gap: 12, padding: 16, backgroundColor: color.primary, borderRadius: 20 },
  blueSmall: { fontFamily: font.body, fontSize: 13, color: '#FFFFFF', opacity: 0.85 },
  // P4c "On my way" line, used for the late notice.
  onWay: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 12 },
  onWayText: { fontFamily: font.body, fontSize: 14, lineHeight: 19, color: '#FFFFFF', flexShrink: 1 },
  askLink: { fontFamily: font.bodySemi, fontSize: 14, color: color.primary, textDecorationLine: 'underline', textAlign: 'center' },
  blueBig: { fontFamily: font.display, fontSize: 40, color: '#FFFFFF', marginVertical: -10.04 },
  note: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 12 },
  noteText: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.primaryStrong },
  planItem: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  avoid: { gap: 2, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: color.badTint, borderRadius: 12 },
  // P4n: amber (warn) card, white pill buttons.
  lateCard: { gap: 12, padding: 16, backgroundColor: color.warnTint, borderRadius: 20 },
  lateTitle: { fontFamily: font.displayBold, fontSize: 19, color: color.ink, marginVertical: -3.72 },
  lateSub: { fontFamily: font.bodySemi, fontSize: 14, color: color.warnInk, marginTop: 2 },
  lateSaid: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 12 },
  lateSaidText: { fontFamily: font.body, fontSize: 14, lineHeight: 19, color: color.warnInk, flexShrink: 1 },
  lateBtn: { flexGrow: 1, flexBasis: 0, height: 48, borderRadius: 999, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  lateBtnText: { fontFamily: font.displayBold, fontSize: 16, color: color.warnInk },
  // P4d
  endCard: { gap: 14, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  endTitle: { fontFamily: font.displayBold, fontSize: 19, color: color.ink, marginVertical: -3.72 },
  statsBox: { flexDirection: 'row', gap: 4, paddingVertical: 10, paddingHorizontal: 4, backgroundColor: color.canvas, borderRadius: 14 },
  primaryBtn: { height: 50, borderRadius: 999, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontFamily: font.displayBold, fontSize: 17, color: color.primary },
  comingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  pill: { height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: color.okTint, flexDirection: 'row', alignItems: 'center', gap: 6 },
  pillText: { fontFamily: font.bodyBold, fontSize: 12, color: color.okInk },
  // P4b
  nextCard: { gap: 10, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  nowCard: { gap: 10, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 2, borderColor: color.ok, ...cardShadow },
  nowFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: '#EEF1F4', paddingTop: 10 },
  nowLink: { fontFamily: font.bodyBold, fontSize: 14, color: color.primary },
  when: { fontFamily: font.display, fontSize: 20, color: color.ink, marginVertical: -4.02 },
  // Room above and below each kid so long food/allergy lines never touch the divider or the card edge.
  kidRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 12 },
});
