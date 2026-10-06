import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { LOG_ICON } from '@/components/LogTimeline';
import { Text } from '@/components/Text';
import { ErrorText, Icon, Loading, Screen } from '@/components/ui';
import { alertShift, type AlertRow, buildAlerts } from '@/lib/alerts-logic';
import { api, useQuery, useShiftLive } from '@/lib/data';
import { firstName } from '@/lib/format';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';

// Wireframe P9 "Alerts", translated from its HTML (app/src/wireframes/P9.tsx). Opened by tapping an incident push.
// Shows today's live (or latest) shift: incidents as the top red card, everything else under EARLIER TODAY.
// Left out until built: off-plan location card, trip and arrival rows, "Call Maya" (no phone number stored),
// "See on map" and "This is expected, dismiss" (off-plan only).
const TRIANGLE = '<svg viewBox="0 0 24 24" fill="none" stroke="#C2412D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17h0"/></svg>';
const clockSvg = (stroke: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`;
const FORK = '<svg viewBox="0 0 24 24" fill="none" stroke="#1B2328" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 21V3c-2.5 1-3.5 3.5-3.5 7.5h3.5"/></svg>';

function RowIcon({ icon }: { icon: AlertRow['icon'] }) {
  if (icon === 'clock' || icon === 'late' || icon === 'food') {
    const bg = icon === 'clock' ? color.okTint : icon === 'late' ? color.warnTint : color.accentTint;
    const xml = icon === 'food' ? FORK : clockSvg(icon === 'clock' ? color.ok : color.warn);
    return (
      <View style={[st.circle, { backgroundColor: bg }]}>
        <SvgXml xml={xml} width={18} height={18} style={{ flexShrink: 0 }} />
      </View>
    );
  }
  const ic = LOG_ICON[icon] ?? LOG_ICON.note;
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
  const back = () => (router.canGoBack() ? router.back() : router.replace('/parent'));

  if (!shifts) return error ? <Screen title="Alerts" back onBack={back}><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const live = bundle && bundle.shift.id === shift?.id ? bundle : null;
  const { incidents, rows } = live ? buildAlerts(live.shift, live.logs, live.kids, firstName(live.sitter?.full_name)) : { incidents: [], rows: [] };

  return (
    <Screen title="Alerts" back onBack={back} gap={12}>
      {incidents.map((c) => (
        <View key={c.id} style={st.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <SvgXml xml={TRIANGLE} width={22} height={22} style={{ flexShrink: 0 }} />
            <Text style={st.cardTitle}>{c.title}</Text>
            <Text style={st.cardTime}>{c.time}</Text>
          </View>
          <Text style={st.cardBody}>{c.body}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable accessibilityRole="button" onPress={() => router.push(`/parent/shift/${c.shiftId}`)} style={st.cardBtn}>
              <Text style={st.cardBtnText}>See report</Text>
            </Pressable>
            {/* "Call Maya" needs her phone number (not stored yet): its slot stays empty so the button keeps its width. */}
            <View style={{ flexGrow: 1, flexBasis: 0 }} />
          </View>
        </View>
      ))}
      <Text style={[st.section, incidents.length > 0 && { marginTop: 6 }]}>EARLIER TODAY</Text>
      {rows.length ? (
        <View style={st.list}>
          {rows.map((r, i) => (
            <View key={r.id} style={[st.row, i < rows.length - 1 && st.rowLine]}>
              <RowIcon icon={r.icon} />
              <View style={{ flexGrow: 1, flexShrink: 1 }}>
                <Text style={st.rowTitle}>{r.title}</Text>
                {r.sub ? <Text style={st.rowSub}>{r.sub}</Text> : null}
              </View>
            </View>
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
  card: { backgroundColor: color.badTint, borderRadius: 16, padding: 16, gap: 10 },
  cardTitle: { fontFamily: font.bodyBold, fontSize: 16, color: color.badInk, flexShrink: 1 },
  cardTime: { fontFamily: font.body, fontSize: 13, color: '#6E2215', marginLeft: 'auto' },
  cardBody: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: '#6E2215' },
  cardBtn: { height: 44, flexGrow: 1, flexBasis: 0, borderRadius: 999, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  cardBtnText: { fontFamily: font.displayBold, fontSize: 15, color: color.ink },
  section: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  list: { backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: color.divider },
  circle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  rowSub: { fontFamily: font.body, fontSize: 13, color: '#5F6D74' },
  link: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary, textDecorationLine: 'underline' },
});
