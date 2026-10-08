import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { CalendarHeader, DayCalendar, DayShiftCard, HeaderButton, MonthCalendar, MonthLegend, WeekCalendar, statusPill } from '@/components/calendar';
import { ErrorText, Screen } from '@/components/ui';
import { availabilityApi, namesLabel, shiftDayDetails } from '@/lib/availability';
import { type CalendarView, addDays, addMonths, dayKey, dayTitle, formatHours, hoursOf, monthTitle, sameDay, shiftsInMonth, shiftsOn, weekOf, weekTitle } from '@/lib/calendar-logic';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { useSession } from '@/lib/session';
import { useCanManage } from '@/lib/use-family-role';
import { color } from '@/theme';

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// Wireframes P6a (Day), P6b (Week, the default) and P6c (Month). The switch keeps the selected date; tapping a day in
// Month opens it in Day. Left out until built: requests ("Waiting" pills and legend), the Trip / Food tags on task
// lines, the "· soccer 4:30" next-task part of the week sub-line, and opening P6 with the tapped date filled in.
// A family helper (P6bh) sees the same calendar without Book: no header button, no "+ Book a sitter" slot in Day, and
// an empty Week day doesn't open the booking form ("No sitter" stays as a label).
export default function Calendar() {
  const { family } = useSession();
  const manage = useCanManage();
  const fid = family!.id;
  const [view, setView] = useState<CalendarView>('week');
  const [day, setDay] = useState(() => new Date());
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const { data, error } = useQuery(async () => {
    // family_sitter_time_off arrives with migration 12; until it's run the calendar simply shows no time off.
    const [shifts, sitters, kids, away] = await Promise.all([api.familyShifts(fid), api.familySitters(fid), api.kids(fid), availabilityApi.familyTimeOff(fid).catch(() => [])]);
    return { shifts, sitters, kids, away };
  }, [fid]);
  const shifts = data?.shifts ?? [];
  const away = data?.away ?? [];
  const dayIds = shiftsOn(shifts, day).map((s) => s.id);
  const { data: details } = useQuery(() => shiftDayDetails(view === 'day' ? dayIds : []), [view, dayIds]);

  const who = (id: string) => firstName(data?.sitters.find((x) => x.sitter_id === id)?.profile?.full_name);
  const kidNames = namesLabel((data?.kids ?? []).map((k) => k.name));
  const book = () => router.push('/parent/shift/new');

  const days = weekOf(day);
  const inWeek = shifts.filter((s) => s.status !== 'cancelled' && days.some((d) => sameDay(d, new Date(s.starts_at))));
  const inMonth = shiftsInMonth(shifts, day);
  const nav =
    view === 'day'
      ? dayTitle(day, now)
      : view === 'week'
        ? { title: weekTitle(days), sub: `${days.some((d) => sameDay(d, now)) ? 'This week' : 'Week'} · ${plural(inWeek.length, 'shift')} booked` }
        : { title: monthTitle(day), sub: `${plural(inMonth.length, 'shift')} booked · ${plural(Number(formatHours(hoursOf(inMonth))), 'hour')}` };
  const move = (n: number) => setDay(view === 'day' ? addDays(day, n) : view === 'week' ? addDays(day, 7 * n) : addMonths(day, n));

  // P6c legend: "Maya away" for each sitter with time off this month (no reason is ever shown).
  const first = dayKey(new Date(day.getFullYear(), day.getMonth(), 1));
  const last = dayKey(new Date(day.getFullYear(), day.getMonth() + 1, 0));
  const awayNames = [...new Set(away.filter((r) => r.starts <= last && r.ends >= first).map((r) => r.sitter_id))].map((id) => `${who(id)} away`);

  return (
    <Screen
      gap={view === 'week' ? 8 : 10}
      header={<CalendarHeader right={manage ? <HeaderButton label="Book" onPress={book} /> : <View style={{ height: 40 }} />} view={view} onView={setView} title={nav.title} sub={nav.sub} unit={view} onPrev={() => move(-1)} onNext={() => move(1)} />}>
      <ErrorText>{error}</ErrorText>

      {view === 'day' && (
        <View style={{ paddingTop: 6 }}>
          <DayCalendar
            day={day}
            shifts={shifts}
            now={now}
            hourH={56}
            look={() => ({ bg: color.primaryTint, border: color.primary, borderWidth: 2, subInk: color.primaryStrong, dot: color.primary })}
            title={(s) => who(s.sitter_id)}
            sub={(s) => namesLabel(details?.kids[s.id] ?? [])}
            pill={statusPill}
            tasks={details?.tasks}
            onOpen={(s) => router.push(`/parent/shift/${s.id}`)}
            book={manage ? (slot) => ({ label: sameDay(day, now) && slot.from >= 17 ? '+ Book a sitter for tonight' : '+ Book a sitter', onPress: book }) : undefined}
          />
        </View>
      )}

      {view === 'week' && (
        <WeekCalendar
          shifts={shifts}
          day={day}
          onSelect={setDay}
          title={(s) => who(s.sitter_id)}
          sub={(s) => (s.status === 'completed' ? 'Report ready' : s.status === 'active' ? kidNames : '')}
          onOpen={(s) => router.push(`/parent/shift/${s.id}`)}
          emptyText="No sitter"
          onEmpty={manage ? book : undefined}
        />
      )}

      {view === 'month' && (
        <>
          <MonthCalendar
            variant="parent"
            day={day}
            today={now}
            shifts={shifts}
            off={away}
            dots={(list) => (list.length ? [color.primary] : [])}
            onOpenDay={(d) => {
              setDay(d);
              setView('day');
            }}
          />
          <MonthLegend items={[{ color: color.primary, label: 'Booked' }]} offLabel={awayNames} />
          {shiftsOn(shifts, day).map((s) => (
            <DayShiftCard key={s.id} shift={s} title={who(s.sitter_id)} pill={statusPill(s)} onPress={() => router.push(`/parent/shift/${s.id}`)} />
          ))}
        </>
      )}
    </Screen>
  );
}
