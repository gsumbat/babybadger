import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { shortName } from '@/components/addChild';
import { AVATAR, backOr, Initial, PillButton, RequestHeader } from '@/components/poolRequest';
import { Text, TextInput } from '@/components/Text';
import { ErrorText, Icon, Screen } from '@/components/ui';
import { useRequirePlan } from '@/lib/billing';
import { useQuery } from '@/lib/data';
import { defaultHomeFor, homesOf, mainHome, placesApi } from '@/lib/places';
import { poolData, statusFor, tonightWindow, windowLabel, type TimeWindow } from '@/lib/pool';
import { askable, askRowSub, EXPIRY_HOURS, hiddenNote, requestsApi, requestWindow, sendLabel, type ExpiryHours } from '@/lib/pool-requests';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';

// Wireframe P45 Ask your pool, from app/src/wireframes/P45.tsx. Opened from P42's "Ask Maya" / "Ask both free sitters"
// and P43's "Ask for Saturday evening" (?start=ISO&end=ISO, P42 adds &pick=<the free sitters its filters show>). SEND TO lists the family's signed sitters who are free
// (ticked) or partly free (not ticked, "Only free until 9:00 PM") for the window, from lib/pool-logic; the rest are
// hidden ("2 sitters who aren't free are hidden."). "First to accept gets it" (on) books the first yes; off, every yes
// goes to the parent to pick on P46. "Request expires in" 2 / 12 / 24 hours (never after the shift starts). The note
// goes to the sitters. "Send to N sitters" -> P46. Kids: every kid in the family (each sitter only gets the kids her
// invite covers); home: like booking (the home for that day when the kids live in two homes).
// With ?request=<id> (P46 "Ask more sitters", canvas P45b): only sitters not asked yet; the request's rules and note
// stay as they were, so the switch, expiry and note are left out.
export default function PoolAsk() {
  useRequirePlan();
  const params = useLocalSearchParams<{ start?: string; end?: string; request?: string; pick?: string }>();
  const { family } = useSession();
  const fid = family!.id;

  const { data, error } = useQuery(async () => {
    const [pool, places, existing] = await Promise.all([poolData(fid), placesApi.list(fid).catch(() => []), params.request ? requestsApi.get(params.request) : Promise.resolve(null)]);
    return { ...pool, places, existing };
  }, [fid, params.request]);

  const existing = data?.existing?.request;
  const win: TimeWindow = useMemo(() => {
    if (existing) return requestWindow(existing);
    const start = params.start ? new Date(params.start) : null;
    const end = params.end ? new Date(params.end) : null;
    return start && end && !isNaN(+start) && !isNaN(+end) && +end > +start ? { start, end } : tonightWindow();
  }, [params.start, params.end, existing]);
  const more = !!params.request;

  const rows = useMemo(() => {
    if (!data) return [];
    const asked = new Set((data.existing?.asked ?? []).map((a) => a.sitter_id));
    return data.sitters
      .filter((s) => s.status === 'active' && !asked.has(s.sitter_id))
      .map((s) => {
        const status = statusFor(data, s.sitter_id, win);
        return { id: s.sitter_id, name: s.profile?.full_name || 'Sitter', color: AVATAR[data.sitters.indexOf(s) % AVATAR.length], kind: askable(status), sub: askRowSub(status, win) };
      });
  }, [data, win]);
  const shown = rows.filter((r) => r.kind);
  const hidden = rows.length - shown.length;

  const [picked, setPicked] = useState<string[] | null>(null);
  // Ticked at first: the free sitters (P42 passes the ones its filters show as ?pick=id,id).
  const first0 = params.pick ? params.pick.split(',') : null;
  const chosen = picked ?? shown.filter((r) => r.kind === 'free' && (!first0 || first0.includes(r.id))).map((r) => r.id);
  const toggle = (id: string) => setPicked(chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id]);
  const [first, setFirst] = useState(true);
  const [hours, setHours] = useState<ExpiryHours>(12);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function send() {
    if (!chosen.length) return;
    setBusy(true);
    setErr('');
    try {
      if (more && params.request) {
        await requestsApi.addSitters(params.request, chosen);
        router.back();
        return;
      }
      // Same home rule as booking (shift/new): only another home is sent; null is the main home.
      const homes = homesOf(data?.places ?? []);
      const main = mainHome(data?.places ?? []);
      const home = homes.length > 1 ? defaultHomeFor(homes, win.start) : undefined;
      const id = await requestsApi.create({ familyId: fid, start: win.start, end: win.end, sitterIds: chosen, kidIds: [], note, firstToAccept: first, hours, placeId: home && home.id !== main?.id ? home.id : null });
      router.replace({ pathname: '/parent/request/[id]', params: { id } });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      gap={12}
      header={<RequestHeader title={more ? 'Ask more sitters' : 'Ask your pool'} sub={windowLabel(win)} back={backOr('/parent/sitters')} />}
      footer={
        <View style={{ gap: 8 }}>
          <Text style={st.hint}>Sitters see the time, kids and your note. Not who else was asked.</Text>
          <View style={{ flexDirection: 'row' }}>
            <PillButton label={sendLabel(chosen.length)} icon="send" onPress={send} busy={busy} disabled={!chosen.length} />
          </View>
        </View>
      }>
      <ErrorText>{error || err}</ErrorText>

      <Text style={st.label}>SEND TO</Text>
      {shown.length ? (
        <View style={st.card}>
          {shown.map((r, i) => {
            const on = chosen.includes(r.id);
            return (
              <Pressable key={r.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => toggle(r.id)} style={[st.row, i < shown.length - 1 && st.line]}>
                <View style={[st.box, on ? st.boxOn : st.boxOff]}>{on ? <Icon name="check" size={18} tint="#FFFFFF" strokeWidth={2.6} /> : null}</View>
                <Initial name={r.name} bg={r.color} size={36} />
                <View style={{ flexGrow: 1, flexShrink: 1 }}>
                  <Text style={st.name}>{shortName(r.name)}</Text>
                  <Text style={st.sub}>{r.sub}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : data ? (
        <Text style={st.sub}>{more ? 'Everyone in your pool who is free then was already asked.' : 'No one in your pool is free then.'}</Text>
      ) : null}
      {hidden ? <Text style={[st.sub, { marginTop: -4 }]}>{hiddenNote(hidden)}</Text> : null}

      {!more && (
        <>
          <View style={st.card}>
            <Pressable accessibilityRole="switch" accessibilityState={{ checked: first }} onPress={() => setFirst(!first)} style={[st.switchRow, st.line]}>
              <Icon name="zap" size={22} />
              <View style={{ flexGrow: 1, flexShrink: 1 }}>
                <Text style={st.name}>First to accept gets it</Text>
                <Text style={st.sub}>{first ? 'Everyone else is told it’s filled' : 'You pick from who says yes'}</Text>
              </View>
              <View style={[st.switch, { backgroundColor: first ? color.primary : color.lineStrong }]}>
                <View style={[st.knob, first ? { right: 3 } : { left: 3 }]} />
              </View>
            </Pressable>
            <View style={{ gap: 8, paddingTop: 12, paddingBottom: 14 }}>
              <Text style={st.name}>Request expires in</Text>
              <View style={st.seg}>
                {EXPIRY_HOURS.map((h) => {
                  const on = h === hours;
                  return (
                    <Pressable key={h} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setHours(h)} style={[st.segItem, on && { backgroundColor: '#FFFFFF' }]}>
                      <Text style={on ? st.segOn : st.segOff}>{h} hours</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={st.fieldLabel}>Note for sitters</Text>
            <TextInput value={note} onChangeText={setNote} placeholder="Date night. Kids in bed by 8, pizza in the fridge." placeholderTextColor={color.quiet} multiline maxLength={500} style={st.note} />
          </View>
        </>
      )}
    </Screen>
  );
}

// Values from wireframe P45.
const st = StyleSheet.create({
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  card: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  box: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  boxOn: { backgroundColor: color.primary },
  boxOff: { borderWidth: 2, borderColor: color.lineStrong },
  name: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  sub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64 },
  switch: { width: 50, height: 30, borderRadius: 15, flexShrink: 0 },
  knob: { position: 'absolute', top: 3, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF' },
  seg: { flexDirection: 'row', gap: 4, padding: 4, backgroundColor: color.muted, borderRadius: 999 },
  segItem: { flex: 1, minWidth: 0, height: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  segOn: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink },
  segOff: { fontFamily: font.bodyMedium, fontSize: 13, color: color.ink2 },
  fieldLabel: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  note: { height: 76, borderWidth: 1, borderColor: color.lineStrong, borderRadius: 16, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, fontFamily: font.body, fontSize: 15, color: color.ink, backgroundColor: '#FFFFFF', textAlignVertical: 'top' },
  hint: { fontFamily: font.body, fontSize: 13, color: color.ink2, textAlign: 'center' },
});
