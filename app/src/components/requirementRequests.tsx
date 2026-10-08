// Pieces of the requirement request screens (migration 31; wireframes P11 / P79d status card, P79 Ask sheet, P79e Ask
// again, S53 rows, S53b / S53d choices, S53c "I don't have it"). Sizes and colors are the wireframes'.
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { DotPill, ReqTile, reqSvg } from '@/components/requirements';
import { Text, TextInput } from '@/components/Text';
import { ErrorText } from '@/components/ui';
import {
  askable,
  askDefaults,
  parentState,
  parentSub,
  progressLine,
  requestErrorText,
  requirementRequestsApi,
  STATE_LABEL,
  STATE_PILL,
  type FamilyReqRow,
} from '@/lib/requirement-requests-api';
import { reqIcon } from '@/lib/requirements';
import { cardShadow, color, font } from '@/theme';

// ---------------------------------------------------------------- primitives
/** Bottom sheet (S21's): dimmed background, white top-rounded panel with a grabber. */
export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable accessibilityLabel="Close" style={st.scrim} onPress={onClose} />
        <View style={st.sheet}>
          <View style={st.grabber} />
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function SheetTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={st.sheetTitle}>{title}</Text>
      {sub ? <Text style={st.sheetSub}>{sub}</Text> : null}
    </View>
  );
}

/** 24px square checkbox (P79, S53d). */
export function CheckBox({ on }: { on: boolean }) {
  return on ? (
    <View style={[st.box, { backgroundColor: color.primary }]}>
      <SvgXml xml={reqSvg('check', '#FFFFFF', 2.6)} width={16} height={16} />
    </View>
  ) : (
    <View style={[st.box, { borderWidth: 2, borderColor: color.lineStrong, backgroundColor: '#FFFFFF' }]} />
  );
}

/** 24px radio (S53b). */
export function Radio({ on }: { on: boolean }) {
  return (
    <View style={[st.radio, { borderColor: on ? color.primary : color.lineStrong }]}>{on ? <View style={st.radioDot} /> : null}</View>
  );
}

/** "Jen asked" + the quoted note (S53, S53b, P79b). */
export function Quote({ who, text }: { who: string; text: string }) {
  return (
    <View style={st.quote}>
      <Text style={st.quoteWho}>{who}</Text>
      <Text style={st.quoteText}>“{text}”</Text>
    </View>
  );
}

/** Note field (S21's textarea). */
export function NoteInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={st.noteLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} multiline maxLength={300} placeholder={placeholder} placeholderTextColor={color.quiet} style={st.note} />
    </View>
  );
}

export function BigButton({ label, onPress, busy, disabled, tonal }: { label: string; onPress: () => void; busy?: boolean; disabled?: boolean; tonal?: boolean }) {
  const off = busy || disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!busy }}
      onPress={off ? undefined : onPress}
      style={({ pressed }) => [st.big, tonal && { backgroundColor: color.primaryTint }, disabled && { opacity: 0.5 }, pressed && { opacity: 0.85 }]}>
      {busy ? <ActivityIndicator color={tonal ? color.primary : '#FFFFFF'} /> : <Text style={[st.bigText, tonal && { color: color.primary }]}>{label}</Text>}
    </Pressable>
  );
}

export function LinkButton({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={st.link}>
      <Text style={[st.linkText, danger && { color: color.badInk }]}>{label}</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------- P11 / P79d status card
function StatusRow({ row, onPress, last }: { row: FamilyReqRow; onPress?: () => void; last: boolean }) {
  const s = parentState(row);
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} disabled={!onPress} onPress={onPress} style={({ pressed }) => [st.row, !last && st.line, pressed && { opacity: 0.8 }]}>
      <ReqTile icon={reqIcon(row)} size={36} />
      <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        <Text style={st.rowTitle}>{row.title}</Text>
        <Text style={st.rowSub}>{parentSub(row)}</Text>
      </View>
      <View>
        <DotPill label={STATE_LABEL[s]} kind={STATE_PILL[s]} />
      </View>
    </Pressable>
  );
}

