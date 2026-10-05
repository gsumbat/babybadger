// Shares the sitter's location ONLY between clock-in and clock-out.
// Native dev/production builds: a background task keeps sending while the phone is locked.
// Expo Go and web: falls back to foreground updates while the shift screen is open.
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { kv } from './storage';
import { supabase } from './supabase';

export const LOCATION_TASK = 'babybadger-shift-location';
const ACTIVE_SHIFT_KEY = 'babybadger.activeShiftId';

type TaskData = { locations?: Location.LocationObject[] };

async function send(shiftId: string, points: Location.LocationObject[]) {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid || points.length === 0) return;
  const rows = points.map((p) => ({
    shift_id: shiftId,
    sitter_id: uid,
    lat: p.coords.latitude,
    lng: p.coords.longitude,
    accuracy_m: p.coords.accuracy ?? null,
    recorded_at: new Date(p.timestamp).toISOString(),
  }));
  const { error } = await supabase.from('locations').insert(rows);
  // The database refuses writes once the shift is no longer active: stop sending.
  if (error && /row-level security/i.test(error.message)) await stopSharing();
}

// Must be defined at module scope so the OS can wake the app and run it.
if (Platform.OS !== 'web' && !TaskManager.isTaskDefined(LOCATION_TASK)) {
  TaskManager.defineTask<TaskData>(LOCATION_TASK, async ({ data, error }) => {
    if (error) return;
    const shiftId = kv.get(ACTIVE_SHIFT_KEY);
    if (shiftId && data?.locations) await send(shiftId, data.locations);
  });
}

let foreground: Location.LocationSubscription | null = null;

export type SharingMode = 'background' | 'foreground' | 'denied';

export async function startSharing(shiftId: string): Promise<SharingMode> {
  kv.set(ACTIVE_SHIFT_KEY, shiftId);
  const fg = await Location.requestForegroundPermissionsAsync();
  if (!fg.granted) return 'denied';

  // First point right away so the parent sees the map at clock-in.
  try {
    const now = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    await send(shiftId, [now]);
  } catch {
    // no fix yet; updates below will catch up
  }

  if (Platform.OS !== 'web' && (await Location.isBackgroundLocationAvailableAsync())) {
    const bg = await Location.requestBackgroundPermissionsAsync().catch(() => null);
    if (bg?.granted) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60_000,
        distanceInterval: 50,
        pausesUpdatesAutomatically: true,
        activityType: Location.ActivityType.Other,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Sharing location with the family',
          notificationBody: 'Only until you clock out.',
          notificationColor: '#47698A',
        },
      });
      return 'background';
    }
  }

  foreground?.remove();
  foreground = await Location.watchPositionAsync(
    { accuracy: Location.Accuracy.Balanced, timeInterval: 60_000, distanceInterval: 50 },
    (loc) => void send(shiftId, [loc]),
  );
  return 'foreground';
}

export async function stopSharing() {
  kv.remove(ACTIVE_SHIFT_KEY);
  foreground?.remove();
  foreground = null;
  if (Platform.OS !== 'web') {
    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).catch(() => false);
    if (started) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  }
}
