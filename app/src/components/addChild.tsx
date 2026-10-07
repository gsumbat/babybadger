// The end of "Add a child" (parent/kid/new): wireframes P21 ChildSitters and P22 ChildAdded, translated from
// app/src/wireframes/P21.tsx and P22.tsx.
// P21 left out until built: the "Mia is under 2 … Review requirements" card (requirements, P28–P32) and "Maya must
// accept" on the booked-shifts row (shifts have no accept step). Not drawn: a sitter who hasn't signed yet ("Hasn't
// signed yet"; she can't be told until she signs), several sitters ("Tell Maya and Priya about Mia", "They get a
// short summary now"), the booked-shifts row is hidden when there are none.
// P22 left out: "Sunshine Daycare saved as a place" (places aren't part of this flow); Done closes the flow instead of
// opening P13 (not built). Not drawn: the "Added to 3 booked shifts" line, "Maya can see Mia" when she wasn't told.
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Button, ErrorText, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { monthYear, namesList, seesKid, setupApi, type SitterAccess } from '@/lib/family-setup';
import { firstName } from '@/lib/format';
import { requirementStatus } from '@/lib/requirements';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

/** What P21 set up, for P22's checklist. */
export type AddedSummary = { kidId: string; told: string[]; sees: string[]; shifts: number };

// Avatar colors of the sitters, in order (P54 / P27).
export const SITTER_COLORS = [color.primary, '#5E7F6A', '#8A6A4E', '#6F6194', '#5F6D74'];

const CHECK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#1F8A4D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

function Switch({ on }: { on: boolean }) {
  return (
    <View style={[st.track, { backgroundColor: on ? color.primary : color.lineStrong }]}>
      <View style={[st.knob, on ? { right: 3 } : { left: 3 }]} />
    </View>
  );
}

