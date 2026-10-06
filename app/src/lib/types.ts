export type Role = 'parent' | 'sitter';

export type Profile = { id: string; full_name: string; role: Role | null; alert_logs?: boolean };

export type Family = { id: string; name: string };

export type Kid = {
  id: string;
  family_id: string;
  name: string;
  birthdate: string | null;
  avoid_foods: string;
  notes: string;
  color?: string;
  calls_you?: string;
  allergies?: string;
  health_notes?: string;
  pediatrician?: string;
  comfort_item?: string;
};

export type SitterLink = {
  family_id: string;
  sitter_id: string;
  status: 'needs_consent' | 'active' | 'removed';
  joined_at: string;
};

export type Invite = {
  id: string;
  family_id: string;
  code: string;
  sitter_name: string;
  expires_at: string;
  accepted_at: string | null;
  cancelled_at: string | null;
};

export type ShiftStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export type Shift = {
  id: string;
  family_id: string;
  sitter_id: string;
  starts_at: string;
  ends_at: string;
  status: ShiftStatus;
  clock_in_at: string | null;
  clock_out_at: string | null;
  note: string;
};

export type Task = {
  id: string;
  shift_id: string;
  title: string;
  due_at: string | null;
  done_at: string | null;
  position: number;
};

export type LocationPoint = {
  id: number;
  shift_id: string;
  lat: number;
  lng: number;
  accuracy_m: number | null;
  recorded_at: string;
};

export type LogKind = 'food' | 'nap' | 'activity' | 'diaper' | 'note' | 'photo';

export type LogEntry = {
  id: string;
  shift_id: string;
  author_id: string;
  kind: LogKind;
  kid_ids: string[];
  data: Record<string, string>;
  photo_path: string | null;
  urgent: boolean;
  happened_at: string;
};

// Versions of the documents the sitter signs. Bump when the text changes so sitters re-sign.
export const NOTICE_VERSION = 'monitoring-notice-1.0';
export const TERMS_VERSION = 'terms-1.0';
