import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { IncidentCard } from '@/components/IncidentCard';
import { LOG_ICON } from '@/components/LogTimeline';
import { Text } from '@/components/Text';
import { ErrorText, Icon, Loading, Screen } from '@/components/ui';
import { alertShift, type AlertRow, buildAlerts } from '@/lib/alerts-logic';
import { api, useQuery, useShiftLive } from '@/lib/data';
import { firstName } from '@/lib/format';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { offPlanCards, type TripAlert, tripAlertRows, tripsApi, useShiftAlerts } from '@/lib/trips';
import { cardShadow, color, font } from '@/theme';

// Wireframe P9 "Alerts", translated from its HTML (app/src/wireframes/P9.tsx). Opened by tapping an incident push.
// Shows today's live (or latest) shift: incidents and open off-plan alerts as red cards on top, everything else
// under EARLIER TODAY, including trip and zone rows from migration 17 ("Arrived at soccer", "Trip started to
// soccer"; a tap opens the trip, P8). Off-plan "See on map" opens the live shift (P8 needs a trip).
// Left out until built: "Call Maya" (no phone number stored). Not drawn: the rows for a "Somewhere else" trip
// request and a request to clock in away from home (a tap asks Not now / Yes).
const clockSvg = (stroke: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`;
const FORK = '<svg viewBox="0 0 24 24" fill="none" stroke="#1B2328" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 21V3c-2.5 1-3.5 3.5-3.5 7.5h3.5"/></svg>';

const PIN = (stroke: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/></svg>`;
const CAR = '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16v-3.5L6 7h12l2 5.5V16z"/></svg>';
const TRIANGLE = '<svg viewBox="0 0 24 24" fill="none" stroke="#C2412D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17h0"/></svg>';
const TRIP_ICON: Partial<Record<AlertRow['icon'], { bg: string; xml: string }>> = {
  arrived: { bg: color.okTint, xml: PIN(color.ok) },
  trip: { bg: color.primaryTint, xml: CAR },
  away: { bg: color.primaryTint, xml: PIN(color.primary) },
  offplan: { bg: color.badTint, xml: TRIANGLE },
};

function RowIcon({ icon }: { icon: AlertRow['icon'] }) {
  const trip = TRIP_ICON[icon];
  if (trip) {
    return (
      <View style={[st.circle, { backgroundColor: trip.bg }]}>
        <SvgXml xml={trip.xml} width={18} height={18} style={{ flexShrink: 0 }} />
      </View>
    );
  }
  if (icon === 'clock' || icon === 'late' || icon === 'food') {
    const bg = icon === 'clock' ? color.okTint : icon === 'late' ? color.warnTint : color.accentTint;
    const xml = icon === 'food' ? FORK : clockSvg(icon === 'clock' ? color.ok : color.warn);
    return (
      <View style={[st.circle, { backgroundColor: bg }]}>
        <SvgXml xml={xml} width={18} height={18} style={{ flexShrink: 0 }} />
      </View>
    );
  }
  const ic = LOG_ICON[icon as keyof typeof LOG_ICON] ?? LOG_ICON.note;
  return (
    <View style={[st.circle, { backgroundColor: ic.bg }]}>
      <Icon name={ic.icon} size={18} tint={ic.fg} />
    </View>
  );
}

export default function Alerts() {
  const { family } = useSession();
  const fid = family?.id;
  const { data: shifts, error } = useQuery(() => (fid ? api.familyShifts(fid) : Promise.resolve([])), [fid]);
  const shift = shifts ? alertShift(shifts) : null;
  const { bundle } = useShiftLive(shift?.id);
  const { alerts, reload: reloadAlerts } = useShiftAlerts(shift?.id);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/parent'));

  if (!shifts) return error ? <Screen title="Alerts" back onBack={back}><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const live = bundle && bundle.shift.id === shift?.id ? bundle : null;
  const sitter = firstName(live?.sitter?.full_name);
  const built = live ? buildAlerts(live.shift, live.logs, live.kids, sitter) : { incidents: [], rows: [] };
  const incidents = built.incidents;
  const offPlan = live ? offPlanCards(alerts) : [];
  const rows: (AlertRow & { href?: string; alert?: TripAlert })[] = [...built.rows, ...(live ? tripAlertRows(alerts, sitter) : [])].sort((a, b) => b.at.localeCompare(a.at));

  async function dismiss(id: string) {
    try {
      await tripsApi.dismiss(id);
      reloadAlerts();
    } catch (e) {
      Alert.alert('Couldn’t dismiss', errorText(e));
    }
  }

  // A "start somewhere else" request (S22): Not now / Yes, while it's still open.
  async function answerAway(a: TripAlert) {
    const req = a.data?.request_id ? await tripsApi.awayRequestById(a.data.request_id) : null;
    if (!req || req.status !== 'pending') return Alert.alert(req?.status === 'approved' ? 'You said yes' : req ? 'You said no' : 'Request not found');
    const go = (ok: boolean) => tripsApi.answerAway(req.id, ok).catch((e) => Alert.alert('Couldn’t answer', errorText(e)));
    Alert.alert(`Let ${sitter} clock in where she is?`, a.data?.note || 'Starting somewhere else, like school pickup.', [
      { text: 'Not now', style: 'cancel', onPress: () => go(false) },
      { text: 'Yes', onPress: () => go(true) },
    ]);
  }
  const onRow = (r: (typeof rows)[number]) => (r.alert?.kind === 'clockin_away' ? () => answerAway(r.alert!) : r.href ? () => router.push(r.href as never) : undefined);

  return (
    <Screen title="Alerts" back onBack={back} gap={12}>
      {incidents.map((c) => (
        <IncidentCard key={c.id} card={c} action="See report" onAction={() => router.push(`/parent/shift/${c.shiftId}`)} />
      ))}
      {offPlan.map((c) => (
        <IncidentCard key={c.id} card={c} action="See on map" right onAction={() => router.push(`/parent/shift/${c.shiftId}`)} onDismiss={() => dismiss(c.id)} />
      ))}
      <Text style={[st.section, incidents.length + offPlan.length > 0 && { marginTop: 6 }]}>EARLIER TODAY</Text>
      {rows.length ? (
        <View style={st.list}>
          {rows.map((r, i) => (
            <Pressable key={r.id} disabled={!onRow(r)} onPress={onRow(r)} style={[st.row, i < rows.length - 1 && st.rowLine]}>
              <RowIcon icon={r.icon} />
              <View style={{ flexGrow: 1, flexShrink: 1 }}>
                <Text style={st.rowTitle}>{r.title}</Text>
                {r.sub ? <Text style={st.rowSub}>{r.sub}</Text> : null}
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={st.rowSub}>Nothing yet today.</Text>
      )}
      <Pressable accessibilityRole="link" onPress={() => router.navigate('/parent/settings')} style={{ alignSelf: 'center', padding: 10 }}>
        <Text style={st.link}>Choose which alerts you get</Text>
      </Pressable>
    </Screen>
  );
}

// values below come from wireframe P9
const st = StyleSheet.create({
  section: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  list: { backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: color.divider },
  circle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  rowSub: { fontFamily: font.body, fontSize: 13, color: '#5F6D74' },
  link: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary, textDecorationLine: 'underline' },
});
