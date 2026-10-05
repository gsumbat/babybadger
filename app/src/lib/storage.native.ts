// Native: expo-sqlite provides a persistent localStorage (recommended by the Expo + Supabase guide).
import 'expo-sqlite/localStorage/install';

export const authStorage = globalThis.localStorage;

export const kv = {
  get: (k: string) => globalThis.localStorage.getItem(k),
  set: (k: string, v: string) => globalThis.localStorage.setItem(k, v),
  remove: (k: string) => globalThis.localStorage.removeItem(k),
};
