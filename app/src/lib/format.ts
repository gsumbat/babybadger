export function timeOf(iso: string | Date) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function dayOf(iso: string | Date) {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export function rangeOf(start: string, end: string) {
  return `${dayOf(start)} · ${timeOf(start)} – ${timeOf(end)}`;
}

export function firstName(full?: string | null) {
  return (full || '').trim().split(/\s+/)[0] || 'Sitter';
}

