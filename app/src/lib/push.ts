// Push notifications: registers this phone with the database and opens the right screen when an alert is tapped.
// Alerts are sent by the database (supabase/migrations/20261006000005_push.sql), not by the app.
// Works in development and App Store builds; skipped in Expo Go, on web and in the simulator.
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Platform } from 'react-native';

import { supabase } from './supabase';

const supported = Platform.OS !== 'web' && Device.isDevice && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

let currentToken: string | null = null;

if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}

/** Asks for permission (the system prompt, once) and saves this phone's push address for the signed-in user. */
export async function registerForPush(): Promise<void> {
  if (!supported) return;
  try {
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
    if (status !== 'granted') return;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', { name: 'Alerts', importance: Notifications.AndroidImportance.HIGH });
    }
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const { data } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    currentToken = data;
    await supabase.rpc('register_push_token', { p_token: data, p_platform: Platform.OS });
  } catch (e) {
    console.warn('Push registration failed', e);
  }
}

/** Stops alerts to this phone (call before signing out). */
export async function unregisterPush(): Promise<void> {
  if (!currentToken) return;
  await supabase.rpc('remove_push_token', { p_token: currentToken });
  currentToken = null;
}

/** Opens the screen an alert points to (data.url), including the alert that launched the app. */
export function listenForAlertTaps(): () => void {
  if (!supported) return () => {};
  const open = (r: Notifications.NotificationResponse | null) => {
    const url = r?.notification.request.content.data?.url;
    if (typeof url === 'string' && url.startsWith('/')) router.push(url as never);
  };
  const last = Notifications.getLastNotificationResponse();
  if (last) {
    open(last);
    Notifications.clearLastNotificationResponse();
  }
  const sub = Notifications.addNotificationResponseReceivedListener(open);
  return () => sub.remove();
}
