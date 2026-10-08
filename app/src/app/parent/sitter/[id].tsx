import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { CIcon, SitterAvatar } from '@/components/credentials';
import { AskSheet, ReqStatusCard, SharedCard, sharedRows } from '@/components/requirementRequests';
import { SpeaksBlock } from '@/components/sitterProfile';
import { Text } from '@/components/Text';
import { Button, ErrorText, Loading, Pill, Screen } from '@/components/ui';
import { formatHours, hoursOf } from '@/lib/calendar-logic';
import { monthDay, monthYear, shortName, sitterAge, sitterBundle, toDay } from '@/lib/credentials';
import { api, useQuery } from '@/lib/data';
import { dayOf } from '@/lib/format';
import { requirementRequestsApi } from '@/lib/requirement-requests-api';
import { requirementStatus } from '@/lib/requirements';
import { useCanManage } from '@/lib/use-family-role';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';

// Wireframe P11 Sitter profile, from app/src/wireframes/P11.tsx. Opened from an active sitter on the Sitters tab (P54).
// BabyBadger checks nothing (phase 1): there is no "Checked by BabyBadger" and no badge. "What Maya shared with you"
// lists only what she shared with this family, each with its status (Shared, see it / Looks good ✓ / Expired; a row
// opens P79b), then SPEAKS from her profile; with nothing shared: "Nothing shared yet. Ask Maya for what you need."
// and the Ask button (it moves there from the Requirements card so there is one).
// Requirements (migration 31, the request form): one row per family requirement with Not asked / Asked /
// Shared, see it / Looks good ✓ / Doesn't have it / Expired; shared ones open P79b (helpers too, read-only, P79c);
// "Ask Maya" opens P79 (parents only). Before migration 31 the old banner shows (it opens P7a for a parent only).
// Left out until built: "Monitoring notice · View copy", "Can pick up from", the "Maya has been reminded." line (no
// reminders are sent yet), a sitter-specific booking (Book a shift opens the usual booking screen).
// Not drawn: the banner when she meets them all with nothing expiring (green) or is missing some, "Not signed" for
// location consent, no credentials yet, the remove confirm.
export default function SitterProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { family } = useSession();
  // A family helper (migration 30) messages the sitter and looks at what she shared; booking, asking and removing
  // her are the parents'.
  const parent = useCanManage();
  const fid = family!.id;
  const [asking, setAsking] = useState(false);
  const { data, error, reload } = useQuery(async () => {
    const [sitters, shifts, bundle, req, consent, asks] = await Promise.all([
      api.familySitters(fid),
      api.familyShifts(fid),
      sitterBundle(id),
      requirementStatus(fid, id),
      supabase.from('consents').select('signed_at').eq('family_id', fid).eq('sitter_id', id).order('signed_at', { ascending: false }).limit(1),
      requirementRequestsApi.forSitterOrMissing(fid, id).catch(() => ({ rows: [], missing: true })),
    ]);
    return { link: sitters.find((s) => s.sitter_id === id), shifts: shifts.filter((s) => s.sitter_id === id), bundle, req, asks, signedAt: (consent.data?.[0]?.signed_at as string | undefined) ?? null };
  }, [fid, id]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  if (!data) return error ? <Screen back title="Sitter"><ErrorText>{error}</ErrorText></Screen> : <Loading />;

  const full = data.link?.profile?.full_name || 'Sitter';
  const name = shortName(full) || full;
  const first = full.split(/\s+/)[0];
  const done = data.shifts.filter((s) => s.status === 'completed');
  const last = [...done].sort((a, b) => b.starts_at.localeCompare(a.starts_at))[0];
  const rate = (data.link as { rate?: number | null } | undefined)?.rate;
  const stats = [`${done.length} ${done.length === 1 ? 'shift' : 'shifts'}`, `${formatHours(hoursOf(done))} hrs`, rate != null ? `$${Number(rate).toFixed(Number(rate) % 1 ? 2 : 0)} / hr` : ''].filter(Boolean).join(' · ');
  const shared = data.asks.missing ? [] : sharedRows(data.asks.rows);
  const req = data.req;
  const soon = req.expiring[0];

  async function remove() {
    setBusy(true);
    try {
      const { error: e } = await supabase.from('family_sitters').update({ status: 'removed' }).eq('family_id', fid).eq('sitter_id', id);
      if (e) throw e;
      router.back();
    } catch (e) {
      setErr(errorText(e));
      setBusy(false);
    }
  }
  function confirmRemove() {
    const q = `Remove ${first} from your family?`;
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(q)) remove();
      return;
    }
    Alert.alert(q, 'She can’t be booked and stops seeing your family.', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: remove },
    ]);
  }

  return (
    <Screen
      back
      title={name}
      gap={12}
      footer={
        <>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Message" kind={parent ? 'tonal' : undefined} onPress={() => router.push(`/parent/thread/${id}`)} style={parent ? st.half : { flex: 1 }} />
            {parent ? <Button label="Book a shift" onPress={() => router.push({ pathname: '/parent/shift/new', params: { sitter: id } })} style={st.half} /> : null}
          </View>
          {parent ? (
            <Pressable accessibilityRole="button" onPress={confirmRemove} disabled={busy} style={st.removeRow}>
              <Text style={st.remove}>Remove {first} from your family</Text>
            </Pressable>
          ) : null}
        </>
      }>
      <ErrorText>{err}</ErrorText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <SitterAvatar name={full} photoPath={data.bundle.profile?.photo_path} size={64} fontSize={28} />
        <View style={{ gap: 2, flexShrink: 1 }}>
          {sitterAge(data.bundle.profile?.birthdate) != null ? <Text style={st.meta}>{sitterAge(data.bundle.profile?.birthdate)} years old</Text> : null}
          {data.link?.joined_at ? <Text style={st.meta}>Sitting for you since {monthYear(toDay(new Date(data.link.joined_at)))}</Text> : null}
          <Text style={st.meta}>{stats}</Text>
        </View>
      </View>

      {!data.asks.missing ? (
        <ReqStatusCard rows={data.asks.rows} name={first} canAsk={parent && shared.length > 0} onAsk={() => setAsking(true)} onOpen={(rid) => router.push({ pathname: '/parent/shared/[id]', params: { id: rid } })} />
      ) : req.total ? (
        <Pressable accessibilityRole={parent ? 'button' : undefined} disabled={!parent} onPress={() => router.push('/parent/requirements')} style={[st.banner, req.allMet && !soon && { backgroundColor: color.okTint }]}>
          <CIcon name="warn" tint={req.allMet && !soon ? color.okInk : color.warnInk} />
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text style={[st.bannerTitle, req.allMet && !soon && { color: color.okInk }]}>
              {req.allMet ? `Meets all ${req.total} of your requirements` : `Meets ${req.met} of ${req.total} of your requirements`}
            </Text>
            {!req.allMet ? (
              <Text style={st.bannerText}>Missing: {req.missing.join(', ')}.</Text>
            ) : soon ? (
              <Text style={st.bannerText}>
                One expires soon: {soon.title} on {monthDay(soon.on)}.
              </Text>
            ) : null}
          </View>
          <CIcon name="chevron" size={18} tint={req.allMet && !soon ? color.okInk : color.warnInk} />
        </Pressable>
      ) : null}

      <SharedCard
        rows={data.asks.missing ? [] : data.asks.rows}
        name={first}
        canAsk={parent}
        onAsk={() => setAsking(true)}
        onOpen={(rid) => router.push({ pathname: '/parent/shared/[id]', params: { id: rid } })}>
        {data.bundle.langs.length ? <SpeaksBlock langs={data.bundle.langs} /> : null}
      </SharedCard>

      <AskSheet open={asking} onClose={() => setAsking(false)} familyId={fid} sitterId={id} name={first} rows={data.asks.rows} onSent={reload} />

      <View style={st.list}>
        <View style={[st.row, last && st.line]}>
          <Text style={st.rowKey}>Location consent</Text>
          <View>{data.signedAt ? <Pill label={`Signed ${monthDay(toDay(new Date(data.signedAt)))}`} kind="ok" /> : <Pill label="Not signed" kind="warn" />}</View>
        </View>
        {last ? (
          <View style={st.row}>
            <Text style={st.rowKey}>Last shift</Text>
            <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/parent/shift/[id]', params: { id: last.id } })} hitSlop={6} style={{ flexShrink: 1 }}>
              <Text style={st.link}>{dayOf(last.starts_at)} report</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

// Values from wireframe P11.
const st = StyleSheet.create({
  meta: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.warnTint, borderRadius: 14 },
  bannerTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.warnInk },
  bannerText: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink },
  list: { paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 48 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  rowKey: { fontFamily: font.body, fontSize: 15, color: color.ink, flexShrink: 1 },
  link: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary, textDecorationLine: 'underline' },
  half: { flexGrow: 1, flexBasis: 0, height: 50 },
  removeRow: { height: 36, alignItems: 'center', justifyContent: 'center' },
  remove: { fontFamily: font.bodySemi, fontSize: 14, color: color.badInk },
});