/** The family's requirements for one sitter with a status each. Shared / looked-at rows open P79b; parents get
 * "Ask Maya" (P79) while something is left to ask. `head` = P79d's sitter header instead of "Requirements". */
export function ReqStatusCard({
  rows,
  name,
  canAsk,
  onAsk,
  onOpen,
  head,
}: {
  rows: FamilyReqRow[];
  name: string;
  canAsk: boolean;
  onAsk: () => void;
  onOpen: (requestId: string) => void;
  head?: ReactNode;
}) {
  if (!rows.length) return null;
  const left = askable(rows).length > 0;
  return (
    <View style={st.card}>
      {head ?? (
        <View style={st.cardHead}>
          <Text style={st.cardTitle}>Requirements</Text>
          <Text style={st.cardMeta}>{progressLine(rows)}</Text>
        </View>
      )}
      {rows.map((r, i) => {
        const s = parentState(r);
        const open = r.request && ['shared', 'met', 'expired'].includes(s) ? () => onOpen(r.request!.id) : undefined;
        return <StatusRow key={r.requirement_id} row={r} onPress={open} last={i === rows.length - 1} />;
      })}
      {canAsk && left ? (
        <Pressable accessibilityRole="button" onPress={onAsk} style={({ pressed }) => [st.ask, pressed && { opacity: 0.85 }]}>
          <Text style={st.askText}>Ask {name}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** P11 "What Maya shared with you": only what she shared with this family (a card, a report or a confirmation), each
 * with its status (Shared, see it / Looks good ✓ / Expired); a row opens P79b. Languages stay in SPEAKS (`children`).
 * Empty: "Nothing shared yet. Ask Maya for what you need." with the P79 Ask button for a parent. */
export function sharedRows(rows: FamilyReqRow[]) {
  return rows.filter((r) => !r.language && r.request && ['shared', 'met', 'expired'].includes(parentState(r)));
}

export function SharedCard({
  rows,
  name,
  canAsk,
  onAsk,
  onOpen,
  children,
}: {
  rows: FamilyReqRow[];
  name: string;
  canAsk: boolean;
  onAsk: () => void;
  onOpen: (requestId: string) => void;
  children?: ReactNode;
}) {
  const shared = sharedRows(rows);
  return (
    <View style={[st.card, { gap: 4 }]}>
      <Text style={st.cardTitle}>What {name} shared with you</Text>
      {shared.length ? (
        shared.map((r, i) => <StatusRow key={r.requirement_id} row={r} onPress={() => onOpen(r.request!.id)} last={i === shared.length - 1} />)
      ) : (
        <>
          <Text style={st.empty}>Nothing shared yet. Ask {name} for what you need.</Text>
          {canAsk && askable(rows).length ? (
            <Pressable accessibilityRole="button" onPress={onAsk} style={({ pressed }) => [st.ask, pressed && { opacity: 0.85 }]}>
              <Text style={st.askText}>Ask {name}</Text>
            </Pressable>
          ) : null}
        </>
      )}
      {children ? <View style={{ marginTop: 10 }}>{children}</View> : null}
    </View>
  );
}

// ---------------------------------------------------------------- P79 Ask sheet
export function AskSheet({ open, onClose, familyId, sitterId, name, rows, onSent }: { open: boolean; onClose: () => void; familyId: string; sitterId: string; name: string; rows: FamilyReqRow[]; onSent: () => void }) {
  const options = askable(rows);
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!open) return;
    // fresh choices each time the sheet opens: the unmet must-haves pre-checked
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPicked(askDefaults(rows));
    setNote('');
    setErr('');
  }, [open, rows]);

  async function send() {
    if (!picked.length) return setErr('Pick what to ask for.');
    setBusy(true);
    setErr('');
    try {
      await requirementRequestsApi.ask(familyId, sitterId, picked, note);
      onSent();
      onClose();
    } catch (e) {
      setErr(requestErrorText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetTitle title={`Ask ${name} for`} sub="She gets a notification and shares what she has. You see it here and decide if it looks good." />
      <View style={st.checkList}>
        {options.map((r, i) => {
          const on = picked.includes(r.req_key);
          const s = parentState(r);
          const sub = s === 'not_asked' ? (r.level === 'must' ? 'Not asked yet' : 'Nice to have · not asked') : s === 'asked' ? `${parentSub(r)} · ask again` : parentSub(r);
          return (
            <Pressable
              key={r.req_key}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={() => setPicked((p) => (on ? p.filter((k) => k !== r.req_key) : [...p, r.req_key]))}
              style={[st.checkRow, i < options.length - 1 && st.line]}>
              <CheckBox on={on} />
              <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
                <Text style={st.rowTitle}>{r.title}</Text>
                <Text style={st.rowSub}>{sub}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <NoteInput label="Note (optional)" value={note} onChange={setNote} />
      <ErrorText>{err}</ErrorText>
      <View style={{ flexDirection: 'row' }}>
        <BigButton label={`Send to ${name}`} onPress={send} busy={busy} disabled={!picked.length} />
      </View>
      <LinkButton label="Cancel" onPress={onClose} />
    </Sheet>
  );
}

/** P79e Ask again / S53c I don't have it: a title, a note and one button. */
export function NoteSheet({
  open,
  onClose,
  title,
  sub,
  label,
  placeholder,
  button,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  sub: string;
  label: string;
  placeholder?: string;
  button: string;
  onSend: (note: string) => Promise<void>;
}) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function send() {
    setBusy(true);
    setErr('');
    try {
      await onSend(note);
      setNote('');
      onClose();
    } catch (e) {
      setErr(requestErrorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Sheet open={open} onClose={onClose}>
      <SheetTitle title={title} sub={sub} />
      <NoteInput label={label} value={note} onChange={setNote} placeholder={placeholder} />
      <ErrorText>{err}</ErrorText>
      <View style={{ flexDirection: 'row' }}>
        <BigButton label={button} onPress={send} busy={busy} />
      </View>
      <LinkButton label="Cancel" onPress={onClose} />
    </Sheet>
  );
}

// Values from wireframes P11, P79, S21 (sheet), S53.
export const reqReqStyles = StyleSheet.create({
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  lead: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  listCard: { paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  info: { flexDirection: 'row', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 14 },
  infoText: { flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  infoBold: { fontFamily: font.bodyBold, color: color.primaryStrong },
  small: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
});

const st = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(27,35,40,0.45)' },
  sheet: { gap: 14, paddingTop: 12, paddingHorizontal: 20, paddingBottom: 32, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: '#C3CCD5' },
  sheetTitle: { fontFamily: font.display, fontSize: 24, color: color.ink },
  sheetSub: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink2 },
  box: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', flexShrink: 0 },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: color.primary },
  quote: { gap: 2, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line, borderRadius: 14 },
  quoteWho: { fontFamily: font.bodyBold, fontSize: 12, color: color.ink2 },
  quoteText: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  noteLabel: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  note: { minHeight: 68, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: color.lineStrong, backgroundColor: '#FFFFFF', fontFamily: font.body, fontSize: 15, color: color.ink, textAlignVertical: 'top' },
  big: { flexGrow: 1, flexBasis: 0, height: 54, borderRadius: 999, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  bigText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  link: { height: 40, alignItems: 'center', justifyContent: 'center' },
  linkText: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary },
  card: { paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  cardHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, paddingBottom: 4 },
  cardTitle: { fontFamily: font.displayBold, fontSize: 18, color: color.ink },
  cardMeta: { fontFamily: font.body, fontSize: 12, color: color.ink2, flexShrink: 1, textAlign: 'right' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 58 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  rowSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  empty: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink2, paddingTop: 6 },
  ask: { height: 44, marginTop: 10, borderRadius: 999, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  askText: { fontFamily: font.displayBold, fontSize: 16, color: color.primary },
  checkList: { paddingHorizontal: 14, backgroundColor: color.canvas, borderRadius: 14 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 54 },
});
