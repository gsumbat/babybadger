import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { CalendarHeader, DayCalendar, HeaderButton, MonthCalendar, MonthLegend, type PillLook, WeekCalendar, statusPill } from '@/components/calendar';
import { ErrorText, Screen } from '@/components/ui';
import { availabilityApi, namesLabel, shiftDayDetails } from '@/lib/availability';
import { type CalendarView, addDays, addMonths, dayKey, dayTitle, familyColor, formatHours, hoursOf, monthTitle, sameDay, shiftsInMonth, shiftsOn, weekOf, weekTitle } from '@/lib/calendar-logic';
import { api, useQuery } from '@/lib/data';
import { timeOf } from '@/lib/format';
import { useSession } from '@/lib/session';
import { CLOCK_IN_OPENS_MIN } from '@/lib/shift-logic';
import type { Shift } from '@/lib/types';
import { color } from '@/theme';

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// Wireframes S6a (Day), S6 (Week, the default) and S6c (Month): every family has its own color, time off is hatched
// and edited in Availability (S11), and tapping a day in Week or Month opens it in Day. Left out until built: requests
// (dashed amber shifts, Answer, the Request legend and "2 requests need an answer"), travel time between families,
// the [RATE]/hr part of the Day sub-line, Trip / Food tags, "Earned today" / "Hours and pay" and "October so far · Pay".
export default function SitterCalendar() {
  const { session, sitterLinks } = useSession();
  const uid = session!.user.id;
  const [view, setView] = useState<CalendarView>('week');
  const [day, setDay] = useState(() => new Date());
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const { data, error } = useQuery(async () => {
    // sitter_time_off arrives with migration 12; until it's run there is simply no time off to show.
    const [shifts, off] = await Promise.all([api.sitterShifts(uid), availabilityApi.myTimeOff(uid).catch(() => [])]);
    return { shifts, off };
  }, [uid]);
  const shifts = data?.shifts ?? [];
  const off = data?.off ?? [];
  const dayIds = shiftsOn(shifts, day).map((s) => s.id);
  const { data: details } = useQuery(() => shiftDayDetails(view === 'day' ? dayIds : []), [view, dayIds]);

  // "The Lee family" -> "Lee", as in the wireframe's "Lee · 3–7 PM".
  const fam = (fid: string) => (sitterLinks.find((l) => l.family_id === fid)?.family.name ?? 'Family').replace(/^The /, '').replace(/ family$/i, '');
  const tone = (fid: string) => familyColor(sitterLinks, fid);
  const timeOff = () => router.push('/sitter/availability');
  const openDay = (d: Date) => {
    setDay(d);
    setView('day');
  };

  const next = shifts.find((s) => s.status === 'scheduled' && +new Date(s.ends_at) > +now);
  const pill = (s: Shift): PillLook | null =>
    s.status !== 'scheduled'
      ? statusPill(s)
      : s.id === next?.id
        ? { label: 'Next', bg: color.primaryTint, fg: color.primaryStrong, dot: color.primary }
        : { label: 'Confirmed', bg: color.okTint, fg: color.okInk, dot: color.ok };

  const days = weekOf(day);
  const inWeek = shifts.filter((s) => s.status !== 'cancelled' && days.some((d) => sameDay(d, new Date(s.starts_at))));
  const inMonth = shiftsInMonth(shifts, day);
  const families = (list: Shift[]) => [...new Set(list.map((s) => s.family_id))];
  const today = dayTitle(day, now);
  const dayHours = hoursOf(shiftsOn(shifts, day));
  const nav =
    view === 'day'
      ? { title: today.title, sub: dayHours ? `${today.sub} · ${formatHours(dayHours)} hrs booked` : today.sub }
      : view === 'week'
        ? { title: weekTitle(days), sub: `${days.some((d) => sameDay(d, now)) ? 'This week' : 'Week'} · ${plural(inWeek.length, 'shift')} · ${plural(families(inWeek).length, 'family', 'families')}` }
        : { title: monthTitle(day), sub: `${plural(inMonth.length, 'shift')} · ${plural(families(inMonth).length, 'family', 'families')}` };
  const move = (n: number) => setDay(view === 'day' ? addDays(day, n) : view === 'week' ? addDays(day, 7 * n) : addMonths(day, n));

  const first = dayKey(new Date(day.getFullYear(), day.getMonth(), 1));
  const last = dayKey(new Date(day.getFullYear(), day.getMonth() + 1, 0));
  const offThisMonth = off.some((r) => r.starts <= last && r.ends >= first);

  return (
    <Screen
      gap={view === 'week' ? 7 : view === 'day' ? 10 : 8}
      header={<CalendarHeader right={<HeaderButton label="Time off" tint onPress={timeOff} />} view={view} onView={setView} title={nav.title} sub={nav.sub} unit={view} onPrev={() => move(-1)} onNext={() => move(1)} />}>
      <ErrorText>{error}</ErrorText>

      {view === 'day' && (
        <View style={{ paddingTop: 6 }}>
          <DayCalendar
            day={day}
            shifts={shifts}
            now={now}
            hourH={52}
            look={(s) => {
              const c = tone(s.family_id);
              return { bg: c.tint, border: c.dot, borderWidth: s.id === next?.id || s.status === 'active' ? 2 : 1.5, subInk: c.ink, dot: c.dot };
            }}
            title={(s) => fam(s.family_id)}
            sub={(s) => [namesLabel(details?.kids[s.id] ?? []), s.note].filter(Boolean).join(' · ')}
            pill={pill}
            tasks={details?.tasks}
            taskTimes
            note={(s) => (s.status === 'scheduled' && +new Date(s.starts_at) > +now ? `Clock-in opens ${timeOf(new Date(+new Date(s.starts_at) - CLOCK_IN_OPENS_MIN * 60_000))} at their door` : '')}
            onOpen={(s) => router.push(`/sitter/shift/${s.id}`)}
          />
        </View>
      )}

      {view === 'week' && (
        <WeekCalendar
          shifts={shifts}
          day={day}
          onSelect={openDay}
          title={(s) => fam(s.family_id)}
          onOpen={(s) => router.push(`/sitter/shift/${s.id}`)}
          emptyText="Free"
          offDays={off}
          offText="Time off · all day"
          onOff={timeOff}
        />
      )}

      {view === 'month' && (
        <>
          <MonthCalendar variant="sitter" day={day} today={now} shifts={shifts} off={off} dots={(list) => families(list).map((f) => tone(f).dot)} onOpenDay={openDay} />
          <MonthLegend sitter items={families(inMonth).map((f) => ({ color: tone(f).dot, label: fam(f) }))} offLabel={offThisMonth ? ['Off'] : []} />
        </>
      )}
    </Screen>
  );
}
