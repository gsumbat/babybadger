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
  gender?: 'girl' | 'boy' | null;
};

export type CareType = 'nap' | 'bottle' | 'meal' | 'diaper' | 'bedtime' | 'medicine' | 'activity' | 'other';

/** Care plan entry (P7, P20, P20a). kid_id null = whole-family task. Times are "HH:MM:SS"; days is a
 * weekday bitmask, Sun=1 ... Sat=64. */
export type CareItem = {
  id: string;
  family_id: string;
  kid_id: string | null;
  type: CareType;
  title: string;
  starts: string | null;
  ends: string | null;
  days: number;
  /** Repeats every N minutes inside the shift (30–720, P20 "Every 3 hrs"); null = once. Migration 08. */
  every_minutes: number | null;
  /** Per-type extras (P20a, migration 08): bottle amount + unit + milk, diaper potty, medicine dose. {} when none. */
  details: CareDetails;
  how: string;
  created_at: string;
};

export type Milk = 'formula' | 'breast milk' | 'whole milk';

/** A bottle's amount unit (P20a "Unit" dropdown). */
export type BottleUnit = 'oz' | 'ml';

/** Only the keys of the item's own type are kept: bottle {amount, unit, milk}, diaper {potty}, medicine {dose}.
 * `amount_oz` is the old bottle shape (before the Unit dropdown): read as {amount, unit: 'oz'}, never written. */
export type CareDetails = { amount?: number; unit?: BottleUnit; amount_oz?: number; milk?: Milk; potty?: boolean; dose?: string };

export type CareItemInput = Pick<CareItem, 'kid_id' | 'type' | 'title' | 'starts' | 'ends' | 'days' | 'every_minutes' | 'details' | 'how'>;

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

/** 'incident' = S24 (migration 15): always urgent, data {type, where, text}. */
export type LogKind = 'food' | 'nap' | 'activity' | 'diaper' | 'note' | 'photo' | 'incident';

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