// ---------------------------------------------------------------- P21
export function ChildSitters({
  header,
  kidId,
  name,
  sitters,
  onDone,
}: {
  header: ReactNode;
  kidId: string;
  name: string;
  sitters: SitterAccess[];
  onDone: (s: AddedSummary) => void;
}) {
  const { family } = useSession();
  const fid = family!.id;
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(sitters.map((s) => [s.sitter_id, true])));
  const [tell, setTell] = useState(true);
  const [addShifts, setAddShifts] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const ids = sitters.map((s) => s.sitter_id);
  const { data } = useQuery(async () => {
    const [shifts, reqs] = await Promise.all([
      setupApi.upcomingShifts(fid, ids).catch(() => []),
      Promise.all(ids.map((id) => requirementStatus(fid, id).catch(() => null))),
    ]);
    return { shifts, reqs: Object.fromEntries(ids.map((id, i) => [id, reqs[i]])) };
  }, [fid, ids.join()]);

  const onIds = ids.filter((id) => on[id]);
  const named = (s: SitterAccess) => firstName(s.profile?.full_name);
  const canTell = sitters.filter((s) => on[s.sitter_id] && s.status === 'active');
  const upcoming = (data?.shifts ?? []).filter((sh) => onIds.includes(sh.sitter_id));

  async function finish() {
    setBusy(true);
    setErr('');
    try {
      for (const s of sitters) {
        const want = !!on[s.sitter_id];
        if (want !== seesKid(s.kid_ids, kidId)) await setupApi.setSitterKid(kidId, s.sitter_id, want);
      }
      let told: string[] = [];
      if (tell && canTell.length) {
        await setupApi.tellSitters(
          kidId,
          canTell.map((s) => s.sitter_id),
        );
        told = canTell.map(named);
      }
      if (addShifts && upcoming.length)
        await setupApi.addKidToShifts(
          kidId,
          upcoming.map((sh) => sh.id),
        );
      onDone({ kidId, told, sees: sitters.filter((s) => on[s.sitter_id]).map(named), shifts: addShifts ? upcoming.length : 0 });
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  const tellNames = namesList(canTell.map(named));
  return (
    <Screen header={header} gap={12} footer={<Button label={`Add ${name}`} onPress={finish} busy={busy} />}>
      <View style={{ gap: 4 }}>
        <Text style={st.title}>Who looks after {name}?</Text>
        <Text style={st.lead}>Sitters you turn on see {name}’s info and care plan during their shifts.</Text>
      </View>
      <View style={st.sitterCard}>
        {sitters.map((s, i) => {
          const req = data?.reqs[s.sitter_id];
          const value = !!on[s.sitter_id];
          return (
            <Pressable
              key={s.sitter_id}
              accessibilityRole="switch"
              accessibilityState={{ checked: value }}
              accessibilityLabel={named(s)}
              onPress={() => setOn((cur) => ({ ...cur, [s.sitter_id]: !value }))}
              style={[st.sitterRow, i < sitters.length - 1 && st.line]}>
              <View style={[st.avatar, { backgroundColor: SITTER_COLORS[i % SITTER_COLORS.length] }]}>
                <Text style={st.avatarText}>{(s.profile?.full_name || '?')[0].toUpperCase()}</Text>
              </View>
              <View style={{ flexGrow: 1, flexShrink: 1 }}>
                <Text style={st.sitterName}>{shortName(s.profile?.full_name)}</Text>
                <Text style={st.sub13}>{s.status === 'active' ? `Your sitter since ${monthYear(s.joined_at)}` : 'Hasn’t signed yet'}</Text>
                {req && req.total > 0 && req.allMet ? (
                  <View style={{ marginTop: 4 }}>
                    <View style={st.okPill}>
                      <View style={st.okDot} />
                      <Text style={st.okPillText}>Meets all requirements</Text>
                    </View>
                  </View>
                ) : null}
              </View>
              <Switch on={value} />
            </Pressable>
          );
        })}
      </View>
      {canTell.length ? (
        <Pressable accessibilityRole="switch" accessibilityState={{ checked: tell }} onPress={() => setTell(!tell)} style={st.optCard}>
          <View style={{ flexShrink: 1 }}>
            <Text style={st.optTitle}>
              Tell {tellNames} about {name}
            </Text>
            <Text style={st.sub13}>{canTell.length === 1 ? 'She gets a short summary now' : 'They get a short summary now'}</Text>
          </View>
          <Switch on={tell} />
        </Pressable>
      ) : null}
      {upcoming.length ? (
        <Pressable accessibilityRole="switch" accessibilityState={{ checked: addShifts }} onPress={() => setAddShifts(!addShifts)} style={st.optCard}>
          <View style={{ flexShrink: 1 }}>
            <Text style={st.optTitle}>Add {name} to booked shifts</Text>
            <Text style={st.sub13}>{upcoming.length} upcoming</Text>
          </View>
          <Switch on={addShifts} />
        </Pressable>
      ) : null}
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

/** "Maya Rodriguez" -> "Maya R." (P21, P27). */
export function shortName(full?: string | null) {
  const parts = (full || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'Sitter';
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0];
}

// ---------------------------------------------------------------- P22
export function ChildAdded({ name, summary }: { name: string; summary: AddedSummary }) {
  const { family } = useSession();
  const { data } = useQuery(async () => {
    const [kids, care] = await Promise.all([api.kids(family!.id), api.kidCareItems(summary.kidId).catch(() => [])]);
    return { kids, care: care.length, kid: kids.find((k) => k.id === summary.kidId) };
  }, [family!.id, summary.kidId]);
  const others = (data?.kids ?? []).filter((k) => k.id !== summary.kidId).map((k) => k.name);
  const lines = [
    data?.care ? `${data.care} ${data.care === 1 ? 'task' : 'tasks'} added to the care plan` : '',
    data?.kid?.avoid_foods ? 'Food to avoid shows on every shift' : '',
    summary.told.length
      ? `${namesList(summary.told)} ${summary.told.length === 1 ? 'was' : 'were'} told and can see ${name}`
      : summary.sees.length
        ? `${namesList(summary.sees)} can see ${name}`
        : '',
    summary.shifts ? `Added to ${summary.shifts} booked ${summary.shifts === 1 ? 'shift' : 'shifts'}` : '',
  ].filter(Boolean);

  return (
    <Screen
      gap={18}
      footer={
        <View style={{ gap: 18 }}>
          <Button label="Done" onPress={() => router.back()} />
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              router.back();
              router.push('/parent/care');
            }}
            style={st.tonalBtn}>
            <Text style={st.tonalText}>Review {name}’s care plan</Text>
          </Pressable>
        </View>
      }>
      <View style={st.hero}>
        <Image source={require('@/assets/images/badger-teddy.png')} style={{ width: 136, height: 170 }} contentFit="contain" />
        <Text style={st.welcome}>Welcome, {name}!</Text>
        <Text style={[st.lead, { textAlign: 'center' }]}>{namesList([...others, name])} {others.length ? 'are' : 'is'} all set.</Text>
      </View>
      {lines.length ? (
        <View style={st.checkCard}>
          {lines.map((l) => (
            <View key={l} style={st.checkRow}>
              <SvgXml xml={CHECK} width={20} height={20} />
              <Text style={st.checkText}>{l}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

// Values from wireframes P21 and P22.
const st = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 26, color: color.ink, marginVertical: -4.83 },
  lead: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  sitterCard: { paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  sitterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 68 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontFamily: font.displayBold, fontSize: 19, color: '#FFFFFF' },
  sitterName: { fontFamily: font.bodySemi, fontSize: 16, color: color.ink },
  sub13: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  okPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: color.okTint },
  okDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: color.ok },
  okPillText: { fontFamily: font.bodyBold, fontSize: 12, color: color.okInk },
  track: { width: 50, height: 30, borderRadius: 15, flexShrink: 0 },
  knob: { position: 'absolute', top: 3, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF' },
  optCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  optTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  // P22
  hero: { alignItems: 'center', gap: 14, marginTop: 60 },
  welcome: { fontFamily: font.display, fontSize: 30, color: color.ink, marginVertical: -6.03, textAlign: 'center' },
  checkCard: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 36 },
  checkText: { flexShrink: 1, fontFamily: font.body, fontSize: 15, color: color.ink },
  tonalBtn: { height: 48, borderRadius: 999, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  tonalText: { fontFamily: font.displayBold, fontSize: 17, color: color.primary },
});
