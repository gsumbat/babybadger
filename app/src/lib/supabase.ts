import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { authStorage } from './storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isConfigured = Boolean(url && key);

export const supabase = createClient(url || 'http://localhost:54321', key || 'missing-key', {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Refresh tokens only while the app is in the foreground (recommended for React Native).
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

/** Turn a Supabase/Postgres error into a sentence for the screen. */
export function errorText(e: unknown): string {
  if (!e) return '';
  const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e);
  // Migration 27: a sitter can't have two shifts at the same time.
  if (msg.startsWith('already booked then')) return 'This sitter is already booked at that time. Pick another time or sitter.';
  return msg.charAt(0).toUpperCase() + msg.slice(1);
}
