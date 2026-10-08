import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { Sheet } from '@/components/timing';
import { TimeField } from '@/components/TimeField';
import { ErrorText, Icon } from '@/components/ui';
import { api } from '@/lib/data';
import { taskDueOnShift } from '@/lib/shift-logic';
import { clock, clockAmPm } from '@/lib/shift-timing-logic';
import { errorText } from '@/lib/supabase';
import type { Shift, Task } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';
import { Text, TextInput } from '@/components/Text';

// Wireframe P5e "Shift · edit tasks" (app/src/wireframes/P5e.tsx): the Today's plan card on a booked or live shift
// (parent/shift/[id]) for full-access parents. Each row ("3:15  Pick up Ava  ✎") opens the task sheet; "+ Add task"
// opens it empty. The sheet: Task, Time (the time wheel, optional), Save, and Remove task when editing. Migration 34
// saves it and pushes the sitter ("Jen added a task: Pick up milk"). Done tasks (live shift) show their check and
// can't be edited. Not drawn: the sheet's error line ("Pick a time during the shift.").
export function EditableTasksCard({ shift, tasks, onChanged }: { shift: Shift; tasks: Task[]; onChanged: () => void }) {
  const [editing, setEditing] = useState<Task | 'new' | null>(null);
  const done = tasks.filter((t) => t.done_at).length;
  const live = shift.status === 'active';
  return (
    <View style={st.card}>
      <View style={st.head}>
        <Text style={st.title}>Today’s plan</Text>
        {tasks.length ? <Text style={st.count}>{live ? `${done} of ${tasks.length} done` : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`}</Text> : null}
      </View>
      {tasks.length === 0 ? <Text style={st.empty}>No tasks for this shift yet.</Text> : null}
      <View>
        {tasks.map((t) => {
          const isDone = !!t.done_at;
          return (
            <Pressable
              key={t.id}
              accessibilityRole="button"
              accessibilityLabel={isDone ? `${t.title}, done` : `Edit ${t.title}`}
              disabled={isDone}
              onPress={() => setEditing(t)}
              style={({ pressed }) => [st.row, st.line, pressed && { opacity: 0.8 }]}>
              {live ? <Icon name={isDone ? 'check-circle' : 'circle'} size={22} tint={isDone ? color.ok : color.lineStrong} /> : null}
              <Text style={st.time}>{t.due_at ? clock(t.due_at) : ''}</Text>
              <Text style={[st.taskTitle, isDone && st.taskDone]}>{t.title}</Text>
              {isDone ? null : <Icon name="edit-2" size={18} tint={color.ink2} />}
            </Pressable>
          );
        })}
        <Pressable accessibilityRole="button" onPress={() => setEditing('new')} style={({ pressed }) => [st.row, pressed && { opacity: 0.8 }]}>
          <Icon name="plus" size={20} tint={color.primary} strokeWidth={2} />
          <Text style={st.add}>Add task</Text>
        </Pressable>
      </View>
      <TaskSheet shift={shift} task={editing} onClose={() => setEditing(null)} onSaved={onChanged} />
    </View>
  );
}

function TaskSheet({ shift, task, onClose, onSaved }: { shift: Shift; task: Task | 'new' | null; onClose: () => void; onSaved: () => void }) {
  const open = task !== null;
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [wasFor, setWasFor] = useState<Task | 'new' | null>(null);
  // Start from the task's saved values each time the sheet opens.
  if (task !== wasFor) {
    setWasFor(task);
    if (task) {
      setTitle(task === 'new' ? '' : task.title);
      setTime(task === 'new' || !task.due_at ? '' : clockAmPm(task.due_at));
      setErr('');
    }
  }
  const existing = task && task !== 'new' ? task : null;

  async function save() {
    const due = taskDueOnShift(time, shift);
    if (!due.ok) return setErr(due.error);
    if (!title.trim()) return setErr('Add what needs doing.');
    setBusy(true);
    setErr('');
    try {
      if (existing) await api.editShiftTask(existing.id, title, due.due);
      else await api.addShiftTask(shift.id, title, due.due);
      onSaved();
      onClose();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    if (!existing) return;
    Alert.alert('Remove this task?', existing.title, [
      { text: 'Keep it' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteShiftTask(existing.id);
            onSaved();
            onClose();
          } catch (e) {
            setErr(errorText(e));
          }
        },
      },
    ]);
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <View style={{ gap: 2 }}>
        <Text style={st.sheetTitle}>{existing ? 'Edit task' : 'Add a task'}</Text>
        <Text style={st.sheetSub}>Your sitter gets an alert when you save.</Text>
      </View>
      <View style={{ gap: 6 }}>
        <Text style={st.fieldLabel}>Task</Text>
        <TextInput value={title} onChangeText={setTitle} maxLength={120} placeholder="Pick up milk" placeholderTextColor={color.quiet} style={st.input} />
      </View>
      <View style={{ flexDirection: 'row' }}>
        <TimeField label="Time (optional)" value={time} onChange={setTime} placeholder="Any time" />
      </View>
      <ErrorText>{err}</ErrorText>
      <Pressable accessibilityRole="button" accessibilityState={{ busy }} onPress={busy ? undefined : save} style={({ pressed }) => [st.save, pressed && { opacity: 0.85 }]}>
        {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={st.saveText}>Save</Text>}
      </Pressable>
      {existing ? (
        <Pressable accessibilityRole="button" onPress={busy ? undefined : remove} style={st.remove}>
          <Text style={st.removeText}>Remove task</Text>
        </Pressable>
      ) : null}
    </Sheet>
  );
}

// Values from wireframe P5e (card as P5b's cards, sheet as P12p).
const st = StyleSheet.create({
  card: { gap: 4, paddingTop: 14, paddingBottom: 4, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  count: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  empty: { fontFamily: font.body, fontSize: 14, color: color.ink2, paddingTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  time: { width: 40, fontFamily: font.bodySemi, fontSize: 14, color: color.ink2 },
  taskTitle: { flex: 1, fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  taskDone: { color: color.ink2, textDecorationLine: 'line-through' },
  add: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary },
  sheetTitle: { fontFamily: font.display, fontSize: 24, color: color.ink },
  sheetSub: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink2 },
  fieldLabel: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  input: { height: 52, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: color.lineStrong, fontFamily: font.body, fontSize: 16, color: color.ink },
  save: { height: 54, borderRadius: 999, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  remove: { height: 40, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontFamily: font.bodySemi, fontSize: 15, color: color.badInk },
});
